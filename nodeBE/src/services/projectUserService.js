/**
 * @author Bhavesh Venugopal
 * ProjectUser Service
 * Business logic layer for assigning users to projects
 */

import { createModuleLogger } from '../utils/logger.js';
import { projectUserRepository } from '../repositories/projectUserRepository.js';
import { projectRepository } from '../repositories/projectRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { User, Project } from '../models/index.js';

const logger = createModuleLogger('projectUserService');

/**
 * Assign a user to a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Created assignment
 */
export const assignUserToProject = async (projectId, userId, context) => {
  logger.debug('Assigning user to project', { projectId, userId });

  // Validate project
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Validate user
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if assignment already exists
  const existingAssignment = await projectUserRepository.findOne({
    projectId,
    userId,
    isDeleted: false // The index also uses isDeleted: false for uniqueness
  });

  if (existingAssignment) {
    if (existingAssignment.isActive) {
      throw new ConflictError('User is already assigned to this project', { field: 'userId', value: userId });
    } else {
      // Re-activate if it exists but inactive
      logger.info('Re-activating existing assignment', { assignmentId: existingAssignment.id });
      return await projectUserRepository.update(existingAssignment.id, { isActive: true }, context);
    }
  }

  const assignment = await projectUserRepository.create({
    projectId,
    userId,
    isActive: true
  }, context);

  logger.info('User assigned to project', { assignmentId: assignment.id, projectId, userId });
  
  return assignment;
};

/**
 * Remove a user from a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} context - Audit context { userId }
 */
export const removeUserFromProject = async (projectId, userId, context) => {
  logger.debug('Removing user from project', { projectId, userId });

  const assignment = await projectUserRepository.findOne({
    projectId,
    userId,
    isActive: true
  });

  if (!assignment) {
    throw new NotFoundError('Active assignment not found');
  }

  // Soft delete the assignment
  await projectUserRepository.delete(assignment.id, context);
  
  logger.info('User removed from project', { assignmentId: assignment.id, projectId, userId });
};

/**
 * Get users assigned to a project
 * @param {string} projectId - Project ID
 * @param {Object} filters - Filter parameters
 * @param {Object} pagination - Pagination parameters
 * @returns {Promise<Object>} { users, total }
 */
export const getProjectUsers = async (projectId, filters = {}, pagination = {}) => {
  logger.debug('Getting project users', { projectId, filters, pagination });
  
  const whereFilters = { projectId };
  if (filters.isActive !== undefined) whereFilters.isActive = filters.isActive;
  
  const result = await projectUserRepository.findAndCountAll(whereFilters, {
    limit: pagination.limit,
    offset: pagination.offset,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName']
      }
    ]
  });
  
  return {
    users: result.rows.map(assignment => ({
      id: assignment.id,
      userId: assignment.userId,
      isActive: assignment.isActive,
      user: assignment.user,
      createdDate: assignment.createdDate
    })),
    total: result.count
  };
};

/**
 * Get projects assigned to a user
 * @param {string} userId - User ID
 * @param {Object} filters - Filter parameters
 * @param {Object} pagination - Pagination parameters
 * @returns {Promise<Object>} { projects, total }
 */
export const getUserProjects = async (userId, filters = {}, pagination = {}) => {
  logger.debug('Getting user projects', { userId, filters, pagination });
  
  const whereFilters = { userId };
  if (filters.isActive !== undefined) whereFilters.isActive = filters.isActive;
  
  const result = await projectUserRepository.findAndCountAll(whereFilters, {
    limit: pagination.limit,
    offset: pagination.offset,
    include: [
      {
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'status', 'clientId']
      }
    ]
  });
  
  return {
    projects: result.rows.map(assignment => ({
      id: assignment.id,
      projectId: assignment.projectId,
      isActive: assignment.isActive,
      project: assignment.project,
      createdDate: assignment.createdDate
    })),
    total: result.count
  };
};
