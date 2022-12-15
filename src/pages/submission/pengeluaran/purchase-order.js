import React, {useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import {connect} from 'react-redux';
import {toast} from 'react-toastify';
import {Row, Col, Button, Table, Tabs, Tab, InputGroup, Form} from 'react-bootstrap';
import { formatCurrency } from "@app/utils/number";
import dayjs from 'dayjs';

import LoadingSpinner from '../../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../../store/actions';
import * as SubmissionService from '../../../services/submission';
import {storeTransaction} from '../../../services/transactions'
import {getWallet} from '../../../services/wallet'
import Modal from '../../../components/Modal'

const Submissions = ({
    getShow,
    detailSubmission
}) => {

    const { id } = useParams();
    const [loading, setLoading] = React.useState(false)
    const [show, setShow] = React.useState(false)
    const [dataSubmission, setDataSubmission] = React.useState({})
    const [fileAttachment, setFileAttachment] = React.useState(null)
    const [dataWallet, setDataWallet] = React.useState([])
    const [payloadPayment, setPayloadPayment] = React.useState({
        date: null,
        submissionId: id,
        walletId: null,
        amount: 0,
        attachmentTransaction: null
    })

    useEffect(() => {
        getData()
    }, []);

    const getData = async () => {
        setLoading(!loading)
        await SubmissionService.showSubmission(id, {}).then((response) => {
            setTimeout(() => {
                setLoading(false)
                getShow(response.data.data)
                setDataSubmission(response.data.data)
            }, 1000);
        }).catch((error) => {
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        })

        await getWallet().then((response) => {
            setTimeout(() => {
                setLoading(false)
                setDataWallet(response.data.data.rows)
            }, 1000);
        }).catch((error) => {
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        })
    }

    useEffect(() => {
        setDataSubmission(detailSubmission)
    }, [detailSubmission])

    const calculateTotal = (dataItem) => {
        let total = 0;
        dataItem && dataItem.forEach(element => {
            total += element.qty * element.buyingPrice;
        });
        return total;
    }

    const calculateTotalPaid = (dataItem) => {
        let total = 0;
        dataItem && dataItem.forEach(element => {
            total += element.amount;
        });
        return total;
    }

    const convertCurrency = (total) => {
        return "Rp. "+formatCurrency(total);
    }

    const handleUploadAttachment = () => {
        setLoading(!loading)
        const payload = new FormData();
        payload.append('submissionId', id)
        payload.append('attachmentSubmissoin', fileAttachment)
        SubmissionService.storeSubmissionAttachment(payload).then((response) => {
            setTimeout(() => {
                setLoading(false)
                toast.success('Attachment Submssion Successfully Upload')
                getData()
            }, 1000);
        }).catch((error) => {
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        })
    }

    const handleAddPayment = () => {
        setLoading(!loading)
        const payload = new FormData();
        payload.append('date', payloadPayment.date)
        payload.append('walletId', payloadPayment.walletId)
        payload.append('submissionId', payloadPayment.submissionId)
        payload.append('amount', payloadPayment.amount)
        payload.append('attachmentTransaction', payloadPayment.attachmentTransaction)
        storeTransaction(payload).then((response) => {
            setTimeout(() => {
                setLoading(false)
                toast.success('Payment added successfully')
                getData()
                setShow(false)
            }, 1000);
        }).catch((error) => {
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        })
    }

    const handleClose = () => setShow(false);

    const handleComplete = () => {
        setLoading(!loading)
        SubmissionService.updateStatusCompleted(id, {}).then((response) => {
            setTimeout(() => {
                setLoading(false)
                toast.success('Submission updated to complete successfully')
                getData()
                setShow(false)
            }, 1000);
        }).catch((error) => {
            setTimeout(() => {
                setLoading(false)
            }, 1000);
        })
    }

    return (
        <>
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
                            Add Payment
                        </h4>
                    </div>
                  )}
                size="lg"
                show={show}
                onHide={handleClose}
                onClose={handleClose}
                backdrop="static"
                keyboard={false}
                onSubmit={handleAddPayment}
                body={(
                    <div className="m-5">
                        <Form>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="4">
                                    Payment Date
                                </Form.Label>
                                <Col sm="8">
                                <Form.Control 
                                    type="datetime-local" 
                                    placeholder="Payment Date" 
                                    onChange={(e) => setPayloadPayment({
                                        ...payloadPayment,
                                        date: e.target.value
                                    })}
                                />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="4">
                                    Amount (in IDR)
                                </Form.Label>
                                <Col sm="8">
                                <Form.Control 
                                    type="text" 
                                    placeholder="Amount (in IDR)" 
                                    onChange={(e) => setPayloadPayment({
                                        ...payloadPayment,
                                        amount: e.target.value
                                    })}
                                />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="4">
                                    Wallet
                                </Form.Label>
                                <Col sm="8">
                                    <Form.Control 
                                        as="select" 
                                        onChange={(e) => setPayloadPayment({
                                            ...payloadPayment,
                                            walletId: e.target.value
                                        })}
                                    >
                                        <option value="">-Choose Wallet From-</option>
                                        {
                                            dataWallet && dataWallet.map((data) => (
                                                <option key={data.id} value={data.id}>{data.walletName}</option>
                                            ))
                                        }
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="4">
                                    Invoice
                                </Form.Label>
                                <Col sm="8">
                                    <InputGroup className="mb-2">
                                        <InputGroup.Prepend>
                                        <InputGroup.Text><i className="fa fa-paperclip"></i></InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.File
                                            onChange={(e) => setPayloadPayment({
                                                ...payloadPayment,
                                                attachmentTransaction: e.target.files[0]
                                            })}
                                            id="custom-file-translate-scss"
                                            label="no file chosen"
                                            lang="en"
                                            data-browse="Chosee File"
                                            custom
                                        />
                                    </InputGroup>
                                </Col>
                            </Form.Group>
                        </Form>
                    </div>
                  )}
                submitTitle="Save"
                closeTitle="Close"
            />
            <LoadingSpinner isLoading={loading} />
            {/* Modal */}
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>
                                Purchase Order #
                                {id}
                            </h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">Home</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Expense
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

                                        </div>
                                        <div className="col-sm-7">
                                            <Link style={{ height: '38px', paddingTop: '8px' }} to="/pengeluaran" className="float-right btn btn-warning btn-sm">
                                                <i className="fa fa-backward"></i> 
                                                {' '}
                                                Back
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="m-5">
                                        <Row className="mr-4 ml-4 mt-4">
                                            <Col xs={2}>
                                                Date
                                            </Col>
                                            <Col xs={4}>
                                            : 
                                            {' '}
                                            {dayjs(dataSubmission.date).format("YYYY-MM-DD HH:mm:ss")}
                                            </Col>
                                            <Col xs={4} style={{ textAlign:'end' }}>
                                                Due Date
                                            </Col>
                                            <Col xs={2}>
                                                : 
                                                {' '}
                                                {dayjs(dataSubmission.dueDate).format("YYYY-MM-DD HH:mm:ss")}
                                            </Col>
                                        </Row>
                                        <Row className="mr-4 ml-4 mt-2">
                                            <Col xs={2}>
                                                Transaction Name
                                            </Col>
                                            <Col xs={4}>
                                            : 
                                            {' '}
                                            {dataSubmission.submissionName}
                                            </Col>
                                            <Col xs={4} style={{ textAlign:'end' }}>
                                                Vendor Name
                                            </Col>
                                            <Col xs={2}>
                                                {/*  */}
                                            : 
                                            {' '}
                                            {dataSubmission.customerName}
                                            </Col>
                                        </Row>
                                        <Row className="mr-4 ml-4 mt-2">
                                            <Col xs={2}>
                                            Transaction Type
                                            </Col>
                                            <Col xs={4}>
                                            : 
                                            {' '}
                                            {dataSubmission.submission_category && dataSubmission.submission_category.submissionType}
                                            </Col>
                                            <Col xs={4} style={{ textAlign:'end' }}>
                                                Status
                                            </Col>
                                            <Col xs={2}>
                                            : 
                                            {'\u00A0'}
                                            <Button variant="outline-info" size="sm" style={{ borderRadius:'20px' }}>
                                                {dataSubmission.status}
                                            </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                    <Row>
                                        <Col xs={12}>
                                            <Table size="lg" className="mb-5 table-size" responsive>
                                                <thead>
                                                    <tr>
                                                        <th className="pl-5">No</th>
                                                        <th>Products</th>
                                                        <th>Qty</th>
                                                        <th>Price (IDR)</th>
                                                        <th>Discount (%)</th>
                                                        <th>PPN (%)</th>
                                                        <th>Total Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dataSubmission.items && dataSubmission.items.map((data, index) => (
                                                        <tr key={index}>
                                                            <td className="pl-5">{1+index}</td>
                                                            <td>{data.itemName}</td>
                                                            <td>{data.qty}</td>
                                                            <td>
                                                                {convertCurrency(parseFloat(data.buyingPrice))}
                                                            </td>
                                                            <td>
                                                                {data.discount}
                                                                %
                                                            </td>
                                                            <td>
                                                                {data.tax}
                                                                %
                                                            </td>
                                                            <td>
                                                                {convertCurrency(parseFloat(data.buyingPrice) * parseFloat(data.qty))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan="5"></td>
                                                        <th>PAY</th>
                                                        <th>
                                                        
                                                        {convertCurrency(calculateTotalPaid(dataSubmission.transactions))}
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="5"></td>
                                                        <th>TOTAL</th>
                                                        <th>
                                                            {convertCurrency(calculateTotal(dataSubmission.items))}
                                                        </th>
                                                    </tr>
                                                </tfoot>
                                            </Table>
                                        </Col>
                                    </Row>
                                    <Row className="mr-5 pr-5">
                                    {dataSubmission.status !== 'PAID' &&  dataSubmission.status !== 'COMPLETE' &&
                                        <Col xs={12} style={{ textAlign:'end' }}>
                                            <Button 
                                                variant="success" 
                                                style={{ width:'170px' }} 
                                                onClick={() => setShow(true)}
                                            >
                                                ADD PAYMENT
                                            </Button>
                                        </Col> 
                                    }
                                    {dataSubmission.status === 'PAID' &&
                                        <Col xs={12} style={{ textAlign:'end' }}>
                                            <Button variant="success" style={{ width:'150px' }} 
                                                onClick={handleComplete}
                                            >
                                                    Invoice Selesai
                                            </Button>
                                        </Col>
                                    } 
                                    </Row>
                                    <Row>
                                        <Col xs={12}>
                                            <Tabs defaultActiveKey="attachment" id="uncontrolled-tab-example" className="mb-3">
                                                {/* <Tab eventKey="notes" title="Notes" className="p-3">
                                                    <h1>Notes</h1>
                                                </Tab> */}
                                                <Tab eventKey="attachment" title="Attachment" className="p-3">
                                                    <Table size="lg" className="table-size" responsive>
                                                        <thead>
                                                            <tr>
                                                                <th>No</th>
                                                                <th>File Name</th>
                                                                <th>Uploaded At</th>
                                                                <th>Uploaded By</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            { dataSubmission.submission_attachments && dataSubmission.submission_attachments.map((data , index) => (
                                                                <tr>
                                                                    <td>{1+index}</td>
                                                                    <td>{data.attachmentSubmissoin}</td>
                                                                    <td>{dayjs(data.createdAt).format("YYYY-MM-DD HH:mm:ss")}</td>
                                                                    <td>{data.user.fullName}</td>
                                                                    <td>
                                                                        {data.attachmentSubmissoin ? <a href={`${process.env.REACT_APP_URL_ATTACHMENT_SUBMISSIONS+data.attachmentSubmissoin}`} target="_blank"><span style={{ color:'#0DAA66' }}>View</span></a> : '-' }
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                    <Row className="pt-5 pb-2">
                                                        <Col xs={12}>
                                                            <InputGroup className="mb-2">
                                                                <InputGroup.Prepend>
                                                                <InputGroup.Text><i className="fa fa-paperclip"></i></InputGroup.Text>
                                                                </InputGroup.Prepend>
                                                                <Form.File 
                                                                    id="custom-file-translate-scss"
                                                                    label="no file chosen"
                                                                    capture="environment"
                                                                    lang="en"
                                                                    data-browse="Chosee File"
                                                                    custom
                                                                    onChange={(e)=> setFileAttachment(e.target.files[0])}
                                                                />
                                                            </InputGroup>
                                                        </Col>
                                                    </Row>
                                                    <Button 
                                                        onClick={() => handleUploadAttachment()} 
                                                        variant="success" style={{ float:'right', width:'100px' }} 
                                                        className="mt-3"
                                                    >
                                                        UPLOAD
                                                    </Button>
                                                </Tab>
                                                <Tab eventKey="paymentRecord" title="Payment Record" className="p-3">
                                                    <Table size="lg" className="table-size" responsive>
                                                        <thead>
                                                            <tr>
                                                                <th>No</th>
                                                                <th>Date</th>
                                                                <th>Amount</th>
                                                                <th>Payment Method</th>
                                                                <th>Attachment</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dataSubmission.transactions && dataSubmission.transactions.map((data , index) => (
                                                                <tr>
                                                                    <td>{1+index}</td>
                                                                    <td>{dayjs(data.date).format("YYYY-MM-DD HH:mm:ss")}</td>
                                                                    <td>{convertCurrency(parseFloat(data.amount))}</td>
                                                                    <td>{data.wallet.walletName}</td>
                                                                    <td>
                                                                        {data.attachmentTransaction ? <a href={`${process.env.REACT_APP_URL_ATTACHMENT_TRANSACTION+data.attachmentTransaction}`} target="_blank"><span style={{ color:'#0DAA66' }}>View</span></a> : '-' }
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </Tab>
                                            </Tabs>
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
    detailSubmission: state.submissions.detailSubmission
});

const mapDispatchToProps = (dispatch) => ({
    getShow: (detailSubmission) =>
        dispatch({
            type: ActionTypes.SHOW_SUBMISSIONS,
            detailSubmission
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Submissions);
