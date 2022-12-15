import React from 'react'
import axios from 'axios';
import {toast} from 'react-toastify';
import NProgress from "nprogress";
import ReactHtmlParser from "react-html-parser";

import store from '../store/index';
import * as ActionTypes from '../store/actions';

const intance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`
});

intance.interceptors.request.use(
    (request) => {
        NProgress.start();
        const {token} = store.getState().auth;
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }

        if(request.body instanceof FormData){
            request["headers"]["common"]["Content-Type"] = 'multipart/form-data'
        }
        return request;
    },
    (error) => {
        return Promise.reject(error);
    }
);

intance.interceptors.response.use(
    (response) => {
        NProgress.done();
        return response
    },
    (error) => {
        NProgress.done();
        if (error.response.status === 401) {
            store.dispatch({type: ActionTypes.LOGOUT_USER});
        }

        if(error.response.status === 422){
            let message = "";
            error.response.data.data.forEach(element => {
                message += `<div>${element.message}</div>`
            });
            
            toast.error(
                <div>
                    <h4 style={{ color: "white", fontWeight: "bold" }}>There is wrong data !!</h4>
                    {ReactHtmlParser(message)}
                </div>
            );
        }else{
            toast.error(
                <div>
                    {error.response.data.message}
                </div>
            );
        }


        return Promise.reject(error);
    }
);

export default intance;
