import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaypalService } from './paypal.service';
import { VNPayService } from './vnpay.service';
import { VNPayPaymentDto, PayPalPaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private paypalService: PaypalService,
    private vnpayService: VNPayService,
  ) {}

  // Helper method to clear user's cart after successful payment
  private async clearUserCart(userId: string) {
    try {
      await this.prisma.cartItems.deleteMany({
        where: { user_id: userId }
      });
    } catch (error) {
      console.error(`Error clearing cart for user ${userId}:`, error);
    }
  }

  // VNPay for Vietnam payments
  async createVNPayPayment(vnpayPaymentDto: VNPayPaymentDto, userId: string) {
    const { order_id, amount, description, bank_code, locale } = vnpayPaymentDto;

    // Verify order exists and belongs to user
    const order = await this.prisma.orders.findFirst({
      where: { 
        id: order_id,
        user_id: userId 
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    

    // Create payment record
    const payment = await this.prisma.payments.create({
      data: {
        order_id,
        amount,
        payment_method: 'VNPAY',
        payment_status: 'PENDING',
        transaction_id: "VNPAY" + order.order_number, 
      },
    });

    // Create VNPay payment URL
    const paymentUrl = await this.vnpayService.createPaymentUrl({
      amount,
      order_id: order.order_number,
      description: description || `Thanh toán đơn hàng ${order.order_number}`,
      bank_code,
      locale,
    });
    return paymentUrl
  }

  async handleVNPayReturn(query: any) {
    const verification = this.vnpayService.verifyReturnUrl(query);

    const orderNumber = query.vnp_TxnRef?.split('_')[0];
    
    if (verification.responseCode === '00') {
      // Payment successful
      await this.updatePaymentStatus(orderNumber, 'COMPLETED', 'VNPAY');
      await this.updateOrderStatus(orderNumber, 'PROCESSING');
      
      // Get order to find user and clear their cart
      const order = await this.prisma.orders.findFirst({
        where: { order_number: orderNumber }
      });
      
      if (order) {
        await this.clearUserCart(order.user_id);
      }
      
      return {
        status: 'success',
        message: verification.message,
        order_number: orderNumber,
        transaction_id: "VNPAY_" + orderNumber,
        
      };
    } else {
      // Payment failed
      await this.updatePaymentStatus(orderNumber, 'FAILED', 'VNPAY');
      
      return {
        status: 'failed',
        message: verification.message,
        order_number: orderNumber,
        transaction_id: "VNPAY_" + orderNumber,
      };
    }
  }


  // PayPal for international payments
  async createPayPalPayment(paypalPaymentDto: PayPalPaymentDto, userId: string) {
    try {
      
      const { order_id, amount, currency = 'USD', description } = paypalPaymentDto;

      // Verify order exists and belongs to user
      const order = await this.prisma.orders.findFirst({
        where: { 
          id: order_id,
          user_id: userId 
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }


      const paypalPayment = await this.paypalService.createPayment(
        amount,
        currency,
        description || `Payment for order ${order.order_number}`,
        order_id // Pass orderId to include in return URL
      );



      // Create payment record
      const payment = await this.prisma.payments.create({
        data: {
          order_id,
          amount,
          payment_method: 'PAYPAL',
          payment_status: 'PENDING',
          transaction_id: (paypalPayment as any).id,
          payment_gateway_response: JSON.stringify(paypalPayment)
        },
      });


      return {
        payment_id: (paypalPayment as any).id,
        approval_url: (paypalPayment as any).links?.find((link: any) => link.rel === 'approval_url')?.href,
        payment_record_id: payment.id,
      };
      
    } catch (error) {
      console.error('❌ PayPal payment creation error:', error);
      throw error;
    }
  }

  async executePayPalPayment(paymentId: string, payerId: string, orderId: string) {
    try {
      
      const result = await this.paypalService.executePayment(paymentId, payerId);

      // Check multiple possible success states
      const isSuccess = (result as any).state === 'approved' || 
                       (result as any).state === 'completed' ||
                       (result as any).intent === 'sale';

      if (isSuccess) {
        
        // Update payment status
        await this.prisma.payments.updateMany({
          where: {
            order_id: orderId,
            transaction_id: paymentId,
          },
          data: {
            payment_status: 'COMPLETED',
            payment_gateway_response: JSON.stringify(result)
          },
        });

        // Update order status
        const order = await this.prisma.orders.findUnique({
          where: { id: orderId }
        });

        if (order) {
          await this.prisma.orders.update({
            where: { id: orderId },
            data: { status: 'PROCESSING' },
          });
          
          // Clear user's cart after successful payment
          await this.clearUserCart(order.user_id);
        }

        return { 
          status: 'success', 
          message: 'PayPal payment executed successfully',
          paypal_state: (result as any).state,
          order_number: order?.order_number
        };
      }

      return { 
        status: 'failed', 
        message: `PayPal payment execution failed. State: ${(result as any).state}`,
        paypal_state: (result as any).state
      };
      
    } catch (error) {
      console.error('❌ PayPal execution error:', error);
      
      // Update payment status to failed
      await this.prisma.payments.updateMany({
        where: {
          order_id: orderId,
          transaction_id: paymentId,
        },
        data: {
          payment_status: 'FAILED',
          payment_gateway_response: JSON.stringify({ error: error.message })
        },
      });

      return { 
        status: 'failed', 
        message: `PayPal payment execution error: ${error.message}`,
        error: error.message
      };
    }
  }

  async getPaymentsByOrder(orderId: string, userId: string) {
    // Verify user owns the order
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payments = await this.prisma.payments.findMany({
      where: { order_id: orderId },
      orderBy: { createAt: 'desc' },
    });

    return payments;
  }

  async getAllPayments() {
    const payments = await this.prisma.payments.findMany({
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createAt: 'desc' },
    });

    return payments;
  }

  // Webhook handlers
  async handlePayPalWebhook(body: any) {
    // Handle PayPal webhook events
    return { status: 'received' };
  }

  // Helper methods
  private async updatePaymentStatus(orderNumber: string, status: string, paymentMethod: string) {
    const order = await this.prisma.orders.findFirst({
      where: { order_number: orderNumber }
    });

    if (order) {
      // Convert to enum values
      const validPaymentMethods = ['PAYPAL', 'VNPAY'];
      const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', "PROCESSING"];
      
      const paymentMethodEnum = validPaymentMethods.includes(paymentMethod.toUpperCase()) 
        ? paymentMethod.toUpperCase() as any 
        : 'PAYPAL';
      
      const statusEnum = validStatuses.includes(status.toUpperCase()) 
        ? status.toUpperCase() as any 
        : 'PENDING';

      console.log(`Updating payment status for order ${orderNumber} to ${statusEnum} (${paymentMethodEnum})`);

      await this.prisma.payments.updateMany({
        where: {
          order_id: order.id,
          payment_method: paymentMethodEnum
        },
        data: { payment_status: statusEnum }
      });
    }
  }

  private async updateOrderStatus(orderNumber: string, status: string) {
    // Convert to enum values
    const validOrderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    const statusEnum = validOrderStatuses.includes(status.toUpperCase()) 
      ? status.toUpperCase() as any 
      : 'PENDING';

    await this.prisma.orders.updateMany({
      where: { order_number: orderNumber },
      data: { status: statusEnum }
    });
  }
}
