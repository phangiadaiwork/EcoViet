import axios from '../../utils/axiosCustomize';

export const callGetProducts = (params: any) => {
    // Transform frontend params to backend format
    const backendParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.category && { category: params.category }),
        ...(params.search && { search: params.search }),
        ...(params.minPrice && { minPrice: params.minPrice.toString() }),
        ...(params.maxPrice && params.maxPrice < 1000000 && { maxPrice: params.maxPrice.toString() }),
        ...(params.sortBy && { sort: transformSortParam(params.sortBy) })
    };
    
    return axios.get('/api/v1/products', { params: backendParams });
};

// Transform frontend sort to backend format
const transformSortParam = (sortBy: string) => {
    switch (sortBy) {
        case 'price':
            return 'price-asc';
        case '-price':
            return 'price-desc';
        case 'name':
        case '-name':
            return 'name';
        case '-createdAt':
        default:
            return 'newest';
    }
};

export const callGetProductById = (id: string) => {
    return axios.get(`/api/v1/products/${id}`);
};

export const callGetProductBySlug = (slug: string) => {
    return axios.get(`/api/v1/products/slug/${slug}`);
};

export const callSearchProducts = (query: string, filters?: any) => {
    const backendParams = {
        search: query,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        ...(filters?.category && { category: filters.category }),
        ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters?.maxPrice && filters.maxPrice < 1000000 && { maxPrice: filters.maxPrice.toString() }),
        ...(filters?.sortBy && { sort: transformSortParam(filters.sortBy) })
    };
    
    return axios.get('/api/v1/products', { params: backendParams });
};

export const callGetFeaturedProducts = () => {
    return axios.get('/api/v1/products/featured');
};

export const callGetProductsByCategory = (categoryId: string, params?: any) => {
    const backendParams = {
        category: categoryId,
        page: params?.page || 1,
        limit: params?.limit || 10,
        ...(params?.minPrice && { minPrice: params.minPrice.toString() }),
        ...(params?.maxPrice && params.maxPrice < 1000000 && { maxPrice: params.maxPrice.toString() }),
        ...(params?.sortBy && { sort: transformSortParam(params.sortBy) })
    };
    
    return axios.get('/api/v1/products', { params: backendParams });
};
