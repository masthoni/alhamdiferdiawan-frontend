import React, {useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {toast} from 'react-toastify';
import {connect} from 'react-redux';
import {useFormik} from 'formik';
import {useTranslation} from 'react-i18next';

import * as AuthService from '../../services/auth';
import Button from '../../components/button/Button';
import * as ActionTypes from '../../store/actions';
import LoadingSpinner from '../../components/loading-spinner/LoadingSpinner'



const Login = ({onUserLogin}) => {
    const [isAuthLoading, setAuthLoading] = useState(false);


    const history = useHistory();
    const [t] = useTranslation();
    const [loading, setLoading] = React.useState(false);

    const login = (email, password) => {
        setLoading(!loading);
        setAuthLoading(true);
        setTimeout(() => {
            AuthService.loginByAuth(email, password)
                .then((token) => {
                    toast.success('Login is succeed!');
                    setAuthLoading(false);
                    setLoading(false);
                    onUserLogin(token.data);
                    history.go('/');
                })
                .catch((error) => {
                    setLoading(false);
                    setAuthLoading(false);
                    toast.error(
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                            'Failed'
                    );
                });
        }, 1000);
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: (values) => {
            login(values.email, values.password);
        }
    });

    document.getElementById('root').classList = 'hold-transition login-page';

    return (
        <div className="login-box">
            <LoadingSpinner 
                isLoading={loading}
            />
            <div className="card card-outline card-primary">
                <div className="card-header text-center">
                    <Link to="/" className="h1">
                        <b>Form</b>
                        <span>Login</span>
                    </Link>
                </div>
                <div className="card-body">
                    <p className="login-box-msg">{t('login.label.signIn')}</p>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-3">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Email Or Username"
                                    {...formik.getFieldProps('email')}
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text">
                                        <span className="fas fa-user" />
                                    </div>
                                </div>
                            </div>
                            {formik.touched.email && formik.errors.email ? (
                                <div>{formik.errors.email}</div>
                            ) : null}
                        </div>
                        <div className="mb-3">
                            <div className="input-group">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    {...formik.getFieldProps('password')}
                                />
                                <div className="input-group-append">
                                    <div className="input-group-text">
                                        <span className="fas fa-lock" />
                                    </div>
                                </div>
                            </div>
                            {formik.touched.password &&
                            formik.errors.password ? (
                                <div>{formik.errors.password}</div>
                            ) : null}
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <Button
                                    block
                                    type="submit"
                                    isLoading={isAuthLoading}
                                >
                                    {t('login.button.signIn.label')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => ({
    onUserLogin: (token) => dispatch({type: ActionTypes.LOGIN_USER, token})
});

export default connect(null, mapDispatchToProps)(Login);
