import instance from '../utils/axios';

export const getUser = async (opts = {}) => {
    const data = await instance.get('/users', opts);
    return data;
}

export const storeUser = async (payload, opts = {}) => {
    const data = await instance.post('/users', payload, opts);
    return data;
}

export const deleteUser = async (id, opts = {}) => {
    const data = await instance.delete(`/users/${id}`, opts);
    return data;
}

export const updateUser = async (id, payload, opts ={}) => {
    const data = await instance.put(`users/${id}`, payload, opts)
    return data;
}