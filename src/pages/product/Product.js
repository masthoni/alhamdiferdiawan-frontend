import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import DataTable from 'react-data-table-component';
import {toast} from 'react-toastify';
import {Form}  from 'react-bootstrap'; 
import { formatCurrency } from "@app/utils/number";
import {AsyncTypeahead} from 'react-bootstrap-typeahead'

import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/loading-spinner/LoadingSpinner';
import * as ActionTypes from '../../store/actions';
import * as ProductService from '../../services/product';
import * as ProductCategoryService from '../../services/product-category'
import * as ItemsService from '../../services/items';

const Product = ({
    getProduct,
    products,
    storeProduct,
    deleteProduct,
    updateProduct,
    getProductCategory,
    productCategory,
}) => {
    const [t] = useTranslation();

    const [payload, setPayload] = React.useState({
        id: null,
        nama_product: null,
        harga: null,
        stok: null,
        imageProduct: null
    });
    const [search, setSearch] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [size, setSize] = React.useState(10);
    const [totalRow, setTotalRow] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [dataProduct, setDataProduct] = React.useState([]);
    const [dataProductCategory, setDataProductCategory] = React.useState([]);
    const [show, setShow] = React.useState(false);
    const [tabIndex, setTabIndex] = React.useState(-1);
    const [dataImage, setDataImage] = React.useState(null);
    const [columns, setColumn] = React.useState([]);
    const [options, setOptions] = React.useState([]);
    const [productName, setProductName] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [stock, setStock] = React.useState('');
    const [sellingPrice, setSellingPrice] = React.useState('');
    const [buyingPrice, setBuyingPrice] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [image, setImage] = React.useState(null)
    const [order, setOrder] = React.useState('Penjulan Terbanyak')


    useEffect(() => {
        getData(page, size);
        getDataCategoryProduct();
    }, []);

    useEffect(() => {
        setDataProduct(products);
        setDataProductCategory(productCategory)
        setColumn([
            {
                name: 'No',
                cell: (row, index) => `${index + 1 + (page + 1 - 1) * size}.`,
                width: '10%'
            },
            {
                name: 'Nama',
                selector: 'productName'
            },
            {
                name: 'Stock',
                selector: 'stock'
            },
            {
                name: 'Harga Jual',
                selector: (row, index) => (
                    <div>
                        {convertCurrency(parseFloat(row.sellingPrice))}
                    </div>
                )
            },
            {
                name: 'Harga Jual',
                selector: (row, index) => (
                    <div>
                        {convertCurrency(parseFloat(row.buyingPrice))}
                    </div>
                )
            },
            {
                name: 'Kategori',
                selector: (row, index) => (
                    <div>
                        {row.product_category ? row.product_category.productCategory : ''}
                    </div>
                )
            },
            {
                name: 'Terjual',
                selector: 'terjual'
            },
            {
                name: 'Image',
                cell: (row, index) => (
                    <div>
                        <img
                            src={
                                row.photoProduct
                                    ? process.env.REACT_APP_URL_FOTO_PRODUCT +
                                      row.photoProduct
                                    : '/img/default-product.png'
                            }
                            width="75"
                            height="75"
                            className="elevation-2 mt-2 mb-2"
                            alt="Product"
                        />
                    </div>
                )
            },
            {
                name: 'Action',
                width: '10%',
                cell: (row, index) => (
                    <div>
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
    }, [products, productCategory]);

    const getDataCategoryProduct = async () => {
        setLoading(!loading);
        ProductCategoryService.getProductCategory({}).then((data) => {
            setTimeout(() => {
                setLoading(false);
                getProductCategory(data.data.data.rows);
            }, 1000);
        }).catch((error) => {
            setLoading(false);
        });
        
    }

    const getData = async (pageChange, sizeChange = size, orderBy = order) => {
        const opts = {
            params: {
                page: pageChange,
                size: sizeChange,
                q: search
            }
        };
        setLoading(!loading);
        ProductService.getProduct(opts).then((data) => {
            setTimeout(() => {
                setLoading(false);
                data.data.data.rows.forEach((items) => {
                    items.terjual = 0
                    items.item.forEach((item) => {
                        items.terjual += item.qty
                    })
                })

                if(orderBy === 'Penjualan Terbanyak') {
                    data.data.data.rows.sort((a, b) => a.terjual < b.terjual ? 1 : -1)
                }

                if(orderBy === 'Penjualan Tersedikit') {
                    data.data.data.rows.sort((a, b) => a.terjual > b.terjual ? 1 : -1)
                }

                if(orderBy === 'Barang Hampir Habis') {
                    data.data.data.rows.sort((a, b) => a.stock > b.stock ? 1 : -1)
                }

                if(orderBy === 'Barang Habis') {
                    const items = []
                    data.data.data.rows.forEach((item) => {
                        if(item.stock === 0) {
                            items.push(item)
                        }
                    })
                    data.data.data.rows = items
                }
                
                getProduct(data.data.data.rows);
                setTotalRow(data.data.data.totalItems);
            }, 1000);
        }).catch((error) => {
            setLoading(false);
        });
    };


    const handlePageChange = (pageChange) => {
        setPage(pageChange - 1);
        getData(pageChange - 1, size);
    };

    const convertCurrency = (total) => {
        return "Rp. "+formatCurrency(total);
    }

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
            ProductService.deleteProduct(id)
                .then((data) => {
                    setTimeout(() => {
                        deleteProduct(index);
                        setLoading(false);
                    }, 1000);
                    toast.success('Product Deleted!');
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
            const {createdAt, updatedAt, imageProduct, ...newData} = data;
            setDataImage(data.imageProduct);
            setPayload({...newData});
        } else {
            clearInput();
            setDataImage(null);
        }
    };

    const clearInput = () => {
        setPayload({
            id: null,
            nama_product: null,
            harga: null,
            stok: null,
            imageProduct: null
        });
    };

    const filterBy = () => true;

    const handleSubmit = () => {
        setLoading(!loading);
        if (tabIndex === -1) {
            const payloadData = new FormData();
            payloadData.append('productName', productName);
            payloadData.append('productCategoryId', category);
            payloadData.append('stock', stock);
            payloadData.append('sellingPrice', sellingPrice);
            payloadData.append('buyingPrice', buyingPrice);
            payloadData.append('description', description);
            payloadData.append('photoProduct', image);
            ProductService.storeProduct(payloadData)
                .then((data) => {
                    setTimeout(() => {
                        storeProduct(data.data);
                        setLoading(false);
                        setShow(false);
                        getData(0, size);
                        toast.success('Product Created!');
                    }, 1000);
                })
                .catch((error) => {
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                });
        } else {
            const payloadData = new FormData();
            payloadData.append('nama_product', payload.nama_product);
            payloadData.append('harga', payload.harga);
            payloadData.append('stok', payload.stok);
            payloadData.append('imageProduct', payload.imageProduct);
            ProductService.updateProduct(payload.id, payloadData)
                .then((data) => {
                    setTimeout(() => {
                        updateProduct(tabIndex, data.data);
                        setLoading(false);
                        setShow(false);
                        toast.success('Product Updated!');
                    }, 1000);
                })
                .catch((error) => {
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                });
        }
    };

    const handleSearchProduct = async (query) => {
        setLoading(!loading)
        const opts = {
            params: {
                'q' : query
            }
        }

        ItemsService.getItems(opts).then((data) => {
            setTimeout(() => {
                setLoading(false);
                setOptions(data.data.data.rows);
            }, 1000);
        }).catch((error) => {
            setLoading(false);
        });
    };


    const onInputChangeProduct = async (query) => {
        setTimeout(() => {

            setLoading(!loading)
            const opts = {
                params: {
                    'q' : query
                }
            }

            ItemsService.getItems(opts).then((data) => {
                setTimeout(() => {
                    setLoading(false);
                    setOptions(data.data.data.rows);
                    const result = data.data.data.rows.find((value) => value.itemName.toLowerCase() === query.toLowerCase())
                    if(result){
                        setProductName(result.itemName)
                    }else{
                        setProductName(query)
                    }
                }, 1000);
            }).catch((error) => {
                setLoading(false);
            });
            // let opts = {
            //     params: {
            //         'filter[item_name][like]' : query
            //     }
            // }
            // this.props.getItemSubmission(opts).then(() => {
            //     let data = this.props.dataItem.find((value) => value.attributes.item_name.toLowerCase() == query.toLowerCase())
            //     if(data){
            //         this.setState({
            //             product_name: data.attributes.item_name,
            //             selling_price: data.attributes.selling_price,
            //             id: data.attributes.id,
            //             buying_price: data.attributes.buying_price,
            //             dataDetailProduct: this.props.dataItem
            //         })
            //     }else{
            //         this.setState({
            //             product_name: query,
            //             selling_price: null,
            //             id: null,
            //             buying_price: null,
            //             dataDetailCategory: null
            //         })
            //     }
            // })
        }, 1000)
    }



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
                                ? 'Create Product'
                                : 'Edit Product '}
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
                                htmlFor="Product Name"
                                className="col-sm-3 col-form-label"
                            >
                                Product Name
                            {' '}
                            </label>
                            <div className="col-sm-9">
                            <AsyncTypeahead
                                defaultInputValue={productName}
                                filterBy={filterBy}
                                labelKey="itemName"
                                id="async-example"
                                isLoading={loading}
                                minLength={1}
                                onChange={selected => {
                                    if (selected.length !== 0) {
                                        setProductName(selected[0].itemName)
                                        setSellingPrice(Number(selected[0].sellingPrice))
                                        setBuyingPrice(Number(selected[0].buyingPrice))
                                        
                                    }
                                }}
                                onSearch={handleSearchProduct}
                                onInputChange={onInputChangeProduct}
                                options={options}
                                placeholder="Search product..."
                                renderMenuItemChildren={(option, props) => (
                                    <div key={option.id}>
                                        <span>{option.itemName}</span>
                                    </div>
                                )}
                            />

                            </div>
                        </div>

                        <div className="form-group row">
                            <label
                                htmlFor="Product Category"
                                className="col-sm-3 col-form-label"
                            >
                                Product Category
                            {' '}
                            </label>
                            <div className="col-sm-9">
                                <Form.Control 
                                    as="select" 
                                    defaultValue={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">-Choose Product Category-</option>
                                    {
                                        dataProductCategory && dataProductCategory.map((data) => (
                                            <option key={data.id} value={data.id}>{data.productCategory}</option>
                                        ))
                                    }
                                </Form.Control>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label
                                htmlFor="Stock"
                                className="col-sm-3 col-form-label"
                            >
                                Stock
                            </label>
                            <div className="col-sm-9">
                                <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={stock}
                                    placeholder="Stock"
                                    onChange={(e) => setStock(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label
                                htmlFor="Selling Price"
                                className="col-sm-3 col-form-label"
                            >
                                Selling Price
                            </label>
                            <div className="col-sm-9">
                                <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={sellingPrice}
                                    placeholder="Selling Price"
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label
                                htmlFor="Buying Price"
                                className="col-sm-3 col-form-label"
                            >
                                Buying Price
                            </label>
                            <div className="col-sm-9">
                                <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={buyingPrice}
                                    placeholder="Buying Price"
                                    onChange={(e) => setBuyingPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label
                                htmlFor="stok"
                                className="col-sm-3 col-form-label"
                            >
                                Description
                            </label>
                            <div className="col-sm-9">
                                <textarea
                                    type="text"
                                    className="form-control"
                                    placeholder="Description"
                                    defaultValue={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        {tabIndex !== -1 && (
                            <div className="form-group row">
                                <label
                                    htmlFor="Foto"
                                    className="col-sm-3 col-form-label"
                                >
                                    {' '}
                                </label>
                                <div className="col-sm-9">
                                    <img
                                        src={
                                            dataImage
                                                ? process.env
                                                      .REACT_APP_URL_FOTO_Product +
                                                  dataImage
                                                : '/img/default-profile.png'
                                        }
                                        width="100"
                                        height="100"
                                        className="elevation-2"
                                        alt="Product"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="form-group row">
                            <label
                                htmlFor="Foto"
                                className="col-sm-3 col-form-label"
                            >
                                Product Photo
                            </label>
                            <div className="col-sm-9">
                                <div className="custom-file">
                                    <input
                                        type="file"
                                        className="custom-file-input"
                                        id="customFile"
                                        onChange={(e) => setImage(e.target.files[0])}
                                    />
                                    <label
                                        htmlFor="Foto"
                                        className="custom-file-label"
                                    >
                                        {image
                                            ? image.name
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
                            <h1>Manage Product</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <Link to="/">{t('header.label.home')}</Link>
                                </li>
                                <li className="breadcrumb-item active">
                                    Manage Product
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
                                            <div className="form-group">
                                                <label>Urutkan Berdasarkan</label>
                                                <Form.Control 
                                                    as="select" 
                                                    aria-label="Default select example"
                                                    value={order}
                                                    onChange={(e) => {
                                                        setOrder(e.target.value)
                                                        getData(page, size, e.target.value)
                                                    }}
                                                >
                                                    <option value="Penjualan Terbanyak">Penjualan Terbanyak</option>
                                                    <option value="Penjualan Tersedikit">Penjualan Tersedikit</option>
                                                    <option value="Barang Hampir Habis">Barang Hampir Habis</option>
                                                    <option value="Barang Habis">Barang Habis</option>
                                                </Form.Control>
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
                                                Create Product
                                            </button>
                                        </div>
                                    </div>
                                    <DataTable
                                        title="Arnold Movies"
                                        columns={columns}
                                        data={dataProduct}
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
    products: state.product.products,
    detailProduct: state.product.detailProduct,
    productCategory: state.productCategory.productCategory
});

const mapDispatchToProps = (dispatch) => ({
    getProduct: (products) =>
        dispatch({type: ActionTypes.LOAD_PRODUCTS, products}),
    storeProduct: (detailProduct) =>
        dispatch({type: ActionTypes.STORE_PRODUCT, detailProduct}),
    deleteProduct: (indexProduct) =>
        dispatch({type: ActionTypes.DELETE_PRODUCT, index: indexProduct}),
    updateProduct: (indexProduct, detailProduct) =>
        dispatch({
            type: ActionTypes.UPDATE_PRODUCT,
            detailProduct,
            index: indexProduct
        }),
    getProductCategory: (productCategory) => dispatch({type: ActionTypes.LOAD_PRODUCT_CATEGORY, productCategory})
});

export default connect(mapStateToProps, mapDispatchToProps)(Product);
