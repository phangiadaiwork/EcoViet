import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CardContent,
  Button,
  Alert,
  Paper
} from '@mui/material';
import {
  Cancel,
  Home,
  ShoppingCart,
  Warning
} from '@mui/icons-material';

const PaymentCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Log payment cancellation for analytics
  }, [searchParams]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        {/* Cancel Header */}
        <Box sx={{ 
          background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
          color: 'white',
          p: 4,
          textAlign: 'center'
        }}>
          <Cancel sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Thanh toán đã bị hủy
          </Typography>
          <Typography variant="h6">
            Bạn đã hủy quá trình thanh toán
          </Typography>
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1 }} />
              <Typography variant="body1">
                Đơn hàng của bạn chưa được thanh toán và sẽ không được xử lý
              </Typography>
            </Box>
          </Alert>

          <Typography variant="h6" gutterBottom>
            Đã xảy ra gì?
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Bạn đã chọn hủy thanh toán hoặc đã đóng cửa sổ thanh toán. 
            Đơn hàng trong giỏ hàng của bạn vẫn được giữ nguyên.
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            Nếu bạn gặp vấn đề với thanh toán, vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </Typography>

          {/* Suggestions */}
          <Box sx={{ my: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bạn có thể:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
              • Quay lại trang thanh toán và thử lại<br/>
              • Chọn phương thức thanh toán khác<br/>
              • Liên hệ với chúng tôi nếu cần hỗ trợ<br/>
              • Tiếp tục mua sắm và thanh toán sau
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/cart/checkout')}
              sx={{ minWidth: 150 }}
            >
              Thử lại thanh toán
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/cart')}
              sx={{ minWidth: 150 }}
            >
              Xem giỏ hàng
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{ minWidth: 150 }}
            >
              Về trang chủ
            </Button>
          </Box>

          {/* Support Info */}
          <Box sx={{ mt: 4, p: 2, backgroundColor: 'info.50', borderRadius: 1 }}>
            <Typography variant="body2" color="info.main">
              <strong>Cần hỗ trợ?</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@example.com | Hotline: 1800-xxxx
            </Typography>
          </Box>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default PaymentCancel;
