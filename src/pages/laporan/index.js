import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import DataTable from 'react-data-table-component';
import { Form, Col, Row, Image, Badge } from 'react-bootstrap';
import { formatCurrency } from "@app/utils/number";
import dayjs from 'dayjs';

import LoadingSpinner from '../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../store/actions';
import * as SubmissionService from '../../services/submission';

const Laporan = ({
    getItem,
    items
}) => {
    const [t] = useTranslation();

    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(10);
    const [totalRow, setTotalRow] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [dataProductCategory, setDataProductCategory] = React.useState([]);
    const [columns, setColumn] = React.useState([]);
    const [typeSubmission, setTypeSubmission] = React.useState('PEMASUKAN');
    const [dateStart, setDateStart] = React.useState(null);
    const [dateEnd, setDateEnd] = React.useState(null);
    const [typeFilter, setTypeFilter] = React.useState('');
    const [dataCompany, setDataCompany] = React.useState(null);
    const [month, setMonth] = React.useState('');
    const [years, setYears] = React.useState('');
    const [total, setTotal] = React.useState(0);

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
                name: 'Terjual',
                selector: (row, index) => (
                    <div>
                        {parseFloat(row.qty)} Pcs
                    </div>
                ),
            },
            {
                name: 'Harga',
                selector: (row, index) => (
                    <div>
                        {convertCurrency(parseFloat(row.price))}
                    </div>
                )
            },
            {
                name: 'Total',
                selector: (row, index) => (
                    <div>
                        {convertCurrency(parseFloat(row.total))}
                    </div>
                )
            },
        ]);
    }, [items]);

    const getData = async (pageChange, sizeChange = size) => {
        setLoading(!loading);
        const payloadd = {
            'typeSubmission': typeSubmission,
            page: pageChange,
            size: sizeChange,
            typeFilter
        }

        if(typeFilter === 'Tahunan') {
            payloadd.years = years
        } else if(typeFilter === 'Bulanan') {
            payloadd.month = month
        } else {
            payloadd.startDate = dateStart
            payloadd.endDate = dateEnd
        }
        SubmissionService.laporan(payloadd,{}).then(
            (data) => {
                setTimeout(() => {
                    setLoading(false);
                    setTotal(data.data.data.total)
                    getItem(data.data.data.laporan.rows);
                    setDataCompany(data.data.data.company)
                    setTotalRow(data.data.data.laporan.totalItems);
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

    const convertCurrency = (total) => {
        return "Rp. "+formatCurrency(total);
    }

    const handlePrint = () => {
        var printContents = document.getElementById("divcontents").innerHTML;
        var originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    }

    return (
        <>
            <LoadingSpinner isLoading={loading} />
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Lihat Laporan Keuangan</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">{t('header.label.home')}</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Laporan Keuangan
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
                                                <label>Tipe Filter</label>
                                                <Form.Control 
                                                    as="select" 
                                                    aria-label="Default select example"
                                                    value={typeFilter}
                                                        onChange={(e) => {
                                                            setTypeFilter(e.target.value)
                                                    }}
                                                >
                                                    <option>Pilih Tipe Filter</option>
                                                    <option value="Tahunan">Tahunan</option>
                                                    <option value="Bulanan">Bulanan</option>
                                                    <option value="Dinamis">Dinamis</option>
                                                </Form.Control>
                                            </div>
                                        </div>
                                    </div>
                                    { typeFilter === 'Dinamis' &&
                                        <div className="row">
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
                                    }
                                    { typeFilter === 'Bulanan' &&
                                        <div className="row">
                                            <div className="col-4">
                                                <div className="form-group">
                                                    <label>Pilih Bulan</label>
                                                    <Form.Control 
                                                        as="select" 
                                                        aria-label="Default select example"
                                                        value={month}
                                                            onChange={(e) => {
                                                                setMonth(e.target.value)
                                                        }}
                                                    >
                                                        <option>Pilih Bulan</option>
                                                        <option value="01">Januari</option>
                                                        <option value="02">Februari</option>
                                                        <option value="03">Maret</option>
                                                        <option value="04">April</option>
                                                        <option value="05">Mei</option>
                                                        <option value="06">Juni</option>
                                                        <option value="07">Juli</option>
                                                        <option value="08">Agustus</option>
                                                        <option value="09">September</option>
                                                        <option value="10">Oktober</option>
                                                        <option value="11">November</option>
                                                        <option value="12">Desember</option>
                                                    </Form.Control>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    { typeFilter === 'Tahunan' &&
                                        <div className="row">
                                            <div className="col-4">
                                                <div className="form-group">
                                                    <label>Tahun</label>
                                                    <Form.Control 
                                                        as="select" 
                                                        aria-label="Default select example"
                                                        value={years}
                                                            onChange={(e) => {
                                                                setYears(e.target.value)
                                                        }}
                                                    >
                                                        <option>Pilih Tahun</option>
                                                        <option value="2021">2021</option>
                                                        <option value="2022">2022</option>
                                                        <option value="2023">2023</option>
                                                        <option value="2024">2024</option>
                                                        <option value="2025">2025</option>
                                                        <option value="2026">2026</option>
                                                        <option value="2027">2027</option>
                                                    </Form.Control>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="row mt-3">
                                        <div className="col-4">
                                            <button type="submit" className="btn btn-primary mr-2" onClick={handleFilter}>Lihat Laporan Keuangan</button>  
                                            <button type="submit" className="btn btn-secondary">Reset</button>
                                        </div>
                                        <div className="col-8 text-right">
                                            <button type='button' onClick={handlePrint} className="btn btn-success">Print</button>
                                        </div>
                                    </div>
                                </form>                                  
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card card-primary card-outline">
                            {dataCompany !== null &&
                                <div className="card-body box-profile" id="divcontents">
                                
                                <>
                                <div className="panel-body pt-3 pl-5 pr-5">
                                    <div 
                                        style={{
                                            width:'85',
                                            height:'88',
                                            overflow:'hidden',
                                            position:'absolute',
                                            top:'-1',
                                            right:'14',
                                        }}
                                        className="invoice-ribbon"
                                    >
                                        {/* <div className="ribbon-inner">{this.props.data.attributes.status}</div> */}
                                    </div>
                                    <div className="row m-3">
                        
                                        <div className="col-sm-6" 
                                            style={{
                                                fontSiz:'65',
                                                color:'#3ba0ff'
                                            }}
                                        >
                                            <div className="d-flex mb-3">
                                                <div className="p-2">
                                                    <Image 
                                                        src={dataCompany.companyLogo
                                                            ? process.env.REACT_APP_URL_FOTO_COMPANY +
                                                            dataCompany.companyLogo
                                                            : '/img/default-profile.png'}
                                                        height="150"
                                                        width="150"
                                                        circle 
                                                    />
                                                </div>
                                                <div className="p-2">
                                                    <h1>{dataCompany.companyName}</h1>
                                                    <p>Telepon : {dataCompany.companyTelp}</p>
                                                    <p>Email : {dataCompany.companyEmail}</p>
                                                    <small> Alamat : {dataCompany.companyAddress}</small>
                                                </div>
                                            </div>
                                            
                                        </div>
                        
                                        <div className="col-sm-6 p-5"
                                            style={{
                                                position: 'absolute',
                                                right: '30px',
                                                top: '40px',
                                                textAlign:'right',
                                            }}
                                        >
                                            <h1>  
                                                <Badge variant={typeSubmission === 'PENGELUARAN' ? 'secondary' : 'success'}>{typeSubmission}</Badge>
                                            </h1>
                                        </div>
                                        
                                    </div>
                                    
                        
                                    </div>
                                    <hr />

                                    <Row className="pt-3 pr-5">
                                        <Col xs={12} className="text-center">
                                            <h4>
                                            {
                                                typeFilter === 'Dinamis' &&
                                                <p><strong>Laporan {typeSubmission} Dari Tanggal {dayjs(dateStart).format("YYYY-MM-DD HH:mm:ss")} sampai tanggal {dayjs(dateEnd).format("YYYY-MM-DD HH:mm:ss")}</strong></p>
                                            }
                                            {
                                                typeFilter === 'Tahunan' &&
                                                <p><strong>Laporan {typeSubmission} Tahun {years}</strong></p>
                                            }
                                            {
                                                typeFilter === 'Bulanan' &&
                                                <p><strong>Laporan {typeSubmission} Bulan {month}</strong></p>
                                            }
                                            </h4>
                                        </Col>
                                    </Row>
                                </>
                                
                                    <DataTable
                                        className="mb-3"
                                        title="Arnold Movies"
                                        columns={columns}
                                        data={dataProductCategory}
                                        noHeader
                                        highlightOnHover
                                        paginationTotalRows={totalRow}
                                        paginationPerPage={size}
                                        onChangePage={handlePageChange}
                                        onChangeRowsPerPage={
                                            handlePerRowsChange
                                        }
                                    />
                                <hr />
                                <div className='text-right mr-3'>
                                    {
                                        typeSubmission === 'PEMASUKAN' &&
                                        <h5 className='text-success'>
                                            Total {typeSubmission} {convertCurrency(parseFloat(total))}
                                        </h5>
                                    }
                                    {
                                        typeSubmission === 'PENGELUARAN' &&
                                        <h5 className='text-danger'>
                                            Total {typeSubmission} {convertCurrency(parseFloat(total))}
                                        </h5>
                                    }
                                </div>
                                <Row className="mt-5 pt-5 pl-5 pr-5 mr-5">
                                    <Col xs={12} className="text-right">
                                        <strong><p style={{ paddingRight:'100' }}>Mengetahui &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p><br /><br /><br /><br /><br />
                                        <p>({dataCompany && dataCompany.ownerName})</p></strong>
                                    </Col>
                                </Row>
                                </div>
                                }
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

export default connect(mapStateToProps, mapDispatchToProps)(Laporan);
