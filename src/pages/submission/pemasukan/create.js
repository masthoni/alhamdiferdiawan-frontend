import React, {useEffect} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {connect} from 'react-redux';
import DataTable from 'react-data-table-component';
import {toast} from 'react-toastify';
import {Row, Col, Form, Table, Button, Modal} from 'react-bootstrap';
import CounterInput from 'react-counter-input'

import LoadingSpinner from '../../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../../store/actions';
import * as ItemService from '../../../services/items';
import {getSpesificSubmissionCategory} from '../../../services/submission-category';
import {storeSubmission} from '../../../services/submission'


const Create = ({getItems, items}) => {

    const history = useHistory();
    const [loading, setLoading] = React.useState(false);
    const [cart, setCart] = React.useState([]);
    const [show, setShow] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(5);
    const [dataItems, setDataItems] = React.useState([])
    const [dataCategory, setDataCategory] = React.useState([])
    const [totalRow, setTotalRow] = React.useState(0);
    const [columns, setColumn] = React.useState([]);
    const [payloadCustomItem, setPayloadCustomItem] = React.useState({
        itemName: null,
        sellingPrice: null,
    })
    const [payload, setPayload] = React.useState({
        submissionName: null,
        date: null,
        dueDate: null,
        customerName: null,
        categoryId: null,
        status: "PENDING",
    })

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const getData = async (pageChange, sizeChange = size) => {
        const opts = {
            params: {
                page: pageChange,
                size: sizeChange,
            }
        };
        setLoading(!loading);
        await ItemService.getItems(opts).then((data) => {
            setTimeout(() => {
                setLoading(false);
                getItems(data.data.data.rows);
                setDataItems(data.data.data.rows);
                setTotalRow(data.data.data.totalItems);
            }, 1000);
        });

        const optsCategory = {
            params: {
                q: 'PEMASUKAN'
            }
        }

        await getSpesificSubmissionCategory(optsCategory).then((data) => {
            setTimeout(() => {
                setLoading(false);
                setDataCategory(data.data.data)
            }, 1000);
        })
    };


    const handlePageChange = (pageChange) => {
        setPage(pageChange - 1);
        getData(pageChange - 1, size);
    };

    const handlePerRowsChange = async (newPerPage, pageCurrent) => {
        setSize(newPerPage);
        getData(pageCurrent - 1, newPerPage);
    };

    const addProductToCart = (rows) => {
        if(cart.find((datas) => datas.itemName === rows.itemName)){
            const indexs = cart.findIndex((datass) => datass.itemName === rows.itemName)
            const itemss = [...cart];
            const item = {...cart[indexs]};
            item.qty += 1
            item.total = item.qty * item.sellingPrice
            itemss[indexs] = item;
            setCart(itemss)
        }else{
            const keranjang = [...cart]
            rows.qty = 1
            rows.discount = 0
            rows.tax = 0
            rows.total = parseFloat(rows.sellingPrice)
            keranjang.splice(cart.length, 0, rows);
            setCart(keranjang)
        }
        toast.success('Items Added !')
    }

    const deleteCart = (index) => {
        const dataDelete = [...cart]
        dataDelete.splice(index, 1)
        setCart(dataDelete)
    }
    
    useEffect(() => {
        getData(page, size);
    }, []);

    useEffect(() => {
        setColumn([
            {
                name: 'No',
                cell: (row, index) => `${index + 1 + (page + 1 - 1) * size}.`,
                width: '20%'
            },
            {
                name: 'Item Name',
                selector: 'itemName',
                width: '35%'
            },
            {
                name: 'Selling Price',
                selector: 'sellingPrice',
                width: '35%'
            },
            {
                name: 'Action',
                width: '10%',
                cell: (row, index) => (
                    <div>
                        <i
                            role="button"
                            aria-label="Add Data"
                            onClick={() => addProductToCart(row)}
                            className="fa fa-plus fa-lg text-success"
                        >
                        </i>
                    </div>
                )
            }
        ]);
    }, [cart, items]);

    const calculateTotal = (dataItem) => {
        let total = 0;
        dataItem.forEach(element => {
            total += element.total;
        });
        return total;
    }

    const addCustomItem = () => {
        if (dataItems.find((data) => data.itemName === payloadCustomItem.itemName)) {
            toast.error('item names cannot be the same')
        } else {
            if (payloadCustomItem.itemName === null || payloadCustomItem.sellingPrice === null) {
                toast.error('data cannot be empty')
            } else {
                const d = [...dataItems]
                const data = {
                    itemName: payloadCustomItem.itemName,
                    buyingPrice: 0,
                    sellingPrice: parseFloat(payloadCustomItem.sellingPrice),
                    productId: 0,
                }
                d.splice(size -1, 1)
                d.splice(0, 0, data)
                setDataItems(d)
                setTotalRow(totalRow + 1)
                setPayloadCustomItem({
                    ...payloadCustomItem,
                    itemName: null,
                    sellingPrice: null
                })
            }
        }
    }

    const checkOut = async () => {
        setLoading(!loading)
        const newPayload = {
            submissionName: payload.submissionName,
            date: payload.date,
            dueDate: payload.dueDate,
            customerName: payload.customerName,
            categoryId: payload.categoryId,
            status: payload.status,
            items: cart
        }
        await storeSubmission(newPayload).then((response) => {
            setTimeout(() => {
                setLoading(false);
                history.push('/pemasukan');
                toast.success('Submissions Created!');
            }, 1000);
        }).catch((error) => {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        });
    }

    return (
        <>
            <LoadingSpinner isLoading={loading} />
            {/* Modal Add Product */}
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header closeButton>
                <Modal.Title>Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DataTable
                        title="Arnold Movies"
                        columns={columns}
                        data={dataItems}
                        noHeader
                        highlightOnHover
                        paginationTotalRows={totalRow}
                        paginationPerPage={size}
                        pagination
                        paginationServer
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handlePerRowsChange}
                    />
                    <Row className="position-relative show-grid">
                        <Col xs={12}>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="12">
                                    Custom Item
                                </Form.Label>
                                <Col sm="5">
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Item Name" 
                                        defaultValue={payloadCustomItem.itemName} 
                                        onChange={(e) => {
                                            setPayloadCustomItem({
                                                ...payloadCustomItem,
                                                itemName: e.target.value
                                            });
                                        }}
                                    />
                                </Col>
                                <Col sm="5">
                                    <Form.Control 
                                        type="number" min={0} 
                                        defaultValue={payloadCustomItem.sellingPrice} 
                                        placeholder="Selling Price" 
                                        onChange={(e) => {
                                            setPayloadCustomItem({
                                                ...payloadCustomItem,
                                                sellingPrice: e.target.value
                                            });
                                        }}
                                    />
                                </Col>
                                <Col sm="2">
                                    <Button 
                                        variant="success" style={{ width: '100%' }} size="sm" 
                                        onClick={() => addCustomItem()}
                                    >
                                        <i className="fa fa-plus"></i> 
                                        {' '}
                                        Add
                                    </Button>
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>Selesai</Button>
                </Modal.Footer>
            </Modal>
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Create Income</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">Home</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Create Income
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
                                        <div className="col-sm-12">
                                            <Link style={{ height: '38px', paddingTop: '8px' }} to="/pemasukan" className="float-right btn btn-warning btn-sm">
                                                <i className="fa fa-backward"></i> 
                                                {' '}
                                                Back
                                            </Link>
                                        </div>
                                    </div>
                                    <Form className="m-5">
                                        <Row>
                                            <Col xs={6}>
                                                <Form.Group as={Row} controlId="formPlaintextEmail">
                                                    <Form.Label column sm="3">
                                                        Date
                                                    </Form.Label>
                                                    <Col sm="9">
                                                        <Form.Control type="datetime-local" 
                                                            onChange={(e) => {
                                                                setPayload({
                                                                    ...payload,
                                                                    date: e.target.value
                                                                });
                                                            }}
                                                        />
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                                    <Form.Label column sm="3">
                                                    Set Due Date
                                                    </Form.Label>
                                                    <Col sm="9">
                                                        <Form.Control type="datetime-local" 
                                                            onChange={(e) => {
                                                                setPayload({
                                                                    ...payload,
                                                                    dueDate: e.target.value
                                                                });
                                                            }}
                                                        />
                                                    </Col>
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                                    <Form.Label column sm="3">
                                                        Transaction Name
                                                    </Form.Label>
                                                    <Col sm="9">
                                                        <Form.Control type="text" placeholder="Transaction Name" 
                                                            onChange={(e) => {
                                                                setPayload({
                                                                    ...payload,
                                                                    submissionName: e.target.value
                                                                });
                                                            }}
                                                            />
                                                    </Col>
                                                </Form.Group>

                                            </Col>
                                            <Col xs={6}>

                                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                                    <Form.Label column sm="3">
                                                    Customer Name
                                                    </Form.Label>
                                                    <Col sm="9">
                                                        <Form.Control type="text" placeholder="Customer Name" 
                                                        onChange={(e) => {
                                                            setPayload({
                                                                ...payload,
                                                                customerName: e.target.value
                                                            });
                                                        }}
                                                        />
                                                    </Col>
                                                    
                                                </Form.Group>

                                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                                    <Form.Label column sm="3">
                                                        Submission Category
                                                    </Form.Label>
                                                    <Col sm="9">
                                                    <Form.Control as="select" 
                                                        onChange={(e) => {
                                                            setPayload({
                                                                ...payload,
                                                                categoryId: e.target.value
                                                            });
                                                        }}
                                                    >
                                                        <option value="">- Choose Submission Category -</option>
                                                        {
                                                            dataCategory && dataCategory.map((data) => (
                                                                <option key={data.id} value={data.id}>{data.submissionCategory}</option>
                                                            ))
                                                        }
                                                    </Form.Control>
                                                    </Col>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <div className="row m-5">
                                        <div className="col-md-12">
                                            <Table responsive="sm">
                                                <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Product</th>
                                                    <th>Qty</th>
                                                    <th>Price (IDR)</th>
                                                    <th>Discount</th>
                                                    <th>PPN (%)</th>
                                                    <th>Total (IDR)</th>
                                                    <th>Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                    { cart.map((r, index) => (
                                                        <tr key={index}>
                                                            <td>{index+1}</td>
                                                            <td>{r.itemName}</td>
                                                            <td>
                                                            <CounterInput
                                                                count={r.qty}
                                                                min={1}
                                                                onCountChange={(count) => {
                                                                    const changeItems = [...cart];
                                                                    const item = {...changeItems[index]};
                                                                    item.qty = count
                                                                    const totalHarga = count * item.sellingPrice
                                                                    const totalHargaDiscount = totalHarga - ((totalHarga * item.discount)/100)
                                                                    item.total = totalHargaDiscount + ((totalHargaDiscount * item.tax)/100)
                                                                    changeItems[index] = item;
                                                                    setCart(changeItems)
                                                                }}
                                                            /> 
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    placeholder="Price"
                                                                    type="number" 
                                                                    value={parseFloat(r.sellingPrice)} 
                                                                    onChange={(e) => {
                                                                        const changeItems = [...cart];
                                                                        const item = {...changeItems[index]};
                                                                        item.sellingPrice = e.target.value
                                                                        const totalHarga = item.qty * item.sellingPrice
                                                                        const totalHargaDiscount = totalHarga - ((totalHarga * item.discount)/100)
                                                                        
                                                                        item.total = totalHargaDiscount + ((totalHargaDiscount * item.tax)/100)
                                                                        changeItems[index] = item;
                                                                        setCart(changeItems)
                                                                    }} 
                                                                />
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    placeholder="Discount"
                                                                    type="number" 
                                                                    value={parseFloat(r.discount)} 
                                                                    onChange={(e) => {
                                                                        const changeItems = [...cart];
                                                                        const item = {...changeItems[index]};
                                                                        item.discount = e.target.value
                                                                        const totalHarga = item.qty * item.sellingPrice
                                                                        const totalHargaDiscount = totalHarga - ((totalHarga * item.discount)/100)
                                                                    
                                                                        item.total = totalHargaDiscount + ((totalHargaDiscount * item.tax)/100)
                                                                        changeItems[index] = item;
                                                                        setCart(changeItems)
                                                                    }} 
                                                                />
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    placeholder="PPN"
                                                                    type="number" 
                                                                    value={parseFloat(r.tax)} 
                                                                    onChange={(e) => {
                                                                        const changeItems = [...cart];
                                                                        const item = {...changeItems[index]};
                                                                        item.tax = e.target.value
                                                                        const totalHarga = item.qty * item.sellingPrice
                                                                        const totalHargaDiscount = totalHarga - ((totalHarga * item.discount)/100)
                                                                    
                                                                        item.total = totalHargaDiscount + ((totalHargaDiscount * item.tax)/100)
                                                                        changeItems[index] = item;
                                                                        setCart(changeItems)
                                                                    }} 
                                                                />
                                                            </td>
                                                            <td>{r.total}</td>
                                                            <td>
                                                                <i 
                                                                    className="fa fa-trash" 
                                                                    style={{ color:'red' }}
                                                                    onClick={() => deleteCart(index)}
                                                                >
                                                                </i>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                    <div className="row m-5">
                                        <div className="col-md-12 text-right">
                                            <Button variant="outline-success" onClick={handleShow}>
                                                <i className="fa fa-plus"></i> 
                                                {' '}
                                                Add Products
                                            </Button>
                                        </div>
                                    </div>
                                    <Row style={{ textAlign:'right' }} className="mt-5 mr-5">
                                        <Col xs={10}>
                                            <strong>TOTAL</strong> 
                                        </Col>

                                        <Col xs={2}>
                                            <strong>
                                                Rp. 
                                                {' '}
                                                {calculateTotal(cart)}
                                            </strong>
                                        </Col>
                                    </Row>


                                    <Row style={{ textAlign:'right' }} className="mt-5 mr-5">
                                        <Col xs={12}>
                                            <Button variant="secondary">Cancel</Button> 
                                            {' '} 
                                            <Button variant="success" onClick={() => checkOut()}> Submit</Button>
                                        </Col>
                                    </Row>
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
    getItems: (items) =>
        dispatch({
            type: ActionTypes.GET_ITEMS,
            items
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Create);
