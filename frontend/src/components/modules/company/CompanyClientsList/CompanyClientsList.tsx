/**
 * Company clients – Dashboard layout: left sidebar client list, right panel client details.
 */

import { useState, useEffect, useCallback } from 'react';
import './CompanyClientsList.scss';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Badge,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  FormFeedback,
  Nav,
  NavItem,
  NavLink,
  Table,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import { showSuccessToast } from '../../../../core/utils/toast';
import { validateEmail, validatePhone, validateRequired } from '../../../../core/utils/Utils';
import { STATUS, PAGINATION } from '../../../../core/constants/constantValues';
import CompanyAdminService from '../../../../core/service/CompanyAdminService';

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

/** GET /admin/clients response body: success, message, data (clients array), pagination */
interface GetClientsResponseBody {
  data?: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    isActive?: boolean;
    createdDate?: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** GET /admin/clients/:id response data – client with clientMetadata */
interface GetClientByIdResponseClient {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  clientMetadata?: Record<string, unknown>;
  createdDate?: string;
  updatedDate?: string;
}

/** Format address from clientMetadata for display */
function formatAddressFromMetadata(meta: Record<string, unknown> | undefined): string {
  if (!meta) return '';
  const parts = [
    meta.buildingAddress,
    meta.streetAddress,
    [meta.city, meta.state].filter(Boolean).join(', '),
    meta.postalCode,
    meta.country,
  ].filter(Boolean) as string[];
  return parts.join(' — ') || '';
}

/** Map API list item to Client for UI (list returns id, name, email, phone, isActive, createdDate) */
function mapApiClientToClient(item: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive?: boolean;
  createdDate?: string;
}): Client {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone ?? '',
    buildingAddress: '',
    streetAddress: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    type: STATUS.GENERAL,
    status: item.isActive !== false ? STATUS.ACTIVE : 'Inactive',
    createdAt: item.createdDate ?? new Date().toISOString(),
    updatedAt: item.createdDate ?? new Date().toISOString(),
    totalAmount: 0,
  };
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string): string => {
  const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-secondary', 'bg-dark', 'bg-light text-dark'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

type NewClientForm = {
  name: string;
  email: string;
  phone: string;
  buildingAddress: string;
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  description: string;
  logo: { file: File; preview: string | ArrayBuffer | null } | null;
};

const emptyNewClient = (): NewClientForm => ({
  name: '',
  email: '',
  phone: '',
  buildingAddress: '',
  streetAddress: '',
  country: '',
  state: '',
  city: '',
  postalCode: '',
  description: '',
  logo: null,
});

const CompanyClientsList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(PAGINATION.DEFAULT_PAGE_NUMBER);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'comments' | 'transactions' | 'mails' | 'statement'>('overview');
  const [overviewAddressOpen, setOverviewAddressOpen] = useState(true);
  const [overviewOtherOpen, setOverviewOtherOpen] = useState(true);
  const [overviewContactsOpen, setOverviewContactsOpen] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newClient, setNewClient] = useState(emptyNewClient);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [selectedClientDetails, setSelectedClientDetails] = useState<GetClientByIdResponseClient | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CompanyAdminService.getClients({
        page: currentPage,
        limit: PAGINATION.DEFAULT_PAGE_SIZE,
        search: searchTerm.trim() || undefined,
      });
      const body = (res?.data ?? {}) as GetClientsResponseBody;
      const data = body?.data ?? [];
      const pagination = body?.pagination;
      const list = Array.isArray(data) ? data.map(mapApiClientToClient) : [];
      setClients(list);
      setTotalItems(pagination?.total ?? 0);
      setTotalPages(Math.max(1, pagination?.pages ?? 1));
      if (list.length > 0 && (!selectedClient || !list.some((c) => c.id === selectedClient.id))) {
        setSelectedClient(list[0]);
      } else if (list.length === 0) {
        setSelectedClient(null);
      }
    } catch {
      setClients([]);
      setTotalItems(0);
      setTotalPages(1);
      setSelectedClient(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  
  useEffect(() => {
    if (!selectedClient?.id) {
      setSelectedClientDetails(null);
      setLoadingDetails(false);
      return;
    }
    let cancelled = false;
    setLoadingDetails(true);
    setSelectedClientDetails(null);
    CompanyAdminService.getClientById(selectedClient.id)
      .then((res) => {
        if (cancelled) return;
        const body = (res?.data ?? {}) as { data?: GetClientByIdResponseClient };
        setSelectedClientDetails(body?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setSelectedClientDetails(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedClient?.id]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setNewClient(emptyNewClient());
    setCreateErrors({});
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = async (client: Client) => {
    setLoadingEdit(true);
    setCreateErrors({});
    try {
      const res = await CompanyAdminService.getClientById(client.id);
      const body = (res?.data ?? {}) as { data?: GetClientByIdResponseClient };
      const data = body?.data;
      if (!data) {
        return;
      }
      const meta = (data.clientMetadata ?? {}) as Record<string, unknown>;
      setNewClient({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        buildingAddress: (meta.buildingAddress as string) ?? '',
        streetAddress: (meta.streetAddress as string) ?? '',
        country: (meta.country as string) ?? '',
        state: (meta.state as string) ?? '',
        city: (meta.city as string) ?? '',
        postalCode: (meta.postalCode as string) ?? '',
        description: (meta.description as string) ?? '',
        logo:
          meta.logo && typeof meta.logo === 'string'
            ? { file: null as unknown as File, preview: meta.logo }
            : null,
      });
      setEditingClient(client);
      setCreateModalOpen(true);
    } catch {
      // Error toast handled by interceptor
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setEditingClient(null);
    setNewClient(emptyNewClient());
    setCreateErrors({});
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await CompanyAdminService.deleteClient(clientToDelete.id);
      await fetchClients();
      showSuccessToast(t('NewClients.clientDeletedSuccessfully'));
      setDeleteModalOpen(false);
      setClientToDelete(null);
    } catch {
      // Error toast handled by interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNewClientChange = (field: string, value: string) => {
    setNewClient((prev) => ({ ...prev, [field]: value }));
    if (createErrors[field]) setCreateErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleNewClientLogoChange = (logo: NewClientForm['logo']) => {
    setNewClient((prev) => ({ ...prev, logo }));
  };

  const buildClientRequestBody = () => {
    const clientMetadata: Record<string, unknown> = {
      buildingAddress: newClient.buildingAddress,
      streetAddress: newClient.streetAddress,
      country: newClient.country,
      state: newClient.state,
      city: newClient.city,
      postalCode: newClient.postalCode,
      description: newClient.description || undefined,
      ...(newClient.logo?.preview && typeof newClient.logo.preview === 'string' && { logo: newClient.logo.preview }),
    };
    return {
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      isActive: true,
      clientMetadata,
    };
  };

  const handleSaveClient = async () => {
    const nameVal = validateRequired(newClient.name, 'name');
    const emailVal = validateEmail(newClient.email);
    const phoneVal = validatePhone(newClient.phone);
    const buildingVal = validateRequired(newClient.buildingAddress, 'buildingAddress');
    const streetVal = validateRequired(newClient.streetAddress, 'streetAddress');
    const countryVal = validateRequired(newClient.country, 'country');
    const stateVal = validateRequired(newClient.state, 'state');
    const cityVal = validateRequired(newClient.city, 'city');
    const postalVal = validateRequired(newClient.postalCode, 'postalCode');
    const errors: Record<string, string> = {};
    if (!nameVal.isValid) errors.name = nameVal.errorMessage ?? '';
    if (!emailVal.isValid) errors.email = emailVal.errorMessage ?? '';
    if (!phoneVal.isValid) errors.phone = phoneVal.errorMessage ?? '';
    if (!buildingVal.isValid) errors.buildingAddress = buildingVal.errorMessage ?? '';
    if (!streetVal.isValid) errors.streetAddress = streetVal.errorMessage ?? '';
    if (!countryVal.isValid) errors.country = countryVal.errorMessage ?? '';
    if (!stateVal.isValid) errors.state = stateVal.errorMessage ?? '';
    if (!cityVal.isValid) errors.city = cityVal.errorMessage ?? '';
    if (!postalVal.isValid) errors.postalCode = postalVal.errorMessage ?? '';
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    const body = buildClientRequestBody();
    setIsSubmitting(true);
    try {
      if (editingClient) {
        await CompanyAdminService.updateClient(editingClient.id, body);
        showSuccessToast(t('NewClients.clientUpdatedSuccessfully'));
        if (selectedClient?.id === editingClient.id) {
          try {
            const res = await CompanyAdminService.getClientById(editingClient.id);
            const bodyRes = (res?.data ?? {}) as { data?: GetClientByIdResponseClient };
            setSelectedClientDetails(bodyRes?.data ?? null);
          } catch {
            // ignore
          }
        }
        setSelectedClient((prev) =>
          prev?.id === editingClient.id
            ? {
                ...prev,
                name: newClient.name,
                email: newClient.email,
                phone: newClient.phone,
                buildingAddress: newClient.buildingAddress,
                streetAddress: newClient.streetAddress,
                country: newClient.country,
                state: newClient.state,
                city: newClient.city,
                postalCode: newClient.postalCode,
                description: newClient.description || undefined,
                updatedAt: new Date().toISOString(),
              }
            : prev
        );
        setClients((prev) =>
          prev.map((c) =>
            c.id === editingClient.id
              ? {
                  ...c,
                  name: newClient.name,
                  email: newClient.email,
                  phone: newClient.phone,
                  buildingAddress: newClient.buildingAddress,
                  streetAddress: newClient.streetAddress,
                  country: newClient.country,
                  state: newClient.state,
                  city: newClient.city,
                  postalCode: newClient.postalCode,
                  description: newClient.description || undefined,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      } else {
        await CompanyAdminService.createClient(body);
        showSuccessToast(t('NewClients.clientCreatedSuccessfully'));
        await fetchClients();
      }
      handleCloseCreateModal();
    } catch {
      // Error toast handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setActiveDetailTab('overview');
  }, [selectedClient?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge color="success">{t('Common.statusCompleted')}</Badge>;
      case 'OVERDUE':
        return <Badge color="danger">{t('Common.statusOverdue')}</Badge>;
      case 'PENDING':
        return <Badge color="warning">{t('Common.StatusPending')}</Badge>;
      case 'New':
      case 'NEW':
        return <Badge color="info">{t('Common.statusNew')}</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Breadcrumbs
        title={t('CompanyClientsList.pageTitle')}
        breadcrumbItem={t('CompanyClientsList.newClients')}
        link="/company/clients"
        breadcrumbParent={t('CompanyClientsList.clients')}
      />

      <div className="company-clients-list">
        {/* Left sidebar: client list */}
        <aside className="company-clients-sidebar">
          <div className="sidebar-header">
            <Input
              type="text"
              className="sidebar-search-input"
              placeholder={t('Common.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(PAGINATION.DEFAULT_PAGE_NUMBER);
              }}
            />
            <Button
              color="primary"
              size="sm"
              className="sidebar-btn-add"
              onClick={handleOpenCreateModal}
              title={t('NewClients.createClient')}
            >
              <i className="bx bx-plus" />
            </Button>
          </div>
          <div className="client-list">
            {loading ? (
              <div className="detail-placeholder">
                <p className="mb-0">{t('Common.loading')}</p>
              </div>
            ) : clients.length > 0 ? (
              clients.map((client) => {
                const createdDate = new Date(client.createdAt);
                const isActive = selectedClient?.id === client.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    className={`client-list-item ${isActive ? 'selected' : ''}`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className={`avatar-xs flex-shrink-0 avatar-title rounded-circle ${getAvatarColor(client.name)}`}>
                      {getInitials(client.name)}
                    </div>
                    <div className="client-list-item-body">
                      <div className="client-name">{client.name}</div>
                      <div className="client-meta text-muted text-truncate small">{client.email}</div>
                      <div className="client-meta text-muted text-truncate small">{client.phone}</div>
                      <div className="d-flex justify-content-between align-items-center mt-1 flex-wrap gap-1">
                        <span>{getStatusBadge(client.status)}</span>
                        <span className="client-date text-muted small">
                          {createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="detail-placeholder">
                <p className="mb-0">{t('NewClients.noClientsFound')}</p>
              </div>
            )}
          </div>
          {!loading && totalItems > 0 && (
            <div className="sidebar-footer p-2 border-top">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={PAGINATION.DEFAULT_PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </aside>

        {/* Right panel: client details */}
        <div className="company-clients-detail">
          {selectedClient ? (
            <Card className="h-100 border-0 shadow-none rounded-0 d-flex flex-column">
              <div className="detail-header-bar">
                <div className="d-flex align-items-center gap-3">
                  {selectedClientDetails?.clientMetadata?.logo && typeof selectedClientDetails.clientMetadata.logo === 'string' ? (
                    <div className="detail-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden bg-light">
                      <img src={selectedClientDetails.clientMetadata.logo as string} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div
                      className={`detail-avatar rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 ${getAvatarColor(selectedClient.name)}`}
                    >
                      {getInitials(selectedClient.name)}
                    </div>
                  )}
                  <div>
                    <h4 className="detail-client-name mb-1">{selectedClientDetails?.name ?? selectedClient.name}</h4>
                    <span className="text-muted">#{selectedClient.id}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    color="secondary"
                    size="sm"
                    outline
                    className="d-inline-flex align-items-center"
                    onClick={() => handleOpenEditModal(selectedClient)}
                    disabled={loadingEdit}
                  >
                    <i className="mdi mdi-pencil me-1" />
                    {loadingEdit ? t('Common.loading') : t('Common.edit')}
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    outline
                    className="d-inline-flex align-items-center"
                    onClick={() => handleDeleteClick(selectedClient)}
                    disabled={isDeleting}
                  >
                    <i className="mdi mdi-delete me-1" />
                    {t('Common.delete')}
                  </Button>
                </div>
              </div>

              <Nav tabs className="detail-tabs">
                <NavItem>
                  <NavLink
                    tag="button"
                    type="button"
                    className={activeDetailTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveDetailTab('overview')}
                  >
                    {t('CompanyClientsList.overview')}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    tag="button"
                    type="button"
                    className={activeDetailTab === 'comments' ? 'active' : ''}
                    onClick={() => setActiveDetailTab('comments')}
                  >
                    {t('CompanyClientsList.comments')}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    tag="button"
                    type="button"
                    className={activeDetailTab === 'transactions' ? 'active' : ''}
                    onClick={() => setActiveDetailTab('transactions')}
                  >
                    {t('CompanyClientsList.transactions')}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    tag="button"
                    type="button"
                    className={activeDetailTab === 'mails' ? 'active' : ''}
                    onClick={() => setActiveDetailTab('mails')}
                  >
                    {t('CompanyClientsList.mails')}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    tag="button"
                    type="button"
                    className={activeDetailTab === 'statement' ? 'active' : ''}
                    onClick={() => setActiveDetailTab('statement')}
                  >
                    {t('CompanyClientsList.statement')}
                  </NavLink>
                </NavItem>
              </Nav>

              <CardBody className="detail-card-body flex-grow-1 overflow-auto">
                {loadingDetails ? (
                  <div className="detail-tab-placeholder">
                    <p className="text-muted mb-0">{t('Common.loading')}</p>
                  </div>
                ) : activeDetailTab === 'overview' && selectedClient ? (
                  <div className="overview-content">
                    <div className="overview-two-col">
                      {/* Left column: Contact, Address, Other details, Contact persons */}
                      <div className="overview-left">
                        <div className="overview-contact-card">
                          <div className="d-flex align-items-center gap-3">
                            {selectedClientDetails?.clientMetadata?.logo && typeof selectedClientDetails.clientMetadata.logo === 'string' ? (
                              <div className="overview-contact-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden bg-light">
                                <img src={selectedClientDetails.clientMetadata.logo as string} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <div className={`overview-contact-avatar rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 ${getAvatarColor(selectedClient.name)}`}>
                                {getInitials(selectedClient.name)}
                              </div>
                            )}
                            <div className="flex-grow-1 min-w-0">
                              <div className="overview-contact-name">{selectedClientDetails?.name ?? selectedClient.name}</div>
                              {(selectedClientDetails?.email ?? selectedClient.email) && (
                                <div className="small text-muted">{selectedClientDetails?.email ?? selectedClient.email}</div>
                              )}
                              <a href="#invite" className="overview-invite-link">{t('CompanyClientsList.inviteToPortal')}</a>
                            </div>
                            <Button color="light" size="sm" className="btn-icon-sm p-1" title={t('Common.settings')}>
                              <i className="bx bx-cog" />
                            </Button>
                          </div>
                        </div>

                        <div className="overview-section">
                          <button
                            type="button"
                            className="overview-section-toggle d-flex align-items-center justify-content-between w-100"
                            onClick={() => setOverviewAddressOpen((o) => !o)}
                          >
                            <span className="overview-section-title">{t('CompanyClientsList.address')}</span>
                            <i className={`bx ${overviewAddressOpen ? 'bx-chevron-up' : 'bx-chevron-down'} text-primary`} />
                          </button>
                          {overviewAddressOpen && (
                            <div className="overview-section-body">
                              <div className="overview-kv">
                                <span className="overview-kv-label">{t('CompanyClientsList.billingAddress')}</span>
                                <span className="overview-kv-value">
                                  {formatAddressFromMetadata(selectedClientDetails?.clientMetadata as Record<string, unknown> | undefined) || (
                                    <>{t('CompanyClientsList.noBillingAddress')} — <a href="#new-address" className="overview-link">{t('CompanyClientsList.newAddress')}</a></>
                                  )}
                                </span>
                              </div>
                              <div className="overview-kv">
                                <span className="overview-kv-label">{t('CompanyClientsList.shippingAddress')}</span>
                                <span className="overview-kv-value">
                                  {formatAddressFromMetadata(selectedClientDetails?.clientMetadata as Record<string, unknown> | undefined) || (
                                    <>{t('CompanyClientsList.noShippingAddress')} — <a href="#new-address" className="overview-link">{t('CompanyClientsList.newAddress')}</a></>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="overview-section">
                          <button
                            type="button"
                            className="overview-section-toggle d-flex align-items-center justify-content-between w-100"
                            onClick={() => setOverviewOtherOpen((o) => !o)}
                          >
                            <span className="overview-section-title">{t('CompanyClientsList.otherDetails')}</span>
                            <i className={`bx ${overviewOtherOpen ? 'bx-chevron-up' : 'bx-chevron-down'} text-primary`} />
                          </button>
                          {overviewOtherOpen && (
                            <div className="overview-section-body">
                              <div className="overview-kv">
                                <span className="overview-kv-label">{t('CompanyClientsList.customerType')}</span>
                                <span className="overview-kv-value">{t('CompanyClientsList.business')}</span>
                              </div>
                              <div className="overview-kv">
                                <span className="overview-kv-label">{t('CompanyClientsList.customerNumber')}</span>
                                <span className="overview-kv-value">CUS-{selectedClient.id}</span>
                              </div>
                              <div className="overview-kv">
                                <span className="overview-kv-label">{t('CompanyClientsList.defaultCurrency')}</span>
                                <span className="overview-kv-value">AED</span>
                              </div>
                              <div className="overview-kv">
                                <span className="overview-kv-label">{t('CompanyClientsList.portalStatus')}</span>
                                <span className="overview-kv-value">
                                  <span className="portal-status-dot disabled" /> {t('CompanyClientsList.disabled')}
                                </span>
                              </div>
                              <div className="overview-kv">
                                <span className="overview-kv-label">{t('CompanyClientsList.customerLanguage')}</span>
                                <span className="overview-kv-value">{t('CompanyClientsList.english')}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="overview-section">
                          <button
                            type="button"
                            className="overview-section-toggle d-flex align-items-center justify-content-between w-100"
                            onClick={() => setOverviewContactsOpen((o) => !o)}
                          >
                            <span className="overview-section-title">{t('CompanyClientsList.contactPersons')}</span>
                            <span className="d-flex align-items-center gap-1">
                              <i className="bx bx-plus text-primary small" />
                              <i className={`bx ${overviewContactsOpen ? 'bx-chevron-up' : 'bx-chevron-down'} text-primary`} />
                            </span>
                          </button>
                          {overviewContactsOpen && (
                            <div className="overview-section-body">
                              <p className="text-muted small mb-0">{t('Common.noDataAvailable')}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right column: Payment due, Receivables, Income and Expense */}
                      <div className="overview-right">
                        <div className="overview-block">
                          <Label className="overview-label">{t('CompanyClientsList.paymentDuePeriod')}</Label>
                          <p className="overview-value mb-0">{t('CompanyClientsList.dueOnReceipt')}</p>
                        </div>

                        <div className="overview-block">
                          <div className="overview-heading">{t('CompanyClientsList.receivables')}</div>
                          <div className="table-responsive">
                            <Table className="overview-receivables-table mb-0">
                              <thead>
                                <tr>
                                  <th>{t('CompanyClientsList.currency')}</th>
                                  <th className="text-end">{t('CompanyClientsList.outstandingReceivables')}</th>
                                  <th className="text-end">{t('CompanyClientsList.unusedCredits')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>AED - UAE Dirham</td>
                                  <td className="text-end">
                                    AED{(Number((selectedClientDetails?.clientMetadata as Record<string, unknown> | undefined)?.totalAmount) || selectedClient?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="text-end">AED0.00</td>
                                </tr>
                              </tbody>
                            </Table>
                          </div>
                        </div>

                        <div className="overview-block">
                          <div className="overview-heading">{t('CompanyClientsList.incomeAndExpense')}</div>
                          <p className="overview-chart-desc small text-muted">{t('CompanyClientsList.chartBaseCurrency')}</p>
                          <a href="#period" className="overview-link d-inline-block mb-2">{t('CompanyClientsList.last6Months')} <i className="bx bx-chevron-down small" /></a>
                          <div className="overview-chart-placeholder">
                            <div className="overview-chart-bars">
                              {[40, 55, 45, 60, 50, 55, 48].map((h, i) => (
                                <div key={i} className="overview-chart-bar" style={{ height: `${h}%` }} />
                              ))}
                            </div>
                            <div className="overview-chart-labels d-flex justify-content-between small text-muted mt-1">
                              <span>Sep 2025</span>
                              <span>Mar 2026</span>
                            </div>
                          </div>
                          <p className="overview-total-income small text-muted mb-0 mt-2">
                            {t('CompanyClientsList.totalIncomeLast6Months')} — AED{(Number((selectedClientDetails?.clientMetadata as Record<string, unknown> | undefined)?.totalAmount) || selectedClient?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeDetailTab === 'comments' && (
                  <div className="detail-tab-placeholder">
                    <p className="text-muted mb-0">{t('CompanyClientsList.comments')}</p>
                  </div>
                )}

                {activeDetailTab === 'transactions' && (
                  <div className="detail-tab-placeholder">
                    <p className="text-muted mb-0">{t('CompanyClientsList.transactions')}</p>
                  </div>
                )}

                {activeDetailTab === 'mails' && (
                  <div className="detail-tab-placeholder">
                    <p className="text-muted mb-0">{t('CompanyClientsList.mails')}</p>
                  </div>
                )}

                {activeDetailTab === 'statement' && (
                  <div className="detail-tab-placeholder">
                    <p className="text-muted mb-0">{t('CompanyClientsList.statement')}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="detail-placeholder">
              <h5 className="mb-2">{t('CompanyClientsList.selectClientTitle')}</h5>
              <p className="text-muted mb-0">{t('CompanyClientsList.selectClientDescription')}</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={createModalOpen} toggle={handleCloseCreateModal} size="lg">
        <ModalHeader toggle={handleCloseCreateModal}>
          {editingClient ? t('NewClients.editClient') : t('NewClients.createClient')}
        </ModalHeader>
        <ModalBody>
          <Row className="m-0">
            <div className="col-md-12 mb-4 d-flex flex-column align-items-center">
              <Label className="form-label fw-semibold mb-2">{t('NewClients.profilePhoto')}</Label>
              <div
                className="profile-photo-upload position-relative d-flex align-items-center justify-content-center"
                onClick={() => document.getElementById('client-profile-upload-input')?.click()}
              >
                {newClient.logo && newClient.logo.preview ? (
                  <img
                    src={newClient.logo.preview as string}
                    alt="Profile"
                  />
                ) : (
                  <svg width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="40" fill="#e1e7ef" />
                    <circle cx="40" cy="32" r="14" fill="#ced6df" />
                    <ellipse cx="40" cy="60" rx="22" ry="14" fill="#ced6df" />
                  </svg>
                )}

                <div className="profile-upload-button">
                  <i className="mdi mdi-camera text-primary" />
                </div>
                <input
                  id="client-profile-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = function (ev) {
                        handleNewClientLogoChange({
                          file,
                          preview: ev.target?.result ?? null,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="profile-upload-helper-text">{t('NewClients.uploadProfilePhoto')}</div>
            </div>

            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('NewClients.clientName')} <span className="text-danger">*</span></Label>
              <Input
                value={newClient.name}
                onChange={(e) => handleNewClientChange('name', e.target.value)}
                invalid={!!createErrors.name}
                placeholder={t('NewClients.enterClientName')}
              />
              <FormFeedback>{createErrors.name}</FormFeedback>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('Common.email')} <span className="text-danger">*</span></Label>
              <Input
                type="email"
                value={newClient.email}
                onChange={(e) => handleNewClientChange('email', e.target.value)}
                invalid={!!createErrors.email}
                placeholder={t('NewClients.enterEmailAddress')}
              />
              <FormFeedback>{createErrors.email}</FormFeedback>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('Common.phone')} <span className="text-danger">*</span></Label>
              <Input
                value={newClient.phone}
                onChange={(e) => handleNewClientChange('phone', e.target.value)}
                invalid={!!createErrors.phone}
                placeholder={t('NewClients.enterPhoneNumber')}
              />
              <FormFeedback>{createErrors.phone}</FormFeedback>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('NewClients.labels.buildingAddress')} <span className="text-danger">*</span></Label>
              <Input
                value={newClient.buildingAddress}
                onChange={(e) => handleNewClientChange('buildingAddress', e.target.value)}
                invalid={!!createErrors.buildingAddress}
                placeholder={t('NewClients.enterBuildingAddress')}
              />
              <FormFeedback>{createErrors.buildingAddress}</FormFeedback>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('NewClients.labels.streetAddress')} <span className="text-danger">*</span></Label>
              <Input
                value={newClient.streetAddress}
                onChange={(e) => handleNewClientChange('streetAddress', e.target.value)}
                invalid={!!createErrors.streetAddress}
                placeholder={t('NewClients.enterStreetAddress')}
              />
              <FormFeedback>{createErrors.streetAddress}</FormFeedback>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('NewClients.labels.country')} <span className="text-danger">*</span></Label>
              <Input
                value={newClient.country}
                onChange={(e) => handleNewClientChange('country', e.target.value)}
                invalid={!!createErrors.country}
              />
              <FormFeedback>{createErrors.country}</FormFeedback>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('NewClients.labels.state')} <span className="text-danger">*</span></Label>
              <Input
                value={newClient.state}
                onChange={(e) => handleNewClientChange('state', e.target.value)}
                invalid={!!createErrors.state}
              />
              <FormFeedback>{createErrors.state}</FormFeedback>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('NewClients.labels.city')} <span className="text-danger">*</span></Label>
              <Input
                value={newClient.city}
                onChange={(e) => handleNewClientChange('city', e.target.value)}
                invalid={!!createErrors.city}
              />
              <FormFeedback>{createErrors.city}</FormFeedback>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold form-label">{t('NewClients.labels.postalCode')} <span className="text-danger">*</span></Label>
              <Input
                value={newClient.postalCode}
                onChange={(e) => handleNewClientChange('postalCode', e.target.value)}
                invalid={!!createErrors.postalCode}
              />
              <FormFeedback>{createErrors.postalCode}</FormFeedback>
            </Col>
            <Col xs="12">
              <Label className="form-label fw-semibold form-label">{t('NewClients.labels.description')}</Label>
              <Input
                type="textarea"
                value={newClient.description}
                onChange={(e) => handleNewClientChange('description', e.target.value)}
                placeholder={t('NewClients.enterDescription')}
                rows={3}
              />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseCreateModal} disabled={isSubmitting}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleSaveClient} disabled={isSubmitting}>
            {isSubmitting ? t('Common.loading') : editingClient ? t('Common.save') : t('NewClients.createClient')}
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => {
          setDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        message={clientToDelete ? `${t('NewClients.deleteConfirmation')} ${clientToDelete.name}?` : ''}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
};

export default CompanyClientsList;
