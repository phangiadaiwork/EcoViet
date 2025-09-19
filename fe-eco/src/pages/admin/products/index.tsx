import {
    Box, Typography, Card, CardContent, Grid, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
    InputLabel, Select, MenuItem, Avatar, Pagination, InputAdornment
} from '@mui/material';
import {
    Add, Edit, Delete, Search, FilterList, Visibility
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { callGetAllProducts, callDeleteProduct, callCreateProduct, callUpdateProduct } from '../../../services/apiAdmin/apiAdmin';
import { callGetCategories } from '../../../services/apiCategories/apiCategories';
import { toast } from 'react-toastify';
import slugify from 'slugify';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openProductDialog, setOpenProductDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        sale_price: '',
        sku: '',
        stock: '',
        brand: '',
        weight: '',
        dimensions: '',
        category_id: '',
        images: [] as string[],
        slug: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: ''
    });
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [isMetaTitleManuallyEdited, setIsMetaTitleManuallyEdited] = useState(false);
    const [isMetaDescriptionManuallyEdited, setIsMetaDescriptionManuallyEdited] = useState(false);

    const createSlug = (text: string): string => {
        if (!text) return '';
        
        // First use slugify to handle Vietnamese characters and basic formatting
        let slug = slugify(text, {
            lower: true,
            strict: true, // Remove special characters
            locale: 'vi',
            trim: true,
            replacement: '-',
            remove: undefined // Let strict mode handle removal
        });
        
        // Additional cleanup: only allow letters, numbers, and hyphens
        slug = slug.replace(/[^a-z0-9-]/g, '');
        
        // Remove multiple consecutive hyphens
        slug = slug.replace(/-+/g, '-');
        
        // Remove leading and trailing hyphens
        slug = slug.replace(/^-+|-+$/g, '');
        
        return slug;
    };

    const fetchCategories = async () => {
        try {
            const response = await callGetCategories();
            if (response && response.data) {
                // Assuming API returns { items: [...] } or just [...]
                setCategories(response.data.items || response.data || []);
            } else {
                setCategories([]);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách danh mục');
            setCategories([]); // Ensure categories is an array on error
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
                ...(categoryFilter && { category: categoryFilter }),
                ...(statusFilter && { status: statusFilter })
            };
            
            const response = await callGetAllProducts(params);
            if (response && response.data) {
                setProducts(response.data.items || []);
                setTotalPages(Math.ceil((response.data.total || 0) / 10));
            }
        } catch (error) {
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [page, searchTerm, categoryFilter, statusFilter]);

    const openProductViewDialog = (product: any) => {
        setSelectedProduct(product);
        setOpenViewDialog(true);
    };

    const resetForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            sale_price: '',
            sku: '',
            stock: '',
            brand: '',
            weight: '',
            dimensions: '',
            category_id: '',
            images: [],
            slug: '',
            meta_title: '',
            meta_description: '',
            meta_keywords: ''
        });
        // Reset manual edit flags
        setIsSlugManuallyEdited(false);
        setIsMetaTitleManuallyEdited(false);
        setIsMetaDescriptionManuallyEdited(false);
    };

    const openAddDialog = () => {
        resetForm();
        setIsEditing(false);
        setSelectedProduct(null);
        // Reset manual edit flags for new product
        setIsSlugManuallyEdited(false);
        setIsMetaTitleManuallyEdited(false);
        setIsMetaDescriptionManuallyEdited(false);
        setOpenProductDialog(true);
    };

    const openEditDialog = (product: any) => {
        setProductForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            sale_price: product.sale_price?.toString() || '',
            sku: product.sku || '',
            stock: product.stock?.toString() || '',
            brand: product.brand || '',
            weight: product.weight?.toString() || '',
            dimensions: product.dimensions || '',
            category_id: product.category_id || '',
            images: product.images || [],
            slug: product.slug || '',
            meta_title: product.meta_title || '',
            meta_description: product.meta_description || '',
            meta_keywords: product.meta_keywords || ''
        });
        setIsEditing(true);
        setSelectedProduct(product);
        // When editing, assume fields were intentionally set.
        // The user can clear them to re-enable auto-generation.
        setIsSlugManuallyEdited(true);
        setIsMetaTitleManuallyEdited(true);
        setIsMetaDescriptionManuallyEdited(true);
        setOpenProductDialog(true);
    };

    const handleFormChange = (field: string, value: any) => {
        setProductForm(prev => {
            const updated = { ...prev };

            if (field === 'slug') {
                // Cho phép nhập tự do, không chuẩn hóa ngay
                updated.slug = value;
                setIsSlugManuallyEdited(true);
            } else if (field === 'name') {
                // Khi thay đổi tên sản phẩm
                updated.name = value;
                
                // Tự động cập nhật slug từ tên sản phẩm (trừ khi đã chỉnh sửa thủ công)
                if (!isSlugManuallyEdited && value) {
                    updated.slug = createSlug(value);
                }
                
                // Tự động cập nhật meta fields (trừ khi đã chỉnh sửa thủ công)
                if (!isMetaTitleManuallyEdited && value) {
                    updated.meta_title = `${value} - Sản phẩm chất lượng cao`;
                }
                if (!isMetaDescriptionManuallyEdited && value) {
                    updated.meta_description = `Mua ${value} chính hãng, giá tốt nhất tại DoctorCare`;
                }
            } else if (field === 'meta_title') {
                updated.meta_title = value;
                setIsMetaTitleManuallyEdited(true);
            } else if (field === 'meta_description') {
                updated.meta_description = value;
                setIsMetaDescriptionManuallyEdited(true);
            } else {
                // Các field khác
                updated[field as keyof typeof updated] = value as any;
            }

            return updated;
        });
    };

    const handleSlugBlur = () => {
        if (productForm.slug) {
            const normalizedSlug = createSlug(productForm.slug);
            if (normalizedSlug !== productForm.slug) {
                setProductForm(prev => ({
                    ...prev,
                    slug: normalizedSlug
                }));
            }
        }
    };

    const handleSaveProduct = async () => {
        try {
            // Validate required fields first
            if (!productForm.name || !productForm.sku || !productForm.price || !productForm.stock) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            // Ensure slug is always present - create from name if empty
            let finalSlug = productForm.slug?.trim();
            if (!finalSlug) {
                finalSlug = createSlug(productForm.name);
            }

            // Always normalize the slug to ensure it's valid
            finalSlug = createSlug(finalSlug);

            // Validate that finalSlug is not empty after processing
            if (!finalSlug) {
                toast.error('Không thể tạo slug từ tên sản phẩm');
                return;
            }
            
            // Auto-generate meta fields if empty
            const finalMetaTitle = productForm.meta_title || `${productForm.name} - Sản phẩm chất lượng cao`;
            const finalMetaDescription = productForm.meta_description || `Mua ${productForm.name} chính hãng, giá tốt nhất tại DoctorCare`;

            const productData = {
                ...productForm,
                slug: finalSlug,
                meta_title: finalMetaTitle,
                meta_description: finalMetaDescription,
                price: productForm.price ? parseFloat(productForm.price) : 0,
                sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
                stock: productForm.stock ? parseInt(productForm.stock, 10) : 0,
                weight: productForm.weight ? parseFloat(productForm.weight) : null
            };

            // Remove category_id if it's not a valid value (e.g., empty string)
            if (!productData.category_id || productData.category_id.trim() === '') {
                delete (productData as any).category_id;
            }

            // Final validation before sending
            const requiredFields = ['name', 'sku', 'price', 'stock', 'slug'] as const;
            for (const field of requiredFields) {
                const value = (productData as any)[field];
                if (!value && value !== 0) {
                    toast.error(`Trường bắt buộc "${field}" đang trống`);
                    return;
                }
            }

            // Validate category_id is still present after cleaning
            if (!productData.category_id) {
                toast.error('Vui lòng chọn danh mục sản phẩm');
                return;
            }

            if (isEditing && selectedProduct) {
                const result = await callUpdateProduct(selectedProduct.id, productData);
                if (result && (result.data || result.status === 200 || result.status === 201)) {
                    toast.success('Cập nhật sản phẩm thành công');
                } else {
                    toast.error('Có lỗi khi cập nhật sản phẩm');
                    return;
                }
            } else {
                const result = await callCreateProduct(productData);
                if (result && (result.data || result.status === 200 || result.status === 201)) {
                    toast.success('Thêm sản phẩm thành công');
                } else {
                    toast.error('Có lỗi khi thêm sản phẩm');
                    return;
                }
            }

            setOpenProductDialog(false);
            resetForm();
            fetchProducts();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
            toast.error(isEditing ? `Không thể cập nhật sản phẩm: ${errorMessage}` : `Không thể thêm sản phẩm: ${errorMessage}`);
        }
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;
        
        try {
            await callDeleteProduct(selectedProduct.id);
            toast.success('Xóa sản phẩm thành công');
            fetchProducts();
            setOpenDeleteDialog(false);
            setSelectedProduct(null);
        } catch (error) {
            toast.error('Không thể xóa sản phẩm');
        }
    };

    const renderProductDetails = (product: any) => {
        const details = [];
        if (product.weight) details.push(`${product.weight}kg`);
        if (product.dimensions) details.push(product.dimensions);
        return details.join(' • ');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (isDeleted: boolean, stock: number) => {
        if (isDeleted) return 'error';
        if (stock === 0) return 'warning';
        return 'success';
    };

    const getStatusLabel = (isDeleted: boolean, stock: number) => {
        if (isDeleted) return 'Đã xóa';
        if (stock === 0) return 'Hết hàng';
        if (stock > 0 && stock <= 10) return 'Sắp hết';
        return 'Còn hàng';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Quản lý sản phẩm
                    </Typography>
                    <Typography color="text.secondary">
                        Quản lý tất cả sản phẩm trong cửa hàng
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                    onClick={openAddDialog}
                >
                    Thêm sản phẩm
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Danh mục</InputLabel>
                                <Select
                                    value={categoryFilter}
                                    label="Danh mục"
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {categories.map((category: any) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Trạng thái kho</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Trạng thái kho"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    <MenuItem value="in_stock">Còn hàng</MenuItem>
                                    <MenuItem value="low_stock">Sắp hết</MenuItem>
                                    <MenuItem value="out_of_stock">Hết hàng</MenuItem>
                                    <MenuItem value="deleted">Đã xóa</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterList />}
                                fullWidth
                            >
                                Lọc
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sản phẩm</TableCell>
                                <TableCell>Danh mục</TableCell>
                                <TableCell>Thương hiệu</TableCell>
                                <TableCell align="center">Kho</TableCell>
                                <TableCell align="right">Giá gốc</TableCell>
                                <TableCell align="right">Giá khuyến mãi</TableCell>
                                <TableCell align="center">Trạng thái</TableCell>
                                <TableCell align="center">Ngày tạo</TableCell>
                                <TableCell align="center">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : products.length > 0 ? (
                                products.map((product: any) => (
                                    <TableRow key={product.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar
                                                    src={product.images && product.images[0] ? product.images[0] : ''}
                                                    sx={{ width: 50, height: 50, mr: 2 }}
                                                    variant="rounded"
                                                >
                                                    {product.name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {product.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        SKU: {product.sku || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {product.slug}
                                                    </Typography>
                                                    {renderProductDetails(product) && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {renderProductDetails(product)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {product.category?.name || 'Chưa phân loại'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {product.brand || 'Không có'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography
                                                variant="body2"
                                                color={product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main'}
                                                fontWeight={500}
                                            >
                                                {product.stock || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body1" fontWeight={500}>
                                                {formatCurrency(Number(product.price) || 0)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography 
                                                variant="body1" 
                                                fontWeight={500}
                                                color={product.sale_price ? 'error.main' : 'text.secondary'}
                                            >
                                                {product.sale_price ? formatCurrency(Number(product.sale_price)) : '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={getStatusLabel(product.isDeleted || false, product.stock || 0)}
                                                color={getStatusColor(product.isDeleted || false, product.stock || 0) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(product.createAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="primary" onClick={() => openProductViewDialog(product)}>
                                                <Visibility />
                                            </IconButton>
                                            <IconButton size="small" color="info" onClick={() => openEditDialog(product)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setOpenDeleteDialog(true);
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography color="text.secondary" sx={{ py: 3 }}>
                                            Không có sản phẩm nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, newPage) => setPage(newPage)}
                            color="primary"
                        />
                    </Box>
                )}
            </Card>

            {/* View Product Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={selectedProduct?.images?.[0] || ''}
                            sx={{ width: 50, height: 50 }}
                            variant="rounded"
                        >
                            {selectedProduct?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {selectedProduct?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                SKU: {selectedProduct?.sku}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedProduct && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Thông tin cơ bản</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Tên sản phẩm:</Typography>
                                                <Typography fontWeight={500}>{selectedProduct.name}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">SKU:</Typography>
                                                <Typography fontWeight={500}>{selectedProduct.sku}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Slug:</Typography>
                                                <Typography fontWeight={500}>{selectedProduct.slug}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Danh mục:</Typography>
                                                <Typography fontWeight={500}>{selectedProduct.category?.name || 'Chưa phân loại'}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Thương hiệu:</Typography>
                                                <Typography fontWeight={500}>{selectedProduct.brand || 'Không có'}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Giá & Kho</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Giá gốc:</Typography>
                                                <Typography fontWeight={500} color="primary.main">
                                                    {formatCurrency(Number(selectedProduct.price))}
                                                </Typography>
                                            </Box>
                                            {selectedProduct.sale_price && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography color="text.secondary">Giá khuyến mãi:</Typography>
                                                    <Typography fontWeight={500} color="error.main">
                                                        {formatCurrency(Number(selectedProduct.sale_price))}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Số lượng kho:</Typography>
                                                <Chip
                                                    label={`${selectedProduct.stock} sản phẩm`}
                                                    color={selectedProduct.stock > 10 ? 'success' : selectedProduct.stock > 0 ? 'warning' : 'error'}
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Trạng thái:</Typography>
                                                <Chip
                                                    label={getStatusLabel(selectedProduct.isDeleted || false, selectedProduct.stock || 0)}
                                                    color={getStatusColor(selectedProduct.isDeleted || false, selectedProduct.stock || 0) as any}
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {(selectedProduct.weight || selectedProduct.dimensions) && (
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>Thông số kỹ thuật</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {selectedProduct.weight && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography color="text.secondary">Trọng lượng:</Typography>
                                                        <Typography fontWeight={500}>{selectedProduct.weight}kg</Typography>
                                                    </Box>
                                                )}
                                                {selectedProduct.dimensions && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography color="text.secondary">Kích thước:</Typography>
                                                        <Typography fontWeight={500}>{selectedProduct.dimensions}</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Thời gian</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Ngày tạo:</Typography>
                                                <Typography fontWeight={500}>{formatDate(selectedProduct.createAt)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">Cập nhật cuối:</Typography>
                                                <Typography fontWeight={500}>{formatDate(selectedProduct.updateAt)}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {selectedProduct.description && (
                                <Grid item xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>Mô tả sản phẩm</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedProduct.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                            {(selectedProduct.meta_title || selectedProduct.meta_description || selectedProduct.meta_keywords) && (
                                <Grid item xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>Thông tin SEO</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {selectedProduct.meta_title && (
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">Meta Title:</Typography>
                                                        <Typography variant="body2">{selectedProduct.meta_title}</Typography>
                                                    </Box>
                                                )}
                                                {selectedProduct.meta_description && (
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">Meta Description:</Typography>
                                                        <Typography variant="body2">{selectedProduct.meta_description}</Typography>
                                                    </Box>
                                                )}
                                                {selectedProduct.meta_keywords && (
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">Meta Keywords:</Typography>
                                                        <Typography variant="body2">{selectedProduct.meta_keywords}</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <Grid item xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>Hình ảnh sản phẩm</Typography>
                                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                {selectedProduct.images.map((image: string, index: number) => (
                                                    <Avatar
                                                        key={index}
                                                        src={image}
                                                        sx={{ width: 100, height: 100, cursor: 'pointer' }}
                                                        variant="rounded"
                                                    />
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>
                        Đóng
                    </Button>
                    <Button 
                        onClick={() => {
                            setOpenViewDialog(false);
                            openEditDialog(selectedProduct);
                        }}
                        variant="outlined"
                        startIcon={<Edit />}
                    >
                        Chỉnh sửa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Bạn có chắc chắn muốn xóa sản phẩm sau?
                        </Typography>
                        {selectedProduct && (
                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {selectedProduct.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    SKU: {selectedProduct.sku}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Giá: {formatCurrency(Number(selectedProduct.price))}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Kho: {selectedProduct.stock} sản phẩm
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Danh mục: {selectedProduct.category?.name || 'Chưa phân loại'}
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
                            ⚠️ Thao tác này không thể hoàn tác.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteProduct} color="error" variant="contained">
                        Xóa sản phẩm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Product Dialog */}
            <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tên sản phẩm *"
                                value={productForm.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="SKU *"
                                value={productForm.sku}
                                onChange={(e) => handleFormChange('sku', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Mô tả sản phẩm"
                                value={productForm.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Danh mục *</InputLabel>
                                <Select
                                    value={productForm.category_id}
                                    label="Danh mục *"
                                    onChange={(e) => handleFormChange('category_id', e.target.value)}
                                >
                                    {categories.map((category: any) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Thương hiệu"
                                value={productForm.brand}
                                onChange={(e) => handleFormChange('brand', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Giá gốc *"
                                type="number"
                                value={productForm.price}
                                onChange={(e) => handleFormChange('price', e.target.value)}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Giá khuyến mãi"
                                type="number"
                                value={productForm.sale_price}
                                onChange={(e) => handleFormChange('sale_price', e.target.value)}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Số lượng kho *"
                                type="number"
                                value={productForm.stock}
                                onChange={(e) => handleFormChange('stock', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Trọng lượng"
                                type="number"
                                value={productForm.weight}
                                onChange={(e) => handleFormChange('weight', e.target.value)}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Kích thước"
                                value={productForm.dimensions}
                                onChange={(e) => handleFormChange('dimensions', e.target.value)}
                                variant="outlined"
                                placeholder="VD: 20 x 30 x 10 cm"
                            />
                        </Grid>

                        {/* SEO Fields */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                Thông tin SEO
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Slug (URL thân thiện)"
                                value={productForm.slug}
                                onChange={(e) => handleFormChange('slug', e.target.value)}
                                onBlur={handleSlugBlur}
                                variant="outlined"
                                placeholder="VD: iphone-15-pro-max"
                                helperText={
                                    productForm.slug && productForm.slug !== createSlug(productForm.slug) 
                                        ? `Preview: ${createSlug(productForm.slug)} (Slug sẽ được chuẩn hóa khi blur hoặc lưu)`
                                        : "Để trống để tự động tạo từ tên sản phẩm. Cho phép nhập tự do, sẽ được chuẩn hóa khi blur hoặc lưu."
                                }
                                color={
                                    productForm.slug && productForm.slug !== createSlug(productForm.slug) 
                                        ? "warning" 
                                        : "primary"
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Meta Title"
                                value={productForm.meta_title}
                                onChange={(e) => handleFormChange('meta_title', e.target.value)}
                                variant="outlined"
                                placeholder="VD: iPhone 15 Pro Max - Điện thoại cao cấp"
                                helperText={`Tiêu đề hiển thị trên kết quả tìm kiếm (${productForm.meta_title.length}/60 ký tự)`}
                                error={productForm.meta_title.length > 60}
                                inputProps={{ maxLength: 60 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Meta Description"
                                value={productForm.meta_description}
                                onChange={(e) => handleFormChange('meta_description', e.target.value)}
                                variant="outlined"
                                placeholder="VD: Mua iPhone 15 Pro Max chính hãng, giá tốt nhất tại DoctorCare"
                                helperText={`Mô tả hiển thị trên kết quả tìm kiếm (${productForm.meta_description.length}/160 ký tự)`}
                                error={productForm.meta_description.length > 160}
                                inputProps={{ maxLength: 160 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Meta Keywords"
                                value={productForm.meta_keywords}
                                onChange={(e) => handleFormChange('meta_keywords', e.target.value)}
                                variant="outlined"
                                placeholder="VD: iphone, apple, điện thoại, smartphone"
                                helperText="Từ khóa SEO, phân cách bằng dấu phẩy"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Hình ảnh sản phẩm
                            </Typography>
                            <Box sx={{ 
                                border: '2px dashed #ccc', 
                                borderRadius: 1, 
                                p: 3, 
                                textAlign: 'center',
                                bgcolor: 'grey.50'
                            }}>
                                <Typography color="text.secondary">
                                    Kéo thả hình ảnh vào đây hoặc click để chọn file
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
                                </Typography>
                                {productForm.images.length > 0 && (
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {productForm.images.map((image, index) => (
                                            <Avatar
                                                key={index}
                                                src={image}
                                                sx={{ width: 60, height: 60 }}
                                                variant="rounded"
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenProductDialog(false)}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleSaveProduct} 
                        variant="contained"
                        disabled={!productForm.name || !productForm.sku || !productForm.price || !productForm.stock}
                    >
                        {isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminProducts;
