import {
    Box, Typography, Card, CardContent, Grid, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
    InputLabel, Select, MenuItem, Pagination, InputAdornment, Avatar
} from '@mui/material';
import {
    Search, FilterList, Visibility, Block, CheckCircle, Email
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { callGetAllUsers, callUpdateUserStatus } from '../../../services/apiAdmin/apiAdmin';
import { toast } from 'react-toastify';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [newStatus, setNewStatus] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter })
            };
            
            const response = await callGetAllUsers(params);
            if (response && response.data) {
                setCustomers(response.data.items || []);
                setTotalPages(Math.ceil((response.data.total || 0) / 10));
            }
        } catch (error) {
            toast.error('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, searchTerm, statusFilter]);

    const handleUpdateStatus = async () => {
        if (!selectedCustomer || !newStatus) return;
        
        try {
            await callUpdateUserStatus(selectedCustomer.id, newStatus);
            toast.success('Cập nhật trạng thái khách hàng thành công');
            fetchCustomers();
            setOpenStatusDialog(false);
            setSelectedCustomer(null);
            setNewStatus('');
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái khách hàng');
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
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'inactive': return 'Tạm khóa';
            case 'pending': return 'Chờ xác thực';
            default: return status;
        }
    };

    const userStatuses = [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Tạm khóa' },
        { value: 'pending', label: 'Chờ xác thực' }
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Quản lý khách hàng
                    </Typography>
                    <Typography color="text.secondary">
                        Quản lý tất cả khách hàng đã đăng ký
                    </Typography>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {customers.filter((c: any) => c.status === 'active').length}
                            </Typography>
                            <Typography color="text.secondary">Khách hàng hoạt động</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main" fontWeight="bold">
                                {customers.filter((c: any) => c.status === 'pending').length}
                            </Typography>
                            <Typography color="text.secondary">Chờ xác thực</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="error.main" fontWeight="bold">
                                {customers.filter((c: any) => c.status === 'inactive').length}
                            </Typography>
                            <Typography color="text.secondary">Tạm khóa</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                {customers.length}
                            </Typography>
                            <Typography color="text.secondary">Tổng khách hàng</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Trạng thái"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {userStatuses.map((status) => (
                                        <MenuItem key={status.value} value={status.value}>
                                            {status.label}
                                        </MenuItem>
                                    ))}
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

            {/* Customers Table */}
            <Card>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Khách hàng</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Số điện thoại</TableCell>
                                <TableCell>Ngày đăng ký</TableCell>
                                <TableCell align="center">Đơn hàng</TableCell>
                                <TableCell align="center">Trạng thái</TableCell>
                                <TableCell align="center">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : customers.length > 0 ? (
                                customers.map((customer: any) => (
                                    <TableRow key={customer.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar
                                                    src={customer.avatar ? `${import.meta.env.VITE_BACKEND_URL}/images/users/${customer.avatar}` : undefined}
                                                    sx={{ width: 40, height: 40, mr: 2 }}
                                                >
                                                    {customer.name?.charAt(0) || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {customer.name || 'Chưa có tên'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        ID: {customer.id}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {customer.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {customer.phone || 'Chưa cập nhật'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(customer.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" fontWeight={500}>
                                                {customer.orderCount || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={getStatusLabel(customer.status || 'active')}
                                                color={getStatusColor(customer.status || 'active') as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="primary">
                                                <Visibility />
                                            </IconButton>
                                            <IconButton size="small" color="info">
                                                <Email />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color={customer.status === 'active' ? 'error' : 'success'}
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setNewStatus(customer.status === 'active' ? 'inactive' : 'active');
                                                    setOpenStatusDialog(true);
                                                }}
                                            >
                                                {customer.status === 'active' ? <Block /> : <CheckCircle />}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="text.secondary" sx={{ py: 3 }}>
                                            Không có khách hàng nào
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

            {/* Update Status Dialog */}
            <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
                <DialogTitle>Cập nhật trạng thái khách hàng</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography sx={{ mb: 2 }}>
                        Khách hàng: {selectedCustomer?.name} ({selectedCustomer?.email})
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Trạng thái mới</InputLabel>
                        <Select
                            value={newStatus}
                            label="Trạng thái mới"
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            {userStatuses.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStatusDialog(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleUpdateStatus} variant="contained">
                        Cập nhật
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminCustomers;
