import instance from '../utils/axios';

export const getProductCategory = async (opts = {}) => {
    const data = await instance.get('/product-categories', opts);
    return data;
};

export const storeProductCategory = async (payload, opts = {}) => {
    const data = await instance.post('/product-categories', payload, opts);
    return data;
};

export const deleteProductCategory = async (id, opts = {}) => {
    const data = await instance.delete(`/product-categories/${id}`, opts);
    return data;
};

export const updateProductCategory = async (id, payload, opts = {}) => {
    const data = await instance.put(`product-categories/${id}`, payload, opts);
    return data;
};
