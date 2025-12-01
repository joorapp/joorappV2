/**
 * @author Bhavesh Venugopal
 * User Service
 * Business logic layer for user management
 * Handles database operations and Keycloak integration
 */

import { createModuleLogger } from '../utils/logger.js';
import { userRepository } from '../repositories/userRepository.js';
import { getAdminClient } from './keycloakService.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors.js';
import { buildPaginationQuery, buildSortQuery } from '../utils/businessHelpers.js';
import { KEYCLOAK_GLOBAL_ROLE_VALUES } from '../constants/keycloakRoles.js';
import sequelize from '../config/database.js';

// Create module-specific logger
const logger = createModuleLogger('userService');

/**
 * Get user by ID
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} User object
 * @throws {NotFoundError} If user not found
 * 
 * @example
 * const user = await getUserById('user-uuid');
 */
export const getUserById = async (userId) => {
  logger.debug('Getting user by ID', { userId });
  
  const user = await userRepository.findByIdOrFail(userId);
  
  return {
    id: user.id,
    keycloakId: user.keycloakId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    keycloakGlobalRole: user.keycloakGlobalRole,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt
  };
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 * 
 * @example
 * const user = await getUserByEmail('user@example.com');
 */
export const getUserByEmail = async (email) => {
  logger.debug('Getting user by email', { email });
  
  const user = await userRepository.findOne({ email });
  
  if (!user) {
    return null;
  }
  
  return {
    id: user.id,
    keycloakId: user.keycloakId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    keycloakGlobalRole: user.keycloakGlobalRole,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt
  };
};

/**
 * List users with optional search, pagination, and sorting
 * @param {Object} filters - Search and filter parameters
 * @param {string} filters.search - Search term for email, firstName, lastName
 * @param {Object} pagination - Pagination parameters { page, limit, offset }
 * @param {Array} sort - Sort array [[field, order]]
 * @returns {Promise<Object>} { users: Array, total: number }
 * 
 * @example
 * const result = await listUsers(
 *   { search: 'john' },
 *   { page: 1, limit: 10, offset: 0 },
 *   [['email', 'ASC']]
 * );
 */
export const listUsers = async (filters = {}, pagination = {}, sort = []) => {
  logger.debug('Listing users', { filters, pagination, sort });
  
  const { search } = filters;
  
  if (search) {
    // Use complex search query
    const result = await userRepository.searchUsers(search, pagination, sort);
    return {
      users: result.rows.map(user => ({
        id: user.id,
        keycloakId: user.keycloakId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        keycloakGlobalRole: user.keycloakGlobalRole,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      })),
      total: result.count
    };
  } else {
    // Use standard findAndCountAll
    const result = await userRepository.findAndCountAll({}, {
      limit: pagination.limit,
      offset: pagination.offset,
      order: sort.length > 0 ? sort : [['email', 'ASC']]
    });
    
    return {
      users: result.rows.map(user => ({
        id: user.id,
        keycloakId: user.keycloakId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        keycloakGlobalRole: user.keycloakGlobalRole,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      })),
      total: result.count
    };
  }
};

/**
 * Check if user exists in Keycloak by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} Keycloak user object or null if not found
 * 
 * @example
 * const kcUser = await checkUserExistsInKeycloak('user@example.com');
 */
export const checkUserExistsInKeycloak = async (email) => {
  logger.debug('Checking if user exists in Keycloak', { email });
  
  const kcAdminClient = await getAdminClient();
  const keycloakUsers = await kcAdminClient.users.find({
    email: email,
    exact: true
  });
  
  if (keycloakUsers && keycloakUsers.length > 0) {
    return keycloakUsers[0];
  }
  
  return null;
};

/**
 * Create user in Keycloak
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} [userData.firstName] - User first name
 * @param {string} [userData.lastName] - User last name
 * @param {string} [userData.keycloakGlobalRole] - Keycloak global role
 * @returns {Promise<Object>} Created Keycloak user object with id
 * 
 * @example
 * const kcUser = await createUserInKeycloak({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   keycloakGlobalRole: 'COMPANY_USER'
 * });
 */
export const createUserInKeycloak = async (userData) => {
  const { email, password, firstName, lastName, keycloakGlobalRole } = userData;
  
  logger.debug('Creating user in Keycloak', { email });
  
  const kcAdminClient = await getAdminClient();
  
  // Create user
  const newKeycloakUser = await kcAdminClient.users.create({
    email: email,
    firstName: firstName || '',
    lastName: lastName || '',
    enabled: true,
    emailVerified: false,
    username: email
  });
  
  logger.info('User created in Keycloak', { keycloakId: newKeycloakUser.id, email });
  
  // Set password
  await kcAdminClient.users.resetPassword({
    id: newKeycloakUser.id,
    credential: {
      temporary: false,
      type: 'password',
      value: password
    }
  });
  
  logger.debug('Password set in Keycloak', { keycloakId: newKeycloakUser.id });
  
  // Assign global role if specified
  if (keycloakGlobalRole) {
    try {
      const role = await kcAdminClient.roles.findOneByName({
        name: keycloakGlobalRole
      });
      
      if (role) {
        await kcAdminClient.users.addRealmRoleMappings({
          id: newKeycloakUser.id,
          roles: [role]
        });
        logger.info('Global role assigned in Keycloak', { keycloakId: newKeycloakUser.id, role: keycloakGlobalRole });
      }
    } catch (roleError) {
      logger.warn('Failed to assign role in Keycloak (continuing)', {
        keycloakId: newKeycloakUser.id,
        role: keycloakGlobalRole,
        error: roleError.message
      });
    }
  }
  
  return newKeycloakUser;
};

/**
 * Create user in database
 * @param {Object} userData - User data
 * @param {string} userData.keycloakId - Keycloak user ID
 * @param {string} userData.email - User email
 * @param {string} [userData.firstName] - User first name
 * @param {string} [userData.lastName] - User last name
 * @param {string} [userData.keycloakGlobalRole] - Keycloak global role
 * @param {Object} context - Audit context (not used for User model, but kept for consistency)
 * @returns {Promise<Object>} Created user object
 * 
 * @example
 * const user = await createUserInDB({
 *   keycloakId: 'kc-uuid',
 *   email: 'user@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   keycloakGlobalRole: 'COMPANY_USER'
 * }, { userId: 'admin-uuid' });
 */
export const createUserInDB = async (userData, context) => {
  const { keycloakId, email, firstName, lastName, keycloakGlobalRole } = userData;
  
  logger.debug('Creating user in database', { keycloakId, email });
  
  // Check if user already exists
  const existing = await userRepository.findOne({ email });
  if (existing) {
    throw new ConflictError('User with this email already exists', { field: 'email', value: email });
  }
  
  // Note: User model doesn't use audit context, but we accept it for consistency
  const { User } = await import('../models/index.js');
  const newUser = await User.create({
    keycloakId: keycloakId,
    email: email,
    firstName: firstName || null,
    lastName: lastName || null,
    keycloakGlobalRole: keycloakGlobalRole || 'COMPANY_USER',
    isActive: true
  });
  
  logger.info('User created in database', { userId: newUser.id, email });
  
  return {
    id: newUser.id,
    keycloakId: newUser.keycloakId,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    keycloakGlobalRole: newUser.keycloakGlobalRole,
    isActive: newUser.isActive
  };
};

/**
 * Update user in Keycloak
 * @param {string} keycloakId - Keycloak user ID
 * @param {Object} userData - User data to update
 * @param {string} [userData.email] - User email
 * @param {string} [userData.firstName] - User first name
 * @param {string} [userData.lastName] - User last name
 * @param {boolean} [userData.isActive] - User active status
 * @param {string} [userData.password] - New password
 * @param {string} [userData.keycloakGlobalRole] - New global role
 * @param {string} [userData.currentRole] - Current global role (for role update)
 * @returns {Promise<void>}
 * 
 * @example
 * await updateUserInKeycloak('kc-uuid', {
 *   email: 'newemail@example.com',
 *   firstName: 'Jane'
 * });
 */
export const updateUserInKeycloak = async (keycloakId, userData) => {
  const { email, firstName, lastName, isActive, password, keycloakGlobalRole, currentRole } = userData;
  
  logger.debug('Updating user in Keycloak', { keycloakId });
  
  const kcAdminClient = await getAdminClient();
  
  // Update basic fields
  const keycloakUpdate = {};
  if (email !== undefined) keycloakUpdate.email = email;
  if (firstName !== undefined) keycloakUpdate.firstName = firstName;
  if (lastName !== undefined) keycloakUpdate.lastName = lastName;
  if (isActive !== undefined) keycloakUpdate.enabled = isActive;
  
  if (Object.keys(keycloakUpdate).length > 0) {
    await kcAdminClient.users.update({ id: keycloakId }, keycloakUpdate);
    logger.info('User updated in Keycloak', { keycloakId, updates: Object.keys(keycloakUpdate) });
  }
  
  // Update password if provided
  if (password) {
    await kcAdminClient.users.resetPassword({
      id: keycloakId,
      credential: {
        temporary: false,
        type: 'password',
        value: password
      }
    });
    logger.info('User password updated in Keycloak', { keycloakId });
  }
  
  // Update global role if provided
  if (keycloakGlobalRole && keycloakGlobalRole !== currentRole) {
    try {
      // Get current roles
      const currentRoles = await kcAdminClient.users.listRealmRoleMappings({ id: keycloakId });
      
      // Remove old role if exists
      const oldRole = currentRoles.find(r => KEYCLOAK_GLOBAL_ROLE_VALUES.includes(r.name));
      if (oldRole) {
        await kcAdminClient.users.delRealmRoleMappings({
          id: keycloakId,
          roles: [oldRole]
        });
      }
      
      // Add new role
      const newRole = await kcAdminClient.roles.findOneByName({ name: keycloakGlobalRole });
      if (newRole) {
        await kcAdminClient.users.addRealmRoleMappings({
          id: keycloakId,
          roles: [newRole]
        });
        logger.info('User global role updated in Keycloak', { keycloakId, oldRole: currentRole, newRole: keycloakGlobalRole });
      }
    } catch (roleError) {
      logger.warn('Failed to update role in Keycloak (continuing)', {
        keycloakId,
        role: keycloakGlobalRole,
        error: roleError.message
      });
    }
  }
};

/**
 * Update user in database
 * @param {string} userId - User UUID
 * @param {Object} userData - User data to update
 * @param {Object} context - Audit context (not used for User model, but kept for consistency)
 * @returns {Promise<Object>} Updated user object
 * @throws {NotFoundError} If user not found
 * @throws {ConflictError} If email already exists
 * 
 * @example
 * const user = await updateUserInDB('user-uuid', {
 *   email: 'newemail@example.com',
 *   firstName: 'Jane'
 * }, { userId: 'admin-uuid' });
 */
export const updateUserInDB = async (userId, userData, context) => {
  logger.debug('Updating user in database', { userId });
  
  const user = await userRepository.findByIdOrFail(userId);
  
  // Check email uniqueness if email is being changed
  if (userData.email && userData.email !== user.email) {
    const existing = await userRepository.findOne({ email: userData.email });
    if (existing) {
      throw new ConflictError('User with this email already exists', { field: 'email', value: userData.email });
    }
  }
  
  // Build update object
  const updateData = {};
  if (userData.email !== undefined) updateData.email = userData.email;
  if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
  if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
  if (userData.keycloakGlobalRole !== undefined) updateData.keycloakGlobalRole = userData.keycloakGlobalRole;
  if (userData.isActive !== undefined) updateData.isActive = userData.isActive;
  
  // Note: User model doesn't have audit fields, so we just update directly
  await user.update(updateData);
  
  logger.info('User updated in database', { userId });
  
  return {
    id: user.id,
    keycloakId: user.keycloakId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    keycloakGlobalRole: user.keycloakGlobalRole,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt
  };
};

/**
 * Delete user from Keycloak (disable)
 * @param {string} keycloakId - Keycloak user ID
 * @returns {Promise<void>}
 * 
 * @example
 * await deleteUserFromKeycloak('kc-uuid');
 */
export const deleteUserFromKeycloak = async (keycloakId) => {
  logger.debug('Deleting user from Keycloak', { keycloakId });
  
  const kcAdminClient = await getAdminClient();
  
  // Disable user in Keycloak (soft delete)
  await kcAdminClient.users.update({ id: keycloakId }, { enabled: false });
  
  logger.info('User disabled in Keycloak', { keycloakId });
};

/**
 * Delete user from database (mark as inactive)
 * @param {string} userId - User UUID
 * @param {Object} context - Audit context (not used for User model, but kept for consistency)
 * @returns {Promise<void>}
 * @throws {NotFoundError} If user not found
 * 
 * @example
 * await deleteUserFromDB('user-uuid', { userId: 'admin-uuid' });
 */
export const deleteUserFromDB = async (userId, context) => {
  logger.debug('Deleting user from database', { userId });
  
  const user = await userRepository.findByIdOrFail(userId);
  
  // Mark user as inactive in database
  await user.update({ isActive: false });
  
  logger.info('User marked as inactive in database', { userId });
};

