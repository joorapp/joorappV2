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

interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  status: string;
}

const SettingsProjectCategories = () => {
  const { t } = useTranslation();

  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [categoryForStatusUpdate, setCategoryForStatusUpdate] = useState<ProjectCategory | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProjectCategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  type NewCategoryForm = {
    name: string;
    description: string;
    status: string;
  };

  type NewCategoryFormField = keyof NewCategoryForm;

  const [newCategory, setNewCategory] = useState<NewCategoryForm>({
    name: '',
    description: '',
    status: STATUS.ACTIVE,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<NewCategoryFormField, string>>>({});

  const fetchProjectCategories = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await SuperAdminService.getProjectCategories({
        page,
        limit: itemsPerPage,
        search,
        sortBy: 'projectCategory',
        sortOrder: 'ASC',
      });

      if (response?.data) {
        const categoriesData = response.data.data || [];
        const mappedCategories: ProjectCategory[] = categoriesData.map((category: any) => ({
          id: category.id || '',
          name: category.projectCategory || category.name || '',
          description: category.description || undefined,
          status: category.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        }));

        setProjectCategories(mappedCategories);

        const pagination = response.data.pagination || {};
        setTotalPages(pagination.pages || pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
        setCurrentPage(pagination.page || page);
      }
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
      const response = await SuperAdminService.updateProjectCategoryStatus(
        categoryForStatusUpdate.id,
        nextIsActive
      );

      showSuccessToast(
        response?.data?.message || t('CompanyProjectCategories.updatedSuccessfully')
      );
      await fetchProjectCategories(currentPage, searchTerm);
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
      const response = await SuperAdminService.deleteProjectCategory(categoryToDelete.id);
      showSuccessToast(
        response?.data?.message || t('CompanyProjectCategories.deletedSuccessfully')
      );
      await fetchProjectCategories(currentPage, searchTerm);
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
    setEditingCategoryId(null);
    setNewCategory({
      name: '',
      description: '',
      status: STATUS.ACTIVE,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingCategoryId(null);
    setFormErrors({});
  };

  const handleEditCategory = (category: ProjectCategory) => {
    setEditingCategoryId(category.id);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      status: category.status === STATUS.ACTIVE ? STATUS.ACTIVE : STATUS.INACTIVE,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleNewCategoryChange = (field: NewCategoryFormField, value: string) => {
    setNewCategory((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field] !== undefined) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCreateCategory = async () => {
    const isEditMode = Boolean(editingCategoryId);
    const nameValidation = validateRequired(newCategory.name, 'name');
    const errors: { name?: string } = {};
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage ?? '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsCreatingCategory(true);
    try {
      const payload = {
        projectCategory: newCategory.name.trim(),
        description: newCategory.description.trim(),
        // Strict mapping required by API contract.
        isActive: newCategory.status === STATUS.ACTIVE,
      };

      const response = isEditMode
        ? await SuperAdminService.updateProjectCategory(editingCategoryId as string, payload)
        : await SuperAdminService.createProjectCategory(payload);

      showSuccessToast(
        response?.data?.message ||
          (isEditMode
            ? t('CompanyProjectCategories.updatedSuccessfully')
            : t('CompanyProjectCategories.createdSuccessfully'))
      );
      await fetchProjectCategories(currentPage, searchTerm);
      handleCloseCreateModal();
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error creating project category:', error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  useEffect(() => {
    fetchProjectCategories(1, '');
  }, [fetchProjectCategories]);

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProjectCategories(1, searchTerm);
    }, 500);

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, fetchProjectCategories]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProjectCategories(page, searchTerm);
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
                                onChange={() => handleToggleStatus(category)}
                              />
                              <label htmlFor={`project-category-status-${category.id}`} />
                              <Button
                                color="outline-secondary"
                                className="btn-sm border-0"
                                title={t('Common.edit')}
                                onClick={() => handleEditCategory(category)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="btn-sm border-0"
                                title={t('Common.delete')}
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

      <Modal isOpen={isCreateModalOpen} toggle={handleCloseCreateModal} centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {editingCategoryId
            ? t('Common.edit')
            : t('CompanyProjectCategories.addProjectCategory')}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectCategories.fields.name')}{' '}
                <span className="text-danger">*</span>
              </Label>
              <Input
                value={newCategory.name}
                onChange={(e) => handleNewCategoryChange('name', e.target.value)}
                invalid={!!formErrors.name}
                placeholder={t('CompanyProjectCategories.placeholders.name')}
              />
              {formErrors.name && <FormFeedback>{t(formErrors.name)}</FormFeedback>}
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectCategories.fields.description')}
              </Label>
              <Input
                type="textarea"
                rows={3}
                value={newCategory.description}
                onChange={(e) => handleNewCategoryChange('description', e.target.value)}
                placeholder={t('CompanyProjectCategories.placeholders.description')}
              />
            </Col>
            <Col md="12">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectCategories.fields.status')}
              </Label>
              <Input
                type="select"
                value={newCategory.status}
                onChange={(e) => handleNewCategoryChange('status', e.target.value)}
              >
                <option value={STATUS.ACTIVE}>{t('Common.StatusActive')}</option>
                <option value={STATUS.INACTIVE}>{t('Common.StatusInactive')}</option>
              </Input>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseCreateModal} disabled={isCreatingCategory}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleCreateCategory} disabled={isCreatingCategory}>
            {isCreatingCategory
              ? t('Common.loading')
              : editingCategoryId
                ? t('Common.update')
                : t('Common.create')}
          </Button>
        </ModalFooter>
      </Modal>

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

export default SettingsProjectCategories;

