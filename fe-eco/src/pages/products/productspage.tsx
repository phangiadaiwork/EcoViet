import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    FormControl,
    Select,
    MenuItem,
    Chip,
    Paper,
    Pagination,
    Drawer,
    IconButton,
    Slider,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Button,
    CircularProgress
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import { callGetProducts, callSearchProducts } from '../../services/apiProducts/apiProducts';
import { callGetCategories } from '../../services/apiCategories/apiCategories';
import { fetchCart } from '../../redux/cart/cartSlice';

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
        slug: string;
    };
    description?: string;
    rating?: number;
    reviewCount?: number;
    brand?: string;
    reviews?: any[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    
    // Redux selectors
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
    
    // State management
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('name');
    const [priceRange, setPriceRange] = useState([0, 1000000]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchQuery = searchParams.get('search') || '';
    const categoryFilter = searchParams.get('category') || '';

    // Load cart when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart() as any);
        }
    }, [isAuthenticated, dispatch]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchProducts();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, sortBy, priceRange, selectedCategories]);

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Update document title based on search/category
    useEffect(() => {
        let title = 'Sản phẩm | DoctorCare';
        
        if (searchQuery) {
            title = `Tìm kiếm "${searchQuery}" | DoctorCare`;
        } else if (categoryFilter) {
            const category = categories.find(c => c.slug === categoryFilter);
            if (category) {
                title = `${category.name} | DoctorCare`;
            }
        }
        
        document.title = title;
    }, [searchQuery, categoryFilter, categories]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: 12,
                sortBy,
                ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
                ...(priceRange[1] < 1000000 && { maxPrice: priceRange[1] }),
                // Convert selected category IDs to category slugs for backend
                ...(selectedCategories.length > 0 && {
                    category: categories.find(c => selectedCategories.includes(c.id))?.slug
                }),
                ...(categoryFilter && { category: categoryFilter })
            };


            let response: any;
            if (searchQuery) {
                response = await callSearchProducts(searchQuery, params);
            } else {
                response = await callGetProducts(params);
            }


            if (response?.data?.data) {
                // Handle nested data structure from backend
                const productsData = response.data.data;
                const products = productsData.products || [];
                
                const transformedProducts: Product[] = products.map((product: any) => ({
                    ...product,
                    rating: product.reviews && product.reviews.length > 0 ? 
                        product.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / product.reviews.length : 0,
                    reviewCount: product.reviews?.length || 0
                }));
                
                setProducts(transformedProducts);
                setTotalPages(productsData.totalPages || 1);
                setTotalCount(productsData.total || 0);
            } else if (response?.data) {
                // Handle direct data structure
                const products = response.data.products || [];
                
                const transformedProducts: Product[] = products.map((product: any) => ({
                    ...product,
                    rating: product.reviews && product.reviews.length > 0 ? 
                        product.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / product.reviews.length : 0,
                    reviewCount: product.reviews?.length || 0
                }));
                
                setProducts(transformedProducts);
                setTotalPages(response.data.totalPages || 1);
                setTotalCount(response.data.total || 0);
            } else if (response?.products) {
                // Handle different response format
                const products = response.products || [];
                
                const transformedProducts: Product[] = products.map((product: any) => ({
                    ...product,
                    rating: product.reviews && product.reviews.length > 0 ? 
                        product.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / product.reviews.length : 0,
                    reviewCount: product.reviews?.length || 0
                }));
                
                setProducts(transformedProducts);
                setTotalPages(response.totalPages || 1);
                setTotalCount(response.total || 0);
            }
        } catch (error: any) {
            console.error('Error fetching products:', error);
            setError(`Không thể tải danh sách sản phẩm: ${error?.message || 'Vui lòng thử lại sau.'}`);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortBy, priceRange, selectedCategories, searchQuery, categoryFilter, categories]);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await callGetCategories();
            if (response?.data?.data) {
                // Handle nested data structure
                setCategories(response.data.data);
            } else if (response?.data) {
                // Handle direct data structure
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleSortChange = (event: any) => {
        setSortBy(event.target.value as string);
        setCurrentPage(1);
    };

    const handlePriceRangeChange = useCallback((_event: Event, newValue: number | number[]) => {
        setPriceRange(newValue as number[]);
    }, []);

    const handleCategoryChange = useCallback((categoryId: string) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
        setCurrentPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setPriceRange([0, 1000000]);
        setSelectedCategories([]);
        setSearchParams({});
        setCurrentPage(1);
    }, [setSearchParams]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const FilterContent = () => (
        <Box sx={{ p: 3, width: { xs: '100vw', sm: 300 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bộ lọc
                </Typography>
                <IconButton onClick={() => setFilterDrawerOpen(false)} sx={{ display: { xs: 'block', md: 'none' } }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Price Range Filter */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Khoảng giá
                </Typography>
                <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000000}
                    step={10000}
                    valueLabelFormat={(value) => `${value.toLocaleString()}đ`}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {priceRange[0].toLocaleString()}đ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {priceRange[1].toLocaleString()}đ
                    </Typography>
                </Box>
            </Box>

            {/* Category Filter */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Danh mục
                </Typography>
                {categoriesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <FormGroup>
                        {categories.map((category) => (
                            <FormControlLabel
                                key={category.id}
                                control={
                                    <Checkbox
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                    />
                                }
                                label={category.name}
                            />
                        ))}
                    </FormGroup>
                )}
            </Box>

            {/* Clear Filters */}
            <Button
                variant="outlined"
                fullWidth
                onClick={clearFilters}
                sx={{ mt: 2 }}
            >
                Xóa bộ lọc
            </Button>
        </Box>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                    {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Sản phẩm'}
                </Typography>
                
                {/* Active Filters */}
                {(searchQuery || selectedCategories.length > 0) && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {searchQuery && (
                            <Chip
                                label={`Tìm kiếm: ${searchQuery}`}
                                onDelete={() => setSearchParams({})}
                                color="primary"
                            />
                        )}
                        {selectedCategories.map(categoryId => {
                            const category = categories.find(c => c.id === categoryId);
                            return category ? (
                                <Chip
                                    key={categoryId}
                                    label={category.name}
                                    onDelete={() => handleCategoryChange(categoryId)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ) : null;
                        })}
                    </Box>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Sidebar Filters - Desktop */}
                <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Paper sx={{ position: 'sticky', top: 100 }}>
                        <FilterContent />
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12} md={9}>
                    {/* Toolbar */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Typography variant="body1" color="text.secondary">
                            {loading ? 'Đang tải...' : `${totalCount || products.length} sản phẩm`}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {/* Mobile Filter Button */}
                            <IconButton
                                onClick={() => setFilterDrawerOpen(true)}
                                sx={{ display: { xs: 'block', md: 'none' } }}
                            >
                                <FilterListIcon />
                            </IconButton>

                            {/* Sort */}
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                >
                                    <MenuItem value="name">Tên A-Z</MenuItem>
                                    <MenuItem value="-name">Tên Z-A</MenuItem>
                                    <MenuItem value="price">Giá thấp đến cao</MenuItem>
                                    <MenuItem value="-price">Giá cao đến thấp</MenuItem>
                                    <MenuItem value="-createdAt">Mới nhất</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Products Grid */}
                    {error ? (
                        <Box sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            border: '1px dashed',
                            borderColor: 'error.main',
                            borderRadius: 2,
                            bgcolor: 'error.light',
                            color: 'error.contrastText'
                        }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                            <Button 
                                variant="contained" 
                                onClick={fetchProducts}
                                color="error"
                            >
                                Thử lại
                            </Button>
                        </Box>
                    ) : loading ? (
                        <Grid container spacing={3}>
                            {Array.from(new Array(12)).map((_, index) => (
                                <Grid item xs={6} sm={4} md={4} lg={3} key={index}>
                                    <ProductCardSkeleton />
                                </Grid>
                            ))}
                        </Grid>
                    ) : products.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                Không tìm thấy sản phẩm nào
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                            </Typography>
                            <Button variant="outlined" onClick={clearFilters}>
                                Xóa bộ lọc
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Grid container spacing={3}>
                                {products.map((product) => (
                                    <Grid 
                                        item 
                                        xs={6} 
                                        sm={4} 
                                        md={4} 
                                        lg={3} 
                                        key={product.id}
                                        sx={{
                                            '& > *': {
                                                height: '100%'
                                            }
                                        }}
                                    >
                                        <ProductCard product={product} />
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    mt: 6,
                                    '& .MuiPagination-ul': {
                                        flexWrap: 'wrap'
                                    }
                                }}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
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
                </Grid>
            </Grid>

            {/* Mobile Filter Drawer */}
            <Drawer
                anchor="right"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                sx={{ display: { xs: 'block', md: 'none' } }}
            >
                <FilterContent />
            </Drawer>
        </Container>
    );
};

export default ProductsPage;