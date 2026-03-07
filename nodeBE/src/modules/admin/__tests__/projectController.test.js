/**
 * @author Bhavesh Venugopal
 * Project Controller Tests
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
const mockValidateRequired = jest.fn();
const mockValidateString = jest.fn();

jest.unstable_mockModule('../../../utils/validators.js', () => ({
  validateUUID: mockValidateUUID,
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

// Mock projectService
const mockCreateProject = jest.fn();
const mockGetProjectById = jest.fn();
const mockUpdateProject = jest.fn();
const mockListProjects = jest.fn();
const mockDeleteProject = jest.fn();

jest.unstable_mockModule('../../../services/projectService.js', () => ({
  createProject: mockCreateProject,
  getProjectById: mockGetProjectById,
  updateProject: mockUpdateProject,
  listProjects: mockListProjects,
  deleteProject: mockDeleteProject
}));

// Mock projectUserService
const mockAssignUserToProject = jest.fn();
const mockRemoveUserFromProject = jest.fn();
const mockGetProjectUsers = jest.fn();

jest.unstable_mockModule('../../../services/projectUserService.js', () => ({
  assignUserToProject: mockAssignUserToProject,
  removeUserFromProject: mockRemoveUserFromProject,
  getProjectUsers: mockGetProjectUsers
}));

let projectController;

beforeAll(async () => {
  projectController = await import('../projectController.js');
});

describe('Project Controller', () => {
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

  describe('createProject', () => {
    it('should create project successfully', async () => {
      req.body = { clientId: uuidv4(), name: 'Test Project' };
      const mockProject = { id: uuidv4(), name: 'Test Project' };
      
      mockCreateProject.mockResolvedValue(mockProject);

      await projectController.createProject(req, res);

      expect(mockCreateProject).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockSuccessResponse).toHaveBeenCalled();
    });

    it('should throw ForbiddenError if not admin', async () => {
      mockIsCompanyAdmin.mockReturnValue(false);

      await expect(projectController.createProject(req, res)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getProjectById', () => {
    it('should return project by id for admin', async () => {
      req.params = { id: uuidv4() };
      const mockProject = { id: req.params.id, name: 'Test Project' };
      
      mockGetProjectById.mockResolvedValue(mockProject);

      await projectController.getProjectById(req, res);

      expect(mockGetProjectById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSuccessResponse).toHaveBeenCalled();
    });

    it('should allow regular user if assigned to project', async () => {
      mockIsCompanyAdmin.mockReturnValue(false);
      req.params = { id: uuidv4() };
      
      mockGetProjectById.mockResolvedValue({ id: req.params.id });
      mockGetProjectUsers.mockResolvedValue({ users: [{ userId: req.user.id }] });

      await projectController.getProjectById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should deny regular user if not assigned', async () => {
      mockIsCompanyAdmin.mockReturnValue(false);
      req.params = { id: uuidv4() };
      
      mockGetProjectById.mockResolvedValue({ id: req.params.id });
      mockGetProjectUsers.mockResolvedValue({ users: [{ userId: uuidv4() }] });

      await expect(projectController.getProjectById(req, res)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('listProjects', () => {
    it('should return list of projects', async () => {
      mockBuildPaginationQuery.mockReturnValue({ page: 1, limit: 10, offset: 0 });
      mockBuildSortQuery.mockReturnValue([['name', 'ASC']]);
      
      mockListProjects.mockResolvedValue({ projects: [], total: 0 });

      await projectController.listProjects(req, res);

      expect(mockListProjects).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should apply assignedUserId filter if not admin', async () => {
      mockIsCompanyAdmin.mockReturnValue(false);
      mockBuildPaginationQuery.mockReturnValue({ page: 1, limit: 10, offset: 0 });
      mockBuildSortQuery.mockReturnValue([['name', 'ASC']]);
      
      mockListProjects.mockResolvedValue({ projects: [], total: 0 });

      await projectController.listProjects(req, res);

      expect(mockListProjects).toHaveBeenCalledWith(
        expect.objectContaining({ assignedUserId: req.user.id }),
        expect.any(Object),
        expect.any(Array)
      );
    });
  });

  describe('assignUser', () => {
    it('should assign user successfully', async () => {
      req.params = { projectId: uuidv4() };
      req.body = { userId: uuidv4() };
      
      mockAssignUserToProject.mockResolvedValue({});

      await projectController.assignUser(req, res);

      expect(mockAssignUserToProject).toHaveBeenCalledWith(req.params.projectId, req.body.userId, { userId: req.user.id });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});
