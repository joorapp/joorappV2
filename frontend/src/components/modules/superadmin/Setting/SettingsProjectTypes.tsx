import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Row,
  Col,
  Table,
  Button,
  Input,
  InputGroup,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  FormFeedback,
  Spinner,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import { STATUS } from '../../../../core/constants/constantValues';
import { validateRequired } from '../../../../core/utils/Utils';
import { showSuccessToast } from '../../../../core/utils/toast';
import SuperAdminService from '../../../../core/service/SuperAdminService';

interface ProjectType {
  id: string;
  name: string;
  description?: string;
  status: string;
}

const SettingsProjectTypes = () => {
  const { t } = useTranslation();

  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSavingType, setIsSavingType] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [typeForStatusUpdate, setTypeForStatusUpdate] = useState<ProjectType | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<ProjectType | null>(null);
  const [isDeletingType, setIsDeletingType] = useState(false);

  type NewTypeForm = {
    name: string;
    description: string;
    status: string;
  };

  type NewTypeFormField = keyof NewTypeForm;

  const [newType, setNewType] = useState<NewTypeForm>({
    name: '',
    description: '',
    status: STATUS.ACTIVE,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<NewTypeFormField, string>>>({});

  const fetchProjectTypes = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await SuperAdminService.getProjectTypes({
        page,
        limit: itemsPerPage,
        search,
        sortBy: 'projectType',
        sortOrder: 'ASC',
      });

      if (response?.data) {
        const typesData = response.data.data || [];
        const mappedTypes: ProjectType[] = typesData.map((type: any) => ({
          id: type.id || '',
          name: type.projectType || type.name || '',
          description: type.description || undefined,
          status: type.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        }));

        setProjectTypes(mappedTypes);

        const pagination = response.data.pagination || {};
        setTotalPages(pagination.pages || pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
        setCurrentPage(pagination.page || page);
      }
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error fetching project types:', error);
      setProjectTypes([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const handleToggleStatus = (type: ProjectType) => {
    setTypeForStatusUpdate(type);
    setStatusModalOpen(true);
  };

  const handleDeleteClick = (type: ProjectType) => {
    setTypeToDelete(type);
    setDeleteModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!typeForStatusUpdate) {
      return;
    }

    const nextIsActive = typeForStatusUpdate.status !== STATUS.ACTIVE;
    setIsUpdatingStatus(true);
    try {
      const response = await SuperAdminService.updateProjectTypeStatus(
        typeForStatusUpdate.id,
        nextIsActive
      );

      showSuccessToast(
        response?.data?.message || t('CompanyProjectTypes.updatedSuccessfully')
      );
      await fetchProjectTypes(currentPage, searchTerm);
      setStatusModalOpen(false);
      setTypeForStatusUpdate(null);
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error updating project type status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDeleteType = async () => {
    if (!typeToDelete) {
      return;
    }

    setIsDeletingType(true);
    try {
      const response = await SuperAdminService.deleteProjectType(typeToDelete.id);
      showSuccessToast(
        response?.data?.message || t('CompanyProjectTypes.deletedSuccessfully')
      );
      await fetchProjectTypes(currentPage, searchTerm);
      setDeleteModalOpen(false);
      setTypeToDelete(null);
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error deleting project type:', error);
    } finally {
      setIsDeletingType(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTypeId(null);
    setNewType({
      name: '',
      description: '',
      status: STATUS.ACTIVE,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingTypeId(null);
    setFormErrors({});
  };

  const handleEditType = (type: ProjectType) => {
    setEditingTypeId(type.id);
    setNewType({
      name: type.name,
      description: type.description || '',
      status: type.status === STATUS.ACTIVE ? STATUS.ACTIVE : STATUS.INACTIVE,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleNewTypeChange = (field: NewTypeFormField, value: string) => {
    setNewType((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field] !== undefined) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCreateType = async () => {
    const isEditMode = Boolean(editingTypeId);
    const nameValidation = validateRequired(newType.name, 'name');
    const errors: { name?: string } = {};
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage ?? '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSavingType(true);
    try {
      const payload = {
        projectType: newType.name.trim(),
        description: newType.description.trim(),
        isActive: newType.status === STATUS.ACTIVE,
      };

      const response = isEditMode
        ? await SuperAdminService.updateProjectType(editingTypeId as string, payload)
        : await SuperAdminService.createProjectType(payload);

      showSuccessToast(
        response?.data?.message ||
          (isEditMode
            ? t('CompanyProjectTypes.updatedSuccessfully')
            : t('CompanyProjectTypes.createdSuccessfully'))
      );
      await fetchProjectTypes(currentPage, searchTerm);
      handleCloseCreateModal();
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error saving project type:', error);
    } finally {
      setIsSavingType(false);
    }
  };

  useEffect(() => {
    fetchProjectTypes(1, '');
  }, [fetchProjectTypes]);

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProjectTypes(1, searchTerm);
    }, 500);

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, fetchProjectTypes]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProjectTypes(page, searchTerm);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case STATUS.ACTIVE:
        return <Badge color="success">{t('Common.StatusActive')}</Badge>;
      case STATUS.INACTIVE:
        return <Badge color="secondary">{t('Common.StatusInactive')}</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  return (
    <>
      <Breadcrumbs
        title={t('CompanyProjectTypes.pageTitle')}
        breadcrumbItem={t('CompanyProjectTypes.breadcrumbItem')}
        breadcrumbParent={t('CompanyProjectTypes.breadcrumbParent')}
        link="/company/projects/types"
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
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </InputGroup>
                <Button
                  color="primary"
                  className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                  onClick={handleOpenCreateModal}
                >
                  <i className="bx bx-plus me-1" />
                  {t('CompanyProjectTypes.addProjectType')}
                </Button>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px' }}>{t('CompanyProjectTypes.table.id')}</th>
                      <th>{t('CompanyProjectTypes.table.name')}</th>
                      <th>{t('CompanyProjectTypes.table.description')}</th>
                      <th style={{ width: '140px' }}>
                        {t('CompanyProjectTypes.table.status')}
                      </th>
                      <th style={{ width: '150px' }}>
                        {t('CompanyProjectTypes.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          <Spinner color="primary" />
                          <p className="mt-2 text-muted mb-0">{t('Common.loading')}</p>
                        </td>
                      </tr>
                    ) : projectTypes.length > 0 ? (
                      projectTypes.map((type) => (
                        <tr key={type.id}>
                          <td>{type.id}</td>
                          <td>{type.name}</td>
                          <td className="text-truncate" style={{ maxWidth: 320 }}>
                            {type.description || '—'}
                          </td>
                          <td>{getStatusBadge(type.status)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input
                                type="checkbox"
                                className="switch switch-success"
                                id={`project-type-status-${type.id}`}
                                checked={type.status === STATUS.ACTIVE}
                                onChange={() => handleToggleStatus(type)}
                              />
                              <label htmlFor={`project-type-status-${type.id}`} />
                              <Button
                                color="outline-secondary"
                                className="btn-sm border-0"
                                title={t('Common.edit')}
                                onClick={() => handleEditType(type)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="btn-sm border-0"
                                title={t('Common.delete')}
                                onClick={() => handleDeleteClick(type)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <p className="text-muted mb-0">
                            {t('CompanyProjectTypes.noProjectTypesFound')}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              {!loading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={isCreateModalOpen} toggle={handleCloseCreateModal} centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {editingTypeId
            ? t('Common.edit')
            : t('CompanyProjectTypes.addProjectType')}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectTypes.fields.name')}{' '}
                <span className="text-danger">*</span>
              </Label>
              <Input
                value={newType.name}
                onChange={(e) => handleNewTypeChange('name', e.target.value)}
                invalid={!!formErrors.name}
                placeholder={t('CompanyProjectTypes.placeholders.name')}
              />
              {formErrors.name && <FormFeedback>{t(formErrors.name)}</FormFeedback>}
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectTypes.fields.description')}
              </Label>
              <Input
                type="textarea"
                rows={3}
                value={newType.description}
                onChange={(e) => handleNewTypeChange('description', e.target.value)}
                placeholder={t('CompanyProjectTypes.placeholders.description')}
              />
            </Col>
            <Col md="12">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectTypes.fields.status')}
              </Label>
              <Input
                type="select"
                value={newType.status}
                onChange={(e) => handleNewTypeChange('status', e.target.value)}
              >
                <option value={STATUS.ACTIVE}>{t('Common.StatusActive')}</option>
                <option value={STATUS.INACTIVE}>{t('Common.StatusInactive')}</option>
              </Input>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseCreateModal} disabled={isSavingType}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleCreateType} disabled={isSavingType}>
            {isSavingType
              ? t('Common.loading')
              : editingTypeId
                ? t('Common.update')
                : t('Common.create')}
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        isOpen={statusModalOpen}
        toggle={() => {
          setStatusModalOpen(false);
          setTypeForStatusUpdate(null);
        }}
        title={t('Common.confirm')}
        message={
          typeForStatusUpdate
            ? (typeForStatusUpdate.status === STATUS.ACTIVE
              ? t('CompanyProjectTypes.confirmDeactivateStatus')
              : t('CompanyProjectTypes.confirmActivateStatus'))
            : ''
        }
        onConfirm={handleConfirmStatusUpdate}
        confirmButtonText={t('Common.confirm')}
        confirmButtonColor="primary"
        isLoading={isUpdatingStatus}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => {
          setDeleteModalOpen(false);
          setTypeToDelete(null);
        }}
        message={
          typeToDelete
            ? `${t('CompanyProjectTypes.deleteConfirmation')} ${typeToDelete.name}?`
            : ''
        }
        onConfirm={handleConfirmDeleteType}
        isLoading={isDeletingType}
      />
    </>
  );
};

export default SettingsProjectTypes;

