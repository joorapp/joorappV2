import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Button, Badge, Input, InputGroup } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';

const NewClients: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for new clients
  const [clients] = useState([
    {
      id: '1',
      name: 'Larsen & Toubro (L&T)',
      email: 'john.doe@example.com',
      phone: '+1 234-567-8900',
      address: '123 Main Street, New York, NY',
      status: 'Active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      orderCount: 12,
      plan: 'Basic',
    },
    {
      id: '2',
      name: 'Reliance Industries',
      email: 'jane.smith@example.com',
      phone: '+1 234-567-8901',
      address: '456 Main Street, Los Angeles, CA',
      status: 'Active',
      createdAt: '2024-02-10T09:15:00Z',
      updatedAt: '2024-02-15T11:45:00Z',
      orderCount: 8,
      plan: 'Premium',
    },
    {
      id: '3',
      name: 'Tata Sons',
      email: 'mike.w@digitalinnovations.com',
      phone: '+1 234-567-8902',
      address: '789 Main Street, Chicago, IL',
      status: 'Active',
      createdAt: '2024-03-15T12:30:00Z',
      updatedAt: '2024-03-20T15:45:00Z',
      orderCount: 15,
      plan: 'Diamond',
    },
    {
      id: '4',
      name: 'Hindustan Unilever',
      email: 'emily.d@futureenterprises.com',
      phone: '+1 234-567-8903',
      address: '101 Main Street, San Francisco, CA',
      status: 'Inactive',
      createdAt: '2024-04-15T13:15:00Z',
      updatedAt: '2024-04-20T16:30:00Z',
      orderCount: 20,
      plan: 'Plan',
    },
    {
      id: '5',
      name: 'Bharti Airtel',
      email: 'david.b@smartsystems.com',
      phone: '+1 234-567-8904',
      address: '123 Main Street, New York, NY',
      status: 'Pending',
      createdAt: '2024-05-15T14:00:00Z',
      updatedAt: '2024-05-20T17:15:00Z',
      orderCount: 25,
      plan: 'Plan',
    }
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
  }

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
                  <InputGroup style={{ width: '300px' }}>
                    <Input
                      type="text"
                      placeholder={t('Common.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  <Button color="primary" className="btn-rounded waves-effect d-inline-flex align-items-center waves-light">
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
                      <th>{t('Common.email')}</th>
                      <th>{t('Common.phone')}</th>
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
                            <p className="text-muted d-block mb-0">{client.address}</p>
                          </td>
                          <td>{client.email}</td>
                          <td>{client.phone}</td>
                          <td>{getStatusBadge(client.status)}</td>
                          <td>{new Date(client.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td>
                            {getPlanBadge(client.plan)}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button color="outline-primary" className="p-1 border-0">
                                <i className="mdi mdi-eye"></i>
                              </Button>
                              <Button color="outline-secondary" className="p-1 border-0">
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button color="outline-danger" className="p-1 border-0">
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
    </>
  );
};

export default NewClients;

