import instance from '../utils/axios';

export const getSubmission = async (opts = {}) => {
    const data = await instance.get('/submissions', opts);
    return data;
};

export const storeSubmission = async (payload, opts = {}) => {
    const data = await instance.post('/submissions', payload, opts);
    return data;
};

export const laporan = async (payload, opts = {}) => {
    const data = await instance.post('/laporan', payload, opts);
    return data;
};

export const showSubmission = async (id, opts={}) => {
    const data = await instance.get(`/submissions/${id}`, opts);
    return data;
}

export const storeSubmissionAttachment = async (payload, opts = {}) => {
    const data = await instance.post('/attachment-submissions', payload, opts);
    return data;
};

export const updateStatus = async (id, payload, opts ={}) => {
    const data = await instance.put(`/submissions/update-status/${id}`, payload, opts)
    return data;
}

export const update = async (id, payload, opts ={}) => {
    const data = await instance.put(`/submissions/${id}`, payload, opts)
    return data;
}
export const deleteSUbmission = async (id, opts = {}) => {
    const data = await instance.delete(`/submissions/${id}`, opts);
    return data;
};

export const updateFullfilment = async (id, payload, opts ={}) => {
    const data = await instance.put(`/submissions/update-fullfilment/${id}`, payload, opts)
    return data;
}

export const updateStatusCompleted = async (id, payload, opts ={}) => {
    const data = await instance.put(`/submission/updateCompleted/${id}`, payload, opts)
    return data;
}


