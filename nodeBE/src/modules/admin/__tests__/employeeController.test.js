/**
 * @author Bhavesh Venugopal
 * Employee controller tests (job titles)
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ForbiddenError, BadRequestError } from '../../../utils/errors.js';

const mockLogBusiness = jest.fn();

jest.unstable_mockModule('../../../utils/logger.js', () => ({
  logBusiness: mockLogBusiness
}));

const mockSuccessResponse = jest.fn((msg, data) => ({ success: true, message: msg, data }));
const mockPaginatedResponse = jest.fn((msg, data, pag) => ({ success: true, message: msg, data, pagination: pag }));

jest.unstable_mockModule('../../../utils/responseHelpers.js', () => ({
  successResponse: mockSuccessResponse,
  paginatedResponse: mockPaginatedResponse
}));

const mockValidateUUID = jest.fn();
const mockValidateRequired = jest.fn();
const mockValidateString = jest.fn();
const mockValidateBoolean = jest.fn((v) => v);
const mockValidateEmail = jest.fn();
const mockValidateNumber = jest.fn((v, _name, opts = {}) => {
  if (opts.required === false && (v === undefined || v === null || v === '')) return null;
  return typeof v === 'number' ? v : parseFloat(v);
});

jest.unstable_mockModule('../../../utils/validators.js', () => ({
  validateUUID: mockValidateUUID,
  validateRequired: mockValidateRequired,
  validateString: mockValidateString,
  validateBoolean: mockValidateBoolean,
  validateEmail: mockValidateEmail,
  validateNumber: mockValidateNumber
}));

const mockBuildPaginationQuery = jest.fn(() => ({ page: 1, limit: 10, offset: 0 }));
const mockBuildSortQuery = jest.fn(() => [['jobTitle', 'ASC']]);

jest.unstable_mockModule('../../../utils/businessHelpers.js', () => ({
  buildPaginationQuery: mockBuildPaginationQuery,
  buildSortQuery: mockBuildSortQuery
}));

const mockIsCompanyAdmin = jest.fn(() => true);

jest.unstable_mockModule('../../../constants/keycloakRoles.js', () => ({
  isCompanyAdmin: mockIsCompanyAdmin
}));

const mockCreateJobTitle = jest.fn();
const mockListJobTitles = jest.fn();
const mockListAllJobTitles = jest.fn();
const mockGetJobTitleById = jest.fn();
const mockUpdateJobTitle = jest.fn();
const mockSetJobTitleActiveStatus = jest.fn();
const mockDeleteJobTitle = jest.fn();

jest.unstable_mockModule('../../../services/jobTitleService.js', () => ({
  createJobTitle: mockCreateJobTitle,
  listJobTitlesForCompany: mockListJobTitles,
  listAllJobTitlesForDropdown: mockListAllJobTitles,
  getJobTitleByIdForCompany: mockGetJobTitleById,
  updateJobTitleForCompany: mockUpdateJobTitle,
  setJobTitleActiveStatusForCompany: mockSetJobTitleActiveStatus,
  deleteJobTitleForCompany: mockDeleteJobTitle
}));

const mockCreateEmployee = jest.fn();
const mockListEmployees = jest.fn();
const mockListAllEmployees = jest.fn();
const mockGetEmployeeById = jest.fn();
const mockUpdateEmployee = jest.fn();
const mockSetEmployeeActiveStatus = jest.fn();
const mockDeleteEmployee = jest.fn();
const mockAssignEmployeeCompanyRole = jest.fn();

jest.unstable_mockModule('../../../services/employeeService.js', () => ({
  createEmployee: mockCreateEmployee,
  listEmployeesForCompany: mockListEmployees,
  listAllEmployeesForCompany: mockListAllEmployees,
  getEmployeeById: mockGetEmployeeById,
  updateEmployee: mockUpdateEmployee,
  setEmployeeActiveStatus: mockSetEmployeeActiveStatus,
  deleteEmployee: mockDeleteEmployee,
  assignEmployeeCompanyRole: mockAssignEmployeeCompanyRole
}));

let employeeController;

beforeAll(async () => {
  employeeController = await import('../employeeController.js');
});

describe('employeeController', () => {
  let req;
  let res;
  const companyId = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCompanyAdmin.mockReturnValue(true);
    req = {
      id: 'req-1',
      user: { id: uuidv4(), keycloakGlobalRole: 'COMPANY_ADMIN' },
      company: { id: companyId, name: 'Acme' },
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('createJobTitle should call service with company id', async () => {
    req.body = { jobTitle: 'PM', description: 'Product', isActive: true };
    mockValidateRequired.mockImplementation(() => {});
    mockValidateString.mockImplementation(() => {});
    mockValidateBoolean.mockReturnValue(true);
    const dto = { id: uuidv4(), jobTitle: 'PM' };
    mockCreateJobTitle.mockResolvedValue(dto);

    await employeeController.createJobTitle(req, res);

    expect(mockCreateJobTitle).toHaveBeenCalledWith(
      expect.objectContaining({ jobTitle: 'PM' }),
      { userId: req.user.id, companyId }
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('createJobTitle should reject without company context', async () => {
    req.company = null;
    req.body = { jobTitle: 'X' };
    mockValidateRequired.mockImplementation(() => {});
    mockValidateString.mockImplementation(() => {});

    await expect(employeeController.createJobTitle(req, res)).rejects.toThrow(BadRequestError);
  });

  it('createJobTitle should reject non-admin', async () => {
    mockIsCompanyAdmin.mockReturnValue(false);
    req.body = { jobTitle: 'X' };

    await expect(employeeController.createJobTitle(req, res)).rejects.toThrow(ForbiddenError);
  });

  it('listAllJobTitles should return success array', async () => {
    mockListAllJobTitles.mockResolvedValue([{ id: uuidv4(), jobTitle: 'A' }]);

    await employeeController.listAllJobTitles(req, res);

    expect(mockListAllJobTitles).toHaveBeenCalledWith(companyId, {
      search: undefined,
      isActive: undefined,
      requestId: req.id
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('listAllJobTitles should pass isActive query when provided', async () => {
    req.query.isActive = 'true';
    mockListAllJobTitles.mockResolvedValue([]);

    await employeeController.listAllJobTitles(req, res);

    expect(mockListAllJobTitles).toHaveBeenCalledWith(companyId, {
      search: undefined,
      isActive: true,
      requestId: req.id
    });
  });

  it('listJobTitles should use pagination', async () => {
    mockListJobTitles.mockResolvedValue({ jobTitles: [], total: 0 });

    await employeeController.listJobTitles(req, res);

    expect(mockListJobTitles).toHaveBeenCalledWith(
      companyId,
      expect.any(Object),
      { page: 1, limit: 10, offset: 0 },
      [['jobTitle', 'ASC']],
      { requestId: req.id }
    );
    expect(mockPaginatedResponse).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('patchJobTitleStatus should call service', async () => {
    req.params.id = uuidv4();
    req.body = { isActive: false };
    mockValidateUUID.mockImplementation(() => {});
    mockValidateBoolean.mockReturnValue(false);
    mockSetJobTitleActiveStatus.mockResolvedValue({ id: req.params.id, isActive: false });

    await employeeController.patchJobTitleStatus(req, res);

    expect(mockSetJobTitleActiveStatus).toHaveBeenCalledWith(
      req.params.id,
      false,
      { userId: req.user.id, requestId: req.id },
      companyId
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  describe('employees (people)', () => {
    const jtId = uuidv4();

    it('createEmployee should call service', async () => {
      req.body = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'j@acme.com',
        jobTitleId: jtId
      };
      mockValidateRequired.mockImplementation(() => {});
      mockValidateString.mockImplementation(() => {});
      mockValidateEmail.mockImplementation(() => {});
      mockValidateUUID.mockImplementation(() => {});
      const dto = { id: uuidv4(), firstName: 'Jane', jobTitleId: jtId };
      mockCreateEmployee.mockResolvedValue(dto);

      await employeeController.createEmployee(req, res);

      expect(mockCreateEmployee).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Jane', jobTitleId: jtId }),
        { userId: req.user.id, companyId },
        { requestId: req.id }
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('listEmployees should paginate', async () => {
      mockBuildSortQuery.mockReturnValue([['lastName', 'ASC']]);
      mockListEmployees.mockResolvedValue({ employees: [], total: 0 });

      await employeeController.listEmployees(req, res);

      expect(mockListEmployees).toHaveBeenCalledWith(
        companyId,
        {},
        { page: 1, limit: 10, offset: 0 },
        [['lastName', 'ASC']]
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('patchEmployeeStatus should call setEmployeeActiveStatus', async () => {
      req.params.id = uuidv4();
      req.body = { isActive: false };
      mockValidateUUID.mockImplementation(() => {});
      mockValidateBoolean.mockReturnValue(false);
      mockSetEmployeeActiveStatus.mockResolvedValue({ id: req.params.id, isActive: false });

      await employeeController.patchEmployeeStatus(req, res);

      expect(mockSetEmployeeActiveStatus).toHaveBeenCalledWith(
        req.params.id,
        false,
        { userId: req.user.id, companyId }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('assignEmployeeCompanyRole should call service', async () => {
      const empId = uuidv4();
      const roleId = uuidv4();
      req.body = { employeeId: empId, roleId };
      mockValidateRequired.mockImplementation(() => {});
      mockValidateUUID.mockImplementation(() => {});
      mockAssignEmployeeCompanyRole.mockResolvedValue({
        employee: { id: empId, companyUserId: uuidv4() },
        companyUser: { id: uuidv4(), roleId },
        provisioned: true
      });

      await employeeController.assignEmployeeCompanyRole(req, res);

      expect(mockAssignEmployeeCompanyRole).toHaveBeenCalledWith(
        empId,
        roleId,
        { userId: req.user.id, companyId },
        { requestId: req.id }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
