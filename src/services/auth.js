import instance from '../utils/axios';

export const loginByAuth = async (email, password) => {
    const token = await instance.post('/login', {
                email, password
            });
    document.getElementById('root').classList.remove('login-page');
    document.getElementById('root').classList.remove('hold-transition');
    return token;
};

export const getProfile = async () => {
    const data = await instance.get('/me');
    return data;
}

export const logOut = async () => {
    const data = await instance.post('/logout')
    return data;
}
