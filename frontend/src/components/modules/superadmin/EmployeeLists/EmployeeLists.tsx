/**
 * @author Auto-generated
 * Employee Lists component for the application
 * This component is the employee lists page for the application
 * TEMPORARY: Dummy data for table design preview only
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Row, Col, Table, Badge, Input, InputGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormFeedback, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import Breadcrumbs from '../../../common/Breadcrumbs/Breadcrumbs';
import { showSuccessToast } from '../../../../core/utils/toast';
import { validateEmail, validatePhone } from '../../../../core/utils/Utils';

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  keycloakrole?: string;
  isActive: boolean;
  createdAt: string;
}

const EmployeeLists = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // TEMPORARY: Dummy data for table design preview
  const initialDummyEmployees: Employee[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      keycloakrole: 'Site Manager',
      isActive: true,
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      keycloakrole: 'Super Admin',
      isActive: true,
      createdAt: new Date('2024-02-20').toISOString(),
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@example.com',
      phone: '+1234567892',
      keycloakrole: 'Site Manager',
      isActive: false,
      createdAt: new Date('2024-03-10').toISOString(),
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@example.com',
      phone: '+1234567893',
      keycloakrole: 'Account Manager',
      isActive: true,
      createdAt: new Date('2024-04-05').toISOString(),
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@example.com',
      phone: '+1234567894',
      keycloakrole: 'Account Manager',
      isActive: true,
      createdAt: new Date('2024-05-12').toISOString(),
    },
    {
      id: '6',
      email: 'admin@example.com',
      keycloakrole: 'Super Admin',
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString(),
    },
    {
      id: '7',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      keycloakrole: 'Project Manager',
      isActive: true,
      createdAt: new Date('2024-06-18').toISOString(),
    },
    {
      id: '8',
      firstName: 'Robert',
      lastName: 'Miller',
      email: 'robert.miller@example.com',
      phone: '+1234567895',
      keycloakrole: 'Project Manager',
      isActive: false,
      createdAt: new Date('2024-07-22').toISOString(),
    },
  ];

  const [employees, setEmployees] = useState<Employee[]>(initialDummyEmployees);
  const [editFormData, setEditFormData] = useState<Employee | null>(null);
  const [createFormData, setCreateFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    keycloakrole: 'COMPANY_USER',
    isActive: true,
  });
  const [createFormErrors, setCreateFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }>({});

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
      case 'Super Admin':
        return <Badge className="bg-danger">{t('EmployeeLists.roleSuperAdmin')}</Badge>;
      case 'Project Manager':
        return <Badge className="bg-primary">{t('EmployeeLists.roleProjectManager')}</Badge>;
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

  const filteredEmployees = employees.filter(employee => {
    const name = getEmployeeName(employee).toLowerCase();
    const email = employee.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // View employee handler
  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  // Edit employee handler
  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditFormData({ ...employee });
    setEditModalOpen(true);
  };

  // Delete employee handler
  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedEmployee) {
      setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
      showSuccessToast(t('EmployeeLists.employeeDeletedSuccessfully') || 'Employee deleted successfully');
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  // Save edit
  const handleSaveEdit = () => {
    if (editFormData && selectedEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id ? editFormData : emp
      ));
      showSuccessToast(t('EmployeeLists.employeeUpdatedSuccessfully') || 'Employee updated successfully');
      setEditModalOpen(false);
      setEditFormData(null);
      setSelectedEmployee(null);
    }
  };

  // Handle edit form input change
  const handleEditInputChange = (field: keyof Employee, value: string | boolean) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
    }
  };

  // Handle create form input change
  const handleCreateInputChange = (field: string, value: string | boolean) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (createFormErrors[field as keyof typeof createFormErrors]) {
      setCreateFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof createFormErrors];
        return newErrors;
      });
    }
  };

  // Close create modal and reset form
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setCreateFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      keycloakrole: 'COMPANY_USER',
      isActive: true,
    });
    setCreateFormErrors({});
  };

  // Create employee handler
  const handleCreateEmployee = () => {
    const errors: typeof createFormErrors = {};
    let isValid = true;

    // Validate email (required)
    const emailValidation = validateEmail(createFormData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errorMessage;
      isValid = false;
    }

    // Validate phone (optional but if provided, must be valid)
    if (createFormData.phone && createFormData.phone.trim() !== '') {
      const phoneValidation = validatePhone(createFormData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.errorMessage;
        isValid = false;
      }
    }

    // Validate firstName (optional but if provided, must be valid)
    if (createFormData.firstName && createFormData.firstName.length > 100) {
      errors.firstName = 'Validation.nameMaxLength';
      isValid = false;
    }

    // Validate lastName (optional but if provided, must be valid)
    if (createFormData.lastName && createFormData.lastName.length > 100) {
      errors.lastName = 'Validation.nameMaxLength';
      isValid = false;
    }

    if (!isValid) {
      setCreateFormErrors(errors);
      return;
    }

    // Create new employee
    const newEmployee: Employee = {
      id: String(Date.now()), // Simple ID generation for dummy data
      firstName: createFormData.firstName.trim() || undefined,
      lastName: createFormData.lastName.trim() || undefined,
      email: createFormData.email.trim(),
      phone: createFormData.phone.trim() || undefined,
      keycloakrole: createFormData.keycloakrole,
      isActive: createFormData.isActive,
      createdAt: new Date().toISOString(),
    };

    setEmployees(prev => [...prev, newEmployee]);
    showSuccessToast(t('EmployeeLists.employeeCreatedSuccessfully') || 'Employee created successfully');
    handleCloseCreateModal();
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
                      <th>{t('Common.email')}</th>
                      <th>{t('Common.phone')}</th>
                      <th>{t('EmployeeLists.role')}</th>
                      <th>{t('Common.status')}</th>
                      <th>{t('EmployeeLists.createdDate')}</th>
                      <th>{t('Common.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.length > 0 ? (
                      currentEmployees.map((employee) => (
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
                          <td>{employee.email}</td>
                          <td>{employee.phone || '-'}</td>
                          <td>{getRoleBadge(employee.keycloakrole)}</td>
                          <td>{getStatusBadge(employee.isActive)}</td>
                          <td>
                            {new Date(employee.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
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
                              <Button
                                color="outline-danger"
                                className="p-1 border-0"
                                title={t('Common.delete')}
                                onClick={() => handleDelete(employee)}
                              >
                                <i className="mdi mdi-delete"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <p className="text-muted mb-0">{t('EmployeeLists.noEmployeesFound')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredEmployees.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">
                      {t('EmployeeLists.showing') || 'Showing'} {indexOfFirstItem + 1} {t('EmployeeLists.to') || 'to'} {Math.min(indexOfLastItem, filteredEmployees.length)} {t('EmployeeLists.of') || 'of'} {filteredEmployees.length} {t('EmployeeLists.entries') || 'entries'}
                    </span>
                    <Input
                      type="select"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{ width: '60px' }}
                      className="d-inline-block form-select-sm"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </Input>
                    <span className="text-muted">{t('EmployeeLists.perPage') || 'per page'}</span>
                  </div>

                  <Pagination className="pagination-rounded">
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink
                        previous
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page} active={page === currentPage}>
                            <PaginationLink onClick={() => setCurrentPage(page)}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page} disabled>
                            <PaginationLink>...</PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink
                        next
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
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
                <label className="form-label fw-semibold text-muted">{t('Common.phone')}</label>
                <p className="mb-0">{selectedEmployee.phone || '-'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('EmployeeLists.role')}</label>
                <div>{getRoleBadge(selectedEmployee.keycloakrole)}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('Common.status')}</label>
                <div>{getStatusBadge(selectedEmployee.isActive)}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-muted">{t('EmployeeLists.createdDate')}</label>
                <p className="mb-0">
                  {new Date(selectedEmployee.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
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
      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(!editModalOpen)} size="md" centered>
        <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>
          {t('EmployeeLists.editEmployee')}
        </ModalHeader>
        <ModalBody>
          {editFormData && (
            <div className="row m-0">
              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">{t('EmployeeLists.labels.firstName')}</Label>
                <Input
                  type="text"
                  value={editFormData.firstName || ''}
                  onChange={(e) => handleEditInputChange('firstName', e.target.value)}
                  placeholder={t('EmployeeLists.enterFirstName')}
                  maxLength={100}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Label className="form-label fw-semibold">{t('EmployeeLists.labels.lastName')}</Label>
                <Input
                  type="text"
                  value={editFormData.lastName || ''}
                  onChange={(e) => handleEditInputChange('lastName', e.target.value)}
                  placeholder={t('EmployeeLists.enterLastName')}
                  maxLength={100}
                />
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('EmployeeLists.labels.email')}</Label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                  placeholder={t('EmployeeLists.enterEmail')}
                />
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('EmployeeLists.labels.phone')}</Label>
                <Input
                  type="tel"
                  value={editFormData.phone || ''}
                  onChange={(e) => handleEditInputChange('phone', e.target.value)}
                  placeholder={t('EmployeeLists.enterPhone')}
                />
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('EmployeeLists.labels.role')}</Label>
                <Input
                  type="select"
                  value={editFormData.keycloakrole || 'COMPANY_USER'}
                  onChange={(e) => handleEditInputChange('keycloakrole', e.target.value)}
                >
                  <option value="COMPANY_USER">{t('EmployeeLists.roleCompanyUser')}</option>
                  <option value="SUPER_ADMIN">{t('EmployeeLists.roleSuperAdmin')}</option>
                </Input>
              </div>
              <div className="col-md-12 mb-3">
                <Label className="form-label fw-semibold">{t('Common.status')}</Label>
                <Input
                  type="select"
                  value={editFormData.isActive ? 'true' : 'false'}
                  onChange={(e) => handleEditInputChange('isActive', e.target.value === 'true')}
                >
                  <option value="true">{t('EmployeeLists.statusActive')}</option>
                  <option value="false">{t('EmployeeLists.statusInactive')}</option>
                </Input>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveEdit}>
            {t('Common.save')}
          </Button>
          <Button color="secondary" onClick={() => setEditModalOpen(false)}>
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

      {/* Create Employee Modal */}
      <Modal isOpen={createModalOpen} toggle={handleCloseCreateModal} size="md" centered>
        <ModalHeader toggle={handleCloseCreateModal}>
          {t('EmployeeLists.createEmployee')}
        </ModalHeader>
        <ModalBody>
          <div className="row m-0">
            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.firstName')}
              </Label>
              <Input
                type="text"
                value={createFormData.firstName}
                onChange={(e) => handleCreateInputChange('firstName', e.target.value)}
                placeholder={t('EmployeeLists.enterFirstName')}
                invalid={!!createFormErrors.firstName}
                maxLength={100}
              />
              {createFormErrors.firstName && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.firstName)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.lastName')}
              </Label>
              <Input
                type="text"
                value={createFormData.lastName}
                onChange={(e) => handleCreateInputChange('lastName', e.target.value)}
                placeholder={t('EmployeeLists.enterLastName')}
                invalid={!!createFormErrors.lastName}
                maxLength={100}
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
                {t('EmployeeLists.labels.phone')}
              </Label>
              <Input
                type="tel"
                value={createFormData.phone}
                onChange={(e) => handleCreateInputChange('phone', e.target.value)}
                placeholder={t('EmployeeLists.enterPhone')}
                invalid={!!createFormErrors.phone}
              />
              {createFormErrors.phone && (
                <FormFeedback type="invalid">
                  {t(createFormErrors.phone)}
                </FormFeedback>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('EmployeeLists.labels.role')}
              </Label>
              <Input
                type="select"
                value={createFormData.keycloakrole}
                onChange={(e) => handleCreateInputChange('keycloakrole', e.target.value)}
              >
                <option value="COMPANY_USER">{t('EmployeeLists.roleCompanyUser')}</option>
                <option value="SUPER_ADMIN">{t('EmployeeLists.roleSuperAdmin')}</option>
              </Input>
            </div>

            <div className="col-md-12 mb-3">
              <Label className="form-label fw-semibold">
                {t('Common.status')}
              </Label>
              <Input
                type="select"
                value={createFormData.isActive ? 'true' : 'false'}
                onChange={(e) => handleCreateInputChange('isActive', e.target.value === 'true')}
              >
                <option value="true">{t('EmployeeLists.statusActive')}</option>
                <option value="false">{t('EmployeeLists.statusInactive')}</option>
              </Input>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateEmployee}>
            {t('EmployeeLists.createEmployee')}
          </Button>
          <Button color="secondary" onClick={handleCloseCreateModal}>
            {t('Common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default EmployeeLists;

