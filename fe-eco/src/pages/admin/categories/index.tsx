import {
    Box, Typography, Card, CardContent, Grid, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Pagination, 
    InputAdornment
} from '@mui/material';
import {
    Add, Edit, Delete, Search, Visibility
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { callGetAllCategories, callDeleteCategory } from '../../../services/apiAdmin/apiAdmin';
import { toast } from 'react-toastify';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                ...(searchTerm && { search: searchTerm })
            };
            
            const response = await callGetAllCategories(params);
            if (response && response.data) {
                setCategories(response.data.items || []);
                setTotalPages(Math.ceil((response.data.total || 0) / 10));
            }
        } catch (error) {
            toast.error('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [page, searchTerm]);

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;
        
        try {
            await callDeleteCategory(selectedCategory.id);
            toast.success('Xóa danh mục thành công');
            fetchCategories();
            setOpenDeleteDialog(false);
            setSelectedCategory(null);
        } catch (error) {
            toast.error('Không thể xóa danh mục');
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(dateString));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'inactive': return 'Không hoạt động';
            default: return status;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Quản lý danh mục
                    </Typography>
                    <Typography color="text.secondary">
                        Quản lý danh mục sản phẩm trong cửa hàng
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                    Thêm danh mục
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                {categories.length}
                            </Typography>
                            <Typography color="text.secondary">Tổng danh mục</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {categories.filter((c: any) => c.status === 'active').length}
                            </Typography>
                            <Typography color="text.secondary">Đang hoạt động</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="error.main" fontWeight="bold">
                                {categories.filter((c: any) => c.status === 'inactive').length}
                            </Typography>
                            <Typography color="text.secondary">Không hoạt động</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Tìm kiếm danh mục..."
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
                </CardContent>
            </Card>

            {/* Categories Table */}
            <Card>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên danh mục</TableCell>
                                <TableCell>Mô tả</TableCell>
                                <TableCell align="center">Số sản phẩm</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell align="center">Trạng thái</TableCell>
                                <TableCell align="center">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : categories.length > 0 ? (
                                categories.map((category: any) => (
                                    <TableRow key={category.id} hover>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight={500}>
                                                {category.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Slug: {category.slug}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ 
                                                maxWidth: 200, 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {category.description || 'Chưa có mô tả'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" fontWeight={500}>
                                                {category.productCount || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(category.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={getStatusLabel(category.status || 'active')}
                                                color={getStatusColor(category.status || 'active') as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="primary">
                                                <Visibility />
                                            </IconButton>
                                            <IconButton size="small" color="info">
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    setSelectedCategory(category);
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
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="text.secondary" sx={{ py: 3 }}>
                                            Không có danh mục nào
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa danh mục "{selectedCategory?.name}"?
                        Thao tác này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleDeleteCategory} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminCategories;
