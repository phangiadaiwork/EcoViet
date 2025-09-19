import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CardMedia,
    Button,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Skeleton,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    ArrowBack,
    Receipt,
    LocalShipping,
    Cancel,
    AccessTime,
    Person,
    LocationOn,
    Phone,
    Email
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
    callGetOrderById, 
    callCancelOrder, 
    getOrderStatuses, 
    formatCurrency, 
    formatDate 
} from '../../services/apiOrders/apiOrders';

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    shipping_fee: number;
    tax_amount: number;
    discount_amount: number;
    shipping_name: string;
    shipping_email: string;
    shipping_phone: string;
    shipping_address: string;
    status: string;
    notes?: string;
    createAt: string;
    updateAt: string;
    order_items: OrderItem[];
    payments?: Payment[];
}

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    total: number;
    product: {
        id: string;
        name: string;
        images: string[];
        sku: string;
    };
}

interface Payment {
    id: string;
    amount: number;
    payment_method: string;
    payment_status: string;
    createAt: string;
}

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const orderStatuses = getOrderStatuses();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        if (orderId) {
            fetchOrderDetail();
        }
    }, [isAuthenticated, navigate, orderId]);

    const fetchOrderDetail = async () => {
        if (!orderId) return;
        
        try {
            setLoading(true);
            setError(null);

            const response = await callGetOrderById(orderId);
            
            if (response?.data) {
                setOrder(response.data);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Lỗi khi tải chi tiết đơn hàng');
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;

        try {
            setCancelling(true);
            await callCancelOrder(order.id);
            toast.success('Đã hủy đơn hàng thành công');
            fetchOrderDetail(); // Refresh order details
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi hủy đơn hàng');
            console.error('Error cancelling order:', error);
        } finally {
            setCancelling(false);
        }
    };

    const getStatusChip = (status: string) => {
        const statusInfo = orderStatuses.find(s => s.value === status);
        if (!statusInfo) return <Chip label={status} size="small" />;

        return (
            <Chip 
                label={statusInfo.label} 
                size="medium" 
                color={statusInfo.color as any}
                variant="filled"
            />
        );
    };

    const canCancelOrder = (status: string) => {
        return ['PENDING', 'PROCESSING'].includes(status);
    };

    const getOrderStatusSteps = () => {
        const steps = [
            { label: 'Đặt hàng', status: 'PENDING' },
            { label: 'Xử lý', status: 'PROCESSING' },
            { label: 'Giao hàng', status: 'SHIPPED' },
            { label: 'Hoàn thành', status: 'DELIVERED' }
        ];

        const currentStatusIndex = steps.findIndex(step => step.status === order?.status);
        return { steps, activeStep: order?.status === 'CANCELLED' ? -1 : currentStatusIndex };
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rectangular" height={400} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" height={300} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (error || !order) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'Không tìm thấy đơn hàng'}
                </Alert>
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={() => navigate('/orders')}
                >
                    Quay lại danh sách đơn hàng
                </Button>
            </Container>
        );
    }

    const { steps, activeStep } = getOrderStatusSteps();
    const subtotal = order.total_amount - order.shipping_fee - order.tax_amount + order.discount_amount;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Button 
                        startIcon={<ArrowBack />} 
                        onClick={() => navigate('/orders')}
                        sx={{ mb: 2 }}
                    >
                        Quay lại
                    </Button>
                    <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        <Receipt sx={{ mr: 2, color: 'primary.main' }} />
                        Đơn hàng #{order.order_number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                        Đặt hàng lúc: {formatDate(order.createAt)}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    {getStatusChip(order.status)}
                    {canCancelOrder(order.status) && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                        </Button>
                    )}
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Main Content */}
                <Grid item xs={12} md={8}>
                    {/* Order Progress */}
                    {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Trạng thái đơn hàng
                            </Typography>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {steps.map((step) => (
                                    <Step key={step.status}>
                                        <StepLabel>{step.label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Paper>
                    )}

                    {/* Order Items */}
                    <Paper sx={{ mb: 3 }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6">
                                Sản phẩm đã đặt ({order.order_items.length} sản phẩm)
                            </Typography>
                        </Box>
                        
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Sản phẩm</TableCell>
                                        <TableCell align="center">Số lượng</TableCell>
                                        <TableCell align="right">Đơn giá</TableCell>
                                        <TableCell align="right">Thành tiền</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.order_items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <CardMedia
                                                        component="img"
                                                        src={`https://be-ecom-2hfk.onrender.com/images/${item.product.images[0]}` || '/images/placeholder-product.svg'}
                                                        alt={item.product.name}
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            objectFit: 'cover',
                                                            borderRadius: 1
                                                        }}
                                                    />
                                                    <Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {item.product.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            SKU: {item.product.sku}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body1">
                                                    {item.quantity}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body1">
                                                    {formatCurrency(item.price)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {formatCurrency(item.total)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Shipping Information */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalShipping sx={{ mr: 1 }} />
                            Thông tin giao hàng
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        <strong>Người nhận:</strong> {order.shipping_name}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        <strong>Số điện thoại:</strong> {order.shipping_phone}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        <strong>Email:</strong> {order.shipping_email}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                    <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                                    <Typography variant="body2">
                                        <strong>Địa chỉ:</strong> {order.shipping_address}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        
                        {order.notes && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="body2">
                                    <strong>Ghi chú:</strong> {order.notes}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    {/* Order Summary */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Tóm tắt đơn hàng
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Tạm tính:</Typography>
                            <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Phí vận chuyển:</Typography>
                            <Typography variant="body2">{formatCurrency(order.shipping_fee)}</Typography>
                        </Box>
                        
                        {order.tax_amount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Thuế:</Typography>
                                <Typography variant="body2">{formatCurrency(order.tax_amount)}</Typography>
                            </Box>
                        )}
                        
                        {order.discount_amount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="success.main">Giảm giá:</Typography>
                                <Typography variant="body2" color="success.main">
                                    -{formatCurrency(order.discount_amount)}
                                </Typography>
                            </Box>
                        )}
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Tổng cộng:</Typography>
                            <Typography variant="h6" color="primary">
                                {formatCurrency(order.total_amount)}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Payment Information */}
                    {order.payments && order.payments.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Thông tin thanh toán
                            </Typography>
                            {order.payments.map((payment) => (
                                <Box key={payment.id} sx={{ mb: 2, last: { mb: 0 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Phương thức:</Typography>
                                        <Typography variant="body2">{payment.payment_method}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Số tiền:</Typography>
                                        <Typography variant="body2">{formatCurrency(payment.amount)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Trạng thái:</Typography>
                                        <Chip 
                                            label={payment.payment_status} 
                                            size="small" 
                                            color={payment.payment_status === 'COMPLETED' ? 'success' : 'warning'}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(payment.createAt)}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default OrderDetailPage;
