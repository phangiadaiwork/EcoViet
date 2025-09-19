export { CreateOrderDto, OrderItemDto } from './create-order.dto';
export { UpdateOrderDto } from './update-order.dto';
export { OrderQueryDto } from './order-query.dto';

// Payment DTOs
export class CreatePaymentDto {
  order_id: string;
  amount: number;
  payment_method: 'PAYPAL' | 'VNPAY';
}

export class PayPalPaymentDto {
  order_id: string;
  amount: number;
  currency?: string;
  description?: string;
}

export class VNPayPaymentDto {
  order_id: string;
  amount: number;
  description?: string;
  bank_code?: string;
  locale?: string;
}
