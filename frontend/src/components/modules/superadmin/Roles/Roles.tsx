/**
 * @author Auto-generated
 * Roles component for the application
 * This component is the roles management page for the application
 * TEMPORARY: Dummy data for table design preview only
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Badge, Input, InputGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormFeedback } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { showSuccessToast } from '../../../../core/utils/toast';

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const Roles = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // TEMPORARY: Dummy data for table design preview
  const initialDummyRoles: Role[] = [
    {
      id: '1',
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      description: 'Full system access with all permissions',
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString(),
    },
    {
      id: '2',
      name: 'Site Manager',
      code: 'SITE_MANAGER',
      description: 'Manages site operations and staff',
      isActive: true,
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: '3',
      name: 'Project Manager',
      code: 'PROJECT_MANAGER',
      description: 'Oversees project planning and execution',
      isActive: true,
      createdAt: new Date('2024-02-10').toISOString(),
    },
    {
      id: '4',
      name: 'Account Manager',
      code: 'ACCOUNT_MANAGER',
      description: 'Manages client accounts and relationships',
      isActive: true,
      createdAt: new Date('2024-02-20').toISOString(),
    },
    {
      id: '5',
      name: 'Site Engineer',
      code: 'SITE_ENGINEER',
      description: 'Technical oversight of site activities',
      isActive: true,
      createdAt: new Date('2024-03-05').toISOString(),
    },
    {
      id: '6',
      name: 'Finance Manager',
      code: 'FINANCE_MANAGER',
      description: 'Handles financial operations and reporting',
      isActive: false,
      createdAt: new Date('2024-03-15').toISOString(),
    },
    {
      id: '7',
      name: 'HR Manager',
      code: 'HR_MANAGER',
      description: 'Manages human resources and employee relations',
      isActive: true,
      createdAt: new Date('2024-04-01').toISOString(),
    },
    {
      id: '8',
      name: 'Viewer',
      code: 'VIEWER',
      description: 'Read-only access to system data',
      isActive: true,
      createdAt: new Date('2024-04-10').toISOString(),
    },
  ];

  const [roles, setRoles] = useState<Role[]>(initialDummyRoles);
  const [editFormData, setEditFormData] = useState<Role | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });
  const [createFormErrors, setCreateFormErrors] = useState<{
    name?: string;
    code?: string;
  }>({});

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-success">{t('Roles.statusActive')}</Badge>;
    }
    return <Badge className="bg-danger">{t('Roles.statusInactive')}</Badge>;
  };

  const filteredRoles = roles.filter(role => {
    const name = role.name.toLowerCase();
    const code = role.code.toLowerCase();
    const description = role.description?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || code.includes(search) || description.includes(search);
  });

  // View role handler
  const handleView = (role: Role) => {
    setSelectedRole(role);
    setViewModalOpen(true);
  };

  // Edit role handler
  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditFormData({ ...role });
    setEditModalOpen(true);
  };

  // Delete role handler
  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedRole) {
      setRoles(prev => prev.filter(role => role.id !== selectedRole.id));
      showSuccessToast(t('Roles.roleDeletedSuccessfully') || 'Role deleted successfully');
      setDeleteModalOpen(false);
      setSelectedRole(null);
    }
  };

  // Save edit
  const handleSaveEdit = () => {
    if (editFormData && selectedRole) {
      // Basic validation
      if (!editFormData.name.trim()) {
        return;
      }
      if (!editFormData.code.trim()) {
        return;
      }

      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id ? editFormData : role
      ));
      showSuccessToast(t('Roles.roleUpdatedSuccessfully') || 'Role updated successfully');
      setEditModalOpen(false);
      setEditFormData(null);
      setSelectedRole(null);
    }
  };

  // Handle edit form input change
  const handleEditInputChange = (field: keyof Role, value: string | boolean) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
    }
  };

  // Handle create form input change
  const handleCreateInputChange = (field: string, value: string | boolean) => {
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
      name: '',
      code: '',
      description: '',
      isActive: true,
    });
    setCreateFormErrors({});
  };

  // Create role handler
  const handleCreateRole = () => {
    const errors: typeof createFormErrors = {};
    let isValid = true;

    // Validate name (required)
    if (!createFormData.name.trim()) {
      errors.name = 'Validation.nameRequired';
      isValid = false;
    } else if (createFormData.name.length > 100) {
      errors.name = 'Validation.nameMaxLength';
      isValid = false;
    }

    // Validate code (required)
    if (!createFormData.code.trim()) {
      errors.code = 'Validation.codeRequired';
      isValid = false;
    } else if (createFormData.code.length > 50) {
      errors.code = 'Validation.codeMaxLength';
      isValid = false;
    } else if (!/^[A-Z0-9_]+$/.test(createFormData.code)) {
      errors.code = 'Validation.codeInvalidFormat';
      isValid = false;
    }

    if (!isValid) {
      setCreateFormErrors(errors);
      return;
    }

    // Create new role
    const newRole: Role = {
      id: String(Date.now()), // Simple ID generation for dummy data
      name: createFormData.name.trim(),
      code: createFormData.code.trim().toUpperCase(),
      description: createFormData.description.trim() || undefined,
      isActive: createFormData.isActive,
      createdAt: new Date().toISOString(),
    };

    setRoles(prev => [...prev, newRole]);
    showSuccessToast(t('Roles.roleCreatedSuccessfully') || 'Role created successfully');
    handleCloseCreateModal();
  };

  return (
    <>
      <Breadcrumbs title={t('Navigation.roles')} breadcrumbItem={t('Navigation.roles')} />

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
                  {t('Roles.newRole')}
                </Button>
              </div>
              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('Roles.roleName')}</th>
                      <th>{t('Roles.roleCode')}</th>
                      <th>{t('Roles.description')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('Roles.createdDate')}</th>
                      <th>{t('Common.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => (
                        <tr key={role.id}>
                          <td>
                            <h5 className="mb-0 font-size-14">{role.name}</h5>
                          </td>
                          <td>
                            <Badge className="bg-info">{role.code}</Badge>
                          </td>
                          <td>
                            <p className="mb-0 text-muted">{role.description || '-'}</p>
                          </td>
                          <td>{getStatusBadge(role.isActive)}</td>
                          <td>
                            {new Date(role.createdAt).toLocaleDateString('en-US', {
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
                                onClick={() => handleView(role)}
                              >
                                <i className="mdi mdi-eye"></i>
                              </Button>
                              <Button
                                color="outline-success"
                                className="p-1 border-0"
                                title={t('Common.edit')}
                                onClick={() => handleEdit(role)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="p-1 border-0"
                                title={t('Common.delete')}
                                onClick={() => handleDelete(role)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <p className="text-muted mb-0">{t('Roles.noRolesFound')}</p>
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

      {/* View Role Modal */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>
          {t('Roles.modal.roleDetails')}
        </ModalHeader>
        <ModalBody>
          {selectedRole && (
            <div className="row m-0">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Roles.roleName')}</label>
                <p className="mb-0">{selectedRole.name}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Roles.roleCode')}</label>
                <p className="mb-0">
                  <Badge className="bg-info">{selectedRole.code}</Badge>
                </p>
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Roles.description')}</label>
                <p className="mb-0">{selectedRole.description || '-'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.status')}</label>
                <div>{getStatusBadge(selectedRole.isActive)}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Roles.createdDate')}</label>
                <p className="mb-0">
                  {new Date(selectedRole.createdAt).toLocaleDateString('en-US', {
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

      {/* Edit Role Modal */}
      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(!editModalOpen)} size="md" centered>
        <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>
          {t('Roles.editRole')}
        </ModalHeader>
        <ModalBody>
          {editFormData && (
            <div className="row m-0">
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('Roles.labels.roleName')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleEditInputChange('name', e.target.value)}
                  placeholder={t('Roles.enterRoleName')}
                  maxLength={100}
                />
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('Roles.labels.roleCode')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editFormData.code}
                  onChange={(e) => handleEditInputChange('code', e.target.value.toUpperCase())}
                  placeholder={t('Roles.enterRoleCode')}
                  maxLength={50}
                />
                <small className="text-muted">
                  {t('Roles.codeHint')}
                </small>
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('Roles.labels.description')}</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={editFormData.description || ''}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  placeholder={t('Roles.enterDescription')}
                />
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('Common.status')}</Label>
                <Input
                  type="select"
                  value={editFormData.isActive ? 'true' : 'false'}
                  onChange={(e) => handleEditInputChange('isActive', e.target.value === 'true')}
                >
                  <option value="true">{t('Roles.statusActive')}</option>
                  <option value="false">{t('Roles.statusInactive')}</option>
                </Input>
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
          {t('Common.confirmDelete')}
        </ModalHeader>
        <ModalBody>
          {selectedRole && (
            <p>
              {t('Roles.deleteConfirmation') || 'Are you sure you want to delete this role?'}
              <br />
              <strong>{selectedRole.name} ({selectedRole.code})</strong>
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

      {/* Create Role Modal */}
      <Modal isOpen={createModalOpen} toggle={handleCloseCreateModal} size="md" centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {t('Roles.createRole')}
        </ModalHeader>
        <ModalBody>
          <div className="row m-0">
            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('Roles.labels.roleName')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                value={createFormData.name}
                onChange={(e) => handleCreateInputChange('name', e.target.value)}
                placeholder={t('Roles.enterRoleName')}
                invalid={!!createFormErrors.name}
                maxLength={100}
              />
              {createFormErrors.name && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.name)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('Roles.labels.roleCode')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                value={createFormData.code}
                onChange={(e) => handleCreateInputChange('code', e.target.value.toUpperCase())}
                placeholder={t('Roles.enterRoleCode')}
                invalid={!!createFormErrors.code}
                maxLength={50}
              />
              {createFormErrors.code && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.code)}
                </FormFeedback>
              )}
              <small className="text-muted">
                {t('Roles.codeHint')}
              </small>
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('Roles.labels.description')}</Label>
              <Input
                type="textarea"
                rows="3"
                value={createFormData.description}
                onChange={(e) => handleCreateInputChange('description', e.target.value)}
                placeholder={t('Roles.enterDescription')}
              />
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">{t('Common.status')}</Label>
              <Input
                type="select"
                value={createFormData.isActive ? 'true' : 'false'}
                onChange={(e) => handleCreateInputChange('isActive', e.target.value === 'true')}
              >
                <option value="true">{t('Roles.statusActive')}</option>
                <option value="false">{t('Roles.statusInactive')}</option>
              </Input>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateRole}>
            {t('Roles.createRole')}
          </Button>
          <Button color="secondary" onClick={handleCloseCreateModal}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Roles;

