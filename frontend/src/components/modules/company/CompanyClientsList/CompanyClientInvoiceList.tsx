import { useMemo, useState } from 'react';
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

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE';

interface ClientInvoiceRecord {
  id: string;
  clientName: string;
  invoiceNumber: string;
  issueDate?: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
}

const ITEMS_PER_PAGE = 10;

const CompanyClientInvoiceList = () => {
  const { t } = useTranslation();
  const [invoices] = useState<ClientInvoiceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredInvoices = useMemo(() => {
    let list = invoices;

    if (statusFilter !== 'ALL') {
      list = list.filter((invoice) => invoice.status === statusFilter);
    }

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (invoice) =>
          invoice.clientName.toLowerCase().includes(query) ||
          invoice.invoiceNumber.toLowerCase().includes(query)
      );
    }

    return list;
  }, [invoices, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-success">{t('ClientInvoice.status.paid')}</Badge>;
      case 'PARTIAL':
        return <Badge className="bg-info">{t('ClientInvoice.status.partial')}</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-danger">{t('ClientInvoice.status.overdue')}</Badge>;
      case 'SENT':
        return <Badge className="bg-primary">{t('ClientInvoice.status.sent')}</Badge>;
      case 'DRAFT':
      default:
        return <Badge className="bg-secondary">{t('ClientInvoice.status.draft')}</Badge>;
    }
  };

  const handleStatusChange = (value: 'ALL' | InvoiceStatus) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <>
      <Breadcrumbs
        title={t('ClientInvoice.pageTitle')}
        breadcrumbItem={t('ClientInvoice.breadcrumbItem')}
        link="/company/clients/invoices"
        breadcrumbParent={t('ClientInvoice.breadcrumbParent')}
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
                      {statusFilter !== 'ALL' &&
                        `: ${t(`ClientInvoice.filters.${statusFilter.toLowerCase()}`)}`}
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem
                        active={statusFilter === 'ALL'}
                        onClick={() => {
                          handleStatusChange('ALL');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientInvoice.filters.all')}
                      </DropdownItem>
                      <DropdownItem
                        active={statusFilter === 'DRAFT'}
                        onClick={() => {
                          handleStatusChange('DRAFT');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientInvoice.filters.draft')}
                      </DropdownItem>
                      <DropdownItem
                        active={statusFilter === 'SENT'}
                        onClick={() => {
                          handleStatusChange('SENT');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientInvoice.filters.sent')}
                      </DropdownItem>
                      <DropdownItem
                        active={statusFilter === 'PARTIAL'}
                        onClick={() => {
                          handleStatusChange('PARTIAL');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientInvoice.filters.partial')}
                      </DropdownItem>
                      <DropdownItem
                        active={statusFilter === 'PAID'}
                        onClick={() => {
                          handleStatusChange('PAID');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientInvoice.filters.paid')}
                      </DropdownItem>
                      <DropdownItem
                        active={statusFilter === 'OVERDUE'}
                        onClick={() => {
                          handleStatusChange('OVERDUE');
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {t('ClientInvoice.filters.overdue')}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Button
                    color="primary"
                    type="button"
                    className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                    disabled
                  >
                    <i className="bx bx-plus me-1" />
                    {t('ClientInvoice.addInvoice')}
                  </Button>
                </div>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('ClientInvoice.table.client')}</th>
                      <th>{t('ClientInvoice.table.invoice')}</th>
                      <th>{t('ClientInvoice.table.issueDate')}</th>
                      <th>{t('ClientInvoice.table.dueDate')}</th>
                      <th className="text-end">{t('ClientInvoice.table.totalAmount')}</th>
                      <th className="text-end">{t('ClientInvoice.table.paidAmount')}</th>
                      <th className="text-end">{t('ClientInvoice.table.balanceAmount')}</th>
                      <th>{t('ClientInvoice.table.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvoices.length > 0 ? (
                      paginatedInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>{invoice.clientName}</td>
                          <td>{invoice.invoiceNumber}</td>
                          <td>{formatDate(invoice.issueDate)}</td>
                          <td>{formatDate(invoice.dueDate)}</td>
                          <td className="text-end">{invoice.totalAmount.toFixed(2)}</td>
                          <td className="text-end">{invoice.paidAmount.toFixed(2)}</td>
                          <td className="text-end">{invoice.balanceAmount.toFixed(2)}</td>
                          <td>{getStatusBadge(invoice.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <p className="text-muted mb-0">{t('ClientInvoice.noInvoicesFound')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {filteredInvoices.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredInvoices.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CompanyClientInvoiceList;
