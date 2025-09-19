import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Grid, 
  Card, 
  CardContent,
  Button,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  PaymentTwoTone, 
  LocalShipping,
  CheckCircle,
  CreditCard,
  ShoppingCart,
  AccountBalanceWallet,
  Security,
  ExpandMore,
  ExpandLess,
  Receipt,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon 
} from 'react-share';
import { useSelector } from 'react-redux';
import { paymentService } from '../../services/paymentService';
import EmptyCart from '../../components/cart/EmptyCart';
import useCartSync from '../../hooks/useCartSync';

const CheckoutPage: React.FC = () => {
  // Use cart sync hook for automatic cart synchronization
  useCartSync();
  
  const cartItems = useSelector((state: any) => state.cart.items);
  const totalAmount = useSelector((state: any) => state.cart.totalAmount);
  const user = useSelector((state: any) => state.account.user);
  const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
  
  const [activeStep, setActiveStep] = useState(0);
  const [orderData, setOrderData] = useState({
    shipping_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address: '',
    billing_name: '',
    billing_email: '',
    billing_phone: '',
    billing_address: '',
    notes: '',
    payment_method: 'vnpay',
    same_as_shipping: true
  });

  const [loading, setLoading] = useState(false);
  const [paymentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const steps = ['Thông tin giao hàng', 'Xác nhận đơn hàng', 'Thanh toán'];

  // Calculate cart totals
  const shippingFee = 25000; // 25,000 VND
  const subtotal = totalAmount;
  const finalTotal = subtotal + shippingFee;

  useEffect(() => {
    // Auto-fill user data if logged in
    if (isAuthenticated && user) {
      setOrderData(prev => ({
        ...prev,
        shipping_name: user.name || '',
        shipping_email: user.email || '',
        shipping_phone: user.phone || '',
        shipping_address: user.address || '', // Use user's saved address if available
        billing_name: user.name || '',
        billing_email: user.email || '',
        billing_phone: user.phone || '',
        billing_address: user.address || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const validateShippingInfo = () => {
    const required = ['shipping_name', 'shipping_email', 'shipping_phone', 'shipping_address'];
    const missing = required.filter(field => {
      const value = orderData[field as keyof typeof orderData];
      return !value || (typeof value === 'string' && !value.trim());
    });
    
    if (missing.length > 0) {
      const missingFields = missing.map(field => {
        switch(field) {
          case 'shipping_name': return 'Họ và tên';
          case 'shipping_email': return 'Email';
          case 'shipping_phone': return 'Số điện thoại';
          case 'shipping_address': return 'Địa chỉ giao hàng';
          default: return field;
        }
      });
      setError(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.shipping_email.trim())) {
      setError('Định dạng email không hợp lệ');
      return false;
    }

    // Validate phone number (Vietnamese format)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(orderData.shipping_phone.replace(/\s/g, ''))) {
      setError('Số điện thoại phải có 10-11 chữ số');
      return false;
    }

    // Check if address is detailed enough
    if (orderData.shipping_address.trim().length < 10) {
      setError('Vui lòng nhập địa chỉ chi tiết hơn (ít nhất 10 ký tự)');
      return false;
    }

    setError(''); // Clear any previous errors
    return true;
  };

  const createOrder = async () => {
    try {
      const orderPayload = {
        items: cartItems.map((item: any) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: String(item.salePrice || item.price) // Convert price to string
        })),
        shipping_address: orderData.shipping_address,
        shipping_name: orderData.shipping_name,
        shipping_email: orderData.shipping_email,
        shipping_phone: orderData.shipping_phone,
        notes: orderData.notes,
        shipping_fee: shippingFee,
        tax_amount: 0,
        total_amount: finalTotal
      };
      
      const order = await paymentService.createOrder(orderPayload);
      
      setCurrentOrderId(order.id);
      return order;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi khi tạo đơn hàng');
    }
  };

  const handleVNPayPayment = async () => {
    setLoading(true);
    setError('');

    try {
      if (!validateShippingInfo()) {
        setLoading(false);
        return;
      }

      // Create order first
      const order = await createOrder();

      // Create VNPay payment
      const paymentResult = await paymentService.createVNPayPayment({
        order_id: order.id,
        amount: Math.round(finalTotal),
        description: `Thanh toán đơn hàng ${order.order_number}`,
        bank_code: undefined,
        locale: 'vn'
      });


      if (paymentResult && paymentResult.data && paymentResult.data.paymentUrl) {
        // Redirect to VNPay
        window.location.href = paymentResult.data.paymentUrl;
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    setError('');

    try {
      if (!validateShippingInfo()) {
        setLoading(false);
        return;
      }

      // Create order first
      const order = await createOrder();

      // Create PayPal payment
      const paymentResult = await paymentService.createPayPalPayment({
        order_id: order.id,
        amount: Number((finalTotal / 23000).toFixed(2)), // Convert VND to USD
        currency: 'USD',
        description: `Payment for order ${order.order_number}`
      });

      if (paymentResult.approval_url) {
        // Redirect to PayPal
        window.location.href = paymentResult.approval_url;
      } else {
        throw new Error('Không nhận được URL thanh toán PayPal');
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    
    if (!validateShippingInfo()) {
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmPayment = async () => {
    
    setConfirmDialogOpen(false);
    
    switch (orderData.payment_method) {
      case 'vnpay':
        await handleVNPayPayment();
        break;
      case 'paypal':
        await handlePayPalPayment();
        break;
      default:
        setError('Vui lòng chọn phương thức thanh toán');
    }
  };

  const nextStep = () => {
    if (activeStep === 0 && !validateShippingInfo()) {
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const prevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  const shareUrl = window.location.origin;
  const shareTitle = 'Thanh toán an toàn - Nhiều phương thức thanh toán';

  // Show empty cart if no items
  if (cartItems.length === 0 && !paymentSuccess) {
    return <EmptyCart />;
  }

  if (paymentSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 3 }} />
            
            <Typography variant="h3" gutterBottom color="success.main" fontWeight="bold">
              Thanh toán thành công!
            </Typography>
            
            <Typography variant="h6" color="text.secondary" paragraph>
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ gửi email xác nhận trong ít phút.
            </Typography>

            <Box sx={{ my: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                <Receipt sx={{ mr: 1 }} />
                Thông tin đơn hàng
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mã đơn hàng: <strong>{currentOrderId}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiền: <strong>{formatCurrency(finalTotal)}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email: <strong>{orderData.shipping_email}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Điện thoại: <strong>{orderData.shipping_phone}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mt: 4, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Typography component="span" sx={{ mr: 1 }}>🎉</Typography>
                Chia sẻ trải nghiệm mua sắm:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                <FacebookShareButton url={shareUrl}>
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareTitle}>
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
                <WhatsappShareButton url={shareUrl} title={shareTitle}>
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => window.location.href = '/'}
                sx={{ minWidth: 150 }}
              >
                Tiếp tục mua sắm
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={() => window.location.href = '/orders'}
                sx={{ minWidth: 150 }}
              >
                Xem đơn hàng
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <PaymentTwoTone sx={{ mr: 2, fontSize: 40 }} />
          Thanh toán an toàn
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Hoàn tất đơn hàng của bạn với các phương thức thanh toán được bảo mật
        </Typography>
      </Box>

      {/* Progress Stepper */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Order Summary - Always visible */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  mb: 2
                }}
                onClick={() => setOrderSummaryExpanded(!orderSummaryExpanded)}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCart sx={{ mr: 1 }} />
                  Tóm tắt đơn hàng ({cartItems.length} sản phẩm)
                </Typography>
                {orderSummaryExpanded ? <ExpandLess /> : <ExpandMore />}
              </Box>
              
              <Collapse in={orderSummaryExpanded}>
                {cartItems.map((item: any) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Số lượng: {item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(item.quantity * (item.salePrice || item.price))}
                    </Typography>
                  </Box>
                ))}
              </Collapse>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{formatCurrency(subtotal)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShipping sx={{ mr: 1, fontSize: 16 }} />
                  Phí vận chuyển:
                </Typography>
                <Typography>{formatCurrency(shippingFee)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2, backgroundColor: 'primary.50', px: 2, borderRadius: 1 }}>
                <Typography variant="h6" fontWeight="bold">Tổng cộng:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatCurrency(finalTotal)}
                </Typography>
              </Box>

              <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Security sx={{ mr: 1, fontSize: 16 }} />
                  <strong>Bảo mật thanh toán</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Thông tin thanh toán được mã hóa SSL 256-bit
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Step 1: Shipping Information */}
          {activeStep === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocalShipping sx={{ mr: 2 }} />
                  Thông tin giao hàng
                </Typography>

                {/* User Info Auto-fill Notice */}
                {isAuthenticated && user && (user.name || user.email || user.phone || user.address) && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Thông tin đã được tự động điền từ tài khoản của bạn.</strong>
                      <br />
                      Vui lòng kiểm tra và cập nhật các thông tin cần thiết trước khi tiếp tục.
                    </Typography>
                  </Alert>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên *"
                      value={orderData.shipping_name}
                      onChange={(e) => handleInputChange('shipping_name', e.target.value)}
                      placeholder={!orderData.shipping_name ? "Nhập họ và tên của bạn" : ""}
                      InputProps={{
                        startAdornment: <Box sx={{ mr: 1 }}>👤</Box>
                      }}
                      helperText={!orderData.shipping_name ? "Vui lòng nhập họ và tên" : ""}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      value={orderData.shipping_email}
                      onChange={(e) => handleInputChange('shipping_email', e.target.value)}
                      placeholder={!orderData.shipping_email ? "example@email.com" : ""}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      helperText={!orderData.shipping_email ? "Vui lòng nhập địa chỉ email" : ""}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại *"
                      value={orderData.shipping_phone}
                      onChange={(e) => handleInputChange('shipping_phone', e.target.value)}
                      placeholder={!orderData.shipping_phone ? "0123456789" : ""}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      helperText={!orderData.shipping_phone ? "Vui lòng nhập số điện thoại" : ""}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ giao hàng *"
                      multiline
                      rows={3}
                      value={orderData.shipping_address}
                      onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                      placeholder={!orderData.shipping_address ? "Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)" : ""}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                      }}
                      helperText={!orderData.shipping_address ? "Vui lòng nhập địa chỉ giao hàng chi tiết" : ""}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú đơn hàng (Tùy chọn)"
                      multiline
                      rows={2}
                      value={orderData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={nextStep}
                    sx={{ minWidth: 150 }}
                  >
                    Tiếp tục
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Order Confirmation */}
          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Receipt sx={{ mr: 2 }} />
                  Xác nhận đơn hàng
                </Typography>

                {/* Shipping Information Review */}
                <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin giao hàng
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Box>👤</Box></ListItemIcon>
                      <ListItemText primary={orderData.shipping_name} secondary="Họ và tên" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText primary={orderData.shipping_email} secondary="Email" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Phone /></ListItemIcon>
                      <ListItemText primary={orderData.shipping_phone} secondary="Điện thoại" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LocationOn /></ListItemIcon>
                      <ListItemText primary={orderData.shipping_address} secondary="Địa chỉ" />
                    </ListItem>
                    {orderData.notes && (
                      <ListItem>
                        <ListItemIcon><Box>📝</Box></ListItemIcon>
                        <ListItemText primary={orderData.notes} secondary="Ghi chú" />
                      </ListItem>
                    )}
                  </List>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={prevStep}
                    sx={{ minWidth: 150 }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={nextStep}
                    sx={{ minWidth: 150 }}
                  >
                    Chọn thanh toán
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {activeStep === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CreditCard sx={{ mr: 2 }} />
                  Phương thức thanh toán
                </Typography>
                
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={orderData.payment_method}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  >
                    <Paper elevation={1} sx={{ p: 2, mb: 2, border: orderData.payment_method === 'vnpay' ? '2px solid' : '1px solid', borderColor: orderData.payment_method === 'vnpay' ? 'primary.main' : 'grey.300' }}>
                      <FormControlLabel 
                        value="vnpay" 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                            <AccountBalanceWallet sx={{ color: 'primary.main' }} />
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                VNPay - Thanh toán trong nước
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip label="Việt Nam" size="small" color="success" />
                                <Chip label="ATM/Internet Banking" size="small" color="info" />
                                <Chip label="QR Pay" size="small" color="warning" />
                              </Box>
                            </Box>
                          </Box>
                        } 
                      />
                    </Paper>
                    
                    <Paper elevation={1} sx={{ p: 2, border: orderData.payment_method === 'paypal' ? '2px solid' : '1px solid', borderColor: orderData.payment_method === 'paypal' ? 'primary.main' : 'grey.300' }}>
                      <FormControlLabel 
                        value="paypal" 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                            <Box sx={{ color: '#0070ba' }}>💳</Box>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                PayPal - Thanh toán quốc tế
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip label="Quốc tế" size="small" color="primary" />
                                <Chip label="Visa/MasterCard" size="small" color="info" />
                                <Chip label="PayPal Balance" size="small" color="success" />
                              </Box>
                            </Box>
                          </Box>
                        } 
                      />
                    </Paper>
                  </RadioGroup>
                </FormControl>

                {/* Payment Method Details */}
                {orderData.payment_method === 'vnpay' && (
                  <Paper elevation={1} sx={{ p: 3, mt: 3, backgroundColor: 'success.50' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Security sx={{ mr: 1, color: 'success.main' }} />
                      <strong>Thanh toán VNPay an toàn</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Hỗ trợ tất cả ngân hàng tại Việt Nam<br/>
                      • Thanh toán qua QR Code, Internet Banking, ATM<br/>
                      • Bảo mật theo tiêu chuẩn quốc tế PCI DSS<br/>
                      • Phí giao dịch: Miễn phí
                    </Typography>
                  </Paper>
                )}

                {orderData.payment_method === 'paypal' && (
                  <Paper elevation={1} sx={{ p: 3, mt: 3, backgroundColor: 'primary.50' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Security sx={{ mr: 1, color: 'primary.main' }} />
                      <strong>Thanh toán PayPal an toàn</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Được bảo vệ bởi PayPal Buyer Protection<br/>
                      • Hỗ trợ thẻ tín dụng Visa, MasterCard, American Express<br/>
                      • Có mặt tại 200+ quốc gia và vùng lãnh thổ<br/>
                      • Tỷ giá: {formatCurrency(finalTotal)} = ${Number((finalTotal / 23000).toFixed(2))} USD
                    </Typography>
                  </Paper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={prevStep}
                    sx={{ minWidth: 150 }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    onClick={handleSubmitOrder}
                    disabled={loading || cartItems.length === 0}
                    startIcon={loading ? <Box>⏳</Box> : <Box>🔒</Box>}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? 'Đang xử lý...' : `Thanh toán ${formatCurrency(finalTotal)}`}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1 }} />
          Xác nhận thanh toán
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Bạn có chắc chắn muốn tiến hành thanh toán đơn hàng với tổng giá trị <strong>{formatCurrency(finalTotal)}</strong> bằng phương thức <strong>{orderData.payment_method === 'vnpay' ? 'VNPay' : 'PayPal'}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sau khi xác nhận, bạn sẽ được chuyển hướng đến trang thanh toán an toàn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Hủy
          </Button>
          <Button onClick={confirmPayment} variant="contained" color="primary">
            Xác nhận thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;
