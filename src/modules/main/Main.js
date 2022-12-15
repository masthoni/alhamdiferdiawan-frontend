import React, {useState, useEffect} from 'react';
import {Route, Switch} from 'react-router-dom';
import {connect} from 'react-redux';

import Dashboard from '@pages/Dashboard';
import Profile from '@app/pages/company-profile/CompanyProfile';
import ManageUser from '@app/pages/manage-user/ManageUser';
import Product from '@app/pages/product/Product';
import SubmissionCategory from '@app/pages/submission-categories/SubmissionCategory';
import ProductCategory from '@app/pages/product-category/ProductCategory';
import Pemasukan from '@app/pages/submission/pemasukan/index';
import Invoice from '@app/pages/submission/pemasukan/invoice';
import CreatePemasukan from '@app/pages/submission/pemasukan/create'
import EditPemasukan from '@app/pages/submission/pemasukan/edit'
import Pengeluaran from '@app/pages/submission/pengeluaran/index';
import CreatePengeluaran from '@app/pages/submission/pengeluaran/create'
import PurchaseOrder from '@app/pages/submission/pengeluaran/purchase-order'
import EditPengeluaran from '@app/pages/submission/pengeluaran/edit'
import Wallet from '@app/pages/wallets/Wallet';
import Items from '@app/pages/items/index'
import Transactions from '@app/pages/transactions/index'
import Laporan from '@app/pages/laporan/index'
import * as AuthService from '../../services/auth';

import Header from './header/Header';
import Footer from './footer/Footer';
import MenuSidebar from './menu-sidebar/MenuSidebar';
import * as ActionTypes from '../../store/actions';

const Main = ({onUserLoad}) => {
    const [menusidebarState, updateMenusidebarState] = useState({
        isMenuSidebarCollapsed: false
    });

    const toggleMenuSidebar = () => {
        updateMenusidebarState({
            isMenuSidebarCollapsed: !menusidebarState.isMenuSidebarCollapsed
        });
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await AuthService.getProfile();
                onUserLoad({...response.data});
            } catch (error) {
                /* eslint no-console: "error" */
                console.log(error); // eslint-disable-line no-console
            }
        };
        fetchProfile();
        return () => {}; // eslint-disable-line no-console
    }, [onUserLoad]);

    document.getElementById('root').classList.remove('register-page');
    document.getElementById('root').classList.remove('login-page');
    document.getElementById('root').classList.remove('hold-transition');

    document.getElementById('root').className += ' sidebar-mini';

    if (menusidebarState.isMenuSidebarCollapsed) {
        document.getElementById('root').classList.add('sidebar-collapse');
        document.getElementById('root').classList.remove('sidebar-open');
    } else {
        document.getElementById('root').classList.add('sidebar-open');
        document.getElementById('root').classList.remove('sidebar-collapse');
    }

    return (
        <div className="wrapper">
            <Header toggleMenuSidebar={toggleMenuSidebar} />

            <MenuSidebar />

            <div className="content-wrapper">
                <div className="pt-3" />
                <section className="content">
                    <Switch>
                    
                        <Route exact path="/laporan" component={Laporan} />
                        <Route exact path="/wallet" component={Wallet} />
                        
                        <Route
                            exact
                            path="/pemasukan"
                            component={Pemasukan}
                        />
                        <Route
                            exact
                            path="/pemasukan/create"
                            component={CreatePemasukan}
                        />
                        <Route
                            exact
                            path="/pengeluaran"
                            component={Pengeluaran}
                        />
                        <Route
                            exact
                            path="/pengeluaran/purchase-order/:id"
                            component={PurchaseOrder}
                        />
                        
                        <Route
                            exact
                            path="/pengeluaran/create"
                            component={CreatePengeluaran}
                        />
                        <Route
                            exact
                            path="/kategori-produk"
                            component={ProductCategory}
                        />
                        <Route
                            exact
                            path="/kategori-submission"
                            component={SubmissionCategory}
                        />
                        <Route
                            exact
                            path="/manage-user"
                            component={ManageUser}
                        />
                        <Route exact path="/product" component={Product} />
                        <Route
                            exact
                            path="/company-profile"
                            component={Profile}
                        />
                        <Route
                            exact
                            path="/items"
                            component={Items}
                        />
                        <Route
                            exact
                            path="/pemasukan/invoice/:id"
                            component={Invoice}
                        />
                        <Route
                            exact
                            path="/pemasukan/edit/:id"
                            component={EditPemasukan}
                        />
                        <Route
                            exact
                            path="/pengeluaran/edit/:id"
                            component={EditPengeluaran}
                        />
                        <Route
                            exact
                            path="/transaksi"
                            component={Transactions}
                        />
                        
                        <Route exact path="/" component={Dashboard} />
                    </Switch>
                </section>
            </div>
            <Footer />
            <div
                id="sidebar-overlay"
                role="presentation"
                onClick={toggleMenuSidebar}
                onKeyDown={() => {}}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.auth.currentUser
});

const mapDispatchToProps = (dispatch) => ({
    onUserLoad: (user) =>
        dispatch({type: ActionTypes.LOAD_USER, currentUser: user})
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
