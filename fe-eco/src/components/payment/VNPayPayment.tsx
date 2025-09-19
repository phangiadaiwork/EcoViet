import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress
} from '@mui/material';
import { Payment, AccountBalance } from '@mui/icons-material';

interface VNPayPaymentProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: any) => void;
}

const VNPayPayment: React.FC<VNPayPaymentProps> = ({
  amount,
  orderId,
  onPaymentError,
}) => {
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Danh sách ngân hàng VNPay hỗ trợ
  const supportedBanks = [
    { code: 'VNPAYQR', name: 'Thanh toán qua ứng dụng hỗ trợ VNPAYQR', icon: '📱' },
    { code: 'VIETCOMBANK', name: 'Ngân hàng Vietcombank', icon: '🏦' },
    { code: 'BIDV', name: 'Ngân hàng BIDV', icon: '🏦' },
    { code: 'AGRIBANK', name: 'Ngân hàng Agribank', icon: '🏦' },
    { code: 'TCB', name: 'Ngân hàng Techcombank', icon: '🏦' },
    { code: 'ACB', name: 'Ngân hàng ACB', icon: '🏦' },
    { code: 'MB', name: 'Ngân hàng MB', icon: '🏦' },
    { code: 'SACOMBANK', name: 'Ngân hàng Sacombank', icon: '🏦' },
    { code: 'VISA', name: 'Thẻ quốc tế Visa', icon: '💳' },
    { code: 'MASTERCARD', name: 'Thẻ quốc tế MasterCard', icon: '💳' },
  ];

  const handleVNPayPayment = async () => {
    if (!selectedBank) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Gọi API tạo URL thanh toán VNPay
      const response = await fetch('/api/v1/payments/vnpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': typeof window !== 'undefined' && localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: amount, // VNPay sử dụng VND
          bank_code: selectedBank,
          description: `Thanh toán đơn hàng ${orderId}`,
          locale: 'vn',
          
        })
      });

      if (!response.ok) {
        throw new Error('Không thể tạo liên kết thanh toán');
      }

      const result = await response.json();
      
      if (result.payment_url) {
        // Chuyển hướng đến trang thanh toán VNPay
        window.location.href = result.payment_url;
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo thanh toán');
      onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Payment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Thanh toán VNPay
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Số tiền: <strong>{amount.toLocaleString('vi-VN')} VND</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">
            Chọn phương thức thanh toán:
          </FormLabel>
          <RadioGroup
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
          >
            {supportedBanks.map((bank) => (
              <FormControlLabel
                key={bank.code}
                value={bank.code}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>{bank.icon}</span>
                    {bank.name}
                  </Box>
                }
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleVNPayPayment}
            disabled={loading || !selectedBank}
            startIcon={loading ? <CircularProgress size={20} /> : <AccountBalance />}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>🔒 An toàn & Bảo mật:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Thanh toán được bảo mật bởi VNPay
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Hỗ trợ tất cả ngân hàng tại Việt Nam
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Giao dịch được mã hóa SSL 256-bit
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VNPayPayment;
