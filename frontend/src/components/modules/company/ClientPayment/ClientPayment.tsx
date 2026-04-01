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
  FormFeedback,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
  UncontrolledDropdown,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import Pagination from '../../../common/Pagination/Pagination';
import type { ValidationResult } from '../../../../core/utils/Utils';
import { validateRequired } from '../../../../core/utils/Utils';
import { showSuccessToast } from '../../../../core/utils/toast';

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

const PAYMENT_CURRENCIES = ['USD', 'EUR', 'AED', 'INR'] as const;

/** Sample clients for payment registration (placeholder until API-driven list). */
const DUMMY_PAYMENT_CLIENT_NAMES = [
  'Arabtec Construction',
  'ALEC Engineering and Contracting',
  'Al Naboodah Construction Group',
  'Dutco Construction Company',
  'Eta Engineering & Contracting',
  'Khansaheb Civil Engineering',
] as const;

interface PaymentRegisterFormState {
  clientName: string;
  projectName: string;
  invoiceNumber: string;
  dueDate: string;
  projectCost: string;
  paidAmount: string;
  currency: string;
}

interface PaymentRegisterFormErrors {
  clientName?: string;
  projectCost?: string;
  paidAmount?: string;
}

const getInitialPaymentForm = (): PaymentRegisterFormState => ({
  clientName: '',
  projectName: '',
  invoiceNumber: '',
  dueDate: '',
  projectCost: '',
  paidAmount: '',
  currency: 'USD',
});

const mapPaymentToFormState = (payment: ClientPaymentRecord): PaymentRegisterFormState => ({
  clientName: payment.clientName,
  projectName: payment.projectName || '',
  invoiceNumber: payment.invoiceNumber || '',
  dueDate: payment.dueDate ? payment.dueDate.slice(0, 10) : '',
  projectCost: String(payment.projectCost),
  paidAmount: String(payment.paidAmount),
  currency: payment.currency,
});

const validatePositiveAmount = (value: string | null | undefined): ValidationResult => {
  const trimmed = (value ?? '').trim().replace(/,/g, '');
  if (trimmed === '') {
    return { isValid: false, errorMessage: 'Validation.priceRequired' };
  }
  const n = Number.parseFloat(trimmed);
  if (!Number.isFinite(n) || n <= 0) {
    return { isValid: false, errorMessage: 'Validation.priceInvalid' };
  }
  return { isValid: true };
};

const validateNonNegativeAmount = (value: string | null | undefined): ValidationResult => {
  const trimmed = (value ?? '').trim().replace(/,/g, '');
  if (trimmed === '') {
    return { isValid: false, errorMessage: 'Validation.priceRequired' };
  }
  const n = Number.parseFloat(trimmed);
  if (!Number.isFinite(n) || n < 0) {
    return { isValid: false, errorMessage: 'Validation.priceInvalid' };
  }
  return { isValid: true };
};

const computePaymentStatus = (
  projectCost: number,
  paidAmount: number,
  dueDateIso?: string
): PaymentStatus => {
  if (projectCost > 0 && paidAmount >= projectCost) {
    return 'COMPLETED';
  }
  if (dueDateIso) {
    const due = new Date(dueDateIso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!Number.isNaN(due.getTime()) && due < today && paidAmount < projectCost) {
      return 'OVERDUE';
    }
  }
  return 'PENDING';
};

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

  const [payments, setPayments] = useState<ClientPaymentRecord[]>(INITIAL_PAYMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentRegisterFormState>(getInitialPaymentForm);
  const [paymentFormErrors, setPaymentFormErrors] = useState<PaymentRegisterFormErrors>({});
  const [viewPayment, setViewPayment] = useState<ClientPaymentRecord | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState<PaymentRegisterFormState>(getInitialPaymentForm);
  const [editPaymentFormErrors, setEditPaymentFormErrors] = useState<PaymentRegisterFormErrors>({});
  const [paymentToDelete, setPaymentToDelete] = useState<ClientPaymentRecord | null>(null);
  const [deletePaymentModalOpen, setDeletePaymentModalOpen] = useState(false);

  const resetPaymentForm = () => {
    setPaymentForm(getInitialPaymentForm());
    setPaymentFormErrors({});
  };

  const handleOpenAddPaymentModal = () => {
    resetPaymentForm();
    setAddPaymentModalOpen(true);
  };

  const handleCloseAddPaymentModal = () => {
    setAddPaymentModalOpen(false);
    resetPaymentForm();
  };

  const handleOpenViewPayment = (payment: ClientPaymentRecord) => {
    setViewPayment(payment);
  };

  const handleCloseViewPayment = () => {
    setViewPayment(null);
  };

  const handleOpenEditPayment = (payment: ClientPaymentRecord) => {
    setEditPaymentId(payment.id);
    setEditPaymentForm(mapPaymentToFormState(payment));
    setEditPaymentFormErrors({});
    setEditModalOpen(true);
  };

  const handleCloseEditPayment = () => {
    setEditModalOpen(false);
    setEditPaymentId(null);
    setEditPaymentForm(getInitialPaymentForm());
    setEditPaymentFormErrors({});
  };

  const handleEditPaymentFormChange = <K extends keyof PaymentRegisterFormState>(field: K, value: PaymentRegisterFormState[K]) => {
    setEditPaymentForm((prev) => ({ ...prev, [field]: value }));
    if (editPaymentFormErrors[field as keyof PaymentRegisterFormErrors]) {
      setEditPaymentFormErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof PaymentRegisterFormErrors];
        return next;
      });
    }
  };

  const handleOpenDeletePayment = (payment: ClientPaymentRecord) => {
    setPaymentToDelete(payment);
    setDeletePaymentModalOpen(true);
  };

  const handleCloseDeletePayment = () => {
    setDeletePaymentModalOpen(false);
    setPaymentToDelete(null);
  };

  const validatePaymentRegisterForm = (form: PaymentRegisterFormState): PaymentRegisterFormErrors => {
    const errors: PaymentRegisterFormErrors = {};
    let valid = true;

    const clientNameValidation = validateRequired(form.clientName, 'name');
    if (!clientNameValidation.isValid && clientNameValidation.errorMessage) {
      errors.clientName = clientNameValidation.errorMessage;
      valid = false;
    }

    const projectCostValidation = validatePositiveAmount(form.projectCost);
    if (!projectCostValidation.isValid && projectCostValidation.errorMessage) {
      errors.projectCost = projectCostValidation.errorMessage;
      valid = false;
    }

    const paidValidation = validateNonNegativeAmount(form.paidAmount);
    if (!paidValidation.isValid && paidValidation.errorMessage) {
      errors.paidAmount = paidValidation.errorMessage;
      valid = false;
    }

    return valid ? {} : errors;
  };

  const handlePaymentFormChange = <K extends keyof PaymentRegisterFormState>(field: K, value: PaymentRegisterFormState[K]) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
    if (paymentFormErrors[field as keyof PaymentRegisterFormErrors]) {
      setPaymentFormErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof PaymentRegisterFormErrors];
        return next;
      });
    }
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePaymentRegisterForm(paymentForm);
    if (Object.keys(errors).length > 0) {
      setPaymentFormErrors(errors);
      return;
    }

    const projectCost = Number.parseFloat(paymentForm.projectCost.trim().replace(/,/g, ''));
    const paidAmount = Number.parseFloat(paymentForm.paidAmount.trim().replace(/,/g, ''));
    const dueDateIso = paymentForm.dueDate
      ? new Date(`${paymentForm.dueDate}T00:00:00.000Z`).toISOString()
      : undefined;
    const balanceAmount = Math.max(0, projectCost - paidAmount);
    const status = computePaymentStatus(projectCost, paidAmount, dueDateIso);

    const newRecord: ClientPaymentRecord = {
      id: `CP-${Date.now()}`,
      clientName: paymentForm.clientName.trim(),
      projectName: paymentForm.projectName.trim() || undefined,
      invoiceNumber: paymentForm.invoiceNumber.trim() || undefined,
      dueDate: dueDateIso,
      amount: projectCost,
      currency: paymentForm.currency,
      projectCost,
      paidAmount,
      balanceAmount,
      status,
    };

    setPayments((prev) => [newRecord, ...prev]);
    setCurrentPage(1);
    showSuccessToast(t('ClientPayment.paymentRegisteredSuccessfully'));
    handleCloseAddPaymentModal();
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPaymentId) return;
    const errors = validatePaymentRegisterForm(editPaymentForm);
    if (Object.keys(errors).length > 0) {
      setEditPaymentFormErrors(errors);
      return;
    }

    const projectCost = Number.parseFloat(editPaymentForm.projectCost.trim().replace(/,/g, ''));
    const paidAmount = Number.parseFloat(editPaymentForm.paidAmount.trim().replace(/,/g, ''));
    const dueDateIso = editPaymentForm.dueDate
      ? new Date(`${editPaymentForm.dueDate}T00:00:00.000Z`).toISOString()
      : undefined;
    const balanceAmount = Math.max(0, projectCost - paidAmount);
    const status = computePaymentStatus(projectCost, paidAmount, dueDateIso);

    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === editPaymentId
          ? {
              ...payment,
              clientName: editPaymentForm.clientName.trim(),
              projectName: editPaymentForm.projectName.trim() || undefined,
              invoiceNumber: editPaymentForm.invoiceNumber.trim() || undefined,
              dueDate: dueDateIso,
              currency: editPaymentForm.currency,
              amount: projectCost,
              projectCost,
              paidAmount,
              balanceAmount,
              status,
            }
          : payment
      )
    );
    showSuccessToast(t('ClientPayment.paymentUpdatedSuccessfully'));
    handleCloseEditPayment();
  };

  const handleConfirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    setPayments((prev) => prev.filter((payment) => payment.id !== paymentToDelete.id));
    showSuccessToast(t('ClientPayment.paymentDeletedSuccessfully'));
    handleCloseDeletePayment();
  };

  const filteredPayments = useMemo(() => {
    let list = payments;

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
  }, [payments, searchTerm, statusFilter]);

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
        title={t('ClientPayment.pageTitle')}
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
                  <Button
                    color="primary"
                    type="button"
                    className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                    onClick={handleOpenAddPaymentModal}
                  >
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
                              
                                {payment.clientName}
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
                              <UncontrolledDropdown>
                                <DropdownToggle color="outline-primary" className="d-flex align-items-center border-0 btn-sm">
                                  <i className="mdi mdi-dots-vertical" />
                                </DropdownToggle>
                                <DropdownMenu end>
                                  <DropdownItem
                                    onClick={() => {
                                      handleOpenViewPayment(payment);
                                    }}
                                  >
                                    <i className="mdi mdi-eye me-2" />
                                    {t('ClientPayment.viewPayment')}
                                  </DropdownItem>
                                  <DropdownItem
                                    onClick={() => {
                                      handleOpenEditPayment(payment);
                                    }}
                                  >
                                    <i className="mdi mdi-pencil-outline me-2" />
                                    {t('ClientPayment.editPayment')}
                                  </DropdownItem>
                                  <DropdownItem
                                    className="text-danger"
                                    onClick={() => {
                                      handleOpenDeletePayment(payment);
                                    }}
                                  >
                                    <i className="mdi mdi-delete-outline me-2" />
                                    {t('ClientPayment.deletePayment')}
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          </tr>
                          
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

      <Modal isOpen={addPaymentModalOpen} toggle={handleCloseAddPaymentModal} centered size="lg">
        <ModalHeader toggle={handleCloseAddPaymentModal}>{t('ClientPayment.addPaymentModalTitle')}</ModalHeader>
        <form onSubmit={handleRegisterPayment}>
          <ModalBody className="px-4">
            <Row>
              <Col md="12" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('ClientPayment.form.clientName')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  value={paymentForm.clientName}
                  onChange={(e) => handlePaymentFormChange('clientName', e.target.value)}
                  invalid={!!paymentFormErrors.clientName}
                >
                  <option value="">{t('Common.select')}</option>
                  {DUMMY_PAYMENT_CLIENT_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Input>
                {paymentFormErrors.clientName && (
                  <FormFeedback type="invalid">{t(paymentFormErrors.clientName)}</FormFeedback>
                )}
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">{t('ClientPayment.form.projectName')}</Label>
                <Input
                  type="text"
                  value={paymentForm.projectName}
                  onChange={(e) => handlePaymentFormChange('projectName', e.target.value)}
                  placeholder={t('ClientPayment.form.placeholders.projectName')}
                />
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">{t('ClientPayment.form.invoiceNumber')}</Label>
                <Input
                  type="text"
                  value={paymentForm.invoiceNumber}
                  onChange={(e) => handlePaymentFormChange('invoiceNumber', e.target.value)}
                  placeholder={t('ClientPayment.form.placeholders.invoiceNumber')}
                />
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">{t('ClientPayment.form.dueDate')}</Label>
                <Input
                  type="date"
                  value={paymentForm.dueDate}
                  onChange={(e) => handlePaymentFormChange('dueDate', e.target.value)}
                />
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('ClientPayment.form.currency')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  value={paymentForm.currency}
                  onChange={(e) => handlePaymentFormChange('currency', e.target.value)}
                >
                  {PAYMENT_CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('ClientPayment.form.projectCost')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={paymentForm.projectCost}
                  onChange={(e) => handlePaymentFormChange('projectCost', e.target.value)}
                  invalid={!!paymentFormErrors.projectCost}
                  placeholder={t('ClientPayment.form.placeholders.amount')}
                />
                {paymentFormErrors.projectCost && (
                  <FormFeedback type="invalid">{t(paymentFormErrors.projectCost)}</FormFeedback>
                )}
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('ClientPayment.form.paidAmount')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={paymentForm.paidAmount}
                  onChange={(e) => handlePaymentFormChange('paidAmount', e.target.value)}
                  invalid={!!paymentFormErrors.paidAmount}
                  placeholder={t('ClientPayment.form.placeholders.amount')}
                />
                {paymentFormErrors.paidAmount && (
                  <FormFeedback type="invalid">{t(paymentFormErrors.paidAmount)}</FormFeedback>
                )}
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" type="button" onClick={handleCloseAddPaymentModal}>
              {t('Common.cancel')}
            </Button>
            <Button color="primary" type="submit">
              {t('Common.submit')}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={!!viewPayment} toggle={handleCloseViewPayment} centered>
        <ModalHeader toggle={handleCloseViewPayment}>{t('ClientPayment.viewPaymentModalTitle')}</ModalHeader>
        <ModalBody>
          <div className="mb-2"><strong>{t('ClientPayment.form.clientName')}:</strong> {viewPayment?.clientName || '—'}</div>
          <div className="mb-2"><strong>{t('ClientPayment.form.projectName')}:</strong> {viewPayment?.projectName || '—'}</div>
          <div className="mb-2"><strong>{t('ClientPayment.form.invoiceNumber')}:</strong> {viewPayment?.invoiceNumber || '—'}</div>
          <div className="mb-2"><strong>{t('ClientPayment.form.dueDate')}:</strong> {formatDate(viewPayment?.dueDate)}</div>
          <div className="mb-2"><strong>{t('ClientPayment.form.currency')}:</strong> {viewPayment?.currency || '—'}</div>
          <div className="mb-2"><strong>{t('ClientPayment.form.projectCost')}:</strong> {viewPayment?.projectCost ?? '—'}</div>
          <div className="mb-2"><strong>{t('ClientPayment.form.paidAmount')}:</strong> {viewPayment?.paidAmount ?? '—'}</div>
          <div><strong>{t('ClientPayment.table.balanceAmount')}:</strong> {viewPayment?.balanceAmount ?? '—'}</div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={handleCloseViewPayment}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={editModalOpen} toggle={handleCloseEditPayment} centered size="lg">
        <ModalHeader toggle={handleCloseEditPayment}>{t('ClientPayment.editPaymentModalTitle')}</ModalHeader>
        <form onSubmit={handleUpdatePayment}>
          <ModalBody className="px-4">
            <Row>
              <Col md="12" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('ClientPayment.form.clientName')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  value={editPaymentForm.clientName}
                  onChange={(e) => handleEditPaymentFormChange('clientName', e.target.value)}
                  invalid={!!editPaymentFormErrors.clientName}
                >
                  <option value="">{t('Common.select')}</option>
                  {DUMMY_PAYMENT_CLIENT_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Input>
                {editPaymentFormErrors.clientName && (
                  <FormFeedback type="invalid">{t(editPaymentFormErrors.clientName)}</FormFeedback>
                )}
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">{t('ClientPayment.form.projectName')}</Label>
                <Input
                  type="text"
                  value={editPaymentForm.projectName}
                  onChange={(e) => handleEditPaymentFormChange('projectName', e.target.value)}
                  placeholder={t('ClientPayment.form.placeholders.projectName')}
                />
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">{t('ClientPayment.form.invoiceNumber')}</Label>
                <Input
                  type="text"
                  value={editPaymentForm.invoiceNumber}
                  onChange={(e) => handleEditPaymentFormChange('invoiceNumber', e.target.value)}
                  placeholder={t('ClientPayment.form.placeholders.invoiceNumber')}
                />
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">{t('ClientPayment.form.dueDate')}</Label>
                <Input
                  type="date"
                  value={editPaymentForm.dueDate}
                  onChange={(e) => handleEditPaymentFormChange('dueDate', e.target.value)}
                />
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">{t('ClientPayment.form.currency')}</Label>
                <Input
                  type="select"
                  value={editPaymentForm.currency}
                  onChange={(e) => handleEditPaymentFormChange('currency', e.target.value)}
                >
                  {PAYMENT_CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('ClientPayment.form.projectCost')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editPaymentForm.projectCost}
                  onChange={(e) => handleEditPaymentFormChange('projectCost', e.target.value)}
                  invalid={!!editPaymentFormErrors.projectCost}
                  placeholder={t('ClientPayment.form.placeholders.amount')}
                />
                {editPaymentFormErrors.projectCost && (
                  <FormFeedback type="invalid">{t(editPaymentFormErrors.projectCost)}</FormFeedback>
                )}
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('ClientPayment.form.paidAmount')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editPaymentForm.paidAmount}
                  onChange={(e) => handleEditPaymentFormChange('paidAmount', e.target.value)}
                  invalid={!!editPaymentFormErrors.paidAmount}
                  placeholder={t('ClientPayment.form.placeholders.amount')}
                />
                {editPaymentFormErrors.paidAmount && (
                  <FormFeedback type="invalid">{t(editPaymentFormErrors.paidAmount)}</FormFeedback>
                )}
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" type="button" onClick={handleCloseEditPayment}>
              {t('Common.cancel')}
            </Button>
            <Button color="primary" type="submit">
              {t('Common.submit')}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deletePaymentModalOpen}
        toggle={handleCloseDeletePayment}
        message={paymentToDelete ? `${t('ClientPayment.deleteConfirmation')} ${paymentToDelete.clientName}?` : ''}
        onConfirm={handleConfirmDeletePayment}
      />
    </>
  );
};

export default ClientPaymentPage;

