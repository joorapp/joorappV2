/**
 * @author Auto-generated
 * Log Lists component for the application
 * This component displays system logs and audit trails
 * TEMPORARY: Dummy data for table design preview only
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Badge, Input, InputGroup } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';

interface Log {
  id: string;
  timestamp: string;
  level: string;
  module: string;
  action: string;
  message: string;
  user: string;
  userId?: string;
  ipAddress?: string;
  requestId?: string;
  status?: string;
}

const LogLists = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // TEMPORARY: Dummy data for table design preview
  const dummyLogs: Log[] = [
    {
      id: '1',
      timestamp: new Date('2024-12-10T10:30:00').toISOString(),
      level: 'Info',
      module: 'Authentication',
      action: 'Login',
      message: 'User successfully logged in',
      user: 'John Doe',
      userId: 'user-123',
      ipAddress: '192.168.1.100',
      requestId: 'req-001',
      status: 'Success',
    },
    {
      id: '2',
      timestamp: new Date('2024-12-10T10:25:00').toISOString(),
      level: 'Error',
      module: 'Authentication',
      action: 'Login',
      message: 'Failed login attempt - Invalid credentials',
      user: 'Unknown',
      ipAddress: '192.168.1.105',
      requestId: 'req-002',
      status: 'Failed',
    },
    {
      id: '3',
      timestamp: new Date('2024-12-10T10:20:00').toISOString(),
      level: 'Security',
      module: 'User Management',
      action: 'Delete User',
      message: 'User account deleted',
      user: 'Admin User',
      userId: 'admin-001',
      ipAddress: '192.168.1.50',
      requestId: 'req-003',
      status: 'Success',
    },
    {
      id: '4',
      timestamp: new Date('2024-12-10T10:15:00').toISOString(),
      level: 'Warning',
      module: 'Payment',
      action: 'Process Payment',
      message: 'Payment processing timeout',
      user: 'Jane Smith',
      userId: 'user-456',
      ipAddress: '192.168.1.101',
      requestId: 'req-004',
      status: 'Pending',
    },
    {
      id: '5',
      timestamp: new Date('2024-12-10T10:10:00').toISOString(),
      level: 'Business',
      module: 'Project Management',
      action: 'Create Project',
      message: 'New project created successfully',
      user: 'Michael Johnson',
      userId: 'user-789',
      ipAddress: '192.168.1.102',
      requestId: 'req-005',
      status: 'Success',
    },
    {
      id: '6',
      timestamp: new Date('2024-12-10T10:05:00').toISOString(),
      level: 'Performance',
      module: 'Database',
      action: 'Query',
      message: 'Slow query detected - execution time: 2.5s',
      user: 'System',
      requestId: 'req-006',
    },
    {
      id: '7',
      timestamp: new Date('2024-12-10T10:00:00').toISOString(),
      level: 'Debug',
      module: 'API',
      action: 'Request',
      message: 'API request processed',
      user: 'API Client',
      ipAddress: '192.168.1.200',
      requestId: 'req-007',
      status: 'Success',
    },
    {
      id: '8',
      timestamp: new Date('2024-12-10T09:55:00').toISOString(),
      level: 'Error',
      module: 'File Upload',
      action: 'Upload',
      message: 'File upload failed - File size exceeds limit',
      user: 'Sarah Williams',
      userId: 'user-321',
      ipAddress: '192.168.1.103',
      requestId: 'req-008',
      status: 'Failed',
    },
    {
      id: '9',
      timestamp: new Date('2024-12-10T09:50:00').toISOString(),
      level: 'Info',
      module: 'Email Service',
      action: 'Send Email',
      message: 'Email sent successfully',
      user: 'System',
      requestId: 'req-009',
      status: 'Success',
    },
    {
      id: '10',
      timestamp: new Date('2024-12-10T09:45:00').toISOString(),
      level: 'Security',
      module: 'Access Control',
      action: 'Permission Check',
      message: 'Unauthorized access attempt blocked',
      user: 'David Brown',
      userId: 'user-654',
      ipAddress: '192.168.1.104',
      requestId: 'req-010',
      status: 'Failed',
    },
  ];

  const [logs] = useState<Log[]>(dummyLogs);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Error':
        return <Badge className="bg-danger">{t('LogLists.levelError')}</Badge>;
      case 'Warning':
        return <Badge className="bg-warning">{t('LogLists.levelWarning')}</Badge>;
      case 'Info':
        return <Badge className="bg-info">{t('LogLists.levelInfo')}</Badge>;
      case 'Debug':
        return <Badge className="bg-secondary">{t('LogLists.levelDebug')}</Badge>;
      case 'Security':
        return <Badge className="bg-dark">{t('LogLists.levelSecurity')}</Badge>;
      case 'Business':
        return <Badge className="bg-primary">{t('LogLists.levelBusiness')}</Badge>;
      case 'Performance':
        return <Badge className="bg-success">{t('LogLists.levelPerformance')}</Badge>;
      default:
        return <Badge className="bg-secondary">{level}</Badge>;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge className="bg-secondary">-</Badge>;
    switch (status) {
      case 'Success':
        return <Badge className="bg-success">{t('LogLists.statusSuccess')}</Badge>;
      case 'Failed':
        return <Badge className="bg-danger">{t('LogLists.statusFailed')}</Badge>;
      case 'Pending':
        return <Badge className="bg-warning">{t('LogLists.statusPending')}</Badge>;
      default:
        return <Badge className="bg-secondary">{status}</Badge>;
    }
  };

  const filteredLogs = logs.filter(log => {
    const level = log.level.toLowerCase();
    const module = log.module.toLowerCase();
    const action = log.action.toLowerCase();
    const message = log.message.toLowerCase();
    const user = log.user.toLowerCase();
    const search = searchTerm.toLowerCase();
    return level.includes(search) || module.includes(search) || action.includes(search) || message.includes(search) || user.includes(search);
  });

  return (
    <>
      <Breadcrumbs title={t('Navigation.log')} breadcrumbItem={t('Navigation.log')} />

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
              </div>
              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('LogLists.timestamp')}</th>
                      <th>{t('LogLists.level')}</th>
                      <th>{t('LogLists.module')}</th>
                      <th>{t('LogLists.action')}</th>
                      <th>{t('LogLists.message')}</th>
                      <th>{t('LogLists.ipAddress')}</th>
                      <th>{t('Common.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <div><strong>{log.user}</strong></div>
                            {new Date(log.timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                          <td>{getLevelBadge(log.level)}</td>
                          <td>{log.module}</td>
                          <td>{log.action}</td>
                          <td>
                            <p className="mb-0 text-muted" style={{ maxWidth: '300px' }}>
                              {log.message}
                            </p>
                          </td>
                          <td>
                            <code className="text-muted">{log.ipAddress || '-'}</code>
                          </td>
                          <td>{getStatusBadge(log.status)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <p className="text-muted mb-0">{t('LogLists.noLogsFound')}</p>
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

export default LogLists;

