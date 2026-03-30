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

type NewRoleAssignmentForm = {
  employeeName: string;
  email: string;
  phone: string;
  jobTitle: string;
  currentRole: string;
  applicationRole: string;
  isActive: boolean;
};

const emptyNewRoleAssignment = (): NewRoleAssignmentForm => ({
  employeeName: '',
  email: '',
  phone: '',
  jobTitle: '',
  currentRole: '',
  applicationRole: '',
  isActive: true,
});

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<RoleAssignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleAssignment | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState<NewRoleAssignmentForm>(emptyNewRoleAssignment);

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
    setEditingAssignmentId(assignment.id);
    setNewAssignment({
      employeeName: assignment.employeeName,
      email: assignment.email,
      phone: assignment.phone,
      jobTitle: assignment.jobTitle,
      currentRole: assignment.currentRole,
      applicationRole: assignment.applicationRole,
      isActive: assignment.isActive,
    });
    setManageModalOpen(true);
  };

  const handleOpenViewModal = (assignment: RoleAssignment) => {
    setSelectedAssignment(assignment);
    setViewModalOpen(true);
  };

  const handleOpenAssignRolesFromHeader = () => {
    setEditingAssignmentId(null);
    setNewAssignment(emptyNewRoleAssignment());
    setManageModalOpen(true);
  };

  const handleCloseManageModal = () => {
    setManageModalOpen(false);
    setEditingAssignmentId(null);
    setNewAssignment(emptyNewRoleAssignment());
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleOpenDeleteModal = (assignment: RoleAssignment) => {
    setDeleteTarget(assignment);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setAssignments((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (selectedAssignment?.id === deleteTarget.id) {
        setSelectedAssignment(null);
        setViewModalOpen(false);
      }
    }
    handleCloseDeleteModal();
  };

  const handleSaveAssignRole = () => {
    if (!newAssignment.employeeName.trim() || !newAssignment.applicationRole.trim()) {
      return;
    }

    if (editingAssignmentId) {
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === editingAssignmentId
            ? {
                ...item,
                employeeName: newAssignment.employeeName.trim(),
                email: newAssignment.email.trim(),
                phone: newAssignment.phone.trim(),
                jobTitle: newAssignment.jobTitle.trim(),
                currentRole: newAssignment.currentRole.trim() || newAssignment.jobTitle.trim(),
                applicationRole: newAssignment.applicationRole,
                isActive: newAssignment.isActive,
                lastUpdatedAt: new Date().toISOString(),
              }
            : item
        )
      );
    } else {
      const id = `E-${Date.now().toString().slice(-6)}`;
      setAssignments((prev) => [
        {
          id,
          employeeName: newAssignment.employeeName.trim(),
          email: newAssignment.email.trim(),
          phone: newAssignment.phone.trim(),
          jobTitle: newAssignment.jobTitle.trim(),
          currentRole: newAssignment.currentRole.trim() || newAssignment.jobTitle.trim(),
          applicationRole: newAssignment.applicationRole,
          isActive: newAssignment.isActive,
          lastUpdatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    handleCloseManageModal();
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
                  <i className="bx bx-plus me-1"></i>
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
                                onClick={() => handleOpenViewModal(item)}
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
                                onClick={() => handleOpenDeleteModal(item)}
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

      <Modal isOpen={manageModalOpen} toggle={handleCloseManageModal} centered>
        <ModalHeader toggle={handleCloseManageModal}>
          {t('EmployeeLists.assignRoles')}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12" className="mb-3">
              <Label className="form-label">{t('EmployeeLists.employee')}</Label>
              <Input
              type="select"
                value={newAssignment.employeeName}
                onChange={(e) => setNewAssignment((prev) => ({ ...prev, employeeName: e.target.value }))}
                placeholder={t('EmployeeLists.employee')}
              >
                <option value="">{t('Common.select')}</option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.employeeName}>{assignment.employeeName}</option>
                ))}
              </Input>
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label">{t('Common.email')}</Label>
              <Input
                type="email"
                value={newAssignment.email}
                onChange={(e) => setNewAssignment((prev) => ({ ...prev, email: e.target.value }))}
                placeholder={t('Common.email')}
              />
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label">{t('Common.phone')}</Label>
              <Input
                value={newAssignment.phone}
                onChange={(e) => setNewAssignment((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder={t('Common.phone')}
              />
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label">{t('EmployeeLists.jobTitle')}</Label>
              <Input
                value={newAssignment.jobTitle}
                onChange={(e) => setNewAssignment((prev) => ({ ...prev, jobTitle: e.target.value }))}
                placeholder={t('EmployeeLists.jobTitle')}
              />
            </Col>
            
            <Col md="6" className="mb-3">
              <Label className="form-label">{t('AssignRoles.modal.selectRole')}</Label>
              <Input
                type="select"
                value={newAssignment.applicationRole}
                onChange={(e) =>
                  setNewAssignment((prev) => ({ ...prev, applicationRole: e.target.value }))
                }
              >
                <option value="">{t('Common.select')}</option>
                <option value="COMPANY_USER">{t('EmployeeLists.keycloakGlobalRoleCOMPANY_USER')}</option>
                <option value="COMPANY_ADMIN">{t('EmployeeLists.keycloakGlobalRoleCOMPANY_ADMIN')}</option>
                <option value="SUPER_ADMIN">{t('EmployeeLists.keycloakGlobalRoleSUPER_ADMIN')}</option>
              </Input>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseManageModal}>
            {t('Common.cancel')}
          </Button>
          <Button
            color="primary"
            onClick={handleSaveAssignRole}
            disabled={!newAssignment.employeeName.trim() || !newAssignment.applicationRole.trim()}
          >
            {t('Common.save')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={viewModalOpen} toggle={handleCloseViewModal} centered size="lg">
        <ModalHeader toggle={handleCloseViewModal}>{t('Common.view')}</ModalHeader>
        <ModalBody>
          {selectedAssignment ? (
            <Row className="g-3">
              <Col md="12">
                <div className="d-flex align-items-center p-3 rounded  bg-light-subtle">
                  <div
                    className={`avatar-md ${getAvatarColor(selectedAssignment.employeeName)} rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold me-3`}
                  >
                    {getInitials(selectedAssignment.employeeName)}
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{selectedAssignment.employeeName}</h5>
                    <p className="mb-0 text-muted">{selectedAssignment.email || '—'}</p>
                    <p className="mb-0 text-muted">Phone: {selectedAssignment.phone || '—'}</p>
                    <p className="mb-0 text-muted">Job Title: {selectedAssignment.jobTitle || '—'}</p>
                  </div>
                  <div className="d-flex flex-column gap-1 align-items-end">
                    <Badge className="bg-primary-subtle text-primary">
                      {selectedAssignment.applicationRole}
                    </Badge>
                    {getStatusBadge(selectedAssignment.isActive)}
                  </div>
                </div>
              </Col>
             
            </Row>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseViewModal}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModalOpen} toggle={handleCloseDeleteModal} centered>
        <ModalBody className="p-4 p-md-5 text-center">
          <div className="mb-4">
            <div
              className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
             
            >
              <i className="bx bx-trash text-danger" style={{ fontSize: 44 }} />
            </div>
          </div>
          <h3 className="mb-3 fw-semibold">Confirm to delete</h3>
          <p className="text-muted mb-4">
            Do you really want to delete assignment for{' '}
            <span className="fw-semibold text-dark">{deleteTarget?.employeeName ?? 'this employee'}</span>?
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button color="danger" onClick={handleConfirmDelete} className="px-4">
              {t('Common.delete')}
            </Button>
            <Button color="secondary" onClick={handleCloseDeleteModal} className="px-4">
              {t('Common.cancel')}
            </Button>
          </div>
        </ModalBody>
      </Modal>

    </>
  );
};

export default CompanyAssignRolesList;
