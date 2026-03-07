import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
} from 'reactstrap';
import { showSuccessToast } from '../../../../core/utils/toast';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';

interface RoleAssignment {
  id: string;
  employeeName: string;
  email: string;
  phone: string;
  jobTitle: string;
  currentRole: string;
  applicationRole: string;
  isActive: boolean;
  lastUpdatedAt?: string;
}

const INITIAL_ASSIGNMENTS: RoleAssignment[] = [
  {
    id: 'E-1001',
    employeeName: 'Ahmed Khan',
    email: 'ahmed.khan@demo-company.com',
    phone: '+971 50 111 0001',
    jobTitle: 'Project Manager',
    currentRole: 'Project Manager',
    applicationRole: 'COMPANY_ADMIN',
    isActive: true,
    lastUpdatedAt: '2026-02-20T09:30:00.000Z',
  },
  {
    id: 'E-1002',
    employeeName: 'Fatima Al Zahra',
    email: 'fatima.zahra@demo-company.com',
    phone: '+971 50 111 0002',
    jobTitle: 'Site Engineer',
    currentRole: 'Site Engineer',
    applicationRole: 'COMPANY_USER',
    isActive: true,
    lastUpdatedAt: '2026-02-22T14:15:00.000Z',
  },
  {
    id: 'E-1003',
    employeeName: 'Rahul Menon',
    email: 'rahul.menon@demo-company.com',
    phone: '+971 50 111 0003',
    jobTitle: 'Quantity Surveyor',
    currentRole: 'Quantity Surveyor',
    applicationRole: 'COMPANY_USER',
    isActive: false,
    lastUpdatedAt: '2026-02-10T11:05:00.000Z',
  },
  {
    id: 'E-1004',
    employeeName: 'Sara Youssef',
    email: 'sara.youssef@demo-company.com',
    phone: '+971 50 111 0004',
    jobTitle: 'Store Keeper',
    currentRole: 'Store Keeper',
    applicationRole: 'COMPANY_USER',
    isActive: true,
    lastUpdatedAt: '2026-02-25T08:45:00.000Z',
  },
];

const CompanyAssignRolesList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState<RoleAssignment[]>(INITIAL_ASSIGNMENTS);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<RoleAssignment | null>(null);
  const [selectedAppRole, setSelectedAppRole] = useState<string>('');
  const [modalPassword, setModalPassword] = useState<string>('');

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'EM';
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-primary',
      'bg-success',
      'bg-info',
      'bg-warning',
      'bg-danger',
      'bg-secondary',
      'bg-dark',
    ];
    const base = name || 'Employee';
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      hash = base.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-success">{t('EmployeeLists.statusActive')}</Badge>;
    }
    return <Badge className="bg-danger">{t('EmployeeLists.statusInactive')}</Badge>;
  };

  const filteredAssignments = useMemo(() => {
    if (!searchTerm.trim()) return assignments;
    const term = searchTerm.toLowerCase();
    return assignments.filter((item) => {
      return (
        item.employeeName.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.phone.toLowerCase().includes(term) ||
        item.jobTitle.toLowerCase().includes(term) ||
        item.currentRole.toLowerCase().includes(term) ||
        item.applicationRole.toLowerCase().includes(term)
      );
    });
  }, [assignments, searchTerm]);

  const handleOpenManageModal = (assignment: RoleAssignment) => {
    setSelectedAssignment(assignment);
    setSelectedAppRole(assignment.applicationRole || '');
    setModalPassword('');
    setManageModalOpen(true);
  };

  const handleCloseManageModal = () => {
    setManageModalOpen(false);
    setSelectedAssignment(null);
    setSelectedAppRole('');
    setModalPassword('');
  };

  const handleOpenAssignRolesFromHeader = () => {
    if (!assignments.length) {
      return;
    }
    const firstAssignment = assignments[0];
    handleOpenManageModal(firstAssignment);
  };

  return (
    <>
      <Breadcrumbs
        title={t('CompanySidebar.assignRoles')}
        breadcrumbItem={t('CompanySidebar.assignRoles')}
      />

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
                  onClick={handleOpenAssignRolesFromHeader}
                >
                  <i className="bx bx-shield-quarter me-1"></i>
                  {t('EmployeeLists.assignRoles')}
                </Button>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <td></td>
                      <th>{t('Common.id')}</th>
                      <th>{t('EmployeeLists.employee')}</th>
                      <th>{t('Common.phone')}</th>
                      <th>{t('EmployeeLists.jobTitle')}</th>
                      <th>{t('EmployeeLists.assignRoles')}</th>
                      <th>{t('AssignRoles.table.lastUpdated')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('Common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.length > 0 ? (
                      filteredAssignments.map((item) => (
                        <tr key={item.id}>
                          <td>
                          <div
                                className={`avatar-xs me-0 ${getAvatarColor(
                                  item.employeeName,
                                )} rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold`}
                              >
                                {getInitials(item.employeeName)}
                              </div>
                          </td>
                          <td>{item.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                            
                              <div>
                                <h5 className="mb-0 font-size-14">{item.employeeName}</h5>
                                <p className="mb-0 text-muted font-size-12">{item.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>{item.phone}</td>
                          <td>{item.jobTitle}</td>
                          <td>
                            <Badge color="light" className="badge-soft-primary font-size-12">
                              {item.currentRole}
                            </Badge>
                          </td>
                          
                          <td>
                            {item.lastUpdatedAt
                              ? new Date(item.lastUpdatedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td>{getStatusBadge(item.isActive)}</td>
                          <td>
                            <div className="d-flex gap-1 align-items-center">
                              <Button
                                color="outline-primary"
                                className="border-0 btn-sm"
                                title={t('Common.view')}
                                onClick={() => handleOpenManageModal(item)}
                              >
                                <i className="mdi mdi-eye"></i>
                              </Button>
                              <Button
                                color="outline-secondary"
                                className="border-0 btn-sm"
                                title={t('Common.edit')}
                                onClick={() => handleOpenManageModal(item)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="border-0 btn-sm"
                                title={t('Common.delete')}
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
                          <p className="text-muted mb-0">
                            {t('AssignRoles.noAssignmentsFound')}
                          </p>
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

      <Modal isOpen={manageModalOpen} toggle={handleCloseManageModal} size="lg" centered>
        <ModalHeader toggle={handleCloseManageModal}>
          {t('AssignRoles.modal.title')}
        </ModalHeader>
        <ModalBody>
          {selectedAssignment ? (
            <Row className="m-0">
              <div className="col-md-12 mb-4 d-flex flex-column align-items-center">
                <div className="profile-photo-upload position-relative d-flex align-items-center justify-content-center">
                  <div
                    className="avatar-lg rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ backgroundColor: '#34c38f', minWidth: 56, minHeight: 56 }}
                  >
                    {getInitials(selectedAssignment.employeeName)}
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <h5 className="mb-1 fw-bold">{selectedAssignment.employeeName}</h5>
                  <p className="mb-0 text-muted font-size-12">{selectedAssignment.email}</p>
                </div>
              </div>

              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold text-muted">
                  {t('Common.id')}
                </Label>
                <Input value={selectedAssignment.id} disabled />
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold text-muted">
                  {t('Common.phone')}
                </Label>
                <Input value={selectedAssignment.phone} disabled />
              </Col>

              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold text-muted">
                  {t('EmployeeLists.jobTitle')}
                </Label>
                <Input value={selectedAssignment.jobTitle} disabled />
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold text-muted">
                  {t('AssignRoles.modal.currentRole')}
                </Label>
                <div className="d-flex align-items-center">
                  <Badge color="light" className="badge-soft-primary font-size-12">
                    {selectedAssignment.currentRole}
                  </Badge>
                </div>
              </Col>

              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('AssignRoles.modal.selectRole')}
                </Label>
                <Input
                  type="select"
                  value={selectedAppRole}
                  onChange={(e) => setSelectedAppRole(e.target.value)}
                >
                  <option value="">{t('Common.select')}</option>
                  <option value="COMPANY_USER">
                    {t('EmployeeLists.keycloakGlobalRoleCOMPANY_USER')}
                  </option>
                  <option value="COMPANY_ADMIN">
                    {t('EmployeeLists.keycloakGlobalRoleCOMPANY_ADMIN')}
                  </option>
                  <option value="SUPER_ADMIN">
                    {t('EmployeeLists.keycloakGlobalRoleSUPER_ADMIN')}
                  </option>
                </Input>
              </Col>
              <Col md="6" className="mb-3">
                <Label className="form-label fw-semibold">
                  {t('UserList.password')}
                </Label>
                <Input
                  type="password"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  placeholder={t('UserList.enterPassword')}
                />
              </Col>
            </Row>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseManageModal}>
            {t('Common.cancel')}
          </Button>
          <Button
            color="primary"
            onClick={handleCloseManageModal}
            disabled={!selectedAppRole}
          >
            {t('Common.save')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CompanyAssignRolesList;
