import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Rating,
  Chip,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  Avatar,
  IconButton,
  TextField,
  Breadcrumbs,
  Link,
  Paper,
  Dialog,
  DialogContent,
  Backdrop,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Add,
  Remove,
  Close,
  ZoomIn,
  ZoomOut,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  FacebookShareButton,
  FacebookIcon,
} from 'react-share';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers';
import { callGetProductBySlug } from '../../services/apiProducts/apiProducts';
import { addToCart, addToCartAsync, fetchCart } from '../../redux/cart/cartSlice';
import { Product } from '../../types/product';

const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  cursor: 'pointer',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const ThumbnailImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '80px',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  border: '2px solid transparent',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    border: `2px solid ${theme.palette.primary.main}`,
    transform: 'scale(1.1)',
  },
  '&.selected': {
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

const ImageGalleryModal = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: '#fff',
}));

const ReviewCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface ProductDetailPageProps {
  pageProps?: {
    product?: any;
    error?: string;
  };
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux selectors
  const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
  const cartItems = useSelector((state: any) => state.cart.items);
  const isSyncing = useSelector((state: any) => state.cart.isSyncing);

  // State management
  const [product, setProduct] = useState<Product | null>( null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Image gallery states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart() as any);
    }
  }, [isAuthenticated, dispatch]);

  // Fetch product data from API nếu không có SSR product
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError('');
        const response = await callGetProductBySlug(slug);
        if ((response as any)?.statusCode === 200 && (response as any)?.data) {
          const productData = (response as any).data;
          
          const transformedProduct = {
            ...productData,
            price: parseFloat(productData.price) || 0,
            salePrice: productData.sale_price ? parseFloat(productData.sale_price) : undefined,
            images: productData.images && productData.images.length > 0 
              ? productData.images.map((imageName: string) => getProductImageUrl(imageName))
              : [getProductImageUrl(productData.image)],
            image: getProductImageUrl(productData.image),
            category: productData.category || { name: 'N/A', slug: 'na' },
            reviews: productData.reviews?.map((review: any) => ({
              ...review,
              user: {
                ...review.user,
                name: review.user?.name || 'Anonymous User'
              }
            })) || [],
            reviewCount: productData.reviews?.length || 0,
            rating: productData.reviews?.length > 0 
              ? productData.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / productData.reviews.length
              : 0,
            features: productData.features || (productData.description ? 
              [
                'Thiết kế hiện đại và sang trọng',
                'Chất lượng cao, độ bền tốt',
                'Công nghệ tiên tiến',
                'Dễ dàng sử dụng',
                'Bảo hành chính hãng'
              ] : []),
            specifications: productData.specifications || {
              'Thương hiệu': productData.brand || 'N/A',
              'Danh mục': productData.category?.name || 'N/A',
              'Trọng lượng': productData.weight ? `${productData.weight}g` : 'N/A',
              'Kích thước': productData.dimensions || 'N/A',
              'Mã sản phẩm (SKU)': productData.sku || 'N/A',
              'Tình trạng': (productData.stock || 0) > 0 ? 'Còn hàng' : 'Hết hàng',
              'Số lượng trong kho': productData.stock ? `${productData.stock} sản phẩm` : 'N/A'
            },
            metaTitle: productData.meta_title || `${productData.name} | ECom`,
            metaDescription: productData.meta_description || 
              `Mua ${productData.name} với giá tốt nhất. ${productData.description || ''}`.slice(0, 160),
            metaKeywords: productData.meta_keywords || 
              `${productData.name}, ${productData.category?.name || ''}, ${productData.brand || ''}, mua online`.toLowerCase(),
            createdAt: productData.createAt,
            updatedAt: productData.updateAt,
            fullDescription: productData.fullDescription || productData.description
          };
          setProduct(transformedProduct);
        } else {
          setError('Không tìm thấy sản phẩm');
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const getPageUrl = () => {
    if(typeof window !== 'undefined') {
      return window.location.href;
    }
    const baseUrl = import.meta.env.VITE_APP_URL || "https://fe-eco.onrender.com";
    return `${baseUrl}/product/${slug}`;
  }

  
  // Check if product is already in cart
  const existingCartItem = cartItems.find((item: any) => item.productId === product?.id);
  const cartQuantity = existingCartItem ? existingCartItem.quantity : 0;
  const maxQuantity = product?.stock ? Math.max(0, product.stock - cartQuantity) : 0;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      toast.error('Không thể thêm sản phẩm vào giỏ hàng!');
      return;
    }
    
    if (!product.stock || product.stock <= 0) {
      toast.error('Sản phẩm hiện đã hết hàng!');
      return;
    }
    
    if (quantity > maxQuantity) {
      toast.error(`Chỉ còn ${maxQuantity} sản phẩm có thể thêm vào giỏ hàng (đã có ${cartQuantity} trong giỏ)!`);
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
        salePrice: product.salePrice,
        image: product.images?.[0] || product.image || PLACEHOLDER_IMAGE,
        quantity: quantity,
        stock: product.stock,
        slug: product.slug || slug || ''
      };
      
      // Try to add to server first
      const result = await dispatch(addToCartAsync({
        productId: product.id,
        quantity: quantity,
        productData: cartItem
      }) as any);
      
      if (addToCartAsync.fulfilled.match(result)) {
        toast.success(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
        setQuantity(1);
      } else {
        // Fallback to local storage if API fails
        dispatch(addToCart(cartItem));
        toast.success(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
        setQuantity(1);
      }
      
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      
      // Fallback to local cart
      const cartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images?.[0] || product.image || PLACEHOLDER_IMAGE,
        quantity: quantity,
        stock: product.stock,
        slug: product.slug || slug || ''
      };
      
      dispatch(addToCart(cartItem));
      toast.success(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
      setQuantity(1);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) {
      toast.error('Không thể mua sản phẩm!');
      return;
    }
    
    if (!product.stock || product.stock <= 0) {
      toast.error('Sản phẩm hiện đã hết hàng!');
      return;
    }
    
    if (quantity > maxQuantity) {
      toast.error(`Chỉ còn ${maxQuantity} sản phẩm có thể thêm vào giỏ hàng (đã có ${cartQuantity} trong giỏ)!`);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để mua sản phẩm');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Add to cart first
      const cartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images?.[0] || product.image || PLACEHOLDER_IMAGE,
        quantity: quantity,
        stock: product.stock,
        slug: product.slug || slug || ''
      };
      
      dispatch(addToCart(cartItem));
      toast.success(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
      
      // Navigate to checkout
      setTimeout(() => {
        navigate('/checkout');
      }, 500); // Small delay to show success message
      
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đánh giá sản phẩm');
      navigate('/login');
      return;
    }
    
    if (newReview.comment.trim()) {
      // Submit review logic
      toast.success('Đánh giá đã được gửi thành công!');
      setNewReview({ rating: 5, comment: '' });
    } else {
      toast.error('Vui lòng nhập nội dung đánh giá');
    }
  };

  // Image gallery functions
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageGalleryOpen(true);
    setImageZoom(1);
  };

  const handlePrevImage = () => {
    if (product?.images && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (product?.images && selectedImageIndex < product.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="h6">Đang tải sản phẩm...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="error">
          Có lỗi xảy ra
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products')}
          >
            Trở về danh sách sản phẩm
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Không tìm thấy sản phẩm
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Sản phẩm với slug "{slug}" không tồn tại hoặc đã bị xóa.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/products')}
        >
          Trở về danh sách sản phẩm
        </Button>
      </Container>
    );
  }


  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/">Trang chủ</Link>
          <Link color="inherit" href="/products">Sản phẩm</Link>
          {product.category && (
            <Link 
              color="inherit" 
              href={`/category/${typeof product.category === 'string' ? product.category.toLowerCase() : product.category?.slug || ''}`}
            >
              {typeof product.category === 'string' ? product.category : product.category?.name || 'Danh mục'}
            </Link>
          )}
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <ProductImage 
                src={product.images?.[selectedImageIndex] || product.image} 
                alt={product.name} 
                onClick={() => handleImageClick(selectedImageIndex)}
                onError={(e: any) => {
                  if (e.target.src !== PLACEHOLDER_IMAGE) {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }
                }}
              />
            </Box>
            {product.images && product.images.length > 1 && (
              <Grid container spacing={1}>
                {product.images.map((image: string, index: number) => (
                  <Grid item xs={3} key={index}>
                    <ThumbnailImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className={selectedImageIndex === index ? 'selected' : ''}
                      onClick={() => handleThumbnailClick(index)}
                      onError={(e: any) => {
                        if (e.target.src !== PLACEHOLDER_IMAGE) {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
              <Chip label={typeof product.category === 'string' ? product.category : product.category?.name || 'Category'} color="primary" size="small" />
              <Chip label={product.brand || 'Brand'} variant="outlined" size="small" />
            </Box>

            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.rating || 0} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.reviewCount || 0} đánh giá)
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            {/* Price */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              {product.salePrice ? (
                <>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice)}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ textDecoration: 'line-through' }}
                    color="text.secondary"
                  >
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </Typography>
                  <Chip 
                    label={`Tiết kiệm ${Math.round(((product.price - product.salePrice) / product.price) * 100)}%`}
                    color="success"
                    size="small"
                  />
                </>
              ) : (
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </Typography>
              )}
            </Box>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              {(product.stock || 0) > 0 ? (
                <Chip 
                  label={`${product.stock} có sẵn`} 
                  color="success" 
                  variant="outlined"
                />
              ) : (
                <Chip label="Hết hàng" color="error" />
              )}
            </Box>

            {/* Quantity Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1">Số lượng:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <Typography sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.stock || 0)}
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={addingToCart || isSyncing ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock === 0 || addingToCart || isSyncing}
                sx={{ flex: 1 }}
              >
                {addingToCart || isSyncing ? 'Đang thêm...' : (!product.stock || product.stock === 0) ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </Button>
              {product.stock && product.stock > 0 && (
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ flex: 1 }}
                  disabled={addingToCart || isSyncing}
                  onClick={handleBuyNow}
                >
                  Mua ngay
                </Button>
              )}
              <IconButton 
                onClick={() => setIsFavorite(!isFavorite)}
                color={isFavorite ? 'error' : 'default'}
                sx={{ border: '1px solid #ddd' }}
                title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>

            {/* Share Buttons */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2">
                  Chia sẻ sản phẩm này:
                </Typography>
                <FacebookShareButton url={getPageUrl()} hashtag="#EComStore">
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
              </Box>
            </Paper>

            {/* Product Features */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Tính năng nổi bật:
              </Typography>
              {product.features && product.features.length > 0 ? (
                product.features.map((feature: string, index: number) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    • {feature}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Thông tin tính năng sẽ được cập nhật sớm.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Product Details Tabs */}
        <Box sx={{ mt: 6 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="Mô tả sản phẩm" />
            <Tab label="Thông số kỹ thuật" />
            <Tab label={`Đánh giá (${product.reviewCount || 0})`} />
          </Tabs>

          <TabPanel value={selectedTab} index={0}>
            <div dangerouslySetInnerHTML={{ __html: product.fullDescription || product.description }} />
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <Grid container spacing={2}>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography fontWeight="medium">{key}:</Typography>
                      <Typography color="text.secondary">{value}</Typography>
                    </Box>
                    <Divider />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Thông số kỹ thuật sẽ được cập nhật sớm.
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={selectedTab} index={2}>
            {/* Write Review */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Viết đánh giá
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Đánh giá</Typography>
                  <Rating
                    value={newReview.rating}
                    onChange={(_, value) => setNewReview(prev => ({ ...prev, rating: value || 5 }))}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" onClick={handleSubmitReview}>
                  Gửi đánh giá
                </Button>
              </CardContent>
            </Card>

            {/* Reviews List */}
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <ReviewCard key={review.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar src={review.user?.avatar} alt={review.user?.name}>
                        {review.user?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography fontWeight="medium">{review.user?.name || 'Anonymous'}</Typography>
                          {review.verified && (
                            <Chip label="Verified Purchase" color="success" size="small" />
                          )}
                        </Box>
                        <Rating value={review.rating} size="small" readOnly sx={{ mb: 1 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {review.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createAt || review.createdAt || new Date()).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </ReviewCard>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Chưa có đánh giá nào cho sản phẩm này.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hãy là người đầu tiên đánh giá sản phẩm!
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Box>

        {/* Image Gallery Modal */}
        <ImageGalleryModal
          open={imageGalleryOpen}
          onClose={() => setImageGalleryOpen(false)}
          maxWidth={false}
          fullWidth
        >
          <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Close Button */}
            <IconButton
              onClick={() => setImageGalleryOpen(false)}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }
              }}
            >
              <Close />
            </IconButton>

            {/* Navigation Buttons */}
            {product?.images && product.images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImage}
                  disabled={selectedImageIndex === 0}
                  sx={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  disabled={selectedImageIndex === (product.images.length - 1)}
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </>
            )}

            {/* Zoom Controls */}
            <Box sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              zIndex: 1000
            }}>
              <IconButton
                onClick={handleZoomOut}
                disabled={imageZoom <= 0.5}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  }
                }}
              >
                <ZoomOut />
              </IconButton>
              <Typography sx={{ color: 'white', alignSelf: 'center', minWidth: 60, textAlign: 'center' }}>
                {Math.round(imageZoom * 100)}%
              </Typography>
              <IconButton
                onClick={handleZoomIn}
                disabled={imageZoom >= 3}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  }
                }}
              >
                <ZoomIn />
              </IconButton>
            </Box>

            {/* Main Image */}
            <Box
              component="img"
              src={product?.images?.[selectedImageIndex] || product?.image}
              alt={product?.name || 'Product'}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `scale(${imageZoom})`,
                transition: 'transform 0.3s ease-in-out',
                cursor: imageZoom > 1 ? 'grab' : 'default'
              }}
              onError={(e: any) => {
                if (e.target.src !== PLACEHOLDER_IMAGE) {
                  e.target.src = PLACEHOLDER_IMAGE;
                }
              }}
            />

            {/* Image Counter */}
            {product?.images && product.images.length > 1 && (
              <Box sx={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '4px 12px',
                borderRadius: 1,
                fontSize: '14px'
              }}>
                {selectedImageIndex + 1} / {product.images.length}
              </Box>
            )}
          </DialogContent>
        </ImageGalleryModal>

        {/* Loading Overlay */}
        <LoadingOverlay open={addingToCart}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress color="inherit" />
            <Typography variant="h6">Đang thêm vào giỏ hàng...</Typography>
          </Box>
        </LoadingOverlay>
      </Container>
    </>
  );
};

export async function getServerData(context: any) {
  try {
    const { slug } = context.params;
    const response = await callGetProductBySlug(slug);
    
    if ((response as any)?.statusCode === 200 && (response as any)?.data) {
      const productData = (response as any).data;
      
      const transformedProduct = {
        ...productData,
        price: parseFloat(productData.price) || 0,
        salePrice: productData.sale_price ? parseFloat(productData.sale_price) : undefined,
        images: productData.images && productData.images.length > 0 
          ? productData.images.map((imageName: string) => getProductImageUrl(imageName))
          : [getProductImageUrl(productData.image)],
        image: getProductImageUrl(productData.image),
        category: productData.category || { name: 'N/A', slug: 'na' },
        reviews: productData.reviews?.map((review: any) => ({
          ...review,
          user: {
            ...review.user,
            name: review.user?.name || 'Anonymous User'
          }
        })) || [],
        reviewCount: productData.reviews?.length || 0,
        rating: productData.reviews?.length > 0 
          ? productData.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / productData.reviews.length
          : 0,
        features: productData.features || [],
        specifications: productData.specifications || {
          'Thương hiệu': productData.brand || 'N/A',
          'Danh mục': productData.category?.name || 'N/A',
        }
      };

      return {
        props: {
          product: transformedProduct,
          error: null
        }
      };
    }

    return {
      props: {
        product: null,
        error: 'Product not found'
      }
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      props: {
        product: null,
        error: 'Failed to fetch product'
      }
    };
  }
}

export default ProductDetailPage;