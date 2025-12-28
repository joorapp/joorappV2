/**
 * @author Auto-generated
 * Notification List component for Super Admin
 * This component displays and manages system notifications
 * TEMPORARY: Dummy data for table design preview only
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardBody, 
  Row, 
  Col, 
  Table, 
  Badge, 
  Input, 
  InputGroup,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Pagination,
  PaginationItem,
  PaginationLink
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { showSuccessToast } from '../../../../core/utils/toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source?: string;
}

const NotificationList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // TEMPORARY: Dummy data for table design preview
  const initialNotifications: Notification[] = [
    {
      id: '1',
      title: 'New Client Registration',
      message: 'A new client "ABC Corporation" has registered and is pending approval.',
      type: 'info',
      category: 'Client Management',
      isRead: false,
      createdAt: new Date('2024-12-10T10:30:00').toISOString(),
      priority: 'medium',
      source: 'System',
      actionUrl: '/superadmin/NewClient',
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of $5,000 has been received from XYZ Company for subscription renewal.',
      type: 'success',
      category: 'Payment',
      isRead: false,
      createdAt: new Date('2024-12-10T09:15:00').toISOString(),
      priority: 'high',
      source: 'Payment Gateway',
    },
    {
      id: '3',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur on December 15, 2024 from 2:00 AM to 4:00 AM EST. Scheduled maintenance will occur on December 15, 2024 from 2:00 AM to 4:00 AM EST.',
      type: 'warning',
      category: 'System',
      isRead: true,
      createdAt: new Date('2024-12-09T14:00:00').toISOString(),
      readAt: new Date('2024-12-09T14:05:00').toISOString(),
      priority: 'medium',
      source: 'System',
    },
    {
      id: '4',
      title: 'Failed Login Attempt',
      message: 'Multiple failed login attempts detected from IP address 192.168.1.100 for user admin@example.com.',
      type: 'error',
      category: 'Security',
      isRead: false,
      createdAt: new Date('2024-12-10T08:45:00').toISOString(),
      priority: 'urgent',
      source: 'Security System',
    },
    {
      id: '5',
      title: 'Subscription Expiring Soon',
      message: 'Subscription for "Tech Solutions Inc" will expire in 7 days. Please renew to avoid service interruption.',
      type: 'warning',
      category: 'Subscription',
      isRead: true,
      createdAt: new Date('2024-12-08T16:20:00').toISOString(),
      readAt: new Date('2024-12-08T16:25:00').toISOString(),
      priority: 'high',
      source: 'Billing System',
      actionUrl: '/superadmin/SubscriptionPlans',
    },
    {
      id: '6',
      title: 'New Support Ticket',
      message: 'A new support ticket #TKT-2024-001 has been created by John Doe regarding dashboard access issues.',
      type: 'info',
      category: 'Support',
      isRead: false,
      createdAt: new Date('2024-12-10T07:30:00').toISOString(),
      priority: 'medium',
      source: 'Support System',
      actionUrl: '/superadmin/Tickets',
    },
    {
      id: '7',
      title: 'Database Backup Completed',
      message: 'Daily database backup completed successfully. Backup size: 2.5 GB.',
      type: 'success',
      category: 'System',
      isRead: true,
      createdAt: new Date('2024-12-10T06:00:00').toISOString(),
      readAt: new Date('2024-12-10T06:01:00').toISOString(),
      priority: 'low',
      source: 'Backup System',
    },
    {
      id: '8',
      title: 'User Account Created',
      message: 'A new user account has been created for jane.smith@example.com with role "Site Manager".',
      type: 'info',
      category: 'User Management',
      isRead: false,
      createdAt: new Date('2024-12-09T18:45:00').toISOString(),
      priority: 'low',
      source: 'User Management',
      actionUrl: '/superadmin/UserList',
    },
    {
      id: '9',
      title: 'API Rate Limit Warning',
      message: 'API rate limit is at 85% capacity. Consider upgrading your plan or optimizing API calls.',
      type: 'warning',
      category: 'System',
      isRead: true,
      createdAt: new Date('2024-12-09T12:30:00').toISOString(),
      readAt: new Date('2024-12-09T12:35:00').toISOString(),
      priority: 'medium',
      source: 'API Gateway',
    },
    {
      id: '10',
      title: 'Security Alert: Unusual Activity',
      message: 'Unusual login pattern detected from multiple locations for user admin@example.com.',
      type: 'error',
      category: 'Security',
      isRead: false,
      createdAt: new Date('2024-12-09T10:15:00').toISOString(),
      priority: 'urgent',
      source: 'Security System',
    },
  ];

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'error':
        return <Badge className="bg-danger">{t('NotificationList.typeError')}</Badge>;
      case 'warning':
        return <Badge className="bg-warning">{t('NotificationList.typeWarning')}</Badge>;
      case 'success':
        return <Badge className="bg-success">{t('NotificationList.typeSuccess')}</Badge>;
      case 'info':
        return <Badge className="bg-info">{t('NotificationList.typeInfo')}</Badge>;
      case 'system':
        return <Badge className="bg-secondary">{t('NotificationList.typeSystem')}</Badge>;
      default:
        return <Badge className="bg-secondary">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-danger">{t('NotificationList.priorityUrgent')}</Badge>;
      case 'high':
        return <Badge className="bg-warning">{t('NotificationList.priorityHigh')}</Badge>;
      case 'medium':
        return <Badge className="bg-info">{t('NotificationList.priorityMedium')}</Badge>;
      case 'low':
        return <Badge className="bg-secondary">{t('NotificationList.priorityLow')}</Badge>;
      default:
        return <Badge className="bg-secondary">{priority}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('NotificationList.justNow') || 'Just now';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t('NotificationList.minutesAgo') || 'minutes ago'}`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${t('NotificationList.hoursAgo') || 'hours ago'}`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${t('NotificationList.daysAgo') || 'days ago'}`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const title = notification.title.toLowerCase();
    const message = notification.message.toLowerCase();
    const category = notification.category.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = title.includes(search) || message.includes(search) || category.includes(search);
    const matchesStatus = !statusFilter || 
      (statusFilter === 'read' && notification.isRead) ||
      (statusFilter === 'unread' && !notification.isRead);
    const matchesPriority = !priorityFilter || notification.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setViewModalOpen(true);
    
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id 
        ? { ...notif, isRead: true, readAt: new Date().toISOString() }
        : notif
    ));
    showSuccessToast(t('NotificationList.markedAsRead') || 'Notification marked as read');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => 
      !notif.isRead 
        ? { ...notif, isRead: true, readAt: new Date().toISOString() }
        : notif
    ));
    showSuccessToast(t('NotificationList.allMarkedAsRead') || 'All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    showSuccessToast(t('NotificationList.notificationDeleted') || 'Notification deleted');
    if (selectedNotification?.id === id) {
      setViewModalOpen(false);
      setSelectedNotification(null);
    }
  };

  const clearAllRead = () => {
    setNotifications(prev => prev.filter(notif => !notif.isRead));
    showSuccessToast(t('NotificationList.readNotificationsCleared') || 'Read notifications cleared');
  };

  return (
    <>
      <Breadcrumbs title={t('NotificationList.title')} breadcrumbItem={t('NotificationList.title')} />

      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                  <h4 className="card-title mb-0">{t('NotificationList.title')}</h4>
                  {unreadCount > 0 && (
                    <Badge className="bg-danger rounded-pill">{unreadCount}</Badge>
                  )}
                </div>
                <div className="d-flex gap-2">
                  {unreadCount > 0 && (
                    <Button color="primary" outline size="sm" onClick={markAllAsRead}>
                      <i className="bx bx-check-double me-1"></i>
                      {t('NotificationList.markAllAsRead')}
                    </Button>
                  )}
                  <Button color="secondary" outline size="sm" onClick={clearAllRead}>
                    <i className="bx bx-trash me-1"></i>
                    {t('NotificationList.clearRead')}
                  </Button>
                </div>
              </div>

              <Row className="mb-3">
                <Col md="4">
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder={t('Common.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleFilterChange();
                      }}
                    />
                  </InputGroup>
                </Col>
                <Col md="3">
                  <Input
                    type="select"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      handleFilterChange();
                    }}
                  >
                    <option value="">{t('NotificationList.allStatuses')}</option>
                    <option value="unread">{t('NotificationList.statusUnread')}</option>
                    <option value="read">{t('NotificationList.statusRead')}</option>
                  </Input>
                </Col>
                <Col md="3">
                  <Input
                    type="select"
                    value={priorityFilter}
                    onChange={(e) => {
                      setPriorityFilter(e.target.value);
                      handleFilterChange();
                    }}
                  >
                    <option value="">{t('NotificationList.allPriorities')}</option>
                    <option value="urgent">{t('NotificationList.priorityUrgent')}</option>
                    <option value="high">{t('NotificationList.priorityHigh')}</option>
                    <option value="medium">{t('NotificationList.priorityMedium')}</option>
                    <option value="low">{t('NotificationList.priorityLow')}</option>
                  </Input>
                </Col>
                <Col md="2">
                  <Button
                    color="secondary"
                    outline
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setPriorityFilter('');
                      setCurrentPage(1);
                    }}
                    className="w-100"
                  >
                    <i className="bx bx-refresh me-1"></i>
                    {t('NotificationList.clearFilters')}
                  </Button>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40px' }}>
                        <Input type="checkbox" className="form-check-input" />
                      </th>
                      <th>{t('NotificationList.title')}</th>
                      <th>{t('NotificationList.priority')}</th>
                      <th>{t('NotificationList.source')}</th>
                      <th>{t('NotificationList.time')}</th>
                      <th>{t('Common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentNotifications.length > 0 ? (
                      currentNotifications.map((notification) => (
                        <tr 
                          key={notification.id}
                          className={!notification.isRead ? 'table-warning' : ''}
                        >
                          <td>
                            <Input type="checkbox" className="form-check-input" />
                          </td>
                          <td>
                            <div style={{ width: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <strong className={!notification.isRead ? 'fw-bold' : ''}>
                                {notification.title}
                              </strong>
                              <p className="mb-0 text-muted small" style={{ maxWidth: '200px' }}>
                                {notification.message.length > 100 
                                  ? notification.message.substring(0, 100) + '...'
                                  : notification.message}
                              </p>
                            </div>
                          </td>
                          <td>{getPriorityBadge(notification.priority)}</td>
                          <td>
                            {notification.source || '-'}
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatTimeAgo(notification.createdAt)}
                            </small>
                            <br />
                            <small className="text-muted">
                              {new Date(notification.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                color="outline-primary"
                                className="p-1 border-0"
                                // size="sm"
                                onClick={() => handleView(notification)}
                              >
                                <i className="bx bx-show"></i>
                              </Button>
                              {!notification.isRead && (
                                <Button
                                  color="outline-success"
                                  className="p-1 border-0"
                                  // size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <i className="bx bx-check"></i>
                                </Button>
                              )}
                              <Button
                                color="outline-danger"
                                className="p-1 border-0"
                                // size="sm"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <i className="bx bx-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <p className="text-muted mb-0">{t('NotificationList.noNotificationsFound')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredNotifications.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">
                      {t('NotificationList.showing') || 'Showing'} {indexOfFirstItem + 1} {t('NotificationList.to') || 'to'} {Math.min(indexOfLastItem, filteredNotifications.length)} {t('NotificationList.of') || 'of'} {filteredNotifications.length} {t('NotificationList.entries') || 'entries'}
                    </span>
                    <Input
                      type="select"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{ width: '80px' }}
                      className="d-inline-block"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </Input>
                    <span className="text-muted">{t('NotificationList.perPage') || 'per page'}</span>
                  </div>

                  <Pagination className="pagination-rounded">
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink
                        previous
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page} active={page === currentPage}>
                            <PaginationLink onClick={() => setCurrentPage(page)}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page} disabled>
                            <PaginationLink>...</PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink
                        next
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* View Notification Modal */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(false)} size="lg">
        <ModalHeader toggle={() => setViewModalOpen(false)}>
          {selectedNotification?.title}
        </ModalHeader>
        <ModalBody>
          {selectedNotification && (
            <div>
              <Row className="mb-3">
                <Col md="6">
                  <strong>{t('NotificationList.type')}:</strong> {getTypeBadge(selectedNotification.type)}
                </Col>
                <Col md="6">
                  <strong>{t('NotificationList.priority')}:</strong> {getPriorityBadge(selectedNotification.priority)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <strong>{t('NotificationList.category')}:</strong> {selectedNotification.category}
                </Col>
                <Col md="6">
                  <strong>{t('NotificationList.source')}:</strong> {selectedNotification.source || '-'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <strong>{t('NotificationList.createdAt')}:</strong>
                  <br />
                  <small className="text-muted">
                    {new Date(selectedNotification.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                </Col>
                {selectedNotification.readAt && (
                  <Col md="6">
                    <strong>{t('NotificationList.readAt')}:</strong>
                    <br />
                    <small className="text-muted">
                      {new Date(selectedNotification.readAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </Col>
                )}
              </Row>
              <div className="mb-3">
                <strong>{t('NotificationList.message')}:</strong>
                <p className="mt-2">{selectedNotification.message}</p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {selectedNotification?.actionUrl && (
            <Button color="primary" onClick={() => window.location.href = selectedNotification.actionUrl!}>
              {t('NotificationList.viewDetails')}
            </Button>
          )}
          {selectedNotification && !selectedNotification.isRead && (
            <Button color="success" onClick={() => {
              if (selectedNotification) {
                markAsRead(selectedNotification.id);
                setSelectedNotification({ ...selectedNotification, isRead: true });
              }
            }}>
              {t('NotificationList.markAsRead')}
            </Button>
          )}
          <Button color="secondary" onClick={() => setViewModalOpen(false)}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default NotificationList;

