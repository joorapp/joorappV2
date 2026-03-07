/**
 * @author Bhavesh Venugopal
 * Project Service
 * Business logic layer for project management
 */

import { createModuleLogger } from '../utils/logger.js';
import { projectRepository } from '../repositories/projectRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { PROJECT_STATUS_VALUES, PROJECT_STATUS_DEFAULT } from '../models/Project.js';
import { ProjectUser, Client } from '../models/index.js';

const logger = createModuleLogger('projectService');

/**
 * Create new project
 * @param {Object} projectData - Project data
 * @param {string} projectData.clientId - Client ID
 * @param {string} projectData.name - Project name
 * @param {string} [projectData.description] - Project description
 * @param {string} [projectData.status] - Project status
 * @param {string} [projectData.startDate] - Start date (YYYY-MM-DD)
 * @param {string} [projectData.endDate] - End date (YYYY-MM-DD)
 * @param {Object} [projectData.projectMetadata] - Additional metadata
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Created project
 */
export const createProject = async (projectData, context) => {
  const { 
    clientId, 
    name, 
    description, 
    status = PROJECT_STATUS_DEFAULT,
    startDate,
    endDate,
    projectMetadata = {} 
  } = projectData;
  
  logger.debug('Creating project', { name, clientId });

  // Validate status
  if (status && !PROJECT_STATUS_VALUES.includes(status)) {
    throw new ConflictError('Invalid project status', { field: 'status', value: status });
  }

  // Validate client exists
  const client = await clientRepository.findById(clientId);
  if (!client) {
    throw new NotFoundError('Client not found');
  }
  
  const existingProject = await projectRepository.findOne({ name, clientId });
  if (existingProject) {
    throw new ConflictError('Project with this name already exists for this client', { field: 'name', value: name });
  }

  const project = await projectRepository.create({
    clientId,
    name,
    description: description || null,
    status,
    startDate: startDate || null,
    endDate: endDate || null,
    projectMetadata
  }, context);

  logger.info('Project created', { projectId: project.id, name });
  
  return {
    id: project.id,
    clientId: project.clientId,
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    projectMetadata: project.projectMetadata,
    createdDate: project.createdDate,
    createdUserId: project.createdUserId
  };
};

/**
 * Get project by ID
 * @param {string} projectId - Project UUID
 * @returns {Promise<Object>} Project object
 */
export const getProjectById = async (projectId) => {
  logger.debug('Getting project by ID', { projectId });
  
  const project = await projectRepository.findByIdOrFail(projectId, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'email']
      }
    ]
  });
  
  return {
    id: project.id,
    clientId: project.clientId,
    client: project.client,
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    projectMetadata: project.projectMetadata,
    createdDate: project.createdDate,
    createdUserId: project.createdUserId,
    updatedDate: project.updatedDate,
    updatedUserId: project.updatedUserId
  };
};

/**
 * Update project
 * @param {string} projectId - Project UUID
 * @param {Object} projectData - Project data to update
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Updated project object
 */
export const updateProject = async (projectId, projectData, context) => {
  logger.debug('Updating project', { projectId });
  
  const project = await projectRepository.findByIdOrFail(projectId);
  
  if (projectData.status !== undefined && !PROJECT_STATUS_VALUES.includes(projectData.status)) {
    throw new ConflictError('Invalid project status', { field: 'status', value: projectData.status });
  }

  if (projectData.name && projectData.name !== project.name) {
    const existing = await projectRepository.findOne({ name: projectData.name, clientId: project.clientId });
    if (existing) {
      throw new ConflictError('Project with this name already exists for this client', { field: 'name', value: projectData.name });
    }
  }

  const updateData = {};
  if (projectData.name !== undefined) updateData.name = projectData.name;
  if (projectData.description !== undefined) updateData.description = projectData.description || null;
  if (projectData.status !== undefined) updateData.status = projectData.status;
  if (projectData.startDate !== undefined) updateData.startDate = projectData.startDate || null;
  if (projectData.endDate !== undefined) updateData.endDate = projectData.endDate || null;
  if (projectData.projectMetadata !== undefined) updateData.projectMetadata = projectData.projectMetadata;

  const updatedProject = await projectRepository.update(projectId, updateData, context);
  
  logger.info('Project updated', { projectId });
  
  return {
    id: updatedProject.id,
    clientId: updatedProject.clientId,
    name: updatedProject.name,
    description: updatedProject.description,
    status: updatedProject.status,
    startDate: updatedProject.startDate,
    endDate: updatedProject.endDate,
    projectMetadata: updatedProject.projectMetadata,
    createdDate: updatedProject.createdDate,
    createdUserId: updatedProject.createdUserId,
    updatedDate: updatedProject.updatedDate,
    updatedUserId: updatedProject.updatedUserId
  };
};

/**
 * List projects
 * @param {Object} filters - Filter parameters
 * @param {string} [filters.clientId] - Filter by client ID
 * @param {string} [filters.assignedUserId] - Filter by assigned user ID
 * @param {string} [filters.status] - Filter by status
 * @param {Object} pagination - Pagination parameters
 * @param {Array} sort - Sort array
 * @returns {Promise<Object>} { projects, total }
 */
export const listProjects = async (filters = {}, pagination = {}, sort = []) => {
  logger.debug('Listing projects', { filters, pagination, sort });
  
  const whereFilters = {};
  if (filters.clientId) whereFilters.clientId = filters.clientId;
  if (filters.status) whereFilters.status = filters.status;
  
  const include = [
    {
      model: Client,
      as: 'client',
      attributes: ['id', 'name']
    }
  ];

  if (filters.assignedUserId) {
    include.push({
      model: ProjectUser,
      as: 'projectUsers',
      where: { userId: filters.assignedUserId, isActive: true },
      attributes: [] // We only need the inner join, not the attributes
    });
  }
  
  const result = await projectRepository.findAndCountAll(whereFilters, {
    limit: pagination.limit,
    offset: pagination.offset,
    order: sort.length > 0 ? sort : [['name', 'ASC']],
    include,
    distinct: true // To get correct count when using includes
  });
  
  return {
    projects: result.rows.map(project => ({
      id: project.id,
      clientId: project.clientId,
      client: project.client,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      createdDate: project.createdDate
    })),
    total: result.count
  };
};

/**
 * Delete project (soft delete)
 * @param {string} projectId - Project UUID
 * @param {Object} context - Audit context { userId }
 */
export const deleteProject = async (projectId, context) => {
  logger.debug('Deleting project', { projectId });
  await projectRepository.delete(projectId, context);
  logger.info('Project deleted', { projectId });
};
