import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, Label, Table } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import './CompanyClientsList.scss';

type PaymentStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  buildingAddress: string;
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  description?: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  logo?: string | null;
  totalAmount: number;
}

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

type Props = {
  displayClient?: Client | null;
};

type LocationState = {
  client?: Client;
};

const ITEMS_PER_PAGE = 10;

// TODO: Replace with real API data for transactions/payments.
// Dummy data is used so the Transactions tab design can be verified end-to-end.
const DUMMY_PAYMENTS: ClientPaymentRecord[] = [
  {
    id: 'CP-2001',
    clientName: 'Arabtec Construction',
    projectName: 'Residential Tower – Phase 2',
    invoiceNumber: 'INV-2026-010',
    dueDate: '2026-03-20T00:00:00.000Z',
    amount: 60000,
    currency: 'AED',
    projectCost: 60000,
    paidAmount: 15000,
    balanceAmount: 45000,
    status: 'PENDING',
  },
  {
    id: 'CP-2002',
    clientName: 'Arabtec Construction',
    projectName: 'Commercial Plaza – Block A',
    invoiceNumber: 'INV-2026-011',
    dueDate: '2026-02-25T00:00:00.000Z',
    amount: 85000,
    currency: 'AED',
    projectCost: 85000,
    paidAmount: 85000,
    balanceAmount: 0,
    status: 'COMPLETED',
  },
];

const formatAedAmount = (amount: number) =>
  `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CompanyClientTransactions = (props: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();

  const stateClient = (location.state as LocationState | null)?.client ?? undefined;
  const effectiveClient = props.displayClient ?? stateClient ?? null;

  const displayClient = useMemo(() => {
    if (!effectiveClient) return null;
    if (clientId && effectiveClient.id !== clientId) return null;
    return effectiveClient;
  }, [clientId, effectiveClient]);

  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [paymentFilterDropdownOpen, setPaymentFilterDropdownOpen] = useState(false);

  const [loadingPayments] = useState(false);

  const formatPaymentDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatPaymentAmountBadge = (amount: number) => (
    <Badge color="primary" className="d-inline-flex align-items-center justify-content-center">
      {formatAedAmount(amount)}
    </Badge>
  );

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge color="success">{t('ClientPayment.status.completed')}</Badge>;
      case 'OVERDUE':
        return <Badge color="danger">{t('ClientPayment.status.overdue')}</Badge>;
      case 'PENDING':
      default:
        return <Badge color="warning">{t('ClientPayment.status.pending')}</Badge>;
    }
  };

  const paymentsForClient = useMemo(() => {
    let list = DUMMY_PAYMENTS;
    if (displayClient?.name) {
      list = list.filter((p) => p.clientName === displayClient.name);
    }

    if (paymentStatusFilter !== 'ALL') {
      list = list.filter((p) => p.status === paymentStatusFilter);
    }

    const q = paymentSearchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.clientName.toLowerCase().includes(q) ||
          (p.projectName?.toLowerCase().includes(q) ?? false) ||
          (p.invoiceNumber?.toLowerCase().includes(q) ?? false)
      );
    }

    return list;
  }, [displayClient?.name, paymentSearchTerm, paymentStatusFilter]);

  const paymentTotalPages = Math.max(1, Math.ceil(paymentsForClient.length / ITEMS_PER_PAGE));
  const paginatedPayments = useMemo(() => {
    const start = (paymentCurrentPage - 1) * ITEMS_PER_PAGE;
    return paymentsForClient.slice(start, start + ITEMS_PER_PAGE);
  }, [paymentsForClient, paymentCurrentPage]);

  const handlePaymentStatusChange = (value: 'ALL' | PaymentStatus) => {
    setPaymentStatusFilter(value);
    setPaymentCurrentPage(1);
  };

  const handlePaymentPageChange = (page: number) => {
    setPaymentCurrentPage(page);
  };

  return (
    <>


      <div className="company-clients-sidebar--joor company-clients-sidebar--fullpage mb-3">
        <Card className="h-100 border-0 shadow-none rounded-0 d-flex flex-column detail-view-card m-0">


          <CardBody className="detail-card-body flex-grow-1 overflow-auto p-0">
            {displayClient ? (
              <div className="p-2">

                <div className="table-responsive">
                  <Table className="table-nowrap align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t('ClientPayment.table.dueDate')}</th>
                        <th>{t('ClientPayment.table.project')}</th>
                        <th className="text-end">{t('ClientPayment.table.projectCost')}</th>
                        <th className="text-end">{t('ClientPayment.table.paidAmount')}</th>
                        <th className="text-end">{t('ClientPayment.table.balanceAmount')}</th>
                        <th>{t('ClientPayment.table.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingPayments ? (
                        <tr>
                          <td colSpan={8} className="text-center py-4">
                            <p className="text-muted mb-0">{t('Common.loading')}</p>
                          </td>
                        </tr>
                      ) : paginatedPayments.length > 0 ? (
                        paginatedPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td>{formatPaymentDate(payment.dueDate)}</td>
                            <td>
                              <p className="mb-0">{payment.projectName || '—'}</p>
                              <small className="text-muted">Invoice : {payment.invoiceNumber || '—'}</small>
                            </td>
                            <td className="text-end">
                              <Badge color="primary" className="d-inline-flex align-items-center justify-content-center">
                                {formatAedAmount(payment.projectCost)}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <Badge color="info" className="d-inline-flex align-items-center justify-content-center">
                                {formatAedAmount(payment.paidAmount)}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <Badge color="warning" className="d-inline-flex align-items-center justify-content-center">
                                {formatAedAmount(payment.balanceAmount)}
                              </Badge>
                            </td>
                            <td>{getPaymentStatusBadge(payment.status)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-4">
                            <p className="text-muted mb-0">{t('ClientPayment.noPaymentsFound')}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {paymentsForClient.length > 0 && (
                  <div className="mt-3">
                    <Pagination
                      currentPage={paymentCurrentPage}
                      totalPages={paymentTotalPages}
                      totalItems={paymentsForClient.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={handlePaymentPageChange}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="detail-placeholder">
                <h5 className="mb-2">{t('CompanyClientsList.selectClientTitle')}</h5>
                <p className="text-muted mb-0">{t('CompanyClientsList.selectClientDescription')}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default CompanyClientTransactions;

