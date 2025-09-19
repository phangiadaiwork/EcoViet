import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    IconButton,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    AddShoppingCart,
    FavoriteBorder,
    Favorite,
    RemoveRedEye
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToCartAsync } from '../../redux/cart/cartSlice';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers';
import { toast } from 'react-toastify';

interface Product {
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    images: string[];
    slug: string;
    stock: number;
    category: {
        id: string;
        name: string;
    };
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isWishlist, setIsWishlist] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Redux selectors
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
    const cartItems = useSelector((state: any) => state.cart.items);
    const isSyncing = useSelector((state: any) => state.cart.isSyncing);

    // Check if product is already in cart
    const existingCartItem = cartItems.find((item: any) => item.productId === product.id);
    const cartQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const maxQuantity = product.stock ? Math.max(0, product.stock - cartQuantity) : 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!product.stock || product.stock <= 0) {
            toast.error('Sản phẩm đã hết hàng');
            return;
        }

        if (maxQuantity <= 0) {
            toast.error(`Sản phẩm đã có ${cartQuantity} trong giỏ hàng`);
            return;
        }

        // Check if user is authenticated
        if (!isAuthenticated) {
            toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            navigate('/login');
            return;
        }

        try {
            setAddingToCart(true);
            
            // Create cart item data
            const cartItem = {
                id: `${product.id}-${Date.now()}`,
                productId: product.id,
                name: product.name,
                price: product.price,
                salePrice: product.sale_price,
                image: product.images?.[0] ? getProductImageUrl(product.images[0]) : PLACEHOLDER_IMAGE,
                quantity: 1,
                stock: product.stock,
                slug: product.slug
            };
            
            // Try to add to server first
            const result = await dispatch(addToCartAsync({
                productId: product.id,
                quantity: 1,
                productData: cartItem
            }) as any);
            
            if (addToCartAsync.fulfilled.match(result)) {
                toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
            } else {
                // Fallback to local storage if API fails
                dispatch(addToCart(cartItem));
                toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
            }
            
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            
            // Fallback to local cart
            const cartItem = {
                id: `${product.id}-${Date.now()}`,
                productId: product.id,
                name: product.name,
                price: product.price,
                salePrice: product.sale_price,
                image: product.images?.[0] ? getProductImageUrl(product.images[0]) : PLACEHOLDER_IMAGE,
                quantity: 1,
                stock: product.stock,
                slug: product.slug
            };
            
            dispatch(addToCart(cartItem));
            toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsWishlist(!isWishlist);
        toast.success(isWishlist ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
    };

    const handleViewProduct = () => {
        navigate(`/products/${product.slug}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const discountPercentage = product.sale_price 
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;


    return (
        <Card 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                },
                position: 'relative'
            }}
            onClick={handleViewProduct}
        >
            {/* Product Image */}
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={getProductImageUrl(product.images?.[0])}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== PLACEHOLDER_IMAGE) {
                            target.src = PLACEHOLDER_IMAGE;
                        }
                    }}
                />
                
                {/* Discount Badge */}
                {discountPercentage > 0 && (
                    <Chip
                        label={`-${discountPercentage}%`}
                        color="error"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 600
                        }}
                    />
                )}

                {/* Stock Status */}
                {product.stock <= 0 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Chip
                            label="Hết hàng"
                            color="error"
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>
                )}

                {/* Action Icons */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={handleWishlistToggle}
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)'
                            }
                        }}
                    >
                        {isWishlist ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                    
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct();
                        }}
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)'
                            }
                        }}
                    >
                        <RemoveRedEye />
                    </IconButton>
                </Box>
            </Box>

            {/* Product Info */}
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 1, fontSize: '0.75rem' }}
                >
                    {product.category.name}
                </Typography>
                
                <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                        mb: 2, 
                        fontWeight: 600,
                        fontSize: '1rem',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {product.name}
                </Typography>

                {/* Price */}
                <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography 
                            variant="h6" 
                            color="primary" 
                            sx={{ fontWeight: 700 }}
                        >
                            {formatPrice(product.sale_price || product.price)}
                        </Typography>
                        {product.sale_price && (
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ textDecoration: 'line-through' }}
                            >
                                {formatPrice(product.price)}
                            </Typography>
                        )}
                    </Box>

                    {/* Add to Cart Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={addingToCart || isSyncing ? <CircularProgress size={16} color="inherit" /> : <AddShoppingCart />}
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0 || maxQuantity <= 0 || addingToCart || isSyncing}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {addingToCart || isSyncing ? 'Đang thêm...' : 
                         product.stock <= 0 ? 'Hết hàng' : 
                         maxQuantity <= 0 ? 'Đã có trong giỏ' : 'Thêm vào giỏ'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
