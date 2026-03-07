/**
 * @author Bhavesh Venugopal
 * Company Service Tests
 * Tests for companyService business logic layer
 * Uses mocked repositories to test business logic, error handling, and DTO transformation
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { createMockCompany } from '../../../__tests__/mocks/models/CompanyMock.js';
import { createMockCompanyUser } from '../../../__tests__/mocks/models/CompanyUserMock.js';
import { createMockRole } from '../../../__tests__/mocks/models/CompanyRoleMock.js';
import { createMockUser } from '../../../__tests__/mocks/models/UserMock.js';
import { createMockContext } from '../../../__tests__/mocks/contextMock.js';
import { createMockPlan } from '../../../__tests__/mocks/models/PlanMock.js';
import { Plan } from '../../models/index.js';
import { COMPANY_STATUS_DEFAULT, COMPANY_STATUSES } from '../../constants/companyStatus.js';

// Mock the repositories using unstable_mockModule for ES modules
jest.unstable_mockModule('../../repositories/companyRepository.js', () => ({
  companyRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdOrFail: jest.fn(),
    findByIdIncludingDeletedOrFail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    restore: jest.fn(),
    findAndCountAll: jest.fn(),
    searchCompanies: jest.fn()
  }
}));

jest.unstable_mockModule('../../repositories/companyUserRepository.js', () => ({
  companyUserRepository: {
    findCompanyUsers: jest.fn()
  }
}));

// Import after mocking (must use await import for ES modules)
let companyService;
let companyRepository;
let companyUserRepository;

beforeAll(async () => {
  companyService = await import('../companyService.js');
  const companyRepoModule = await import('../../repositories/companyRepository.js');
  companyRepository = companyRepoModule.companyRepository;
  const companyUserRepoModule = await import('../../repositories/companyUserRepository.js');
  companyUserRepository = companyUserRepoModule.companyUserRepository;
});

describe('Company Service', () => {
  let mockContext;
  let mockCompany;
  let mockCreatedCompany;
  let mockUpdatedCompany;
  let mockDeletedCompany;
  let mockPlan;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Ensure services and repositories are available
    if (!companyService || !companyRepository || !companyUserRepository) {
      throw new Error('companyService, companyRepository, or companyUserRepository not initialized');
    }

    // Setup test data using shared mocks
    mockContext = createMockContext();
    mockPlan = createMockPlan({
      name: 'Basic',
      code: 'BASIC',
      description: 'Basic subscription plan',
      price: 0.00,
      isActive: true
    });
    
    mockCompany = createMockCompany({
      name: 'Acme Corp',
      description: 'Leading technology company',
      status: COMPANY_STATUS_DEFAULT,
      email: 'contact@acme.com',
      phone: '+1 234-567-8900',
      createdUserId: mockContext.userId,
      updatedUserId: mockContext.userId,
      planId: mockPlan.id,
      plan: mockPlan
    });

    mockCreatedCompany = createMockCompany({
      name: 'Acme Corp',
      description: 'Leading technology company',
      createdUserId: mockContext.userId,
      planId: mockPlan.id,
      plan: mockPlan
    });

    mockUpdatedCompany = createMockCompany({
      ...mockCompany,
      name: 'Updated Acme Corp',
      version: 2,
      plan: mockPlan
    });

    mockDeletedCompany = createMockCompany({
      ...mockCompany,
      isDeleted: true,
      deletedDate: new Date(),
      deletedUserId: mockContext.userId
    });
  });

  describe('createCompany', () => {
    it('should create company successfully when name is unique', async () => {
      // Arrange
      const companyData = {
        name: 'New Company',
        description: 'New company description',
        isActive: true
      };
      
      companyRepository.findOne.mockResolvedValue(null);
      companyRepository.create.mockResolvedValue(mockCreatedCompany);
      // Mock the reload with Plan association
      companyRepository.findByIdOrFail.mockResolvedValue({
        ...mockCreatedCompany,
        plan: mockPlan
      });

      // Act
      const result = await companyService.createCompany(companyData, mockContext);

      // Assert
      expect(companyRepository.findOne).toHaveBeenCalledWith({ name: 'New Company' });
      expect(companyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Company',
          description: 'New company description',
          isActive: true,
          status: COMPANY_STATUS_DEFAULT,
          email: null,
          phone: null,
          buildingAddress: null,
          streetAddress: null,
          city: null,
          state: null,
          postalCode: null,
          country: null,
          logo: null
        }),
        mockContext
      );
      
      // Verify DTO transformation with plan object
      expect(result).toEqual({
        id: mockCreatedCompany.id,
        name: mockCreatedCompany.name,
        description: mockCreatedCompany.description,
        isActive: mockCreatedCompany.isActive,
        status: mockCreatedCompany.status,
        email: mockCreatedCompany.email,
        phone: mockCreatedCompany.phone,
        buildingAddress: mockCreatedCompany.buildingAddress,
        streetAddress: mockCreatedCompany.streetAddress,
        city: mockCreatedCompany.city,
        state: mockCreatedCompany.state,
        postalCode: mockCreatedCompany.postalCode,
        country: mockCreatedCompany.country,
        plan: {
          id: mockPlan.id,
          name: mockPlan.name,
          code: mockPlan.code,
          description: mockPlan.description,
          price: parseFloat(mockPlan.price) || 0.00,
          isActive: mockPlan.isActive,
          createdDate: mockPlan.createdDate,
          updatedDate: mockPlan.updatedDate,
          version: mockPlan.version
        },
        createdDate: mockCreatedCompany.createdDate,
        createdUserId: mockCreatedCompany.createdUserId
      });
      expect(result).not.toHaveProperty('updatedDate');
      expect(result).not.toHaveProperty('version');
      expect(result).not.toHaveProperty('logo'); // Logo excluded by default
      expect(result).not.toHaveProperty('planId'); // planId replaced with plan object
    });

    it('should throw ConflictError when company name already exists', async () => {
      // Arrange
      const companyData = {
        name: 'Acme Corp',
        description: 'Test company'
      };
      
      companyRepository.findOne.mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(
        companyService.createCompany(companyData, mockContext)
      ).rejects.toThrow(ConflictError);
      
      expect(companyRepository.create).not.toHaveBeenCalled();
    });

    it('should use default isActive=true when not provided', async () => {
      // Arrange
      const companyData = {
        name: 'New Company'
      };
      
      companyRepository.findOne.mockResolvedValue(null);
      companyRepository.create.mockResolvedValue(mockCreatedCompany);

      // Act
      await companyService.createCompany(companyData, mockContext);

      // Assert
      expect(companyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
        mockContext
      );
    });

    it('should set description to null when not provided', async () => {
      // Arrange
      const companyData = {
        name: 'New Company',
        isActive: true
      };
      
      companyRepository.findOne.mockResolvedValue(null);
      companyRepository.create.mockResolvedValue(mockCreatedCompany);

      // Act
      await companyService.createCompany(companyData, mockContext);

      // Assert
      expect(companyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: null }),
        mockContext
      );
    });

    it('should create company with all new fields', async () => {
      // Arrange
      const companyData = {
        name: 'New Company',
        email: 'contact@example.com',
        phone: '+1 234-567-8900',
        buildingAddress: 'Suite 100',
        streetAddress: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        status: 'ACTIVE'
      };
      
      companyRepository.findOne.mockResolvedValue(null);
      companyRepository.create.mockResolvedValue(mockCreatedCompany);

      // Act
      await companyService.createCompany(companyData, mockContext);

      // Assert
      expect(companyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'contact@example.com',
          phone: '+1 234-567-8900',
          buildingAddress: 'Suite 100',
          streetAddress: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
          status: 'ACTIVE'
        }),
        mockContext
      );
    });

    it('should use default status when not provided', async () => {
      // Arrange
      const companyData = {
        name: 'New Company'
      };
      
      companyRepository.findOne.mockResolvedValue(null);
      companyRepository.create.mockResolvedValue(mockCreatedCompany);

      // Act
      await companyService.createCompany(companyData, mockContext);

      // Assert
      expect(companyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: COMPANY_STATUS_DEFAULT }),
        mockContext
      );
    });

    it('should throw ConflictError for invalid status', async () => {
      // Arrange
      const companyData = {
        name: 'New Company',
        status: 'INVALID_STATUS'
      };
      
      companyRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        companyService.createCompany(companyData, mockContext)
      ).rejects.toThrow(ConflictError);
      
      expect(companyRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getCompanyByEmail', () => {
    it('should return company by email', async () => {
      // Arrange
      const email = 'contact@acme.com';
      companyRepository.findOne.mockResolvedValue(mockCompany);

      // Act
      const result = await companyService.getCompanyByEmail(email);

      // Assert
      expect(companyRepository.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual({
        id: mockCompany.id,
        name: mockCompany.name,
        email: mockCompany.email,
        isActive: mockCompany.isActive
      });
    });

    it('should return null when company does not exist', async () => {
      // Arrange
      const email = 'notfound@acme.com';
      companyRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await companyService.getCompanyByEmail(email);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when email is empty', async () => {
      // Act
      const result = await companyService.getCompanyByEmail('');

      // Assert
      expect(result).toBeNull();
      expect(companyRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getCompanyById', () => {
    it('should return company DTO when company exists', async () => {
      // Arrange
      const companyId = uuidv4();
      companyRepository.findByIdOrFail.mockResolvedValue({
        ...mockCompany,
        plan: mockPlan
      });

      // Act
      const result = await companyService.getCompanyById(companyId);

      // Assert
      expect(companyRepository.findByIdOrFail).toHaveBeenCalledWith(companyId, {
        include: [
          {
            model: expect.anything(),
            as: 'plan',
            required: false
          }
        ]
      });
      expect(result).toEqual({
        id: mockCompany.id,
        name: mockCompany.name,
        description: mockCompany.description,
        isActive: mockCompany.isActive,
        status: mockCompany.status,
        email: mockCompany.email,
        phone: mockCompany.phone,
        buildingAddress: mockCompany.buildingAddress,
        streetAddress: mockCompany.streetAddress,
        city: mockCompany.city,
        state: mockCompany.state,
        postalCode: mockCompany.postalCode,
        country: mockCompany.country,
        plan: {
          id: mockPlan.id,
          name: mockPlan.name,
          code: mockPlan.code,
          description: mockPlan.description,
          price: parseFloat(mockPlan.price) || 0.00,
          isActive: mockPlan.isActive,
          createdDate: mockPlan.createdDate,
          updatedDate: mockPlan.updatedDate,
          version: mockPlan.version
        },
        createdDate: mockCompany.createdDate,
        createdUserId: mockCompany.createdUserId,
        updatedDate: mockCompany.updatedDate,
        updatedUserId: mockCompany.updatedUserId
      });
      expect(result).not.toHaveProperty('logo'); // Logo excluded by default
      expect(result).not.toHaveProperty('planId'); // planId replaced with plan object
    });

    it('should include logo when includeLogo=true', async () => {
      // Arrange
      const companyId = uuidv4();
      const companyWithLogo = createMockCompany({
        ...mockCompany,
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        plan: mockPlan
      });
      companyRepository.findByIdOrFail.mockResolvedValue(companyWithLogo);

      // Act
      const result = await companyService.getCompanyById(companyId, { includeLogo: true });

      // Assert
      expect(result).toHaveProperty('logo');
      expect(result.logo).toBe(companyWithLogo.logo);
      expect(result).toHaveProperty('plan');
    });

    it('should exclude logo when includeLogo=false', async () => {
      // Arrange
      const companyId = uuidv4();
      const companyWithLogo = createMockCompany({
        ...mockCompany,
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        plan: mockPlan
      });
      companyRepository.findByIdOrFail.mockResolvedValue(companyWithLogo);

      // Act
      const result = await companyService.getCompanyById(companyId, { includeLogo: false });

      // Assert
      expect(result).not.toHaveProperty('logo');
      expect(result).toHaveProperty('plan');
    });

    it('should exclude logo by default (includeLogo not specified)', async () => {
      // Arrange
      const companyId = uuidv4();
      const companyWithLogo = createMockCompany({
        ...mockCompany,
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        plan: mockPlan
      });
      companyRepository.findByIdOrFail.mockResolvedValue(companyWithLogo);

      // Act
      const result = await companyService.getCompanyById(companyId);

      // Assert
      expect(result).not.toHaveProperty('logo');
      expect(result).toHaveProperty('plan');
    });

    it('should throw NotFoundError when company does not exist', async () => {
      // Arrange
      const companyId = uuidv4();
      companyRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('Company', companyId)
      );

      // Act & Assert
      await expect(
        companyService.getCompanyById(companyId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCompanyByIdIncludingDeleted', () => {
    it('should return company DTO including deleted fields', async () => {
      // Arrange
      const companyId = uuidv4();
      companyRepository.findByIdIncludingDeletedOrFail.mockResolvedValue(mockDeletedCompany);

      // Act
      const result = await companyService.getCompanyByIdIncludingDeleted(companyId);

      // Assert
      expect(companyRepository.findByIdIncludingDeletedOrFail).toHaveBeenCalledWith(companyId);
      expect(result).toEqual({
        id: mockDeletedCompany.id,
        name: mockDeletedCompany.name,
        description: mockDeletedCompany.description,
        isActive: mockDeletedCompany.isActive,
        isDeleted: mockDeletedCompany.isDeleted,
        createdDate: mockDeletedCompany.createdDate,
        createdUserId: mockDeletedCompany.createdUserId,
        updatedDate: mockDeletedCompany.updatedDate,
        updatedUserId: mockDeletedCompany.updatedUserId,
        deletedDate: mockDeletedCompany.deletedDate,
        deletedUserId: mockDeletedCompany.deletedUserId
      });
    });

    it('should throw NotFoundError when company does not exist', async () => {
      // Arrange
      const companyId = uuidv4();
      companyRepository.findByIdIncludingDeletedOrFail.mockRejectedValue(
        new NotFoundError('Company', companyId)
      );

      // Act & Assert
      await expect(
        companyService.getCompanyByIdIncludingDeleted(companyId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateCompany', () => {
    it('should update company successfully when name is unique', async () => {
      // Arrange
      const companyId = uuidv4();
      const updateData = {
        name: 'Updated Company',
        description: 'Updated description'
      };
      
      // Mock the reload with Plan association after update
      companyRepository.findByIdOrFail
        .mockResolvedValueOnce(mockCompany) // First call for validation
        .mockResolvedValueOnce({ ...mockUpdatedCompany, plan: mockPlan }); // Second call after update
      companyRepository.findOne.mockResolvedValue(null);
      companyRepository.update.mockResolvedValue(mockUpdatedCompany);

      // Act
      const result = await companyService.updateCompany(companyId, updateData, mockContext);

      // Assert
      expect(companyRepository.findByIdOrFail).toHaveBeenCalledTimes(2);
      expect(companyRepository.findOne).toHaveBeenCalledWith({ name: 'Updated Company' });
      expect(companyRepository.update).toHaveBeenCalledWith(
        companyId,
        {
          name: 'Updated Company',
          description: 'Updated description'
        },
        mockContext
      );
      
      expect(result).toEqual({
        id: mockUpdatedCompany.id,
        name: mockUpdatedCompany.name,
        description: mockUpdatedCompany.description,
        isActive: mockUpdatedCompany.isActive,
        status: mockUpdatedCompany.status,
        email: mockUpdatedCompany.email,
        phone: mockUpdatedCompany.phone,
        buildingAddress: mockUpdatedCompany.buildingAddress,
        streetAddress: mockUpdatedCompany.streetAddress,
        city: mockUpdatedCompany.city,
        state: mockUpdatedCompany.state,
        postalCode: mockUpdatedCompany.postalCode,
        country: mockUpdatedCompany.country,
        plan: {
          id: mockPlan.id,
          name: mockPlan.name,
          code: mockPlan.code,
          description: mockPlan.description,
          price: parseFloat(mockPlan.price) || 0.00,
          isActive: mockPlan.isActive,
          createdDate: mockPlan.createdDate,
          updatedDate: mockPlan.updatedDate,
          version: mockPlan.version
        },
        createdDate: mockUpdatedCompany.createdDate,
        createdUserId: mockUpdatedCompany.createdUserId,
        updatedDate: mockUpdatedCompany.updatedDate,
        updatedUserId: mockUpdatedCompany.updatedUserId
      });
      expect(result).not.toHaveProperty('logo'); // Logo excluded
      expect(result).not.toHaveProperty('planId'); // planId replaced with plan object
    });

    it('should throw NotFoundError when company does not exist', async () => {
      // Arrange
      const companyId = uuidv4();
      companyRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('Company', companyId)
      );

      // Act & Assert
      await expect(
        companyService.updateCompany(companyId, { name: 'New Name' }, mockContext)
      ).rejects.toThrow(NotFoundError);
      
      expect(companyRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new name already exists', async () => {
      // Arrange
      const companyId = uuidv4();
      const existingCompany = { ...mockCompany, id: uuidv4() };
      
      companyRepository.findByIdOrFail.mockResolvedValue(mockCompany);
      companyRepository.findOne.mockResolvedValue(existingCompany);

      // Act & Assert
      await expect(
        companyService.updateCompany(companyId, { name: 'Existing Name' }, mockContext)
      ).rejects.toThrow(ConflictError);
      
      expect(companyRepository.update).not.toHaveBeenCalled();
    });

    it('should not check uniqueness when name is not changed', async () => {
      // Arrange
      const companyId = uuidv4();
      const updateData = { description: 'New description' };
      
      companyRepository.findByIdOrFail.mockResolvedValue(mockCompany);
      companyRepository.update.mockResolvedValue(mockUpdatedCompany);

      // Act
      await companyService.updateCompany(companyId, updateData, mockContext);

      // Assert
      expect(companyRepository.findOne).not.toHaveBeenCalled();
      expect(companyRepository.update).toHaveBeenCalled();
    });

    it('should update company with new fields', async () => {
      // Arrange
      const companyId = uuidv4();
      const updateData = {
        email: 'newemail@example.com',
        phone: '+1 555-123-4567',
        buildingAddress: 'Suite 200',
        streetAddress: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'United States',
        status: 'ACTIVE'
      };
      
      companyRepository.findByIdOrFail.mockResolvedValue(mockCompany);
      companyRepository.update.mockResolvedValue(mockUpdatedCompany);

      // Act
      await companyService.updateCompany(companyId, updateData, mockContext);

      // Assert
      expect(companyRepository.update).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          email: 'newemail@example.com',
          phone: '+1 555-123-4567',
          buildingAddress: 'Suite 200',
          streetAddress: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'United States',
          status: 'ACTIVE'
        }),
        mockContext
      );
    });

    it('should throw ConflictError for invalid status', async () => {
      // Arrange
      const companyId = uuidv4();
      const updateData = { status: 'INVALID_STATUS' };
      
      companyRepository.findByIdOrFail.mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(
        companyService.updateCompany(companyId, updateData, mockContext)
      ).rejects.toThrow(ConflictError);
      
      expect(companyRepository.update).not.toHaveBeenCalled();
    });

    it('should update status to valid enum values', async () => {
      // Arrange
      const companyId = uuidv4();
      
      companyRepository.findByIdOrFail.mockResolvedValue(mockCompany);
      companyRepository.update.mockResolvedValue(mockUpdatedCompany);

      // Act & Assert - test each valid status
      for (const status of COMPANY_STATUSES) {
        jest.clearAllMocks();
        const updateData = { status };
        
        await companyService.updateCompany(companyId, updateData, mockContext);
        
        expect(companyRepository.update).toHaveBeenCalledWith(
          companyId,
          expect.objectContaining({ status }),
          mockContext
        );
      }
    });
  });

  describe('listCompanies', () => {
    it('should return paginated companies with search', async () => {
      // Arrange
      const companies = [
        { ...mockCompany, plan: mockPlan },
        { ...mockCompany, id: uuidv4(), name: 'Beta Corp', plan: mockPlan }
      ];
      const mockSearchResult = {
        rows: companies,
        count: 2
      };
      
      companyRepository.searchCompanies.mockResolvedValue(mockSearchResult);

      // Act
      const result = await companyService.listCompanies(
        { search: 'acme' },
        { limit: 10, offset: 0 },
        [['name', 'ASC']]
      );

      // Assert
      expect(companyRepository.searchCompanies).toHaveBeenCalledWith(
        'acme',
        { limit: 10, offset: 0 },
        [['name', 'ASC']],
        {
          include: [
            {
              model: Plan,
              as: 'plan',
              required: false
            }
          ]
        }
      );
      
      expect(result.companies).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.companies[0]).toEqual({
        id: mockCompany.id,
        name: mockCompany.name,
        description: mockCompany.description,
        isActive: mockCompany.isActive,
        status: mockCompany.status,
        email: mockCompany.email,
        phone: mockCompany.phone,
        buildingAddress: mockCompany.buildingAddress,
        streetAddress: mockCompany.streetAddress,
        city: mockCompany.city,
        state: mockCompany.state,
        postalCode: mockCompany.postalCode,
        country: mockCompany.country,
        plan: {
          id: mockPlan.id,
          name: mockPlan.name,
          code: mockPlan.code,
          description: mockPlan.description,
          price: parseFloat(mockPlan.price) || 0.00,
          isActive: mockPlan.isActive,
          createdDate: mockPlan.createdDate,
          updatedDate: mockPlan.updatedDate,
          version: mockPlan.version
        },
        createdDate: mockCompany.createdDate
      });
      expect(result.companies[0]).not.toHaveProperty('logo'); // Logo excluded from list
      expect(result.companies[0]).not.toHaveProperty('planId'); // planId replaced with plan object
    });

    it('should filter by isActive when search is provided', async () => {
      // Arrange
      const companies = [
        { ...mockCompany, plan: mockPlan },
        { ...mockCompany, id: uuidv4(), name: 'Beta Corp', isActive: false, plan: mockPlan }
      ];
      const mockSearchResult = {
        rows: companies,
        count: 2
      };
      
      companyRepository.searchCompanies.mockResolvedValue(mockSearchResult);

      // Act
      const result = await companyService.listCompanies(
        { search: 'corp', isActive: true },
        { limit: 10, offset: 0 },
        []
      );

      // Assert
      expect(result.companies).toHaveLength(1);
      expect(result.companies[0].isActive).toBe(true);
      expect(result.total).toBe(1);
    });

    it('should use standard findAndCountAll when search is not provided', async () => {
      // Arrange
      const mockResult = { rows: [{ ...mockCompany, plan: mockPlan }], count: 1 };
      companyRepository.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await companyService.listCompanies(
        { isActive: true },
        { limit: 10, offset: 0 },
        [['name', 'ASC']]
      );

      // Assert
      expect(companyRepository.findAndCountAll).toHaveBeenCalledWith(
        { isActive: true },
        {
          limit: 10,
          offset: 0,
          order: [['name', 'ASC']],
          include: [
            {
              model: Plan,
              as: 'plan',
              required: false
            }
          ]
        }
      );
      
      expect(result.companies).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should use default sort when not provided', async () => {
      // Arrange
      const mockResult = { rows: [{ ...mockCompany, plan: mockPlan }], count: 1 };
      companyRepository.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await companyService.listCompanies({}, {}, []);

      // Assert
      expect(companyRepository.findAndCountAll).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          order: [['name', 'ASC']]
        })
      );
    });
  });

  describe('deleteCompany', () => {
    it('should delete company successfully', async () => {
      // Arrange
      const companyId = uuidv4();
      companyRepository.delete.mockResolvedValue(undefined);

      // Act
      await companyService.deleteCompany(companyId, mockContext);

      // Assert
      expect(companyRepository.delete).toHaveBeenCalledWith(companyId, mockContext);
    });

    it('should throw NotFoundError when company does not exist', async () => {
      // Arrange
      const companyId = uuidv4();
      companyRepository.delete.mockRejectedValue(
        new NotFoundError('Company', companyId)
      );

      // Act & Assert
      await expect(
        companyService.deleteCompany(companyId, mockContext)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('restoreCompany', () => {
    it('should restore company successfully', async () => {
      // Arrange
      const companyId = uuidv4();
      const restoredCompany = { ...mockDeletedCompany, isDeleted: false };
      companyRepository.restore.mockResolvedValue(restoredCompany);

      // Act
      const result = await companyService.restoreCompany(companyId, mockContext);

      // Assert
      expect(companyRepository.restore).toHaveBeenCalledWith(companyId, mockContext);
      expect(result).toEqual({
        id: restoredCompany.id,
        name: restoredCompany.name,
        description: restoredCompany.description,
        isActive: restoredCompany.isActive,
        createdDate: restoredCompany.createdDate,
        updatedDate: restoredCompany.updatedDate
      });
    });

    it('should throw NotFoundError when company does not exist', async () => {
      // Arrange
      const companyId = uuidv4();
      companyRepository.restore.mockRejectedValue(
        new NotFoundError('Company', companyId)
      );

      // Act & Assert
      await expect(
        companyService.restoreCompany(companyId, mockContext)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCompanyUsers', () => {
    it('should return company users with DTO transformation', async () => {
      // Arrange
      const companyId = mockCompany.id;
      const testUser = createMockUser({
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe'
      });
      const testRole = createMockRole({
        name: 'Admin',
        code: 'ADMIN'
      });
      const mockCompanyUser = createMockCompanyUser({
        userId: testUser.id,
        companyId: companyId,
        companyRoleId: testRole.id,
        user: testUser,
        role: testRole
      });
      
      companyUserRepository.findCompanyUsers.mockResolvedValue([mockCompanyUser]);

      // Act
      const result = await companyService.getCompanyUsers(
        companyId,
        { isActive: true },
        { limit: 10, offset: 0 }
      );

      // Assert
      expect(companyUserRepository.findCompanyUsers).toHaveBeenCalledWith(companyId, {
        limit: 10,
        offset: 0
      });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockCompanyUser.id,
        userId: mockCompanyUser.userId,
        companyId: mockCompanyUser.companyId,
        roleId: mockCompanyUser.companyRoleId,
        isActive: mockCompanyUser.isActive,
        user: {
          id: testUser.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        role: {
          id: testRole.id,
          name: testRole.name,
          code: testRole.code
        }
      });
    });

    it('should filter by isActive when provided', async () => {
      // Arrange
      const companyId = mockCompany.id;
      const activeUser = createMockCompanyUser({
        companyId: companyId,
        isActive: true,
        user: createMockUser({ email: 'active@example.com' }),
        role: createMockRole({ name: 'Admin' })
      });
      const inactiveUser = createMockCompanyUser({
        companyId: companyId,
        isActive: false,
        user: createMockUser({ email: 'inactive@example.com' }),
        role: createMockRole({ name: 'Admin' })
      });
      
      companyUserRepository.findCompanyUsers.mockResolvedValue([activeUser, inactiveUser]);

      // Act
      const result = await companyService.getCompanyUsers(
        companyId,
        { isActive: true },
        {}
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it('should handle paginated results', async () => {
      // Arrange
      const companyId = mockCompany.id;
      const testUser = createMockUser({ email: 'user@example.com' });
      const testRole = createMockRole({ name: 'Admin' });
      const mockCompanyUser = createMockCompanyUser({
        companyId: companyId,
        user: testUser,
        role: testRole
      });
      
      // When pagination is provided, repository returns {rows, count}, but service expects array
      // So we mock it to return the array directly (rows from the paginated result)
      companyUserRepository.findCompanyUsers.mockResolvedValue([mockCompanyUser]);

      // Act
      const result = await companyService.getCompanyUsers(
        companyId,
        {},
        { limit: 1, offset: 0 }
      );

      // Assert
      expect(companyUserRepository.findCompanyUsers).toHaveBeenCalledWith(companyId, {
        limit: 1,
        offset: 0
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockCompanyUser.id,
        userId: mockCompanyUser.userId,
        companyId: mockCompanyUser.companyId,
        roleId: mockCompanyUser.companyRoleId,
        isActive: mockCompanyUser.isActive,
        user: {
          id: testUser.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        },
        role: {
          id: testRole.id,
          name: testRole.name,
          code: testRole.code
        }
      });
    });
  });
});

