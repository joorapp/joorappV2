/**
 * @author Auto-generated
 * Roles component for the application
 * This component is the roles management page for the application
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Badge, Input, InputGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormFeedback, Spinner } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import { showSuccessToast } from '../../../../core/utils/toast';
import RoleService from '../../../../core/service/RoleService';

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  createdDate?: string; // API may return createdDate instead of createdAt
}

const Roles = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

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
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch roles from API
  const fetchRoles = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await RoleService.getRoles({
        page,
        limit: itemsPerPage,
        search,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      if (response?.data) {
        // Map API response to Role interface
        const rolesData = response.data.data || [];
        const mappedRoles: Role[] = rolesData.map((role: any) => ({
          id: role.id || '',
          name: role.name || '',
          code: role.code || '',
          description: role.description || undefined,
          isActive: role.isActive ?? true,
          createdAt: role.createdDate || role.createdAt || new Date().toISOString(),
          createdDate: role.createdDate,
        }));

        setRoles(mappedRoles);

        // Extract pagination metadata
        const pagination = response.data.pagination || {};
        setTotalPages(pagination.pages || pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
        setCurrentPage(pagination.page || page);
      }
    } catch (error: any) {
      // Error is already handled by interceptor
      console.error('Error fetching roles:', error);
      setRoles([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles(1, '');
  }, [fetchRoles]);

  // Handle search with debouncing
  useEffect(() => {
    // Clear previous timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      fetchRoles(1, searchTerm);
    }, 500); // 500ms debounce

    setSearchDebounceTimer(timer);

    // Cleanup timer on unmount
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, fetchRoles]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRoles(page, searchTerm);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-success">{t('Roles.statusActive')}</Badge>;
    }
    return <Badge className="bg-danger">{t('Roles.statusInactive')}</Badge>;
  };

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
  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    setIsDeleting(true);
    try {
      await RoleService.deleteRole(roleToDelete.id);
      
      // Refresh the list after successful delete
      await fetchRoles(currentPage, searchTerm);
      showSuccessToast(t('Roles.roleDeletedSuccessfully'));
      
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (error: any) {
      // Error is already handled by interceptor
      console.error('Error deleting role:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editFormData || !selectedRole) return;

    // Basic validation
    if (!editFormData.name.trim()) {
      return;
    }
    if (!editFormData.code.trim()) {
      return;
    }

    setIsUpdating(true);
    try {
      // Call API to update role
      const data = {
        name: editFormData.name.trim(),
        code: editFormData.code.trim().toUpperCase(),
        description: editFormData.description?.trim() || undefined,
        isActive: editFormData.isActive,
      };
      
      const response = await RoleService.updateRole(selectedRole.id, data);
      
      if (response.data.success) {
        showSuccessToast(response.data.message || t('Roles.roleUpdatedSuccessfully'));
        setEditModalOpen(false);
        setEditFormData(null);
        setSelectedRole(null);
        
        // Refresh roles list after successful update
        await fetchRoles(currentPage, searchTerm);
      }
    } catch (error: any) {
      // Error is already handled by interceptor
      console.error('Error updating role:', error);
    } finally {
      setIsUpdating(false);
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
  const handleCreateRole = async () => {
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

    setIsCreating(true);
    try {
      // Call API to create role
      const data = {
        name: createFormData.name.trim(),
        code: createFormData.code.trim().toUpperCase(),
        description: createFormData.description.trim() || '',
        isActive: createFormData.isActive,
      };
      const response = await RoleService.createRole(data);
      if (response.data.success) {
        showSuccessToast(response.data.message);
        handleCloseCreateModal();
        // Refresh roles list after successful creation
        await fetchRoles(currentPage, searchTerm);
      }
    } catch (error: any) {
      // Error is already handled by interceptor
      console.error('Error creating role:', error);
    } finally {
      setIsCreating(false);
    }
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
                    onChange={(e) => handleSearchChange(e.target.value)}
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
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <Spinner className="me-2" />
                          <span>{t('Common.loading')}</span>
                        </td>
                      </tr>
                    ) : roles.length > 0 ? (
                      roles.map((role) => (
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
                            {new Date(role.createdDate || role.createdAt).toLocaleDateString('en-US', {
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
                                onClick={() => handleDeleteClick(role)}
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
              {!loading && totalItems > 0 && (
                <div className="mt-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
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
                  {new Date(selectedRole.createdDate || selectedRole.createdAt).toLocaleDateString('en-US', {
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
          <Button color="primary" onClick={handleSaveEdit} disabled={isUpdating}>
            {isUpdating ? t('Common.loading') : t('Common.save')}
          </Button>
          <Button color="secondary" onClick={() => setEditModalOpen(false)} disabled={isUpdating}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => {
          setDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        message={roleToDelete ? `${t('Roles.deleteConfirmation')} ${roleToDelete.name} (${roleToDelete.code})?` : ''}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

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
          <Button color="primary" onClick={handleCreateRole} disabled={isCreating}>
            {isCreating ? t('Common.loading') : t('Roles.createRole')}
          </Button>
          <Button color="secondary" onClick={handleCloseCreateModal} disabled={isCreating}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Roles;

