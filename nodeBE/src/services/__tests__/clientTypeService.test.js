/**
 * @author Bhavesh Venugopal
 * Client type service tests
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

const mockFindOneByClientTypeAndCompany = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdOrFail = jest.fn();
const mockFindAndCountByCreatedCompany = jest.fn();
const mockFindAndCountByCreatedCompanies = jest.fn();
const mockFindAllForCompanyDropdown = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.unstable_mockModule('../../repositories/clientTypeRepository.js', () => ({
  clientTypeRepository: {
    findOneByClientTypeAndCompany: mockFindOneByClientTypeAndCompany,
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

let clientTypeService;

beforeAll(async () => {
  clientTypeService = await import('../clientTypeService.js');
});

const baseRow = (overrides = {}) => ({
  id: uuidv4(),
  clientType: 'X',
  description: null,
  isActive: true,
  createdDate: new Date(),
  updatedDate: new Date(),
  version: 1,
  createdCompanyId: uuidv4(),
  ...overrides
});

describe('clientTypeService', () => {
  const userId = uuidv4();
  const companyId = uuidv4();
  const systemCompanyId = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createClientType', () => {
    it('should create when no duplicate', async () => {
      mockFindOneByClientTypeAndCompany.mockResolvedValue(null);
      const row = baseRow({ clientType: 'Dev', createdCompanyId: companyId });
      mockCreate.mockResolvedValue(row);

      const dto = await clientTypeService.createClientType({ clientType: 'Dev' }, { userId, companyId });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ clientType: 'Dev' }),
        { userId, companyId }
      );
      expect(dto.clientType).toBe('Dev');
      expect(dto.canEdit).toBeUndefined();
    });

    it('should throw ConflictError on duplicate type for company', async () => {
      mockFindOneByClientTypeAndCompany.mockResolvedValue({ id: uuidv4() });

      await expect(
        clientTypeService.createClientType({ clientType: 'Dup' }, { userId, companyId })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('listClientTypesForCompany', () => {
    const pagination = { page: 1, limit: 10, offset: 0 };
    const order = [['clientType', 'ASC']];

    it('company workspace merges tenant + system and sets canEdit / canDelete', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      const tenantRow = baseRow({ id: 't1', clientType: 'T', createdCompanyId: companyId });
      const systemRow = baseRow({ id: 's1', clientType: 'S', createdCompanyId: systemCompanyId });
      mockFindAndCountByCreatedCompanies.mockResolvedValue({ rows: [tenantRow, systemRow], count: 2 });

      const result = await clientTypeService.listClientTypesForCompany(
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
      const t = result.clientTypes.find((x) => x.id === 't1');
      const s = result.clientTypes.find((x) => x.id === 's1');
      expect(t.canEdit).toBe(true);
      expect(t.canDelete).toBe(true);
      expect(s.canEdit).toBe(false);
      expect(s.canDelete).toBe(false);
    });

    it('superAdmin workspace lists system company only without flags', async () => {
      const row = baseRow({ clientType: 'Dev', createdCompanyId: systemCompanyId });
      mockFindAndCountByCreatedCompany.mockResolvedValue({ rows: [row], count: 1 });

      const result = await clientTypeService.listClientTypesForCompany(
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
      expect(result.clientTypes[0].clientType).toBe('Dev');
      expect(result.clientTypes[0].canEdit).toBeUndefined();
    });

    it('throws when company workspace uses system company id', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);

      await expect(
        clientTypeService.listClientTypesForCompany(systemCompanyId, {}, pagination, order, { requestId: 'r' })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('listAllClientTypesForDropdown', () => {
    it('should merge system and tenant types', async () => {
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindAllForCompanyDropdown.mockResolvedValue([
        {
          id: '1',
          clientType: 'A',
          description: null,
          isActive: true,
          createdDate: new Date(),
          updatedDate: new Date(),
          version: 1
        }
      ]);

      const list = await clientTypeService.listAllClientTypesForDropdown(companyId, { requestId: 'r1' });

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

      await clientTypeService.listAllClientTypesForDropdown(companyId, {
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

      await expect(clientTypeService.listAllClientTypesForDropdown(systemCompanyId, {})).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe('getClientTypeByIdForCompany', () => {
    it('company workspace returns tenant-owned with canEdit true', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId }));

      const dto = await clientTypeService.getClientTypeByIdForCompany(id, companyId, { requestId: 'r' });
      expect(dto.id).toBe(id);
      expect(dto.canEdit).toBe(true);
      expect(dto.canDelete).toBe(true);
    });

    it('company workspace returns system-owned with canEdit false', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      const dto = await clientTypeService.getClientTypeByIdForCompany(id, companyId, { requestId: 'r' });
      expect(dto.canEdit).toBe(false);
      expect(dto.canDelete).toBe(false);
    });

    it('company workspace throws NotFound when type is another tenant', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: uuidv4() }));

      await expect(
        clientTypeService.getClientTypeByIdForCompany(id, companyId, { requestId: 'r' })
      ).rejects.toThrow(NotFoundError);
    });

    it('superAdmin workspace returns plain DTO', async () => {
      const id = uuidv4();
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      const dto = await clientTypeService.getClientTypeByIdForCompany(id, systemCompanyId, {
        requestId: 'r',
        workspace: 'superAdmin'
      });
      expect(dto.id).toBe(id);
      expect(dto.canEdit).toBeUndefined();
    });
  });

  describe('updateClientTypeForCompany', () => {
    it('throws ForbiddenError for system-owned type from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        clientTypeService.updateClientTypeForCompany(id, { clientType: 'Y' }, { userId, requestId: 'r' }, companyId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('updates tenant-owned type', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      const row = baseRow({ id, clientType: 'Old', createdCompanyId: companyId });
      mockFindByIdOrFail.mockResolvedValue(row);
      mockFindOneByClientTypeAndCompany.mockResolvedValue(null);
      const updated = baseRow({ id, clientType: 'New', createdCompanyId: companyId });
      mockUpdate.mockResolvedValue(updated);

      const dto = await clientTypeService.updateClientTypeForCompany(
        id,
        { clientType: 'New' },
        { userId, requestId: 'r' },
        companyId
      );
      expect(dto.clientType).toBe('New');
      expect(mockUpdate).toHaveBeenCalledWith(id, { clientType: 'New' }, { userId });
    });
  });

  describe('deleteClientTypeForCompany', () => {
    it('throws ForbiddenError for system-owned type from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        clientTypeService.deleteClientTypeForCompany(id, { userId, requestId: 'r' }, companyId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('deletes tenant-owned type', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: companyId }));
      mockDelete.mockResolvedValue(undefined);

      await clientTypeService.deleteClientTypeForCompany(id, { userId, requestId: 'r' }, companyId);
      expect(mockDelete).toHaveBeenCalledWith(id, { userId });
    });
  });

  describe('setClientTypeActiveStatusForCompany', () => {
    it('throws ForbiddenError for system-owned type from tenant context', async () => {
      const id = uuidv4();
      mockGetSuperAdminCompanyId.mockResolvedValue(systemCompanyId);
      mockFindByIdOrFail.mockResolvedValue(baseRow({ id, createdCompanyId: systemCompanyId }));

      await expect(
        clientTypeService.setClientTypeActiveStatusForCompany(
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

      const dto = await clientTypeService.setClientTypeActiveStatusForCompany(
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
