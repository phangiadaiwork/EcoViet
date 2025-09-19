import {
    Box, Typography, Card, CardContent, Grid, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
    TrendingUp, AttachMoney, ShoppingCart, People
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { callGetRevenueAnalytics } from '../../../services/apiAdmin/apiAdmin';

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState('month');
    const [revenueData, setRevenueData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        growthRate: 0,
        newCustomers: 0
    });

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await callGetRevenueAnalytics({ period });
            if (response && response.data) {
                setRevenueData(response.data.revenueChart || []);
                setCategoryData(response.data.categoryChart || []);
                setSummary(response.data.summary || {});
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    const StatCard = ({ title, value, icon, color, subtitle, trend }: any) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: `${color}15`,
                            color: color,
                            mr: 2
                        }}
                    >
                        {icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography color="text.secondary" variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {typeof value === 'number' && title.includes('Doanh thu') 
                                ? formatCurrency(value) 
                                : value?.toLocaleString() || 0}
                        </Typography>
                        {subtitle && (
                            <Typography color="text.secondary" variant="caption">
                                {subtitle}
                            </Typography>
                        )}
                        {trend && (
                            <Typography 
                                color={trend > 0 ? 'success.main' : 'error.main'} 
                                variant="caption"
                                sx={{ display: 'block' }}
                            >
                                {trend > 0 ? '+' : ''}{trend}% so với kỳ trước
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Thống kê & Phân tích
                    </Typography>
                    <Typography color="text.secondary">
                        Báo cáo chi tiết về hiệu suất kinh doanh
                    </Typography>
                </Box>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Kỳ báo cáo</InputLabel>
                    <Select
                        value={period}
                        label="Kỳ báo cáo"
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <MenuItem value="week">7 ngày qua</MenuItem>
                        <MenuItem value="month">30 ngày qua</MenuItem>
                        <MenuItem value="quarter">3 tháng qua</MenuItem>
                        <MenuItem value="year">12 tháng qua</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Tổng doanh thu"
                        value={summary.totalRevenue}
                        icon={<AttachMoney />}
                        color="#4CAF50"
                        trend={summary.growthRate}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Tổng đơn hàng"
                        value={summary.totalOrders}
                        icon={<ShoppingCart />}
                        color="#2196F3"
                        subtitle="Đơn hàng hoàn thành"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Giá trị đơn hàng TB"
                        value={summary.avgOrderValue}
                        icon={<TrendingUp />}
                        color="#FF9800"
                        subtitle="Trung bình mỗi đơn"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Khách hàng mới"
                        value={summary.newCustomers || 0}
                        icon={<People />}
                        color="#9C27B0"
                        subtitle="Trong kỳ báo cáo"
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Revenue Chart */}
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                                Biểu đồ doanh thu theo thời gian
                            </Typography>
                            {loading ? (
                                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography>Đang tải...</Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                        <Tooltip 
                                            formatter={(value: any) => [formatCurrency(value), 'Doanh thu']}
                                            labelFormatter={(label) => `Ngày: ${label}`}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#2196F3" 
                                            fillOpacity={0.6}
                                            fill="#2196F3"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Category Performance */}
                <Grid item xs={12} lg={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                                Doanh thu theo danh mục
                            </Typography>
                            {loading ? (
                                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography>Đang tải...</Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => [formatCurrency(value), 'Doanh thu']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Orders Chart */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                                Số lượng đơn hàng theo ngày
                            </Typography>
                            {loading ? (
                                <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography>Đang tải...</Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="orders" fill="#4CAF50" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Conversion Rate */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                                Tỷ lệ chuyển đổi
                            </Typography>
                            {loading ? (
                                <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography>Đang tải...</Typography>
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis tickFormatter={(value) => `${value}%`} />
                                        <Tooltip formatter={(value: any) => [`${value}%`, 'Tỷ lệ chuyển đổi']} />
                                        <Line 
                                            type="monotone" 
                                            dataKey="conversionRate" 
                                            stroke="#FF9800" 
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminAnalytics;
