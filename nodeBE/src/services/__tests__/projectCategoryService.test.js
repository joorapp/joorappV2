/**
 * @author Bhavesh Venugopal
 * Project category service tests
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

const mockFindOneByCategoryAndCompany = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdOrFail = jest.fn();
const mockFindAndCountByCreatedCompany = jest.fn();
const mockFindAndCountByCreatedCompanies = jest.fn();
const mockFindAllForCompanyDropdown = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.unstable_mockModule('../../repositories/projectCategoryRepository.js', () => ({
  projectCategoryRepository: {
    findOneByCategoryAndCompany: mockFindOneByCategoryAndCompany,
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

let projectCategoryService;

beforeAll(async () => {
  projectCategoryService = await import('../projectCategoryService.js');
});

const baseRow = (overrides = {}) => ({
  id: uuidv4(),
  projectCategory: 'X',
  description: null,
  isActive: true,
  createdDate: new Date(),
  updatedDate: new Date(),
  version: 1,
  createdCompanyId: uuidv4(),
  ...overrides
});

describe('projectCategoryService', () => {
  const userId = uuidv4();
  const companyId = uuidv4();
  const systemCompanyId = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProjectCategory', () => {
    it('should create when no duplicate', async () => {
      mockFindOneByCategoryAndCompany.mockResolvedValue(null);
      const row = baseRow({ projectCategory: 'Dev', createdCompanyId: companyId });
      mockCreate.mockResolvedValue(row);

      const dto = await projectCategoryService.createProjectCategory(
        { projectCategory: 'Dev' },
        { userId, companyId }
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ projectCategory: 'Dev' }),
        { userId, companyId }
      );
      expect(dto.projectCategory).toBe('Dev');
      expect(dto.canEdit).toBeUndefined();
    });

    it('should throw ConflictError on duplicate category for company', async () => {
      mockFindOneByCategoryAndCompany.mockResolvedValue({ id: uuidv4() });

      await expect(
        projectCategoryService.createProjectCategory({ projectCategory: 'Dup' }, { userId, companyId })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('listProjectCategoriesForCompany', () => {
    const pagination = { page: 1, limit: 10, offset: 0 };
    const order = [['projectCategory', 'ASC']];

    it('company workspace merges tenant + system and sets canEdit / canDelete', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      const tenantRow = baseRow({ id: 't1', projectCategory: 'T', createdCompanyId: companyId });
      const systemRow = baseRow({ id: 's1', projectCategory: 'S', createdCompanyId: systemCompanyId });
      mockFindAndCountByCreatedCompanies.mockResolvedValue({ rows: [tenantRow, systemRow], count: 2 });

      const result = await projectCategoryService.listProjectCategoriesForCompany(
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
      const t = result.projectCategories.find((x) => x.id === 't1');
      const s = result.projectCategories.find((x) => x.id === 's1');
      expect(t.canEdit).toBe(true);
      expect(t.canDelete).toBe(true);
      expect(s.canEdit).toBe(false);
      expect(s.canDelete).toBe(false);
    });

    it('superAdmin workspace lists system company only without flags', async () => {
      const row = baseRow({ projectCategory: 'Dev', createdCompanyId: systemCompanyId });
      mockFindAndCountByCreatedCompany.mockResolvedValue({ rows: [row], count: 1 });

      const result = await projectCategoryService.listProjectCategoriesForCompany(
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
      expect(result.projectCategories[0].projectCategory).toBe('Dev');
      expect(result.projectCategories[0].canEdit).toBeUndefined();
    });

    it('throws when company workspace uses system company id', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);

      await expect(
        projectCategoryService.listProjectCategoriesForCompany(
          systemCompanyId,
          {},
          pagination,
          order,
          { requestId: 'r' }
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('listAllProjectCategoriesForDropdown', () => {
    it('should merge system and tenant categories', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindAllForCompanyDropdown.mockResolvedValue([
        {
          id: '1',
          projectCategory: 'A',
          description: null,
          isActive: true,
          createdDate: new Date(),
          updatedDate: new Date(),
          version: 1
        }
      ]);

      const list = await projectCategoryService.listAllProjectCategoriesForDropdown(companyId, {
        requestId: 'r1'
      });

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

      await projectCategoryService.listAllProjectCategoriesForDropdown(companyId, {
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

      await expect(
        projectCategoryService.listAllProjectCategoriesForDropdown(systemCompanyId, {})
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getProjectCategoryByIdForCompany', () => {
    it('company workspace returns tenant-owned with canEdit true', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId }));

      const dto = await projectCategoryService.getProjectCategoryByIdForCompany(id, companyId, {
        requestId: 'r'
      });
      expect(dto.id).toBe(id);
      expect(dto.canEdit).toBe(true);
      expect(dto.canDelete).toBe(true);
    });

    it('company workspace returns system-owned with canEdit false', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      const dto = await projectCategoryService.getProjectCategoryByIdForCompany(id, companyId, {
        requestId: 'r'
      });
      expect(dto.canEdit).toBe(false);
      expect(dto.canDelete).toBe(false);
    });

    it('company workspace throws NotFound when category is another tenant', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: uuidv4() }));

      await expect(
        projectCategoryService.getProjectCategoryByIdForCompany(id, companyId, { requestId: 'r' })
      ).rejects.toThrow(NotFoundError);
    });

    it('superAdmin workspace returns plain DTO', async () => {
      const id = uuidv4();
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      const dto = await projectCategoryService.getProjectCategoryByIdForCompany(id, systemCompanyId, {
        requestId: 'r',
        workspace: 'superAdmin'
      });
      expect(dto.id).toBe(id);
      expect(dto.canEdit).toBeUndefined();
    });
  });

  describe('updateProjectCategoryForCompany', () => {
    it('throws ForbiddenError for system-owned category from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        projectCategoryService.updateProjectCategoryForCompany(
          id,
          { projectCategory: 'Y' },
          { userId, requestId: 'r' },
          companyId
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('updates tenant-owned category', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      const row = baseRow({ id, projectCategory: 'Old', createdCompanyId: companyId });
      mockFindByIdOrFail.mockResolvedValue(row);
      mockFindOneByCategoryAndCompany.mockResolvedValue(null);
      const updated = baseRow({ id, projectCategory: 'New', createdCompanyId: companyId });
      mockUpdate.mockResolvedValue(updated);

      const dto = await projectCategoryService.updateProjectCategoryForCompany(
        id,
        { projectCategory: 'New' },
        { userId, requestId: 'r' },
        companyId
      );
      expect(dto.projectCategory).toBe('New');
      expect(mockUpdate).toHaveBeenCalledWith(id, { projectCategory: 'New' }, { userId });
    });
  });

  describe('deleteProjectCategoryForCompany', () => {
    it('throws ForbiddenError for system-owned category from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        projectCategoryService.deleteProjectCategoryForCompany(id, { userId, requestId: 'r' }, companyId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('deletes tenant-owned category', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId }));
      mockDelete.mockResolvedValue(undefined);

      await projectCategoryService.deleteProjectCategoryForCompany(id, { userId, requestId: 'r' }, companyId);
      expect(mockDelete).toHaveBeenCalledWith(id, { userId });
    });
  });

  describe('setProjectCategoryActiveStatusForCompany', () => {
    it('throws ForbiddenError for system-owned category from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        projectCategoryService.setProjectCategoryActiveStatusForCompany(
          id,
          false,
          { userId, requestId: 'r' },
          companyId
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('updates isActive for tenant-owned category', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId, isActive: true }));
      mockUpdate.mockResolvedValue(baseRow({ id, createdCompanyId: companyId, isActive: false }));

      const dto = await projectCategoryService.setProjectCategoryActiveStatusForCompany(
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
