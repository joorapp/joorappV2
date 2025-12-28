/**
 * @author Auto-generated
 * Subscription Plans component for the application
 * This component is the subscription plans management page for the application
 * TEMPORARY: Dummy data for table design preview only
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Badge, Input, InputGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormFeedback } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { showSuccessToast } from '../../../../core/utils/toast';

interface SubscriptionPlan {
  id: string;
  planName: string;
  planCode?: string;
  price: string;
  billingCycle: string;
  features: string;
  status: string;
  subscribers: number;
  revenue: string;
  createdDate: string;
}

const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [editFormData, setEditFormData] = useState<{
    planName: string;
    planCode: string;
    price: string;
    billingCycle: string;
    description: string;
    features: string;
    badge: string;
    status: string;
    limits: {
      users: string;
      projects: string;
      stores: string;
      clients: string;
      suppliers: string;
      staff: string;
      materials: string;
      vehicles: string;
      storage: string;
    };
    modules: string[];
  } | null>(null);
  const [createFormData, setCreateFormData] = useState({
    planName: '',
    planCode: '',
    price: '',
    billingCycle: 'Monthly',
    description: '',
    features: '',
    badge: 'noBadge',
    status: 'Active',
    limits: {
      users: '',
      projects: '',
      stores: '',
      clients: '',
      suppliers: '',
      staff: '',
      materials: '',
      vehicles: '',
      storage: '',
    },
    modules: [] as string[],
  });
  const [createFormErrors, setCreateFormErrors] = useState<{
    planName?: string;
    planCode?: string;
    price?: string;
  }>({});

  // TEMPORARY: Dummy data for table design preview
  const initialDummyPlans: SubscriptionPlan[] = [
    {
      id: '1',
      planCode: 'BA_M01',
      planName: 'Basic Plan',
      price: '9.99',
      billingCycle: 'Monthly',
      features: 'Up to 5 users, 10GB storage, Basic support',
      status: 'Active',
      subscribers: 145,
      revenue: '$1,448.55',
      createdDate: new Date('2024-01-15').toISOString(),
    },
    {
      id: '2',
      planCode: 'PP_M01',
      planName: 'Professional Plan',
      price: '29.99',
      billingCycle: 'Monthly',
      features: 'Up to 25 users, 100GB storage, Priority support',
      status: 'Active',
      subscribers: 89,
      revenue: '$2,669.11',
      createdDate: new Date('2024-01-15').toISOString(),
    },
    {
      id: '3',
      planCode: 'EP_M01',
      planName: 'Enterprise Plan',
      price: '99.99',
      billingCycle: 'Monthly',
      features: 'Unlimited users, 1TB storage, 24/7 support',
      status: 'Active',
      subscribers: 34,
      revenue: '$3,399.66',
      createdDate: new Date('2024-01-15').toISOString(),
    },
    {
      id: '4',
      planCode: 'BA_Y01',
      planName: 'Basic Annual',
      price: '99.99',
      billingCycle: 'Yearly',
      features: 'Up to 5 users, 10GB storage, Basic support',
      status: 'Active',
      subscribers: 72,
      revenue: '$7,199.28',
      createdDate: new Date('2024-02-01').toISOString(),
    },
    {
      id: '5',
      planCode: 'PA_Y01',
      planName: 'Professional Annual',
      price: '299.99',
      billingCycle: 'Yearly',
      features: 'Up to 25 users, 100GB storage, Priority support',
      status: 'Active',
      subscribers: 56,
      revenue: '$16,799.44',
      createdDate: new Date('2024-02-01').toISOString(),
    },
    {
      id: '6',
      planCode: 'SP_M01',
      planName: 'Starter Plan',
      price: '4.99',
      billingCycle: 'Monthly',
      features: 'Up to 2 users, 5GB storage, Community support',
      status: 'Inactive',
      subscribers: 0,
      revenue: '$0.00',
      createdDate: new Date('2023-12-10').toISOString(),
    },
    {
      id: '7',
      planCode: 'PP_M01',
      planName: 'Premium Plan',
      price: '49.99',
      billingCycle: 'Monthly',
      features: 'Up to 50 users, 250GB storage, Priority support',
      status: 'Active',
      subscribers: 23,
      revenue: '$1,149.77',
      createdDate: new Date('2024-03-15').toISOString(),
    },
    {
      id: '8',
      planCode: 'EA_Y01',
      planName: 'Enterprise Annual',
      price: '999.99',
      billingCycle: 'Yearly',
      features: 'Unlimited users, 1TB storage, 24/7 support',
      status: 'Active',
      subscribers: 18,
      revenue: '$17,999.82',
      createdDate: new Date('2024-02-01').toISOString(),
    },
  ];

  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialDummyPlans);

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return <Badge className="bg-success">{t('SubscriptionPlans.statusActive')}</Badge>;
    }
    return <Badge className="bg-danger">{t('SubscriptionPlans.statusInactive')}</Badge>;
  };

  const filteredPlans = plans.filter(plan => {
    const planName = plan.planName.toLowerCase();
    const planCode = (plan.planCode || '').toLowerCase();
    const features = plan.features.toLowerCase();
    const billingCycle = plan.billingCycle.toLowerCase();
    const search = searchTerm.toLowerCase();
    return planName.includes(search) || planCode.includes(search) || features.includes(search) || billingCycle.includes(search);
  });

  // View plan handler
  const handleView = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setViewModalOpen(true);
  };

  // Edit plan handler
  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    // Initialize edit form with plan data and defaults for extended fields
    setEditFormData({
      planName: plan.planName,
      planCode: '', // Will be extracted or default
      price: plan.price,
      billingCycle: plan.billingCycle,
      description: '',
      features: plan.features,
      badge: 'noBadge',
      status: plan.status,
      limits: {
        users: '',
        projects: '',
        stores: '',
        clients: '',
        suppliers: '',
        staff: '',
        materials: '',
        vehicles: '',
        storage: '',
      },
      modules: [],
    });
    setEditModalOpen(true);
  };

  // Delete plan handler
  const handleDelete = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedPlan) {
      setPlans(prev => prev.filter(plan => plan.id !== selectedPlan.id));
      showSuccessToast(t('SubscriptionPlans.planDeletedSuccessfully'));
      setDeleteModalOpen(false);
      setSelectedPlan(null);
    }
  };

  // Save edit
  const handleSaveEdit = () => {
    if (editFormData && selectedPlan) {
      // Basic validation
      if (!editFormData.planName.trim()) {
        return;
      }
      if (!editFormData.price.trim()) {
        return;
      }

      // Build features string from modules and limits
      let featuresText = editFormData.features.trim();
      if (editFormData.modules.length > 0) {
        const moduleNames = editFormData.modules.map(m => t(`SubscriptionPlans.modules.${m}`) || m).join(', ');
        featuresText = featuresText ? `${featuresText}. Modules: ${moduleNames}` : `Modules: ${moduleNames}`;
      }

      // Update plan with new data
      const updatedPlan: SubscriptionPlan = {
        ...selectedPlan,
        planName: editFormData.planName.trim(),
        price: editFormData.price.trim(),
        billingCycle: editFormData.billingCycle,
        features: featuresText,
        status: editFormData.status,
      };

      setPlans(prev => prev.map(plan => 
        plan.id === selectedPlan.id ? updatedPlan : plan
      ));
      showSuccessToast(t('SubscriptionPlans.planUpdatedSuccessfully'));
      setEditModalOpen(false);
      setEditFormData(null);
      setSelectedPlan(null);
    }
  };

  // Handle edit form input change
  const handleEditInputChange = (field: string, value: string) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
    }
  };

  // Handle edit limit change
  const handleEditLimitChange = (field: string, value: string) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        limits: {
          ...editFormData.limits,
          [field]: value,
        },
      });
    }
  };

  // Handle edit module toggle
  const handleEditModuleToggle = (module: string) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        modules: editFormData.modules.includes(module)
          ? editFormData.modules.filter(m => m !== module)
          : [...editFormData.modules, module],
      });
    }
  };

  // Handle create form input change
  const handleCreateInputChange = (field: string, value: string) => {
    setCreateFormData(prev => ({
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

  // Close create modal and reset form
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setCreateFormData({
      planName: '',
      planCode: '',
      price: '',
      billingCycle: 'Monthly',
      description: '',
      features: '',
      badge: 'noBadge',
      status: 'Active',
      limits: {
        users: '',
        projects: '',
        stores: '',
        clients: '',
        suppliers: '',
        staff: '',
        materials: '',
        vehicles: '',
        storage: '',
      },
      modules: [],
    });
    setCreateFormErrors({});
  };

  // Handle limit change
  const handleLimitChange = (field: string, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [field]: value,
      },
    }));
  };

  // Handle module toggle
  const handleModuleToggle = (module: string) => {
    setCreateFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter(m => m !== module)
        : [...prev.modules, module],
    }));
  };

  // Create plan handler
  const handleCreatePlan = () => {
    const errors: typeof createFormErrors = {};
    let isValid = true;

    // Validate plan name (required)
    if (!createFormData.planName.trim()) {
      errors.planName = 'Validation.nameRequired';
      isValid = false;
    } else if (createFormData.planName.length > 100) {
      errors.planName = 'Validation.nameMaxLength';
      isValid = false;
    }

    // Validate plan code (required)
    if (!createFormData.planCode.trim()) {
      errors.planCode = 'Validation.codeRequired';
      isValid = false;
    } else if (createFormData.planCode.length > 50) {
      errors.planCode = 'Validation.codeMaxLength';
      isValid = false;
    } else if (!/^[A-Z0-9_]+$/.test(createFormData.planCode)) {
      errors.planCode = 'Validation.codeInvalidFormat';
      isValid = false;
    }

    // Validate price (required)
    if (!createFormData.price.trim()) {
      errors.price = 'Validation.priceRequired';
      isValid = false;
    } else {
      // Check if price is a valid number
      const priceNum = parseFloat(createFormData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.price = 'Validation.priceInvalid';
        isValid = false;
      }
    }

    if (!isValid) {
      setCreateFormErrors(errors);
      return;
    }

    // Build features string from modules and limits
    let featuresText = createFormData.features.trim();
    if (createFormData.modules.length > 0) {
      const moduleNames = createFormData.modules.map(m => t(`SubscriptionPlans.modules.${m}`) || m).join(', ');
      featuresText = featuresText ? `${featuresText}. Modules: ${moduleNames}` : `Modules: ${moduleNames}`;
    }

    // Build limits summary for features if any limits are set
    const limitsSummary: string[] = [];
    if (createFormData.limits.users) limitsSummary.push(`${t('SubscriptionPlans.users')}: ${createFormData.limits.users}`);
    if (createFormData.limits.projects) limitsSummary.push(`${t('SubscriptionPlans.projects')}: ${createFormData.limits.projects}`);
    if (createFormData.limits.stores) limitsSummary.push(`${t('SubscriptionPlans.stores')}: ${createFormData.limits.stores}`);
    if (createFormData.limits.clients) limitsSummary.push(`${t('SubscriptionPlans.clients')}: ${createFormData.limits.clients}`);
    if (createFormData.limits.suppliers) limitsSummary.push(`${t('SubscriptionPlans.suppliers')}: ${createFormData.limits.suppliers}`);
    if (createFormData.limits.staff) limitsSummary.push(`${t('SubscriptionPlans.staff')}: ${createFormData.limits.staff}`);
    if (createFormData.limits.materials) limitsSummary.push(`${t('SubscriptionPlans.materials')}: ${createFormData.limits.materials}`);
    if (createFormData.limits.vehicles) limitsSummary.push(`${t('SubscriptionPlans.vehicles')}: ${createFormData.limits.vehicles}`);
    if (createFormData.limits.storage) limitsSummary.push(`${t('SubscriptionPlans.storage')}: ${createFormData.limits.storage}`);

    // Combine features, modules, and limits
    let finalFeaturesText = createFormData.features.trim();
    if (createFormData.modules.length > 0) {
      const moduleNames = createFormData.modules.map(m => t(`SubscriptionPlans.modules.${m}`) || m).join(', ');
      const modulesText = `Modules: ${moduleNames}`;
      finalFeaturesText = finalFeaturesText ? `${finalFeaturesText}. ${modulesText}` : modulesText;
    }
    if (limitsSummary.length > 0) {
      const limitsText = `Limits: ${limitsSummary.join(', ')}`;
      finalFeaturesText = finalFeaturesText ? `${finalFeaturesText}. ${limitsText}` : limitsText;
    }

    // Create new plan
    const newPlan: SubscriptionPlan = {
      id: String(Date.now()), // Simple ID generation for dummy data
      planName: createFormData.planName.trim(),
      planCode: createFormData.planCode.trim().toUpperCase(),
      price: createFormData.price.trim(),
      billingCycle: createFormData.billingCycle,
      features: finalFeaturesText || createFormData.description.trim() || '',
      status: createFormData.status,
      subscribers: 0,
      revenue: '$0.00',
      createdDate: new Date().toISOString(),
    };

    setPlans(prev => [...prev, newPlan]);
    showSuccessToast(t('SubscriptionPlans.planCreatedSuccessfully'));
    handleCloseCreateModal();
  };

  return (
    <>
      <Breadcrumbs title={t('Navigation.subscriptionPlans')} breadcrumbItem={t('Navigation.subscriptionPlans')} />

{/* Summary Cards */}
<div className="row mt-4">
        <div className="col-md-3">
          <Card className="mini-stats-wid">
            <CardBody>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <p className="text-muted fw-medium">Total Plans</p>
                  <h4 className="mb-0">{plans.length}</h4>
                </div>
                <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                  <span className="avatar-title rounded-circle bg-primary">
                    <i className="bx bx-package font-size-24 text-white"></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="mini-stats-wid">
            <CardBody>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <p className="text-muted fw-medium">Active Plans</p>
                  <h4 className="mb-0">
                    {plans.filter(p => p.status === 'Active').length}
                  </h4>
                </div>
                <div className="avatar-sm rounded-circle bg-success align-self-center mini-stat-icon">
                  <span className="avatar-title rounded-circle bg-success">
                    <i className="bx bx-check-circle font-size-24 text-white"></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="mini-stats-wid">
            <CardBody>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <p className="text-muted fw-medium">Total Subscribers</p>
                  <h4 className="mb-0">
                    {plans.reduce((sum, plan) => sum + plan.subscribers, 0)}
                  </h4>
                </div>
                <div className="avatar-sm rounded-circle bg-info align-self-center mini-stat-icon">
                  <span className="avatar-title rounded-circle bg-info">
                    <i className="bx bx-user font-size-24 text-white"></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="mini-stats-wid">
            <CardBody>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <p className="text-muted fw-medium">Total Revenue</p>
                  <h4 className="mb-0">$50,665.63</h4>
                </div>
                <div className="avatar-sm rounded-circle bg-warning align-self-center mini-stat-icon">
                  <span className="avatar-title rounded-circle bg-warning">
                    <i className="bx bx-dollar font-size-24 text-white"></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

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
                  {t('SubscriptionPlans.newPlan')}
                </Button>
              </div>
              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('SubscriptionPlans.planCode')}</th>
 
                      <th>{t('SubscriptionPlans.planName')}</th>
                      <th>{t('SubscriptionPlans.price')}</th>
                      <th>{t('SubscriptionPlans.billingCycle')}</th>
                      <th>{t('SubscriptionPlans.features')}</th>
                      <th>{t('SubscriptionPlans.subscribers')}</th>
                      <th>{t('SubscriptionPlans.revenue')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('SubscriptionPlans.createdDate')}</th>
                      <th>{t('Common.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.length > 0 ? (
                      filteredPlans.map((plan) => (
                        <tr key={plan.id}>
                          <td>
                          {plan.planCode}
                          </td>
                          <td>
                            <h5 className="mb-0 font-size-14">{plan.planName}</h5>
                          </td>
                          
                          <td>
                            <span className="text-success fw-bold">${plan.price}</span>
                          </td>
                          <td>
                            <Badge className="bg-info">{plan.billingCycle}</Badge>
                          </td>
                          <td>
                            <p className="mb-0 text-muted" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={plan.features}>
                              {plan.features || '-'}
                            </p>
                          </td>
                          <td>
                            <Badge className="bg-primary">{plan.subscribers}</Badge>
                          </td>
                          <td>
                            <span className="fw-medium">{plan.revenue}</span>
                          </td>
                          <td>{getStatusBadge(plan.status)}</td>
                          <td>
                            {new Date(plan.createdDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                color="outline-primary"
                                className="p-1 border-0"
                                title={t('Common.view')}
                                onClick={() => handleView(plan)}
                              >
                                <i className="mdi mdi-eye"></i>
                              </Button>
                              <Button
                                color="outline-success"
                                className="p-1 border-0"
                                title={t('Common.edit')}
                                onClick={() => handleEdit(plan)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="p-1 border-0"
                                title={t('Common.delete')}
                                onClick={() => handleDelete(plan)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center py-4">
                          <p className="text-muted mb-0">{t('SubscriptionPlans.noPlansFound')}</p>
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

      {/* View Plan Modal */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>
          {t('SubscriptionPlans.modal.planDetails')}
        </ModalHeader>
        <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedPlan && (
            <div className="row m-0">
              {/* Basic Information */}
              <div className="col-12 mb-3">
                <h6 className="text-muted mb-3">Basic Information</h6>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.planName')}</label>
                <p className="mb-0">{selectedPlan.planName}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.planCode')}</label>
                <p className="mb-0">
                  <Badge className="bg-info">N/A</Badge>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.price')}</label>
                <p className="mb-0">
                  <span className="text-success fw-bold">${selectedPlan.price}</span>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.billingCycle')}</label>
                <p className="mb-0">
                  <Badge className="bg-info">{selectedPlan.billingCycle}</Badge>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.labels.badge')}</label>
                <p className="mb-0">
                  <Badge className="bg-secondary">{t('SubscriptionPlans.noBadge')}</Badge>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.status')}</label>
                <div>{getStatusBadge(selectedPlan.status)}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.subscribers')}</label>
                <p className="mb-0">
                  <Badge className="bg-primary">{selectedPlan.subscribers}</Badge>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.revenue')}</label>
                <p className="mb-0 fw-medium">{selectedPlan.revenue}</p>
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.description')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.features')}</label>
                <p className="mb-0">{selectedPlan.features || '-'}</p>
              </div>

              {/* Limits Section */}
              <div className="col-12 mb-3 mt-4">
                <h6 className="text-muted mb-3">{t('SubscriptionPlans.limits')}</h6>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.users')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.projects')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.stores')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.clients')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.suppliers')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.staff')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.materials')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.vehicles')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.storage')}</label>
                <p className="mb-0 text-muted">-</p>
              </div>

              {/* Modules Section */}
              <div className="col-12 mb-3 mt-4">
                <h6 className="text-muted mb-3">{t('SubscriptionPlans.modulesIncluded')}</h6>
                <p className="text-muted">-</p>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('SubscriptionPlans.createdDate')}</label>
                <p className="mb-0">
                  {new Date(selectedPlan.createdDate).toLocaleDateString('en-US', {
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
          <Button color="secondary" onClick={() => setViewModalOpen(false)}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(!editModalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>
          {t('SubscriptionPlans.editPlan')}
        </ModalHeader>
        <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {editFormData && (
            <div className="row m-0">
              {/* Basic Information */}
              <div className="col-12 mb-3">
                <h6 className="text-muted mb-3">Basic Information</h6>
              </div>
              
              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">
                  {t('SubscriptionPlans.labels.planName')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editFormData.planName}
                  onChange={(e) => handleEditInputChange('planName', e.target.value)}
                  placeholder={t('SubscriptionPlans.enterPlanName')}
                  maxLength={100}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">
                  {t('SubscriptionPlans.labels.planCode')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editFormData.planCode}
                  onChange={(e) => handleEditInputChange('planCode', e.target.value.toUpperCase())}
                  placeholder={t('SubscriptionPlans.enterPlanCode')}
                  maxLength={50}
                />
                <small className="text-muted">
                  {t('SubscriptionPlans.codeHint')}
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">
                  {t('SubscriptionPlans.labels.price')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editFormData.price}
                  onChange={(e) => handleEditInputChange('price', e.target.value)}
                  placeholder={t('SubscriptionPlans.enterPrice')}
                />
              </div>

              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">
                  {t('SubscriptionPlans.labels.billingPeriod')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  value={editFormData.billingCycle}
                  onChange={(e) => handleEditInputChange('billingCycle', e.target.value)}
                >
                  <option value="Monthly">{t('SubscriptionPlans.monthly')}</option>
                  <option value="Yearly">{t('SubscriptionPlans.yearly')}</option>
                  <option value="Quarterly">{t('SubscriptionPlans.quarterly')}</option>
                </Input>
              </div>

              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.labels.badge') || 'Badge'}</Label>
                <Input
                  type="select"
                  value={editFormData.badge}
                  onChange={(e) => handleEditInputChange('badge', e.target.value)}
                >
                  <option value="noBadge">{t('SubscriptionPlans.noBadge')}</option>
                  <option value="mostPopular">{t('SubscriptionPlans.mostPopular')}</option>
                  <option value="bestValue">{t('SubscriptionPlans.bestValue')}</option>
                </Input>
              </div>

              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">{t('Common.status') || 'Status'}</Label>
                <Input
                  type="select"
                  value={editFormData.status}
                  onChange={(e) => handleEditInputChange('status', e.target.value)}
                >
                  <option value="Active">{t('SubscriptionPlans.statusActive')}</option>
                  <option value="Inactive">{t('SubscriptionPlans.statusInactive')}</option>
                </Input>
              </div>

              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.description') || 'Description'}</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  placeholder={t('SubscriptionPlans.enterDescription')}
                />
              </div>

              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.features') || 'Features'}</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={editFormData.features}
                  onChange={(e) => handleEditInputChange('features', e.target.value)}
                  placeholder={t('SubscriptionPlans.enterFeatures')}
                />
              </div>

              {/* Limits Section */}
              <div className="col-12 mb-3 mt-4">
                <h6 className="text-muted mb-3">{t('SubscriptionPlans.limits')}</h6>
                <small className="text-muted">{t('SubscriptionPlans.limitsHint')}</small>
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.users') || 'Users'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.users}
                  onChange={(e) => handleEditLimitChange('users', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.projects') || 'Projects'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.projects}
                  onChange={(e) => handleEditLimitChange('projects', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.stores') || 'Stores'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.stores}
                  onChange={(e) => handleEditLimitChange('stores', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.clients') || 'Clients'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.clients}
                  onChange={(e) => handleEditLimitChange('clients', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.suppliers') || 'Suppliers'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.suppliers}
                  onChange={(e) => handleEditLimitChange('suppliers', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.staff') || 'Staff'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.staff}
                  onChange={(e) => handleEditLimitChange('staff', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.materials') || 'Materials'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.materials}
                  onChange={(e) => handleEditLimitChange('materials', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.vehicles') || 'Vehicles'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.vehicles}
                  onChange={(e) => handleEditLimitChange('vehicles', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Label className="form-label fw-semibold">{t('SubscriptionPlans.storage') || 'Storage'}</Label>
                <Input
                  type="text"
                  value={editFormData.limits.storage}
                  onChange={(e) => handleEditLimitChange('storage', e.target.value)}
                  placeholder={t('SubscriptionPlans.unlimited')}
                />
              </div>

              {/* Modules Section */}
              <div className="col-12 mb-3 mt-4">
                <h6 className="text-muted mb-3">{t('SubscriptionPlans.modulesIncluded')}</h6>
              </div>

              <div className="col-md-12 mb-3">
                <div className="row">
                  {[
                    'dashboard',
                    'staffManagement',
                    'clientSupplierManagement',
                    'projectManagement',
                    'taskManagement',
                    'estimationQuantity',
                    'estimationQuantityCost',
                    'estimationQuantityCostHead',
                    'stockView',
                    'stockFull',
                    'ownMaterialManagement',
                    'rentalMaterialManagement',
                    'materialTransfer',
                    'materialRequisition',
                    'purchaseInventory',
                    'purchaseOrder',
                    'purchaseReturn',
                    'projectExpensesBasic',
                    'projectExpensesDetailed',
                    'paymentOut',
                    'vehicleManagementOwn',
                    'vehicleManagementRental',
                    'vehicleTransportation',
                    'vehicleMaintenance',
                    'subcontractorManagement',
                    'fixedAssetPurchase',
                    'cashBank',
                    'incomeExpense',
                    'roleBasedAccess',
                    'basicReports',
                    'standardReports',
                    'advancedReports',
                    'exportExcelPdf',
                    'multiCompanyBranch',
                    'approvalWorkflow',
                    'auditLogs',
                    'apiAccess',
                    'customModules',
                    'customReports',
                    'whiteLabelBranding',
                    'dedicatedServer',
                    'advancedSecurity',
                    'sla',
                    'dedicatedAccountManager',
                    'prioritySupport',
                  ].map((moduleKey) => (
                    <div key={moduleKey} className="col-md-6 mb-2">
                      <div className="form-check">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id={`edit-module-${moduleKey}`}
                          checked={editFormData.modules.includes(moduleKey)}
                          onChange={() => handleEditModuleToggle(moduleKey)}
                        />
                        <Label className="form-check-label" htmlFor={`edit-module-${moduleKey}`}>
                          {t(`SubscriptionPlans.modules.${moduleKey}`) || moduleKey}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveEdit}>
            {t('Common.save')}
          </Button>
          <Button color="secondary" onClick={() => setEditModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(!deleteModalOpen)} centered>
        <ModalHeader toggle={() => setDeleteModalOpen(!deleteModalOpen)}>
          {t('Common.confirmDelete') || 'Confirm Delete'}
        </ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <p>
              {t('SubscriptionPlans.deleteConfirmation') || 'Are you sure you want to delete this subscription plan?'}
              <br />
              <strong>{selectedPlan.planName} (${selectedPlan.price})</strong>
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmDelete}>
            {t('Common.delete')}
          </Button>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Plan Modal */}
      <Modal isOpen={createModalOpen} toggle={handleCloseCreateModal} size="lg" centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {t('SubscriptionPlans.createPlan')}
        </ModalHeader>
        <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="row m-0">
            {/* Basic Information */}
            <div className="col-12 mb-3">
              <h6 className="text-muted mb-3">Basic Information</h6>
            </div>
            
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('SubscriptionPlans.labels.planName') || 'Plan Name'} <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                value={createFormData.planName}
                onChange={(e) => handleCreateInputChange('planName', e.target.value)}
                placeholder={t('SubscriptionPlans.enterPlanName') || 'Enter plan name'}
                invalid={!!createFormErrors.planName}
                maxLength={100}
              />
              {createFormErrors.planName && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.planName)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('SubscriptionPlans.labels.planCode') || 'Plan Code'} <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                value={createFormData.planCode}
                onChange={(e) => handleCreateInputChange('planCode', e.target.value.toUpperCase())}
                placeholder={t('SubscriptionPlans.enterPlanCode') || 'Enter plan code (e.g., BASIC)'}
                invalid={!!createFormErrors.planCode}
                maxLength={50}
              />
              {createFormErrors.planCode && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.planCode)}
                </FormFeedback>
              )}
              <small className="text-muted">
                {t('SubscriptionPlans.codeHint') || 'Use uppercase letters, numbers, and underscores only'}
              </small>
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('SubscriptionPlans.labels.price') || 'Price'} <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                value={createFormData.price}
                onChange={(e) => handleCreateInputChange('price', e.target.value)}
                placeholder={t('SubscriptionPlans.enterPrice') || 'Enter price'}
                invalid={!!createFormErrors.price}
              />
              {createFormErrors.price && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.price)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('SubscriptionPlans.labels.billingPeriod') || 'Billing Cycle'} <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={createFormData.billingCycle}
                onChange={(e) => handleCreateInputChange('billingCycle', e.target.value)}
              >
                <option value="Monthly">{t('SubscriptionPlans.monthly') || 'Monthly'}</option>
                <option value="Yearly">{t('SubscriptionPlans.yearly') || 'Yearly'}</option>
                <option value="Quarterly">{t('SubscriptionPlans.quarterly') || 'Quarterly'}</option>
              </Input>
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.labels.badge') || 'Badge'}</Label>
              <Input
                type="select"
                value={createFormData.badge}
                onChange={(e) => handleCreateInputChange('badge', e.target.value)}
              >
                <option value="noBadge">{t('SubscriptionPlans.noBadge') || 'No Badge'}</option>
                <option value="mostPopular">{t('SubscriptionPlans.mostPopular') || 'Most Popular'}</option>
                <option value="bestValue">{t('SubscriptionPlans.bestValue') || 'Best Value'}</option>
              </Input>
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">{t('Common.status') || 'Status'}</Label>
              <Input
                type="select"
                value={createFormData.status}
                onChange={(e) => handleCreateInputChange('status', e.target.value)}
              >
                <option value="Active">{t('SubscriptionPlans.statusActive') || 'Active'}</option>
                <option value="Inactive">{t('SubscriptionPlans.statusInactive') || 'Inactive'}</option>
              </Input>
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.description') || 'Description'}</Label>
              <Input
                type="textarea"
                rows="3"
                value={createFormData.description}
                onChange={(e) => handleCreateInputChange('description', e.target.value)}
                placeholder={t('SubscriptionPlans.enterDescription') || 'Enter description (optional)'}
              />
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.features') || 'Features'}</Label>
              <Input
                type="textarea"
                rows="3"
                value={createFormData.features}
                onChange={(e) => handleCreateInputChange('features', e.target.value)}
                placeholder={t('SubscriptionPlans.enterFeatures') || 'Enter plan features'}
              />
            </div>

            {/* Limits Section */}
            <div className="col-12 mb-3 mt-4">
              <h6 className="text-muted mb-3">{t('SubscriptionPlans.limits') || 'Limits'}</h6>
              <small className="text-muted">{t('SubscriptionPlans.limitsHint') || 'Leave empty for unlimited'}</small>
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.users') || 'Users'}</Label>
              <Input
                type="text"
                value={createFormData.limits.users}
                onChange={(e) => handleLimitChange('users', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.projects') || 'Projects'}</Label>
              <Input
                type="text"
                value={createFormData.limits.projects}
                onChange={(e) => handleLimitChange('projects', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.stores') || 'Stores'}</Label>
              <Input
                type="text"
                value={createFormData.limits.stores}
                onChange={(e) => handleLimitChange('stores', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.clients') || 'Clients'}</Label>
              <Input
                type="text"
                value={createFormData.limits.clients}
                onChange={(e) => handleLimitChange('clients', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.suppliers') || 'Suppliers'}</Label>
              <Input
                type="text"
                value={createFormData.limits.suppliers}
                onChange={(e) => handleLimitChange('suppliers', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.staff') || 'Staff'}</Label>
              <Input
                type="text"
                value={createFormData.limits.staff}
                onChange={(e) => handleLimitChange('staff', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.materials') || 'Materials'}</Label>
              <Input
                type="text"
                value={createFormData.limits.materials}
                onChange={(e) => handleLimitChange('materials', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.vehicles') || 'Vehicles'}</Label>
              <Input
                type="text"
                value={createFormData.limits.vehicles}
                onChange={(e) => handleLimitChange('vehicles', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Label className="form-label fw-semibold">{t('SubscriptionPlans.storage') || 'Storage'}</Label>
              <Input
                type="text"
                value={createFormData.limits.storage}
                onChange={(e) => handleLimitChange('storage', e.target.value)}
                placeholder={t('SubscriptionPlans.unlimited') || 'Unlimited'}
              />
            </div>

            {/* Modules Section */}
            <div className="col-12 mb-3 mt-4">
              <h6 className="text-muted mb-3">{t('SubscriptionPlans.modulesIncluded') || 'Modules Included'}</h6>
            </div>

            <div className="col-md-12 mb-3">
              <div className="row">
                {[
                  'dashboard',
                  'staffManagement',
                  'clientSupplierManagement',
                  'projectManagement',
                  'taskManagement',
                  'estimationQuantity',
                  'estimationQuantityCost',
                  'estimationQuantityCostHead',
                  'stockView',
                  'stockFull',
                  'ownMaterialManagement',
                  'rentalMaterialManagement',
                  'materialTransfer',
                  'materialRequisition',
                  'purchaseInventory',
                  'purchaseOrder',
                  'purchaseReturn',
                  'projectExpensesBasic',
                  'projectExpensesDetailed',
                  'paymentOut',
                  'vehicleManagementOwn',
                  'vehicleManagementRental',
                  'vehicleTransportation',
                  'vehicleMaintenance',
                  'subcontractorManagement',
                  'fixedAssetPurchase',
                  'cashBank',
                  'incomeExpense',
                  'roleBasedAccess',
                  'basicReports',
                  'standardReports',
                  'advancedReports',
                  'exportExcelPdf',
                  'multiCompanyBranch',
                  'approvalWorkflow',
                  'auditLogs',
                  'apiAccess',
                  'customModules',
                  'customReports',
                  'whiteLabelBranding',
                  'dedicatedServer',
                  'advancedSecurity',
                  'sla',
                  'dedicatedAccountManager',
                  'prioritySupport',
                ].map((moduleKey) => (
                  <div key={moduleKey} className="col-md-6 mb-2">
                    <div className="form-check">
                      <Input
                        type="checkbox"
                        className="form-check-input"
                        id={`module-${moduleKey}`}
                        checked={createFormData.modules.includes(moduleKey)}
                        onChange={() => handleModuleToggle(moduleKey)}
                      />
                      <Label className="form-check-label" htmlFor={`module-${moduleKey}`}>
                        {t(`SubscriptionPlans.modules.${moduleKey}`) || moduleKey}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreatePlan}>
            {t('SubscriptionPlans.createPlan')}
          </Button>
          <Button color="secondary" onClick={handleCloseCreateModal}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SubscriptionPlans;

