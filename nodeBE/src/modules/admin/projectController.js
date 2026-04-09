/**
 * @author Bhavesh Venugopal
 * Project Controller
 * Handles project management and assignments
 */

import { createModuleLogger, logBusiness, logPerformance } from '../../utils/logger.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import { validateUUID, validateRequired, validateString, validateBoolean } from '../../utils/validators.js';
import { buildPaginationQuery, buildSortQuery } from '../../utils/businessHelpers.js';
import { isCompanyAdmin } from '../../constants/keycloakRoles.js';
import { ForbiddenError, BadRequestError } from '../../utils/errors.js';
import * as projectService from '../../services/projectService.js';
import * as projectUserService from '../../services/projectUserService.js';
import * as projectTypeService from '../../services/projectTypeService.js';
import * as projectCategoryService from '../../services/projectCategoryService.js';

const logger = createModuleLogger('projectController');

/**
 * Check if user has permission to manage projects
 */
const checkAdminPermission = (req) => {
  if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Admin access required to manage projects', { requestId: req.id, userId: req.user?.id });
  }
};

/**
 * @param {Object} req
 * @returns {string}
 */
const requireCompanyContext = (req) => {
  if (!req.company?.id) {
    throw new BadRequestError('Company context required. Select a company first.', { requestId: req.id });
  }
  return req.company.id;
};

export const createProject = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkAdminPermission(req);
    const companyId = requireCompanyContext(req);

    const {
      clientId,
      projectTypeId,
      projectCategoryId,
      name,
      description,
      status,
      startDate,
      endDate,
      projectMetadata
    } = req.body;

    validateRequired({ clientId, name, projectTypeId, projectCategoryId }, req.id);
    validateUUID(clientId, 'clientId', req.id);
    validateUUID(projectTypeId, 'projectTypeId', req.id);
    validateUUID(projectCategoryId, 'projectCategoryId', req.id);
    validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);

    const project = await projectService.createProject(
      {
        clientId,
        projectTypeId,
        projectCategoryId,
        name,
        description,
        status,
        startDate,
        endDate,
        projectMetadata
      },
      { userId: req.user.id, companyId, requestId: req.id }
    );

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
    const companyId = requireCompanyContext(req);

    const { id } = req.params;
    validateUUID(id, 'id', req.id);

    const { name, description, status, startDate, endDate, projectMetadata, projectTypeId, projectCategoryId } =
      req.body;

    if (name !== undefined) {
      validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);
    }
    if (projectTypeId !== undefined) {
      validateUUID(projectTypeId, 'projectTypeId', req.id);
    }
    if (projectCategoryId !== undefined) {
      validateUUID(projectCategoryId, 'projectCategoryId', req.id);
    }

    const project = await projectService.updateProject(
      id,
      {
        name,
        description,
        status,
        startDate,
        endDate,
        projectMetadata,
        projectTypeId,
        projectCategoryId
      },
      { userId: req.user.id, companyId, requestId: req.id }
    );

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

// --- Project types (reference data, same ownership rules as job titles) ---

export const createProjectType = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { projectType, description, isActive } = req.body;
  validateRequired({ projectType }, req.id);
  validateString(projectType, 'projectType', { minLength: 1, maxLength: 255 }, req.id);
  if (description !== undefined && description !== null) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const created = await projectTypeService.createProjectType(
    { projectType, description, isActive: resolvedActive },
    { userId: req.user.id, companyId }
  );

  logBusiness('Project type created (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectTypeId: created.id
  });

  res.status(201).json(successResponse('Project type created successfully', created, {}, req, startTime));
};

export const listProjectTypes = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const sortBy = req.query.sortBy || 'projectType';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['projectType', 'createdDate', 'isActive'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'projectType',
    defaultOrder: 'ASC'
  });

  const result = await projectTypeService.listProjectTypesForCompany(
    companyId,
    { isActive, search },
    { page, limit, offset },
    order,
    { requestId: req.id }
  );

  res.status(200).json(
    paginatedResponse(
      'Project types retrieved successfully',
      result.projectTypes,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

export const listAllProjectTypes = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const isActive =
    req.query.isActive !== undefined && req.query.isActive !== ''
      ? req.query.isActive === 'true'
      : undefined;

  const items = await projectTypeService.listAllProjectTypesForDropdown(companyId, {
    search,
    isActive,
    requestId: req.id
  });

  res.status(200).json(successResponse('Project types retrieved successfully', items, {}, req, startTime));
};

export const getProjectTypeById = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const row = await projectTypeService.getProjectTypeByIdForCompany(req.params.id, companyId, {
    requestId: req.id
  });
  res.status(200).json(successResponse('Project type retrieved successfully', row, {}, req, startTime));
};

export const updateProjectType = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const { projectType, description, isActive } = req.body;
  const payload = {};
  if (projectType !== undefined) {
    validateString(projectType, 'projectType', { minLength: 1, maxLength: 255 }, req.id);
    payload.projectType = projectType;
  }
  if (description !== undefined) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
    payload.description = description;
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await projectTypeService.updateProjectTypeForCompany(
    req.params.id,
    payload,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project type updated (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectTypeId: updated.id
  });

  res.status(200).json(successResponse('Project type updated successfully', updated, {}, req, startTime));
};

export const patchProjectTypeStatus = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await projectTypeService.setProjectTypeActiveStatusForCompany(
    req.params.id,
    isActive,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project type status updated (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectTypeId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Project type status updated successfully', updated, {}, req, startTime));
};

export const deleteProjectType = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  await projectTypeService.deleteProjectTypeForCompany(req.params.id, { userId: req.user.id, requestId: req.id }, companyId);

  logBusiness('Project type deleted (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectTypeId: req.params.id
  });

  res.status(200).json(successResponse('Project type deleted successfully', null, {}, req, startTime));
};

// --- Project categories (reference data, same ownership rules as project types) ---

export const createProjectCategory = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { projectCategory, description, isActive } = req.body;
  validateRequired({ projectCategory }, req.id);
  validateString(projectCategory, 'projectCategory', { minLength: 1, maxLength: 255 }, req.id);
  if (description !== undefined && description !== null) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const created = await projectCategoryService.createProjectCategory(
    { projectCategory, description, isActive: resolvedActive },
    { userId: req.user.id, companyId }
  );

  logBusiness('Project category created (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectCategoryId: created.id
  });

  res.status(201).json(successResponse('Project category created successfully', created, {}, req, startTime));
};

export const listProjectCategories = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const sortBy = req.query.sortBy || 'projectCategory';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['projectCategory', 'createdDate', 'isActive'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'projectCategory',
    defaultOrder: 'ASC'
  });

  const result = await projectCategoryService.listProjectCategoriesForCompany(
    companyId,
    { isActive, search },
    { page, limit, offset },
    order,
    { requestId: req.id }
  );

  res.status(200).json(
    paginatedResponse(
      'Project categories retrieved successfully',
      result.projectCategories,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

export const listAllProjectCategories = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const isActive =
    req.query.isActive !== undefined && req.query.isActive !== ''
      ? req.query.isActive === 'true'
      : undefined;

  const items = await projectCategoryService.listAllProjectCategoriesForDropdown(companyId, {
    search,
    isActive,
    requestId: req.id
  });

  res.status(200).json(successResponse('Project categories retrieved successfully', items, {}, req, startTime));
};

export const getProjectCategoryById = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const row = await projectCategoryService.getProjectCategoryByIdForCompany(req.params.id, companyId, {
    requestId: req.id
  });
  res.status(200).json(successResponse('Project category retrieved successfully', row, {}, req, startTime));
};

export const updateProjectCategory = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const { projectCategory, description, isActive } = req.body;
  const payload = {};
  if (projectCategory !== undefined) {
    validateString(projectCategory, 'projectCategory', { minLength: 1, maxLength: 255 }, req.id);
    payload.projectCategory = projectCategory;
  }
  if (description !== undefined) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
    payload.description = description;
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await projectCategoryService.updateProjectCategoryForCompany(
    req.params.id,
    payload,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project category updated (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectCategoryId: updated.id
  });

  res.status(200).json(successResponse('Project category updated successfully', updated, {}, req, startTime));
};

export const patchProjectCategoryStatus = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await projectCategoryService.setProjectCategoryActiveStatusForCompany(
    req.params.id,
    isActive,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project category status updated (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectCategoryId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Project category status updated successfully', updated, {}, req, startTime));
};

export const deleteProjectCategory = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  await projectCategoryService.deleteProjectCategoryForCompany(
    req.params.id,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Project category deleted (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    projectCategoryId: req.params.id
  });

  res.status(200).json(successResponse('Project category deleted successfully', null, {}, req, startTime));
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
