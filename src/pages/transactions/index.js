import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import DataTable from 'react-data-table-component';
import {toast} from 'react-toastify';
import { Badge, Form, Col, Row } from 'react-bootstrap';
import dayjs from 'dayjs';
import { formatCurrency } from "@app/utils/number";

import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../store/actions';
import * as TransactionsService from '../../services/transactions';

const Items = ({
    getTransactions,
    transactions
}) => {
    const [t] = useTranslation();

    const [payload, setPayload] = React.useState({
        id: null,
        productCategory: null
    });

    const [search, setSearch] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(10);
    const [totalRow, setTotalRow] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [dataProductCategory, setDataProductCategory] = React.useState([]);
    const [show, setShow] = React.useState(false);
    const [tabIndex, setTabIndex] = React.useState(-1);
    const [columns, setColumn] = React.useState([]);
    const [typeSubmission, setTypeSubmission] = React.useState('PEMASUKAN');
    const [dateStart, setDateStart] = React.useState(null);
    const [dateEnd, setDateEnd] = React.useState(null);

    useEffect(() => {
        getData(page, size);
    }, []);

    useEffect(() => {
        setDataProductCategory(transactions);
        setColumn([
            {
                name: 'No',
                cell: (row, index) => `${index + 1 + (page + 1 - 1) * size}.`,
                width: '5%'
            },
            {
                name: 'Nama Submission',
                selector: 'submission.submissionName',
            },
            {
                name: 'Amount',
                selector: (row, index) => (
                    <div>
                        {convertCurrency(parseFloat(row.amount))}
                    </div>
                )
            },
            {
                name: 'Date',
                selector: (row, index) => dayjs(row.date).format("YYYY-MM-DD HH:mm:ss"),
            },
            {
                name: 'Wallet',
                selector: 'wallet.walletName',
            },
            {
                name: 'Category Submission',
                selector: 'submission.submission_category.submissionCategory'
            },
            {
                name: 'Type Submission',
                selector: (row, index) => (
                    <div>
                        {row.submission.submission_category.submissionType === 'PEMASUKAN' ? 
                            <Badge variant="success" style={{ fontSize:'13px' }}>
                                <i className="fa fa-arrow-up"></i> 
                                {'\u00A0'}
                                {'\u00A0'}
                                {row.submission.submission_category.submissionType}
                            </Badge> : 
                            <Badge variant="danger" style={{ fontSize:'13px' }}>
                                <i className="fa fa-arrow-down"></i> 
                                {'\u00A0'}
                                {'\u00A0'}
                                {row.submission.submission_category.submissionType}
                            </Badge> 
                        }
                        
                    </div>
                )
            },
        ]);
    }, [transactions]);

    const getData = async (pageChange, sizeChange = size) => {
        const opts = {
            params: {
                'typeSubmission': typeSubmission,
                'startDate' : dateStart,
                'endDate': dateEnd,
                page: pageChange,
                size: sizeChange,
            }
        };
        setLoading(!loading);
        TransactionsService.getTransactions(opts).then(
            (data) => {
                setTimeout(() => {
                    setLoading(false);
                    getTransactions(data.data.data.rows);
                    setTotalRow(data.data.data.totalItems);
                }, 1000);
            }
        );
    };

    const handleFilter = (e) => {
        e.preventDefault()
        getData(0)
    }

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

    const convertCurrency = (total) => {
        return "Rp. "+formatCurrency(total);
    }

    return (
        <>
            <LoadingSpinner isLoading={loading} />
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>List Transaksi</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">{t('header.label.home')}</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Transaksi
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card card-primary card-outline">
                                <div className="card-body box-profile">
                                <form>
                                    <div className="row">
                                        <div className="col-md-12 text-start">
                                            <Form.Group as={Row} controlId="formPlaintextEmail">
                                                <Col sm="8" style={{ marginTop: "6px" }}>
                                                <Form.Check
                                                    inline
                                                    label="PEMASUKAN"
                                                    type="radio"
                                                    value="PEMASUKAN"
                                                    id={`inline-radio-1`}
                                                    onChange={(e) => setTypeSubmission(e.target.value)}
                                                    checked={typeSubmission === "PEMASUKAN"}
                                                />
                                                <Form.Check
                                                    inline
                                                    label="PENGELUARAN"
                                                    type="radio"
                                                    value="PENGELUARAN"
                                                    onChange={(e) => setTypeSubmission(e.target.value)}
                                                    id={`inline-radio-2`}
                                                    checked={typeSubmission === "PENGELUARAN"}
                                                />
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-4">
                                            <div className="form-group">
                                                <label>Dari Tanggal</label>
                                                <input type="datetime-local" onChange={(e) => setDateStart(e.target.value)} defaultValue={dateStart} className="form-control" placeholder="Enter ..." />
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="form-group">
                                                <label>Sampai Tanggal</label>
                                                <input type="datetime-local" onChange={(e) => setDateEnd(e.target.value)} defaultValue={dateEnd} className="form-control" placeholder="Enter ..." />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-4">
                                            <button type="submit" className="btn btn-primary mr-2" onClick={handleFilter}>Cari Transaksi</button>  
                                            <button type="submit" className="btn btn-secondary">Reset</button>
                                        </div>
                                    </div>
                                </form>                                  
                                </div>
                            </div>
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
                                    <DataTable
                                        title="Arnold Movies"
                                        columns={columns}
                                        data={dataProductCategory}
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
    transactions: state.transactions.transactions,
});

const mapDispatchToProps = (dispatch) => ({
    getTransactions: (transactions) =>
        dispatch(
            {type: ActionTypes.LOAD_TRANSACTIONS, transactions}
    ),
    
});

export default connect(mapStateToProps, mapDispatchToProps)(Items);
