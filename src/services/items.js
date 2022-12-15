import instance from '../utils/axios';

export const getItems = async (opts = {}) => {
    const data = await instance.get('/get-items', opts);
    return data;
};

export const get = async (opts = {}) => {
    const data = await instance.get('/items', opts);
    return data;
};

