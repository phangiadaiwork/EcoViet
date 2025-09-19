import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Receipt,
  LocalShipping,
  Email,
  Phone,
  Home
} from '@mui/icons-material';
import axios from '../../utils/axiosCustomize';
import { clearCart } from '../../redux/cart/cartSlice';
import paymentService from '../../services/paymentService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        const paymentMethod = searchParams.get('method');
        
        if (paymentMethod === 'vnpay') {
          // Handle VNPay return
          const queryParams = Object.fromEntries(searchParams.entries());
          const result = await paymentService.handleVNPayReturn(new URLSearchParams(queryParams));
          
          if(result && result.data && result.data.status === 'success') {
            setPaymentResult({
              ...result.data,
              method: 'VNPay',
              transaction_id: result.transaction_id || result.data.order_number,
              order_number: result.order_number
            });
              try {
                if (typeof window !== 'undefined') localStorage.removeItem('cart');
                localStorage.removeItem('cart');
                await axios.delete('/api/v1/cart/clear');
                dispatch(clearCart()); // Clear Redux store
              } catch (cartError) {
                console.error('Error clearing cart on server:', cartError);
              }
          }
          else{
            window.location.href = '/payment/cancel';
          }
        } else if (paymentMethod === 'paypal') {
          // Handle PayPal return
          const paymentId = searchParams.get('paymentId');
          const payerId = searchParams.get('PayerID');
          const orderId = searchParams.get('orderId');

          if (!paymentId || !payerId || !orderId) {
            throw new Error('Thông tin thanh toán PayPal không hợp lệ');
          }


          const result = await axios.post('/api/v1/payments/paypal/execute', {
            payment_id: paymentId,
            payer_id: payerId,
            order_id: orderId
          });


          // Check if PayPal execution was successful
          if (result.data?.status !== 'success') {
            throw new Error(result.data?.message || 'Thanh toán PayPal không thành công');
          }

          setPaymentResult({
            ...result.data,
            method: 'PayPal',
            transaction_id: paymentId,
            order_number: result.data?.order_number || orderId
          });


                  // Clear cart after successful payment
              try {
                if (typeof window !== 'undefined') localStorage.removeItem('cart');
                localStorage.removeItem('cart');
                await axios.delete('/api/v1/cart/clear');
                dispatch(clearCart()); // Clear Redux store
              } catch (cartError) {
                console.error('Error clearing cart on server:', cartError);
              }
        } else {
          throw new Error('Phương thức thanh toán không được hỗ trợ');
        }



      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentReturn();
  }, [searchParams]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang xử lý thanh toán...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng không đóng trình duyệt
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="h5" gutterBottom>
              Thanh toán thất bại
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/cart/checkout')}
                sx={{ mr: 2 }}
              >
                Thử lại
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        {/* Success Header */}
        <Box sx={{ 
          background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
          color: 'white',
          p: 4,
          textAlign: 'center'
        }}>
          <CheckCircle sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Thanh toán thành công!
          </Typography>
          <Typography variant="h6">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </Typography>
        </Box>

        {/* Payment Details */}
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Transaction Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Receipt sx={{ mr: 1 }} />
                Thông tin giao dịch
              </Typography>
              
              <Box sx={{ pl: 3 }}>
                {paymentResult?.order_number && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Mã đơn hàng:</strong> {paymentResult.order_number}
                  </Typography>
                )}
                
                {paymentResult?.transaction_id && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Mã giao dịch:</strong> {paymentResult.transaction_id}
                  </Typography>
                )}
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Phương thức:</strong> {paymentResult?.method}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Trạng thái:</strong> 
                  <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold', ml: 1 }}>
                    Thành công
                  </Box>
                </Typography>
                
                <Typography variant="body2">
                  <strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}
                </Typography>
              </Box>
            </Grid>

            {/* Next Steps */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping sx={{ mr: 1 }} />
                Bước tiếp theo
              </Typography>
              
              <Box sx={{ pl: 3 }}>
                <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 1, fontSize: 16 }} />
                  Email xác nhận sẽ được gửi trong vài phút
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1, fontSize: 16 }} />
                  Chúng tôi sẽ liên hệ xác nhận đơn hàng
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShipping sx={{ mr: 1, fontSize: 16 }} />
                  Đơn hàng sẽ được giao trong 2-3 ngày làm việc
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Message */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body1" paragraph>
              {paymentResult?.message || 'Đơn hàng của bạn đã được xác nhận và đang được xử lý.'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn có thể theo dõi trạng thái đơn hàng trong phần "Đơn hàng của tôi"
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Receipt />}
              onClick={() => navigate('/orders')}
              sx={{ minWidth: 150 }}
            >
              Xem đơn hàng
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
        </CardContent>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
