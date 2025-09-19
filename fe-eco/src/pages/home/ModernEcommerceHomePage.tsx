import { useState, useEffect } from 'react';
import '../../styles/modernHomeText.css';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Paper,
    Rating,
    Chip,
    Skeleton,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    ArrowForward,
    LocalShipping,
    Security,
    Support,
    Verified,
    Storefront
} from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { callGetHomePageData, callGetFeaturedProducts, callGetFeaturedCategories } from '../../services/apiEcommerce/apiHome';

// Types
interface Product {
    id: number | string;
    name: string;
    price: number;
    image: string;
    rating: number;
    category?: string;
    slug?: string;
}

interface Category {
    id: number | string;
    name: string;
    image: string;
    slug?: string;
    productCount?: number;
}





const ModernEcommerceHomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadHomeData();
    }, []);

    const loadHomeData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await callGetHomePageData();
            
            if (response?.data?.success) {
                setFeaturedProducts(response.data.featuredProducts || []);
                setFeaturedCategories(response.data.featuredCategories || []);
                
            } else {
                throw new Error('API response không hợp lệ');
            }
        } catch (err: any) {
            // Try individual API calls as fallback
            setError('Đang thử kết nối lại API...');
            
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    callGetFeaturedProducts(4),
                    callGetFeaturedCategories(4)
                ]);
                
                if (productsResponse?.data && categoriesResponse?.data) {
                    setFeaturedProducts(productsResponse.data || []);
                    setFeaturedCategories(categoriesResponse.data || []);
                    setError(null);
                    return;
                }
            } catch (fallbackError) {
                console.error('❌ Fallback API calls also failed:', fallbackError);
            }
            
            // Set error message - no mock data fallback
            setError('Không thể tải dữ liệu từ server. Vui lòng thử lại sau.');
            setFeaturedProducts([]);
            setFeaturedCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const heroSlides = [
        {
            title: 'Khuyến mãi đặc biệt',
            subtitle: 'Giảm giá lên đến 70% cho tất cả sản phẩm',
            description: 'Cơ hội mua sắm tuyệt vời với hàng ngàn sản phẩm chất lượng cao',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
            buttonText: 'Mua ngay',
            buttonAction: () => navigate('/products'),
            bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'Sản phẩm mới nhất',
            subtitle: 'Khám phá những xu hướng công nghệ mới',
            description: 'Bộ sưu tập mới với thiết kế hiện đại và công nghệ tiên tiến',
            image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop',
            buttonText: 'Khám phá',
            buttonAction: () => navigate('/categories'),
            bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            title: 'Miễn phí vận chuyển',
            subtitle: 'Cho đơn hàng từ 500.000đ',
            description: 'Giao hàng nhanh chóng trong vòng 24h tại TP.HCM và Hà Nội',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
            buttonText: 'Tìm hiểu thêm',
            buttonAction: () => navigate('/shipping-info'),
            bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }
    ];

    const features = [
        {
            icon: <LocalShipping sx={{ fontSize: 40 }} />,
            title: "Miễn phí vận chuyển",
            description: "Cho đơn hàng trên 500.000đ"
        },
        {
            icon: <Security sx={{ fontSize: 40 }} />,
            title: "Thanh toán bảo mật",
            description: "100% an toàn và đáng tin cậy"
        },
        {
            icon: <Support sx={{ fontSize: 40 }} />,
            title: "Hỗ trợ 24/7",
            description: "Luôn sẵn sàng hỗ trợ bạn"
        },
        {
            icon: <Verified sx={{ fontSize: 40 }} />,
            title: "Chất lượng đảm bảo",
            description: "Sản phẩm chính hãng 100%"
        }
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <Box>
            {/* Error Alert */}
            {error && (
                <Container maxWidth="lg" sx={{ mb: 2 }}>
                    <Alert 
                        severity="warning" 
                        action={
                            <Button 
                                color="inherit" 
                                size="small" 
                                onClick={loadHomeData}
                                sx={{ ml: 1 }}
                            >
                                Thử lại
                            </Button>
                        }
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                </Container>
            )}

            {/* Hero Slider */}
            <Box sx={{ mb: 6 }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000 }}
                    loop
                    style={{ height: '500px' }}
                >
                    {heroSlides.map((slide, index) => (
                        <SwiperSlide key={index}>
                            <Box
                                sx={{
                                    height: '100%',
                                    background: slide.bgGradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Background Image */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundImage: `url(${slide.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        opacity: 0.3,
                                        zIndex: 1
                                    }}
                                />
                                
                                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                                    <Grid container spacing={4} alignItems="center">
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                                                <Typography
                                                    variant="h2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        mb: 2,
                                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                                        lineHeight: 1.2,
                                                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    {slide.title}
                                                </Typography>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        mb: 2,
                                                        fontWeight: 400,
                                                        fontSize: { xs: '1.2rem', md: '1.5rem' },
                                                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    {slide.subtitle}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 4,
                                                        fontSize: '1.1rem',
                                                        opacity: 0.9,
                                                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    {slide.description}
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    onClick={slide.buttonAction}
                                                    sx={{
                                                        px: 4,
                                                        py: 1.5,
                                                        fontSize: '1.1rem',
                                                        fontWeight: 600,
                                                        borderRadius: 2,
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        color: 'primary.main',
                                                        backdropFilter: 'blur(10px)',
                                                        '&:hover': {
                                                            background: 'rgba(255, 255, 255, 1)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                                        },
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    endIcon={<ArrowForward />}
                                                >
                                                    {slide.buttonText}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Container>
                            </Box>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Grid container spacing={3}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        color: 'primary.main',
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {feature.icon}
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Featured Categories */}
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                        Danh mục nổi bật
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Khám phá các sản phẩm hot nhất từ những danh mục được yêu thích
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                                <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
                            </Grid>
                        ))
                    ) : (
                        featuredCategories.map((category: any) => (
                            <Grid item xs={12} sm={6} md={3} key={category.id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        '&zzz:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 15px 40px rgba(0,0,0,0.12)'
                                        }
                                    }}
                                    onClick={() => navigate(`/products?category=${category.slug || category.id}`)}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={`${import.meta.env.VITE_BACKEND_URL}/images/${category.image}` || 'https://via.placeholder.com/200'}
                                        alt={category.name}
                                        sx={{
                                            transition: 'transform 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    />
                                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                        <Box sx={{ mb: 2 }}>
                                            <Storefront sx={{ fontSize: 40, color: 'primary.main' }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {category.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>

            {/* Featured Products */}
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                            Sản phẩm nổi bật
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Những sản phẩm được khách hàng yêu thích nhất
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        onClick={() => navigate('/products')}
                        sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600
                        }}
                    >
                        Xem tất cả
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
                                <Skeleton variant="text" height={30} sx={{ mt: 1 }} />
                                <Skeleton variant="text" height={25} />
                                <Skeleton variant="text" height={25} />
                            </Grid>
                        ))
                    ) : (
                        featuredProducts.map((product: any) => (
                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 15px 40px rgba(0,0,0,0.12)'
                                        }
                                    }}
                                    onClick={() => navigate(`/products/${product.slug || product.id}`)}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={`${import.meta.env.VITE_BACKEND_URL}/images/${product.image}` || 'https://via.placeholder.com/250'}

                                            alt={product.name}
                                            sx={{
                                                transition: 'transform 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                        <Chip
                                            label="Hot"
                                            color="error"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                left: 10,
                                                fontWeight: 600
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                mb: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {product.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Rating value={product.rating} readOnly size="small" />
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                ({product.rating})
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: 'primary.main',
                                                fontWeight: 700
                                            }}
                                        >
                                            {formatPrice(product.price)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>


            {/* Vì Sao Chọn ECom? */}
            <div className="modern-home-section">
                <h2>Vì Sao Chọn ECom?</h2>
                <p>Chúng tôi mang đến nhiều giá trị vượt trội cho khách hàng và đối tác</p>
                <ul>
                    <li><b>Đa dạng sản phẩm:</b> Hàng ngàn sản phẩm thuộc nhiều ngành hàng khác nhau, từ điện tử, gia dụng, thời trang đến sức khỏe và làm đẹp. ECom luôn cập nhật xu hướng mới nhất để đáp ứng mọi nhu cầu của bạn.</li>
                    <li><b>Dịch vụ khách hàng tận tâm:</b> Đội ngũ CSKH chuyên nghiệp, hỗ trợ 24/7 qua nhiều kênh: hotline, email, chat trực tuyến. Chúng tôi luôn lắng nghe và giải quyết mọi thắc mắc của khách hàng nhanh chóng, hiệu quả.</li>
                    <li><b>Ưu đãi & bảo mật:</b> Nhiều chương trình khuyến mãi hấp dẫn, tích điểm đổi quà, miễn phí vận chuyển và chính sách bảo mật thông tin cá nhân nghiêm ngặt, giúp bạn yên tâm mua sắm mỗi ngày.</li>
                </ul>
            </div>

            {/* Quy Trình Mua Sắm Đơn Giản */}
            <div className="modern-home-section">
                <h2>Quy Trình Mua Sắm Đơn Giản</h2>
                <p>Chỉ với 4 bước, bạn đã có thể sở hữu sản phẩm yêu thích trên ECom:</p>
                <ol>
                    <li>Đăng ký/Đăng nhập: Tạo tài khoản hoặc đăng nhập để bắt đầu mua sắm và nhận ưu đãi thành viên.</li>
                    <li>Chọn sản phẩm: Duyệt danh mục, tìm kiếm sản phẩm phù hợp và thêm vào giỏ hàng.</li>
                    <li>Thanh toán an toàn: Chọn phương thức thanh toán phù hợp, nhập thông tin và xác nhận đơn hàng.</li>
                    <li>Nhận hàng & đánh giá: Đơn hàng sẽ được giao tận nơi. Đừng quên đánh giá sản phẩm để nhận thêm ưu đãi!</li>
                </ol>
            </div>

            {/* Về ECom */}
            <div className="modern-home-section">
                <h2>Về ECom</h2>
                <h3>Đổi mới trải nghiệm mua sắm trực tuyến tại Việt Nam</h3>
                <p>ECom là nền tảng thương mại điện tử hiện đại, kết nối hàng triệu khách hàng với các sản phẩm chất lượng cao và dịch vụ tận tâm. Chúng tôi không chỉ cung cấp hàng ngàn sản phẩm đa dạng từ các thương hiệu uy tín mà còn mang đến trải nghiệm mua sắm an toàn, tiện lợi và minh bạch.</p>
                <p><b>Sứ mệnh</b> của ECom là tạo ra một hệ sinh thái thương mại số bền vững, nơi khách hàng được phục vụ tận tâm và các nhà bán hàng được hỗ trợ phát triển lâu dài. Chúng tôi cam kết đổi mới liên tục, ứng dụng công nghệ tiên tiến để nâng cao chất lượng dịch vụ và tối ưu hóa trải nghiệm người dùng.</p>
                <p><b>Giá trị cốt lõi</b> của chúng tôi là: <b>Khách hàng là trung tâm</b>, <b>Chính trực</b>, <b>Đổi mới</b> và <b>Hợp tác phát triển</b>. Đội ngũ ECom luôn lắng nghe, thấu hiểu và đồng hành cùng khách hàng trên hành trình mua sắm trực tuyến.</p>
                <p>Hãy khám phá ECom ngay hôm nay để tận hưởng ưu đãi hấp dẫn, dịch vụ chuyên nghiệp và trải nghiệm mua sắm tuyệt vời mỗi ngày!</p>
            </div>

            {/* Khách Hàng Nói Gì Về ECom */}
            <div className="modern-home-section">
                <h2>Khách Hàng Nói Gì Về ECom</h2>
                <ul>
                    <li>“Tôi rất hài lòng với dịch vụ giao hàng nhanh và sản phẩm chất lượng của ECom. Đội ngũ CSKH hỗ trợ rất nhiệt tình!”<br /><b>Nguyễn Thị Lan</b> - Khách hàng Hà Nội</li>
                    <li>“ECom có nhiều chương trình ưu đãi hấp dẫn, sản phẩm đa dạng và giá cả hợp lý. Tôi sẽ tiếp tục ủng hộ!”<br /><b>Trần Văn Minh</b> - Khách hàng TP.HCM</li>
                    <li>“Tôi đánh giá cao chính sách bảo mật và đổi trả của ECom. Mua sắm online chưa bao giờ dễ dàng và an tâm đến vậy!”<br /><b>Lê Hoàng Yến</b> - Khách hàng Đà Nẵng</li>
                </ul>
            </div>

            {/* Tin Tức & Góc Chia Sẻ */}
            <div className="modern-home-section">
                <h2>Tin Tức & Góc Chia Sẻ</h2>
                <ul>
                    <li><b>Top 5 xu hướng công nghệ 2025:</b> Khám phá những sản phẩm công nghệ mới nhất, từ điện thoại gập, AI cá nhân hóa đến thiết bị nhà thông minh giúp cuộc sống tiện nghi hơn. <i>Đăng ngày 20/07/2025</i></li>
                    <li><b>Bí quyết mua sắm tiết kiệm:</b> Hướng dẫn săn deal, sử dụng mã giảm giá và tận dụng ưu đãi thành viên để tối ưu hóa chi phí mua sắm trên ECom. <i>Đăng ngày 15/07/2025</i></li>
                    <li><b>Chia sẻ từ khách hàng thân thiết:</b> Những câu chuyện thực tế về trải nghiệm mua sắm, đổi trả và nhận ưu đãi từ cộng đồng ECom trên toàn quốc. <i>Đăng ngày 10/07/2025</i></li>
                </ul>
            </div>

            {/* Cam Kết Của Chúng Tôi */}
            <div className="modern-home-section">
                <h2>Cam Kết Của Chúng Tôi</h2>
                <ul>
                    <li><b>Chất lượng sản phẩm:</b> Tất cả sản phẩm trên ECom đều được kiểm duyệt kỹ lưỡng, có nguồn gốc rõ ràng và bảo hành chính hãng. Chúng tôi nói không với hàng giả, hàng nhái.</li>
                    <li><b>Bảo vệ quyền lợi khách hàng:</b> Chính sách đổi trả minh bạch, hoàn tiền nhanh chóng, hỗ trợ giải quyết khiếu nại công bằng và tận tâm.</li>
                    <li><b>Bảo mật thông tin:</b> ECom cam kết bảo mật tuyệt đối thông tin cá nhân, giao dịch và dữ liệu khách hàng theo tiêu chuẩn quốc tế.</li>
                    <li><b>Hỗ trợ tận tâm:</b> Đội ngũ CSKH luôn sẵn sàng lắng nghe, tư vấn và đồng hành cùng khách hàng trong suốt quá trình mua sắm và sử dụng sản phẩm.</li>
                </ul>
            </div>

            {/* Cộng Đồng & Trách Nhiệm Xã Hội */}
            <div className="modern-home-section">
                <h2>Cộng Đồng & Trách Nhiệm Xã Hội</h2>
                <p>Chúng tôi tích cực tham gia các hoạt động thiện nguyện, bảo vệ môi trường và hỗ trợ cộng đồng khó khăn trên khắp cả nước. ECom tin rằng sự phát triển bền vững phải gắn liền với trách nhiệm xã hội.</p>
                <p>Mỗi đơn hàng của bạn không chỉ mang lại giá trị cho bản thân mà còn góp phần vào các chương trình "ECom vì cộng đồng" như tặng quà cho trẻ em vùng cao, trồng cây xanh, hỗ trợ thiên tai...</p>
                <p>Hãy cùng ECom lan tỏa yêu thương và xây dựng một xã hội tốt đẹp hơn qua từng hành động nhỏ mỗi ngày!</p>
            </div>
            {/* Câu Hỏi Thường Gặp */}
            <div className="modern-home-section">
                <h2>Câu Hỏi Thường Gặp</h2>
                <ol>
                    <li><b>Làm thế nào để đặt hàng trên ECom?</b><br />Bạn chỉ cần chọn sản phẩm yêu thích, thêm vào giỏ hàng và tiến hành thanh toán theo hướng dẫn. Đội ngũ của chúng tôi sẽ xử lý đơn hàng và giao đến tận nơi cho bạn trên toàn quốc.</li>
                    <li><b>Tôi có thể đổi trả sản phẩm không?</b><br />ECom hỗ trợ đổi trả trong vòng 7 ngày kể từ khi nhận hàng đối với các sản phẩm đáp ứng điều kiện đổi trả. Vui lòng liên hệ bộ phận CSKH để được hướng dẫn chi tiết và hỗ trợ nhanh chóng.</li>
                    <li><b>Phương thức thanh toán nào được chấp nhận?</b><br />Chúng tôi chấp nhận thanh toán qua thẻ tín dụng, chuyển khoản ngân hàng, ví điện tử, QR code và thanh toán khi nhận hàng (COD).</li>
                    <li><b>Thời gian giao hàng dự kiến là bao lâu?</b><br />Thông thường, đơn hàng sẽ được giao trong vòng 1-3 ngày làm việc tại các thành phố lớn và 3-7 ngày tại các khu vực khác. Bạn có thể theo dõi trạng thái đơn hàng trực tiếp trên website.</li>
                    <li><b>Làm sao để liên hệ hỗ trợ khách hàng?</b><br />Bạn có thể liên hệ với chúng tôi qua hotline, email hoặc chat trực tuyến trên website để được hỗ trợ nhanh chóng và tận tình 24/7.</li>
                    <li><b>ECom có chương trình khách hàng thân thiết không?</b><br />Có! Khi đăng ký tài khoản và mua sắm thường xuyên, bạn sẽ nhận được điểm thưởng, ưu đãi sinh nhật và nhiều phần quà hấp dẫn khác.</li>
                    <li><b>Làm sao để trở thành nhà bán hàng trên ECom?</b><br />Nếu bạn muốn hợp tác kinh doanh, hãy truy cập mục "Đăng ký bán hàng" trên website để gửi thông tin. Đội ngũ ECom sẽ liên hệ tư vấn và hỗ trợ bạn phát triển gian hàng.</li>
                    <li><b>ECom bảo vệ thông tin cá nhân của khách hàng như thế nào?</b><br />Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng theo chính sách bảo mật và tuân thủ quy định pháp luật hiện hành.</li>
                </ol>
            </div>

            {/* Hướng Dẫn An Toàn Mua Sắm */}
            <div className="modern-home-section">
                <h2>Hướng Dẫn An Toàn Mua Sắm</h2>
                <ul>
                    <li>Luôn kiểm tra kỹ thông tin sản phẩm, đánh giá của khách hàng trước khi đặt mua.</li>
                    <li>Không chia sẻ thông tin tài khoản, mật khẩu hoặc mã OTP cho bất kỳ ai.</li>
                    <li>Ưu tiên sử dụng các phương thức thanh toán an toàn như thẻ tín dụng, ví điện tử hoặc COD.</li>
                    <li>Liên hệ ngay với bộ phận CSKH nếu phát hiện dấu hiệu lừa đảo hoặc giao dịch bất thường.</li>
                    <li>Đọc kỹ chính sách đổi trả, bảo hành và các điều khoản sử dụng trước khi mua hàng.</li>
                </ul>
            </div>

            {/* Chính Sách Ưu Đãi & Thành Viên */}
            <div className="modern-home-section">
                <h2>Chính Sách Ưu Đãi & Thành Viên</h2>
                <ul>
                    <li>Tích điểm đổi quà cho mỗi đơn hàng thành công.</li>
                    <li>Ưu đãi sinh nhật, giảm giá đặc biệt cho thành viên thân thiết.</li>
                    <li>Tham gia các chương trình Flash Sale, săn voucher độc quyền.</li>
                    <li>Nhận thông báo sớm về các sản phẩm mới, sự kiện và khuyến mãi lớn.</li>
                    <li>Hỗ trợ ưu tiên từ đội ngũ CSKH chuyên nghiệp.</li>
                </ul>
            </div>

            {/* Đối Tác & Nhà Cung Cấp */}
            <div className="modern-home-section">
                <h2>Đối Tác & Nhà Cung Cấp</h2>
                <p>Chúng tôi luôn lựa chọn đối tác dựa trên tiêu chí chất lượng, uy tín và cam kết phục vụ khách hàng tốt nhất. ECom không ngừng mở rộng mạng lưới hợp tác để mang đến cho bạn nhiều lựa chọn sản phẩm chính hãng, giá tốt và dịch vụ hậu mãi chu đáo.</p>
                <p>Nếu bạn là nhà cung cấp hoặc thương hiệu muốn hợp tác cùng ECom, hãy liên hệ với chúng tôi để cùng phát triển và tạo ra giá trị bền vững cho cộng đồng mua sắm Việt Nam.</p>
            </div>
        </Box>
    );
};

export default ModernEcommerceHomePage;
