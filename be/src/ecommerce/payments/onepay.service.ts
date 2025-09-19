import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class OnepayService {
  private readonly accessCode: string;
  private readonly merchantId: string;
  private readonly hashCode: string;
  private readonly paymentUrl: string;

  constructor(private configService: ConfigService) {
    this.accessCode = this.configService.get('ONEPAY_ACCESS_CODE');
    this.merchantId = this.configService.get('ONEPAY_MERCHANT_ID');
    this.hashCode = this.configService.get('ONEPAY_HASH_CODE');
    this.paymentUrl = this.configService.get('ONEPAY_PAYMENT_URL') || 'https://mtf.onepay.vn/onecomm-pay/vpc.op';
  }

  createPaymentUrl(params: {
    amount: number;
    orderInfo: string;
    txnRef: string;
    returnUrl: string;
    locale?: string;
  }) {
    const { amount, orderInfo, txnRef, returnUrl, locale = 'vn' } = params;
    
    const vnp_Params: any = {
      vpc_Version: '2',
      vpc_Command: 'pay',
      vpc_AccessCode: this.accessCode,
      vpc_MerchantId: this.merchantId,
      vpc_Locale: locale,
      vpc_ReturnURL: returnUrl,
      vpc_OrderInfo: orderInfo,
      vpc_Amount: (amount * 100).toString(), // Convert to xu (smallest unit)
      vpc_TicketNo: this.getClientIP(),
      vpc_MerchTxnRef: txnRef,
      vpc_Currency: 'VND',
    };

    // Sort parameters
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((result, key) => {
        result[key] = vnp_Params[key];
        return result;
      }, {});

    // Create hash
    const hashData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');

    const hash = crypto
      .createHmac('sha256', this.hashCode)
      .update(hashData)
      .digest('hex')
      .toUpperCase();

    sortedParams['vpc_SecureHash'] = hash;

    // Build URL
    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&');

    return `${this.paymentUrl}?${queryString}`;
  }

  verifyPaymentResponse(params: any): { isValid: boolean; responseCode: string } {
    const { vpc_SecureHash, ...otherParams } = params;
    
    // Sort parameters
    const sortedParams = Object.keys(otherParams)
      .filter(key => key.startsWith('vpc_'))
      .sort()
      .reduce((result, key) => {
        result[key] = otherParams[key];
        return result;
      }, {});

    // Create hash
    const hashData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');

    const hash = crypto
      .createHmac('sha256', this.hashCode)
      .update(hashData)
      .digest('hex')
      .toUpperCase();

    const isValid = hash === vpc_SecureHash;
    const responseCode = params.vpc_TxnResponseCode || '99';

    return { isValid, responseCode };
  }

  private getClientIP(): string {
    // In a real application, you would get this from the request
    return '127.0.0.1';
  }
}
