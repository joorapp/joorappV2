import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardTitle, Row, Col, Table, Button } from 'reactstrap';
import SuperAdminHeader from '../SuperAdminHeader/SuperAdminHeader';
import SuperAdminSidebar from '../SuperAdminSidebar/SuperAdminSidebar';
import SuperAdminFooter from '../SuperAdminFooter/SuperAdminFooter';
import StackedColumnChart from '../../../common/StackedColumnChart/StackedColumnChart';
import ApexRadial from '../../../common/ApexRadial/ApexRadial';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';




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

// Placeholder components for superadmin pages
export const SuperAdminOverview = () => {
  const { t } = useTranslation();
  const [periodType, setPeriodType] = useState<string>('Month');
  const [periodData] = useState<any[]>([
    {
      name: 'Active clients',
      data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 55]
    },
    {
      name: 'Inactive clients',
      data: [13, 23, 20, 8, 13, 27, 33, 12, 19, 18, 28, 25]
    }
  ]);

  const onChangeChartPeriod = (period: string) => {
    setPeriodType(period);
  };

  return (
    <>

<Breadcrumbs title={t("Dashboards.Dashboards")} breadcrumbItem={t("Dashboards.Dashboard")} />


      <Row>
        <Col xl="4">
          <Card className="overflow-hidden">
            <div className="bg-primary-subtle">
              <Row>
                <Col xs="7">
                  <div className="text-primary p-3">
                    <h5 className="text-primary">Welcome Back !</h5>
                    <p>JoorApp Dashboard</p>
                  </div>
                </Col>
                <Col xs="5" className="align-self-end">
                  <img src="/src/assets/images/profile-img.png" alt="" className="img-fluid" />
                </Col>
              </Row>
            </div>
            <CardBody className="pt-0">
              <Row>
                <Col sm="4">
                  <div className="avatar-md profile-user-wid mb-4">
                    <img src="/src/assets/images/users/avatar-1.jpg" alt="" className="img-thumbnail rounded-circle" />
                  </div>
                </Col>
                <Col sm="8">
                  <div className="pt-4">
                    <Row>
                      <Col xs="6">
                        <h5 className="font-size-15">125</h5>
                        <p className="text-muted mb-0">Projects</p>
                      </Col>
                      <Col xs="6">
                        <h5 className="font-size-15">$1245</h5>
                        <p className="text-muted mb-0">Revenue</p>
                      </Col>
                    </Row>

<<<<<<< Updated upstream
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardTitle className="mb-4">Monthly Earning</CardTitle>
              <Row>
                <Col sm="6">
                  <p className="text-muted">This month</p>
                  <h3>$34,252</h3>
                  <p className="text-muted">
                    <span className="text-success me-2">
                      {" "}
                      12% <i className="mdi mdi-arrow-up"></i>{" "}
                    </span>{" "}
                    From previous period
                  </p>
                  <div className="mt-4">
                    <Link
                      to=""
                      className="btn btn-primary waves-effect waves-light btn-sm"
                    >
                      View More <i className="mdi mdi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </Col>
                <Col sm="6">
                  <div className="mt-4 mt-sm-0">
                  <ApexRadial dataColors='["--bs-primary"]' />
                  </div>
                </Col>
              </Row>
              <p className="text-muted mt-3 mb-0">
                We craft digital, graphic and dimensional thinking.
              </p>
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
                      <p className="text-muted fw-medium">
                        Total Clients
                      </p>
                      <h4 className="mb-0">1,247</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className={"bx bx-buildings font-size-24 text-white"}></i>
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
                      <p className="text-muted fw-medium">
                        Active clients
                      </p>
                      <h4 className="mb-0">1,247</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className={"bx bx-building font-size-24 text-white"}></i>
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
                      <p className="text-muted fw-medium">
                        Revenue
                      </p>
                      <h4 className="mb-0">1,247</h4>
                    </div>
                    <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                      <span className="avatar-title rounded-circle bg-primary">
                        <i className={"bx bx-wallet font-size-24 text-white"}></i>
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
                <h4 className="card-title mb-4">Clients</h4>
                <div className="ms-auto">
                  <ul className="nav nav-pills">
                    <li className="nav-item">
                      <Link to="#" className={classNames({ active: periodType === "Week" }, "nav-link")} onClick={() => { onChangeChartPeriod("Week"); }} id="one_month">
                        Week
                      </Link>{" "}
                    </li>
                    <li className="nav-item">
                      <Link to="#" className={classNames({ active: periodType === "Month" }, "nav-link")} onClick={() => { onChangeChartPeriod("Month"); }} id="one_month">
                        Month
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="#" className={classNames({ active: periodType === "Year" }, "nav-link")} onClick={() => { onChangeChartPeriod("Year"); }} id="one_month">
                        Year
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
        <div className="mb-3 h4 card-title">Latest Transaction</div>

          <Card>
            <CardBody className="p-1">
              <Table responsive className="align-middle table-nowrap mb-0 table table-hover">
                <thead className="table-light">
                  <tr>
                    <th><input type="checkbox" className="form-check-input" /></th>
                    <th>Order ID</th>
                    <th>Billing Name</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Payment Method</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className='fw-bold'>#ORD-001</a></td>
                    <td>John Doe</td>
                    <td>2025-01-01</td>
                    <td>$100.00</td>
                    <td><span className="badge bg-success font-size-11 badge-soft-success badge bg-secondary">Paid</span></td>
                    <td>Credit Card</td>
                    <td>
                      <Button color="primary" size="sm" className="btn-rounded">View Details</Button>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className='fw-bold'>#ORD-002</a></td>
                    <td>Jane Smith</td>
                    <td>2025-01-02</td>
                    <td>$200.00</td>
                    <td><span className="badge bg-warning font-size-11 badge-soft-warning badge bg-secondary">Pending</span></td>
                    <td>PayPal</td>
                    <td>
                      <Button color="primary" size="sm" className="btn-rounded">View Details</Button>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className='fw-bold'>#ORD-003</a></td>
                    <td>John Doe</td>
                    <td>2025-01-03</td>
                    <td>$100.00</td>
                    <td><span className="badge bg-success font-size-11 badge-soft-success badge bg-secondary">Paid</span></td>
                    <td>Credit Card</td>
                    <td>
                      <Button color="primary" size="sm" className="btn-rounded">View Details</Button>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className='fw-bold'>#ORD-004</a></td>
                    <td>John Doe</td>
                    <td>2025-01-04</td>
                    <td>$100.00</td>
                    <td><span className="badge bg-success font-size-11 badge-soft-warning badge bg-secondary">Refund</span></td>
                    <td>Credit Card</td>
                    <td>
                      <Button color="primary" size="sm" className="btn-rounded">View Details</Button>
                    </td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" className="form-check-input" /></td>
                    <td><a href="#" className='fw-bold'>#ORD-005</a></td>
                    <td>John Doe</td>
                    <td>2025-01-05</td>
                    <td>$100.00</td>
                    <td><span className="font-size-11 badge-soft-success badge bg-secondary">Paid</span></td>
                    <td>Credit Card</td>
                    <td>
                      <Button color="primary" size="sm" className="btn-rounded">View Details</Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>  
=======
        <div className="superadmin-overview__quick-actions">
          <h3 className="superadmin-overview__section-title">Quick Actions</h3>
          <div className="superadmin-overview__actions-grid">
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">👥</span>
              <span className="superadmin-overview__action-label">Manage Users</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">🏢</span>
              <span className="superadmin-overview__action-label">Manage Companies</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">📊</span>
              <span className="superadmin-overview__action-label">View Reports</span>
            </button>
            <button className="superadmin-overview__action-btn">
              <span className="superadmin-overview__action-icon">⚙️</span>
              <span className="superadmin-overview__action-label">System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="user-management">
      <h2>{t('Navigation.userManagement')}</h2>
      <p>User management page - TODO: Implement user management functionality</p>
    </div>
  );
};

export const CompanyManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="company-management">
      <h2>{t('Navigation.companyManagement')}</h2>
      <p>Company management page - TODO: Implement company management functionality</p>
    </div>
  );
};

export const Reports = () => {
  const { t } = useTranslation();
  return (
    <div className="reports">
      <h2>{t('Navigation.reports')}</h2>
      <p>Reports page - TODO: Implement reports functionality</p>
    </div>
  );
};

export const SystemSettings = () => {
  return (
    <div className="system-settings">
      <h2>System Settings</h2>
      <p>System settings page - TODO: Implement system settings functionality</p>
    </div>
  );
};

export const AuditLogs = () => {
  return (
    <div className="audit-logs">
      <h2>Audit Logs</h2>
      <p>Audit logs page - TODO: Implement audit logs functionality</p>
    </div>
  );
};

export const SuperAdminProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
>>>>>>> Stashed changes

    </>
  );
};

<<<<<<< Updated upstream
const SuperAdminDashboard: React.FC = () => {
=======
const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
>>>>>>> Stashed changes

  return (
    <div id="layout-wrapper">
      <SuperAdminHeader onMenuClick={() => { console.log('menu clicked'); }} />
      <SuperAdminSidebar />
      <main className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
        <SuperAdminFooter />
      </main>
    </div>
  );
};

export { default as NewClients } from '../NewClients/NewClients';
export { default as ActiveClients } from '../ActiveClients/ActiveClients';

export default SuperAdminDashboard;