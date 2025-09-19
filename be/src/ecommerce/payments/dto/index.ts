export class CreatePaymentDto {
  order_id: string;
  amount: number;
  payment_method: 'PAYPAL' | 'VNPAY';
}

export class VNPayPaymentDto {
  order_id: string;
  amount: number;
  description?: string;
  bank_code?: string;
  locale?: 'vn' | 'en';
}

export class PayPalPaymentDto {
  order_id: string;
  amount: number;
  currency?: string;
  description?: string;
}
