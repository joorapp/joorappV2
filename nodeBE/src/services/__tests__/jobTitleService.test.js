/**
 * @author Bhavesh Venugopal
 * Job title service tests
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

const mockFindOneByTitleAndCompany = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdOrFail = jest.fn();
const mockFindAndCountByCreatedCompany = jest.fn();
const mockFindAndCountByCreatedCompanies = jest.fn();
const mockFindAllForCompanyDropdown = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.unstable_mockModule('../../repositories/jobTitleRepository.js', () => ({
  jobTitleRepository: {
    findOneByTitleAndCompany: mockFindOneByTitleAndCompany,
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

let jobTitleService;

beforeAll(async () => {
  jobTitleService = await import('../jobTitleService.js');
});

const baseRow = (overrides = {}) => ({
  id: uuidv4(),
  jobTitle: 'X',
  description: null,
  isActive: true,
  createdDate: new Date(),
  updatedDate: new Date(),
  version: 1,
  createdCompanyId: uuidv4(),
  ...overrides
});

describe('jobTitleService', () => {
  const userId = uuidv4();
  const companyId = uuidv4();
  const systemCompanyId = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createJobTitle', () => {
    it('should create when no duplicate', async () => {
      mockFindOneByTitleAndCompany.mockResolvedValue(null);
      const row = baseRow({ jobTitle: 'Dev', createdCompanyId: companyId });
      mockCreate.mockResolvedValue(row);

      const dto = await jobTitleService.createJobTitle({ jobTitle: 'Dev' }, { userId, companyId });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ jobTitle: 'Dev' }),
        { userId, companyId }
      );
      expect(dto.jobTitle).toBe('Dev');
      expect(dto.canEdit).toBeUndefined();
    });

    it('should throw ConflictError on duplicate title for company', async () => {
      mockFindOneByTitleAndCompany.mockResolvedValue({ id: uuidv4() });

      await expect(
        jobTitleService.createJobTitle({ jobTitle: 'Dup' }, { userId, companyId })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('listJobTitlesForCompany', () => {
    const pagination = { page: 1, limit: 10, offset: 0 };
    const order = [['jobTitle', 'ASC']];

    it('company workspace merges tenant + system and sets canEdit / canDelete', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      const tenantRow = baseRow({ id: 't1', jobTitle: 'T', createdCompanyId: companyId });
      const systemRow = baseRow({ id: 's1', jobTitle: 'S', createdCompanyId: systemCompanyId });
      mockFindAndCountByCreatedCompanies.mockResolvedValue({ rows: [tenantRow, systemRow], count: 2 });

      const result = await jobTitleService.listJobTitlesForCompany(
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
      const t = result.jobTitles.find((x) => x.id === 't1');
      const s = result.jobTitles.find((x) => x.id === 's1');
      expect(t.canEdit).toBe(true);
      expect(t.canDelete).toBe(true);
      expect(s.canEdit).toBe(false);
      expect(s.canDelete).toBe(false);
    });

    it('superAdmin workspace lists system company only without flags', async () => {
      const row = baseRow({ jobTitle: 'Dev', createdCompanyId: systemCompanyId });
      mockFindAndCountByCreatedCompany.mockResolvedValue({ rows: [row], count: 1 });

      const result = await jobTitleService.listJobTitlesForCompany(
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
      expect(result.jobTitles[0].jobTitle).toBe('Dev');
      expect(result.jobTitles[0].canEdit).toBeUndefined();
    });

    it('throws when company workspace uses system company id', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);

      await expect(
        jobTitleService.listJobTitlesForCompany(systemCompanyId, {}, pagination, order, { requestId: 'r' })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('listAllJobTitlesForDropdown', () => {
    it('should merge system and tenant titles', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindAllForCompanyDropdown.mockResolvedValue([
        { id: '1', jobTitle: 'A', description: null, isActive: true, createdDate: new Date(), updatedDate: new Date(), version: 1 }
      ]);

      const list = await jobTitleService.listAllJobTitlesForDropdown(companyId, { requestId: 'r1' });

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

      await jobTitleService.listAllJobTitlesForDropdown(companyId, {
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
        jobTitleService.listAllJobTitlesForDropdown(systemCompanyId, {})
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getJobTitleByIdForCompany', () => {
    it('company workspace returns tenant-owned with canEdit true', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId }));

      const dto = await jobTitleService.getJobTitleByIdForCompany(id, companyId, { requestId: 'r' });
      expect(dto.id).toBe(id);
      expect(dto.canEdit).toBe(true);
      expect(dto.canDelete).toBe(true);
    });

    it('company workspace returns system-owned with canEdit false', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      const dto = await jobTitleService.getJobTitleByIdForCompany(id, companyId, { requestId: 'r' });
      expect(dto.canEdit).toBe(false);
      expect(dto.canDelete).toBe(false);
    });

    it('company workspace throws NotFound when title is another tenant', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: uuidv4() }));

      await expect(
        jobTitleService.getJobTitleByIdForCompany(id, companyId, { requestId: 'r' })
      ).rejects.toThrow(NotFoundError);
    });

    it('superAdmin workspace returns plain DTO', async () => {
      const id = uuidv4();
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      const dto = await jobTitleService.getJobTitleByIdForCompany(id, systemCompanyId, {
        requestId: 'r',
        workspace: 'superAdmin'
      });
      expect(dto.id).toBe(id);
      expect(dto.canEdit).toBeUndefined();
    });
  });

  describe('updateJobTitleForCompany', () => {
    it('throws ForbiddenError for system-owned title from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        jobTitleService.updateJobTitleForCompany(id, { jobTitle: 'Y' }, { userId, requestId: 'r' }, companyId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('updates tenant-owned title', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      const row = baseRow({ id, jobTitle: 'Old', createdCompanyId: companyId });
      mockFindByIdOrFail.mockResolvedValue(row);
      mockFindOneByTitleAndCompany.mockResolvedValue(null);
      const updated = baseRow({ id, jobTitle: 'New', createdCompanyId: companyId });
      mockUpdate.mockResolvedValue(updated);

      const dto = await jobTitleService.updateJobTitleForCompany(
        id,
        { jobTitle: 'New' },
        { userId, requestId: 'r' },
        companyId
      );
      expect(dto.jobTitle).toBe('New');
      expect(mockUpdate).toHaveBeenCalledWith(id, { jobTitle: 'New' }, { userId });
    });
  });

  describe('deleteJobTitleForCompany', () => {
    it('throws ForbiddenError for system-owned title from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        jobTitleService.deleteJobTitleForCompany(id, { userId, requestId: 'r' }, companyId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('deletes tenant-owned title', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId }));
      mockDelete.mockResolvedValue(undefined);

      await jobTitleService.deleteJobTitleForCompany(id, { userId, requestId: 'r' }, companyId);
      expect(mockDelete).toHaveBeenCalledWith(id, { userId });
    });
  });

  describe('setJobTitleActiveStatusForCompany', () => {
    it('throws ForbiddenError for system-owned title from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        jobTitleService.setJobTitleActiveStatusForCompany(
          id,
          false,
          { userId, requestId: 'r' },
          companyId
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('updates isActive for tenant-owned title', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId, isActive: true }));
      mockUpdate.mockResolvedValue(baseRow({ id, createdCompanyId: companyId, isActive: false }));

      const dto = await jobTitleService.setJobTitleActiveStatusForCompany(
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
