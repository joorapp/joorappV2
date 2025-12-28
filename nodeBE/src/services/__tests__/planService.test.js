/**
 * @author Bhavesh Venugopal
 * Plan Service Tests
 * Tests for planService business logic layer
 * Uses mocked repositories to test business logic, error handling, and DTO transformation
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ConflictError, NotFoundError, BadRequestError } from '../../utils/errors.js';
import { createMockPlan } from '../../../__tests__/mocks/models/PlanMock.js';

// Mock the repository using unstable_mockModule for ES modules
jest.unstable_mockModule('../../repositories/planRepository.js', () => ({
  planRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdOrFail: jest.fn(),
    findPlanByCode: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

// Import after mocking (must use await import for ES modules)
let planService;
let planRepository;

beforeAll(async () => {
  planService = await import('../planService.js');
  const planRepoModule = await import('../../repositories/planRepository.js');
  planRepository = planRepoModule.planRepository;
});

describe('Plan Service', () => {
  let mockPlan;
  let mockCreatedPlan;
  let mockUpdatedPlan;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup test data using shared mocks
    mockPlan = createMockPlan({
      name: 'Premium Plan',
      code: 'PREMIUM',
      description: 'Premium subscription plan',
      price: 99.99,
      isActive: true
    });

    mockCreatedPlan = createMockPlan({
      name: 'New Plan',
      code: 'NEW',
      price: 49.99
    });

    mockUpdatedPlan = createMockPlan({
      ...mockPlan,
      name: 'Updated Premium Plan',
      price: 149.99,
      version: 2
    });
  });

  describe('createPlan', () => {
    it('should create plan successfully when name and code are unique', async () => {
      // Arrange
      const planData = {
        name: 'New Plan',
        code: 'NEW',
        description: 'New plan description',
        price: 49.99,
        isActive: true
      };
      
      planRepository.findOne.mockResolvedValue(null); // Name and code checks pass
      planRepository.create.mockResolvedValue(mockCreatedPlan);

      // Act
      const result = await planService.createPlan(planData);

      // Assert
      expect(planRepository.findOne).toHaveBeenCalledTimes(2); // Check name, then code
      expect(planRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Plan',
          code: 'NEW',
          description: 'New plan description',
          price: 49.99,
          isActive: true
        })
      );
      expect(result).toEqual({
        id: mockCreatedPlan.id,
        name: mockCreatedPlan.name,
        code: mockCreatedPlan.code,
        description: mockCreatedPlan.description,
        isActive: mockCreatedPlan.isActive,
        price: parseFloat(mockCreatedPlan.price),
        createdDate: mockCreatedPlan.createdDate,
        updatedDate: mockCreatedPlan.updatedDate,
        version: mockCreatedPlan.version
      });
    });

    it('should use default price (0.00) when not provided', async () => {
      // Arrange
      const planData = {
        name: 'Free Plan',
        code: 'FREE'
      };
      
      planRepository.findOne.mockResolvedValue(null);
      planRepository.create.mockResolvedValue(mockCreatedPlan);

      // Act
      await planService.createPlan(planData);

      // Assert
      expect(planRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ price: 0.00 })
      );
    });

    it('should throw ConflictError when plan name already exists', async () => {
      // Arrange
      const planData = {
        name: 'Existing Plan',
        code: 'NEW_CODE',
        price: 10.00
      };
      
      planRepository.findOne.mockResolvedValueOnce(mockPlan); // Name exists

      // Act & Assert
      await expect(
        planService.createPlan(planData)
      ).rejects.toThrow(ConflictError);
      
      expect(planRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when plan code already exists', async () => {
      // Arrange
      const planData = {
        name: 'New Name',
        code: 'PREMIUM', // Existing code
        price: 10.00
      };
      
      planRepository.findOne
        .mockResolvedValueOnce(null) // Name check passes
        .mockResolvedValueOnce(mockPlan); // Code exists

      // Act & Assert
      await expect(
        planService.createPlan(planData)
      ).rejects.toThrow(ConflictError);
      
      expect(planRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getPlanById', () => {
    it('should return plan DTO when plan exists', async () => {
      // Arrange
      const planId = uuidv4();
      planRepository.findByIdOrFail.mockResolvedValue(mockPlan);

      // Act
      const result = await planService.getPlanById(planId);

      // Assert
      expect(planRepository.findByIdOrFail).toHaveBeenCalledWith(planId);
      expect(result).toEqual({
        id: mockPlan.id,
        name: mockPlan.name,
        code: mockPlan.code,
        description: mockPlan.description,
        isActive: mockPlan.isActive,
        price: parseFloat(mockPlan.price),
        createdDate: mockPlan.createdDate,
        updatedDate: mockPlan.updatedDate,
        version: mockPlan.version
      });
    });

    it('should throw NotFoundError when plan does not exist', async () => {
      // Arrange
      const planId = uuidv4();
      planRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('Plan', planId)
      );

      // Act & Assert
      await expect(
        planService.getPlanById(planId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPlanByCode', () => {
    it('should return plan DTO when plan exists', async () => {
      // Arrange
      planRepository.findPlanByCode.mockResolvedValue(mockPlan);

      // Act
      const result = await planService.getPlanByCode('PREMIUM');

      // Assert
      expect(planRepository.findPlanByCode).toHaveBeenCalledWith('PREMIUM');
      expect(result).toEqual({
        id: mockPlan.id,
        name: mockPlan.name,
        code: mockPlan.code,
        description: mockPlan.description,
        isActive: mockPlan.isActive,
        price: parseFloat(mockPlan.price),
        createdDate: mockPlan.createdDate,
        updatedDate: mockPlan.updatedDate,
        version: mockPlan.version
      });
    });

    it('should return null when plan code does not exist', async () => {
      // Arrange
      planRepository.findPlanByCode.mockResolvedValue(null);

      // Act
      const result = await planService.getPlanByCode('NONEXISTENT');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('listPlans', () => {
    it('should return paginated plans with price', async () => {
      // Arrange
      const plans = [
        createMockPlan({ name: 'Plan 1', code: 'PLAN1', price: 10.00 }),
        createMockPlan({ name: 'Plan 2', code: 'PLAN2', price: 20.00 })
      ];
      
      planRepository.findAndCountAll.mockResolvedValue({
        rows: plans,
        count: 2
      });

      // Act
      const result = await planService.listPlans(
        {},
        { page: 1, limit: 10, offset: 0 },
        [['name', 'ASC']]
      );

      // Assert
      expect(planRepository.findAndCountAll).toHaveBeenCalled();
      expect(result.plans).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.plans[0].price).toBe(10.00);
      expect(result.plans[1].price).toBe(20.00);
    });

    it('should filter by isActive when provided', async () => {
      // Arrange
      const activePlan = createMockPlan({ isActive: true, price: 10.00 });
      planRepository.findAndCountAll.mockResolvedValue({
        rows: [activePlan],
        count: 1
      });

      // Act
      const result = await planService.listPlans(
        { isActive: true },
        { page: 1, limit: 10, offset: 0 },
        []
      );

      // Assert
      expect(result.plans).toHaveLength(1);
      expect(result.plans[0].isActive).toBe(true);
    });
  });

  describe('updatePlan', () => {
    it('should update plan successfully when name and code are unique', async () => {
      // Arrange
      const planId = uuidv4();
      const updateData = {
        name: 'Updated Premium Plan',
        price: 149.99
      };
      
      planRepository.findByIdOrFail.mockResolvedValue(mockPlan);
      planRepository.findOne.mockResolvedValue(null); // Name check passes
      planRepository.update.mockResolvedValue(mockUpdatedPlan);

      // Act
      const result = await planService.updatePlan(planId, updateData);

      // Assert
      expect(planRepository.update).toHaveBeenCalledWith(
        planId,
        expect.objectContaining({
          name: 'Updated Premium Plan',
          price: 149.99
        })
      );
      expect(result.price).toBe(149.99);
    });

    it('should throw ConflictError when new name already exists', async () => {
      // Arrange
      const planId = uuidv4();
      const existingPlan = createMockPlan({ name: 'Existing Plan' });
      const updateData = { name: 'Existing Plan' };
      
      planRepository.findByIdOrFail.mockResolvedValue(mockPlan);
      planRepository.findOne.mockResolvedValue(existingPlan); // Name exists

      // Act & Assert
      await expect(
        planService.updatePlan(planId, updateData)
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError when new code already exists', async () => {
      // Arrange
      const planId = uuidv4();
      const existingPlan = createMockPlan({ code: 'EXISTING' });
      const updateData = { code: 'EXISTING' };
      
      planRepository.findByIdOrFail.mockResolvedValue(mockPlan);
      planRepository.findOne.mockResolvedValue(existingPlan); // Code exists

      // Act & Assert
      await expect(
        planService.updatePlan(planId, updateData)
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('deletePlan', () => {
    it('should delete plan successfully', async () => {
      // Arrange
      const planId = uuidv4();
      const planToDelete = createMockPlan({ code: 'DELETABLE', price: 10.00 });
      planRepository.findByIdOrFail.mockResolvedValue(planToDelete);
      planRepository.delete.mockResolvedValue(undefined);

      // Act
      await planService.deletePlan(planId);

      // Assert
      expect(planRepository.delete).toHaveBeenCalledWith(planId, {});
    });

    it('should throw BadRequestError when trying to delete BASIC plan', async () => {
      // Arrange
      const planId = uuidv4();
      const basicPlan = createMockPlan({ code: 'BASIC', price: 0.00 });
      planRepository.findByIdOrFail.mockResolvedValue(basicPlan);

      // Act & Assert
      await expect(
        planService.deletePlan(planId)
      ).rejects.toThrow(BadRequestError);
      
      expect(planRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getBasicPlan', () => {
    it('should return BASIC plan when it exists', async () => {
      // Arrange
      const basicPlan = createMockPlan({
        name: 'Basic',
        code: 'BASIC',
        price: 0.00
      });
      planRepository.findPlanByCode.mockResolvedValue(basicPlan);

      // Act
      const result = await planService.getBasicPlan();

      // Assert
      expect(planRepository.findPlanByCode).toHaveBeenCalledWith('BASIC');
      expect(result).toEqual({
        id: basicPlan.id,
        name: basicPlan.name,
        code: basicPlan.code,
        description: basicPlan.description,
        isActive: basicPlan.isActive,
        price: 0.00,
        version: basicPlan.version
      });
    });

    it('should throw NotFoundError when BASIC plan does not exist', async () => {
      // Arrange
      planRepository.findPlanByCode.mockResolvedValue(null);

      // Act & Assert
      await expect(
        planService.getBasicPlan()
      ).rejects.toThrow(NotFoundError);
    });
  });
});

