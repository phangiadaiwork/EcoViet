import axios from '../../utils/axiosCustomize';

export const callGetCategories = () => {
    return axios.get('/api/v1/categories');
};

export const callGetCategoryById = (id: string) => {
    return axios.get(`/api/v1/categories/${id}`);
};

export const callGetCategoryBySlug = (slug: string) => {
    return axios.get(`/api/v1/categories/slug/${slug}`);
};

export const callGetCategoryTree = () => {
    return axios.get('/api/v1/categories/tree');
};
