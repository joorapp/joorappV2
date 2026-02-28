import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardTitle, Row, Col, Table } from 'reactstrap';
import { useAuth } from '../../../../context/AuthContext';
import profileImg from '../../../../assets/images/profile-img.png';
import clientLogo from '../../../../assets/images/client_logo.png';
import CompanyHeader from '../CompanyHeader/CompanyHeader';
import CompanySidebar from '../CompanySidebar/CompanySidebar';
import CompanyFooter from '../CompanyFooter/CompanyFooter';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import StackedColumnChart from '../../../common/StackedColumnChart/StackedColumnChart';
import ApexRadial from '../../../common/ApexRadial/ApexRadial';

// Simple classNames utility
const classNames = (...classes: (string | { [key: string]: boolean } | undefined)[]): string => {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([_, condition]) => condition)
          .map(([className]) => className)
          .join(' ');
      }
      return '';
    })
    .join(' ');
};

// Company overview – same design as SuperAdmin dashboard
export const CompanyOverview = () => {
  const { t } = useTranslation();
  const [periodType, setPeriodType] = useState<string>('Month');
  const [periodData] = useState<any[]>([
    { name: t('Dashboard.totalOrders'), data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 55] },
    { name: t('Dashboard.customers'), data: [13, 23, 20, 8, 13, 27, 33, 12, 19, 18, 28, 25] }
  ]);

  const onChangeChartPeriod = (period: string) => {
    setPeriodType(period);
  };

  return (
    <>
      <Breadcrumbs title={t('Dashboards.Dashboards')} breadcrumbItem={t('Dashboards.Dashboard')} />

      {/* 8 mini-stats-wid cards from dashboard image */}
      <Row className="mb-4">
        <Col lg="3" md="6" className="mb-3">
          <Card className="mini-stats-wid border-start border-danger border-3">
            <CardBody>
              <p className="text-muted fw-medium mb-1">{t('CompanyDashboard.clients')}</p>
              <h4 className="mb-2">8</h4>
              <ul className="list-unstyled mb-0 font-size-13 text-muted">
                <li>{t('CompanyDashboard.pendingPayments', { count: 1 })}</li>
                <li>{t('CompanyDashboard.completedPayments', { count: 0 })}</li>
                <li>{t('CompanyDashboard.clientInvoices', { count: 1 })}</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
        <Col lg="3" md="6" className="mb-3">
          <Card className="mini-stats-wid border-start border-warning border-3">
            <CardBody>
              <p className="text-muted fw-medium mb-1">{t('CompanyDashboard.projects')}</p>
              <h4 className="mb-2">8</h4>
              <ul className="list-unstyled mb-0 font-size-13 text-muted">
                <li>{t('CompanyDashboard.upcomingProjects', { count: 0 })}</li>
                <li>{t('CompanyDashboard.ongoingProjects', { count: 8 })}</li>
                <li>{t('CompanyDashboard.completedProjects', { count: 0 })}</li>
                <li>{t('CompanyDashboard.onHold', { count: 0 })}</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
        <Col lg="3" md="6" className="mb-3">
          <Card className="mini-stats-wid border-start border-info border-3">
            <CardBody>
              <p className="text-muted fw-medium mb-1">{t('CompanyDashboard.materials')} & {t('CompanyDashboard.rentalItems')}</p>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted font-size-13">{t('CompanyDashboard.materials')}</span>
                <span className="fw-medium">131</span>
              </div>
              <div className="d-flex justify-content-between font-size-13 text-muted">
                <span>{t('CompanyDashboard.rentalItems')}</span>
                <span>8</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg="3" md="6" className="mb-3">
          <Card className="mini-stats-wid border-start border-success border-3">
            <CardBody>
              <p className="text-muted fw-medium mb-1">{t('CompanyDashboard.staffs')}</p>
              <h4 className="mb-2">14</h4>
              <ul className="list-unstyled mb-0 font-size-13 text-muted">
                <li>{t('CompanyDashboard.officeStaffs', { count: 14 })}</li>
                <li>{t('CompanyDashboard.freelancers', { count: 0 })}</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
        <Col lg="3" md="6" className="mb-3">
          <Card className="mini-stats-wid border-start border-danger border-3">
            <CardBody>
              <p className="text-muted fw-medium mb-1">{t('CompanyDashboard.suppliers')}</p>
              <h4 className="mb-2">13</h4>
              <ul className="list-unstyled mb-0 font-size-13 text-muted">
                <li>{t('CompanyDashboard.mSuppliers', { amount: '₹ 9,607.00' })}</li>
                <li>{t('CompanyDashboard.rSuppliers', { amount: '₹ 1,000.00' })}</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
        <Col lg="3" md="6" className="mb-3">
          <Card className="mini-stats-wid border-start border-warning border-3">
            <CardBody>
              <p className="text-muted fw-medium mb-1">{t('CompanyDashboard.subcontractors')}</p>
              <h4 className="mb-2">2</h4>
              <ul className="list-unstyled mb-0 font-size-13 text-muted">
                <li>{t('CompanyDashboard.pendingContracts', { count: 1 })}</li>
                <li>{t('CompanyDashboard.completedContracts', { count: 0 })}</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
        <Col lg="3" md="6" className="mb-3">
          <Card className="mini-stats-wid border-start border-info border-3">
            <CardBody>
              <p className="text-muted fw-medium mb-1">{t('CompanyDashboard.reports')}</p>
              <h4 className="mb-2">28</h4>
              <ul className="list-unstyled mb-0 font-size-13 text-muted">
                <li>{t('CompanyDashboard.cashInHand', { amount: '₹ 5,000.00' })}</li>
                <li>{t('CompanyDashboard.cashInBank', { amount: '₹ 2,34,207.00' })}</li>
                <li>{t('CompanyDashboard.totalCash', { amount: '₹ 2,39,207.00' })}</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
        <Col lg="3" md="6" className="mb-3">
          <Card className="mini-stats-wid border-start border-success border-3">
            <CardBody>
              <p className="text-muted fw-medium mb-1">{t('CompanyDashboard.users')}</p>
              <h4 className="mb-2">22</h4>
              <div className="font-size-13 text-muted d-flex flex-wrap gap-2">
                <span>3 PM</span>
                <span>1 AM</span>
                <span>12 SO</span>
                <span>1 PD</span>
                <span>1 QC</span>
                <span>4 Pu M</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl="4">
          <Card className="overflow-hidden">
            <div className="bg-primary-subtle">
              <Row>
                <Col xs="7">
                  <div className="text-primary p-3">
                    <h5 className="text-primary">{t('DashboardContent.welcomeBack')}</h5>
                    <p>{t('CompanyHeader.companyDashboard')}</p>
                  </div>
                </Col>
                <Col xs="5" className="align-self-end">
                  <img src={profileImg} alt="" className="img-fluid" />
                </Col>
              </Row>
            </div>
            <CardBody className="pt-0">
              <Row>
                <Col sm="4">
                  <div className="avatar-md profile-user-wid mb-4">
                    <img src={clientLogo} alt="" className="img-thumbnail rounded-circle" />
                  </div>
                </Col>
                <Col sm="8">
                  <div className="pt-4">
                    <Row>
                      <Col xs="6">
                        <h5 className="font-size-15">125</h5>
                        <p className="text-muted mb-0">{t('DashboardContent.projects')}</p>
                      </Col>
                      <Col xs="6">
                        <h5 className="font-size-15">$1245</h5>
                        <p className="text-muted mb-0">{t('DashboardContent.revenue')}</p>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardTitle className="mb-4">{t('DashboardContent.monthlyEarning')}</CardTitle>
              <Row>
                <Col sm="6">
                  <p className="text-muted">{t('DashboardContent.thisMonth')}</p>
                  <h3>$34,252</h3>
                  <p className="text-muted">
                    <span className="text-success me-2">12% <i className="mdi mdi-arrow-up"></i></span>
                    {t('DashboardContent.fromPreviousPeriod')}
                  </p>
                  <div className="mt-4">
                    <Link to="" className="btn btn-primary waves-effect waves-light btn-sm">
                      {t('DashboardContent.viewMore')} <i className="mdi mdi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </Col>
                <Col sm="6">
                  <div className="mt-4 mt-sm-0">
                    <ApexRadial dataColors='["--bs-primary"]' />
                  </div>
                </Col>
              </Row>
              <p className="text-muted mt-3 mb-0">{t('DashboardContent.weCraftDigital')}</p>
            </CardBody>
          </Card>
        </Col>
        <Col xl="8">
          <Row>
            <Col md="4">
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">{t('CompanyDashboard.clients')}</p>
                      <h4 className="mb-0">8</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className="bx bx-user font-size-24 text-white"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col md="4">
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">{t('CompanyDashboard.materials')}</p>
                      <h4 className="mb-0">131</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className="bx bx-box font-size-24 text-white"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">{t('CompanyDashboard.rentalItems')}</p>
                      <h4 className="mb-0">8</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className="bx bx-cart font-size-24 text-white"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col md="4">
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">{t('CompanyDashboard.suppliers')}</p>
                      <h4 className="mb-0">8</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className="bx bx-cart font-size-24 text-white"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">{t('CompanyDashboard.subcontractors')}</p>
                      <h4 className="mb-0">8</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className="bx bx-cart font-size-24 text-white"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium">{t('CompanyDashboard.reports')}</p>
                      <h4 className="mb-0">8</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className="bx bx-cart font-size-24 text-white"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Card>
            <CardBody>
              <div className="d-sm-flex flex-wrap">
                <h4 className="card-title mb-4">{t('Dashboard.recentOrders')}</h4>
                <div className="ms-auto">
                  <ul className="nav nav-pills">
                    <li className="nav-item">
                      <Link to="#" className={classNames({ active: periodType === 'Week' }, 'nav-link')} onClick={() => onChangeChartPeriod('Week')}>
                        {t('DashboardContent.week')}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className={classNames({ active: periodType === 'Month' }, 'nav-link')} onClick={() => onChangeChartPeriod('Month')}>
                        {t('DashboardContent.month')}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className={classNames({ active: periodType === 'Year' }, 'nav-link')} onClick={() => onChangeChartPeriod('Year')}>
                        {t('DashboardContent.year')}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <StackedColumnChart periodData={periodData} dataColors='["--bs-primary", "--bs-warning", "--bs-success"]' />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg="12">
          <div className="mb-3 h4 card-title">{t('DashboardContent.latestTransaction')}</div>
          <Card>
            <CardBody className="p-1">
              <Table responsive className="table align-middle table-nowrap mb-0 table-hover">
                <thead className="table-light">
                  <tr>
                    <th><input type="checkbox" className="form-check-input" /></th>
                    <th>Project ID</th>
                    <th>Stage No. - Stage Name - Activity - Subactivity</th>
                    <th>Start & End dates</th>
                    <th>SQ</th>
                    <th>CQ</th>
                    <th>PQ</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className="fw-bold">#ORD-001</a></td>

                    <td>
                      Base/cum/Lvl+PCC: PCC 1 & P.Slab G.service, Sub. Str., PCC for floor
                    </td>
                    <td>21.04.2024 - 23.04.2024</td>
                    <td>7.3</td>
                    <td>5.5</td>
                    <td>5.3</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress w-100" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: '25.81%' }}
                            aria-valuenow={25.81}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <span className="ms-2">25.81%</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className="fw-bold">#ORD-002</a></td>

                    <td>
                      Base/cum/Lvl+PCC: Earth excavation, Substrata SB - Labelling and spreading for foundation
                    </td>
                    <td>21.04.2024 - 23.04.2024</td>
                    <td>7.3</td>
                    <td>2.0</td>
                    <td>1.5</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress w-100" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: '20.07%' }}
                            aria-valuenow={20.07}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <span className="ms-2">20.07%</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className="fw-bold">#ORD-003</a></td>

                    <td>
                      Base/cum/Lvl+PCC: Earth work excavation: Sand filling work
                    </td>
                    <td>21.04.2024 - 23.04.2024</td>
                    <td>7.3</td>
                    <td>7.3</td>
                    <td>7.3</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress w-100" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: '100%' }}
                            aria-valuenow={100}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <span className="ms-2">100.00%</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className="fw-bold">#ORD-004</a></td>

                    <td>
                      Base/cum/Lvl+PCC: PCC 1:2:4 Mould/shutter, Sub. SB - PCC for Sub concrete
                    </td>
                    <td>21.04.2024 - 23.04.2024</td>
                    <td>7.3</td>
                    <td>6.3</td>
                    <td>6.2</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress w-100" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: '86.77%' }}
                            aria-valuenow={86.77}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <span className="ms-2">86.77%</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className="fw-bold">#ORD-005</a></td>

                    <td>
                      Base/cum/Lvl+PCC: P. Removal (Soil), Sub. 2.7: Ready soil
                    </td>
                    <td>21.04.2024 - 23.04.2024</td>
                    <td>7.3</td>
                    <td>7.3</td>
                    <td>7.3</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress w-100" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: '100%' }}
                            aria-valuenow={100}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <span className="ms-2">100.00%</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className="fw-bold">#ORD-006</a></td>
                    <td>
                      Base/cum/Lvl+PCC: Sand filling, Sub. SB - PCC for Sub concrete
                    </td>
                    <td>21.04.2024 - 23.04.2024</td>
                    <td>7.3</td>
                    <td>3.5</td>
                    <td>—</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress w-100" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: '47.95%' }}
                            aria-valuenow={47.95}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <span className="ms-2">47.95%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export const CompanyProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="company-profile">
      <h2 className="company-profile__title">{t('Navigation.profile')}</h2>
      <div className="company-profile__content">
        <div className="company-profile__info">
          <h3>{t('Company.information.companyInformation')}</h3>
          <p>{t('Company.information.companyID')} {user?.companyId}</p>
          <p>{t('Company.information.user')} {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName ?? user?.email ?? ''}</p>
          <p>{t('Company.information.email')} {user?.email}</p>
          <p>{t('Company.information.role')} {user?.role}</p>
        </div>
        {/* TODO: Add profile editing form */}
      </div>
    </div>
  );
};

export const CompanyOrders = () => {
  const { t } = useTranslation();
  return (
    <div className="company-orders">
      <h2>{t('Company.orders.ordersManagement')}</h2>
      <p>{t('Company.orders.ordersManagementPage')}</p>
    </div>
  );
};

export const CompanyProducts = () => {
  const { t } = useTranslation();
  return (
    <div className="company-products">
      <h2>{t('Company.products.productsManagement')}</h2>
      <p>{t('Company.products.productsManagementPage')}</p>
    </div>
  );
};

export const CompanyCustomers = () => {
  const { t } = useTranslation();
  return (
    <div className="company-customers">
      <h2>{t('Company.customers.customersManagement')}</h2>
      <p>{t('Company.customers.customersManagementPage')}</p>
    </div>
  );
};

export const CompanyAnalytics = () => {
  const { t } = useTranslation();
  return (
    <div className="company-analytics">
      <h2>{t('Company.analytics.analyticsReports')}</h2>
      <p>{t('Company.analytics.analyticsPage')}</p>
    </div>
  );
};

export const CompanySettings = () => {
  const { t } = useTranslation();
  return (
    <div className="company-settings">
      <h2>{t('Company.settings.companySettings')}</h2>
      <p>{t('Company.settings.settingsPage')}</p>
    </div>
  );
};

const CompanyDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div id="layout-wrapper">
      <CompanyHeader onMenuClick={toggleSidebar} />
      <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
        <CompanyFooter />
      </main>
    </div>
  );
};

export default CompanyDashboard;
