/**
 * @author Auto-generated
 * Tickets component for the application
 * This component is the tickets management page for the application
 * TEMPORARY: Dummy data for table design preview only
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Badge, Input, InputGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

const Tickets = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // TEMPORARY: Dummy data for table design preview
  const dummyTickets: Ticket[] = [
    {
      id: '1',
      ticketNumber: 'TKT-2024-001',
      title: 'Unable to access dashboard',
      category: 'Technical Issue',
      priority: 'High',
      status: 'Open',
      createdBy: 'John Doe',
      assignedTo: 'Support Team',
      createdAt: new Date('2024-12-01').toISOString(),
    },
    {
      id: '2',
      ticketNumber: 'TKT-2024-002',
      title: 'Request for new user account',
      category: 'User Management',
      priority: 'Medium',
      status: 'In Progress',
      createdBy: 'Jane Smith',
      assignedTo: 'Admin Team',
      createdAt: new Date('2024-12-02').toISOString(),
    },
    {
      id: '3',
      ticketNumber: 'TKT-2024-003',
      title: 'Report generation error',
      category: 'Bug Report',
      priority: 'Urgent',
      status: 'Resolved',
      createdBy: 'Michael Johnson',
      assignedTo: 'Development Team',
      createdAt: new Date('2024-11-28').toISOString(),
      resolvedAt: new Date('2024-11-30').toISOString(),
    },
    {
      id: '4',
      ticketNumber: 'TKT-2024-004',
      title: 'Password reset request',
      category: 'Account Issue',
      priority: 'Low',
      status: 'Closed',
      createdBy: 'Sarah Williams',
      assignedTo: 'Support Team',
      createdAt: new Date('2024-11-25').toISOString(),
      resolvedAt: new Date('2024-11-26').toISOString(),
    },
    {
      id: '5',
      ticketNumber: 'TKT-2024-005',
      title: 'Feature request: Export to Excel',
      category: 'Feature Request',
      priority: 'Medium',
      status: 'Pending',
      createdBy: 'David Brown',
      createdAt: new Date('2024-12-03').toISOString(),
    },
    {
      id: '6',
      ticketNumber: 'TKT-2024-006',
      title: 'Data synchronization issue',
      category: 'Technical Issue',
      priority: 'High',
      status: 'In Progress',
      createdBy: 'Emily Davis',
      assignedTo: 'Technical Team',
      createdAt: new Date('2024-12-01').toISOString(),
    },
    {
      id: '7',
      ticketNumber: 'TKT-2024-007',
      title: 'Permission access denied',
      category: 'Access Issue',
      priority: 'Medium',
      status: 'Resolved',
      createdBy: 'Robert Miller',
      assignedTo: 'Admin Team',
      createdAt: new Date('2024-11-29').toISOString(),
      resolvedAt: new Date('2024-12-01').toISOString(),
    },
    {
      id: '8',
      ticketNumber: 'TKT-2024-008',
      title: 'System performance slow',
      category: 'Performance Issue',
      priority: 'High',
      status: 'Open',
      createdBy: 'Lisa Anderson',
      assignedTo: 'Technical Team',
      createdAt: new Date('2024-12-04').toISOString(),
    },
  ];

  const [tickets] = useState<Ticket[]>(dummyTickets);

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(tickets.map(ticket => ticket.category))).sort();
  const uniquePriorities = Array.from(new Set(tickets.map(ticket => ticket.priority))).sort();
  const uniqueStatuses = Array.from(new Set(tickets.map(ticket => ticket.status))).sort();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge className="bg-danger">{t('Tickets.statusOpen')}</Badge>;
      case 'In Progress':
        return <Badge className="bg-warning">{t('Tickets.statusInProgress')}</Badge>;
      case 'Resolved':
        return <Badge className="bg-success">{t('Tickets.statusResolved')}</Badge>;
      case 'Closed':
        return <Badge className="bg-secondary">{t('Tickets.statusClosed')}</Badge>;
      case 'Pending':
        return <Badge className="bg-info">{t('Tickets.statusPending')}</Badge>;
      default:
        return <Badge className="bg-secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Low':
        return <Badge className="bg-info">{t('Tickets.priorityLow')}</Badge>;
      case 'Medium':
        return <Badge className="bg-warning">{t('Tickets.priorityMedium')}</Badge>;
      case 'High':
        return <Badge className="bg-danger">{t('Tickets.priorityHigh')}</Badge>;
      case 'Urgent':
        return <Badge className="bg-dark">{t('Tickets.priorityUrgent')}</Badge>;
      default:
        return <Badge className="bg-secondary">{priority}</Badge>;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    // Search filter
    const ticketNumber = ticket.ticketNumber.toLowerCase();
    const title = ticket.title.toLowerCase();
    const category = ticket.category.toLowerCase();
    const createdBy = ticket.createdBy.toLowerCase();
    const assignedTo = ticket.assignedTo?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = ticketNumber.includes(search) || title.includes(search) || category.includes(search) || createdBy.includes(search) || assignedTo.includes(search);

    // Category filter
    const matchesCategory = !categoryFilter || ticket.category === categoryFilter;

    // Priority filter
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;

    // Status filter
    const matchesStatus = !statusFilter || ticket.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // View ticket handler
  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setViewModalOpen(true);
  };

  return (
    <>
      <Breadcrumbs title={t('Tickets.title')} breadcrumbItem={t('Tickets.title')} />

      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <InputGroup className="search-input-group">
                  <Input
                    type="text"
                    placeholder={t('Common.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <div className="mb-0 d-flex gap-2">
                  <div className="md-4">
                    <Input
                      type="select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Input>
                  </div>
                  <div className="md-4">
                    <Input
                      type="select"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="">{t('Tickets.allPriorities')}</option>
                      {uniquePriorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </Input>
                  </div>
                  <div className="md-4">
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">{t('Tickets.allStatuses')}</option>
                      {uniqueStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Input>
                  </div>
                </div>

              </div>

              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('Tickets.ticketNumber')}</th>
                      <th>{t('Tickets.labels.title')}</th>
                      <th>{t('Tickets.category')}</th>
                      <th>{t('Tickets.priority')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('Tickets.createdBy')}</th>
                      <th>{t('Tickets.assignedTo')}</th>
                      <th>{t('Tickets.createdAt')}</th>
                      <th>{t('Common.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.length > 0 ? (
                      filteredTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <code className="text-primary">{ticket.ticketNumber}</code>
                          </td>
                          <td>
                            <h5 className="mb-0 font-size-14">{ticket.title}</h5>
                          </td>
                          <td>{ticket.category}</td>
                          <td>{getPriorityBadge(ticket.priority)}</td>
                          <td>{getStatusBadge(ticket.status)}</td>
                          <td>{ticket.createdBy}</td>
                          <td>{ticket.assignedTo || '-'}</td>
                          <td>
                            {new Date(ticket.createdAt).toLocaleDateString('en-US', {
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
                                onClick={() => handleView(ticket)}
                              >
                                <i className="mdi mdi-eye"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          <p className="text-muted mb-0">{t('Tickets.noTicketsFound')}</p>
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

      {/* View Ticket Modal */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>
          {t('Tickets.modal.ticketDetails')}
        </ModalHeader>
        <ModalBody>
          {selectedTicket && (
            <div className="row m-0">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Tickets.ticketNumber')}</label>
                <p className="mb-0">
                  <code className="text-primary">{selectedTicket.ticketNumber}</code>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Tickets.labels.title')}</label>
                <p className="mb-0">{selectedTicket.title}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Tickets.category')}</label>
                <p className="mb-0">{selectedTicket.category}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Tickets.priority')}</label>
                <div>{getPriorityBadge(selectedTicket.priority)}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.status')}</label>
                <div>{getStatusBadge(selectedTicket.status)}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Tickets.createdBy')}</label>
                <p className="mb-0">{selectedTicket.createdBy}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Tickets.assignedTo')}</label>
                <p className="mb-0">{selectedTicket.assignedTo || '-'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Tickets.createdAt')}</label>
                <p className="mb-0">
                  {new Date(selectedTicket.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {selectedTicket.resolvedAt && (
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">{t('Tickets.resolvedAt')}</label>
                  <p className="mb-0">
                    {new Date(selectedTicket.resolvedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setViewModalOpen(false)}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Tickets;

