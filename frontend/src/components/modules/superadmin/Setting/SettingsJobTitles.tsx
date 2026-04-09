import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  FormFeedback,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import { STATUS } from '../../../../core/constants/constantValues';
import { validateRequired } from '../../../../core/utils/Utils';
import { showSuccessToast } from '../../../../core/utils/toast';
import SuperAdminService from '../../../../core/service/SuperAdminService';

interface JobTitle {
  id: string;
  name: string;
  description?: string;
  status: string;
}

const SettingsJobTitles = () => {
  const { t } = useTranslation();

  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSavingJobTitle, setIsSavingJobTitle] = useState(false);
  const [editingJobTitleId, setEditingJobTitleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [jobTitleForStatusUpdate, setJobTitleForStatusUpdate] = useState<JobTitle | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobTitleToDelete, setJobTitleToDelete] = useState<JobTitle | null>(null);
  const [isDeletingJobTitle, setIsDeletingJobTitle] = useState(false);

  type NewJobTitleForm = {
    name: string;
    description: string;
    status: string;
  };
  type NewJobTitleFormField = keyof NewJobTitleForm;

  const [newJobTitle, setNewJobTitle] = useState<NewJobTitleForm>({
    name: '',
    description: '',
    status: STATUS.ACTIVE,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<NewJobTitleFormField, string>>>({});

  const fetchJobTitles = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await SuperAdminService.getJobTitles({
        page,
        limit: itemsPerPage,
        search,
        sortBy: 'jobTitle',
        sortOrder: 'ASC',
      });

      if (response?.data) {
        const jobTitlesData = response.data.data || [];
        const mappedJobTitles: JobTitle[] = jobTitlesData.map((jobTitle: any) => ({
          id: jobTitle.id || '',
          name: jobTitle.jobTitle || jobTitle.name || '',
          description: jobTitle.description || undefined,
          status: jobTitle.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        }));

        setJobTitles(mappedJobTitles);

        const pagination = response.data.pagination || {};
        setTotalPages(pagination.pages || pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
        setCurrentPage(pagination.page || page);
      }
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error fetching job titles:', error);
      setJobTitles([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const handleToggleStatus = (jobTitle: JobTitle) => {
    setJobTitleForStatusUpdate(jobTitle);
    setStatusModalOpen(true);
  };

  const handleDeleteClick = (jobTitle: JobTitle) => {
    setJobTitleToDelete(jobTitle);
    setDeleteModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!jobTitleForStatusUpdate) {
      return;
    }

    const nextIsActive = jobTitleForStatusUpdate.status !== STATUS.ACTIVE;
    setIsUpdatingStatus(true);
    try {
      const response = await SuperAdminService.updateJobTitleStatus(
        jobTitleForStatusUpdate.id,
        nextIsActive
      );

      showSuccessToast(
        response?.data?.message || t('CompanyJobTitles.updatedSuccessfully')
      );
      await fetchJobTitles(currentPage, searchTerm);
      setStatusModalOpen(false);
      setJobTitleForStatusUpdate(null);
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error updating job title status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDeleteJobTitle = async () => {
    if (!jobTitleToDelete) {
      return;
    }

    setIsDeletingJobTitle(true);
    try {
      const response = await SuperAdminService.deleteJobTitle(jobTitleToDelete.id);
      showSuccessToast(
        response?.data?.message || t('CompanyJobTitles.deletedSuccessfully')
      );
      await fetchJobTitles(currentPage, searchTerm);
      setDeleteModalOpen(false);
      setJobTitleToDelete(null);
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error deleting job title:', error);
    } finally {
      setIsDeletingJobTitle(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingJobTitleId(null);
    setNewJobTitle({ name: '', description: '', status: STATUS.ACTIVE });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingJobTitleId(null);
    setFormErrors({});
  };

  const handleEditJobTitle = (jobTitle: JobTitle) => {
    setEditingJobTitleId(jobTitle.id);
    setNewJobTitle({
      name: jobTitle.name,
      description: jobTitle.description || '',
      status: jobTitle.status === STATUS.ACTIVE ? STATUS.ACTIVE : STATUS.INACTIVE,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleNewJobTitleChange = (field: NewJobTitleFormField, value: string) => {
    setNewJobTitle((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field] !== undefined) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCreateJobTitle = async () => {
    const isEditMode = Boolean(editingJobTitleId);
    const nameValidation = validateRequired(newJobTitle.name, 'name');
    const errors: { name?: string } = {};
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage ?? '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSavingJobTitle(true);
    try {
      const payload = {
        jobTitle: newJobTitle.name.trim(),
        description: newJobTitle.description.trim(),
        isActive: newJobTitle.status === STATUS.ACTIVE,
      };

      const response = isEditMode
        ? await SuperAdminService.updateJobTitle(editingJobTitleId as string, payload)
        : await SuperAdminService.createJobTitle(payload);

      showSuccessToast(
        response?.data?.message ||
          (isEditMode
            ? t('CompanyJobTitles.updatedSuccessfully')
            : t('CompanyJobTitles.createdSuccessfully'))
      );
      await fetchJobTitles(currentPage, searchTerm);
      handleCloseCreateModal();
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error saving job title:', error);
    } finally {
      setIsSavingJobTitle(false);
    }
  };

  useEffect(() => {
    fetchJobTitles(1, '');
  }, [fetchJobTitles]);

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchJobTitles(1, searchTerm);
    }, 500);

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, fetchJobTitles]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchJobTitles(page, searchTerm);
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
        title={t('CompanyJobTitles.pageTitle')}
        breadcrumbItem={t('CompanyJobTitles.breadcrumbItem')}
        breadcrumbParent={t('CompanyJobTitles.breadcrumbParent')}
        link="/superadmin/Settings/job-titles"
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
                  {t('CompanyJobTitles.addJobTitle')}
                </Button>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '100px' }}>{t('CompanyJobTitles.table.id')}</th>
                      <th>{t('CompanyJobTitles.table.name')}</th>
                      <th>{t('CompanyJobTitles.table.description')}</th>
                      <th style={{ width: '140px' }}>{t('CompanyJobTitles.table.status')}</th>
                      <th style={{ width: '150px' }}>{t('CompanyJobTitles.table.actions')}</th>
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
                    ) : jobTitles.length > 0 ? (
                      jobTitles.map((jt) => (
                        <tr key={jt.id}>
                          <td>{jt.id}</td>
                          <td>{jt.name}</td>
                          <td className="text-truncate" style={{ maxWidth: 320 }}>
                            {jt.description || '—'}
                          </td>
                          <td>{getStatusBadge(jt.status)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input
                                type="checkbox"
                                className="switch switch-success"
                                id={`job-title-status-${jt.id}`}
                                checked={jt.status === STATUS.ACTIVE}
                                onChange={() => handleToggleStatus(jt)}
                              />
                              <label htmlFor={`job-title-status-${jt.id}`} />
                              <Button
                                color="outline-secondary"
                                className="btn-sm border-0"
                                title={t('Common.edit')}
                                onClick={() => handleEditJobTitle(jt)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="btn-sm border-0"
                                title={t('Common.delete')}
                                onClick={() => handleDeleteClick(jt)}
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
                          <p className="text-muted mb-0">{t('CompanyJobTitles.noJobTitlesFound')}</p>
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
          {editingJobTitleId
            ? t('Common.edit')
            : t('CompanyJobTitles.addJobTitle')}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyJobTitles.fields.name')} <span className="text-danger">*</span>
              </Label>
              <Input
                value={newJobTitle.name}
                onChange={(e) => handleNewJobTitleChange('name', e.target.value)}
                invalid={!!formErrors.name}
                placeholder={t('CompanyJobTitles.placeholders.name')}
              />
              {formErrors.name && <FormFeedback>{t(formErrors.name)}</FormFeedback>}
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">{t('CompanyJobTitles.fields.description')}</Label>
              <Input
                type="textarea"
                rows={3}
                value={newJobTitle.description}
                onChange={(e) => handleNewJobTitleChange('description', e.target.value)}
                placeholder={t('CompanyJobTitles.placeholders.description')}
              />
            </Col>
            <Col md="12">
              <Label className="form-label fw-semibold">{t('CompanyJobTitles.fields.status')}</Label>
              <Input
                type="select"
                value={newJobTitle.status}
                onChange={(e) => handleNewJobTitleChange('status', e.target.value)}
              >
                <option value={STATUS.ACTIVE}>{t('Common.StatusActive')}</option>
                <option value={STATUS.INACTIVE}>{t('Common.StatusInactive')}</option>
              </Input>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseCreateModal} disabled={isSavingJobTitle}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleCreateJobTitle} disabled={isSavingJobTitle}>
            {isSavingJobTitle
              ? t('Common.loading')
              : editingJobTitleId
                ? t('Common.update')
                : t('Common.create')}
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        isOpen={statusModalOpen}
        toggle={() => {
          setStatusModalOpen(false);
          setJobTitleForStatusUpdate(null);
        }}
        title={t('Common.confirm')}
        message={
          jobTitleForStatusUpdate
            ? (jobTitleForStatusUpdate.status === STATUS.ACTIVE
              ? t('CompanyJobTitles.confirmDeactivateStatus')
              : t('CompanyJobTitles.confirmActivateStatus'))
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
          setJobTitleToDelete(null);
        }}
        message={
          jobTitleToDelete
            ? `${t('CompanyJobTitles.deleteConfirmation')} ${jobTitleToDelete.name}?`
            : ''
        }
        onConfirm={handleConfirmDeleteJobTitle}
        isLoading={isDeletingJobTitle}
      />
    </>
  );
};

export default SettingsJobTitles;

