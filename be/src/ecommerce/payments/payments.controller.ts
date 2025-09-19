import { Controller, Post, Body, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, VNPayPaymentDto, PayPalPaymentDto } from './dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RoleGuard } from '../../auth/role.guard';
import { Roles } from '../../decorators/role.decorator';
import { Public } from '../../decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // VNPay for Vietnam payments
  @Post('vnpay/create')
  @UseGuards(JwtAuthGuard)
  createVNPayPayment(@Body() vnpayPaymentDto: VNPayPaymentDto, @Request() req) {
    return this.paymentsService.createVNPayPayment(vnpayPaymentDto, req.user.id);
  }

  @Get('vnpay/return')  
  @Public()
  handleVNPayReturn(@Query() query: any) {
    console.log('VNPay return query:', query);
    return this.paymentsService.handleVNPayReturn(query);
  }


  // PayPal for international payments
  @Post('paypal/create')
  @UseGuards(JwtAuthGuard)
  async createPayPalPayment(@Body() paypalPaymentDto: PayPalPaymentDto, @Request() req) {
    try {
      const result = await this.paymentsService.createPayPalPayment(paypalPaymentDto, req.user.id);
      return result;
    } catch (error) {
      return {
        status: 'failed',
        message: error.message || 'Internal server error',
        error: error.message
      };
    }
  }

  @Post('paypal/execute')
  @UseGuards(JwtAuthGuard)
  async executePayPalPayment(@Body() body: { payment_id: string; payer_id: string; order_id: string }) {
    try {
      const result = await this.paymentsService.executePayPalPayment(body.payment_id, body.payer_id, body.order_id);
      return result;
    } catch (error) {
      return {
        status: 'failed',
        message: error.message || 'Internal server error',
        error: error.message
      };
    }
  }

  @Post('paypal/webhook')
  @Public()
  paypalWebhook(@Body() body: any) {
    return this.paymentsService.handlePayPalWebhook(body);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  getPaymentsByOrder(@Param('orderId') orderId: string, @Request() req) {
    return this.paymentsService.getPaymentsByOrder(orderId, req.user.id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  getAllPayments() {
    return this.paymentsService.getAllPayments();
  }
}
