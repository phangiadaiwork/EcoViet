import { 
    Box, Grid, Typography, Card, CardContent, IconButton, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Avatar, LinearProgress
} from '@mui/material';
import { 
    PeopleAlt, ShoppingCart, Inventory, AttachMoney, ShoppingBag, Category
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { callAdminDashboard, callGetRecentActivities, callGetTopProducts } from '../../services/apiAdmin/apiAdmin';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        categories: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [dashboardRes, recentOrdersRes, topProductsRes] = await Promise.all([
                callAdminDashboard(),
                callGetRecentActivities({ limit: 5 }),
                callGetTopProducts({ limit: 5 })
            ]);
            
            if (dashboardRes && dashboardRes.data) {
                setStats({
                    totalUsers: dashboardRes.data.totalUsers || 0,
                    totalProducts: dashboardRes.data.totalProducts || 0,
                    totalOrders: dashboardRes.data.totalOrders || 0,
                    totalRevenue: dashboardRes.data.totalRevenue || 0,
                    pendingOrders: dashboardRes.data.pendingOrders || 0,
                    categories: dashboardRes.data.totalCategories || 0
                });
            }
            
            if (recentOrdersRes && recentOrdersRes.data) {
                setRecentOrders(recentOrdersRes.data.slice(0, 5));
            }
            
            if (topProductsRes && topProductsRes.data) {
                setTopProducts(topProductsRes.data.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const StatCard = ({ title, value, icon, color, subtitle }: any) => (
        <Card
            sx={{
                height: '100%',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton
                        sx={{
                            backgroundColor: `${color}15`,
                            color: color,
                            width: 48,
                            height: 48,
                            '&:hover': {
                                backgroundColor: `${color}25`,
                            }
                        }}
                    >
                        {icon}
                    </IconButton>
                </Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                    {loading ? '-' : typeof value === 'number' && title.includes('Doanh thu') 
                        ? formatCurrency(value) 
                        : (value ?? 0).toLocaleString()}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 1
                    }}
                >
                    Dashboard Ecommerce
                </Typography>
                <Typography color="text.secondary">
                    Tổng quan về hoạt động kinh doanh và quản lý cửa hàng
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Tổng khách hàng"
                        value={stats.totalUsers}
                        icon={<PeopleAlt />}
                        color="#45c3d2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Tổng sản phẩm"
                        value={stats.totalProducts}
                        icon={<Inventory />}
                        color="#4CAF50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Tổng đơn hàng"
                        value={stats.totalOrders}
                        icon={<ShoppingBag />}
                        color="#FF9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Doanh thu tổng"
                        value={stats.totalRevenue}
                        icon={<AttachMoney />}
                        color="#F44336"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Đơn hàng chờ xử lý"
                        value={stats.pendingOrders}
                        icon={<ShoppingCart />}
                        color="#9C27B0"
                        subtitle="Cần được xử lý"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Danh mục sản phẩm"
                        value={stats.categories}
                        icon={<Category />}
                        color="#607D8B"
                    />
                </Grid>
            </Grid>

            {/* Recent Activities & Top Products */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Đơn hàng gần đây
                            </Typography>
                            {loading ? (
                                <LinearProgress />
                            ) : recentOrders.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Mã đơn</TableCell>
                                                <TableCell>Khách hàng</TableCell>
                                                <TableCell>Trạng thái</TableCell>
                                                <TableCell align="right">Tổng tiền</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentOrders.map((order: any) => (
                                                <TableRow key={order.id}>
                                                    <TableCell>#{order.id}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                                                                {order.user?.name?.charAt(0) || 'U'}
                                                            </Avatar>
                                                            {order.user?.name || 'Khách hàng'}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={getStatusLabel(order.status)}
                                                            size="small"
                                                            color={getStatusColor(order.status)}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatCurrency(order.total)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                    Chưa có đơn hàng nào
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Sản phẩm bán chạy
                            </Typography>
                            {loading ? (
                                <LinearProgress />
                            ) : topProducts.length > 0 ? (
                                <Box>
                                    {topProducts.map((product: any, index: number) => (
                                        <Box key={product.id} sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 2,
                                            p: 1,
                                            borderRadius: 1,
                                            bgcolor: 'grey.50'
                                        }}>
                                            <Typography 
                                                sx={{ 
                                                    minWidth: 24, 
                                                    mr: 2, 
                                                    fontWeight: 600,
                                                    color: index < 3 ? 'primary.main' : 'text.secondary'
                                                }}
                                            >
                                                #{index + 1}
                                            </Typography>
                                            <Avatar 
                                                src={product.image}
                                                sx={{ width: 40, height: 40, mr: 2 }}
                                            >
                                                {product.name?.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {product.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Đã bán: {product.sold || 0} sản phẩm
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" fontWeight={600} color="primary.main">
                                                {formatCurrency(product.price)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                    Chưa có dữ liệu sản phẩm
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    // Helper functions for order status
    function getStatusLabel(status: string) {
        const statusMap: Record<string, string> = {
            'PENDING': 'Chờ xử lý',
            'PROCESSING': 'Đang xử lý',
            'SHIPPED': 'Đã giao',
            'DELIVERED': 'Hoàn thành',
            'CANCELLED': 'Đã hủy',
            'REFUNDED': 'Đã hoàn tiền'
        };
        return statusMap[status] || status;
    }

    function getStatusColor(status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
        const colorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
            'PENDING': 'warning',
            'PROCESSING': 'info',
            'SHIPPED': 'primary',
            'DELIVERED': 'success',
            'CANCELLED': 'error',
            'REFUNDED': 'secondary'
        };
        return colorMap[status] || 'default';
    }
};

export default AdminDashboard;
