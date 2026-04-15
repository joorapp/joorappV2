/**
 * @author Bhavesh Venugopal
 * Client Controller
 * Handles client management
 */

import { createModuleLogger, logBusiness, logPerformance } from '../../utils/logger.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import { validateUUID, validateRequired, validateEmail, validateString, validateBoolean } from '../../utils/validators.js';
import { buildPaginationQuery, buildSortQuery } from '../../utils/businessHelpers.js';
import { isCompanyAdmin } from '../../constants/keycloakRoles.js';
import { ForbiddenError, BadRequestError } from '../../utils/errors.js';
import * as clientService from '../../services/clientService.js';
import * as clientTypeService from '../../services/clientTypeService.js';

const logger = createModuleLogger('clientController');

/**
 * Check if user has permission to manage clients
 */
const checkPermission = (req) => {
  if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Admin access required to manage clients', { requestId: req.id, userId: req.user?.id });
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

export const createClient = async (req, res) => {
  const startTime = Date.now();
  
  try {
    checkPermission(req);
    const companyId = requireCompanyContext(req);

    const { name, email, phone, isActive, clientMetadata } = req.body;

    validateRequired({ name }, req.id);
    validateString(name, 'name', { minLength: 1, maxLength: 255 }, req.id);
    
    if (email) {
      validateEmail(email, 'email', req.id);
    }
    
    if (phone) {
      validateString(phone, 'phone', { maxLength: 50 }, req.id);
    }

    const client = await clientService.createClient(
      {
        name,
        email,
        phone,
        isActive,
        clientMetadata
      },
      { userId: req.user.id, companyId }
    );

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

export const listAllClients = async (req, res) => {
  const startTime = Date.now();

  try {
    checkPermission(req);
    const companyId = requireCompanyContext(req);

    const search = req.query.search ? String(req.query.search).trim() : undefined;
    if (search) {
      validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
    }

    const isActive =
      req.query.isActive !== undefined && req.query.isActive !== ''
        ? req.query.isActive === 'true'
        : undefined;

    const items = await clientService.listAllClientsForCompany(companyId, {
      search,
      isActive
    });

    res.status(200).json(successResponse('Clients retrieved successfully', items, {}, req, startTime));
  } catch (error) {
    logger.error('List all clients failed', { requestId: req.id, error: error.message });
    throw error;
  }
};

export const patchClientStatus = async (req, res) => {
  const startTime = Date.now();

  try {
    checkPermission(req);
    const companyId = requireCompanyContext(req);

    const { id } = req.params;
    validateUUID(id, 'id', req.id);

    const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

    const updated = await clientService.setClientActiveStatusForCompany(
      id,
      isActive,
      { userId: req.user.id },
      companyId
    );

    logBusiness('Client status updated', {
      requestId: req.id,
      userId: req.user.id,
      clientId: id,
      isActive
    });

    res.status(200).json(successResponse('Client status updated successfully', updated, {}, req, startTime));
  } catch (error) {
    logger.error('Patch client status failed', { requestId: req.id, error: error.message });
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

// --- Client types (reference data; same ownership rules as project types) ---

export const createClientType = async (req, res) => {
  const startTime = Date.now();
  checkPermission(req);
  const companyId = requireCompanyContext(req);

  const { clientType, description, isActive } = req.body;
  validateRequired({ clientType }, req.id);
  validateString(clientType, 'clientType', { minLength: 1, maxLength: 255 }, req.id);
  if (description !== undefined && description !== null) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const created = await clientTypeService.createClientType(
    { clientType, description, isActive: resolvedActive },
    { userId: req.user.id, companyId }
  );

  logBusiness('Client type created (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    clientTypeId: created.id
  });

  res.status(201).json(successResponse('Client type created successfully', created, {}, req, startTime));
};

export const listClientTypes = async (req, res) => {
  const startTime = Date.now();
  checkPermission(req);
  const companyId = requireCompanyContext(req);

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const sortBy = req.query.sortBy || 'clientType';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['clientType', 'createdDate', 'isActive'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'clientType',
    defaultOrder: 'ASC'
  });

  const result = await clientTypeService.listClientTypesForCompany(
    companyId,
    { isActive, search },
    { page, limit, offset },
    order,
    { requestId: req.id }
  );

  res.status(200).json(
    paginatedResponse(
      'Client types retrieved successfully',
      result.clientTypes,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

export const listAllClientTypes = async (req, res) => {
  const startTime = Date.now();
  checkPermission(req);
  const companyId = requireCompanyContext(req);

  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const isActive =
    req.query.isActive !== undefined && req.query.isActive !== ''
      ? req.query.isActive === 'true'
      : undefined;

  const items = await clientTypeService.listAllClientTypesForDropdown(companyId, {
    search,
    isActive,
    requestId: req.id
  });

  res.status(200).json(successResponse('Client types retrieved successfully', items, {}, req, startTime));
};

export const getClientTypeById = async (req, res) => {
  const startTime = Date.now();
  checkPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const row = await clientTypeService.getClientTypeByIdForCompany(req.params.id, companyId, {
    requestId: req.id
  });
  res.status(200).json(successResponse('Client type retrieved successfully', row, {}, req, startTime));
};

export const updateClientType = async (req, res) => {
  const startTime = Date.now();
  checkPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const { clientType, description, isActive } = req.body;
  const payload = {};
  if (clientType !== undefined) {
    validateString(clientType, 'clientType', { minLength: 1, maxLength: 255 }, req.id);
    payload.clientType = clientType;
  }
  if (description !== undefined) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
    payload.description = description;
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await clientTypeService.updateClientTypeForCompany(
    req.params.id,
    payload,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Client type updated (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    clientTypeId: updated.id
  });

  res.status(200).json(successResponse('Client type updated successfully', updated, {}, req, startTime));
};

export const patchClientTypeStatus = async (req, res) => {
  const startTime = Date.now();
  checkPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await clientTypeService.setClientTypeActiveStatusForCompany(
    req.params.id,
    isActive,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Client type status updated (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    clientTypeId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Client type status updated successfully', updated, {}, req, startTime));
};

export const deleteClientType = async (req, res) => {
  const startTime = Date.now();
  checkPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  await clientTypeService.deleteClientTypeForCompany(req.params.id, { userId: req.user.id, requestId: req.id }, companyId);

  logBusiness('Client type deleted (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    clientTypeId: req.params.id
  });

  res.status(200).json(successResponse('Client type deleted successfully', null, {}, req, startTime));
};
