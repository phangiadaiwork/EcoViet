import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

interface VNPayConfig {
  vnp_TmnCode: string;
  vnp_HashSecret: string;
  vnp_Url: string;
  vnp_ReturnUrl: string;
  FRONTEND_URL?: string;
}

interface VNPayPaymentData {
  amount: number;
  order_id: string;
  description: string;
  bank_code?: string;
  locale?: string;
}

@Injectable()
export class VNPayService {
  private config: VNPayConfig;

  constructor(private configService: ConfigService, private prisma: PrismaService,) {
    this.config = {
      vnp_TmnCode: this.configService.get('VNPAY_TMN_CODE'),
      vnp_HashSecret: this.configService.get('VNPAY_HASH_SECRET'),
      vnp_Url: this.configService.get('VNPAY_URL') ,
      vnp_ReturnUrl: this.configService.get('VNPay_RETURN_URL') || '/payment/success?method=vnpay',
      FRONTEND_URL: this.configService.get('FRONTEND_URL'),
    };
  }

  async createPaymentUrl(paymentData: VNPayPaymentData): Promise<{ paymentUrl: string; vnp_Params: any }> {
    const createDate = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const orderId = paymentData.order_id + '_' + createDate;

    
    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.vnp_TmnCode,
      vnp_Locale: paymentData.locale || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: paymentData.description,
      vnp_OrderType: 'other',
      vnp_Amount: paymentData.amount * 100,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ReturnUrl: this.config.FRONTEND_URL + this.config.vnp_ReturnUrl,
    };

    if (paymentData.bank_code) {
      vnp_Params.vnp_BankCode = paymentData.bank_code;
    }

    // Sort parameters
    vnp_Params = this.sortObject(vnp_Params);

    // Create query string
    const signData = Object.keys(vnp_Params)
      .map(key => `${key}=${vnp_Params[key]}`)
      .join('&');
    
    // Create secure hash
    const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params.vnp_SecureHash = signed;

    // Create payment URL
    const paymentUrl = this.config.vnp_Url + '?' + Object.keys(vnp_Params)
      .map(key => `${key}=${vnp_Params[key]}`)
      .join('&');
    return {paymentUrl, vnp_Params};
  }

  verifyReturnUrl(vnp_Params: any): { isValid: boolean; responseCode: string; message: string;} {
    const secureHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const sortedParams = this.sortObject(vnp_Params);
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    
    const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isValid = secureHash === signed;
    const responseCode = vnp_Params.vnp_ResponseCode;

    let message = '';
    switch (responseCode) {
      case '00':
        message = 'Giao dịch thành công';
        break;
      case '07':
        message = 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).';
        break;
      case '09':
        message = 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.';
        break;
      case '10':
        message = 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần';
        break;
      case '11':
        message = 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.';
        break;
      case '12':
        message = 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.';
        break;
      case '13':
        message = 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).';
        break;
      case '24':
        message = 'Giao dịch không thành công do: Khách hàng hủy giao dịch';
        break;
      case '51':
        message = 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.';
        break;
      case '65':
        message = 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.';
        break;
      case '75':
        message = 'Ngân hàng thanh toán đang bảo trì.';
        break;
      case '79':
        message = 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.';
        break;
      default:
        message = 'Giao dịch thất bại';
    }


    return {
      isValid,
      responseCode,
      message,
    };
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    });
    return sorted;
  }

}
