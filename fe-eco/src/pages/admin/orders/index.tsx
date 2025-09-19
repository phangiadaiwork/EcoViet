import {
    Box, Typography, Card, CardContent, Grid, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
    InputLabel, Select, MenuItem, Pagination, InputAdornment, Avatar
} from '@mui/material';
import {
    Search, FilterList, Visibility, Edit, LocalShipping, CheckCircle
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { callGetAllOrders, callUpdateOrderStatus } from '../../../services/apiAdmin/apiAdmin';
import { toast } from 'react-toastify';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [newStatus, setNewStatus] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter })
            };
            
            const response = await callGetAllOrders(params);
            if (response && response.data) {
                setOrders(response.data.items || []);
                setTotalPages(Math.ceil((response.data.total || 0) / 10));
            }
        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, searchTerm, statusFilter]);

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus) return;
        
        try {
            await callUpdateOrderStatus(selectedOrder.id, newStatus);
            toast.success('Cập nhật trạng thái đơn hàng thành công');
            fetchOrders();
            setOpenStatusDialog(false);
            setSelectedOrder(null);
            setNewStatus('');
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái đơn hàng');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PROCESSING': return 'info';
            case 'SHIPPED': return 'primary';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'error';
            case 'REFUNDED': return 'secondary';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'PROCESSING': return 'Đang xử lý';
            case 'SHIPPED': return 'Đã giao';
            case 'DELIVERED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            case 'REFUNDED': return 'Đã hoàn tiền';
            default: return status;
        }
    };

    const orderStatuses = [
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'PROCESSING', label: 'Đang xử lý' },
        { value: 'SHIPPED', label: 'Đã giao' },
        { value: 'DELIVERED', label: 'Hoàn thành' },
        { value: 'CANCELLED', label: 'Đã hủy' },
        { value: 'REFUNDED', label: 'Đã hoàn tiền' }
    ];

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Quản lý đơn hàng
                    </Typography>
                    <Typography color="text.secondary">
                        Quản lý tất cả đơn hàng của khách hàng
                    </Typography>
                </Box>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
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
                                    {orderStatuses.map((status) => (
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

            {/* Orders Table */}
            <Card>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Mã đơn hàng</TableCell>
                                <TableCell>Khách hàng</TableCell>
                                <TableCell>Ngày đặt</TableCell>
                                <TableCell align="center">Sản phẩm</TableCell>
                                <TableCell align="right">Tổng tiền</TableCell>
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
                            ) : orders.length > 0 ? (
                                orders.map((order: any) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight={500}>
                                                #{order.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
                                                    {order.user?.name?.charAt(0) || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {order.user?.name || 'Khách hàng'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {order.user?.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(order.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">
                                                {order.items?.length || 0} sản phẩm
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body1" fontWeight={500}>
                                                {formatCurrency(order.total || 0)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={getStatusLabel(order.status)}
                                                color={getStatusColor(order.status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="primary">
                                                <Visibility />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setNewStatus(order.status);
                                                    setOpenStatusDialog(true);
                                                }}
                                            >
                                                <Edit />
                                            </IconButton>
                                            {order.status === 'PROCESSING' && (
                                                <IconButton size="small" color="success">
                                                    <LocalShipping />
                                                </IconButton>
                                            )}
                                            {order.status === 'SHIPPED' && (
                                                <IconButton size="small" color="success">
                                                    <CheckCircle />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="text.secondary" sx={{ py: 3 }}>
                                            Không có đơn hàng nào
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
                <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography sx={{ mb: 2 }}>
                        Đơn hàng: #{selectedOrder?.id}
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Trạng thái mới</InputLabel>
                        <Select
                            value={newStatus}
                            label="Trạng thái mới"
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            {orderStatuses.map((status) => (
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

export default AdminOrders;
