import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    IconButton,
    Chip
} from '@mui/material';
import {
    ShoppingCart,
    Favorite,
    FavoriteBorder,
    Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cart/cartSlice';
import { toast } from 'react-toastify';

interface Product {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
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
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!isAuthenticated) {
            toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            navigate('/login');
            return;
        }

        if (product.stock <= 0) {
            toast.error('Sản phẩm đã hết hàng');
            return;
        }

        const cartItem = {
            id: `cart-${product.id}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice,
            image: product.images[0] || '',
            quantity: 1,
            stock: product.stock,
            slug: product.slug
        };

        dispatch(addToCart(cartItem));
        toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
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

    const discountPercentage = product.salePrice 
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
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
                    image={product.images[0] || '/images/placeholder-product.svg'}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
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
                        <Visibility />
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
                            {formatPrice(product.salePrice || product.price)}
                        </Typography>
                        {product.salePrice && (
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
                        startIcon={<ShoppingCart />}
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
