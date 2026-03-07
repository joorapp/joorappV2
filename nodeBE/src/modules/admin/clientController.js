/**
 * @author Bhavesh Venugopal
 * Client Controller
 * Handles client management
 */

import { createModuleLogger, logBusiness, logPerformance } from '../../utils/logger.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import { validateUUID, validateRequired, validateEmail, validateString } from '../../utils/validators.js';
import { buildPaginationQuery, buildSortQuery } from '../../utils/businessHelpers.js';
import { isCompanyAdmin } from '../../constants/keycloakRoles.js';
import { ForbiddenError } from '../../utils/errors.js';
import * as clientService from '../../services/clientService.js';

const logger = createModuleLogger('clientController');

/**
 * Check if user has permission to manage clients
 */
const checkPermission = (req) => {
  if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Admin access required to manage clients', { requestId: req.id, userId: req.user?.id });
  }
};

export const createClient = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkPermission(req);

    const { name, email, phone, isActive, clientMetadata } = req.body;

    validateRequired({ name }, req.id);
    validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);
    
    if (email) {
      validateEmail(email, 'email', req.id);
    }
    
    if (phone) {
      validateString(phone, 'phone', { maxLength: 50 }, req.id);
    }

    const client = await clientService.createClient({
      name,
      email,
      phone,
      isActive,
      clientMetadata
    }, { userId: req.user.id });

    const duration = Date.now() - startTime;
    logger.info('Client created successfully', { requestId: req.id, clientId: client.id, duration: `${duration}ms` });
    logBusiness('Client created', { requestId: req.id, userId: req.user.id, clientId: client.id });

    res.status(201).json(successResponse('Client created successfully', client, {}, req, startTime));
  } catch (error) {
    logger.error('Create client failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const getClientById = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkPermission(req);

    const { id } = req.params;
    validateUUID(id, 'id', req.id);

    const client = await clientService.getClientById(id);

    res.status(200).json(successResponse('Client retrieved successfully', client, {}, req, startTime));
  } catch (error) {
    logger.error('Get client failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const updateClient = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkPermission(req);

    const { id } = req.params;
    validateUUID(id, 'id', req.id);

    const { name, email, phone, isActive, clientMetadata } = req.body;

    if (name !== undefined) {
      validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);
    }
    if (email !== undefined && email !== null) {
      validateEmail(email, 'email', req.id);
    }

    const client = await clientService.updateClient(id, {
      name,
      email,
      phone,
      isActive,
      clientMetadata
    }, { userId: req.user.id });

    const duration = Date.now() - startTime;
    logger.info('Client updated successfully', { requestId: req.id, clientId: id, duration: `${duration}ms` });

    res.status(200).json(successResponse('Client updated successfully', client, {}, req, startTime));
  } catch (error) {
    logger.error('Update client failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const listClients = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkPermission(req);

    const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    const allowedSortFields = ['name', 'email', 'isActive', 'createdDate'];
    const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, { defaultSort: 'name', defaultOrder: 'ASC' });

    const filters = {};
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }
    if (req.query.search) {
      filters.name = req.query.search;
    }

    const result = await clientService.listClients(filters, { page, limit, offset }, order);

    const duration = Date.now() - startTime;
    if (duration > 500) {
      logPerformance('List clients', duration, { requestId: req.id });
    }

    res.status(200).json(
      paginatedResponse('Clients retrieved successfully', result.clients, { page, limit, total: result.total }, {}, req, startTime)
    );
  } catch (error) {
    logger.error('List clients failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const deleteClient = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkPermission(req);

    const { id } = req.params;
    validateUUID(id, 'id', req.id);

    await clientService.deleteClient(id, { userId: req.user.id });

    logger.info('Client deleted successfully', { requestId: req.id, clientId: id });
    logBusiness('Client deleted', { requestId: req.id, userId: req.user.id, clientId: id });

    res.status(200).json(successResponse('Client deleted successfully', null, {}, req, startTime));
  } catch (error) {
    logger.error('Delete client failed', { requestId: req.id, error: error.message });
    throw error;
  }
};
