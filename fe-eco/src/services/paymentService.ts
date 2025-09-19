import axios from '../utils/axiosCustomize';

// Interfaces cho payment
export interface CreateOrderData {
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  notes?: string;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
}

export interface VNPayPaymentData {
  order_id: string;
  amount: number;
  description?: string;
  bank_code?: string;
  locale?: 'vn' | 'en';
}

export interface PayPalPaymentData {
  order_id: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface PaymentResultVNPay {
  statusCode: number;
  message?: string;
  data?: any;
  author ?: string;
}

export interface PaymentData {
  paymentUrl?: string;
  vnp_Params?: vnpParams;
}

export interface vnpParams {
  np_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Locale: string;
  vnp_CurrCode: string;
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_Amount: number;
  vnp_IpAddr: string;
  vnp_BankCode?: string;  
}


export interface PaymentResult {
  status: 'success' | 'failed';
  message: string;
  order_number?: string;
  transaction_id?: string;
  payment_url?: string;
  approval_url?: string;
}


class PaymentService {
  // Order API
  async createOrder(orderData: CreateOrderData) {
    const response = await axios.post('/api/v1/orders', orderData);
    return response.data;
  }

  async getOrder(orderId: string) {
    const response = await axios.get(`/api/v1/orders/${orderId}`);
    return response.data;
  }

  async getUserOrders(params?: { page?: number; limit?: number }) {
    const response = await axios.get('/api/v1/orders', { params });
    return response.data;
  }

  // VNPay Payment API
  async createVNPayPayment(paymentData: VNPayPaymentData): Promise<PaymentResultVNPay | any> {
    try {
      const response = await axios.post('/api/v1/payments/vnpay/create', paymentData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo thanh toán VNPay');
    }
  }

  async handleVNPayReturn(queryParams: URLSearchParams): Promise<PaymentResultVNPay | any> {
    try {
      const response = await axios.get(`/api/v1/payments/vnpay/return?${queryParams.toString()}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi xác minh thanh toán VNPay');
    }
  }

  // PayPal Payment API
  async createPayPalPayment(paymentData: PayPalPaymentData): Promise<PaymentResult> {
    try {
      const response = await axios.post('/api/v1/payments/paypal/create', paymentData);
      return {
        status: 'success',
        message: 'Tạo thanh toán PayPal thành công',
        approval_url: response.data.approval_url,
        transaction_id: response.data.payment_id
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo thanh toán PayPal');
    }
  }

  async executePayPalPayment(paymentId: string, payerId: string, orderId: string): Promise<PaymentResult> {
    try {
      const response = await axios.post('/api/v1/payments/paypal/execute', {
        payment_id: paymentId,
        payer_id: payerId,
        order_id: orderId
      });
      return {
        status: response.data.status === 'success' ? 'success' : 'failed',
        message: response.data.message,
        transaction_id: paymentId
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi thực thi thanh toán PayPal');
    }
  }

  // Payment History API
  async getPaymentsByOrder(orderId: string) {
    try {
      const response = await axios.get(`/api/v1/payments/order/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy lịch sử thanh toán');
    }
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = 'VND'): string {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    } else if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
    return amount.toString();
  }

  convertVNDToUSD(amountVND: number, exchangeRate: number = 23000): number {
    return Number((amountVND / exchangeRate).toFixed(2));
  }

  convertUSDToVND(amountUSD: number, exchangeRate: number = 23000): number {
    return Math.round(amountUSD * exchangeRate);
  }

  // Validation methods
  validatePaymentData(data: VNPayPaymentData | PayPalPaymentData): boolean {
    if (!data.order_id || !data.amount || data.amount <= 0) {
      return false;
    }
    return true;
  }

  // Error handling
  handlePaymentError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Có lỗi xảy ra trong quá trình thanh toán';
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
