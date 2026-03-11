import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  Row,
  Table,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';

type PaymentStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';

interface ClientPaymentRecord {
  id: string;
  clientName: string;
  projectName?: string;
  invoiceNumber?: string;
  dueDate?: string;
  amount: number;
  currency: string;
  projectCost: number;
  paidAmount: number;
  balanceAmount: number;
  status: PaymentStatus;
}

const ITEMS_PER_PAGE = 10;

const INITIAL_PAYMENTS: ClientPaymentRecord[] = [
  {
    id: 'CP-1001',
    clientName: 'Arabtec Construction',
    projectName: 'Residential Tower – Phase 1',
    invoiceNumber: 'INV-2026-001',
    dueDate: '2026-03-15T00:00:00.000Z',
    amount: 50000,
    currency: 'USD',
    projectCost: 50000,
    paidAmount: 0,
    balanceAmount: 50000,
    status: 'PENDING',
  },
  {
    id: 'CP-1002',
    clientName: 'ALEC Engineering and Contracting',
    projectName: 'Airport Expansion – Cargo Terminal',
    invoiceNumber: 'INV-2026-002',
    dueDate: '2026-02-20T00:00:00.000Z',
    amount: 125000,
    currency: 'USD',
    projectCost: 125000,
    paidAmount: 125000,
    balanceAmount: 0,
    status: 'COMPLETED',
  },
  {
    id: 'CP-1003',
    clientName: 'Al Naboodah Construction Group',
    projectName: 'Highway Infrastructure Package',
    invoiceNumber: 'INV-2026-003',
    dueDate: '2026-02-01T00:00:00.000Z',
    amount: 87500,
    currency: 'USD',
    projectCost: 87500,
    paidAmount: 40000,
    balanceAmount: 47500,
    status: 'OVERDUE',
  },
  {
    id: 'CP-1004',
    clientName: 'Dutco Construction Company',
    projectName: 'Logistics Park – Warehouses',
    invoiceNumber: 'INV-2026-004',
    dueDate: '2026-03-05T00:00:00.000Z',
    amount: 64000,
    currency: 'USD',
    projectCost: 64000,
    paidAmount: 20000,
    balanceAmount: 64000,
    status: 'PENDING',
  },
];

const ClientPaymentPage = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRowExpand = (paymentId: string) => {
    setExpandedRowId((prev) => (prev === paymentId ? null : paymentId));
  };

  const filteredPayments = useMemo(() => {
    let list = INITIAL_PAYMENTS;

    if (statusFilter !== 'ALL') {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.clientName.toLowerCase().includes(term) ||
          (p.projectName && p.projectName.toLowerCase().includes(term)) ||
          (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(term))
      );
    }

    return list;
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / ITEMS_PER_PAGE));

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPayments, currentPage]);

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-success">{t('ClientPayment.status.completed')}</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-danger">{t('ClientPayment.status.overdue')}</Badge>;
      case 'PENDING':
      default:
        return <Badge className="bg-warning">{t('ClientPayment.status.pending')}</Badge>;
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, _currency: string) => {
    if (!Number.isFinite(amount)) return '—';
    return (
      <Badge color="primary" className="d-inline-flex align-items-center justify-content-end">
        <i className="bx bx-rupee me-1" />
        {amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Badge>
    );
  };

  const handleStatusChange = (value: 'ALL' | PaymentStatus) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Breadcrumbs
        title={t('CompanyClientsList.pageTitle')}
        breadcrumbItem={t('ClientPayment.breadcrumbItem')}
        link="/company/clients/payments"
        breadcrumbParent={t('ClientPayment.breadcrumbParent')}
      />

      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <InputGroup className="search-input-group">
                  <Input
                    type="text"
                    placeholder={t('Common.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>

                <div className="d-flex gap-2 align-items-center">
                  <Dropdown
                    isOpen={filterDropdownOpen}
                    toggle={() => setFilterDropdownOpen((prev) => !prev)}
                  >
                    <DropdownToggle color="outline-primary" className="d-flex align-items-center">
                      <i className="bx bx-filter-alt me-1" />
                      {statusFilter !== 'ALL' && `: ${t(`ClientPayment.filters.${statusFilter.toLowerCase()}`)}`}
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem
                        active={statusFilter === 'ALL'}
                        onClick={() => {
                          handleStatusChange('ALL');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientPayment.filters.all')}
                      </DropdownItem>
                      <DropdownItem
                        active={statusFilter === 'PENDING'}
                        onClick={() => {
                          handleStatusChange('PENDING');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientPayment.filters.pending')}
                      </DropdownItem>
                      <DropdownItem
                        active={statusFilter === 'COMPLETED'}
                        onClick={() => {
                          handleStatusChange('COMPLETED');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientPayment.filters.completed')}
                      </DropdownItem>
                      <DropdownItem
                        active={statusFilter === 'OVERDUE'}
                        onClick={() => {
                          handleStatusChange('OVERDUE');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientPayment.filters.overdue')}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Button color="primary" className="btn-rounded waves-effect d-inline-flex align-items-center waves-light">
                    <i className="bx bx-plus me-1" />
                    {t('ClientPayment.addPayment')}
                  </Button>
                </div>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('ClientPayment.table.client')}</th>
                      <th>{t('ClientPayment.table.project')}</th>
                      <th>{t('ClientPayment.table.invoice')}</th>
                      <th>{t('ClientPayment.table.dueDate')}</th>
                      <th className="text-end">{t('ClientPayment.table.projectCost')}</th>
                      <th className="text-end">{t('ClientPayment.table.paidAmount')}</th>
                      <th className="text-end">{t('ClientPayment.table.balanceAmount')}</th>
                      <th>{t('ClientPayment.table.status')}</th>
                      <th>{t('ClientPayment.table.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.length > 0 ? (
                      paginatedPayments.map((payment) => (
                        <React.Fragment key={payment.id}>
                          <tr>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link p-0 text-dark text-decoration-none fw-bold text-start"
                                onClick={() => toggleRowExpand(payment.id)}
                                title={t('ClientPayment.expandDetails')}
                              >
                                {payment.clientName}
                                <i className={`bx ms-1 small ${expandedRowId === payment.id ? 'bx-chevron-up' : 'bx-chevron-down'}`} />
                              </button>
                            </td>
                            <td>{payment.projectName || '—'}</td>
                            <td>{payment.invoiceNumber || '—'}</td>
                            <td>{formatDate(payment.dueDate)}</td>
                            <td className="text-end">
                              <Badge color="primary" className="d-inline-flex align-items-center justify-content-end">
                                <i className="bx bx-rupee me-1" />
                                {payment.projectCost.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <Badge color="info" className="d-inline-flex align-items-center justify-content-end">
                                <i className="bx bx-rupee me-1" />
                                {payment.paidAmount.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <Badge color="warning" className="d-inline-flex align-items-center justify-content-end">
                                <i className="bx bx-rupee me-1" />
                                {payment.balanceAmount.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Badge>
                            </td>
                            <td>{getStatusBadge(payment.status)}</td>
                            <td>
                              <Button
                                color="outline-primary"
                                className="btn-sm border-0"
                                title={t('ClientPayment.viewPayment')}
                              >
                                <i className="mdi mdi-eye" />
                              </Button>
                            </td>
                          </tr>
                          {expandedRowId === payment.id && (
                            <tr key={`${payment.id}-detail`} className="bg-light">
                              <td colSpan={9} className="p-3">
                                <Row className="g-3 small">
                                  <Col md="4">
                                    <span className="text-muted d-block">{t('ClientPayment.table.project')}</span>
                                    <span className="fw-semibold">{payment.projectName || '—'}</span>
                                  </Col>
                                  <Col md="4">
                                    <span className="text-muted d-block">{t('ClientPayment.table.invoice')}</span>
                                    <span className="fw-semibold">{payment.invoiceNumber || '—'}</span>
                                  </Col>
                                  <Col md="4">
                                    <span className="text-muted d-block">{t('ClientPayment.table.paidAmount')}</span>
                                    <span className="d-inline-flex align-items-center fw-semibold">
                                      <i className="bx bx-rupee me-1" />
                                      {payment.paidAmount.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                  </Col>
                                </Row>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <p className="text-muted mb-0">
                            {t('ClientPayment.noPaymentsFound')}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {filteredPayments.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredPayments.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ClientPaymentPage;

