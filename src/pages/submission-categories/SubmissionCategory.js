import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import DataTable from 'react-data-table-component';
import {toast} from 'react-toastify';

import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../store/actions';
import * as SubmissionCategoryService from '../../services/submission-category';

const SubmissionCategory = ({
    getSubmissionCategory,
    submissionCategory,
    storeSubmissionCategory,
    deleteSubmissionCategory,
    updateSubmissionCategory
}) => {
    const [t] = useTranslation();

    const [payload, setPayload] = React.useState({
        id: null,
        submissionCategory: null,
        submissionType: null,
        maximumSubmission: 0
    });

    const [search, setSearch] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(10);
    const [totalRow, setTotalRow] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [dataCategorySubmission, setDataCategorySubmission] = React.useState(
        []
    );
    const [show, setShow] = React.useState(false);
    const [tabIndex, setTabIndex] = React.useState(-1);
    const [columns, setColumn] = React.useState([]);

    useEffect(() => {
        getData(page, size);
    }, []);

    useEffect(() => {
        setDataCategorySubmission(submissionCategory);
        setColumn([
            {
                name: 'No',
                cell: (row, index) => `${index + 1 + (page + 1 - 1) * size}.`,
                width: '10%'
            },
            {
                name: 'Category Name',
                selector: 'submissionCategory'
            },
            {
                name: 'Type Category',
                selector: 'submissionType'
            },
            {
                name: 'Maximum Submission',
                selector: 'maximumSubmission'
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
    }, [submissionCategory]);

    const getData = async (pageChange, sizeChange = size) => {
        const opts = {
            params: {
                page: pageChange,
                size: sizeChange,
                q: search
            }
        };
        setLoading(!loading);
        SubmissionCategoryService.getSubmissionCategory(opts).then((data) => {
            setTimeout(() => {
                setLoading(false);
                getSubmissionCategory(data.data.data.rows);
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
            SubmissionCategoryService.deleteSubmissionCategory(id)
                .then((data) => {
                    setTimeout(() => {
                        deleteSubmissionCategory(index);
                        setLoading(false);
                    }, 1000);
                    toast.success('Submission Category Deleted!');
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
            const {createdAt, updatedAt, ...newData} = data;
            setPayload({...newData});
        } else {
            clearInput();
        }
    };

    const clearInput = () => {
        setPayload({
            id: null,
            submissionCategory: null,
            submissionType: null,
            maximumSubmission: 0
        });
    };
    const handleSubmit = () => {
        setLoading(!loading);
        if (tabIndex === -1) {
            const payloadData = {
                submissionCategory: payload.submissionCategory,
                submissionType: payload.submissionType,
                maximumSubmission: payload.maximumSubmission
            };
            SubmissionCategoryService.storeSubmissionCategory(payloadData)
                .then((data) => {
                    setTimeout(() => {
                        storeSubmissionCategory(data.data);
                        setLoading(false);
                        setShow(false);
                        toast.success('Submission Category Created!');
                    }, 1000);
                })
                .catch((error) => {
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                });
        } else {
            const payloadData = {
                submissionCategory: payload.submissionCategory,
                submissionType: payload.submissionType,
                maximumSubmission: payload.maximumSubmission
            };
            SubmissionCategoryService.updateSubmissionCategory(
                payload.id,
                payloadData
            )
                .then((data) => {
                    setTimeout(() => {
                        updateSubmissionCategory(tabIndex, data.data);
                        setLoading(false);
                        setShow(false);
                        toast.success('Submission Category Updated!');
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
                            {tabIndex === -1
                                ? 'Create Kategori Submission'
                                : 'Edit Kategori Submission'}
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
                                htmlFor="Category Name"
                                className="col-sm-3 col-form-label"
                            >
                                Category Name
                            </label>
                            <div className="col-sm-9">
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={payload.submissionCategory}
                                    placeholder="Category Name"
                                    onChange={(e) => {
                                        setPayload({
                                            ...payload,
                                            submissionCategory: e.target.value
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label
                                htmlFor="submissionType"
                                className="col-sm-3 col-form-label"
                            >
                                Submission Type
                            </label>
                            <div className="col-sm-9">
                                <select
                                    className="form-control"
                                    defaultValue={payload.submissionType}
                                    onChange={(e) => {
                                        setPayload({
                                            ...payload,
                                            submissionType: e.target.value
                                        });
                                    }}
                                >
                                    <option value="">
                                        -Please choose a type submission-
                                    </option>
                                    <option value="PEMASUKAN">Pemasukan</option>
                                    <option value="PENGELUARAN">
                                        Pengeluaran
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label
                                htmlFor="submissionType"
                                className="col-sm-3 col-form-label"
                            >
                                Maximum Submission
                            </label>
                            <div className="col-sm-9">
                                <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={payload.maximumSubmission}
                                    placeholder="Category Name"
                                    onChange={(e) => {
                                        setPayload({
                                            ...payload,
                                            maximumSubmission: e.target.value
                                        });
                                    }}
                                />
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
                            <h1>Kategori Submission</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">{t('header.label.home')}</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Kategori Submission
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
                                                    placeholder="Search Category"
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
                                                Create Kategori Submission
                                            </button>
                                        </div>
                                    </div>
                                    <DataTable
                                        title="Arnold Movies"
                                        columns={columns}
                                        data={dataCategorySubmission}
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
    submissionCategory: state.submissionCategory.submissionCategory,
    detailSubmissionCategory: state.submissionCategory.detailSubmissionCategory
});

const mapDispatchToProps = (dispatch) => ({
    getSubmissionCategory: (submissionCategory) =>
        dispatch({
            type: ActionTypes.LOAD_SUBMISSION_CATEGORY,
            submissionCategory
        }),
    storeSubmissionCategory: (detailSubmissionCategory) =>
        dispatch({
            type: ActionTypes.STORE_SUBMISSION_CATEGORY,
            detailSubmissionCategory
        }),
    deleteSubmissionCategory: (indexSubmissionCategory) =>
        dispatch({
            type: ActionTypes.DELETE_SUBMISSION_CATEGORY,
            index: indexSubmissionCategory
        }),
    updateSubmissionCategory: (
        indexSubmissionCategory,
        detailSubmissionCategory
    ) =>
        dispatch({
            type: ActionTypes.UPDATE_SUBMISSION_CATEGORY,
            detailSubmissionCategory,
            index: indexSubmissionCategory
        })
});

export default connect(mapStateToProps, mapDispatchToProps)(SubmissionCategory);
