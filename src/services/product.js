import instance from '../utils/axios';

export const getProduct = async (opts = {}) => {
    const data = await instance.get('/products', opts);
    return data;
};

export const storeProduct = async (payload, opts = {}) => {
    const data = await instance.post('/products', payload, opts);
    return data;
};

export const deleteProduct = async (id, opts = {}) => {
    const data = await instance.delete(`/products/${id}`, opts);
    return data;
};

export const updateProduct = async (id, payload, opts = {}) => {
    const data = await instance.put(`products/${id}`, payload, opts);
    return data;
};
