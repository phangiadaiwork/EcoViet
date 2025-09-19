import axios from '../../utils/axiosCustomize';

// Dashboard Statistics
export const callAdminDashboard = () => {
    return axios.get('/api/v1/admin/dashboard');
};

// Product Management
export const callGetAllProducts = (params?: any) => {
    return axios.get('/api/v1/admin/products', { params });
};

export const callCreateProduct = (data: any) => {
    return axios.post('/api/v1/admin/products', data);
};

export const callUpdateProduct = (id: string, data: any) => {
    return axios.put(`/api/v1/admin/products/${id}`, data);
};

export const callDeleteProduct = (id: string) => {
    return axios.delete(`/api/v1/admin/products/${id}`);
};

// Category Management
export const callGetAllCategories = (params?: any) => {
    return axios.get('/api/v1/admin/categories', { params });
};

export const callCreateCategory = (data: any) => {
    return axios.post('/api/v1/admin/categories', data);
};

export const callUpdateCategory = (id: string, data: any) => {
    return axios.put(`/api/v1/admin/categories/${id}`, data);
};

export const callDeleteCategory = (id: string) => {
    return axios.delete(`/api/v1/admin/categories/${id}`);
};

// Order Management
export const callGetAllOrders = (params?: any) => {
    return axios.get('/api/v1/admin/orders', { params });
};

export const callUpdateOrderStatus = (orderId: string, status: string) => {
    return axios.put(`/api/v1/admin/orders/${orderId}/status`, { status });
};

export const callGetOrderDetails = (orderId: string) => {
    return axios.get(`/api/v1/admin/orders/${orderId}`);
};

// User Management
export const callGetAllUsers = (params?: any) => {
    return axios.get('/api/v1/admin/users', { params });
};

export const callUpdateUserStatus = (userId: string, status: string) => {
    return axios.put(`/api/v1/admin/users/${userId}/status`, { status });
};

export const callGetUserDetails = (userId: string) => {
    return axios.get(`/api/v1/admin/users/${userId}`);
};

// Revenue & Analytics
export const callGetRevenueAnalytics = (params?: { startDate?: string; endDate?: string; period?: string }) => {
    return axios.get('/api/v1/admin/analytics/revenue', { params });
};

export const callGetTopProducts = (params?: { limit?: number; period?: string }) => {
    return axios.get('/api/v1/admin/analytics/top-products', { params });
};

export const callGetRecentActivities = (params?: { limit?: number }) => {
    return axios.get('/api/v1/admin/activities', { params });
};


