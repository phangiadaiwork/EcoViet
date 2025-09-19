import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Chip,
    Button,
    IconButton,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    CardMedia,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Alert,
    Skeleton,
    Collapse,
    Divider
} from '@mui/material';
import {
    Visibility,
    Cancel,
    ExpandMore,
    ExpandLess,
    ShoppingBag,
    AccessTime
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
    callGetUserOrders, 
    callCancelOrder, 
    getOrderStatuses, 
    formatCurrency, 
    formatDate 
} from '../../services/apiOrders/apiOrders';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers';

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    shipping_fee: number;
    status: string;
    createAt: string;
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

const MyOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);

    // State management
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    const orderStatuses = getOrderStatuses();
    const limit = 10;

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, navigate, page, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit,
                ...(statusFilter && { status: statusFilter })
            };

            const response = await callGetUserOrders(params);
            
            if (response?.data) {
                setOrders(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;

        try {
            await callCancelOrder(orderToCancel);
            toast.success('Đã hủy đơn hàng thành công');
            setCancelDialogOpen(false);
            setOrderToCancel(null);
            fetchOrders(); // Refresh orders list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi hủy đơn hàng');
            console.error('Error cancelling order:', error);
        }
    };

    const getStatusChip = (status: string) => {
        const statusInfo = orderStatuses.find(s => s.value === status);
        if (!statusInfo) return <Chip label={status} size="small" />;

        return (
            <Chip 
                label={statusInfo.label} 
                size="small" 
                color={statusInfo.color as any}
                variant="outlined"
            />
        );
    };

    const canCancelOrder = (status: string) => {
        return ['PENDING', 'PROCESSING'].includes(status);
    };

    const toggleOrderExpansion = (orderId: string) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleStatusFilterChange = (event: any) => {
        setStatusFilter(event.target.value);
        setPage(1); // Reset to first page when filtering
    };

    if (loading && orders.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Đơn hàng của tôi
                </Typography>
                <Grid container spacing={2}>
                    {Array.from(new Array(5)).map((_, index) => (
                        <Grid item xs={12} key={index}>
                            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    <ShoppingBag sx={{ mr: 2, color: 'primary.main' }} />
                    Đơn hàng của tôi
                </Typography>
                
                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Trạng thái"
                        onChange={handleStatusFilterChange}
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        {orderStatuses.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                                {status.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Error State */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Empty State */}
            {!loading && orders.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <ShoppingBag sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Bạn chưa có đơn hàng nào
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Hãy khám phá các sản phẩm tuyệt vời và tạo đơn hàng đầu tiên của bạn!
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/products')}
                        startIcon={<ShoppingBag />}
                    >
                        Mua sắm ngay
                    </Button>
                </Paper>
            )}

            {/* Orders List */}
            {orders.length > 0 && (
                <>
                    <Grid container spacing={3}>
                        {orders.map((order) => {
                            const isExpanded = expandedOrders.has(order.id);
                            
                            return (
                                <Grid item xs={12} key={order.id}>
                                    <Card elevation={2} sx={{ overflow: 'visible' }}>
                                        <CardContent>
                                            {/* Order Header */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        #{order.order_number}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                                        {formatDate(order.createAt)}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {getStatusChip(order.status)}
                                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                                        {formatCurrency(order.total_amount)}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Order Summary */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {order.order_items.length} sản phẩm
                                                </Typography>
                                                
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<Visibility />}
                                                        onClick={() => navigate(`/orders/${order.id}`)}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                    
                                                    {canCancelOrder(order.status) && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<Cancel />}
                                                            onClick={() => {
                                                                setOrderToCancel(order.id);
                                                                setCancelDialogOpen(true);
                                                            }}
                                                        >
                                                            Hủy đơn
                                                        </Button>
                                                    )}
                                                    
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleOrderExpansion(order.id)}
                                                    >
                                                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            {/* Expandable Order Items */}
                                            <Collapse in={isExpanded}>
                                                <Divider sx={{ mb: 2 }} />
                                                <Grid container spacing={2}>
                                                    {order.order_items.map((item) => (
                                                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                                                            <Card variant="outlined" sx={{ height: '100%' }}>
                                                                <CardContent sx={{ p: 2 }}>
                                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                                        <CardMedia
                                                                            component="img"
                                                                            src={getProductImageUrl(item.product.images[0])}
                                                                            alt={item.product.name}
                                                                            sx={{
                                                                                width: 60,
                                                                                height: 60,
                                                                                objectFit: 'cover',
                                                                                borderRadius: 1
                                                                            }}
                                                                            onError={(e: any) => {
                                                                                if (e.target.src !== PLACEHOLDER_IMAGE) {
                                                                                    e.target.src = PLACEHOLDER_IMAGE;
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                            <Typography 
                                                                                variant="body2" 
                                                                                sx={{ 
                                                                                    fontWeight: 600,
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    display: '-webkit-box',
                                                                                    WebkitLineClamp: 2,
                                                                                    WebkitBoxOrient: 'vertical'
                                                                                }}
                                                                            >
                                                                                {item.product.name}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                SL: {item.quantity}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                                                                                {formatCurrency(item.total)}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Collapse>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Cancel Order Confirmation Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>
                        Không
                    </Button>
                    <Button 
                        onClick={handleCancelOrder} 
                        color="error" 
                        variant="contained"
                    >
                        Hủy đơn hàng
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyOrdersPage;
