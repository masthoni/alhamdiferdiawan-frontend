import React from 'react';
import {connect} from 'react-redux';
import {NavLink, Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Can from '../../../components/Can';

const MenuSidebar = ({user}) => {
    const {t} = useTranslation();
    // const ability = useAbility(AbilityContext);
    return (
        <aside
            className="main-sidebar sidebar-dark-primary elevation-4"
            style={{backgroundColor: '#114e60', color: 'white !important'}}
        >
            <Link to="/" className="brand-link">
                <img
                    src="/img/logo.png"
                    alt="AdminLTE Logo"
                    className="brand-image img-circle elevation-3"
                    style={{opacity: '.8'}}
                />
                <span className="brand-text font-weight-light">
                    EL-MALIK
                    <br />
                    <small style={{fontSize: '11px'}}>
                        Aplikasi Pencatatan Keuangan
                    </small>
                </span>
            </Link>
            <div className="sidebar">
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="image">
                        <img
                            src={
                                user.imageUser
                                    ? process.env.REACT_APP_URL_FOTO_USER +
                                      user.imageUser
                                    : '/img/default-profile.png'
                            }
                            className="img-circle elevation-2"
                            alt="User"
                        />
                    </div>
                    <div className="info">
                        <Link to="/" className="d-block">
                            {user.email}
                        </Link>
                    </div>
                </div>
                <nav className="mt-2">
                    <ul
                        className="nav nav-pills nav-sidebar flex-column"
                        data-widget="treeview"
                        role="menu"
                        data-accordion="false"
                    >
                        <li className="nav-item">
                            <NavLink to="/" exact className="nav-link">
                                <i className="nav-icon fas fa-tachometer-alt" />
                                <p>{t('menusidebar.label.dashboard')}</p>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/company-profile"
                                exact
                                className="nav-link"
                            >
                                <i className="nav-icon fas fa-user" />
                                <p>{t('menusidebar.label.profile_company')}</p>
                            </NavLink>
                        </li>
                        <Can do="show" on="ManageUser">
                            <li className="nav-item">
                                <NavLink
                                    to="/manage-user"
                                    exact
                                    className="nav-link"
                                >
                                    <i className="nav-icon fas fa-users" />
                                    <p>{t('menusidebar.label.manage_user')}</p>
                                </NavLink>
                            </li>
                        </Can>
                        <li className="nav-item">
                            <NavLink to="/pemasukan" exact className="nav-link">
                                <i className="nav-icon fas fa-dollar-sign" />
                                <p>{t('menusidebar.label.pemasukan')}</p>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/pengeluaran"
                                exact
                                className="nav-link"
                            >
                                <i className="nav-icon fas fa-shopping-cart" />
                                <p>{t('menusidebar.label.pengeluaran')}</p>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/product" exact className="nav-link">
                                <i className="nav-icon fas fa-store" />
                                <p>Produk</p>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/items" exact className="nav-link">
                                <i className="nav-icon fas fa-cash-register" />
                                <p>{t('menusidebar.label.items')}</p>
                            </NavLink>
                        </li>
                        <Can do="show" on="DaftarTransaksi">
                            <li className="nav-item">
                                <NavLink
                                    to="/transaksi"
                                    exact
                                    className="nav-link"
                                >
                                    <i className="nav-icon fas fa-exchange-alt" />
                                    <p>{t('menusidebar.label.transaksi')}</p>
                                </NavLink>
                            </li>
                        </Can>
                        <Can do="show" on="Wallet">
                            <li className="nav-item">
                                <NavLink
                                    to="/wallet"
                                    exact
                                    className="nav-link"
                                >
                                    <i className="nav-icon fas fa-wallet" />
                                    <p>{t('menusidebar.label.wallet')}</p>
                                </NavLink>
                            </li>
                        </Can>
                        <li className="nav-item">
                            <NavLink
                                to="/kategori-submission"
                                exact
                                className="nav-link"
                            >
                                <i className="nav-icon fas fa-cog" />
                                <p>
                                    {t('menusidebar.label.kategori_submission')}
                                </p>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/kategori-produk"
                                exact
                                className="nav-link"
                            >
                                <i className="nav-icon fas fa-cog" />
                                <p>{t('menusidebar.label.kategori_produk')}</p>
                            </NavLink>
                        </li>
                        <Can do="show" on="Laporan">
                            <li className="nav-item">
                                <NavLink
                                    to="/laporan"
                                    exact
                                    className="nav-link"
                                >
                                    <i className="nav-icon fas fa-print" />
                                    <p>{t('menusidebar.label.laporan')}</p>
                                </NavLink>
                            </li>
                        </Can>
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

const mapStateToProps = (state) => ({
    user: state.auth.currentUser
});

export default connect(mapStateToProps, null)(MenuSidebar);
