import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Button, Badge, Input, InputGroup, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  plan: string;
  startDate: string;
  endDate?: string;
  totalAmount: string;
}

const ActiveClients = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Mock data for active clients
  const [clients] = useState([
    {
      id: '1',
      name: 'Larsen & Toubro (L&T)',
      email: 'contact@lnt.com',
      phone: '+91 22-6755-5678',
      address: 'L&T House, Ballard Estate, Mumbai, Maharashtra',
      plan: 'Premium',
      startDate: '2025-01-15T10:00:00Z',
      totalAmount: '$125,000',
    },
    {
      id: '2',
      name: 'Reliance Industries',
      email: 'info@ril.com',
      phone: '+91 22-2278-5000',
      address: 'Reliance Corporate Park, Navi Mumbai, Maharashtra',
      plan: 'Diamond',
      startDate: '2025-05-10T09:15:00Z',
      totalAmount: '$250,000',
    },
    {
      id: '3',
      name: 'YI Ventures',
      email: 'contact@yiventures.com',
      phone: '+91 22-6665-8282',
      address: 'YI Ventures, Erankulam, Kerala',
      plan: 'Diamond',
      startDate: '2025-02-15T12:30:00Z',
      totalAmount: '$180,000',
    },
    {
      id: '4',
      name: 'Hindustan Unilever',
      email: 'info@unilever.com',
      phone: '+91 22-3983-0000',
      address: 'Unilever House, B.D. Sawant Marg, Mumbai, Maharashtra',
      plan: 'Premium',
      startDate: '2024-04-15T13:15:00Z',
      totalAmount: '$95,000',
    },
    {
      id: '5',
      name: 'Bharti Airtel',
      email: 'contact@airtel.in',
      phone: '+91 11-4666-6100',
      address: 'Airtel Center, Plot No. 16, Gurgaon, Haryana',
      plan: 'Diamond',
      startDate: '2024-05-15T14:00:00Z',
      totalAmount: '$320,000',
    },
    {
      id: '6',
      name: 'Infosys Technologies',
      email: 'info@infosys.com',
      phone: '+91 80-2852-0261',
      address: 'Electronics City, Hosur Road, Bangalore, Karnataka',
      plan: 'Premium',
      startDate: '2024-06-10T10:00:00Z',
      totalAmount: '$145,000',
    },
    {
      id: '7',
      name: 'Wipro Limited',
      email: 'contact@wipro.com',
      phone: '+91 80-2844-0011',
      address: 'Doddakannelli, Sarjapur Road, Bangalore, Karnataka',
        plan: 'Basic',
      startDate: '2024-07-20T09:00:00Z',
      endDate: '2025-07-18T13:00:00Z',
      totalAmount: '$78,000',
    },
    {
      id: '8',
      name: 'TCS - Tata Consultancy Services',
      email: 'info@tcs.com',
      phone: '+91 22-6778-9999',
      address: 'TCS House, Fort, Mumbai, Maharashtra',
      plan: 'Diamond',
      startDate: '2024-08-15T11:00:00Z',
      totalAmount: '$275,000',
    },
  ]);

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

  // Generate avatar color based on client plan
  const getAvatarColor = (plan: string): string => {
    switch (plan) {
      case 'Basic':
        return 'bg-warning';
      case 'Premium':
        return 'bg-success';
      case 'Diamond':
        return 'bg-pink';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-success">{t('NewClients.statusActive')}</Badge>;
      case 'Pending':
        return <Badge className="bg-warning">{t('NewClients.statusPending')}</Badge>;
      case 'Inactive':
        return <Badge className="bg-danger">{t('NewClients.statusInactive')}</Badge>;
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
    }
  };

  // Calculate end date as one year from start date
  const calculateEndDate = (startDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    return end.toISOString();
  };

  // Get end date (use provided endDate or calculate from startDate)
  const getEndDate = (client: { startDate: string; endDate?: string }): string => {
    return client.endDate || calculateEndDate(client.startDate);
  };

  // Calculate days remaining from current date to end date
  const calculateDaysRemaining = (client: { startDate: string; endDate?: string }): number => {
    const endDate = getEndDate(client);
    const currentDate = new Date();
    const end = new Date(endDate);
    
    // Set time to start of day for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Return 0 if end date has passed (negative days)
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate status based on current date and end date
  const calculateStatus = (client: { startDate: string; endDate?: string }): string => {
    const endDate = getEndDate(client);
    const currentDate = new Date();
    const end = new Date(endDate);
    
    // Set time to start of day for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Active if current date is before or equal to end date
    return currentDate <= end ? 'Active' : 'Inactive';
  };

  // Reset filters function
  const resetFilters = () => {
    setSelectedPlan('');
    setSelectedStatus('');
    setStartDateFilter('');
    setSearchTerm('');
  };

  const filteredClients = clients.filter(client => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Plan filter
    const matchesPlan = selectedPlan === '' || client.plan === selectedPlan;

    // Status filter
    const clientStatus = calculateStatus(client);
    const matchesStatus = selectedStatus === '' || clientStatus === selectedStatus;

    // Start date filter
    const matchesStartDate = startDateFilter === '' || 
      new Date(client.startDate).toISOString().split('T')[0] === startDateFilter;

    return matchesSearch && matchesPlan && matchesStatus && matchesStartDate;
  });

  return (
    <>
      <Breadcrumbs title={t('Navigation.clients')} breadcrumbItem={t('Navigation.activeClients')} />

      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <InputGroup style={{ width: '300px' }}>
                  <Input
                    type="text"
                    placeholder={t('Common.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Dropdown isOpen={filterDropdownOpen} toggle={() => setFilterDropdownOpen(!filterDropdownOpen)}>
                  <DropdownToggle color="primary" outline className="d-flex align-items-center">
                    <i className="bx bx-filter-alt me-1"></i>
                  </DropdownToggle>
                  <DropdownMenu className="p-3" style={{ minWidth: '300px' }} end={true}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-2">{t('NewClients.plan')}</label>
                      <Input
                        type="select"
                        value={selectedPlan}
                        onChange={e => setSelectedPlan(e.target.value)}
                      >
                        <option value="">{t('Common.allPlans')}</option>
                        <option value="Basic">{t('NewClients.planBasic')}</option>
                        <option value="Premium">{t('NewClients.planPremium')}</option>
                        <option value="Diamond">{t('NewClients.planDiamond')}</option>
                      </Input>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-2">{t('Common.status')}</label>
                      <Input
                        type="select"
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                      >
                        <option value="">{t('Common.allStatus')}</option>
                        <option value="Active">{t('NewClients.statusActive')}</option>
                        <option value="Pending">{t('NewClients.statusPending')}</option>
                        <option value="Inactive">{t('NewClients.statusInactive')}</option>
                      </Input>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-2">{t('startDate')}</label>
                      <Input
                        type="date"
                        value={startDateFilter}
                        onChange={e => setStartDateFilter(e.target.value)}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <Button color="primary" size="sm" onClick={() => setFilterDropdownOpen(false)} className="flex-fill">
                        {t('Common.apply')}
                      </Button>
                      <Button color="secondary" size="sm" outline onClick={resetFilters} className="flex-fill">
                        {t('Common.reset')}
                      </Button>
                    </div>
                  </DropdownMenu>
                </Dropdown>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th></th>
                      <th>{t('NewClients.clientName')}</th>
                      <th>{t('Common.phone')}</th>
                      <th>{t('NewClients.plan')}</th>
                      <th>{t('startDate')}</th>
                      <th>{t('endDate')}</th>
                      <th>{t('Common.days')}</th>
                      <th>{t('revenue')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('NewClients.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <tr key={client.id}>
                          <td>
                            <div className="avatar-xs">
                              <span className={`avatar-title rounded-circle ${getAvatarColor(client.plan)}`}>
                                {getInitials(client.name)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong>{client.name}</strong>
                            <p className="text-muted d-block mb-0">{client.email}</p>
                          </td>
                          <td>{client.phone}</td>
                          <td>
                            {getPlanBadge(client.plan)}
                          </td>
                          <td>
                              {new Date(client.startDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                          </td>
                          <td>
                            {new Date(getEndDate(client)).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td>
                            <span className="fw-semibold">
                              {t('ActiveClients.daysRemaining', { count: calculateDaysRemaining(client) })}
                            </span>
                          </td>
                          <td>
                            <span className="text-success fw-semibold">{client.totalAmount}</span>
                          </td>
                          <td>{getStatusBadge(calculateStatus(client))}</td>
                         
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
                              
                              <Button color="outline-danger" className="p-1 border-0" title={t('Common.delete')}>
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center py-4">
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
          {t('ActiveClients.clientDetails')}
        </ModalHeader>
        <ModalBody>
          {selectedClient && (
            <div className="row m-0">
              <div className="col-md-12 mb-0">
                <div className="d-flex align-items-center mb-0">
                  <div className="avatar-lg me-3">
                    <span className={`avatar-title rounded-circle ${getAvatarColor(selectedClient.plan)}`}>
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
                <label className="form-label fw-semibold text-muted">{t('ActiveClients.startDate')}</label>
                <p className="mb-0">
                  {new Date(selectedClient.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('ActiveClients.endDate')}</label>
                <p className="mb-0">
                  {new Date(getEndDate(selectedClient)).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.days')}</label>
                <p className="mb-0 fw-semibold">{t('ActiveClients.daysRemaining', { count: calculateDaysRemaining(selectedClient) })}</p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('ActiveClients.totalAmount')}</label>
                <p className="mb-0 text-success fw-semibold">{selectedClient.totalAmount}</p>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.status')}</label>
                <div>
                {getStatusBadge(calculateStatus(selectedClient))}
                </div>
              </div>
              {calculateStatus(selectedClient) === 'Inactive' && (
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-semibold text-muted">{t('ActiveClients.activePlan')}</label>
                  <div>
                    <Button color="primary" className="btn-rounded waves-effect d-inline-flex align-items-center waves-light">
                      <i className="bx bx-plus me-1"></i>
                      {t('ActiveClients.activePlan')}
                    </Button>
                  </div>
                </div>
              )}
              
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ActiveClients;

