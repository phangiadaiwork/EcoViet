import axios from '../../utils/axiosCustomize';

// Get user orders
export const callGetUserOrders = (params?: { page?: number; limit?: number; status?: string }) => {
    return axios.get('/api/v1/orders', { params });
};

// Get order by ID
export const callGetOrderById = (orderId: string) => {
    return axios.get(`/api/v1/orders/${orderId}`);
};

// Cancel order
export const callCancelOrder = (orderId: string) => {
    return axios.post(`/api/v1/orders/${orderId}/cancel`);
};

// Get order statuses for filtering
export const getOrderStatuses = () => {
    return [
        { value: 'PENDING', label: 'Chờ xử lý', color: 'warning' },
        { value: 'PROCESSING', label: 'Đang xử lý', color: 'info' },
        { value: 'SHIPPED', label: 'Đã giao', color: 'primary' },
        { value: 'DELIVERED', label: 'Hoàn thành', color: 'success' },
        { value: 'CANCELLED', label: 'Đã hủy', color: 'error' },
        { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'secondary' }
    ];
};

// Format currency
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Format date
export const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
};
