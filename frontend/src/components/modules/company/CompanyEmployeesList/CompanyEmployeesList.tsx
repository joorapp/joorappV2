import { useState, useMemo, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  Row,
  Col,
  Table,
  Badge,
  Input,
  InputGroup,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Label,
  FormFeedback,
} from 'reactstrap';
import { showSuccessToast } from '../../../../core/utils/toast';
import { validateEmail, validateRequired, validatePhone } from '../../../../core/utils/Utils';
import { STATUS } from '../../../../core/constants/constantValues';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import CompanyAdminService from '../../../../core/service/CompanyAdminService';
import JobTitleModal, { type JobTitleFormData } from '../../../common/JobTitleModal/JobTitleModal';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  buildingAddress: string;
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  role: string;
  salary: number;
  keycloakGlobalRole: string;
  isActive: boolean;
  lastLoginAt?: string;
  jobTitleId?: string;
  profileImageBase64?: string;
  profileImageName?: string;
}

interface JobTitleOption {
  id: string;
  jobTitle: string;
}

type NewEmployeeForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  buildingAddress: string;
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  jobTitleId: string;
  salary: string;
  profileImageBase64: string;
  profileImageName: string;
};

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'E-1001',
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.khan@demo-company.com',
    phone: '+971 50 111 0001',
    buildingAddress: 'Arabtec Tower',
    streetAddress: 'Sheikh Zayed Road',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '12345',
    role: 'Project Manager',
    salary: 8000,
    keycloakGlobalRole: 'COMPANY_ADMIN',
    isActive: true,
    lastLoginAt: '2026-02-20T09:30:00.000Z',
  },
  {
    id: 'E-1002',
    firstName: 'Fatima',
    lastName: 'Al Zahra',
    email: 'fatima.zahra@demo-company.com',
    phone: '+971 50 111 0002',
    buildingAddress: 'Engineering Plaza',
    streetAddress: 'Al Nahda Street',
    country: 'UAE',
    state: 'Sharjah',
    city: 'Sharjah',
    postalCode: '23456',
    role: 'Site Engineer',
    salary: 6500,
    keycloakGlobalRole: 'COMPANY_USER',
    isActive: true,
    lastLoginAt: '2026-02-22T14:15:00.000Z',
  },
  {
    id: 'E-1003',
    firstName: 'Rahul',
    lastName: 'Menon',
    email: 'rahul.menon@demo-company.com',
    phone: '+971 50 111 0003',
    buildingAddress: 'QS House',
    streetAddress: 'Business Bay',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '34567',
    role: 'Quantity Surveyor',
    salary: 7000,
    keycloakGlobalRole: 'COMPANY_USER',
    isActive: false,
    lastLoginAt: '2026-02-10T11:05:00.000Z',
  },
  {
    id: 'E-1004',
    firstName: 'Sara',
    lastName: 'Youssef',
    email: 'sara.youssef@demo-company.com',
    phone: '+971 50 111 0004',
    buildingAddress: 'Stores Block',
    streetAddress: 'Marina Walk',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '45678',
    role: 'Store Keeper',
    salary: 5000,
    keycloakGlobalRole: 'COMPANY_USER',
    isActive: true,
    lastLoginAt: '2026-02-25T08:45:00.000Z',
  },
  {
    id: 'E-1005',
    firstName: 'Mohammed',
    lastName: 'Ali',
    email: 'mohammed.ali@demo-company.com',
    phone: '+971 50 111 0005',
    buildingAddress: 'Finance Tower',
    streetAddress: 'Deira',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    postalCode: '56789',
    role: 'Accountant',
    salary: 7500,
    keycloakGlobalRole: 'COMPANY_USER',
    isActive: true,
    lastLoginAt: '2026-02-26T16:20:00.000Z',
  },
];

const ITEMS_PER_PAGE = 10;
void INITIAL_EMPLOYEES;
const getInitialEmployeeForm = (): NewEmployeeForm => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  buildingAddress: '',
  streetAddress: '',
  country: '',
  state: '',
  city: '',
  postalCode: '',
  jobTitleId: '',
  salary: '',
  profileImageBase64: '',
  profileImageName: '',
});

const CompanyEmployeesList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [employeeStatusTarget, setEmployeeStatusTarget] = useState<Employee | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [jobTitleModalOpen, setJobTitleModalOpen] = useState(false);
  const [jobTitleOptions, setJobTitleOptions] = useState<JobTitleOption[]>([]);
  const [jobTitlesLoading, setJobTitlesLoading] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const [newEmployee, setNewEmployee] = useState<NewEmployeeForm>(getInitialEmployeeForm());
  const [createErrors, setCreateErrors] = useState<Record<keyof NewEmployeeForm, string | undefined>>({
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    phone: undefined,
    buildingAddress: undefined,
    streetAddress: undefined,
    country: undefined,
    state: undefined,
    city: undefined,
    postalCode: undefined,
    jobTitleId: undefined,
    salary: undefined,
    profileImageBase64: undefined,
    profileImageName: undefined,
  });

  const getInitials = (employee: Employee): string => {
    const first = employee.firstName?.trim();
    const last = employee.lastName?.trim();
    if (first && last) {
      return (first[0] + last[0]).toUpperCase();
    }
    if (first) {
      return first.substring(0, 2).toUpperCase();
    }
    if (employee.email) {
      return employee.email.substring(0, 2).toUpperCase();
    }
    return 'EM';
  };

  const getAvatarColor = (employee: Employee): string => {
    const name = employee.firstName || employee.lastName || employee.email || 'Employee';
    const colors = [
      'bg-primary',
      'bg-success',
      'bg-info',
      'bg-warning',
      'bg-danger',
      'bg-secondary',
      'bg-dark',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-success">{t('EmployeeLists.statusActive')}</Badge>;
    }
    return <Badge className="bg-danger">{t('EmployeeLists.statusInactive')}</Badge>;
  };

  const getEmployeeName = (employee: Employee): string => {
    const first = employee.firstName?.trim();
    const last = employee.lastName?.trim();
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    if (last) return last;
    return employee.email;
  };

  const filteredEmployees = useMemo(() => employees, [employees]);
  const paginatedEmployees = filteredEmployees;

  const mapEmployeeFromApi = (employee: any): Employee => {
    const metadata = employee?.employeeMetadata || {};
    return {
      id: employee?.id || '',
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      buildingAddress: metadata?.buildingAddress || '',
      streetAddress: metadata?.streetAddress || '',
      country: metadata?.country || '',
      state: metadata?.state || '',
      city: metadata?.city || '',
      postalCode: metadata?.postalCode || '',
      role: employee?.jobTitle?.jobTitle || '',
      jobTitleId: employee?.jobTitleId || employee?.jobTitle?.id || '',
      salary: Number(employee?.salary || 0),
      keycloakGlobalRole: employee?.keycloakGlobalRole || '',
      isActive: Boolean(employee?.isActive),
      lastLoginAt: employee?.lastLoginAt || undefined,
      profileImageBase64: metadata?.profileImageBase64 || '',
      profileImageName: metadata?.profileImageName || '',
    };
  };

  const fetchEmployees = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await CompanyAdminService.getEmployees({
        page,
        limit: ITEMS_PER_PAGE,
        search,
        sortBy: 'email',
        sortOrder: 'ASC',
      });

      const employeesData = response?.data?.data || [];
      const mappedEmployees: Employee[] = employeesData.map((employee: any) => mapEmployeeFromApi(employee));

      setEmployees(mappedEmployees);
      setTotalPages(response?.data?.pagination?.pages || 1);
      setTotalItems(response?.data?.pagination?.total || 0);
      setCurrentPage(response?.data?.pagination?.page || page);
    } catch (error) {
      // Error notifications are handled globally.
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobTitleOptions = useCallback(async () => {
    setJobTitlesLoading(true);
    try {
      const response = await CompanyAdminService.getAllEmployeeJobTitles({ isActive: true });
      const options: JobTitleOption[] = (response?.data?.data || [])
        .map((item: any) => ({
          id: item?.id || item?.jobTitle || '',
          jobTitle: item?.jobTitle || '',
        }))
        .filter((item: JobTitleOption) => item.jobTitle.trim().length > 0);
      setJobTitleOptions(options);
      return options;
    } catch (error) {
      // Error notifications are handled globally.
      console.error('Error fetching job title options:', error);
      setJobTitleOptions([]);
      return [] as JobTitleOption[];
    } finally {
      setJobTitlesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees(currentPage, searchTerm);
  }, [currentPage, fetchEmployees]);

  useEffect(() => {
    fetchJobTitleOptions();
  }, [fetchJobTitleOptions]);

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchEmployees(1, searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 400);

    setSearchDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm, currentPage, fetchEmployees]);

  const resetCreateForm = () => {
    setNewEmployee(getInitialEmployeeForm());
    setCreateErrors({
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      buildingAddress: undefined,
      streetAddress: undefined,
      country: undefined,
      state: undefined,
      city: undefined,
      postalCode: undefined,
      jobTitleId: undefined,
      salary: undefined,
      profileImageBase64: undefined,
      profileImageName: undefined,
    });
  };

  const handleOpenCreateModal = () => {
    setEditingEmployeeId(null);
    resetCreateForm();
    setCreateModalOpen(true);
    fetchJobTitleOptions();
  };

  const handleView = async (employee: Employee) => {
    setViewModalOpen(true);
    setViewLoading(true);
    try {
      const response = await CompanyAdminService.getEmployeeById(employee.id);
      const row = response?.data?.data;
      if (row) {
        setSelectedEmployee(mapEmployeeFromApi(row));
      } else {
        setSelectedEmployee(employee);
      }
    } catch (error) {
      // Error notifications are handled globally.
      console.error('Error fetching employee details:', error);
      setSelectedEmployee(employee);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewLoading(false);
    setSelectedEmployee(null);
  };

  const handleNewEmployeeChange = (field: keyof NewEmployeeForm, value: string) => {
    setNewEmployee((prev) => ({ ...prev, [field]: value }));
    if (createErrors[field]) {
      setCreateErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setEditingEmployeeId(null);
    resetCreateForm();
  };

  const handleEditEmployee = async (employee: Employee) => {
    const options = await fetchJobTitleOptions();
    const resolvedJobTitleId =
      employee.jobTitleId ||
      options.find((item) => item.jobTitle.toLowerCase() === employee.role.toLowerCase())?.id ||
      '';

    setEditingEmployeeId(employee.id);
    setCreateErrors({
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      buildingAddress: undefined,
      streetAddress: undefined,
      country: undefined,
      state: undefined,
      city: undefined,
      postalCode: undefined,
      jobTitleId: undefined,
      salary: undefined,
      profileImageBase64: undefined,
      profileImageName: undefined,
    });
    setNewEmployee({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      buildingAddress: employee.buildingAddress || '',
      streetAddress: employee.streetAddress || '',
      country: employee.country || '',
      state: employee.state || '',
      city: employee.city || '',
      postalCode: employee.postalCode || '',
      jobTitleId: resolvedJobTitleId,
      salary: String(employee.salary || ''),
      profileImageBase64: employee.profileImageBase64 || '',
      profileImageName: employee.profileImageName || '',
    });
    setCreateModalOpen(true);
  };

  const handleCreateJobTitle = async (payload: JobTitleFormData) => {
    const response = await CompanyAdminService.createEmployeeJobTitle({
      jobTitle: payload.name.trim(),
      description: payload.description.trim() || undefined,
      isActive: payload.status === STATUS.ACTIVE,
    });
    const created = response?.data?.data;
    const createdTitle = created?.jobTitle || payload.name.trim();
    const createdId = created?.id || '';

    const refreshedOptions = await fetchJobTitleOptions();
    setNewEmployee((prev) => ({
      ...prev,
      jobTitleId:
        createdId ||
        refreshedOptions.find((item) => item.jobTitle.toLowerCase() === createdTitle.toLowerCase())
          ?.id ||
        prev.jobTitleId,
    }));
    setCreateErrors((prev) => ({
      ...prev,
      jobTitleId: undefined,
    }));
    showSuccessToast(t('CompanyJobTitles.createdSuccessfully'));
  };

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      setNewEmployee((prev) => ({
        ...prev,
        profileImageBase64: base64,
        profileImageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEmployee = async () => {
    const firstNameVal = validateRequired(newEmployee.firstName, 'firstName');
    const lastNameVal = validateRequired(newEmployee.lastName, 'lastName');
    const emailVal = validateEmail(newEmployee.email);
    const phoneVal = validatePhone(newEmployee.phone);
    const jobTitleVal = validateRequired(newEmployee.jobTitleId, 'jobTitle');

    const errors: Record<keyof NewEmployeeForm, string | undefined> = {
      firstName: firstNameVal.isValid ? undefined : firstNameVal.errorMessage,
      lastName: lastNameVal.isValid ? undefined : lastNameVal.errorMessage,
      email: emailVal.isValid ? undefined : emailVal.errorMessage,
      phone: phoneVal.isValid ? undefined : phoneVal.errorMessage,
      buildingAddress: undefined,
      streetAddress: undefined,
      country: undefined,
      state: undefined,
      city: undefined,
      postalCode: undefined,
      jobTitleId: jobTitleVal.isValid ? undefined : jobTitleVal.errorMessage,
      salary: undefined,
      profileImageBase64: undefined,
      profileImageName: undefined,
    };

    if (Object.values(errors).some((e) => e)) {
      setCreateErrors(errors);
      return;
    }

    try {
      setCreateSubmitting(true);
      const payload = {
        firstName: newEmployee.firstName.trim(),
        lastName: newEmployee.lastName.trim(),
        email: newEmployee.email.trim(),
        phone: newEmployee.phone.trim(),
        jobTitleId: newEmployee.jobTitleId,
        salary: Number(newEmployee.salary) || 0,
        isActive: true,
        employeeMetadata: {
          buildingAddress: newEmployee.buildingAddress.trim(),
          streetAddress: newEmployee.streetAddress.trim(),
          country: newEmployee.country.trim(),
          state: newEmployee.state.trim(),
          city: newEmployee.city.trim(),
          postalCode: newEmployee.postalCode.trim(),
          profileImageBase64: newEmployee.profileImageBase64,
          profileImageName: newEmployee.profileImageName,
        },
      };

      if (editingEmployeeId) {
        await CompanyAdminService.updateEmployee(editingEmployeeId, payload);
        showSuccessToast(t('EmployeeLists.employeeUpdatedSuccessfully'));
      } else {
        await CompanyAdminService.createEmployee(payload);
        showSuccessToast(t('EmployeeLists.employeeCreatedSuccessfully'));
      }
      handleCloseCreateModal();
      fetchEmployees(1, searchTerm);
      setCurrentPage(1);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenStatusModal = (employee: Employee) => {
    setEmployeeStatusTarget(employee);
    setStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setEmployeeStatusTarget(null);
  };

  const handleConfirmStatusToggle = async () => {
    if (!employeeStatusTarget?.id) return;

    try {
      setStatusLoading(true);
      await CompanyAdminService.updateEmployeeStatus(
        employeeStatusTarget.id,
        !employeeStatusTarget.isActive,
      );
      showSuccessToast(t('EmployeeLists.employeeUpdatedSuccessfully'));
      handleCloseStatusModal();
      fetchEmployees(1, searchTerm);
      setCurrentPage(1);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenDeleteModal = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete?.id) return;

    try {
      setDeleteLoading(true);
      await CompanyAdminService.deleteEmployee(employeeToDelete.id);
      showSuccessToast(t('EmployeeLists.employeeDeletedSuccessfully'));
      handleCloseDeleteModal();
      fetchEmployees(1, searchTerm);
      setCurrentPage(1);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        title={t('Navigation.employeeLists')}
        breadcrumbItem={t('Navigation.employeeLists')}
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
                <div className="d-flex align-items-center gap-2">
                  <Button
                    tag={Link}
                    to="/company/employees/job-titles"
                    color="light"
                    className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                  >
                    <i className="bx bx-briefcase-alt-2 me-1"></i>
                    {t('CompanySidebar.jobTitles')}
                  </Button>
                  <Button
                    color="primary"
                    className="btn-rounded waves-effect d-inline-flex align-items-center waves-light"
                    onClick={handleOpenCreateModal}
                  >
                    <i className="bx bx-plus me-1"></i>
                    {t('EmployeeLists.newEmployee')}
                  </Button>
                </div>
              </div>

              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('EmployeeLists.employee')}</th>
                      <th>{t('Common.phone')}</th>
                      <th>{t('Common.jobTitle')}</th>
                      <th>{t('Common.salary')}</th>
                      <th>{t('EmployeeLists.lastLogin')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('Common.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <Spinner size="sm" className="me-2" />
                          <span>{t('Common.loading')}</span>
                        </td>
                      </tr>
                    ) : paginatedEmployees.length > 0 ? (
                      paginatedEmployees.map((employee) => (
                        <tr key={employee.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className={`avatar-xs me-3 ${getAvatarColor(
                                  employee,
                                )} rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold`}
                              >
                                {getInitials(employee)}
                              </div>
                              <div>
                                <h5 className="mb-0 font-size-14">{getEmployeeName(employee)}</h5>
                                <p className="mb-0 text-muted font-size-12">{employee.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>{employee.phone}</td>
                          <td>{employee.role}</td>
                          <td>
                            <Badge
                              color="white"
                              className="d-inline-flex align-items-center px-1 border border-primary text-primary"
                            >
                              <i className="bx bx-rupee me-1" />
                              {employee.salary
                                ? employee.salary.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : '-'}
                            </Badge>
                          </td>
                          <td>
                            {employee.lastLoginAt
                              ? new Date(employee.lastLoginAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </td>
                          <td>{getStatusBadge(employee.isActive)}</td>
                          <td>
                            <div className="d-flex gap-1 align-items-center">
                              <input
                                type="checkbox"
                                className="switch switch-success"
                                id={`employee-status-${employee.id}`}
                                checked={employee.isActive}
                                onChange={() => handleOpenStatusModal(employee)}
                              />
                              <label htmlFor={`employee-status-${employee.id}`} />
                              <Button
                                color="outline-primary"
                                className="border-0 btn-sm"
                                title={t('Common.view')}
                                onClick={() => handleView(employee)}
                              >
                                <i className="mdi mdi-eye"></i>
                              </Button>
                              <Button
                                color="outline-secondary"
                                className="border-0 btn-sm"
                                title={t('Common.edit')}
                                onClick={() => handleEditEmployee(employee)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                className="border-0 btn-sm"
                                title={t('Common.delete')}
                                onClick={() => handleOpenDeleteModal(employee)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <p className="text-muted mb-0">{t('EmployeeLists.noEmployeesFound')}</p>
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
          {editingEmployeeId ? t('Common.edit') : t('EmployeeLists.createEmployee')}
        </ModalHeader>
        <ModalBody>
          <div className="row m-0">
            <div className="col-md-12 mb-4 d-flex flex-column align-items-center">
              <Label className="form-label fw-semibold mb-2">
                {t('NewClients.profilePhoto')}
              </Label>
              <div className="profile-photo-upload position-relative d-flex align-items-center justify-content-center">
                {newEmployee.profileImageBase64 ? (
                  <img
                    src={newEmployee.profileImageBase64}
                    alt="profile preview"
                    className="rounded-circle"
                    style={{ width: 80, height: 80, objectFit: 'cover' }}
                  />
                ) : (
                  <svg width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="40" fill="#e1e7ef" />
                    <circle cx="40" cy="32" r="14" fill="#ced6df" />
                    <ellipse cx="40" cy="60" rx="22" ry="14" fill="#ced6df" />
                  </svg>
                )}
                <div className="profile-upload-button">
                  <button
                    type="button"
                    className="btn btn-link p-0 border-0"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    <i className="mdi mdi-camera text-primary" />
                  </button>
                </div>
              </div>
              <Input
                innerRef={profileImageInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleProfileImageChange}
              />
              {newEmployee.profileImageName && (
                <small className="text-muted mt-1">{newEmployee.profileImageName}</small>
              )}
              <div className="profile-upload-helper-text">
                {t('NewClients.uploadProfilePhoto')}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.firstName')} <span className="text-danger">*</span>
              </Label>
              <Input
                value={newEmployee.firstName}
                onChange={(e) => handleNewEmployeeChange('firstName', e.target.value)}
                placeholder={t('EmployeeLists.enterFirstName')}
                invalid={!!createErrors.firstName}
              />
              {createErrors.firstName && (
                <FormFeedback>{t(createErrors.firstName)}</FormFeedback>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.lastName')} <span className="text-danger">*</span>
              </Label>
              <Input
                value={newEmployee.lastName}
                onChange={(e) => handleNewEmployeeChange('lastName', e.target.value)}
                placeholder={t('EmployeeLists.enterLastName')}
                invalid={!!createErrors.lastName}
              />
              {createErrors.lastName && (
                <FormFeedback>{t(createErrors.lastName)}</FormFeedback>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.email')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="email"
                value={newEmployee.email}
                onChange={(e) => handleNewEmployeeChange('email', e.target.value)}
                placeholder={t('EmployeeLists.enterEmail')}
                invalid={!!createErrors.email}
              />
              {createErrors.email && (
                <FormFeedback>{t(createErrors.email)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.phone')} <span className="text-danger">*</span>
              </Label>
              <Input
                value={newEmployee.phone}
                onChange={(e) => handleNewEmployeeChange('phone', e.target.value)}
                placeholder={t('EmployeeLists.enterPhone')}
                invalid={!!createErrors.phone}
              />
              {createErrors.phone && (
                <FormFeedback>{t(createErrors.phone)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('NewClients.labels.buildingAddress')}
              </Label>
              <Input
                value={newEmployee.buildingAddress}
                onChange={(e) => handleNewEmployeeChange('buildingAddress', e.target.value)}
                placeholder={t('NewClients.enterBuildingAddress')}
                invalid={!!createErrors.buildingAddress}
              />
              {createErrors.buildingAddress && (
                <FormFeedback>{t(createErrors.buildingAddress)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('NewClients.labels.streetAddress')}
              </Label>
              <Input
                value={newEmployee.streetAddress}
                onChange={(e) => handleNewEmployeeChange('streetAddress', e.target.value)}
                placeholder={t('NewClients.enterStreetAddress')}
                invalid={!!createErrors.streetAddress}
              />
              {createErrors.streetAddress && (
                <FormFeedback>{t(createErrors.streetAddress)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('NewClients.labels.country')}
              </Label>
              <Input
                value={newEmployee.country}
                onChange={(e) => handleNewEmployeeChange('country', e.target.value)}
                placeholder={t('NewClients.placeholders.enterCountry')}
                invalid={!!createErrors.country}
              />
              {createErrors.country && (
                <FormFeedback>{t(createErrors.country)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('NewClients.labels.state')}
              </Label>
              <Input
                value={newEmployee.state}
                onChange={(e) => handleNewEmployeeChange('state', e.target.value)}
                placeholder={t('NewClients.placeholders.enterState')}
                invalid={!!createErrors.state}
              />
              {createErrors.state && (
                <FormFeedback>{t(createErrors.state)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('NewClients.labels.city')}
              </Label>
              <Input
                value={newEmployee.city}
                onChange={(e) => handleNewEmployeeChange('city', e.target.value)}
                placeholder={t('NewClients.placeholders.enterCity')}
                invalid={!!createErrors.city}
              />
              {createErrors.city && (
                <FormFeedback>{t(createErrors.city)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('NewClients.labels.postalCode')}
              </Label>
              <Input
                value={newEmployee.postalCode}
                onChange={(e) => handleNewEmployeeChange('postalCode', e.target.value)}
                placeholder={t('NewClients.placeholders.enterPostalCode')}
                invalid={!!createErrors.postalCode}
              />
              {createErrors.postalCode && (
                <FormFeedback>{t(createErrors.postalCode)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <Label className="form-label fw-semibold">
                  {t('EmployeeLists.jobTitle')} <span className="text-danger">*</span>
                </Label>
                <Button
                  color="link"
                  className="p-0 text-primary d-inline-flex align-items-center"
                  type="button"
                  onClick={() => setJobTitleModalOpen(true)}
                >
                  <i className="bx bx-plus me-1" />
                  {t('Common.add')}
                </Button>
              </div>
              <Input
                type="select"
                value={newEmployee.jobTitleId}
                onChange={(e) => handleNewEmployeeChange('jobTitleId', e.target.value)}
                invalid={!!createErrors.jobTitleId}
                disabled={jobTitlesLoading}
              >
                <option value="">{t('Common.select')}</option>
                {jobTitleOptions.map((jobTitle) => (
                  <option key={jobTitle.id} value={jobTitle.id}>
                    {jobTitle.jobTitle}
                  </option>
                ))}
              </Input>
              {createErrors.jobTitleId && (
                <FormFeedback>{t(createErrors.jobTitleId)}</FormFeedback>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('Common.salary')}
              </Label>
              <Input
                type="number"
                min="0"
                value={newEmployee.salary}
                onChange={(e) => handleNewEmployeeChange('salary', e.target.value)}
                placeholder={t('Common.enterSalary')}
                invalid={!!createErrors.salary}
              />
              {createErrors.salary && (
                <FormFeedback>{t(createErrors.salary)}</FormFeedback>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseCreateModal}>
            {t('Common.cancel')}
          </Button>
          <Button color="primary" onClick={handleSaveEmployee} disabled={createSubmitting}>
            {editingEmployeeId ? t('Common.update') : t('EmployeeLists.createEmployee')}
          </Button>
        </ModalFooter>
      </Modal>

      <JobTitleModal
        isOpen={jobTitleModalOpen}
        toggle={() => setJobTitleModalOpen(false)}
        onSubmit={handleCreateJobTitle}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        title={t('Common.confirm')}
        message={t('EmployeeLists.deleteConfirmation')}
        onConfirm={handleDeleteEmployee}
        confirmButtonText={t('Common.delete')}
        cancelButtonText={t('Common.cancel')}
        isLoading={deleteLoading}
      />

      <ConfirmModal
        isOpen={statusModalOpen}
        toggle={handleCloseStatusModal}
        title={t('Common.confirm')}
        message={
          employeeStatusTarget?.isActive
            ? t('EmployeeLists.confirmDeactivateStatus')
            : t('EmployeeLists.confirmActivateStatus')
        }
        onConfirm={handleConfirmStatusToggle}
        confirmButtonText={t('Common.confirm')}
        cancelButtonText={t('Common.cancel')}
        confirmButtonColor="primary"
        isLoading={statusLoading}
      />

      <Modal isOpen={viewModalOpen} toggle={handleCloseViewModal} size="lg" centered>
        <ModalHeader toggle={handleCloseViewModal}>
          {t('EmployeeLists.modal.employeeDetails')}
        </ModalHeader>
        <ModalBody>
          {!viewLoading && selectedEmployee ? (() => {
            const fullAddress = [
              selectedEmployee.buildingAddress,
              selectedEmployee.streetAddress,
              selectedEmployee.city,
              selectedEmployee.state,
              selectedEmployee.country,
              selectedEmployee.postalCode,
            ]
              .filter(Boolean)
              .join(', ');

            return (
              <Row className="m-0">
                <Col md="12">
                  <div className="d-flex align-items-center gap-3">
                    {selectedEmployee.profileImageBase64 ? (
                      <img
                        src={selectedEmployee.profileImageBase64}
                        alt={getEmployeeName(selectedEmployee)}
                        className="rounded-circle flex-shrink-0"
                        style={{ width: 56, height: 56, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="avatar-lg rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{ backgroundColor: '#34c38f', minWidth: 56, minHeight: 56 }}
                      >
                        {getInitials(selectedEmployee)}
                      </div>
                    )}
                    <div>
                      <h5 className="mb-1 fw-bold">{getEmployeeName(selectedEmployee)}</h5>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <Badge color="primary">
                          {selectedEmployee.role}
                        </Badge>
                        
                      </div>
                    </div>
                  </div>
                </Col>

                <Col md="12">
                  <hr />
                </Col>

                <Col md="6" className="mb-3">
                  <label className="form-label fw-semibold text-muted">
                    {t('Common.email')}
                  </label>
                  <p className="mb-0 text-dark">{selectedEmployee.email}</p>
                </Col>

                <Col md="6" className="mb-3">
                  <label className="form-label fw-semibold text-muted">
                    {t('Common.phone')}
                  </label>
                  <p className="mb-0 text-dark">{selectedEmployee.phone}</p>
                </Col>

                <Col md="6" className="mb-3">
                  <label className="form-label fw-semibold text-muted">
                    {t('Common.address')}
                  </label>
                  <p className="mb-0 text-dark">{fullAddress || '—'}</p>
                </Col>

                <Col md="6" className="mb-3">
                  <label className="form-label fw-semibold text-muted">
                    {t('SubscriptionPlans.price')}
                  </label>
                  <p className="mb-0 text-dark">
                    {selectedEmployee.salary
                      ? selectedEmployee.salary.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '-'}
                  </p>
                </Col>
                <Col md="6" className="mb-3">
                  <label className="form-label fw-semibold text-muted">
                    {t('Common.buildingAddress')}
                  </label>
                  <p className="mb-0 text-dark">{selectedEmployee.buildingAddress}</p>
                </Col>
                <Col md="6" className="mb-3">
                  <label className="form-label fw-semibold text-muted">
                    {t('Common.status')}
                    </label>
                    <p className="mb-0 text-dark">{getStatusBadge(selectedEmployee.isActive)}</p>
                  </Col>
                <Col md="6" className="mb-3">
                  <label className="form-label fw-semibold text-muted">
                    {t('EmployeeLists.lastLogin')}
                  </label>
                  <p className="mb-0 text-dark">
                    {selectedEmployee.lastLoginAt
                      ? new Date(selectedEmployee.lastLoginAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </p>
                </Col>

                
              </Row>
            );
          })() : (
            <div className="text-center py-4">
              <Spinner size="sm" className="me-2" />
              <span>{t('Common.loading')}</span>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-0 pt-0">
          <Button color="secondary" className="rounded" onClick={handleCloseViewModal}>
            {t('Common.close')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CompanyEmployeesList;

