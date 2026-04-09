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
import ProjectCategoryModal from '../../../common/ProjectCategoryModal/ProjectCategoryModal';
import type { ProjectCategoryFormData } from '../../../common/ProjectCategoryModal/ProjectCategoryModal';
import { STATUS } from '../../../../core/constants/constantValues';
import { showSuccessToast } from '../../../../core/utils/toast';
import CompanyAdminService from '../../../../core/service/CompanyAdminService';

interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  status: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const CompanyProjectCategories = () => {
  const { t } = useTranslation();

  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [categoryForStatusUpdate, setCategoryForStatusUpdate] = useState<ProjectCategory | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProjectCategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const fetchProjectCategories = useCallback(async (page: number, search: string, status: 'all' | 'active' | 'inactive') => {
    setLoading(true);
    try {
      const response = await CompanyAdminService.getProjectCategories({
        page,
        limit: itemsPerPage,
        search,
        isActive: status === 'all' ? undefined : status === 'active',
        sortBy: 'projectCategory',
        sortOrder: 'ASC',
      });

      const categoriesData = response?.data?.data || [];
      const mappedCategories: ProjectCategory[] = categoriesData.map((category: any) => ({
        id: category.id || '',
        name: category.projectCategory || '',
        description: category.description || undefined,
        status: category.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        canEdit: category.canEdit !== false,
        canDelete: category.canDelete !== false,
      }));

      setProjectCategories(mappedCategories);

      const pagination = response?.data?.pagination || {};
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || 0);
      setCurrentPage(pagination.page || page);
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error fetching project categories:', error);
      setProjectCategories([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const handleToggleStatus = (category: ProjectCategory) => {
    setCategoryForStatusUpdate(category);
    setStatusModalOpen(true);
  };

  const handleDeleteClick = (category: ProjectCategory) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!categoryForStatusUpdate) {
      return;
    }

    const nextIsActive = categoryForStatusUpdate.status !== STATUS.ACTIVE;
    setIsUpdatingStatus(true);
    try {
      const response = await CompanyAdminService.updateProjectCategoryStatus(
        categoryForStatusUpdate.id,
        nextIsActive
      );
      showSuccessToast(
        response?.data?.message || t('CompanyProjectCategories.updatedSuccessfully')
      );
      await fetchProjectCategories(currentPage, searchTerm, statusFilter);
      setStatusModalOpen(false);
      setCategoryForStatusUpdate(null);
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error updating project category status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    setIsDeletingCategory(true);
    try {
      const response = await CompanyAdminService.deleteProjectCategory(categoryToDelete.id);
      showSuccessToast(
        response?.data?.message || t('CompanyProjectCategories.deletedSuccessfully')
      );
      await fetchProjectCategories(currentPage, searchTerm, statusFilter);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error deleting project category:', error);
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: ProjectCategory) => {
    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  const handleCreateCategory = async (categoryData: ProjectCategoryFormData) => {
    const isEditMode = Boolean(editingCategory?.id);
    setIsSavingCategory(true);
    try {
      const payload = {
        projectCategory: categoryData.name.trim(),
        description: categoryData.description.trim() || undefined,
        isActive: categoryData.status === STATUS.ACTIVE,
      };

      const response = isEditMode
        ? await CompanyAdminService.updateProjectCategory(editingCategory?.id as string, payload)
        : await CompanyAdminService.createProjectCategory(payload);

      showSuccessToast(
        response?.data?.message ||
          (isEditMode
            ? t('CompanyProjectCategories.updatedSuccessfully')
            : t('CompanyProjectCategories.createdSuccessfully'))
      );
      await fetchProjectCategories(currentPage, searchTerm, statusFilter);
      handleCloseCreateModal();
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error saving project category:', error);
    } finally {
      setIsSavingCategory(false);
    }
  };

  useEffect(() => {
    fetchProjectCategories(1, '', 'all');
  }, [fetchProjectCategories]);

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProjectCategories(1, searchTerm, statusFilter);
    }, 500);

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, statusFilter, fetchProjectCategories]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProjectCategories(page, searchTerm, statusFilter);
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
        title={t('CompanyProjectCategories.pageTitle')}
        breadcrumbItem={t('CompanyProjectCategories.breadcrumbItem')}
        breadcrumbParent={t('CompanyProjectCategories.breadcrumbParent')}
        link="/company/projects/categories"
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
                  {t('CompanyProjectCategories.addProjectCategory')}
                </Button>
              </div>
              <div className="table-responsive">
                <Table className="table-nowrap mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px' }}>{t('CompanyProjectCategories.table.id')}</th>
                      <th>{t('CompanyProjectCategories.table.name')}</th>
                      <th>{t('CompanyProjectCategories.table.description')}</th>
                      <th style={{ width: '140px' }}>
                        {t('CompanyProjectCategories.table.status')}
                      </th>
                      <th style={{ width: '150px' }}>
                        {t('CompanyProjectCategories.table.actions')}
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
                    ) : projectCategories.length > 0 ? (
                      projectCategories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td>{category.name}</td>
                          <td className="text-truncate" style={{ maxWidth: 320 }}>
                            {category.description || '—'}
                          </td>
                          <td>{getStatusBadge(category.status)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input
                                type="checkbox"
                                className="switch switch-success"
                                id={`project-category-status-${category.id}`}
                                checked={category.status === STATUS.ACTIVE}
                                disabled={category.canEdit === false}
                                onChange={() => handleToggleStatus(category)}
                              />
                              <label htmlFor={`project-category-status-${category.id}`} />
                              <Button
                                color="outline-secondary"
                                className="btn-sm border-0"
                                title={t('Common.edit')}
                                disabled={category.canEdit === false}
                                onClick={() => handleEditCategory(category)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="btn-sm border-0"
                                title={t('Common.delete')}
                                disabled={category.canDelete === false}
                                onClick={() => handleDeleteClick(category)}
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
                            {t('CompanyProjectCategories.noProjectCategoriesFound')}
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

      <ProjectCategoryModal
        isOpen={isCreateModalOpen}
        toggle={handleCloseCreateModal}
        onSubmit={handleCreateCategory}
        title={editingCategory ? t('Common.edit') : t('CompanyProjectCategories.addProjectCategory')}
        submitLabel={
          isSavingCategory
            ? t('Common.loading')
            : editingCategory
              ? t('Common.update')
              : t('Common.create')
        }
        initialData={
          editingCategory
            ? {
              name: editingCategory.name,
              description: editingCategory.description || '',
              status: editingCategory.status,
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
          setCategoryForStatusUpdate(null);
        }}
        title={t('Common.confirm')}
        message={
          categoryForStatusUpdate
            ? (categoryForStatusUpdate.status === STATUS.ACTIVE
              ? t('CompanyProjectCategories.confirmDeactivateStatus')
              : t('CompanyProjectCategories.confirmActivateStatus'))
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
          setCategoryToDelete(null);
        }}
        message={
          categoryToDelete
            ? `${t('CompanyProjectCategories.deleteConfirmation')} ${categoryToDelete.name}?`
            : ''
        }
        onConfirm={handleConfirmDeleteCategory}
        isLoading={isDeletingCategory}
      />
    </>
  );
};

export default CompanyProjectCategories;

