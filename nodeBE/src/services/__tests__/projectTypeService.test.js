/**
 * @author Bhavesh Venugopal
 * Project type service tests
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

const mockFindOneByTypeAndCompany = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdOrFail = jest.fn();
const mockFindAndCountByCreatedCompany = jest.fn();
const mockFindAndCountByCreatedCompanies = jest.fn();
const mockFindAllForCompanyDropdown = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.unstable_mockModule('../../repositories/projectTypeRepository.js', () => ({
  projectTypeRepository: {
    findOneByTypeAndCompany: mockFindOneByTypeAndCompany,
    create: mockCreate,
    findByIdOrFail: mockFindByIdOrFail,
    findAndCountByCreatedCompany: mockFindAndCountByCreatedCompany,
    findAndCountByCreatedCompanies: mockFindAndCountByCreatedCompanies,
    findAllForCompanyDropdown: mockFindAllForCompanyDropdown,
    update: mockUpdate,
    delete: mockDelete
  }
}));

const mockGetSuperAdminCompanyId = jest.fn();

jest.unstable_mockModule('../systemCompanyService.js', () => ({
  getSuperAdminCompanyId: mockGetSuperAdminCompanyId
}));

let projectTypeService;

beforeAll(async () => {
  projectTypeService = await import('../projectTypeService.js');
});

const baseRow = (overrides = {}) => ({
  id: uuidv4(),
  projectType: 'X',
  description: null,
  isActive: true,
  createdDate: new Date(),
  updatedDate: new Date(),
  version: 1,
  createdCompanyId: uuidv4(),
  ...overrides
});

describe('projectTypeService', () => {
  const userId = uuidv4();
  const companyId = uuidv4();
  const systemCompanyId = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProjectType', () => {
    it('should create when no duplicate', async () => {
      mockFindOneByTypeAndCompany.mockResolvedValue(null);
      const row = baseRow({ projectType: 'Dev', createdCompanyId: companyId });
      mockCreate.mockResolvedValue(row);

      const dto = await projectTypeService.createProjectType({ projectType: 'Dev' }, { userId, companyId });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ projectType: 'Dev' }),
        { userId, companyId }
      );
      expect(dto.projectType).toBe('Dev');
      expect(dto.canEdit).toBeUndefined();
    });

    it('should throw ConflictError on duplicate type for company', async () => {
      mockFindOneByTypeAndCompany.mockResolvedValue({ id: uuidv4() });

      await expect(
        projectTypeService.createProjectType({ projectType: 'Dup' }, { userId, companyId })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('listProjectTypesForCompany', () => {
    const pagination = { page: 1, limit: 10, offset: 0 };
    const order = [['projectType', 'ASC']];

    it('company workspace merges tenant + system and sets canEdit / canDelete', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      const tenantRow = baseRow({ id: 't1', projectType: 'T', createdCompanyId: companyId });
      const systemRow = baseRow({ id: 's1', projectType: 'S', createdCompanyId: systemCompanyId });
      mockFindAndCountByCreatedCompanies.mockResolvedValue({ rows: [tenantRow, systemRow], count: 2 });

      const result = await projectTypeService.listProjectTypesForCompany(
        companyId,
        {},
        pagination,
        order,
        { requestId: 'r1' }
      );

      expect(mockGetSuperAdminCompanyId).toHaveBeenCalledWith({ requestId: 'r1' });
      expect(mockFindAndCountByCreatedCompanies).toHaveBeenCalledWith(
        [companyId, systemCompanyId],
        {},
        { limit: 10, offset: 0 },
        order
      );
      expect(result.total).toBe(2);
      const t = result.projectTypes.find((x) => x.id === 't1');
      const s = result.projectTypes.find((x) => x.id === 's1');
      expect(t.canEdit).toBe(true);
      expect(t.canDelete).toBe(true);
      expect(s.canEdit).toBe(false);
      expect(s.canDelete).toBe(false);
    });

    it('superAdmin workspace lists system company only without flags', async () => {
      const row = baseRow({ projectType: 'Dev', createdCompanyId: systemCompanyId });
      mockFindAndCountByCreatedCompany.mockResolvedValue({ rows: [row], count: 1 });

      const result = await projectTypeService.listProjectTypesForCompany(
        systemCompanyId,
        {},
        pagination,
        order,
        { requestId: 'r1', workspace: 'superAdmin' }
      );

      expect(mockFindAndCountByCreatedCompany).toHaveBeenCalledWith(
        systemCompanyId,
        {},
        { limit: 10, offset: 0 },
        order
      );
      expect(mockFindAndCountByCreatedCompanies).not.toHaveBeenCalled();
      expect(result.projectTypes[0].projectType).toBe('Dev');
      expect(result.projectTypes[0].canEdit).toBeUndefined();
    });

    it('throws when company workspace uses system company id', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);

      await expect(
        projectTypeService.listProjectTypesForCompany(systemCompanyId, {}, pagination, order, { requestId: 'r' })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('listAllProjectTypesForDropdown', () => {
    it('should merge system and tenant types', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindAllForCompanyDropdown.mockResolvedValue([
        {
          id: '1',
          projectType: 'A',
          description: null,
          isActive: true,
          createdDate: new Date(),
          updatedDate: new Date(),
          version: 1
        }
      ]);

      const list = await projectTypeService.listAllProjectTypesForDropdown(companyId, { requestId: 'r1' });

      expect(mockGetSuperAdminCompanyId).toHaveBeenCalledWith({ requestId: 'r1' });
      expect(mockFindAllForCompanyDropdown).toHaveBeenCalledWith(companyId, systemCompanyId, {
        search: undefined
      });
      expect(list).toHaveLength(1);
      expect(list[0].canEdit).toBeUndefined();
    });

    it('should pass isActive filter to repository when set', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindAllForCompanyDropdown.mockResolvedValue([]);

      await projectTypeService.listAllProjectTypesForDropdown(companyId, {
        requestId: 'r1',
        isActive: false
      });

      expect(mockFindAllForCompanyDropdown).toHaveBeenCalledWith(companyId, systemCompanyId, {
        search: undefined,
        isActive: false
      });
    });

    it('should throw ForbiddenError when tenant is system company', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);

      await expect(projectTypeService.listAllProjectTypesForDropdown(systemCompanyId, {})).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe('getProjectTypeByIdForCompany', () => {
    it('company workspace returns tenant-owned with canEdit true', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId }));

      const dto = await projectTypeService.getProjectTypeByIdForCompany(id, companyId, { requestId: 'r' });
      expect(dto.id).toBe(id);
      expect(dto.canEdit).toBe(true);
      expect(dto.canDelete).toBe(true);
    });

    it('company workspace returns system-owned with canEdit false', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      const dto = await projectTypeService.getProjectTypeByIdForCompany(id, companyId, { requestId: 'r' });
      expect(dto.canEdit).toBe(false);
      expect(dto.canDelete).toBe(false);
    });

    it('company workspace throws NotFound when type is another tenant', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: uuidv4() }));

      await expect(
        projectTypeService.getProjectTypeByIdForCompany(id, companyId, { requestId: 'r' })
      ).rejects.toThrow(NotFoundError);
    });

    it('superAdmin workspace returns plain DTO', async () => {
      const id = uuidv4();
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      const dto = await projectTypeService.getProjectTypeByIdForCompany(id, systemCompanyId, {
        requestId: 'r',
        workspace: 'superAdmin'
      });
      expect(dto.id).toBe(id);
      expect(dto.canEdit).toBeUndefined();
    });
  });

  describe('updateProjectTypeForCompany', () => {
    it('throws ForbiddenError for system-owned type from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        projectTypeService.updateProjectTypeForCompany(id, { projectType: 'Y' }, { userId, requestId: 'r' }, companyId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('updates tenant-owned type', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      const row = baseRow({ id, projectType: 'Old', createdCompanyId: companyId });
      mockFindByIdOrFail.mockResolvedValue(row);
      mockFindOneByTypeAndCompany.mockResolvedValue(null);
      const updated = baseRow({ id, projectType: 'New', createdCompanyId: companyId });
      mockUpdate.mockResolvedValue(updated);

      const dto = await projectTypeService.updateProjectTypeForCompany(
        id,
        { projectType: 'New' },
        { userId, requestId: 'r' },
        companyId
      );
      expect(dto.projectType).toBe('New');
      expect(mockUpdate).toHaveBeenCalledWith(id, { projectType: 'New' }, { userId });
    });
  });

  describe('deleteProjectTypeForCompany', () => {
    it('throws ForbiddenError for system-owned type from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        projectTypeService.deleteProjectTypeForCompany(id, { userId, requestId: 'r' }, companyId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('deletes tenant-owned type', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId }));
      mockDelete.mockResolvedValue(undefined);

      await projectTypeService.deleteProjectTypeForCompany(id, { userId, requestId: 'r' }, companyId);
      expect(mockDelete).toHaveBeenCalledWith(id, { userId });
    });
  });

  describe('setProjectTypeActiveStatusForCompany', () => {
    it('throws ForbiddenError for system-owned type from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        projectTypeService.setProjectTypeActiveStatusForCompany(
          id,
          false,
          { userId, requestId: 'r' },
          companyId
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('updates isActive for tenant-owned type', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId, isActive: true }));
      mockUpdate.mockResolvedValue(baseRow({ id, createdCompanyId: companyId, isActive: false }));

      const dto = await projectTypeService.setProjectTypeActiveStatusForCompany(
        id,
        false,
        { userId, requestId: 'r' },
        companyId
      );

      expect(mockUpdate).toHaveBeenCalledWith(id, { isActive: false }, { userId });
      expect(dto.isActive).toBe(false);
    });
  });
});
