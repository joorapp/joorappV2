import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table,
  FormFeedback,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import CompanyClientCreate from '../CompanyClientsList/CompanyClientCreate';
import ProjectCategoryModal from '../../../common/ProjectCategoryModal/ProjectCategoryModal';
import type { ProjectCategoryFormData } from '../../../common/ProjectCategoryModal/ProjectCategoryModal';
import ProjectTypeModal from '../../../common/ProjectTypeModal/ProjectTypeModal';
import type { ProjectTypeFormData } from '../../../common/ProjectTypeModal/ProjectTypeModal';
import { STATUS } from '../../../../core/constants/constantValues';
import { validateRequired } from '../../../../core/utils/Utils';
import { showErrorToast, showSuccessToast } from '../../../../core/utils/toast';
import CompanyAdminService from '../../../../core/service/CompanyAdminService';

interface Project {
  id: string;
  name: string;
  clientName: string;
  projectManager?: string;
  location?: string;
  drawing?: string;
  drawingFileType?: 'pdf' | 'image';
  type: string;
  category: string;
  projectCost?: number;
  status: string;
  startDate: string;
  endDate: string;
  progress?: number;
}

const ITEMS_PER_PAGE = 10;

type NewProjectForm = {
  client: string;
  projectType: string;
  projectCategory: string;
  projectStatus: string;
  name: string;
  projectCost: string;
  area: string;
  location: string;
  startDate: string;
  endDate: string;
  projectManager: string;
  storeIncharge: string;
  siteOperations: string;
  remarks: string;
};

const initialNewProject: NewProjectForm = {
  client: '',
  projectType: '',
  projectCategory: '',
  projectStatus: '',
  name: '',
  projectCost: '',
  area: '',
  location: '',
  startDate: '',
  endDate: '',
  projectManager: '',
  storeIncharge: '',
  siteOperations: '',
  remarks: '',
};

type ClientOption = {
  id: string;
  name: string;
};

type ProjectCategoryOption = {
  id: string;
  name: string;
  description?: string;
  status: string;
};

type ProjectTypeOption = {
  id: string;
  name: string;
  description?: string;
  status: string;
};

const DUMMY_STATUSES = ['ACTIVE', 'PENDING', 'COMPLETED', 'ON_HOLD'];
const DUMMY_MANAGERS = ['Ahmed Khan', 'Fatima Al Zahra', 'Rahul Menon', 'Mohammed Ali', 'Sara Youssef'];
const DUMMY_STORE_INCHARGE = ['Sara Youssef', 'Rahul Menon', 'Store User 1'];

const MAX_DRAWING_FILE_SIZE_BYTES = 30 * 1024; // 30KB
const ACCEPTED_DRAWING_TYPES = 'application/pdf,image/*';

const CompanyProjectsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<NewProjectForm>(initialNewProject);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewProjectForm, string>>>({});
  const [drawingFile, setDrawingFile] = useState<File | null>(null);
  const [drawingFileError, setDrawingFileError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isClientsLoading, setIsClientsLoading] = useState(false);
  const [clientCreateModalOpen, setClientCreateModalOpen] = useState(false);
  const [projectCategories, setProjectCategories] = useState<ProjectCategoryOption[]>([]);
  const [isProjectCategoriesLoading, setIsProjectCategoriesLoading] = useState(false);
  const [projectCategoryModalOpen, setProjectCategoryModalOpen] = useState(false);
  const [isSavingProjectCategory, setIsSavingProjectCategory] = useState(false);
  const [projectTypes, setProjectTypes] = useState<ProjectTypeOption[]>([]);
  const [isProjectTypesLoading, setIsProjectTypesLoading] = useState(false);
  const [projectTypeModalOpen, setProjectTypeModalOpen] = useState(false);
  const [isSavingProjectType, setIsSavingProjectType] = useState(false);

  const mapProjectRow = useCallback((project: any): Project => {
    const drawingName =
      project?.drawing ??
      project?.drawingName ??
      project?.drawingFileName ??
      project?.projectDrawing ??
      '';
    const lowerDrawingName = String(drawingName || '').toLowerCase();

    const rawStatus = project?.status ?? (project?.isActive === false ? 'INACTIVE' : 'ACTIVE');
    const status = String(rawStatus || 'ACTIVE').toUpperCase();

    return {
      id: project?.id ?? project?.projectCode ?? '',
      name: project?.projectName ?? project?.name ?? '',
      clientName:
        project?.client?.name ??
        project?.clientName ??
        project?.client?.companyName ??
        '—',
      projectManager:
        project?.projectManager?.name ??
        project?.projectManagerName ??
        project?.projectManager ??
        undefined,
      location: project?.location ?? project?.projectLocation ?? undefined,
      drawing: drawingName || undefined,
      drawingFileType: drawingName
        ? (lowerDrawingName.endsWith('.pdf') ? 'pdf' : 'image')
        : undefined,
      type:
        project?.projectType?.projectType ??
        project?.projectTypeName ??
        project?.projectType ??
        '',
      category:
        project?.projectCategory?.projectCategory ??
        project?.projectCategoryName ??
        project?.projectCategory ??
        '',
      projectCost:
        project?.projectCost !== undefined && project?.projectCost !== null
          ? Number(project.projectCost)
          : undefined,
      status,
      startDate: project?.startDate ?? project?.start_date ?? new Date().toISOString(),
      endDate: project?.endDate ?? project?.end_date ?? new Date().toISOString(),
      progress:
        project?.progress !== undefined && project?.progress !== null
          ? Number(project.progress)
          : undefined,
    };
  }, []);

  const fetchAllClients = useCallback(async () => {
    setIsClientsLoading(true);
    try {
      const response = await CompanyAdminService.getAllClients({ isActive: true });
      const responseClients = Array.isArray(response?.data?.data) ? response.data.data : [];
      const mappedClients: ClientOption[] = responseClients
        .map((client: { id?: string; name?: string }) => ({
          id: client?.id ?? '',
          name: client?.name ?? '',
        }))
        .filter((client: ClientOption) => client.id && client.name);
      setClients(mappedClients);
    } catch (error) {
      setClients([]);
      showErrorToast('Failed to load clients');
    } finally {
      setIsClientsLoading(false);
    }
  }, []);

  const fetchAllProjectCategories = useCallback(async () => {
    setIsProjectCategoriesLoading(true);
    try {
      const response = await CompanyAdminService.getAllProjectCategories({ isActive: true });
      const responseCategories = Array.isArray(response?.data?.data) ? response.data.data : [];
      const mappedCategories: ProjectCategoryOption[] = responseCategories
        .map((category: { id?: string; projectCategory?: string; description?: string; isActive?: boolean }) => ({
          id: category?.id ?? '',
          name: category?.projectCategory ?? '',
          description: category?.description ?? '',
          status: category?.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        }))
        .filter((category: ProjectCategoryOption) => category.id && category.name);
      setProjectCategories(mappedCategories);
    } catch (error) {
      setProjectCategories([]);
      showErrorToast('Failed to load project categories');
    } finally {
      setIsProjectCategoriesLoading(false);
    }
  }, []);

  const fetchAllProjectTypes = useCallback(async () => {
    setIsProjectTypesLoading(true);
    try {
      const response = await CompanyAdminService.getAllProjectTypes({ isActive: true });
      const responseTypes = Array.isArray(response?.data?.data) ? response.data.data : [];
      const mappedTypes: ProjectTypeOption[] = responseTypes
        .map((type: { id?: string; projectType?: string; description?: string; isActive?: boolean }) => ({
          id: type?.id ?? '',
          name: type?.projectType ?? '',
          description: type?.description ?? '',
          status: type?.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
        }))
        .filter((type: ProjectTypeOption) => type.id && type.name);
      setProjectTypes(mappedTypes);
    } catch (error) {
      setProjectTypes([]);
      showErrorToast('Failed to load project types');
    } finally {
      setIsProjectTypesLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setIsProjectsLoading(true);
    try {
      const response = await CompanyAdminService.getProjects({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        clientId: clientFilter || undefined,
        status: statusFilter || undefined,
      });
      const data = Array.isArray(response?.data?.data) ? response.data.data : [];
      const mappedProjects = data.map(mapProjectRow);
      setProjects(mappedProjects);

      const pagination = response?.data?.pagination;
      setTotalPages(pagination?.pages || 1);
      setTotalItems(pagination?.total || 0);
    } catch (error) {
      setProjects([]);
      setTotalPages(1);
      setTotalItems(0);
      showErrorToast('Failed to load projects');
    } finally {
      setIsProjectsLoading(false);
    }
  }, [clientFilter, currentPage, mapProjectRow, statusFilter]);

  useEffect(() => {
    fetchAllClients();
  }, [fetchAllClients]);

  useEffect(() => {
    fetchAllProjectCategories();
  }, [fetchAllProjectCategories]);

  useEffect(() => {
    fetchAllProjectTypes();
  }, [fetchAllProjectTypes]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-success">{t('CompanyProjectsList.statusActive')}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-primary">{t('CompanyProjectsList.statusCompleted')}</Badge>;
      case 'PENDING':
        return <Badge className="bg-warning text-dark">{t('CompanyProjectsList.statusPending')}</Badge>;
      case 'ON_HOLD':
        return <Badge className="bg-secondary">{t('CompanyProjectsList.statusOnHold')}</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatCost = (cost?: number) =>
    cost != null
      ? cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '—';

  const handleOpenCreateModal = () => {
    setNewProject(initialNewProject);
    setFormErrors({});
    setDrawingFile(null);
    setDrawingFileError(null);
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNewProject(initialNewProject);
    setFormErrors({});
    setDrawingFile(null);
    setDrawingFileError(null);
  };

  const handleDrawingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setDrawingFileError(null);
    if (!file) {
      setDrawingFile(null);
      return;
    }
    if (file.size > MAX_DRAWING_FILE_SIZE_BYTES) {
      setDrawingFileError(t('CompanyProjectsList.form.drawingFileSizeError'));
      setDrawingFile(null);
      e.target.value = '';
      return;
    }
    setDrawingFile(file);
  };

  const handleRemoveDrawingFile = () => {
    setDrawingFile(null);
    setDrawingFileError(null);
  };

  const handleNewProjectChange = (field: keyof NewProjectForm, value: string) => {
    setNewProject((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateProject = () => {
    const clientVal = validateRequired(newProject.client, 'field');
    const typeVal = validateRequired(newProject.projectType, 'field');
    const categoryVal = validateRequired(newProject.projectCategory, 'field');
    const statusVal = validateRequired(newProject.projectStatus, 'field');
    const nameVal = validateRequired(newProject.name, 'name');
    const costVal = validateRequired(newProject.projectCost, 'field');
    const locationVal = validateRequired(newProject.location, 'field');
    const managerVal = validateRequired(newProject.projectManager, 'field');
    const storeVal = validateRequired(newProject.storeIncharge, 'field');
    const siteOpsVal = validateRequired(newProject.siteOperations, 'field');

    const errors: Partial<Record<keyof NewProjectForm, string>> = {};
    if (!clientVal.isValid) errors.client = clientVal.errorMessage;
    if (!typeVal.isValid) errors.projectType = typeVal.errorMessage;
    if (!categoryVal.isValid) errors.projectCategory = categoryVal.errorMessage;
    if (!statusVal.isValid) errors.projectStatus = statusVal.errorMessage;
    if (!nameVal.isValid) errors.name = nameVal.errorMessage;
    if (!costVal.isValid) errors.projectCost = costVal.errorMessage;
    if (!locationVal.isValid) errors.location = locationVal.errorMessage;
    if (!managerVal.isValid) errors.projectManager = managerVal.errorMessage;
    if (!storeVal.isValid) errors.storeIncharge = storeVal.errorMessage;
    if (!siteOpsVal.isValid) errors.siteOperations = siteOpsVal.errorMessage;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const clientName = clients.find((c) => c.id === newProject.client)?.name ?? newProject.client;
    const projectTypeName =
      projectTypes.find((type) => type.id === newProject.projectType)?.name ??
      newProject.projectType;
    const projectCategoryName =
      projectCategories.find((category) => category.id === newProject.projectCategory)?.name ??
      newProject.projectCategory;
    const projectCostNum = parseFloat(newProject.projectCost) || 0;
    const nextId = `TMP-${Date.now()}`;
    const startDate = newProject.startDate || new Date().toISOString().slice(0, 10);
    const endDate = newProject.endDate || startDate;

    const created: Project = {
      id: nextId,
      name: newProject.name.trim(),
      clientName,
      projectManager: newProject.projectManager || undefined,
      location: newProject.location.trim() || undefined,
      drawing: drawingFile?.name?.trim() || undefined,
      type: projectTypeName.trim(),
      category: projectCategoryName.trim(),
      projectCost: projectCostNum,
      status: newProject.projectStatus,
      startDate,
      endDate,
      progress: 0,
    };
    setProjects((prev) => [created, ...prev]);
    showSuccessToast(t('CompanyProjectsList.createdSuccessfully'));
    handleCloseCreateModal();
  };

  const handleCreateProjectCategory = async (categoryData: ProjectCategoryFormData) => {
    setIsSavingProjectCategory(true);
    try {
      const payload = {
        projectCategory: categoryData.name.trim(),
        description: categoryData.description.trim() || undefined,
        isActive: categoryData.status === STATUS.ACTIVE,
      };
      const response = await CompanyAdminService.createProjectCategory(payload);
      const createdCategoryId = response?.data?.data?.id;
      await fetchAllProjectCategories();
      if (createdCategoryId) {
        handleNewProjectChange('projectCategory', createdCategoryId);
      }
      showSuccessToast(response?.data?.message || t('CompanyProjectCategories.createdSuccessfully'));
    } finally {
      setIsSavingProjectCategory(false);
    }
  };

  const handleCreateProjectType = async (typeData: ProjectTypeFormData) => {
    setIsSavingProjectType(true);
    try {
      const payload = {
        projectType: typeData.name.trim(),
        description: typeData.description.trim() || undefined,
        isActive: typeData.status === STATUS.ACTIVE,
      };
      const response = await CompanyAdminService.createProjectType(payload);
      const createdProjectTypeId = response?.data?.data?.id;
      await fetchAllProjectTypes();
      if (createdProjectTypeId) {
        handleNewProjectChange('projectType', createdProjectTypeId);
      }
      showSuccessToast(response?.data?.message || t('CompanyProjectTypes.createdSuccessfully'));
    } finally {
      setIsSavingProjectType(false);
    }
  };

  const handleClientCreated = async (createdClient?: { id?: string }) => {
    await fetchAllClients();
    if (createdClient?.id) {
      handleNewProjectChange('client', createdClient.id);
    }
    setClientCreateModalOpen(false);
  };

  const handleOpenProjectOverview = (project: Project) => {
    navigate(`/company/projects/${project.id}/overview`, { state: { project } });
  };

  return (
    <>
      <Breadcrumbs
        title={t('CompanyProjectsList.pageTitle')}
        breadcrumbItem={t('CompanyProjectsList.breadcrumbItem')}
        breadcrumbParent={t('CompanyProjectsList.breadcrumbParent')}
        link="/company/projects"
      />

      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2 flex-grow-1 me-2">
                  <Input
                    type="select"
                    value={clientFilter}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setClientFilter(e.target.value);
                    }}
                    style={{ maxWidth: 260 }}
                  >
                    <option value="">{t('CompanyProjectsList.form.selectClient')}</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Input>
                  <Input
                    type="select"
                    value={statusFilter}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setStatusFilter(e.target.value);
                    }}
                    style={{ maxWidth: 220 }}
                  >
                    <option value="">{t('Common.all')}</option>
                    {DUMMY_STATUSES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === 'ON_HOLD'
                          ? t('CompanyProjectsList.statusOnHold')
                          : t(`CompanyProjectsList.status${opt.charAt(0) + opt.slice(1).toLowerCase()}`)}
                      </option>
                    ))}
                  </Input>
                </div>
                <Button
                  color="primary"
                  className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                  onClick={handleOpenCreateModal}
                >
                  <i className="bx bx-plus me-1" />
                  {t('CompanyProjectsList.addProject')}
                </Button>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('CompanyProjectsList.table.id')}</th>
                      <th>{t('CompanyProjectsList.table.name')}</th>
                      <th>{t('CompanyProjectsList.table.client')}</th>
                      <th>{t('CompanyProjectsList.table.projectManager')}</th>
                      <th>{t('CompanyProjectsList.table.location')}</th>
                      <th>{t('CompanyProjectsList.table.drawing')}</th>
                      <th>{t('CompanyProjectsList.table.type')}</th>
                      <th>{t('CompanyProjectsList.table.category')}</th>
                      <th>{t('CompanyProjectsList.table.projectCost')}</th>
                      <th>{t('CompanyProjectsList.table.startDate')}</th>
                      <th>{t('CompanyProjectsList.table.endDate')}</th>
                      <th>{t('CompanyProjectsList.table.progress')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('Common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isProjectsLoading ? (
                      <tr>
                        <td colSpan={14} className="text-center py-5">
                          <Spinner color="primary" />
                          <p className="mt-2 text-muted mb-0">{t('Common.loading')}</p>
                        </td>
                      </tr>
                    ) : projects.length > 0 ? (
                      projects.map((project) => (
                        <tr key={project.id}>
                          <td>
                            <span className="fw-medium">{project.id}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-decoration-none fw-medium"
                              onClick={() => handleOpenProjectOverview(project)}
                              title={t('CompanyProjectsList.openOverview')}
                            >
                              {project.name}
                            </button>
                          </td>
                          <td>{project.clientName}</td>
                          <td>{project.projectManager ?? '—'}</td>
                          <td>{project.location ?? '—'}</td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {project.drawingFileType && (
                                <div className="d-flex align-items-center gap-1 flex-wrap">
                                  <Badge color="light" className="badge-soft-danger font-size-11">
                                    {project.drawingFileType === 'pdf' ? (
                                      <>
                                        <i className="bx bxs-file-pdf me-1" />
                                        {project.drawing ?? '—'}
                                      </>
                                    ) : (
                                      <>
                                        <i className="bx bxs-file-image me-1" />
                                        {t('CompanyProjectsList.drawingImage')}
                                      </>
                                    )}
                                  </Badge>
                                  
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <Badge color="light" className="badge-soft-primary font-size-12">
                              {project.type}
                            </Badge>
                          </td>
                          <td>{project.category}</td>
                          <td>
                            <Badge color="white" className="d-inline-flex align-items-center px-1 border border-primary text-primary">
                              <i className="bx bx-rupee me-1" />
                              {formatCost(project.projectCost)}
                            </Badge>
                          </td>
                          <td>{formatDate(project.startDate)}</td>
                          <td>{formatDate(project.endDate)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1 progress progress-sm">
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{ width: `${project.progress ?? 0}%` }}
                                  aria-valuenow={project.progress ?? 0}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <span className="ms-2 font-size-12">
                                {project.progress ?? 0}%
                              </span>
                            </div>
                          </td>
                          <td>{getStatusBadge(project.status)}</td>
                          <td>
                            <div className="d-flex gap-1 align-items-center">
                              <Button
                                color="outline-primary"
                                className="border-0 btn-sm"
                                title={t('Common.view')}
                              >
                                <i className="mdi mdi-eye" />
                              </Button>
                              <Button
                                color="outline-secondary"
                                className="border-0 btn-sm"
                                title={t('Common.edit')}
                              >
                                <i className="mdi mdi-pencil" />
                              </Button>
                              <Button
                                color="outline-danger"
                                className="border-0 btn-sm"
                                title={t('Common.delete')}
                              >
                                <i className="mdi mdi-delete" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={14} className="text-center py-4">
                          <p className="text-muted mb-0">
                            {t('CompanyProjectsList.noProjectsFound')}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {totalItems > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={createModalOpen} toggle={handleCloseCreateModal} size="lg" centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {t('CompanyProjectsList.addProject')}
        </ModalHeader>
        <ModalBody className='px-4'>
          <Row>
            <Col md="6" className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <Label className="form-label fw-semibold mb-0">
                  {t('CompanyProjectsList.form.client')} <span className="text-danger">*</span>
                </Label>
                <Button
                  type="button"
                  color="link"
                  className="p-0 border-0 text-primary"
                  onClick={() => setClientCreateModalOpen(true)}
                >
                  + {t('Common.add')}
                </Button>
              </div>
              <Input
                type="select"
                value={newProject.client}
                onChange={(e) => handleNewProjectChange('client', e.target.value)}
                invalid={!!formErrors.client}
              >
                <option value="">
                  {isClientsLoading
                    ? t('Common.loading') || 'Loading...'
                    : t('CompanyProjectsList.form.selectClient')}
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Input>
              {formErrors.client && <FormFeedback>{t(formErrors.client)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <Label className="form-label fw-semibold mb-0">
                  {t('CompanyProjectsList.form.projectType')} <span className="text-danger">*</span>
                </Label>
                <Button
                  type="button"
                  color="link"
                  className="p-0 border-0 text-primary"
                  onClick={() => setProjectTypeModalOpen(true)}
                >
                  + {t('Common.add')}
                </Button>
              </div>
              <Input
                type="select"
                value={newProject.projectType}
                onChange={(e) => handleNewProjectChange('projectType', e.target.value)}
                invalid={!!formErrors.projectType}
              >
                <option value="">
                  {isProjectTypesLoading
                    ? t('Common.loading') || 'Loading...'
                    : t('CompanyProjectsList.form.selectProjectType')}
                </option>
                {projectTypes.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </Input>
              {formErrors.projectType && <FormFeedback>{t(formErrors.projectType)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <Label className="form-label fw-semibold mb-0">
                  {t('CompanyProjectsList.form.projectCategory')} <span className="text-danger">*</span>
                </Label>
                <Button
                  type="button"
                  color="link"
                  className="p-0 border-0 text-primary"
                  onClick={() => setProjectCategoryModalOpen(true)}
                >
                  + {t('Common.add')}
                </Button>
              </div>
              <Input
                type="select"
                value={newProject.projectCategory}
                onChange={(e) => handleNewProjectChange('projectCategory', e.target.value)}
                invalid={!!formErrors.projectCategory}
              >
                <option value="">
                  {isProjectCategoriesLoading
                    ? t('Common.loading') || 'Loading...'
                    : t('CompanyProjectsList.form.selectProjectCategory')}
                </option>
                {projectCategories.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </Input>
              {formErrors.projectCategory && <FormFeedback>{t(formErrors.projectCategory)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectsList.form.projectStatus')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={newProject.projectStatus}
                onChange={(e) => handleNewProjectChange('projectStatus', e.target.value)}
                invalid={!!formErrors.projectStatus}
              >
                <option value="">{t('CompanyProjectsList.form.selectProjectStatus')}</option>
                {DUMMY_STATUSES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'ON_HOLD' ? t('CompanyProjectsList.statusOnHold') : t(`CompanyProjectsList.status${opt.charAt(0) + opt.slice(1).toLowerCase()}`)}
                  </option>
                ))}
              </Input>
              {formErrors.projectStatus && <FormFeedback>{t(formErrors.projectStatus)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectsList.form.projectName')} <span className="text-danger">*</span>
              </Label>
              <Input
                value={newProject.name}
                onChange={(e) => handleNewProjectChange('name', e.target.value)}
                invalid={!!formErrors.name}
                placeholder={t('CompanyProjectsList.form.placeholderProjectName')}
              />
              {formErrors.name && <FormFeedback>{t(formErrors.name)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectsList.form.projectCost')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={newProject.projectCost}
                onChange={(e) => handleNewProjectChange('projectCost', e.target.value)}
                invalid={!!formErrors.projectCost}
                placeholder={t('CompanyProjectsList.form.placeholderEstimatedCost')}
              />
              {formErrors.projectCost && <FormFeedback>{t(formErrors.projectCost)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold">{t('CompanyProjectsList.form.area')}</Label>
              <Input
                value={newProject.area}
                onChange={(e) => handleNewProjectChange('area', e.target.value)}
                placeholder={t('CompanyProjectsList.form.placeholderArea')}
              />
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectsList.table.location')} <span className="text-danger">*</span>
              </Label>
              <Input
                value={newProject.location}
                onChange={(e) => handleNewProjectChange('location', e.target.value)}
                invalid={!!formErrors.location}
                placeholder={t('CompanyProjectsList.form.placeholderLocation')}
              />
              {formErrors.location && <FormFeedback>{t(formErrors.location)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold">{t('CompanyProjectsList.form.startDate')}</Label>
              <Input
                type="date"
                value={newProject.startDate}
                onChange={(e) => handleNewProjectChange('startDate', e.target.value)}
              />
            </Col>
            <Col md="6" className="mb-3">
              <Label className="form-label fw-semibold">{t('CompanyProjectsList.form.finishDate')}</Label>
              <Input
                type="date"
                value={newProject.endDate}
                onChange={(e) => handleNewProjectChange('endDate', e.target.value)}
              />
            </Col>
            <Col md="6" className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <Label className="form-label fw-semibold mb-0">
                  {t('CompanyProjectsList.form.assignProjectManager')} <span className="text-danger">*</span>
                </Label>
                <span className='border-0 text-primary cursor-pointer' >
                  + {t('Common.add')}
                </span>
              </div>
              <Input
                type="select"
                value={newProject.projectManager}
                onChange={(e) => handleNewProjectChange('projectManager', e.target.value)}
                invalid={!!formErrors.projectManager}
              >
                <option value="">{t('CompanyProjectsList.form.selectProjectManager')}</option>
                {DUMMY_MANAGERS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Input>
              {formErrors.projectManager && <FormFeedback>{t(formErrors.projectManager)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <Label className="form-label fw-semibold mb-0">
                  {t('CompanyProjectsList.form.assignStoreIncharge')} <span className="text-danger">*</span>
                </Label>
                <span className='border-0 text-primary cursor-pointer' >
                  + {t('Common.add')}
                </span>
              </div>
              <Input
                type="select"
                value={newProject.storeIncharge}
                onChange={(e) => handleNewProjectChange('storeIncharge', e.target.value)}
                invalid={!!formErrors.storeIncharge}
              >
                <option value="">{t('CompanyProjectsList.form.selectOne')}</option>
                {DUMMY_STORE_INCHARGE.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Input>
              {formErrors.storeIncharge && <FormFeedback>{t(formErrors.storeIncharge)}</FormFeedback>}
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">
                {t('CompanyProjectsList.form.assignSiteOperations')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={newProject.siteOperations}
                onChange={(e) => handleNewProjectChange('siteOperations', e.target.value)}
                invalid={!!formErrors.siteOperations}
              >
                <option value="">{t('CompanyProjectsList.form.selectSiteOperations')}</option>
                {DUMMY_STORE_INCHARGE.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Input>
              {formErrors.siteOperations && <FormFeedback>{t(formErrors.siteOperations)}</FormFeedback>}
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">{t('CompanyProjectsList.form.remarks')}</Label>
              <Input
                type="textarea"
                rows={3}
                value={newProject.remarks}
                onChange={(e) => handleNewProjectChange('remarks', e.target.value)}
                placeholder={t('CompanyProjectsList.form.placeholderRemarks')}
              />
            </Col>
            <Col md="12" className="mb-3">
              <Label className="form-label fw-semibold">{t('CompanyProjectsList.form.drawingsUpload')}</Label>
              <Input
                type="file"
                accept={ACCEPTED_DRAWING_TYPES}
                onChange={handleDrawingFileChange}
                invalid={!!drawingFileError}
              />
              {drawingFileError && (
                <FormFeedback>{drawingFileError}</FormFeedback>
              )}
              {drawingFile && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="font-size-12 text-muted">
                    {drawingFile.name} ({(drawingFile.size / 1024).toFixed(2)} KB)
                  </span>
                  <Button type="button" color="link" className="p-0 font-size-12" onClick={handleRemoveDrawingFile}>
                    {t('Common.delete')}
                  </Button>
                </div>
              )}
              <small className="text-muted d-block mt-1">
                {t('CompanyProjectsList.form.drawingFileHint')}
              </small>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseCreateModal}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleCreateProject}>
            {t('Common.create')}
          </Button>
        </ModalFooter>
      </Modal>

      <ProjectCategoryModal
        isOpen={projectCategoryModalOpen}
        toggle={() => setProjectCategoryModalOpen(false)}
        onSubmit={handleCreateProjectCategory}
        title={t('CompanyProjectCategories.addProjectCategory')}
        submitLabel={isSavingProjectCategory ? t('Common.loading') : t('Common.create')}
        initialData={{
          name: '',
          description: '',
          status: STATUS.ACTIVE,
        }}
      />

      <ProjectTypeModal
        isOpen={projectTypeModalOpen}
        toggle={() => setProjectTypeModalOpen(false)}
        onSubmit={handleCreateProjectType}
        title={t('CompanyProjectTypes.addProjectType')}
        submitLabel={isSavingProjectType ? t('Common.loading') : t('Common.create')}
        initialData={{
          name: '',
          description: '',
          status: STATUS.ACTIVE,
        }}
      />

      <Modal
        isOpen={clientCreateModalOpen}
        toggle={() => setClientCreateModalOpen(false)}
        size="xl"
        centered
      >
        <ModalHeader toggle={() => setClientCreateModalOpen(false)}>
          {t('CompanyClientsList.newCustomer')}
        </ModalHeader>
        <ModalBody className="p-0">
          <CompanyClientCreate
            embedded
            onCancel={() => setClientCreateModalOpen(false)}
            onSuccess={handleClientCreated}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default CompanyProjectsList;
