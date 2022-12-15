import instance from '../utils/axios';

export const getCompany = async (opts = {}) => {
    const data = await instance.get('/company-profile', opts);
    return data;
};

export const storeCompany = async (payload, opts = {}) => {
    const data = await instance.post('/company-profile', payload, opts);
    return data;
};

export const deleteProduct = async (id, opts = {}) => {
    const data = await instance.delete(`/products/${id}`, opts);
    return data;
};

export const updateCompany = async (id, payload, opts = {}) => {
    const data = await instance.put(`company-profile/${id}`, payload, opts);
    return data;
};
