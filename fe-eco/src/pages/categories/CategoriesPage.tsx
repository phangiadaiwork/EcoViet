import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Breadcrumbs,
    Link,
    CircularProgress,
    Chip,
    Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import { callGetCategoryTree } from '../../services/apiCategories/apiCategories';

interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    slug: string;
    children?: Category[];
    _count?: {
        products: number;
    };
}

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await callGetCategoryTree();
            if (response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category: Category) => {
        navigate(`/products?category=${category.id}`);
    };

    const CategoryCard = ({ category }: { category: Category }) => (
        <Card 
            sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                }
            }}
            onClick={() => handleCategoryClick(category)}
        >
            <CardMedia
                component="div"
                sx={{
                    height: 200,
                    background: category.image 
                        ? `url(${
                            category.image.startsWith('http') 
                                ? category.image 
                                : `https://be-ecom-2hfk.onrender.com${category.image.startsWith('/') ? category.image : `/${category.image}`}`
                        })` 
                        : `url(/images/placeholder-product.svg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.3)'
                    }
                }}
            >
                {!category.image && (
                    <Avatar 
                        sx={{ 
                            width: 60, 
                            height: 60, 
                            bgcolor: 'rgba(255,255,255,0.2)',
                            zIndex: 1
                        }}
                    >
                        <CategoryIcon sx={{ fontSize: 30, color: 'white' }} />
                    </Avatar>
                )}
            </CardMedia>
            
            <CardContent sx={{ p: 3 }}>
                <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                        mb: 1, 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    {category.name}
                    <ArrowForwardIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                </Typography>
                
                {category.description && (
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {category.description}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {category._count && (
                        <Chip 
                            label={`${category._count.products} sản phẩm`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    
                    {category.children && category.children.length > 0 && (
                        <Chip 
                            label={`${category.children.length} danh mục con`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                        />
                    )}
                </Box>

                {/* Subcategories */}
                {category.children && category.children.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Danh mục con:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {category.children.slice(0, 3).map((child) => (
                                <Chip
                                    key={child.id}
                                    label={child.name}
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick(child);
                                    }}
                                    sx={{
                                        fontSize: '0.7rem',
                                        '&:hover': {
                                            backgroundColor: 'primary.main',
                                            color: 'white'
                                        }
                                    }}
                                />
                            ))}
                            {category.children.length > 3 && (
                                <Chip
                                    label={`+${category.children.length - 3}`}
                                    size="small"
                                    variant="filled"
                                    color="primary"
                                    sx={{ fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link 
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                    <HomeIcon fontSize="small" />
                    Trang chủ
                </Link>
                <Typography color="text.primary">Danh mục</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                    Danh mục sản phẩm
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    Khám phá các danh mục sản phẩm đa dạng của chúng tôi để tìm những gì bạn cần
                </Typography>
            </Box>

            {/* Categories Grid */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : categories.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CategoryIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Chưa có danh mục nào
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {categories.map((category) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                            <CategoryCard category={category} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Featured Categories Section */}
            <Box sx={{ mt: 8 }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
                    Danh mục nổi bật
                </Typography>
                <Grid container spacing={2}>
                    {categories.slice(0, 6).map((category) => (
                        <Grid item xs={6} sm={4} md={2} key={category.id}>
                            <Box
                                onClick={() => handleCategoryClick(category)}
                                sx={{
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    p: 2,
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'grey.50',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        mx: 'auto',
                                        mb: 1,
                                        bgcolor: 'primary.main'
                                    }}
                                >
                                    <CategoryIcon />
                                </Avatar>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 500,
                                        textAlign: 'center'
                                    }}
                                >
                                    {category.name}
                                </Typography>
                                {category._count && (
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ display: 'block', mt: 0.5 }}
                                    >
                                        {category._count.products} sản phẩm
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default CategoriesPage;
