import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import DataTable from 'react-data-table-component';
import {toast} from 'react-toastify';

import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../store/actions';
import * as UserService from '../../services/user';

const ManageUser = ({getUser, users, storeUser, deleteUser, updateUser}) => {
    const [t] = useTranslation();

    const [payload, setPayload] = React.useState({
        id: null,
        username: null,
        fullName: null,
        email: null,
        password: null,
        role: null,
        imageUser: null
    });
    const [search, setSearch] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(10);
    const [totalRow, setTotalRow] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [dataUser, setDataUser] = React.useState([]);
    const [show, setShow] = React.useState(false);
    const [tabIndex, setTabIndex] = React.useState(-1);
    const [dataImage, setDataImage] = React.useState(null);
    const [columns, setColumn] = React.useState([]);

    useEffect(() => {
        getData(page, size);
    }, []);

    useEffect(() => {
        setDataUser(users);
        setColumn([
            {
                name: 'No',
                cell: (row, index) => `${index + 1 + (page + 1 - 1) * size}.`,
                width: '10%'
            },
            {
                name: 'Nama',
                selector: 'fullName'
            },
            {
                name: 'Username',
                selector: 'username'
            },
            {
                name: 'Email',
                selector: 'email'
            },
            {
                name: 'Role',
                selector: 'role'
            },
            {
                name: 'Image',
                cell: (row, index) => (
                    <div>
                        <img
                            src={
                                row.imageUser
                                    ? process.env.REACT_APP_URL_FOTO_USER +
                                      row.imageUser
                                    : '/img/default-profile.png'
                            }
                            width="75"
                            height="75"
                            className="elevation-2 mt-2 mb-2"
                            alt="User"
                        />
                    </div>
                )
            },
            {
                name: 'Action',
                width: '10%',
                cell: (row, index) => (
                    <div>
                        <i
                            role="button"
                            aria-label="Edit Data"
                            onClick={() => handleShow(index, row)}
                            className="fa fa-edit fa-lg"
                            style={{color: '#0275d8'}}
                        >
                        </i>
{' '}
                        <i
                            role="button"
                            aria-label="Hapus Data"
                            onClick={(e) => handleDelete(row.id, index)}
                            className="fa fa-trash fa-lg"
                            style={{color: '#d9534f'}}
                        >
                        </i>
                    </div>
                )
            }
        ]);
    }, [users]);

    const getData = async (pageChange, sizeChange = size) => {
        const opts = {
            params: {
                page: pageChange,
                size: sizeChange,
                q: search
            }
        };
        setLoading(!loading);
        UserService.getUser(opts).then((data) => {
            setTimeout(() => {
                setLoading(false);
                getUser(data.data.data.rows);
                setTotalRow(data.data.data.totalItems);
            }, 1000);
        });
    };

    const handlePageChange = (pageChange) => {
        setPage(pageChange - 1);
        getData(pageChange - 1, size);
    };

    const handlePerRowsChange = async (newPerPage, pageCurrent) => {
        setSize(newPerPage);
        getData(pageCurrent - 1, newPerPage);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            getData(page, size);
        }
    };

    const handleClose = () => setShow(false);

    const handleDelete = (id, index) => {
        if (window.confirm('Anda Yakin Ingin Menghapus Data Ini ?')) {
            // eslint-disable-line no-alert

            setLoading(!loading);
            UserService.deleteUser(id)
                .then((data) => {
                    setTimeout(() => {
                        deleteUser(index);
                        setLoading(false);
                    }, 1000);
                    toast.success('User Deleted!');
                })
                .catch((error) => {
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                });
        }
    };

    const handleShow = (index, data) => {
        setShow(true);
        setTabIndex(index);
        if (data) {
            const {createdAt, updatedAt, imageUser, ...newData} = data;
            setDataImage(data.imageUser);
            setPayload({...newData});
        } else {
            clearInput();
            setDataImage(null);
        }
    };

    const clearInput = () => {
        setPayload({
            id: null,
            fullName: null,
            username: null,
            email: null,
            password: null,
            role: null,
            imageUser: null
        });
    };

    const handleSubmit = () => {
        setLoading(!loading);
        if (tabIndex === -1) {
            const payloadData = new FormData();
            payloadData.append('fullName', payload.fullName);
            payloadData.append('password', payload.password);
            payloadData.append('email', payload.email);
            payloadData.append('username', payload.username);
            payloadData.append('role', payload.role);
            payloadData.append('imageUser', payload.imageUser);
            UserService.storeUser(payloadData)
                .then((data) => {
                    setTimeout(() => {
                        storeUser(data.data);
                        setLoading(false);
                        setShow(false);
                        toast.success('User Created!');
                    }, 1000);
                })
                .catch((error) => {
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                });
        } else {
            const payloadData = new FormData();
            payloadData.append('fullName', payload.fullName);
            payloadData.append('email', payload.email);
            payloadData.append('username', payload.username);
            payloadData.append('role', payload.role);
            payloadData.append('imageUser', payload.imageUser);
            UserService.updateUser(payload.id, payloadData)
                .then((data) => {
                    setTimeout(() => {
                        updateUser(tabIndex, data.data);
                        setLoading(false);
                        setShow(false);
                        toast.success('User Updated!');
                    }, 1000);
                })
                .catch((error) => {
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                });
        }
    };

    return (
        <>
            <LoadingSpinner isLoading={loading} />
            {/* Modal */}
            <Modal
                customTitle={(
                    <div>
                        <h4
                            style={{
                                fontSize: '1.3rem',
                                color: '#252733',
                                fontWeight: 'bold'
                            }}
                        >
                            {tabIndex === -1 ? 'Create User' : 'Edit User'}
                        </h4>
                    </div>
                  )}
                size="lg"
                show={show}
                onHide={handleClose}
                onClose={handleClose}
                backdrop="static"
                keyboard={false}
                onSubmit={handleSubmit}
                body={(
                    <div className="m-5">
                        <div className="form-group row">
                            <label
                                htmlFor="Full Name"
                                className="col-sm-2 col-form-label"
                            >
                                Full Name
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={payload.fullName}
                                    placeholder="Full Name"
                                    onChange={(e) => {
                                        setPayload({
                                            ...payload,
                                            fullName: e.target.value
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label
                                htmlFor="Email"
                                className="col-sm-2 col-form-label"
                            >
                                Email
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="email"
                                    className="form-control"
                                    defaultValue={payload.email}
                                    placeholder="Email"
                                    onChange={(e) => {
                                        setPayload({
                                            ...payload,
                                            email: e.target.value
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label
                                htmlFor="Username"
                                className="col-sm-2 col-form-label"
                            >
                                Username
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={payload.username}
                                    placeholder="Username"
                                    onChange={(e) => {
                                        setPayload({
                                            ...payload,
                                            username: e.target.value
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        {tabIndex === -1 && (
                            <div className="form-group row">
                                <label
                                    htmlFor="Password"
                                    className="col-sm-2 col-form-label"
                                >
                                    Password
                                </label>
                                <div className="col-sm-10">
                                    <input
                                        type="password"
                                        className="form-control"
                                        defaultValue={payload.password}
                                        placeholder="Password"
                                        onChange={(e) => {
                                            setPayload({
                                                ...payload,
                                                password: e.target.value
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="form-group row">
                            <label
                                htmlFor="Role"
                                className="col-sm-2 col-form-label"
                            >
                                Role
                            </label>
                            <div className="col-sm-10">
                                <select
                                    className="form-control"
                                    defaultValue={payload.role}
                                    onChange={(e) => {
                                        setPayload({
                                            ...payload,
                                            role: e.target.value
                                        });
                                    }}
                                >
                                    <option value="">
                                        -Please choose a role-
                                    </option>
                                    <option value="admin">Admin</option>
                                    <option value="karyawan">Karyawan</option>
                                </select>
                            </div>
                        </div>
                        {tabIndex !== -1 && (
                            <div className="form-group row">
                                <label
                                    htmlFor="Foto"
                                    className="col-sm-2 col-form-label"
                                >
                                    {' '}
                                </label>
                                <div className="col-sm-10">
                                    <img
                                        src={
                                            dataImage
                                                ? process.env
                                                      .REACT_APP_URL_FOTO_USER +
                                                  dataImage
                                                : '/img/default-profile.png'
                                        }
                                        width="100"
                                        height="100"
                                        className="elevation-2"
                                        alt="User"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="form-group row">
                            <label
                                htmlFor="Foto"
                                className="col-sm-2 col-form-label"
                            >
                                Image
                            </label>
                            <div className="col-sm-10">
                                <div className="custom-file">
                                    <input
                                        type="file"
                                        className="custom-file-input"
                                        id="customFile"
                                        onChange={(e) => {
                                            setPayload({
                                                ...payload,
                                                imageUser: e.target.files[0]
                                            });
                                        }}
                                    />
                                    <label
                                        htmlFor="Foto"
                                        className="custom-file-label"
                                    >
                                        {payload.imageUser
                                            ? payload.imageUser.name
                                            : 'Choose file'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}
                submitTitle="Save"
                closeTitle="Close"
            />
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Manage User</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">{t('header.label.home')}</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Manage User
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
            <section className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card card-primary card-outline">
                                <div className="card-body box-profile">
                                    <div className="row mb-2">
                                        <div className="col-sm-5">
                                            <div className="input-group mb-3">
                                                <div className="input-group-prepend">
                                                    <span
                                                        className="input-group-text"
                                                        style={{
                                                            background:
                                                                'transparent',
                                                            borderRight: 'none'
                                                        }}
                                                    >
                                                        <i
                                                            style={{
                                                                color:
                                                                    'rgb(17, 78, 96)'
                                                            }}
                                                            className="fas fa-search"
                                                        >
                                                        </i>
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    style={{borderLeft: 'none'}}
                                                    className="form-control"
                                                    placeholder="Search User"
                                                    defaultValue={search}
                                                    onChange={(e) =>
                                                        setSearch(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyPress={(e) =>
                                                        handleSearch(e)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-7">
                                            <button
                                                className="float-right btn btn-success btn-sm"
                                                type="button"
                                                style={{
                                                    background:
                                                        'rgb(17, 78, 96)',
                                                    borderColor:
                                                        'rgb(17, 78, 96)'
                                                }}
                                                onClick={() => handleShow(-1)}
                                            >
                                                Create User
                                            </button>
                                        </div>
                                    </div>
                                    <DataTable
                                        title="Arnold Movies"
                                        columns={columns}
                                        data={dataUser}
                                        noHeader
                                        highlightOnHover
                                        paginationTotalRows={totalRow}
                                        paginationPerPage={size}
                                        pagination
                                        paginationServer
                                        onChangePage={handlePageChange}
                                        onChangeRowsPerPage={
                                            handlePerRowsChange
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

const mapStateToProps = (state) => ({
    users: state.user.users,
    detailUser: state.user.detailUser
});

const mapDispatchToProps = (dispatch) => ({
    getUser: (users) => dispatch({type: ActionTypes.LOAD_USERS, users}),
    storeUser: (detailUser) =>
        dispatch({type: ActionTypes.STORE_USER, detailUser}),
    deleteUser: (indexUser) =>
        dispatch({type: ActionTypes.DELETE_USER, index: indexUser}),
    updateUser: (indexUser, detailUser) =>
        dispatch({type: ActionTypes.UPDATE_USER, detailUser, index: indexUser})
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageUser);
