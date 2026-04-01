/**
 * @author Bhavesh Venugopal
 * Project Service
 * Business logic layer for project management
 */

import { createModuleLogger } from '../utils/logger.js';
import { projectRepository } from '../repositories/projectRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { projectTypeRepository } from '../repositories/projectTypeRepository.js';
import { projectCategoryRepository } from '../repositories/projectCategoryRepository.js';
import { getSuperAdminCompanyId } from './systemCompanyService.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { PROJECT_STATUS_VALUES, PROJECT_STATUS_DEFAULT } from '../models/Project.js';
import { ProjectUser, Client, ProjectType, ProjectCategory } from '../models/index.js';

const logger = createModuleLogger('projectService');

const isMasterVisibleToClientCompany = (clientCompanyId, masterRow, systemCompanyId) =>
  masterRow.createdCompanyId === clientCompanyId || masterRow.createdCompanyId === systemCompanyId;

const assertClientBelongsToCompany = (client, companyId) => {
  if (!client.createdCompanyId) {
    throw new ConflictError('Client must belong to a company', { field: 'clientId' });
  }
  if (client.createdCompanyId !== companyId) {
    throw new NotFoundError('Client', client.id);
  }
};

const projectMasterIncludes = [
  {
    model: ProjectType,
    as: 'projectType',
    attributes: ['id', 'projectType']
  },
  {
    model: ProjectCategory,
    as: 'projectCategory',
    attributes: ['id', 'projectCategory']
  }
];

/**
 * @param {Object} client - Sequelize Client instance
 * @param {string} projectTypeId
 * @param {{ requestId?: string }} [opts]
 */
const validateProjectTypeForClient = async (client, projectTypeId, opts = {}) => {
  const { requestId } = opts;
  const clientCompanyId = client.createdCompanyId;
  if (!clientCompanyId) {
    throw new ConflictError('Client must belong to a company', { field: 'clientId' });
  }
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const projectType = await projectTypeRepository.findByIdOrFail(projectTypeId);
  if (!isMasterVisibleToClientCompany(clientCompanyId, projectType, systemCompanyId)) {
    throw new NotFoundError('ProjectType', projectTypeId);
  }
  if (!projectType.isActive) {
    throw new ConflictError('Project type is inactive and cannot be assigned', { field: 'projectTypeId' });
  }
};

/**
 * @param {Object} client - Sequelize Client instance
 * @param {string} projectCategoryId
 * @param {{ requestId?: string }} [opts]
 */
const validateProjectCategoryForClient = async (client, projectCategoryId, opts = {}) => {
  const { requestId } = opts;
  const clientCompanyId = client.createdCompanyId;
  if (!clientCompanyId) {
    throw new ConflictError('Client must belong to a company', { field: 'clientId' });
  }
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const projectCategory = await projectCategoryRepository.findByIdOrFail(projectCategoryId);
  if (!isMasterVisibleToClientCompany(clientCompanyId, projectCategory, systemCompanyId)) {
    throw new NotFoundError('ProjectCategory', projectCategoryId);
  }
  if (!projectCategory.isActive) {
    throw new ConflictError('Project category is inactive and cannot be assigned', { field: 'projectCategoryId' });
  }
};

const toProjectDto = (project) => {
  const dto = {
    id: project.id,
    clientId: project.clientId,
    projectTypeId: project.projectTypeId,
    projectCategoryId: project.projectCategoryId,
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
  if (project.client) {
    dto.client = {
      id: project.client.id,
      name: project.client.name
    };
    if (project.client.email !== undefined) {
      dto.client.email = project.client.email;
    }
  }
  if (project.projectType) {
    dto.projectType = {
      id: project.projectType.id,
      projectType: project.projectType.projectType
    };
  }
  if (project.projectCategory) {
    dto.projectCategory = {
      id: project.projectCategory.id,
      projectCategory: project.projectCategory.projectCategory
    };
  }
  return dto;
};

const loadProjectWithRelations = async (projectId) =>
  projectRepository.findByIdOrFail(projectId, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'email']
      },
      ...projectMasterIncludes
    ]
  });

/**
 * Create new project
 * @param {Object} projectData
 * @param {string} projectData.clientId
 * @param {string} projectData.projectTypeId
 * @param {string} projectData.projectCategoryId
 * @param {Object} context - { userId, companyId, requestId? }
 */
export const createProject = async (projectData, context) => {
  const {
    clientId,
    projectTypeId,
    projectCategoryId,
    name,
    description,
    status = PROJECT_STATUS_DEFAULT,
    startDate,
    endDate,
    projectMetadata = {}
  } = projectData;
  const { companyId, requestId } = context;

  logger.debug('Creating project', { name, clientId, projectTypeId, projectCategoryId });

  if (status && !PROJECT_STATUS_VALUES.includes(status)) {
    throw new ConflictError('Invalid project status', { field: 'status', value: status });
  }

  const client = await clientRepository.findById(clientId);
  if (!client) {
    throw new NotFoundError('Client', clientId);
  }

  assertClientBelongsToCompany(client, companyId);
  await validateProjectTypeForClient(client, projectTypeId, { requestId });
  await validateProjectCategoryForClient(client, projectCategoryId, { requestId });

  const existingProject = await projectRepository.findOne({ name, clientId });
  if (existingProject) {
    throw new ConflictError('Project with this name already exists for this client', { field: 'name', value: name });
  }

  const row = await projectRepository.create(
    {
      clientId,
      projectTypeId,
      projectCategoryId,
      name,
      description: description || null,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
      projectMetadata
    },
    context
  );

  const created = await loadProjectWithRelations(row.id);

  logger.info('Project created', { projectId: created.id, name });

  return toProjectDto(created);
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
      },
      ...projectMasterIncludes
    ]
  });

  return toProjectDto(project);
};

/**
 * Update project
 * @param {string} projectId
 * @param {Object} projectData
 * @param {Object} context - { userId, companyId, requestId? }
 */
export const updateProject = async (projectId, projectData, context) => {
  logger.debug('Updating project', { projectId });
  const { companyId, requestId } = context;

  const project = await projectRepository.findByIdOrFail(projectId, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'createdCompanyId']
      }
    ]
  });

  assertClientBelongsToCompany(project.client, companyId);

  if (projectData.status !== undefined && !PROJECT_STATUS_VALUES.includes(projectData.status)) {
    throw new ConflictError('Invalid project status', { field: 'status', value: projectData.status });
  }

  if (projectData.name && projectData.name !== project.name) {
    const existing = await projectRepository.findOne({ name: projectData.name, clientId: project.clientId });
    if (existing) {
      throw new ConflictError('Project with this name already exists for this client', { field: 'name', value: projectData.name });
    }
  }

  if (projectData.projectTypeId !== undefined) {
    await validateProjectTypeForClient(project.client, projectData.projectTypeId, { requestId });
  }
  if (projectData.projectCategoryId !== undefined) {
    await validateProjectCategoryForClient(project.client, projectData.projectCategoryId, { requestId });
  }

  const updateData = {};
  if (projectData.name !== undefined) updateData.name = projectData.name;
  if (projectData.description !== undefined) updateData.description = projectData.description || null;
  if (projectData.status !== undefined) updateData.status = projectData.status;
  if (projectData.startDate !== undefined) updateData.startDate = projectData.startDate || null;
  if (projectData.endDate !== undefined) updateData.endDate = projectData.endDate || null;
  if (projectData.projectMetadata !== undefined) updateData.projectMetadata = projectData.projectMetadata;
  if (projectData.projectTypeId !== undefined) updateData.projectTypeId = projectData.projectTypeId;
  if (projectData.projectCategoryId !== undefined) updateData.projectCategoryId = projectData.projectCategoryId;

  await projectRepository.update(projectId, updateData, context);

  const updated = await loadProjectWithRelations(projectId);

  logger.info('Project updated', { projectId });

  return toProjectDto(updated);
};

/**
 * List projects
 * @param {Object} filters
 * @param {Object} pagination
 * @param {Array} sort
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
    },
    ...projectMasterIncludes
  ];

  if (filters.assignedUserId) {
    include.push({
      model: ProjectUser,
      as: 'projectUsers',
      where: { userId: filters.assignedUserId, isActive: true },
      attributes: []
    });
  }

  const result = await projectRepository.findAndCountAll(whereFilters, {
    limit: pagination.limit,
    offset: pagination.offset,
    order: sort.length > 0 ? sort : [['name', 'ASC']],
    include,
    distinct: true
  });

  return {
    projects: result.rows.map((p) => toProjectDto(p)),
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
