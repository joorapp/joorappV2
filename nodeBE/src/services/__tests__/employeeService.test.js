/**
 * @author Bhavesh Venugopal
 * employeeService tests
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError, BadRequestError } from '../../utils/errors.js';

const mockCreate = jest.fn();
const mockFindByIdOrFail = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindOneByCompanyAndEmail = jest.fn();
const mockFindAndCountByCompany = jest.fn();
const mockFindAllByCompany = jest.fn();

jest.unstable_mockModule('../../repositories/employeeRepository.js', () => ({
  employeeRepository: {
    create: mockCreate,
    findByIdOrFail: mockFindByIdOrFail,
    update: mockUpdate,
    delete: mockDelete,
    findOneByCompanyAndEmail: mockFindOneByCompanyAndEmail,
    findAndCountByCompany: mockFindAndCountByCompany,
    findAllByCompany: mockFindAllByCompany
  }
}));

const mockJobTitleFindByIdOrFail = jest.fn();

jest.unstable_mockModule('../../repositories/jobTitleRepository.js', () => ({
  jobTitleRepository: {
    findByIdOrFail: mockJobTitleFindByIdOrFail
  }
}));

const mockGetSuperAdminCompanyId = jest.fn();

jest.unstable_mockModule('../systemCompanyService.js', () => ({
  getSuperAdminCompanyId: mockGetSuperAdminCompanyId
}));

const mockCheckUserExistsInKeycloak = jest.fn();
const mockGetUserByEmail = jest.fn();
const mockCreateUserInKeycloak = jest.fn();
const mockCreateUserInDB = jest.fn();
const mockAssignUserToCompany = jest.fn();
const mockCompanyUserFindByIdOrFail = jest.fn();

jest.unstable_mockModule('../userService.js', () => ({
  checkUserExistsInKeycloak: mockCheckUserExistsInKeycloak,
  getUserByEmail: mockGetUserByEmail,
  createUserInKeycloak: mockCreateUserInKeycloak,
  createUserInDB: mockCreateUserInDB
}));

jest.unstable_mockModule('../companyUserService.js', () => ({
  assignUserToCompany: mockAssignUserToCompany
}));

jest.unstable_mockModule('../../repositories/companyUserRepository.js', () => ({
  companyUserRepository: {
    findByIdOrFail: mockCompanyUserFindByIdOrFail
  }
}));

let employeeService;

beforeAll(async () => {
  employeeService = await import('../employeeService.js');
});

const jobTitleRow = (companyId) => ({
  id: uuidv4(),
  jobTitle: 'Dev',
  description: null,
  isActive: true,
  createdCompanyId: companyId
});

const employeeRow = (companyId, jobTitleId, overrides = {}) => ({
  id: uuidv4(),
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.com',
  phone: null,
  employeeMetadata: {},
  jobTitleId,
  salary: 1,
  isActive: true,
  createdCompanyId: companyId,
  createdDate: new Date(),
  updatedDate: new Date(),
  version: 1,
  jobTitle: {
    id: jobTitleId,
    jobTitle: 'Dev',
    description: null,
    isActive: true
  },
  ...overrides
});

describe('employeeService', () => {
  const userId = uuidv4();
  const companyId = uuidv4();
  const systemCompanyId = uuidv4();
  const jtId = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
  });

  it('createEmployee normalizes email and validates job title owner', async () => {
    mockJobTitleFindByIdOrFail.mockResolvedValue(jobTitleRow(companyId));
    mockFindOneByCompanyAndEmail.mockResolvedValue(null);
    const created = employeeRow(companyId, jtId, { email: 'x@y.com' });
    mockCreate.mockResolvedValue({ id: created.id, ...created });
    mockFindByIdOrFail.mockResolvedValueOnce(created);

    const dto = await employeeService.createEmployee(
      {
        firstName: '  Jane ',
        lastName: ' Doe ',
        email: '  X@Y.COM  ',
        jobTitleId: jtId
      },
      { userId, companyId },
      { requestId: 'r1' }
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'x@y.com',
        firstName: 'Jane',
        lastName: 'Doe'
      }),
      { userId, companyId }
    );
    expect(dto.id).toBe(created.id);
  });

  it('createEmployee rejects job title from other tenant', async () => {
    mockJobTitleFindByIdOrFail.mockResolvedValue(jobTitleRow(uuidv4()));

    await expect(
      employeeService.createEmployee(
        { firstName: 'A', lastName: 'B', email: 'e@test.com', jobTitleId: jtId },
        { userId, companyId },
        {}
      )
    ).rejects.toThrow(BadRequestError);
  });

  it('createEmployee rejects inactive job title', async () => {
    mockJobTitleFindByIdOrFail.mockResolvedValue({
      ...jobTitleRow(companyId),
      isActive: false
    });

    await expect(
      employeeService.createEmployee(
        { firstName: 'A', lastName: 'B', email: 'e@test.com', jobTitleId: jtId },
        { userId, companyId },
        {}
      )
    ).rejects.toThrow(BadRequestError);
  });

  it('createEmployee throws ConflictError on duplicate email', async () => {
    mockJobTitleFindByIdOrFail.mockResolvedValue(jobTitleRow(companyId));
    mockFindOneByCompanyAndEmail.mockResolvedValue({ id: uuidv4() });

    await expect(
      employeeService.createEmployee(
        { firstName: 'A', lastName: 'B', email: 'dup@test.com', jobTitleId: jtId },
        { userId, companyId },
        {}
      )
    ).rejects.toThrow(ConflictError);
  });

  it('getEmployeeById throws when wrong company', async () => {
    mockFindByIdOrFail.mockResolvedValue(employeeRow(uuidv4(), jtId));

    await expect(employeeService.getEmployeeById(uuidv4(), companyId)).rejects.toThrow(NotFoundError);
  });

  it('setEmployeeActiveStatus updates isActive', async () => {
    const emp = employeeRow(companyId, jtId);
    mockFindByIdOrFail.mockResolvedValueOnce(emp).mockResolvedValueOnce({ ...emp, isActive: false });
    mockUpdate.mockResolvedValue(undefined);

    const dto = await employeeService.setEmployeeActiveStatus(emp.id, false, { userId, companyId });

    expect(mockUpdate).toHaveBeenCalledWith(emp.id, { isActive: false }, { userId });
    expect(dto.isActive).toBe(false);
  });

  describe('assignEmployeeCompanyRole', () => {
    const roleId = uuidv4();
    const cuId = uuidv4();

    it('updates role when employee already has companyUserId', async () => {
      const linkedUserId = uuidv4();
      const emp = employeeRow(companyId, jtId, { companyUserId: cuId });
      mockFindByIdOrFail.mockResolvedValueOnce(emp).mockResolvedValueOnce(emp);
      mockCompanyUserFindByIdOrFail.mockResolvedValue({
        id: cuId,
        userId: linkedUserId,
        companyId,
        companyRoleId: uuidv4()
      });
      mockAssignUserToCompany.mockResolvedValue({
        id: cuId,
        userId: linkedUserId,
        companyId,
        roleId,
        isActive: true
      });

      const result = await employeeService.assignEmployeeCompanyRole(emp.id, roleId, { userId, companyId });

      expect(mockAssignUserToCompany).toHaveBeenCalledWith(linkedUserId, companyId, roleId, { userId });
      expect(result.provisioned).toBe(false);
      expect(mockCreateUserInKeycloak).not.toHaveBeenCalled();
    });

    it('provisions user and links companyUserId when none set', async () => {
      const emp = employeeRow(companyId, jtId, { companyUserId: null });
      const newUserId = uuidv4();
      const assignmentId = uuidv4();
      mockFindByIdOrFail
        .mockResolvedValueOnce(emp)
        .mockResolvedValueOnce({ ...emp, companyUserId: assignmentId });
      mockCheckUserExistsInKeycloak.mockResolvedValue(null);
      mockCreateUserInKeycloak.mockResolvedValue({ id: 'kc-1' });
      mockCreateUserInDB.mockResolvedValue({ id: newUserId, email: emp.email });
      mockAssignUserToCompany.mockResolvedValue({
        id: assignmentId,
        userId: newUserId,
        companyId,
        roleId,
        isActive: true
      });
      mockUpdate.mockResolvedValue(undefined);

      const result = await employeeService.assignEmployeeCompanyRole(emp.id, roleId, { userId, companyId });

      expect(mockCreateUserInKeycloak).toHaveBeenCalled();
      expect(mockCreateUserInDB).toHaveBeenCalled();
      expect(mockAssignUserToCompany).toHaveBeenCalledWith(newUserId, companyId, roleId, { userId });
      expect(mockUpdate).toHaveBeenCalledWith(emp.id, { companyUserId: assignmentId }, { userId });
      expect(result.provisioned).toBe(true);
    });
  });
});
