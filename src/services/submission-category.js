import instance from '../utils/axios';

export const getSubmissionCategory = async (opts = {}) => {
    const data = await instance.get('/submission-categories', opts);
    return data;
};

export const storeSubmissionCategory = async (payload, opts = {}) => {
    const data = await instance.post('/submission-categories', payload, opts);
    return data;
};

export const deleteSubmissionCategory = async (id, opts = {}) => {
    const data = await instance.delete(`/submission-categories/${id}`, opts);
    return data;
};

export const updateSubmissionCategory = async (id, payload, opts = {}) => {
    const data = await instance.put(
        `submission-categories/${id}`,
        payload,
        opts
    );
    return data;
};

export const getSpesificSubmissionCategory = async (opts = {}) => {
    const data = await instance.get('/get-submission-categories', opts);
    return data;
};