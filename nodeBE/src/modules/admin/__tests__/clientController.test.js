/**
 * @author Bhavesh Venugopal
 * Client Controller Tests
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ForbiddenError, BadRequestError } from '../../../utils/errors.js';

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
const mockValidateBoolean = jest.fn();

jest.unstable_mockModule('../../../utils/validators.js', () => ({
  validateUUID: mockValidateUUID,
  validateEmail: mockValidateEmail,
  validateRequired: mockValidateRequired,
  validateString: mockValidateString,
  validateBoolean: mockValidateBoolean
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
const mockListAllClientsForCompany = jest.fn();
const mockSetClientActiveStatusForCompany = jest.fn();

jest.unstable_mockModule('../../../services/clientService.js', () => ({
  createClient: mockCreateClient,
  getClientById: mockGetClientById,
  updateClient: mockUpdateClient,
  listClients: mockListClients,
  deleteClient: mockDeleteClient,
  listAllClientsForCompany: mockListAllClientsForCompany,
  setClientActiveStatusForCompany: mockSetClientActiveStatusForCompany
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
      company: { id: uuidv4() },
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

      expect(mockCreateClient).toHaveBeenCalledWith(
        { name: 'Test Client', email: 'test@example.com', phone: undefined, isActive: undefined, clientMetadata: undefined },
        { userId: req.user.id, companyId: req.company.id }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockSuccessResponse).toHaveBeenCalled();
    });

    it('should throw BadRequestError when company context is missing', async () => {
      req.company = undefined;
      req.body = { name: 'Test Client' };
      await expect(clientController.createClient(req, res)).rejects.toThrow(BadRequestError);
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

  describe('listAllClients', () => {
    it('should omit isActive filter when query empty or absent', async () => {
      req.query = {};
      mockListAllClientsForCompany.mockResolvedValue([]);

      await clientController.listAllClients(req, res);

      expect(mockListAllClientsForCompany).toHaveBeenCalledWith(req.company.id, {
        search: undefined,
        isActive: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSuccessResponse).toHaveBeenCalled();
    });

    it('should treat empty isActive= as omitted', async () => {
      req.query = { isActive: '' };
      mockListAllClientsForCompany.mockResolvedValue([]);

      await clientController.listAllClients(req, res);

      expect(mockListAllClientsForCompany).toHaveBeenCalledWith(req.company.id, {
        search: undefined,
        isActive: undefined
      });
    });

    it('should pass isActive true/false when query set', async () => {
      req.query = { isActive: 'false', search: '  acme  ' };
      mockValidateString.mockImplementation(() => {});
      mockListAllClientsForCompany.mockResolvedValue([]);

      await clientController.listAllClients(req, res);

      expect(mockListAllClientsForCompany).toHaveBeenCalledWith(req.company.id, {
        search: 'acme',
        isActive: false
      });
    });

    it('should throw BadRequestError without company context', async () => {
      req.company = undefined;
      await expect(clientController.listAllClients(req, res)).rejects.toThrow(BadRequestError);
    });
  });

  describe('patchClientStatus', () => {
    it('should update client active status for current company', async () => {
      const clientId = uuidv4();
      req.params = { id: clientId };
      req.body = { isActive: false };
      mockValidateBoolean.mockReturnValue(false);
      const updated = { id: clientId, isActive: false };
      mockSetClientActiveStatusForCompany.mockResolvedValue(updated);

      await clientController.patchClientStatus(req, res);

      expect(mockSetClientActiveStatusForCompany).toHaveBeenCalledWith(
        clientId,
        false,
        { userId: req.user.id },
        req.company.id
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSuccessResponse).toHaveBeenCalled();
      expect(mockLogBusiness).toHaveBeenCalledWith(
        'Client status updated',
        expect.objectContaining({ clientId, isActive: false, userId: req.user.id })
      );
    });

    it('should throw BadRequestError without company context', async () => {
      req.company = undefined;
      req.params = { id: uuidv4() };
      req.body = { isActive: true };
      await expect(clientController.patchClientStatus(req, res)).rejects.toThrow(BadRequestError);
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
