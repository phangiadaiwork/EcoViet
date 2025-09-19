import React from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Security,
  Payment
} from '@mui/icons-material';

interface PaymentLoadingProps {
  paymentMethod: 'vnpay' | 'paypal';
  message?: string;
}

const PaymentLoading: React.FC<PaymentLoadingProps> = ({ 
  paymentMethod, 
  message 
}) => {
  const getPaymentInfo = () => {
    switch (paymentMethod) {
      case 'vnpay':
        return {
          name: 'VNPay',
          color: '#1976d2',
          description: 'Đang chuyển hướng đến trang thanh toán VNPay...'
        };
      case 'paypal':
        return {
          name: 'PayPal',
          color: '#0070ba',
          description: 'Đang chuyển hướng đến trang thanh toán PayPal...'
        };
      default:
        return {
          name: 'Payment',
          color: '#1976d2',
          description: 'Đang xử lý thanh toán...'
        };
    }
  };

  const paymentInfo = getPaymentInfo();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Payment sx={{ 
            fontSize: 80, 
            color: paymentInfo.color,
            mb: 2 
          }} />
          
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {paymentInfo.name}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            {message || paymentInfo.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <CircularProgress 
            size={60} 
            sx={{ color: paymentInfo.color }} 
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: paymentInfo.color
              }
            }} 
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          mb: 2
        }}>
          <Security sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="body2" color="text.secondary">
            Giao dịch được bảo mật bằng SSL 256-bit
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Vui lòng không đóng trình duyệt cho đến khi hoàn tất thanh toán
        </Typography>
      </Paper>
    </Container>
  );
};

export default PaymentLoading;
