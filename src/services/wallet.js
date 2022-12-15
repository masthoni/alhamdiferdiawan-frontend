import instance from '../utils/axios';

export const getWallet = async (opts = {}) => {
    const data = await instance.get('/wallets', opts);
    return data;
};

export const storeWallet = async (payload, opts = {}) => {
    const data = await instance.post('/wallets', payload, opts);
    return data;
};

export const deleteWallet = async (id, opts = {}) => {
    const data = await instance.delete(`/wallets/${id}`, opts);
    return data;
};

export const updateWallet = async (id, payload, opts = {}) => {
    const data = await instance.put(`wallets/${id}`, payload, opts);
    return data;
};
