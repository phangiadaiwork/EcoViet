import axios from '../../utils/axiosCustomize';

export const callGetCart = () => {
    return axios.get('/api/v1/cart');
};

export const callAddToCart = (productId: string, quantity: number) => {
    return axios.post('/api/v1/cart/add', { 
        product_id: productId, 
        quantity 
    });
};

export const callUpdateCartItem = (productId: string, quantity: number) => {
    return axios.put('/api/v1/cart/update', { 
        productId, 
        quantity 
    });
};

export const callRemoveFromCart = (productId: string) => {
    return axios.delete(`/api/v1/cart/remove/${productId}`);
};

export const callClearCart = () => {
    return axios.delete('/api/v1/cart/clear');
};

export const callGetCartCount = () => {
    return axios.get('/api/v1/cart/count');
};
