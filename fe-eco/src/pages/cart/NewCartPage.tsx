import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    Button,
    Box,
    IconButton,
    Divider,
    Chip,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    Add,
    Remove,
    DeleteOutline,
    ShoppingBag,
    ArrowBack,
    Home
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    updateCartItemAsync, 
    removeFromCartAsync, 
    clearCartAsync,
    fetchCart 
} from '../../redux/cart/cartSlice';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers';
import { toast } from 'react-toastify';

const CartPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state: any) => state.cart.items);
    const totalAmount = useSelector((state: any) => state.cart.totalAmount);
    const totalItems = useSelector((state: any) => state.cart.totalItems);
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
    const isSyncing = useSelector((state: any) => state.cart.isSyncing);

    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const shippingFee = 30000; // 30,000 VND

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            // Load cart from server when authenticated
            dispatch(fetchCart() as any);
        }
    }, [isAuthenticated, navigate, dispatch]);

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleQuantityChange = async (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveItem(productId);
            return;
        }
        
        // Update locally first for immediate feedback
        dispatch(updateQuantity({ productId, quantity: newQuantity }));
        
        // Then sync with server
        if (isAuthenticated) {
            try {
                await dispatch(updateCartItemAsync({ productId, quantity: newQuantity }) as any);
            } catch (error) {
                console.error('Failed to update cart on server:', error);
                // Local update already happened, so we don't need to revert unless there's a specific error
            }
        }
    };

    const handleRemoveItem = async (productId: string) => {
        // Remove locally first for immediate feedback
        dispatch(removeFromCart(productId));
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        
        // Then sync with server
        if (isAuthenticated) {
            try {
                await dispatch(removeFromCartAsync(productId) as any);
            } catch (error) {
                console.error('Failed to remove item from server:', error);
                // Local removal already happened
            }
        }
    };

    const handleClearCart = async () => {
        // Clear locally first for immediate feedback
        dispatch(clearCart());
        toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
        
        // Then sync with server
        if (isAuthenticated) {
            try {
                await dispatch(clearCartAsync() as any);
            } catch (error) {
                console.error('Failed to clear cart on server:', error);
                // Local clear already happened
            }
        }
    };

    const applyCoupon = () => {
        // Mock coupon logic
        if (couponCode === 'DISCOUNT10') {
            setDiscountAmount(totalAmount * 0.1);
            toast.success('Áp dụng mã giảm giá thành công!');
        } else if (couponCode) {
            toast.error('Mã giảm giá không hợp lệ');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const finalTotal = totalAmount + shippingFee - discountAmount;

    if (cartItems.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link 
                        component="button"
                        variant="body2"
                        onClick={() => navigate('/')}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                        <Home fontSize="small" />
                        Trang chủ
                    </Link>
                    <Typography color="text.primary">Giỏ hàng</Typography>
                </Breadcrumbs>

                <Box sx={{ py: 8 }}>
                    <ShoppingBag sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        Giỏ hàng của bạn đang trống
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/products')}
                        sx={{ px: 4 }}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link 
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                    <Home fontSize="small" />
                    Trang chủ
                </Link>
                <Typography color="text.primary">Giỏ hàng</Typography>
            </Breadcrumbs>

            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
                Giỏ hàng ({totalItems} sản phẩm)
            </Typography>

            <Grid container spacing={4}>
                {/* Cart Items */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                        <TableCell>Sản phẩm</TableCell>
                                        <TableCell align="center">Số lượng</TableCell>
                                        <TableCell align="center">Đơn giá</TableCell>
                                        <TableCell align="center">Thành tiền</TableCell>
                                        <TableCell align="center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cartItems.map((item: any) => {
                                        const itemPrice = item.salePrice || item.price;
                                        const itemTotal = itemPrice * item.quantity;
                                        
                                        return (
                                            <TableRow key={item.productId}>
                                                {/* Product Info */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box
                                                            component="img"
                                                            src={getProductImageUrl(item.image)}
                                                            alt={item.name}
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
                                                        <Box>
                                                            <Typography 
                                                                variant="subtitle1" 
                                                                sx={{ fontWeight: 600, mb: 0.5 }}
                                                            >
                                                                {item.name}
                                                            </Typography>
                                                            {item.salePrice && (
                                                                <Chip 
                                                                    label="Giảm giá" 
                                                                    size="small" 
                                                                    color="error" 
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Quantity Controls */}
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || isSyncing}
                                                        >
                                                            <Remove />
                                                        </IconButton>
                                                        <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                                                            {item.quantity}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                            disabled={item.quantity >= item.stock || isSyncing}
                                                        >
                                                            <Add />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>

                                                {/* Unit Price */}
                                                <TableCell align="center">
                                                    <Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {formatPrice(itemPrice)}
                                                        </Typography>
                                                        {item.salePrice && (
                                                            <Typography 
                                                                variant="body2" 
                                                                color="text.secondary"
                                                                sx={{ textDecoration: 'line-through' }}
                                                            >
                                                                {formatPrice(item.price)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>

                                                {/* Total Price */}
                                                <TableCell align="center">
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                        {formatPrice(itemTotal)}
                                                    </Typography>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell align="center">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleRemoveItem(item.productId)}
                                                    >
                                                        <DeleteOutline />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Cart Actions */}
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/products')}
                            >
                                Tiếp tục mua sắm
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteOutline />}
                                onClick={handleClearCart}
                            >
                                Xóa tất cả
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Order Summary */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Tóm tắt đơn hàng
                        </Typography>

                        {/* Coupon Code */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Mã giảm giá
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Nhập mã giảm giá"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    sx={{ flex: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={applyCoupon}
                                    disabled={!couponCode}
                                >
                                    Áp dụng
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Price Breakdown */}
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Tạm tính:</Typography>
                                <Typography>{formatPrice(totalAmount)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Phí vận chuyển:</Typography>
                                <Typography>{formatPrice(shippingFee)}</Typography>
                            </Box>
                            {discountAmount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="success.main">Giảm giá:</Typography>
                                    <Typography color="success.main">-{formatPrice(discountAmount)}</Typography>
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Tổng cộng:
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {formatPrice(finalTotal)}
                            </Typography>
                        </Box>

                        {/* Checkout Button */}
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={<ShoppingBag />}
                            onClick={handleCheckout}
                            sx={{
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none'
                            }}
                        >
                            Thanh toán
                        </Button>

                        {/* Security Note */}
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Thông tin thanh toán được mã hóa an toàn SSL
                            </Typography>
                        </Alert>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CartPage;
