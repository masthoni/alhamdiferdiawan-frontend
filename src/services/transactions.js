import instance from '../utils/axios';

export const getTransactions = async (opts = {}) => {
    const data = await instance.get('/transactions', opts);
    return data;
};

export const storeTransaction = async (payload, opts = {}) => {
    const data = await instance.post('/transactions', payload, opts);
    return data;
};

// export const showSubmission = async (id, opts={}) => {
//     const data = await instance.get(`/submissions/${id}`, opts);
//     return data;
// }