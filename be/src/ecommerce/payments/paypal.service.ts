import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as paypal from 'paypal-rest-sdk';

@Injectable()
export class PaypalService {
  constructor(private configService: ConfigService) {
    paypal.configure({
      mode: this.configService.get('PAYPAL_MODE') || 'sandbox',
      client_id: this.configService.get('PAYPAL_CLIENT_ID'),
      client_secret: this.configService.get('PAYPAL_CLIENT_SECRET'),
    });
  }

  async createPayment(amount: number, currency: string = 'USD', description: string, orderId?: string) {
    const baseReturnUrl = this.configService.get('PAYPAL_RETURN_URL') || 'http://localhost:3000/payment/success?method=paypal';
    const baseCancelUrl = this.configService.get('PAYPAL_CANCEL_URL') || 'http://localhost:3000/payment/cancel?method=paypal';
    
    // Add orderId to return URLs if provided
    const returnUrl = orderId ? `${baseReturnUrl}&orderId=${orderId}` : baseReturnUrl;
    const cancelUrl = orderId ? `${baseCancelUrl}&orderId=${orderId}` : baseCancelUrl;

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      transactions: [
        {
          item_list: {
            items: [],
          },
          amount: {
            currency,
            total: amount.toFixed(2),
          },
          description,
        },
      ],
    };

    return new Promise((resolve, reject) => {
      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  }

  async executePayment(paymentId: string, payerId: string) {
    
    const execute_payment_json = {
      payer_id: payerId,
    };

    return new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) {
          console.error('❌ PayPal execute error:', error);
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  }

  async getPayment(paymentId: string) {
    return new Promise((resolve, reject) => {
      paypal.payment.get(paymentId, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  }

  async createRefund(saleId: string, amount?: number, currency: string = 'USD') {
    const refund_json: any = {};
    
    if (amount) {
      refund_json.amount = {
        total: amount.toFixed(2),
        currency,
      };
    }

    return new Promise((resolve, reject) => {
      paypal.sale.refund(saleId, refund_json, (error, refund) => {
        if (error) {
          reject(error);
        } else {
          resolve(refund);
        }
      });
    });
  }
}
