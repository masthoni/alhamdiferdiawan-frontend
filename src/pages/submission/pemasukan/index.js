import React, {useEffect} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import DataTable from 'react-data-table-component';
import {toast} from 'react-toastify';
import {OverlayTrigger, Badge, Tooltip, Row, Col, Button, Table, Tabs, Tab, InputGroup, Form} from 'react-bootstrap';
import dayjs from 'dayjs';
import { formatCurrency } from "@app/utils/number";

import LoadingSpinner from '../../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../../store/actions';
import * as SubmissionService from '../../../services/submission';
import Modal from '../../../components/Modal'

const Submissions = ({
    getSubmission,
    submissions,
    updateStatus,
    detailSubmission,
    deleteSubmission,
    updateFullfilment
}) => {
    const [t] = useTranslation();
    const history = useHistory();

    const [search, setSearch] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(10);
    const [totalRow, setTotalRow] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [dataSubmissions, setDataSubmissions] = React.useState([]);
    const [detail, setDetail] = React.useState({});
    const [show, setShow] = React.useState(false);
    const [tabIndex, setTabIndex] = React.useState(-1);
    const [columns, setColumn] = React.useState([]);
    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')));
    const [payloadFullfilment, setPayloadFullfilment] = React.useState({
        fullfilment: true,
        status: ''
    });

    useEffect(() => {
        getData(page, size);
    }, []);

    useEffect(() => {
        setDataSubmissions(submissions);
        setColumn([
            {
                name: 'No',
                cell: (row, index) => `${index + 1 + (page + 1 - 1) * size}.`,
                width: '5%'
            },
            {
                name: 'Date',
                selector: (row, index) => (
                    <u style={{ color:'rgb(17, 78, 96)', cursor: 'pointer' }}
                        onClick={() => {
                            history.push(`/pemasukan/invoice/${row.id}`);
                        }}
                    >
                        {dayjs(row.date).format("YYYY-MM-DD HH:mm:ss")}
                    </u>
                ),
            },
            {
                name: 'Submisison Name',
                selector: 'submissionName',
            },
            {
                name: 'Amount',
                selector: (row, index) => convertCurrency(parseFloat(row.amount)),
            },
            {
                name: 'Submission Category',
                selector: 'submission_category.submissionCategory',
            },
            {
                name: 'Status',
                selector: (row, index) => statusSubmission(row.status),
            },
            {
                name: 'Action',
                width: '10%',
                cell: (row, index) => (
                    <div>
                        {((row.status === 'PENDING' && user.role === 'admin')) ? <i
                            role="button"
                            aria-label="Edit Data"
                            onClick={() => handleApporoveStatus(index, row)}
                            className="fa fa-check fa-lg text-success"
                        ></i>  : ''}
                        {'\u00A0'}
                        {'\u00A0'}
                        {((row.status === 'PENDING') && user.role === 'admin') ? <i
                            role="button"
                            aria-label="Edit Data"
                            onClick={() => handleRejectStatus(index, row)}
                            className="fa fa-times fa-lg text-danger"
                        ></i> : ''}
                        {'\u00A0'}
                        {'\u00A0'}
                        {((['PENDING', 'APPROVED', 'PAID', 'PARTIAL PAID'].includes(row.status))) ? <i
                            role="button"
                            aria-label="Edit Data"
                            onClick={() => {
                                history.push(`/pemasukan/edit/${row.id}`);
                            }}
                            className="fa fa-edit fa-lg"
                            style={{color: '#0275d8'}}
                        >
                        </i> : ''}
                        
                        {'\u00A0'}
                        {'\u00A0'}
                        {((row.status === 'PENDING')) ? <i
                            role="button"
                            aria-label="Hapus Data"
                            onClick={(e) => handleDelete(index, row.id)}
                            className="fa fa-trash fa-lg"
                            style={{color: '#d9534f'}}
                        >
                        </i> : ''}

                        {'\u00A0'}
                        {'\u00A0'}
                        {((['APPROVED', 'PAID', 'PARTIAL PAID', 'COMPLETE'].includes(row.status) )) ? <i
                            aria-label="Hapus Data"
                        >
                            -
                        </i> : ''}
                        
                        
                    </div>
                )
            },
            {
                name: '',
                width: '10%',
                selector: (row, index) => (
                    row.fullfilment === null ? <div onClick={() => handleShow(index, row)} style={{ cursor:'pointer' }} 
                        // onClick={() => this.setState({ modalFulfilment: true, dataDelete: row, tabIndex: index })}
                    >
                        {
                            <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-disabled">On Going</Tooltip>}>
                                <span className="d-inline-block">
                                    <Badge variant="warning">&emsp;</Badge>
                                </span>
                            </OverlayTrigger> 
                        }    
                    </div> : <div>
                                <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-disabled">{row.fullfilment ? 'Fulfilled' : 'Unfulfilled'}</Tooltip>}>
                                    <span className="d-inline-block">
                                        <Badge variant={row.fullfilment ? 'success' : 'danger'}>&emsp;</Badge>
                                    </span>
                                </OverlayTrigger>
                            </div>
                ),
            }
        ]);
    }, [submissions]);

    const getData = async (pageChange, sizeChange = size) => {
        const opts = {
            params: {
                page: pageChange,
                size: sizeChange,
                q: 'PEMASUKAN'
            }
        };
        setLoading(!loading);
        SubmissionService.getSubmission(opts).then((data) => {
            setTimeout(() => {
                setLoading(false);
                getSubmission(data.data.data.rows)
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

    const handleDelete = (index, id) => {
        if (window.confirm('Anda Yakin Ingin Menghapus Data Ini ?')) {
            setLoading(!loading);
            SubmissionService.deleteSUbmission(id)
                .then((data) => {
                    setTimeout(() => {
                        deleteSubmission(index);
                        setLoading(false);
                    }, 1000);
                    toast.success('Submission Deleted!');
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
        setTabIndex(index)
        setDetail(data)
        console.log(data)
    };

    const handleFullfilment = () => {
        const payload = {
            fullfilment: payloadFullfilment.fullfilment,
            status: payloadFullfilment.fullfilment === true ? detail.status : payloadFullfilment.status
        }
        setLoading(!loading);
        SubmissionService.updateFullfilment(detail.id, payload).then((data) => {
            setTimeout(() => {
                setLoading(false);
                updateFullfilment(tabIndex, data.data)
                setShow(false)
                toast.success('Fullfilment Successfully')
            }, 1000);
        }).catch((error) => {
            setLoading(false);
        });
    }

    const statusSubmission = (data) => {
        if(data === 'PAID'){
            return (
                <Badge variant="success" style={{ color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }else if(data === 'PARTIAL PAID'){
            return (
                <Badge style={{ backgroundColor: '#BDBDBD', color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }else if(data === 'COMPLETE'){
            return (
                <Badge variant="success" style={{ color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }else if(data === 'APPROVED'){
            return (
                <Badge style={{ backgroundColor: 'blue', color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }else if(data === 'REFUND'){
            return (
                <Badge variant="danger" style={{ color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }else if(data === 'CANCELLED'){
            return (
                <Badge variant="dark" style={{ color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }else if(data === 'FAILED'){
            return (
                <Badge variant="dark" style={{ color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }else if(data === 'PENDING'){
            return (
                <Badge variant="warning" style={{ color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }else if(data === 'PARTIAL APPROVED'){
            return (
                <Badge style={{ backgroundColor: '#BDBDBD', color:'white', padding:'10px' }}>{ data }</Badge>
            )
        }
    }

    const handleApporoveStatus = (index, dataStatus) => {
        const payloadStatus = {
            status: 'APPROVED'
        }
        setLoading(!loading);
        SubmissionService.updateStatus(dataStatus.id, payloadStatus).then((data) => {
            setTimeout(() => {
                setLoading(false);
                updateStatus(index, data.data)
                toast.success('Approved Successfully')
            }, 1000);
        });
    }

    const handleRejectStatus = (index, dataStatus) => {
        const payloadStatus = {
            status: 'FAILED'
        }
        setLoading(!loading);
        SubmissionService.updateStatus(dataStatus.id, payloadStatus).then((data) => {
            setTimeout(() => {
                setLoading(false);
                updateStatus(index, data.data)
                toast.success('Submission Rejected')
            }, 1000);
        });
    }

    const convertCurrency = (total) => {
        return "Rp. "+formatCurrency(total);
    }

    return (
        <>
            <LoadingSpinner isLoading={loading} />
            {/* Modal Fullfilment */}
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
                            Fullfilment
                        </h4>
                    </div>
                  )}
                size="lg"
                show={show}
                onHide={handleClose}
                onClose={handleClose}
                backdrop="static"
                keyboard={false}
                onSubmit={handleFullfilment}
                body={(
                    <div className="m-5">
                        <Form.Group controlId="exampleForm.ControlSelect1">
                            <Col sm="12" style={{ marginTop:'6px' }}>
                                <Form.Label>Select Fullfilment</Form.Label>
                                <Form.Control as="select" 
                                    defaultValue={payloadFullfilment.fullfilment} 
                                    onChange={(e) => setPayloadFullfilment({
                                        ...payloadFullfilment,
                                        fullfilment: e.target.value,
                                        status: e.target.value === 'true' ? detail.status : 'CANCELLED'
                                    })}
                                >
                                    <option value={true}>Fullfilment</option>
                                    <option value={false}>Unfullfilment</option>
                                </Form.Control>
                            </Col>

                            {payloadFullfilment.fullfilment === 'false' && 
                                <Col sm="12" style={{ marginTop:'6px' }}>
                                <Form.Label>Select Status</Form.Label>
                                <Form.Control as="select" 
                                    defaultValue={payloadFullfilment.status} 
                                    onChange={(e) => setPayloadFullfilment({
                                        ...payloadFullfilment,
                                        status: e.target.value
                                    })}
                                >
                                    <option value="CANCELLED">CANCELLED</option>
                                    <option value="REFUND">REFUND</option>
                                </Form.Control>
                                </Col>
                            }
                        </Form.Group>
                    </div>
                  )}
                submitTitle="Save"
                closeTitle="Close"
            />
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Income</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">{t('header.label.home')}</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Income
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
                                                    placeholder="Search Income"
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
                                            <Link to="/pemasukan/create" className="float-right btn btn-success btn-sm">Create Income</Link>
                                            {/* <button
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
                                                Create Wallet
                                            </button> */}
                                        </div>
                                    </div>
                                    <DataTable
                                        title="Arnold Movies"
                                        columns={columns}
                                        data={dataSubmissions}
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
    submissions: state.submissions.submissions,
    detailSubmission: state.submissions.detailSubmission
});

const mapDispatchToProps = (dispatch) => ({
    getSubmission: (submissions) =>
        dispatch({
            type: ActionTypes.LOAD_SUBMISSIONS,
            submissions
        }),
    updateStatus: (index, detailSubmission) =>
        dispatch({type: ActionTypes.UPDATE_STATUS, detailSubmission, index}),
    updateFullfilment: (index, detailSubmission) =>
        dispatch({type: ActionTypes.UPDATE_FULLFILMENT, detailSubmission, index}),
    deleteSubmission: (index) =>
        dispatch({type: ActionTypes.DELETE_SUBMISSION, index})
});

export default connect(mapStateToProps, mapDispatchToProps)(Submissions);
