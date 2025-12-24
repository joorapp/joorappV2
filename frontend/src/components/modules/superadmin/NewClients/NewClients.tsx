/**
 * @author Ananthapadmanabhan V K
 * New clients component for the application
 * This component is the new clients page for the application
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Button, Badge, Input, InputGroup, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormFeedback } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { showErrorToast, showSuccessToast } from '../../../../core/utils/toast';
import SuperAdminService from '../../../../core/service/SuperAdminService';
import { validateEmail, validatePhone, validateRequired } from '../../../../core/utils/Utils';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  plan: string;
}

const NewClients = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [clientForPlan, setClientForPlan] = useState<Client | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [currentClientPlan, setCurrentClientPlan] = useState('Essential');
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: null as { file: File; preview: string | ArrayBuffer | null } | null,
  });
  const [editClient, setEditClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: null as { file: File; preview: string | ArrayBuffer | null } | null,
  });

  const [clients, setClients] = useState<Client[]>([]);
  
  // Client form validation interfaces and function
  interface ClientFormData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }

  interface ClientValidationResult {
    isValid: boolean;
    errors: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  }

  // Form-specific validator - uses common validators from Utils.ts
  const validateClientForm = (formData: ClientFormData): ClientValidationResult => {
    const errors: ClientValidationResult['errors'] = {};
    let isValid = true;

    // Validate name
    const nameValidation = validateRequired(formData.name, 'name');
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage;
      isValid = false;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errorMessage;
      isValid = false;
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.errorMessage;
      isValid = false;
    }

    // Validate address
    const addressValidation = validateRequired(formData.address, 'address');
    if (!addressValidation.isValid) {
      errors.address = addressValidation.errorMessage;
      isValid = false;
    }

    return { isValid, errors };
  };
  
  // Validation errors state for create form
  const [createFormErrors, setCreateFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>({});
  
  // Validation errors state for edit form
  const [editFormErrors, setEditFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>({});

  // Get initials from client name
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      // Get first letter of first two words
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    // Get first two letters if single word
    return name.substring(0, 2).toUpperCase();
  };

  // Generate color based on name (consistent color for same name)
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-primary',
      'bg-success',
      'bg-info',
      'bg-warning',
      'bg-danger',
      'bg-secondary',
      'bg-dark',
      'bg-light text-dark',
    ];
    // Simple hash function to get consistent color for same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-success">{t('NewClients.statusActive')}</Badge>;
      case 'Pending':
        return <Badge className="bg-warning">{t('NewClients.statusPending')}</Badge>;
      case 'Inactive':
        return <Badge className="bg-danger">{t('NewClients.statusInactive')}</Badge>;
      case 'New':
        return <Badge className="bg-info">{t('NewClients.statusNew')}</Badge>;
      default:
        return <Badge className="bg-secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'Basic':
        return <Badge className="bg-warning">{t('NewClients.planBasic')}</Badge>;
      case 'Premium':
        return <Badge className="bg-success">{t('NewClients.planPremium')}</Badge>;
      case 'Diamond':
        return <Badge className="bg-pink">{t('NewClients.planDiamond')}</Badge>;
      case 'Plan':
        return <Button color="primary" className="py-1 px-2 border-0">
          <i className="mdi mdi-plus"></i> {t('NewClients.addPlan')}
        </Button>;
      default:
        return <Badge className="bg-secondary">{plan}</Badge>;
    }
  };

  // Helper function to close create modal and reset form/errors
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      description: '',
      logo: null,
    });
    setCreateFormErrors({});
  };

  // Helper function to close edit modal and reset form/errors
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingClient(null);
    setEditClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      logo: null,
    });
    setEditFormErrors({});
  };

  const handleCreateClient = async () => {
    // Validate form fields using the validation utility
    const validation = validateClientForm({
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      address: newClient.address,
    });

    if (!validation.isValid) {
      // Set all validation errors to display under fields
      setCreateFormErrors(validation.errors);
      return;
    }

    // Clear errors if validation passes
    setCreateFormErrors({});
    setIsCreatingClient(true);

    try {
      // Extract base64 string from data URL (remove data:image/...;base64, prefix)
      let logoBase64: string | null = null;
      if (newClient.logo && newClient.logo.preview) {
        const preview = newClient.logo.preview as string;
        // If it's a data URL, extract just the base64 part
        if (preview.startsWith('data:')) {
          logoBase64 = preview.split(',')[1] || preview;
        } else {
          logoBase64 = preview;
        }
      }

      const companyData = {
        name: newClient.name,
        description: newClient.description || '',
        isActive: true,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address,
        logo: logoBase64,
      };
      console.log(companyData);
      // return;
      const response = await SuperAdminService.createCompany(companyData);

      // On success, add the new client to the list
      if (response?.data) {
        const newClientData = response.data;
        const client: Client = {
          id: newClientData.id || String(clients.length + 1),
          name: newClientData.name || newClient.name,
          email: newClientData.email || newClient.email,
          phone: newClientData.phone || newClient.phone,
          address: newClientData.address || newClient.address,
          description: newClientData.description || newClient.description || '',
          status: newClientData.status || 'New',
          createdAt: newClientData.createdAt || new Date().toISOString(),
          updatedAt: newClientData.updatedAt || new Date().toISOString(),
          plan: newClientData.plan || '',
        };

        setClients([...clients, client]);
        showSuccessToast(t('NewClients.clientCreatedSuccessfully') || 'Client created successfully');
        
        handleCloseCreateModal(); // Close modal and clear form/errors
      }
    } catch (error: any) {
      // Error toast is already handled by the interceptor
      // Just log for debugging if needed
      console.error('Error creating client:', error);
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleInputChange = (field: string, value: string | { file: File; preview: string | ArrayBuffer | null }) => {
    setNewClient(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (createFormErrors[field as keyof typeof createFormErrors]) {
      setCreateFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof createFormErrors];
        return newErrors;
      });
    }
  };

  const handleEditInputChange = (field: string, value: string | { file: File; preview: string | ArrayBuffer | null }) => {
    setEditClient(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (editFormErrors[field as keyof typeof editFormErrors]) {
      setEditFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof editFormErrors];
        return newErrors;
      });
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setEditClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      logo: null,
    });
    setEditFormErrors({}); // Clear errors when opening edit modal
    setEditModalOpen(true);
  };

  const handleUpdateClient = () => {
    if (!editingClient) {
      showErrorToast(t('Common.errors.fillAllFields'));
      return;
    }

    // Validate form fields using the validation utility
    const validation = validateClientForm({
      name: editClient.name,
      email: editClient.email,
      phone: editClient.phone,
      address: editClient.address,
    });

    if (!validation.isValid) {
      // Set all validation errors to display under fields
      setEditFormErrors(validation.errors);
      return;
    }

    // Clear errors if validation passes
    setEditFormErrors({});

    setClients(clients.map(client =>
      client.id === editingClient.id
        ? {
            ...client,
            name: editClient.name,
            email: editClient.email,
            phone: editClient.phone,
            address: editClient.address,
            updatedAt: new Date().toISOString()
          }
        : client
    ));

    handleCloseEditModal(); // Close modal and clear form/errors
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      setClients(clients.filter(client => client.id !== clientToDelete.id));
      setDeleteModalOpen(false);
      setClientToDelete(null);
    }
  };

  const handleAddPlan = (client: Client) => {
    setClientForPlan(client);
    setSelectedPlan('');
    // Map client plan to display plan names
    const planDisplayMap: { [key: string]: string } = {
      'Basic': 'Essential',
      'Premium': 'Standard',
      'Diamond': 'Professional',
      'Enterprise': 'Enterprise',
      'Plan': 'Essential'
    };
    setCurrentClientPlan(planDisplayMap[client.plan] || 'Essential');
    setPlanModalOpen(true);
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handleAssignPlan = () => {
    if (!clientForPlan || !selectedPlan) {
      showErrorToast(t('Common.errors.selectPlan'));
      return;
    }

    // Map display plan names to stored plan names: Essential -> Basic, Standard -> Premium, Professional -> Diamond, Enterprise -> Enterprise
    const planMap: { [key: string]: string } = {
      'Essential': 'Basic',
      'Standard': 'Premium',
      'Professional': 'Diamond',
      'Enterprise': 'Enterprise'
    };
    const mappedPlan = planMap[selectedPlan] || selectedPlan;

    // Update the client's plan
    setClients(clients.map(client =>
      client.id === clientForPlan.id
        ? { ...client, plan: mappedPlan }
        : client
    ));

    setPlanModalOpen(false);
    setClientForPlan(null);
    setSelectedPlan('');
    setCurrentClientPlan('Essential');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Breadcrumbs title={t('Navigation.clients')} breadcrumbItem={t('Navigation.newClients')} />


      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <InputGroup className="search-input-group">
                  <Input
                    type="text"
                    placeholder={t('Common.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Button
                  color="primary"
                  className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <i className="bx bx-plus me-1"></i>
                  {t('NewClients.newClient')}
                </Button>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>
                      </th>
                      <th>{t('NewClients.clientName')}</th>
                      <th>{t('Common.phone')}</th>
                      <th>{t('NewClients.freeUsing')}</th>
                      <th>{t('NewClients.status')}</th>
                      <th>{t('NewClients.joinedDate')}</th>
                      <th>{t('NewClients.plan')}</th>
                      <th>{t('NewClients.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <tr key={client.id}>
                          <td>
                            <div className="avatar-xs">
                              <span className={`avatar-title rounded-circle ${getAvatarColor(client.name)}`}>
                                {getInitials(client.name)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong>  {client.name} </strong>
                            <p className="text-muted d-block mb-0">{client.email}</p>
                          </td>
                          <td>{client.phone}</td>
                          <td>07 {t('NewClients.daysRemaining')}</td>
                          <td><Badge className="bg-info">{client.status}</Badge></td>
                          <td>{new Date(client.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td>
                            <Button
                              color="primary"
                              className="py-1 px-2 border-0"
                              onClick={() => handleAddPlan(client)}
                            >
                              <i className="mdi mdi-plus"></i> {t('NewClients.addPlan')}
                            </Button>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                color="outline-primary"
                                className="p-1 border-0"
                                title={t('Common.view')}
                                onClick={() => {
                                  setSelectedClient(client);
                                  setModalOpen(true);
                                }}
                              >
                                <i className="mdi mdi-eye"></i>
                              </Button>
                              <Button
                                color="outline-secondary"
                                className="p-1 border-0"
                                title={t('Common.edit')}
                                onClick={() => handleEditClient(client)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="p-1 border-0"
                                title={t('Common.delete')}
                                onClick={() => handleDeleteClick(client)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          <p className="text-muted mb-0">{t('NewClients.noClientsFound')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Client Details Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          {t('NewClients.modal.clientDetails')}
        </ModalHeader>
        <ModalBody>
          {selectedClient && (
            <div className="row m-0">
              <div className="col-md-12 mb-0">
                <div className="d-flex align-items-center mb-0">
                  <div className="avatar-lg me-3">
                    <span className={`avatar-title rounded-circle ${getAvatarColor(selectedClient.name)}`}>
                      {getInitials(selectedClient.name)}
                    </span>
                  </div>
                  <div>
                    <h5 className="mb-2">{selectedClient.name}</h5>
                    <p className="text-muted mb-0">{getPlanBadge(selectedClient.plan)}</p>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <hr />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.address')}</label>
                <p className="mb-0">{selectedClient.address}</p>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.email')}</label>
                <p className="mb-0">{selectedClient.email}</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.phone')}</label>
                <p className="mb-0">{selectedClient.phone}</p>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.status')}</label>
                <div>
                  {getStatusBadge(selectedClient.status)}
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('NewClients.joinedDate')}</label>
                <p className="mb-0">
                  {new Date(selectedClient.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('NewClients.modal.lastUpdated')}</label>
                <p className="mb-0">
                  {new Date(selectedClient.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>


            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create New Client Modal */}
      <Modal isOpen={createModalOpen} toggle={handleCloseCreateModal} size="md" centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {t('NewClients.createClient')}
        </ModalHeader>
        <ModalBody>
          <div className="row m-0">
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
                    <circle cx="40" cy="40" r="40" fill="#e1e7ef"/>
                    <circle cx="40" cy="32" r="14" fill="#ced6df"/>
                    <ellipse cx="40" cy="60" rx="22" ry="14" fill="#ced6df"/>
                  </svg>
                )}

                <div className="profile-upload-button">
                  <i className="mdi mdi-camera text-primary"  />
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
                      reader.onload = function(ev) {
                        handleInputChange('logo', {
                          file,
                          preview: ev.target?.result || null
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="profile-upload-helper-text">{t('NewClients.uploadProfilePhoto')}</div>
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.clientName')} <span className="text-danger">*</span></Label>
              <Input
                type="text"
                value={newClient.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('NewClients.enterClientName')}
                invalid={!!createFormErrors.name}
              />
              {createFormErrors.name && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.name)}
                </FormFeedback>
              )}
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.email')} <span className="text-danger">*</span></Label>
              <Input
                type="email"
                value={newClient.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('NewClients.enterEmailAddress')}
                invalid={!!createFormErrors.email}
              />
              {createFormErrors.email && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.email)}
                </FormFeedback>
              )}
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.phone')} <span className="text-danger">*</span></Label>
              <Input
                type="tel"
                value={newClient.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('NewClients.enterPhoneNumber')}
                invalid={!!createFormErrors.phone}
              />
              {createFormErrors.phone && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.phone)}
                </FormFeedback>
              )}
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.address')} <span className="text-danger">*</span></Label>
              <Input
                type="text"
                value={newClient.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={t('NewClients.enterAddress')}
                invalid={!!createFormErrors.address}
              />
              {createFormErrors.address && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.address)}
                </FormFeedback>
              )}
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.description')}</Label>
              <Input
                type="textarea"
                rows={3}
                value={newClient.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('NewClients.enterDescription')}
              />
            </div>

          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateClient} disabled={isCreatingClient}>
            {isCreatingClient ? t('Common.loading') || 'Loading...' : t('NewClients.createClient')}
          </Button>
          <Button color="secondary" onClick={handleCloseCreateModal}>
            {t('Common.cancel')}
          </Button>
          
        </ModalFooter>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={editModalOpen} toggle={handleCloseEditModal} size="md" centered>
        <ModalHeader toggle={handleCloseEditModal}>
          {t('NewClients.editClient')}
        </ModalHeader>
        <ModalBody>
          <div className="row m-0">
            <div className="col-md-12 mb-4 d-flex flex-column align-items-center">
              <Label className="form-label fw-semibold mb-2">{t('NewClients.profilePhoto')}</Label>
              <div
                className="profile-photo-upload position-relative d-flex align-items-center justify-content-center"
                onClick={() => document.getElementById('edit-client-profile-upload-input')?.click()}
              >
                {editClient.logo && editClient.logo.preview ? (
                  <img
                    src={editClient.logo.preview as string}
                    alt="Profile"
                  />
                ) : (
                  <svg width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="40" fill="#e1e7ef"/>
                    <circle cx="40" cy="32" r="14" fill="#ced6df"/>
                    <ellipse cx="40" cy="60" rx="22" ry="14" fill="#ced6df"/>
                  </svg>
                )}

                <div className="profile-upload-button">
                  <svg height="20" width="20" fill="#0d6efd" viewBox="0 0 24 24">
                    <path d="M5 20h14v-2c0-2.2-2.8-4-7-4s-7 1.8-7 4v2zm7-12a4 4 0 1 1 0 8a4 4 0 0 1 0-8zm0-2a6 6 0 1 0 0 12a6 6 0 0 0 0-12zm-7 16h14a2 2 0 0 0 2-2v-2c0-3.31-4.42-6-9-6s-9 2.69-9 6v2a2 2 0 0 0 2 2z"/>
                  </svg>
                </div>
                <input
                  id="edit-client-profile-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = function(ev) {
                        handleEditInputChange('logo', {
                          file,
                          preview: ev.target?.result || null
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="profile-upload-helper-text">{t('NewClients.uploadProfilePhoto')}</div>
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.clientName')} <span className="text-danger">*</span></Label>
              <Input
                type="text"
                value={editClient.name}
                onChange={(e) => handleEditInputChange('name', e.target.value)}
                placeholder={t('NewClients.enterClientName')}
                invalid={!!editFormErrors.name}
              />
              {editFormErrors.name && (
                <FormFeedback type="invalid">
                  {t(editFormErrors.name)}
                </FormFeedback>
              )}
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.email')} <span className="text-danger">*</span></Label>
              <Input
                type="email"
                value={editClient.email}
                onChange={(e) => handleEditInputChange('email', e.target.value)}
                placeholder={t('NewClients.enterEmailAddress')}
                invalid={!!editFormErrors.email}
              />
              {editFormErrors.email && (
                <FormFeedback type="invalid">
                  {t(editFormErrors.email)}
                </FormFeedback>
              )}
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.phone')} <span className="text-danger">*</span></Label>
              <Input
                type="tel"
                value={editClient.phone}
                onChange={(e) => handleEditInputChange('phone', e.target.value)}
                placeholder={t('NewClients.enterPhoneNumber')}
                invalid={!!editFormErrors.phone}
              />
              {editFormErrors.phone && (
                <FormFeedback type="invalid">
                  {t(editFormErrors.phone)}
                </FormFeedback>
              )}
            </div>
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('NewClients.labels.address')} <span className="text-danger">*</span></Label>
              <Input
                type="text"
                value={editClient.address}
                onChange={(e) => handleEditInputChange('address', e.target.value)}
                placeholder={t('NewClients.enterAddress')}
                invalid={!!editFormErrors.address}
              />
              {editFormErrors.address && (
                <FormFeedback type="invalid">
                  {t(editFormErrors.address)}
                </FormFeedback>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseEditModal}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleUpdateClient}>
            {t('NewClients.updateClient')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(!deleteModalOpen)} centered>

        <ModalBody>
          <div className="text-center p-4">
            <div className="mb-3">
              <i className="mdi mdi-alert-circle-outline delete-confirm-icon"></i>
            </div>
            <h4 className="mb-3">{t('NewClients.areYouSure')}</h4>
            <p className="text-muted mb-0">
              {t('NewClients.deleteConfirmation')} <strong>{clientToDelete?.name}</strong>? <br></br>
              {t('NewClients.cannotBeUndone')}
            </p>
            <div className="d-flex gap-2 justify-content-center mt-3">
            <Button color="danger" onClick={handleConfirmDelete}>
                {t('Common.delete')}
              </Button>
              <Button color="secondary" onClick={() => {
                setDeleteModalOpen(false);
                setClientToDelete(null);
              }}>
                {t('Common.cancel')}
              </Button>
              
            </div>
          </div>
        </ModalBody>

      </Modal>

      {/* Add Plan Modal */}
      <Modal
        isOpen={planModalOpen}
        toggle={() => setPlanModalOpen(!planModalOpen)}
        size="xl"
        centered
        className="pricing-modal"
      >
        <ModalHeader toggle={() => setPlanModalOpen(!planModalOpen)} className="border-0 pb-2">
          <div className="text-center w-100">
            <h4 className="mb-2 fw-bold">{t('NewClients.planForEveryTeam')}</h4>
            <p className="text-muted mb-0">{t('NewClients.getStartedFree')}</p>
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          <div className="row g-4">
            {/* Essential Plan */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div
                className={`pricing-plan-card ${selectedPlan === 'Essential' ? 'selected' : ''}`}
                onClick={() => handlePlanSelect('Essential')}
              >
                <div className="plan-border essential"></div>
                <div className="plan-content">
                  <div className="plan-visual essential-visual">
                    <svg className="plan-line" viewBox="0 0 120 90" preserveAspectRatio="none">
                      <path d="M 10 45 Q 30 35, 50 40 T 90 45" stroke="#ddd" strokeWidth="1.5" strokeDasharray="3,3" fill="none"/>
                    </svg>
                    <div className="shape-circle"></div>
                  </div>
                  <h5 className="plan-name">{t('NewClients.planBasic')}</h5>
                  <div className="plan-price-section">
                    <div className="plan-price-main">USD $0</div>
                  </div>
                  <p className="plan-description">{t('NewClients.planBasicDescription')}</p>
                  <Button
                    color="secondary"
                    className="w-100 plan-button"
                    outline
                    disabled={currentClientPlan === 'Essential' || currentClientPlan === 'Basic'}
                  >
                    {currentClientPlan === 'Essential' || currentClientPlan === 'Basic' ? t('NewClients.currentPlan') : t('NewClients.selectPlan')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Standard Plan (Most Popular) */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div
                className={`pricing-plan-card ${selectedPlan === 'Standard' ? 'selected' : ''}`}
                onClick={() => handlePlanSelect('Standard')}
              >
                <div className="plan-border standard"></div>
                <div className="plan-popular-badge">{t('NewClients.mostPopular')}</div>
                <div className="plan-content">
                  <div className="plan-visual standard-visual">
                    <svg className="plan-line" viewBox="0 0 120 90" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                      <path d="M 10 45 Q 30 35, 50 40 T 90 45" stroke="#ddd" strokeWidth="1.5" strokeDasharray="3,3" fill="none"/>
                    </svg>
                    <div className="shape-circle"></div>
                    <div className="shape-square"></div>
                  </div>
                  <h5 className="plan-name">{t('NewClients.planPremium')}</h5>
                  <div className="plan-price-section">
                    <div className="plan-price-main">USD $4.95</div>
                    <div className="plan-price-detail">{t('NewClients.perUserMonthBilledAnnually')}</div>
                    <div className="plan-price-monthly">$7.95 {t('NewClients.billedMonthly')}</div>
                  </div>
                  <p className="plan-description">{t('NewClients.planPremiumDescription')}</p>
                  <Button
                    color="success"
                    className="w-100 plan-button"
                  >
                    {t('NewClients.upgrade')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Professional Plan */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div
                className={`pricing-plan-card ${selectedPlan === 'Professional' ? 'selected' : ''}`}
                onClick={() => handlePlanSelect('Professional')}
              >
                <div className="plan-border professional"></div>
                <div className="plan-content">
                  <div className="plan-visual professional-visual">
                    <svg className="plan-line" viewBox="0 0 120 90" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                      <path d="M 10 45 Q 30 35, 50 40 T 90 45" stroke="#ddd" strokeWidth="1.5" strokeDasharray="3,3" fill="none"/>
                    </svg>
                    <div className="shape-circle"></div>
                    <div className="shape-square"></div>
                    <div className="shape-triangle"></div>
                  </div>
                  <h5 className="plan-name">{t('NewClients.planDiamond')}</h5>
                  <div className="plan-price-section">
                    <div className="plan-price-main">USD $9.95</div>
                    <div className="plan-price-detail">{t('NewClients.perUserMonthBilledAnnually')}</div>
                    <div className="plan-price-monthly">$14.95 {t('NewClients.billedMonthly')}</div>
                  </div>
                  <p className="plan-description">{t('NewClients.planDiamondDescription')}</p>
                  <Button
                    color="warning"
                    className="w-100 plan-button"
                  >
                    {t('NewClients.upgrade')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div
                className={`pricing-plan-card ${selectedPlan === 'Enterprise' ? 'selected' : ''}`}
                onClick={() => handlePlanSelect('Enterprise')}
              >
                <div className="plan-border enterprise"></div>
                <div className="plan-content">
                  <div className="plan-visual enterprise-visual">
                    <svg className="plan-line" viewBox="0 0 120 90" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                      <path d="M 10 45 Q 30 35, 50 40 T 90 45" stroke="#ddd" strokeWidth="1.5" strokeDasharray="3,3" fill="none"/>
                    </svg>
                    <div className="shape-triangle red"></div>
                    <div className="shape-circle orange"></div>
                    <div className="shape-square blue"></div>
                  </div>
                  <h5 className="plan-name">{t('NewClients.enterprise')}</h5>
                  <div className="plan-price-section">
                    <div className="plan-price-main">{t('NewClients.customPricing')}</div>
                  </div>
                  <p className="plan-description">{t('NewClients.enterpriseDescription')}</p>
                  <Button
                    color="primary"
                    className="w-100 plan-button"
                    outline
                  >
                    <i className="mdi mdi-account-group me-1"></i>
                    {t('NewClients.contactUs')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button color="secondary" onClick={() => {
            setPlanModalOpen(false);
            setClientForPlan(null);
            setSelectedPlan('');
            setCurrentClientPlan('Essential');
          }}>
            {t('Common.cancel')}
          </Button>
          {selectedPlan && selectedPlan !== currentClientPlan && (
            <Button 
              color="primary" 
              onClick={handleAssignPlan}
            >
              {selectedPlan === 'Enterprise' ? t('NewClients.contactUs') : t('NewClients.assignPlan')}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default NewClients;

