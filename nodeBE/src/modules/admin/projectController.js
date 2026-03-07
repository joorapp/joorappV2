/**
 * @author Bhavesh Venugopal
 * Project Controller
 * Handles project management and assignments
 */

import { createModuleLogger, logBusiness, logPerformance } from '../../utils/logger.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import { validateUUID, validateRequired, validateString } from '../../utils/validators.js';
import { buildPaginationQuery, buildSortQuery } from '../../utils/businessHelpers.js';
import { isCompanyAdmin } from '../../constants/keycloakRoles.js';
import { ForbiddenError } from '../../utils/errors.js';
import * as projectService from '../../services/projectService.js';
import * as projectUserService from '../../services/projectUserService.js';

const logger = createModuleLogger('projectController');

/**
 * Check if user has permission to manage projects
 */
const checkAdminPermission = (req) => {
  if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Admin access required to manage projects', { requestId: req.id, userId: req.user?.id });
  }
};

export const createProject = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkAdminPermission(req);

    const { clientId, name, description, status, startDate, endDate, projectMetadata } = req.body;

    validateRequired({ clientId, name }, req.id);
    validateUUID(clientId, 'clientId', req.id);
    validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);

    const project = await projectService.createProject({
      clientId,
      name,
      description,
      status,
      startDate,
      endDate,
      projectMetadata
    }, { userId: req.user.id });

    const duration = Date.now() - startTime;
    logger.info('Project created successfully', { requestId: req.id, projectId: project.id, duration: `${duration}ms` });
    logBusiness('Project created', { requestId: req.id, userId: req.user.id, projectId: project.id });

    res.status(201).json(successResponse('Project created successfully', project, {}, req, startTime));
  } catch (error) {
    logger.error('Create project failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const getProjectById = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    validateUUID(id, 'id', req.id);

    const project = await projectService.getProjectById(id);

    // If not admin, check if user is assigned to this project
    if (!isCompanyAdmin(req.user.keycloakGlobalRole)) {
      const assignments = await projectUserService.getProjectUsers(id, { isActive: true }, { limit: 100, offset: 0 });
      const isAssigned = assignments.users.some(u => u.userId === req.user.id);
      if (!isAssigned) {
        throw new ForbiddenError('You do not have access to this project', { requestId: req.id, userId: req.user.id, projectId: id });
      }
    }

    res.status(200).json(successResponse('Project retrieved successfully', project, {}, req, startTime));
  } catch (error) {
    logger.error('Get project failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const updateProject = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkAdminPermission(req);

    const { id } = req.params;
    validateUUID(id, 'id', req.id);

    const { name, description, status, startDate, endDate, projectMetadata } = req.body;

    if (name !== undefined) {
      validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);
    }

    const project = await projectService.updateProject(id, {
      name,
      description,
      status,
      startDate,
      endDate,
      projectMetadata
    }, { userId: req.user.id });

    const duration = Date.now() - startTime;
    logger.info('Project updated successfully', { requestId: req.id, projectId: id, duration: `${duration}ms` });

    res.status(200).json(successResponse('Project updated successfully', project, {}, req, startTime));
  } catch (error) {
    logger.error('Update project failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const listProjects = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    const allowedSortFields = ['name', 'status', 'startDate', 'createdDate'];
    const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, { defaultSort: 'name', defaultOrder: 'ASC' });

    const filters = {};
    if (req.query.clientId) {
      validateUUID(req.query.clientId, 'clientId', req.id);
      filters.clientId = req.query.clientId;
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }

    // Apply visibility filter if not admin
    if (!isCompanyAdmin(req.user.keycloakGlobalRole)) {
      filters.assignedUserId = req.user.id;
    }

    const result = await projectService.listProjects(filters, { page, limit, offset }, order);

    const duration = Date.now() - startTime;
    if (duration > 500) {
      logPerformance('List projects', duration, { requestId: req.id });
    }

    res.status(200).json(
      paginatedResponse('Projects retrieved successfully', result.projects, { page, limit, total: result.total }, {}, req, startTime)
    );
  } catch (error) {
    logger.error('List projects failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const deleteProject = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkAdminPermission(req);

    const { id } = req.params;
    validateUUID(id, 'id', req.id);

    await projectService.deleteProject(id, { userId: req.user.id });

    logger.info('Project deleted successfully', { requestId: req.id, projectId: id });
    logBusiness('Project deleted', { requestId: req.id, userId: req.user.id, projectId: id });

    res.status(200).json(successResponse('Project deleted successfully', null, {}, req, startTime));
  } catch (error) {
    logger.error('Delete project failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

// --- Project Assignments ---

export const assignUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkAdminPermission(req);

    const { projectId } = req.params;
    const { userId } = req.body;

    validateUUID(projectId, 'projectId', req.id);
    validateRequired({ userId }, req.id);
    validateUUID(userId, 'userId', req.id);

    const assignment = await projectUserService.assignUserToProject(projectId, userId, { userId: req.user.id });

    const duration = Date.now() - startTime;
    logger.info('User assigned to project successfully', { requestId: req.id, projectId, userId, duration: `${duration}ms` });

    res.status(201).json(successResponse('User assigned to project successfully', assignment, {}, req, startTime));
  } catch (error) {
    logger.error('Assign user failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const removeUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkAdminPermission(req);

    const { projectId, userId } = req.params;

    validateUUID(projectId, 'projectId', req.id);
    validateUUID(userId, 'userId', req.id);

    await projectUserService.removeUserFromProject(projectId, userId, { userId: req.user.id });

    logger.info('User removed from project successfully', { requestId: req.id, projectId, userId });

    res.status(200).json(successResponse('User removed from project successfully', null, {}, req, startTime));
  } catch (error) {
    logger.error('Remove user failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const listAssignedUsers = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkAdminPermission(req);

    const { projectId } = req.params;
    validateUUID(projectId, 'projectId', req.id);

    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    const filters = {};
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }

    const result = await projectUserService.getProjectUsers(projectId, filters, { page, limit, offset });

    res.status(200).json(
      paginatedResponse('Project users retrieved successfully', result.users, { page, limit, total: result.total }, {}, req, startTime)
    );
  } catch (error) {
    logger.error('List project users failed', { requestId: req.id, error: error.message });
    throw error;
  }
};
