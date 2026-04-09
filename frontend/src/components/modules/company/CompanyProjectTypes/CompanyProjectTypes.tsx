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
  Spinner,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import ProjectTypeModal from '../../../common/ProjectTypeModal/ProjectTypeModal';
import type { ProjectTypeFormData } from '../../../common/ProjectTypeModal/ProjectTypeModal';
import { STATUS } from '../../../../core/constants/constantValues';
import { showSuccessToast } from '../../../../core/utils/toast';
import CompanyAdminService from '../../../../core/service/CompanyAdminService';

interface ProjectType {
  id: string;
  name: string;
  description?: string;
  status: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const CompanyProjectTypes = () => {
  const { t } = useTranslation();

  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSavingType, setIsSavingType] = useState(false);
  const [editingType, setEditingType] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [typeForStatusUpdate, setTypeForStatusUpdate] = useState<ProjectType | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<ProjectType | null>(null);
  const [isDeletingType, setIsDeletingType] = useState(false);

  const fetchProjectTypes = useCallback(async (page: number, search: string, status: 'all' | 'active' | 'inactive') => {
    setLoading(true);
    try {
      const response = await CompanyAdminService.getProjectTypes({
        page,
        limit: itemsPerPage,
        search,
        isActive: status === 'all' ? undefined : status === 'active',
        sortBy: 'projectType',
        sortOrder: 'ASC',
      });

      const typesData = response?.data?.data || [];
      const mappedTypes: ProjectType[] = typesData.map((type: any) => ({
        id: type.id || '',
        name: type.projectType || '',
        description: type.description || undefined,
        status: type.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        canEdit: type.canEdit !== false,
        canDelete: type.canDelete !== false,
      }));

      setProjectTypes(mappedTypes);

      const pagination = response?.data?.pagination || {};
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || 0);
      setCurrentPage(pagination.page || page);
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
      const response = await CompanyAdminService.updateProjectTypeStatus(
        typeForStatusUpdate.id,
        nextIsActive
      );
      showSuccessToast(
        response?.data?.message || t('CompanyProjectTypes.updatedSuccessfully')
      );
      await fetchProjectTypes(currentPage, searchTerm, statusFilter);
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
      const response = await CompanyAdminService.deleteProjectType(typeToDelete.id);
      showSuccessToast(
        response?.data?.message || t('CompanyProjectTypes.deletedSuccessfully')
      );
      await fetchProjectTypes(currentPage, searchTerm, statusFilter);
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
    setEditingType(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingType(null);
  };

  const handleEditType = (type: ProjectType) => {
    setEditingType(type);
    setIsCreateModalOpen(true);
  };

  const handleCreateType = async (typeData: ProjectTypeFormData) => {
    const isEditMode = Boolean(editingType?.id);
    setIsSavingType(true);
    try {
      const payload = {
        projectType: typeData.name.trim(),
        description: typeData.description.trim() || undefined,
        isActive: typeData.status === STATUS.ACTIVE,
      };

      const response = isEditMode
        ? await CompanyAdminService.updateProjectType(editingType?.id as string, payload)
        : await CompanyAdminService.createProjectType(payload);

      showSuccessToast(
        response?.data?.message ||
          (isEditMode
            ? t('CompanyProjectTypes.updatedSuccessfully')
            : t('CompanyProjectTypes.createdSuccessfully'))
      );
      await fetchProjectTypes(currentPage, searchTerm, statusFilter);
      handleCloseCreateModal();
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error saving project type:', error);
    } finally {
      setIsSavingType(false);
    }
  };

  useEffect(() => {
    fetchProjectTypes(1, '', 'all');
  }, [fetchProjectTypes]);

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProjectTypes(1, searchTerm, statusFilter);
    }, 500);

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, statusFilter, fetchProjectTypes]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProjectTypes(page, searchTerm, statusFilter);
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
                <div className="d-flex align-items-center gap-2 flex-grow-1 me-2">
                  <InputGroup className="search-input-group">
                    <Input
                      type="text"
                      placeholder={t('Common.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  <Input
                    type="select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    style={{ maxWidth: 180 }}
                  >
                    <option value="all">{t('Common.all')}</option>
                    <option value="active">{t('Common.StatusActive')}</option>
                    <option value="inactive">{t('Common.StatusInactive')}</option>
                  </Input>
                </div>
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
                      <th style={{ width: '140px' }}>{t('CompanyProjectTypes.table.status')}</th>
                      <th style={{ width: '150px' }}>{t('CompanyProjectTypes.table.actions')}</th>
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
                                disabled={type.canEdit === false}
                                onChange={() => handleToggleStatus(type)}
                              />
                              <label htmlFor={`project-type-status-${type.id}`} />
                              <Button
                                color="outline-secondary"
                                className="btn-sm border-0"
                                title={t('Common.edit')}
                                disabled={type.canEdit === false}
                                onClick={() => handleEditType(type)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="btn-sm border-0"
                                title={t('Common.delete')}
                                disabled={type.canDelete === false}
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

      <ProjectTypeModal
        isOpen={isCreateModalOpen}
        toggle={handleCloseCreateModal}
        onSubmit={handleCreateType}
        title={editingType ? t('Common.edit') : t('CompanyProjectTypes.addProjectType')}
        submitLabel={
          isSavingType
            ? t('Common.loading')
            : editingType
              ? t('Common.update')
              : t('Common.create')
        }
        initialData={
          editingType
            ? {
              name: editingType.name,
              description: editingType.description || '',
              status: editingType.status,
            }
            : {
              name: '',
              description: '',
              status: STATUS.ACTIVE,
            }
        }
      />

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

export default CompanyProjectTypes;

