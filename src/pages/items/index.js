import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import DataTable from 'react-data-table-component';
import { Badge, Modal, Button, Form, Col, Row } from 'react-bootstrap';
import dayjs from 'dayjs';
import { formatCurrency } from "@app/utils/number";

import LoadingSpinner from '../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../store/actions';
import * as ItemsService from '../../services/items';

const Items = ({
    getItem,
    items
}) => {
    const [t] = useTranslation();

    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(10);
    const [totalRow, setTotalRow] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [dataProductCategory, setDataProductCategory] = React.useState([]);
    const [show, setShow] = React.useState(false);
    const [columns, setColumn] = React.useState([]);
    const [typeWaktu, setTypeWaktu] = React.useState('tanggal');
    const [dateStart, setDateStart] = React.useState(null);
    const [dateEnd, setDateEnd] = React.useState(null);

    useEffect(() => {
        getData(page, size);
    }, []);

    useEffect(() => {
        setDataProductCategory(items);
        setColumn([
            {
                name: 'No',
                cell: (row, index) => `${index + 1 + (page + 1 - 1) * size}.`,
                width: '5%'
            },
            {
                name: 'Name',
                selector: 'itemName',
            },
            {
                name: 'Due Date',
                selector: (row, index) => row.submissions ?  dayjs(row.submissions.dueDate).format("YYYY-MM-DD HH:mm:ss") : '-',
            },
            {
                name: 'Quantity',
                selector: 'qty',
            },
            {
                name: 'Selling Price',
                selector: (row, index) => (
                    <div>
                        {convertCurrency(parseFloat(row.sellingPrice))}
                    </div>
                )
            },
            {
                name: 'Buying Price',
                selector: (row, index) => (
                    <div>
                        {convertCurrency(parseFloat(row.buyingPrice))}
                    </div>
                )
            },
            {
                name: 'Discount',
                selector: (row, index) => (
                    <div>
                        {row.discount}
                        %
                    </div>
                )
            },
            {
                name: 'Tax',
                selector: (row, index) => (
                    <div>
                        {row.tax}
                        %
                    </div>
                )
            },
            {
                name: 'Type Submission',
                selector: (row, index) => (
                    <div>
                        {row.submissions && row.submissions.submission_category.submissionType === 'PEMASUKAN' ? 
                            <Badge variant="success" style={{ fontSize:'13px' }}>
                                <i className="fa fa-arrow-up"></i> 
                                {'\u00A0'}
                                {'\u00A0'}
                                {row.submissions ? row.submissions.submission_category.submissionType : '-'}
                            </Badge> : 
                            <Badge variant="danger" style={{ fontSize:'13px' }}>
                                <i className="fa fa-arrow-down"></i> 
                                {'\u00A0'}
                                {'\u00A0'}
                                {row.submissions ? row.submissions.submission_category.submissionType : '-'}
                            </Badge> 
                        }
                        
                    </div>
                )
            },
        ]);
    }, [items]);

    const getData = async (pageChange, sizeChange = size) => {
        const opts = {
            params: {
                page: pageChange,
                size: sizeChange,
                'typeWaktu': typeWaktu,
                'startDate' : dateStart,
                'endDate': dateEnd,
            }
        };
        setLoading(!loading);
        ItemsService.get(opts).then(
            (data) => {
                setTimeout(() => {
                    setLoading(false);
                    getItem(data.data.data.rows);
                    setTotalRow(data.data.data.totalItems);
                }, 1000);
            }
        );
    };

    const handlePageChange = (pageChange) => {
        setPage(pageChange - 1);
        getData(pageChange - 1, size);
    };

    const handlePerRowsChange = async (newPerPage, pageCurrent) => {
        setSize(newPerPage);
        getData(pageCurrent - 1, newPerPage);
    };

    const handleFilter = (e) => {
        e.preventDefault()
        getData(0)
        setShow(false)
    }

    const convertCurrency = (total) => {
        return "Rp. "+formatCurrency(total);
    }

    const handleClose = () => {
        setShow(false)
    }

    const handleShow = () => {
        setShow(true)
    }

    return (
        <>
            <LoadingSpinner isLoading={loading} />
            {/* Modal Filter */}
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Filter Berdasarkan {typeWaktu}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <div className="row">
                    <div className="col-md-12 text-start">
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Col sm="8" style={{ marginTop: "6px" }}>
                                <Form.Check
                                    inline
                                    label="tanggal"
                                    type="radio"
                                    value="tanggal"
                                    id={`inline-radio-1`}
                                    onChange={(e) => setTypeWaktu(e.target.value)}
                                    checked={typeWaktu === "tanggal"}
                                />
                                <Form.Check
                                    inline
                                    label="batas waktu"
                                    type="radio"
                                    value="batas waktu"
                                    onChange={(e) => setTypeWaktu(e.target.value)}
                                    id={`inline-radio-2`}
                                    checked={typeWaktu === "batas waktu"}
                                />
                            </Col>
                        </Form.Group>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                            <label>Dari Tanggal</label>
                            <input type="datetime-local" className="form-control" onChange={(e) => setDateStart(e.target.value)} defaultValue={dateStart} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                            <label>Sampai Tanggal</label>
                            <input type="datetime-local" className="form-control" onChange={(e) => setDateEnd(e.target.value)} defaultValue={dateEnd} />
                        </div>
                    </div>
                </div>
                    
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleFilter}>Filter</Button>
                </Modal.Footer>
            </Modal>
            {/* End Modal Filter */}
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>List Items</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">{t('header.label.home')}</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Items
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
                                        <div className="col-sm-3">
                                            <button
                                                    className="btn btn-success btn-sm"
                                                    type="button"
                                                    style={{
                                                        padding: '7px',
                                                        width:'100%',
                                                        background:
                                                            'rgb(17, 78, 96)',
                                                        borderColor:
                                                            'rgb(17, 78, 96)',
                                                        fontSize:'15px'
                                                    }}
                                                    onClick={() => handleShow()}
                                                >
                                                    <i className="fa fa-filter"></i> 
                                                    {'\u00A0'}
                                                    {'\u00A0'}
                                                    Filter
                                            </button>
                                        </div>
                                    </div>
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
    items: state.items.items,
});

const mapDispatchToProps = (dispatch) => ({
    getItem: (items) =>
        dispatch(
            {type: ActionTypes.LOAD_ITEMS, items}
    ),
    
});

export default connect(mapStateToProps, mapDispatchToProps)(Items);
