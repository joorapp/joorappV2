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
  FormFeedback,
} from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import { validateRequired } from '../../../../core/utils/Utils';
import { showSuccessToast } from '../../../../core/utils/toast';

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

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-1001',
    name: 'Marina Tower Phase 1',
    clientName: 'Gulf Properties LLC',
    projectManager: 'Ahmed Khan',
    location: 'Dubai Marina, Dubai',
    drawing: 'DRW-MT1-2025.pdf',
    drawingFileType: 'pdf',
    type: 'Commercial',
    category: 'High-rise',
    projectCost: 2450000,
    status: 'ACTIVE',
    startDate: '2025-01-15',
    endDate: '2026-06-30',
    progress: 45,
  },
  {
    id: 'PRJ-1002',
    name: 'Al Nahda Residential Complex',
    clientName: 'Emirates Housing',
    projectManager: 'Fatima Al Zahra',
    location: 'Al Nahda, Sharjah',
    drawing: 'DRW-ANR-001.pdf',
    drawingFileType: 'image',
    type: 'Residential',
    category: 'Multi-unit',
    projectCost: 1890000,
    status: 'ACTIVE',
    startDate: '2025-03-01',
    endDate: '2026-12-31',
    progress: 22,
  },
  {
    id: 'PRJ-1003',
    name: 'Business Bay Office Fit-out',
    clientName: 'Delta Investments',
    projectManager: 'Rahul Menon',
    location: 'Business Bay, Dubai',
    drawing: 'DRW-BBO-042.pdf',
    drawingFileType: 'image',
    type: 'Commercial',
    category: 'Interior',
    projectCost: 520000,
    status: 'COMPLETED',
    startDate: '2024-08-01',
    endDate: '2025-02-28',
    progress: 100,
  },
  {
    id: 'PRJ-1004',
    name: 'Sharjah Warehouse Expansion',
    clientName: 'Logistics Plus',
    projectManager: 'Ahmed Khan',
    location: 'Industrial Area, Sharjah',
    drawing: 'DRW-SWE-012.pdf',
    drawingFileType: 'pdf',
    type: 'Industrial',
    category: 'Warehouse',
    projectCost: 980000,
    status: 'PENDING',
    startDate: '2026-04-01',
    endDate: '2026-10-31',
    progress: 0,
  },
  {
    id: 'PRJ-1005',
    name: 'Palm View Villas',
    clientName: 'Luxury Estates',
    projectManager: 'Mohammed Ali',
    location: 'Palm Jumeirah, Dubai',
    drawing: 'DRW-PV-008.pdf',
    drawingFileType: 'pdf',
    type: 'Residential',
    category: 'Villa',
    projectCost: 3100000,
    status: 'ACTIVE',
    startDate: '2025-06-15',
    endDate: '2027-03-31',
    progress: 18,
  },
];

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

const DUMMY_CLIENTS = [
  { id: '1', name: 'Gulf Properties LLC' },
  { id: '2', name: 'Emirates Housing' },
  { id: '3', name: 'Delta Investments' },
  { id: '4', name: 'Logistics Plus' },
  { id: '5', name: 'Luxury Estates' },
];

const DUMMY_PROJECT_TYPES = ['Commercial', 'Residential', 'Industrial'];
const DUMMY_PROJECT_CATEGORIES = ['High-rise', 'Multi-unit', 'Interior', 'Warehouse', 'Villa'];
const DUMMY_STATUSES = ['ACTIVE', 'PENDING', 'COMPLETED', 'ON_HOLD'];
const DUMMY_MANAGERS = ['Ahmed Khan', 'Fatima Al Zahra', 'Rahul Menon', 'Mohammed Ali', 'Sara Youssef'];
const DUMMY_STORE_INCHARGE = ['Sara Youssef', 'Rahul Menon', 'Store User 1'];

const MAX_DRAWING_FILE_SIZE_BYTES = 30 * 1024; // 30KB
const ACCEPTED_DRAWING_TYPES = 'application/pdf,image/*';

const CompanyProjectsList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<NewProjectForm>(initialNewProject);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewProjectForm, string>>>({});
  const [drawingFile, setDrawingFile] = useState<File | null>(null);
  const [drawingFileError, setDrawingFileError] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const term = searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.clientName.toLowerCase().includes(term) ||
        (p.projectManager && p.projectManager.toLowerCase().includes(term)) ||
        (p.location && p.location.toLowerCase().includes(term)) ||
        (p.drawing && p.drawing.toLowerCase().includes(term)) ||
        p.id.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

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

    const clientName = DUMMY_CLIENTS.find((c) => c.id === newProject.client)?.name ?? newProject.client;
    const projectCostNum = parseFloat(newProject.projectCost) || 0;
    const nextId = `PRJ-${1000 + projects.length + 1}`;
    const startDate = newProject.startDate || new Date().toISOString().slice(0, 10);
    const endDate = newProject.endDate || startDate;

    const created: Project = {
      id: nextId,
      name: newProject.name.trim(),
      clientName,
      projectManager: newProject.projectManager || undefined,
      location: newProject.location.trim() || undefined,
      drawing: drawingFile?.name?.trim() || undefined,
      type: newProject.projectType,
      category: newProject.projectCategory.trim(),
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
                    {paginatedProjects.length > 0 ? (
                      paginatedProjects.map((project) => (
                        <tr key={project.id}>
                          <td>
                            <span className="fw-medium">{project.id}</span>
                          </td>
                          <td>{project.name}</td>
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

              {filteredProjects.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProjects.length}
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
                <span className='border-0 text-primary cursor-pointer' >
                  + {t('Common.add')}
                </span>
              </div>
              <Input
                type="select"
                value={newProject.client}
                onChange={(e) => handleNewProjectChange('client', e.target.value)}
                invalid={!!formErrors.client}
              >
                <option value="">{t('CompanyProjectsList.form.selectClient')}</option>
                {DUMMY_CLIENTS.map((c) => (
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
                <span className='border-0 text-primary cursor-pointer' >
                  + {t('Common.add')}
                </span>
              </div>
              <Input
                type="select"
                value={newProject.projectType}
                onChange={(e) => handleNewProjectChange('projectType', e.target.value)}
                invalid={!!formErrors.projectType}
              >
                <option value="">{t('CompanyProjectsList.form.selectProjectType')}</option>
                {DUMMY_PROJECT_TYPES.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Input>
              {formErrors.projectType && <FormFeedback>{t(formErrors.projectType)}</FormFeedback>}
            </Col>
            <Col md="6" className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <Label className="form-label fw-semibold mb-0">
                  {t('CompanyProjectsList.form.projectCategory')} <span className="text-danger">*</span>
                </Label>
                <span className='border-0 text-primary cursor-pointer' >
                  + {t('Common.add')}
                </span>
              </div>
              <Input
                type="select"
                value={newProject.projectCategory}
                onChange={(e) => handleNewProjectChange('projectCategory', e.target.value)}
                invalid={!!formErrors.projectCategory}
              >
                <option value="">{t('CompanyProjectsList.form.selectProjectCategory')}</option>
                {DUMMY_PROJECT_CATEGORIES.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
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
    </>
  );
};

export default CompanyProjectsList;
