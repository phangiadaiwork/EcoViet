import axiosCustomize from '../../utils/axiosCustomize';

// Home Page API
export const callGetHomePageData = () => {
  return axiosCustomize.get('/api/v1/home/data');
};

export const callGetFeaturedProducts = (limit?: number) => {
  return axiosCustomize.get('/api/v1/home/featured-products', { 
    params: limit ? { limit } : {} 
  });
};

export const callGetFeaturedCategories = (limit?: number) => {
  return axiosCustomize.get('/api/v1/home/featured-categories', { 
    params: limit ? { limit } : {} 
  });
};

// Categories API
export const callGetAllCategories = () => {
  return axiosCustomize.get('/api/categories');
};

export const callGetCategoryById = (id: string) => {
  return axiosCustomize.get(`/api/categories/${id}`);
};

// Products API
export const callGetAllProducts = (params?: any) => {
  return axiosCustomize.get('/api/products', { params });
};

export const callGetProductById = (id: string) => {
  return axiosCustomize.get(`/api/products/${id}`);
};

export const callSearchProducts = (query: string) => {
  return axiosCustomize.get(`/api/products/search?q=${query}`);
};

// Newsletter API
export const callSubscribeNewsletter = (email: string) => {
  return axiosCustomize.post('/api/newsletter/subscribe', { email });
};
