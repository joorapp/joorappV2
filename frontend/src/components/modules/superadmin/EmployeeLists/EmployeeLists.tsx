/**
 * @author Auto-generated
 * Employee Lists component for the application
 * This component is the employee lists page for the application
 * TEMPORARY: Dummy data for table design preview only
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Badge, Input, InputGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormFeedback, Spinner } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import Pagination from '../../../common/Pagination/Pagination';
import { showSuccessToast } from '../../../../core/utils/toast';
import { validateEmail, validateRequired, validateMinLength } from '../../../../core/utils/Utils';
import UserService from '../../../../core/service/UserService';
import SuperAdminService from '../../../../core/service/SuperAdminService';
import RoleService from '../../../../core/service/RoleService';
import { KEYCLOAK_GLOBAL_ROLES, VALIDATION } from '../../../../core/constants/constantValues';

interface Employee {
  id: string;
  keycloakId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  keycloakGlobalRole?: string;
  isActive: boolean;
  lastLoginAt?: string;
  companies?: Array<{
    id: string;
    name: string;
    role?: {
      id: string;
      name: string;
      code: string;
    };
  }>;
}

interface Company {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  code: string;
}

interface CreateUserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyId: string;
  roleId: string;
  keycloakGlobalRole: string;
}

interface CreateUserFormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  companyId?: string;
  roleId?: string;
  keycloakGlobalRole?: string;
}

const EmployeeLists = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toggleStatusModalOpen, setToggleStatusModalOpen] = useState(false);
  const [employeeToToggle, setEmployeeToToggle] = useState<Employee | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  interface EditUserFormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId: string;
    roleId: string;
    keycloakGlobalRole: string;
    isActive: boolean;
  }

  const [editFormData, setEditFormData] = useState<EditUserFormData | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateUserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyId: '',
    roleId: '',
    keycloakGlobalRole: KEYCLOAK_GLOBAL_ROLES[0],
  });
  const [createFormErrors, setCreateFormErrors] = useState<CreateUserFormErrors>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [editFormErrors, setEditFormErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    companyId?: string;
    roleId?: string;
    keycloakGlobalRole?: string;
  }>({});
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Get initials from employee name
  const getInitials = (employee: Employee): string => {
    if (employee.firstName && employee.lastName) {
      return (employee.firstName[0] + employee.lastName[0]).toUpperCase();
    }
    if (employee.firstName) {
      return employee.firstName.substring(0, 2).toUpperCase();
    }
    if (employee.email) {
      return employee.email.substring(0, 2).toUpperCase();
    }
    return 'EM';
  };

  // Generate color based on name
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
      'bg-pink',
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

  const getRoleBadge = (role?: string) => {
    if (!role) return <Badge className="bg-secondary">-</Badge>;
    switch (role) {
      case 'COMPANY_USER':
        return <Badge className="bg-primary">{t('EmployeeLists.keycloakGlobalRoleCOMPANY_USER')}</Badge>;
      case 'COMPANY_ADMIN':
        return <Badge className="bg-danger">{t('EmployeeLists.keycloakGlobalRoleCOMPANY_ADMIN')}</Badge>;
      default:
        return <Badge className="bg-secondary">{role}</Badge>;
    }
  };

  const getEmployeeName = (employee: Employee): string => {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    }
    if (employee.firstName) {
      return employee.firstName;
    }
    if (employee.lastName) {
      return employee.lastName;
    }
    return employee.email;
  };

  // Fetch users from API
  const fetchUsers = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await UserService.getUsersList(page, itemsPerPage, search);

      if (response?.data) {
        // Map API response to Employee interface
        const usersData = response.data.data || [];
        const mappedEmployees: Employee[] = usersData.map((user: {
          id: string;
          keycloakId?: string;
          email: string;
          firstName?: string;
          lastName?: string;
          keycloakGlobalRole?: string;
          isActive: boolean;
          lastLoginAt?: string;
          companies?: Array<{
            id: string;
            name: string;
            role?: {
              id: string;
              name: string;
              code: string;
            };
          }>;
        }) => ({
          id: user.id,
          keycloakId: user.keycloakId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          keycloakGlobalRole: user.keycloakGlobalRole,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          companies: user.companies || [],
        }));

        setEmployees(mappedEmployees);

        // Extract pagination metadata
        const pagination = response.data?.pagination || {};
        setTotalPages(pagination.pages || 1);
        setTotalItems(pagination.total || 0);
        setCurrentPage(pagination.page || page);
      }
    } catch (error) {
      // Error toast is already handled by the interceptor
      console.error('Error fetching users:', error);
      setEmployees([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Fetch users on component mount and when page/search changes
  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage, fetchUsers]);

  // Handle search with debouncing
  useEffect(() => {
    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      fetchUsers(1, searchTerm);
    }, 300); // 300ms debounce delay

    setSearchDebounceTimer(timer);

    // Cleanup timer on unmount
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // View employee handler
  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  // Edit employee handler
  const handleEdit = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setLoadingUserDetails(true);
    setEditModalOpen(true);
    
    try {
      // Fetch user details to get company/role info
      const userResponse = await UserService.getUserById(employee.id);
      const userData = userResponse?.data?.data || {};
      
      // Get company and role from employee's companies array or from userData
      const firstCompany = (employee.companies && employee.companies.length > 0 ? employee.companies[0] : null) ||
                          (userData.companies && userData.companies.length > 0 ? userData.companies[0] : null);
      const companyId = firstCompany?.id || '';
      const roleId = firstCompany?.role?.id || '';
      
      // Initialize edit form data with user info
      setEditFormData({
        email: userData.email || employee.email,
        password: '', // Password is optional for update
        firstName: userData.firstName || employee.firstName || '',
        lastName: userData.lastName || employee.lastName || '',
        companyId: companyId,
        roleId: roleId,
        keycloakGlobalRole: userData.keycloakGlobalRole || employee.keycloakGlobalRole || '',
        isActive: userData.isActive !== undefined ? userData.isActive : employee.isActive,
      });
      
      // Fetch companies and roles for dropdowns
      await Promise.all([fetchCompanies(), fetchRoles()]);
    } catch (error) {
      // Error toast is already handled by the interceptor
      console.error('Error fetching user details:', error);
      // Fallback to employee data
      const firstCompany = employee.companies && employee.companies.length > 0 ? employee.companies[0] : null;
      const companyId = firstCompany?.id || '';
      const roleId = firstCompany?.role?.id || '';
      
      setEditFormData({
        email: employee.email,
        password: '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        companyId: companyId,
        roleId: roleId,
        keycloakGlobalRole: employee.keycloakGlobalRole || '',
        isActive: employee.isActive,
      });
      await Promise.all([fetchCompanies(), fetchRoles()]);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Delete employee handler
  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (selectedEmployee) {
      const response =  await UserService.deleteUser(selectedEmployee.id);
      console.log(response);
      if (response.data.success) {
        setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
        showSuccessToast(t('EmployeeLists.employeeDeletedSuccessfully') || 'Employee deleted successfully');
        setDeleteModalOpen(false);
        setSelectedEmployee(null);
        await fetchUsers(currentPage, searchTerm);
      }
    }
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editFormData || !selectedEmployee) return;

    // Validate form
    const errors = validateEditUserForm(editFormData);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    setIsUpdatingUser(true);
    try {
      // Prepare user update request body
      const userUpdateBody: {
        email?: string;
        firstName?: string;
        lastName?: string;
        keycloakGlobalRole?: string;
        isActive?: boolean;
        password?: string;
      } = {};

      if (editFormData.email && editFormData.email.trim() !== '') {
        userUpdateBody.email = editFormData.email.trim();
      }
      if (editFormData.firstName && editFormData.firstName.trim() !== '') {
        userUpdateBody.firstName = editFormData.firstName.trim();
      }
      if (editFormData.lastName && editFormData.lastName.trim() !== '') {
        userUpdateBody.lastName = editFormData.lastName.trim();
      }
      if (editFormData.keycloakGlobalRole) {
        userUpdateBody.keycloakGlobalRole = editFormData.keycloakGlobalRole;
      }
      if (editFormData.isActive !== undefined) {
        userUpdateBody.isActive = editFormData.isActive;
      }
      // Include password only if provided
      if (editFormData.password && editFormData.password.trim() !== '') {
        userUpdateBody.password = editFormData.password;
      }

      // Update user
      const userResponse = await UserService.updateUser(selectedEmployee.id, userUpdateBody);
      
      if (userResponse.data.success) {
        // Update company assignment (assignUserToCompany handles upsert)
        if (editFormData.companyId && editFormData.roleId) {
          await UserService.assignUserToCompany(
            selectedEmployee.id,
            editFormData.companyId,
            editFormData.roleId
          );
        }

        showSuccessToast(t('EmployeeLists.employeeUpdatedSuccessfully'));
        setEditModalOpen(false);
        setEditFormData(null);
        setSelectedEmployee(null);
        setEditFormErrors({});
        // Refresh users list after successful update
        await fetchUsers(currentPage, searchTerm);
      }
    } catch (error) {
      // Error toast is already handled by the interceptor
      console.error('Error updating user:', error);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Close edit modal and reset form
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditFormData(null);
    setSelectedEmployee(null);
    setEditFormErrors({});
  };

  // Handle edit form input change
  const handleEditInputChange = (field: keyof EditUserFormData, value: string | boolean) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
      // Clear error for this field when user starts typing
      if (editFormErrors[field as keyof typeof editFormErrors]) {
        setEditFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof typeof editFormErrors];
          return newErrors;
        });
      }
    }
  };

  // Validate edit user form
  const validateEditUserForm = (formData: EditUserFormData): typeof editFormErrors => {
    const errors: typeof editFormErrors = {};

    // Validate email (required)
    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Validation.emailRequired';
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.errorMessage;
      }
    }

    // Validate password if provided (optional for update, but if provided must be valid)
    if (formData.password && formData.password.trim() !== '') {
      const passwordValidation = validateMinLength(formData.password, VALIDATION.MIN_PASSWORD_LENGTH);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errorMessage;
      }
    }

    // Validate firstName (required)
    if (!formData.firstName || formData.firstName.trim() === '') {
      errors.firstName = 'Validation.firstNameRequired';
    } else if (formData.firstName.trim().length > VALIDATION.MAX_NAME_LENGTH) {
      errors.firstName = 'Validation.nameMaxLength';
    }

    // Validate lastName (required)
    if (!formData.lastName || formData.lastName.trim() === '') {
      errors.lastName = 'Validation.lastNameRequired';
    } else if (formData.lastName.trim().length > VALIDATION.MAX_NAME_LENGTH) {
      errors.lastName = 'Validation.nameMaxLength';
    }

    // Validate companyId (required)
    if (!formData.companyId || formData.companyId.trim() === '') {
      errors.companyId = 'Validation.companyRequired';
    }

    // Validate roleId (required)
    if (!formData.roleId || formData.roleId.trim() === '') {
      errors.roleId = 'Validation.roleRequired';
    }

    // Validate keycloakGlobalRole (required)
    if (!formData.keycloakGlobalRole || !KEYCLOAK_GLOBAL_ROLES.includes(formData.keycloakGlobalRole as typeof KEYCLOAK_GLOBAL_ROLES[number])) {
      errors.keycloakGlobalRole = 'Validation.keycloakGlobalRoleRequired';
    }

    return errors;
  };

  // Fetch companies for dropdown
  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const response = await SuperAdminService.getCompaniesList({
        page: 1,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      if (response?.data?.data) {
        const companiesData: Company[] = response.data.data.map((company: { id: string; name: string }) => ({
          id: company.id,
          name: company.name,
        }));
        setCompanies(companiesData);
      }
    } catch (error) {
      // Error toast is already handled by the interceptor
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  // Fetch roles for dropdown
  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const response = await RoleService.getRoles({
        page: 1,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      if (response?.data?.data) {
        const rolesData: Role[] = response.data.data.map((role: { id: string; name: string; code: string }) => ({
          id: role.id,
          name: role.name,
          code: role.code,
        }));
        setRoles(rolesData);
      }
    } catch (error) {
      // Error toast is already handled by the interceptor
      console.error('Error fetching roles:', error);
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  // Fetch companies and roles when create modal opens
  useEffect(() => {
    if (createModalOpen) {
      fetchCompanies();
      fetchRoles();
    }
  }, [createModalOpen, fetchCompanies, fetchRoles]);

  // Handle create form input change
  const handleCreateInputChange = (field: keyof CreateUserFormData, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (createFormErrors[field as keyof CreateUserFormErrors]) {
      setCreateFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof CreateUserFormErrors];
        return newErrors;
      });
    }
  };

  // Close create modal and reset form
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setCreateFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      companyId: '',
      roleId: '',
      keycloakGlobalRole: KEYCLOAK_GLOBAL_ROLES[0],
    });
    setCreateFormErrors({});
  };

  // Validate create user form
  const validateCreateUserForm = (formData: CreateUserFormData): CreateUserFormErrors => {
    const errors: CreateUserFormErrors = {};

    // Validate email (required)
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errorMessage;
    }

    // Validate password (required, min length)
    const passwordValidation = validateMinLength(formData.password, VALIDATION.MIN_PASSWORD_LENGTH, 'password');
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errorMessage;
    }

    // Validate firstName (required)
    const firstNameValidation = validateRequired(formData.firstName, 'firstName');
    if (!firstNameValidation.isValid) {
      errors.firstName = firstNameValidation.errorMessage;
    }

    // Validate lastName (required)
    const lastNameValidation = validateRequired(formData.lastName, 'lastName');
    if (!lastNameValidation.isValid) {
      errors.lastName = lastNameValidation.errorMessage;
    }

    // Validate companyId (required)
    const companyValidation = validateRequired(formData.companyId, 'companyId');
    if (!companyValidation.isValid) {
      errors.companyId = 'Validation.companyRequired';
    }

    // Validate roleId (required)
    const roleValidation = validateRequired(formData.roleId, 'roleId');
    if (!roleValidation.isValid) {
      errors.roleId = 'Validation.roleRequired';
    }

    // Validate keycloakGlobalRole (required)
    if (!formData.keycloakGlobalRole || !KEYCLOAK_GLOBAL_ROLES.includes(formData.keycloakGlobalRole as typeof KEYCLOAK_GLOBAL_ROLES[number])) {
      errors.keycloakGlobalRole = 'Validation.keycloakGlobalRoleRequired';
    }

    return errors;
  };

  // Handle toggle user enable/disable - opens confirmation modal
  const handleToggleUserStatus = (employee: Employee) => {
    if (togglingUserId === employee.id) return; // Prevent multiple clicks
    setEmployeeToToggle(employee);
    setToggleStatusModalOpen(true);
  };

  // Confirm toggle user enable/disable
  const confirmToggleUserStatus = async () => {
    console.log('confirmToggleUserStatus', employeeToToggle);
    if (!employeeToToggle) return;

    setTogglingUserId(employeeToToggle.id);
    setToggleStatusModalOpen(false);
    
    try {
      let response;
      if (employeeToToggle.isActive) {
        response = await UserService.disableUser(employeeToToggle.id);
      } else {
        response = await UserService.enableUser(employeeToToggle.id);
      }

      if (response?.data?.success) {
        // Update the employee in the list
        setEmployees(prev => prev.map(emp => 
          emp.id === employeeToToggle.id 
            ? { ...emp, isActive: !emp.isActive }
            : emp
        ));
        showSuccessToast(
          employeeToToggle.isActive 
            ? t('EmployeeLists.userDisabledSuccessfully')
            : t('EmployeeLists.userEnabledSuccessfully')
        );
      }
    } catch (error) {
      // Error toast is already handled by the interceptor
      console.error('Error toggling user status:', error);
    } finally {
      setTogglingUserId(null);
      setEmployeeToToggle(null);
    }
  };

  // Create user handler
  const handleCreateUser = async () => {
    // Validate form
    const errors = validateCreateUserForm(createFormData);
    if (Object.keys(errors).length > 0) {
      setCreateFormErrors(errors);
      return;
    }

    setIsCreatingUser(true);
    try {
      const requestBody = {
        email: createFormData.email.trim(),
        password: createFormData.password,
        firstName: createFormData.firstName.trim(),
        lastName: createFormData.lastName.trim(),
        keycloakGlobalRole: createFormData.keycloakGlobalRole,
        companyId: createFormData.companyId,
        roleId: createFormData.roleId,
      };

      const response = await UserService.createUser(requestBody);
      
      if (response.data.success) {  
        showSuccessToast(t('EmployeeLists.userCreatedSuccessfully'));
        handleCloseCreateModal();
        // Refresh users list after successful creation
        await fetchUsers(currentPage, searchTerm);
      }
    } catch (error) {
      // Error toast is already handled by the interceptor
      console.error('Error creating user:', error);
    } finally {
      setIsCreatingUser(false);
    }
  };
  return (
    <>
      <Breadcrumbs title={t('Navigation.employeeLists')} breadcrumbItem={t('Navigation.employeeLists')} />

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
                  {t('EmployeeLists.newEmployee')}
                </Button>
              </div>
              <div className="table-responsive">
                <Table className="table-nowrap align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('EmployeeLists.employee')}</th>
                      <th>{t('UserList.roleCompany')}</th>
                      <th>{t('Common.email')}</th>                      
                      <th>{t('UserList.role')}</th>
                      <th>{t('EmployeeLists.labels.keycloakGlobalRole')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('EmployeeLists.lastLogin')}</th>
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
                    ) : employees.length > 0 ? (
                      employees.map((employee) => {
                        // Get first company and role for display
                        const firstCompany = employee.companies && employee.companies.length > 0 ? employee.companies[0] : null;
                        const companyName = firstCompany?.name || '-';
                        const roleName = firstCompany?.role?.name || '-';
                        
                        return (
                          <tr key={employee.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className={`avatar-xs me-3 ${getAvatarColor(employee)} rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold`}>
                                  {getInitials(employee)}
                                </div>
                                <div>
                                  <h5 className="mb-0 font-size-14">{getEmployeeName(employee)}</h5>
                                </div>
                              </div>
                            </td>
                            
                            <td>{companyName}</td>
                            <td>{employee.email}</td>
                            <td>{roleName}</td>
                            <td>{getRoleBadge(employee.keycloakGlobalRole)}</td>
                            <td>{getStatusBadge(employee.isActive)}</td>
                            <td>
                              {employee.lastLoginAt
                                ? new Date(employee.lastLoginAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : '-'}
                            </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                color="outline-primary"
                                className="p-1 border-0"
                                title={t('Common.view')}
                                onClick={() => handleView(employee)}
                              >
                                <i className="mdi mdi-eye"></i>
                              </Button>
                              <Button
                                color="outline-success"
                                className="p-1 border-0"
                                title={t('Common.edit')}
                                onClick={() => handleEdit(employee)}
                              >
                                <i className="mdi mdi-pencil"></i>
                              </Button>
                              {/* <Button
                                color="outline-danger"
                                className="p-1 border-0"
                                title={t('Common.delete')}
                                onClick={() => handleDelete(employee)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button> */}
                              <div className="form-check form-switch d-inline-flex align-items-center">
                                <Input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={employee.isActive}
                                  onChange={() => handleToggleUserStatus(employee)}
                                  disabled={togglingUserId === employee.id}
                                  title={employee.isActive ? t('EmployeeLists.disableUser') : t('EmployeeLists.enableUser')}
                                  style={{ cursor: togglingUserId === employee.id ? 'not-allowed' : 'pointer' }}
                                />
                                {togglingUserId === employee.id && (
                                  <Spinner size="sm" className="ms-2" />
                                )}
                              </div>


                            </div>
                          </td>
                        </tr>
                        );
                      })
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

              {/* Pagination */}
              {employees.length > 0 && (
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

      {/* View Employee Modal */}
      <Modal isOpen={viewModalOpen} toggle={() => setViewModalOpen(!viewModalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setViewModalOpen(!viewModalOpen)}>
          {t('EmployeeLists.modal.employeeDetails')}
        </ModalHeader>
        <ModalBody>
          {selectedEmployee && (
            <div className="row m-0">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('EmployeeLists.firstName')}</label>
                <p className="mb-0">{selectedEmployee.firstName || '-'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('EmployeeLists.lastName')}</label>
                <p className="mb-0">{selectedEmployee.lastName || '-'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.email')}</label>
                <p className="mb-0">{selectedEmployee.email}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('EmployeeLists.labels.keycloakGlobalRole')}</label>
                <div>{getRoleBadge(selectedEmployee.keycloakGlobalRole)}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.status')}</label>
                <div>{getStatusBadge(selectedEmployee.isActive)}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('EmployeeLists.lastLogin')}</label>
                <p className="mb-0">
                  {selectedEmployee.lastLoginAt
                    ? new Date(selectedEmployee.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
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

      {/* Edit Employee Modal */}
      <Modal isOpen={editModalOpen} toggle={handleCloseEditModal} size="md" centered>
        <ModalHeader toggle={handleCloseEditModal}>
          {t('EmployeeLists.editEmployee')}
        </ModalHeader>
        <ModalBody>
          {loadingUserDetails ? (
            <div className="text-center py-4">
              <Spinner size="sm" className="me-2" />
              <span>{t('Common.loading')}</span>
            </div>
          ) : editFormData ? (
            <div className="row m-0">
              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">
                  {t('EmployeeLists.labels.firstName')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => handleEditInputChange('firstName', e.target.value)}
                  placeholder={t('EmployeeLists.enterFirstName')}
                  invalid={!!editFormErrors.firstName}
                  maxLength={VALIDATION.MAX_NAME_LENGTH}
                  autoComplete="off"
                />
                {editFormErrors.firstName && (
                  <FormFeedback type="invalid">
                    {t(editFormErrors.firstName)}
                  </FormFeedback>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">
                  {t('EmployeeLists.labels.lastName')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => handleEditInputChange('lastName', e.target.value)}
                  placeholder={t('EmployeeLists.enterLastName')}
                  invalid={!!editFormErrors.lastName}
                  maxLength={VALIDATION.MAX_NAME_LENGTH}
                  autoComplete="off"
                />
                {editFormErrors.lastName && (
                  <FormFeedback type="invalid">
                    {t(editFormErrors.lastName)}
                  </FormFeedback>
                )}
              </div>

              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('EmployeeLists.labels.email')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                  placeholder={t('EmployeeLists.enterEmail')}
                  invalid={!!editFormErrors.email}
                  autoComplete="off"
                />
                {editFormErrors.email && (
                  <FormFeedback type="invalid">
                    {t(editFormErrors.email)}
                  </FormFeedback>
                )}
              </div>

              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('EmployeeLists.labels.password')}
                </Label>
                <Input
                  type="text"
                  value={editFormData.password}
                  onChange={(e) => handleEditInputChange('password', e.target.value)}
                  placeholder={t('EmployeeLists.enterPassword')}
                  invalid={!!editFormErrors.password}
                  autoComplete="off"
                />
                {editFormErrors.password && (
                  <FormFeedback type="invalid">
                    {t(editFormErrors.password)}
                  </FormFeedback>
                )}
                <small className="text-muted">{t('EmployeeLists.passwordOptional')}</small>
              </div>

              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('EmployeeLists.labels.company')} <span className="text-danger">*</span>
                </Label>
                {loadingCompanies ? (
                  <div className="d-flex align-items-center">
                    <Spinner size="sm" className="me-2" />
                    <span className="text-muted">{t('Common.loading')}</span>
                  </div>
                ) : (
                  <Input
                    type="select"
                    value={editFormData.companyId}
                    onChange={(e) => handleEditInputChange('companyId', e.target.value)}
                    invalid={!!editFormErrors.companyId}
                  >
                    <option value="">{t('Common.select')}</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Input>
                )}
                {editFormErrors.companyId && (
                  <FormFeedback type="invalid">
                    {t(editFormErrors.companyId)}
                  </FormFeedback>
                )}
              </div>

              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('EmployeeLists.labels.role')} <span className="text-danger">*</span>
                </Label>
                {loadingRoles ? (
                  <div className="d-flex align-items-center">
                    <Spinner size="sm" className="me-2" />
                    <span className="text-muted">{t('Common.loading')}</span>
                  </div>
                ) : (
                  <Input
                    type="select"
                    value={editFormData.roleId}
                    onChange={(e) => handleEditInputChange('roleId', e.target.value)}
                    invalid={!!editFormErrors.roleId}
                  >
                    <option value="">{t('Common.select')}</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Input>
                )}
                {editFormErrors.roleId && (
                  <FormFeedback type="invalid">
                    {t(editFormErrors.roleId)}
                  </FormFeedback>
                )}
              </div>

              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">
                  {t('EmployeeLists.labels.keycloakGlobalRole')} <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  value={editFormData.keycloakGlobalRole}
                  onChange={(e) => handleEditInputChange('keycloakGlobalRole', e.target.value)}
                  invalid={!!editFormErrors.keycloakGlobalRole}
                >
                  <option value="">{t('Common.select')}</option>
                  {KEYCLOAK_GLOBAL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {/* {t(`EmployeeLists.keycloakGlobalRole${role}`)} */}
                      {role.toUpperCase()}
                    </option>
                  ))}
                </Input>
                {editFormErrors.keycloakGlobalRole && (
                  <FormFeedback type="invalid">
                    {t(editFormErrors.keycloakGlobalRole)}
                  </FormFeedback>
                )}
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveEdit} disabled={isUpdatingUser}>
            {isUpdatingUser ? (
              <>
                <Spinner size="sm" className="me-2" />
                {t('Common.loading')}
              </>
            ) : (
              t('Common.save')
            )}
          </Button>
          <Button color="secondary" onClick={handleCloseEditModal} disabled={isUpdatingUser}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(!deleteModalOpen)} centered>
        <ModalHeader toggle={() => setDeleteModalOpen(!deleteModalOpen)}>
          {t('Common.confirmDelete')}
        </ModalHeader>
        <ModalBody>
          {selectedEmployee && (
            <p>
              {t('EmployeeLists.deleteConfirmation') || 'Are you sure you want to delete this employee?'}
              <br />
              <strong>{getEmployeeName(selectedEmployee)} ({selectedEmployee.email})</strong>
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmDelete}>
            {t('Common.delete')}
          </Button>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal isOpen={toggleStatusModalOpen} toggle={() => setToggleStatusModalOpen(!toggleStatusModalOpen)} centered>
        <ModalHeader toggle={() => setToggleStatusModalOpen(!toggleStatusModalOpen)}>
          {employeeToToggle?.isActive ? t('EmployeeLists.confirmDisableUser') : t('EmployeeLists.confirmEnableUser')}
        </ModalHeader>
        <ModalBody>
          {employeeToToggle && (
            <p>
              {employeeToToggle.isActive 
                ? t('EmployeeLists.disableUserConfirmation') 
                : t('EmployeeLists.enableUserConfirmation')}
              <br />
              <strong>{getEmployeeName(employeeToToggle)} ({employeeToToggle.email})</strong>
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button 
            color={employeeToToggle?.isActive ? "danger" : "success"} 
            onClick={confirmToggleUserStatus}
            disabled={togglingUserId === employeeToToggle?.id}
          >
            {togglingUserId === employeeToToggle?.id ? (
              <>
                <Spinner size="sm" className="me-2" />
                {t('Common.loading')}
              </>
            ) : (
              employeeToToggle?.isActive ? t('EmployeeLists.disableUser') : t('EmployeeLists.enableUser')
            )}
          </Button>
          <Button 
            color="secondary" 
            onClick={() => {
              setToggleStatusModalOpen(false);
              setEmployeeToToggle(null);
            }}
            disabled={togglingUserId === employeeToToggle?.id}
          >
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create User Modal */}
      <Modal isOpen={createModalOpen} toggle={handleCloseCreateModal} size="md" centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {t('EmployeeLists.createUser')}
        </ModalHeader>
        <ModalBody>
          <div className="row m-0">
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.firstName')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                autoComplete="off"
                value={createFormData.firstName}
                onChange={(e) => handleCreateInputChange('firstName', e.target.value)}
                placeholder={t('EmployeeLists.enterFirstName')}
                invalid={!!createFormErrors.firstName}
                maxLength={VALIDATION.MAX_NAME_LENGTH}
              />
              {createFormErrors.firstName && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.firstName)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.lastName')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                autoComplete="off"
                value={createFormData.lastName}
                onChange={(e) => handleCreateInputChange('lastName', e.target.value)}
                placeholder={t('EmployeeLists.enterLastName')}
                invalid={!!createFormErrors.lastName}
                maxLength={VALIDATION.MAX_NAME_LENGTH}
              />
              {createFormErrors.lastName && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.lastName)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.email')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="email"
                autoComplete="off"
                value={createFormData.email}
                onChange={(e) => handleCreateInputChange('email', e.target.value)}
                placeholder={t('EmployeeLists.enterEmail')}
                invalid={!!createFormErrors.email}
              />
              {createFormErrors.email && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.email)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.password')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                autoComplete="off"
                value={createFormData.password}
                onChange={(e) => handleCreateInputChange('password', e.target.value)}
                placeholder={t('EmployeeLists.enterPassword')}
                invalid={!!createFormErrors.password}
              />
              {createFormErrors.password && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.password)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.company')} <span className="text-danger">*</span>
              </Label>
              {loadingCompanies ? (
                <div className="d-flex align-items-center">
                  <Spinner size="sm" className="me-2" />
                  <span className="text-muted">{t('Common.loading')}</span>
                </div>
              ) : (
                <Input
                  type="select"
                  value={createFormData.companyId}
                  onChange={(e) => handleCreateInputChange('companyId', e.target.value)}
                  invalid={!!createFormErrors.companyId}
                >
                  <option value="">{t('Common.select')}</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Input>
              )}
              {createFormErrors.companyId && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.companyId)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.role')} <span className="text-danger">*</span>
              </Label>
              {loadingRoles ? (
                <div className="d-flex align-items-center">
                  <Spinner size="sm" className="me-2" />
                  <span className="text-muted">{t('Common.loading')}</span>
                </div>
              ) : (
                <Input
                  type="select"
                  value={createFormData.roleId}
                  onChange={(e) => handleCreateInputChange('roleId', e.target.value)}
                  invalid={!!createFormErrors.roleId}
                >
                  <option value="">{t('Common.select')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Input>
              )}
              {createFormErrors.roleId && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.roleId)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.keycloakGlobalRole')} <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={createFormData.keycloakGlobalRole}
                onChange={(e) => handleCreateInputChange('keycloakGlobalRole', e.target.value)}
                invalid={!!createFormErrors.keycloakGlobalRole}
              >
                <option value="">{t('Common.select')}</option>
                {KEYCLOAK_GLOBAL_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.toUpperCase()}
                  </option>
                ))} 
              </Input>
              {createFormErrors.keycloakGlobalRole && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.keycloakGlobalRole)}
                </FormFeedback>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateUser} disabled={isCreatingUser}>
            {isCreatingUser ? (
              <>
                <Spinner size="sm" className="me-2" />
                {t('Common.loading')}
              </>
            ) : (
              t('EmployeeLists.createUser')
            )}
          </Button>
          <Button color="secondary" onClick={handleCloseCreateModal} disabled={isCreatingUser}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default EmployeeLists;

