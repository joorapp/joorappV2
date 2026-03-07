/**
 * @author Bhavesh Venugopal
 * Client Controller Tests
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ForbiddenError } from '../../../utils/errors.js';

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockCreateModuleLogger = jest.fn(() => mockLogger);
const mockLogPerformance = jest.fn();
const mockLogBusiness = jest.fn();

jest.unstable_mockModule('../../../utils/logger.js', () => ({
  createModuleLogger: mockCreateModuleLogger,
  logPerformance: mockLogPerformance,
  logBusiness: mockLogBusiness
}));

// Mock responseHelpers
const mockSuccessResponse = jest.fn();
const mockPaginatedResponse = jest.fn();

jest.unstable_mockModule('../../../utils/responseHelpers.js', () => ({
  successResponse: mockSuccessResponse,
  paginatedResponse: mockPaginatedResponse
}));

// Mock validators
const mockValidateUUID = jest.fn();
const mockValidateEmail = jest.fn();
const mockValidateRequired = jest.fn();
const mockValidateString = jest.fn();

jest.unstable_mockModule('../../../utils/validators.js', () => ({
  validateUUID: mockValidateUUID,
  validateEmail: mockValidateEmail,
  validateRequired: mockValidateRequired,
  validateString: mockValidateString
}));

// Mock businessHelpers
const mockBuildPaginationQuery = jest.fn();
const mockBuildSortQuery = jest.fn();

jest.unstable_mockModule('../../../utils/businessHelpers.js', () => ({
  buildPaginationQuery: mockBuildPaginationQuery,
  buildSortQuery: mockBuildSortQuery
}));

// Mock keycloakRoles
const mockIsCompanyAdmin = jest.fn();

jest.unstable_mockModule('../../../constants/keycloakRoles.js', () => ({
  isCompanyAdmin: mockIsCompanyAdmin,
  KEYCLOAK_GLOBAL_ROLE_VALUES: ['COMPANY_ADMIN', 'COMPANY_USER']
}));

// Mock service
const mockCreateClient = jest.fn();
const mockGetClientById = jest.fn();
const mockUpdateClient = jest.fn();
const mockListClients = jest.fn();
const mockDeleteClient = jest.fn();

jest.unstable_mockModule('../../../services/clientService.js', () => ({
  createClient: mockCreateClient,
  getClientById: mockGetClientById,
  updateClient: mockUpdateClient,
  listClients: mockListClients,
  deleteClient: mockDeleteClient
}));

let clientController;

beforeAll(async () => {
  clientController = await import('../clientController.js');
});

describe('Client Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      id: 'test-request-id',
      user: { id: uuidv4(), keycloakGlobalRole: 'COMPANY_ADMIN' },
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockSuccessResponse.mockReturnValue({ success: true });
    mockPaginatedResponse.mockReturnValue({ success: true });
    mockIsCompanyAdmin.mockReturnValue(true);
  });

  describe('createClient', () => {
    it('should create client successfully', async () => {
      req.body = { name: 'Test Client', email: 'test@example.com' };
      const mockClient = { id: uuidv4(), name: 'Test Client' };
      
      mockCreateClient.mockResolvedValue(mockClient);

      await clientController.createClient(req, res);

      expect(mockCreateClient).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockSuccessResponse).toHaveBeenCalled();
    });

    it('should throw ForbiddenError if not admin', async () => {
      mockIsCompanyAdmin.mockReturnValue(false);

      await expect(clientController.createClient(req, res)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getClientById', () => {
    it('should return client by id', async () => {
      req.params = { id: uuidv4() };
      const mockClient = { id: req.params.id, name: 'Test Client' };
      
      mockGetClientById.mockResolvedValue(mockClient);

      await clientController.getClientById(req, res);

      expect(mockGetClientById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSuccessResponse).toHaveBeenCalled();
    });
  });

  describe('updateClient', () => {
    it('should update client successfully', async () => {
      req.params = { id: uuidv4() };
      req.body = { name: 'Updated Client' };
      const mockClient = { id: req.params.id, name: 'Updated Client' };
      
      mockUpdateClient.mockResolvedValue(mockClient);

      await clientController.updateClient(req, res);

      expect(mockUpdateClient).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSuccessResponse).toHaveBeenCalled();
    });
  });

  describe('listClients', () => {
    it('should return paginated list of clients', async () => {
      mockBuildPaginationQuery.mockReturnValue({ page: 1, limit: 10, offset: 0 });
      mockBuildSortQuery.mockReturnValue([['name', 'ASC']]);
      
      const mockResult = { clients: [], total: 0 };
      mockListClients.mockResolvedValue(mockResult);

      await clientController.listClients(req, res);

      expect(mockListClients).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockPaginatedResponse).toHaveBeenCalled();
    });
  });

  describe('deleteClient', () => {
    it('should delete client successfully', async () => {
      req.params = { id: uuidv4() };
      
      mockDeleteClient.mockResolvedValue();

      await clientController.deleteClient(req, res);

      expect(mockDeleteClient).toHaveBeenCalledWith(req.params.id, { userId: req.user.id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSuccessResponse).toHaveBeenCalled();
    });
  });
});
