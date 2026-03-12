/**
 * Company clients – Zoho-style master/detail layout.
 * Left list of clients, right-side detailed view + create modal.
 */

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Badge,
  Input,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  FormFeedback,
  ButtonGroup,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import { showSuccessToast } from '../../../../core/utils/toast';
import { validateEmail, validatePhone, validateRequired } from '../../../../core/utils/Utils';
import { STATUS } from '../../../../core/constants/constantValues';

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

const INITIAL_CLIENTS: Client[] = [
  {
    id: '1001',
    name: 'Arabtec Construction',
    email: 'projects@arabtec.ae',
    phone: '+971 4 333 3000',
    buildingAddress: 'Arabtec Tower',
    streetAddress: 'Sheikh Zayed Road',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '12345',
    description: 'Major UAE contractor; known for Burj Khalifa and landmark projects. Civil, MEP and building construction.',
    type: STATUS.GENERAL,
    status: 'New',
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: '2026-02-10T00:00:00.000Z',
    totalAmount: 240000.00,
  },
  {
    id: '1002',
    name: 'ALEC Engineering and Contracting',
    email: 'info@alec.ae',
    phone: '+971 4 809 0000',
    buildingAddress: 'ALEC Headquarters',
    streetAddress: 'Dubai Investments Park',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '54321',
    description: 'Dubai-based contractor; completed Dubai International Airport Terminal 3 and major commercial projects.',
    type: STATUS.GENERAL,
    status: 'COMPLETED',
    createdAt: '2026-02-22T00:00:00.000Z',
    updatedAt: '2026-02-22T00:00:00.000Z',
    totalAmount: 120000.00,
  },
  {
    id: '1003',
    name: 'Al Naboodah Construction Group',
    email: 'enquiries@alnaboodah.ae',
    phone: '+971 4 880 0000',
    buildingAddress: 'Al Naboodah Building',
    streetAddress: 'Al Quoz Industrial Area',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '67890',
    description: 'Established since 1960s. Specializes in civil engineering, MEP and infrastructure.',
    type: STATUS.SUPPLIER,
    status: 'OVERDUE',
    createdAt: '2026-02-22T00:00:00.000Z',
    updatedAt: '2026-02-22T00:00:00.000Z',
    totalAmount: 700000.00,
  },
  {
    id: '1004',
    name: 'Dutco Construction Company',
    email: 'contact@dutco.ae',
    phone: '+971 4 347 0000',
    buildingAddress: 'Dutco House',
    streetAddress: 'Jebel Ali',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '98765',
    description: 'One of the largest construction companies in UAE; infrastructure, building and civil works.',
    type: STATUS.GENERAL,
    status: 'PENDING',
    createdAt: '2026-02-25T00:00:00.000Z',
    updatedAt: '2026-02-25T00:00:00.000Z',
    totalAmount: 870000.00,
  },
  {
    id: '1005',
    name: 'Al Jaber Construction Group',
    email: 'info@aljaber.ae',
    phone: '+971 4 880 0000',
    buildingAddress: 'Al Jaber Building',
    streetAddress: 'Al Quoz Industrial Area',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '67890',
    description: 'Established since 1960s. Specializes in civil engineering, MEP and infrastructure.',
    type: STATUS.SUPPLIER,
    status: 'COMPLETED',
    createdAt: '2026-02-22T00:00:00.000Z',
    updatedAt: '2026-02-22T00:00:00.000Z',
    totalAmount: 700000.00,
  },
  {
    id: '1006',
    name: 'Nakheel PJSC',
    email: 'customercare@nakheel.com',
    phone: '+971 4 390 3333',
    buildingAddress: 'Nakheel Sales Centre',
    streetAddress: 'King Salman Bin Abdul Aziz Al Saud Street, Al Sufouh 2',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Dubai-based master developer; Palm Jumeirah, Deira Islands, Ibn Battuta and other landmark projects.',
    type: STATUS.GENERAL,
    status: 'PENDING',
    createdAt: '2026-02-18T00:00:00.000Z',
    updatedAt: '2026-02-18T00:00:00.000Z',
    totalAmount: 520000.00,
  },
  {
    id: '1007',
    name: 'Emaar Properties PJSC',
    email: 'customer.service@emaar.ae',
    phone: '+971 4 366 1688',
    buildingAddress: 'Emaar Square',
    streetAddress: 'Building 4, Downtown Dubai',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Global developer; Burj Khalifa, Dubai Mall, Downtown Dubai and international real estate.',
    type: STATUS.GENERAL,
    status: 'COMPLETED',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-02-20T00:00:00.000Z',
    totalAmount: 980000.00,
  },
  {
    id: '1008',
    name: 'Damac Properties',
    email: 'info@damacproperties.com',
    phone: '+971 4 373 2000',
    buildingAddress: 'Damac Towers',
    streetAddress: 'Dubai Marina',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Luxury developer; residential and commercial projects in Dubai and key international markets.',
    type: STATUS.GENERAL,
    status: 'NEW',
    createdAt: '2026-02-28T00:00:00.000Z',
    updatedAt: '2026-02-28T00:00:00.000Z',
    totalAmount: 450000.00,
  },
  {
    id: '1009',
    name: 'Khansaheb Civil Engineering LLC',
    email: 'enquiries@khansaheb.ae',
    phone: '+971 4 337 5555',
    buildingAddress: 'Khansaheb Building',
    streetAddress: 'Al Quoz Industrial Area 3',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Civil engineering and construction; infrastructure, buildings and MEP across UAE and region.',
    type: STATUS.SUPPLIER,
    status: 'PENDING',
    createdAt: '2026-02-12T00:00:00.000Z',
    updatedAt: '2026-02-12T00:00:00.000Z',
    totalAmount: 610000.00,
  },
  {
    id: '1010',
    name: 'Sobha Realty',
    email: 'info@sobharealty.com',
    phone: '+971 4 378 8888',
    buildingAddress: 'Sobha Hartland',
    streetAddress: 'Mohammed Bin Rashid City',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '00000',
    description: 'Developer of Sobha Hartland and other residential and mixed-use projects in Dubai.',
    type: STATUS.GENERAL,
    status: 'OVERDUE',
    createdAt: '2026-02-05T00:00:00.000Z',
    updatedAt: '2026-02-05T00:00:00.000Z',
    totalAmount: 380000.00,
  },
];

const ITEMS_PER_PAGE = 10;

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
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newClient, setNewClient] = useState(emptyNewClient);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleOpenCreateModal = () => {
    setNewClient(emptyNewClient());
    setCreateErrors({});
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNewClient(emptyNewClient());
    setCreateErrors({});
  };

  const handleNewClientChange = (field: string, value: string) => {
    setNewClient((prev) => ({ ...prev, [field]: value }));
    if (createErrors[field]) setCreateErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleNewClientLogoChange = (logo: NewClientForm['logo']) => {
    setNewClient((prev) => ({ ...prev, logo }));
  };

  const handleCreateClient = () => {
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
    const now = new Date().toISOString();
    const client: Client = {
      id: String(Date.now()),
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
      type: STATUS.SUPPLIER,
      status: STATUS.ACTIVE,
      createdAt: now,
      updatedAt: now,
      totalAmount: 100000.00,
    };
    setClients((prev) => [client, ...prev]);
    showSuccessToast(t('NewClients.clientCreatedSuccessfully'));
    handleCloseCreateModal();
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term))
    );
  }, [clients, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  useEffect(() => {
    if (filteredClients.length === 0) {
      setSelectedClient(null);
      return;
    }

    if (!selectedClient || !filteredClients.some((client) => client.id === selectedClient.id)) {
      setSelectedClient(filteredClients[0]);
    }
  }, [filteredClients, selectedClient]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case STATUS.GENERAL:
        return <Badge className="bg-primary d-none">{t('Common.StatusGeneral')}</Badge>;
      case STATUS.SUPPLIER:
        return <Badge className="bg-danger">{t('Common.StatusSupplier')}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge color="success">{t('Common.statusCompleted')}</Badge>;
      case 'OVERDUE':
        return <Badge color="danger">{t('Common.statusOverdue')}</Badge>;
      case 'PENDING':
        return <Badge color="warning">{t('Common.StatusPending')}</Badge>;
      case 'New':
        return <Badge color="info">{t('Common.statusNew')}</Badge>;
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

      <Row className="mb-3">
        <Col lg="12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <InputGroup className="search-input-group">
              <Input
                type="text"
                placeholder={t('Common.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <div className="d-flex align-items-center gap-2">
              <ButtonGroup className="rounded me-2">
                <Button
                  color={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  className="d-inline-flex align-items-center rounded-start"
                  onClick={() => setViewMode('list')}
                  title={t('CompanyClientsList.viewList')}
                >
                  <i className="bx bx-list-ul" />
                </Button>
                <Button
                  color={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  className="d-inline-flex align-items-center rounded-end"
                  onClick={() => setViewMode('grid')}
                  title={t('CompanyClientsList.viewGrid')}
                >
                  <i className="bx bx-grid-alt" />
                </Button>
              </ButtonGroup>
              <Button
                color="primary"
                className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                onClick={handleOpenCreateModal}
              >
                <i className="bx bx-plus me-1"></i>
                {t('NewClients.createClient')}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {viewMode === 'list' && (
          <>
            <Col lg="4" md="5" className="mb-3">
              <Card className="h-100">
                <CardBody className="p-0">
                  {paginatedClients.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {paginatedClients.map((client) => {
                        const createdDate = new Date(client.createdAt);
                        const isActive = selectedClient?.id === client.id;

                        return (
                          <button
                            key={client.id}
                            type="button"
                            className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${
                              isActive ? 'active' : ''
                            }`}
                            onClick={() => handleSelectClient(client)}
                          >
                            <div className="avatar-xs flex-shrink-0">
                              <span
                                className={`avatar-title rounded-circle ${getAvatarColor(client.name)} ${
                                  isActive ? 'border border-2 border-white' : ''
                                }`}
                              >
                                {getInitials(client.name)}
                              </span>
                            </div>
                            <div className="flex-grow-1 text-start">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-0 text-truncate">{client.name}</h6>
                                  <small className="text-muted d-block text-truncate">{client.email}</small>
                                </div>
                                <small className="text-muted ms-2">
                                  {createdDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </small>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mt-1">
                                <small className="text-muted">{client.phone}</small>
                                <div>{getStatusBadge(client.status)}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-0">{t('NewClients.noClientsFound')}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            <Col lg="8" md="7" className="mb-3">
              <Card className="h-100">
                <CardBody>
                  {selectedClient ? (
                    (() => {
                      const fullAddress = [
                        selectedClient.buildingAddress,
                        selectedClient.streetAddress,
                        selectedClient.city,
                        selectedClient.state,
                        selectedClient.country,
                      ]
                        .filter(Boolean)
                        .join(', ');
                      const startDate = new Date(selectedClient.createdAt);

                      return (
                        <>
                          <div className="d-flex justify-content-between align-items-start mb-4">
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="avatar-lg rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                style={{ backgroundColor: '#34c38f', minWidth: 56, minHeight: 56 }}
                              >
                                {getInitials(selectedClient.name)}
                              </div>
                              <div>
                                <h4 className="mb-1">{selectedClient.name}</h4>
                                <div className="d-flex align-items-center gap-2">
                                  {getTypeBadge(selectedClient.type)}
                                  <span className="text-muted">#{selectedClient.id}</span>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                color="secondary"
                                size="sm"
                                className="d-inline-flex align-items-center"
                                onClick={handleOpenCreateModal}
                              >
                                <i className="mdi mdi-pencil me-1" />
                                {t('Common.edit')}
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                outline
                                className="d-inline-flex align-items-center"
                              >
                                <i className="mdi mdi-delete me-1" />
                                {t('Common.delete')}
                              </Button>
                            </div>
                          </div>

                          <Row className="mb-4">
                            <Col md="4" className="mb-3">
                              <Label className="form-label fw-semibold text-muted">{t('NewClients.clientId')}</Label>
                              <p className="mb-0 text-dark">{selectedClient.id}</p>
                            </Col>
                            <Col md="4" className="mb-3">
                              <Label className="form-label fw-semibold text-muted">{t('Common.email')}</Label>
                              <p className="mb-0 text-dark">{selectedClient.email}</p>
                            </Col>
                            <Col md="4" className="mb-3">
                              <Label className="form-label fw-semibold text-muted">{t('Common.phone')}</Label>
                              <p className="mb-0 text-dark">{selectedClient.phone}</p>
                            </Col>
                            <Col md="4" className="mb-3">
                              <Label className="form-label fw-semibold text-muted">{t('Common.address')}</Label>
                              <p className="mb-0 text-dark">{fullAddress || '—'}</p>
                            </Col>
                            <Col md="4" className="mb-3">
                              <Label className="form-label fw-semibold text-muted">{t('NewClients.joinedDate')}</Label>
                              <p className="mb-0 text-dark">
                                {startDate.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </Col>
                          </Row>

                          <Row>
                            <Col md="12" className="mb-3">
                              <Label className="form-label fw-semibold text-muted">
                                {t('NewClients.labels.description')}
                              </Label>
                              <p className="mb-0 text-dark">
                                {selectedClient.description || t('Common.noDataAvailable')}
                              </p>
                            </Col>
                          </Row>
                        </>
                      );
                    })()
                  ) : (
                    <div className="text-center py-5">
                      <h5 className="mb-2">{t('CompanyClientsList.selectClientTitle')}</h5>
                      <p className="text-muted mb-0">{t('CompanyClientsList.selectClientDescription')}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </>
        )}

        {viewMode === 'grid' && (
          <Col lg="12">
            <Row className="g-3">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <Col key={client.id} lg="4" md="6">
                    <Card className="h-100">
                      <CardBody>
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar-md me-3">
                            <span className={`avatar-title rounded-circle ${getAvatarColor(client.name)}`}>
                              {getInitials(client.name)}
                            </span>
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="mb-1">{client.name}</h5>
                            <p className="text-muted mb-0">{client.email}</p>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">{t('Common.phone')}</span>
                          <span className="fw-semibold">{client.phone}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">{t('NewClients.totalAmount')}</span>
                          <Badge color="primary" className="d-inline-flex align-items-center">
                            <i className="bx bx-rupee me-1" />
                            {client.totalAmount.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted small">{t('NewClients.status')}</span>
                          {getStatusBadge(client.status)}
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <Button
                            color="primary"
                            size="sm"
                            className="d-inline-flex align-items-center"
                            onClick={() => handleSelectClient(client)}
                          >
                            <i className="mdi mdi-eye me-1" />
                            {t('Common.view')}
                          </Button>
                          <small className="text-muted">
                            {new Date(client.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </small>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs="12">
                  <div className="text-center py-4">
                    <p className="text-muted mb-0">{t('NewClients.noClientsFound')}</p>
                  </div>
                </Col>
              )}
            </Row>
          </Col>
        )}
      </Row>

      {filteredClients.length > 0 && (
        <Pagination
          className="mt-0"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      <Modal isOpen={createModalOpen} toggle={handleCloseCreateModal} size="lg">
        <ModalHeader toggle={handleCloseCreateModal}>
          {t('NewClients.createClient')}
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
          <Button color="secondary" onClick={handleCloseCreateModal}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleCreateClient}>
            {t('NewClients.createClient')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CompanyClientsList;
