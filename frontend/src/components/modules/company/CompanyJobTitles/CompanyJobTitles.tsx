import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Input,
  InputGroup,
  Row,
  Spinner,
  Table,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import { STATUS } from '../../../../core/constants/constantValues';
import { showSuccessToast } from '../../../../core/utils/toast';
import JobTitleModal, { type JobTitleFormData } from '../../../common/JobTitleModal/JobTitleModal';
import CompanyAdminService from '../../../../core/service/CompanyAdminService';

interface JobTitle {
  id: string;
  name: string;
  description?: string;
  status: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const CompanyJobTitles = () => {
  const { t } = useTranslation();

  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSavingJobTitle, setIsSavingJobTitle] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [jobTitleForStatusUpdate, setJobTitleForStatusUpdate] = useState<JobTitle | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobTitleToDelete, setJobTitleToDelete] = useState<JobTitle | null>(null);
  const [isDeletingJobTitle, setIsDeletingJobTitle] = useState(false);

  const fetchJobTitles = useCallback(async (page: number, search: string, status: 'all' | 'active' | 'inactive') => {
    setLoading(true);
    try {
      const response = await CompanyAdminService.getEmployeeJobTitles({
        page,
        limit: itemsPerPage,
        search,
        isActive: status === 'all' ? undefined : status === 'active',
        sortBy: 'jobTitle',
        sortOrder: 'ASC',
      });

      const jobTitlesData = response?.data?.data || [];
      const mappedJobTitles: JobTitle[] = jobTitlesData.map((jobTitle: any) => ({
        id: jobTitle.id || '',
        name: jobTitle.jobTitle || '',
        description: jobTitle.description || undefined,
        status: jobTitle.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        canEdit: jobTitle.canEdit !== false,
        canDelete: jobTitle.canDelete !== false,
      }));

      setJobTitles(mappedJobTitles);

      const pagination = response?.data?.pagination || {};
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || 0);
      setCurrentPage(pagination.page || page);
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
      const response = await CompanyAdminService.updateEmployeeJobTitleStatus(
        jobTitleForStatusUpdate.id,
        nextIsActive
      );
      showSuccessToast(
        response?.data?.message || t('CompanyJobTitles.updatedSuccessfully')
      );
      await fetchJobTitles(currentPage, searchTerm, statusFilter);
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
      const response = await CompanyAdminService.deleteEmployeeJobTitle(jobTitleToDelete.id);
      showSuccessToast(
        response?.data?.message || t('CompanyJobTitles.deletedSuccessfully')
      );
      await fetchJobTitles(currentPage, searchTerm, statusFilter);
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
    setEditingJobTitle(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingJobTitle(null);
  };

  const handleEditJobTitle = (jobTitle: JobTitle) => {
    setEditingJobTitle(jobTitle);
    setIsCreateModalOpen(true);
  };

  const handleCreateJobTitle = async (payload: JobTitleFormData) => {
    const isEditMode = Boolean(editingJobTitle);
    setIsSavingJobTitle(true);
    try {
      const requestBody = {
        jobTitle: payload.name.trim(),
        description: payload.description.trim() || undefined,
        isActive: payload.status === STATUS.ACTIVE,
      };

      const response = isEditMode
        ? await CompanyAdminService.updateEmployeeJobTitle(editingJobTitle?.id || '', requestBody)
        : await CompanyAdminService.createEmployeeJobTitle(requestBody);

      showSuccessToast(
        response?.data?.message ||
          (isEditMode
            ? t('CompanyJobTitles.updatedSuccessfully')
            : t('CompanyJobTitles.createdSuccessfully'))
      );
      await fetchJobTitles(currentPage, searchTerm, statusFilter);
    } catch (error: any) {
      // Error toast is already handled by the interceptor.
      console.error('Error saving job title:', error);
      throw error;
    } finally {
      setIsSavingJobTitle(false);
    }
  };

  useEffect(() => {
    fetchJobTitles(1, '', 'all');
  }, [fetchJobTitles]);

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchJobTitles(1, searchTerm, statusFilter);
    }, 500);

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, statusFilter, fetchJobTitles]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchJobTitles(page, searchTerm, statusFilter);
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
        link="/company/employees/job-titles"
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
                                disabled={jt.canEdit === false}
                                onChange={() => handleToggleStatus(jt)}
                              />
                              <label htmlFor={`job-title-status-${jt.id}`} />
                              <Button
                                color="outline-secondary"
                                className="btn-sm border-0"
                                title={t('Common.edit')}
                                disabled={jt.canEdit === false}
                                onClick={() => handleEditJobTitle(jt)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="btn-sm border-0"
                                title={t('Common.delete')}
                                disabled={jt.canDelete === false}
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

      <JobTitleModal
        isOpen={isCreateModalOpen}
        toggle={handleCloseCreateModal}
        onSubmit={handleCreateJobTitle}
        title={editingJobTitle ? t('Common.edit') : t('CompanyJobTitles.addJobTitle')}
        submitLabel={
          isSavingJobTitle
            ? t('Common.loading')
            : editingJobTitle
              ? t('Common.update')
              : t('Common.create')
        }
        initialData={{
          name: editingJobTitle?.name || '',
          description: editingJobTitle?.description || '',
          status: editingJobTitle?.status || STATUS.ACTIVE,
        }}
      />

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

export default CompanyJobTitles;

