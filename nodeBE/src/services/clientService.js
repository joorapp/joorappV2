/**
 * @author Bhavesh Venugopal
 * Client Service
 * Business logic layer for client management
 */

import { createModuleLogger } from '../utils/logger.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';

const logger = createModuleLogger('clientService');

/**
 * Create new client
 * @param {Object} clientData - Client data
 * @param {string} clientData.name - Client name
 * @param {string} [clientData.email] - Client email
 * @param {string} [clientData.phone] - Client phone
 * @param {boolean} [clientData.isActive] - Client active status
 * @param {Object} [clientData.clientMetadata] - Additional metadata
 * @param {Object} context - Audit context { userId, companyId? }
 * @returns {Promise<Object>} Created client
 */
export const createClient = async (clientData, context) => {
  const { name, email, phone, isActive = true, clientMetadata = {} } = clientData;
  const { companyId } = context;

  logger.debug('Creating client', { name, email, companyId });

  const existingClient = await clientRepository.findOne(
    companyId ? { name, createdCompanyId: companyId } : { name }
  );
  if (existingClient) {
    throw new ConflictError('Client with this name already exists', { field: 'name', value: name });
  }

  const client = await clientRepository.create(
    {
      name,
      email: email || null,
      phone: phone || null,
      isActive,
      clientMetadata
    },
    context
  );

  logger.info('Client created', { clientId: client.id, name });
  
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    isActive: client.isActive,
    clientMetadata: client.clientMetadata,
    createdDate: client.createdDate,
    createdUserId: client.createdUserId
  };
};

/**
 * Get client by ID
 * @param {string} clientId - Client UUID
 * @returns {Promise<Object>} Client object
 */
export const getClientById = async (clientId) => {
  logger.debug('Getting client by ID', { clientId });
  
  const client = await clientRepository.findByIdOrFail(clientId);
  
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    isActive: client.isActive,
    clientMetadata: client.clientMetadata,
    createdDate: client.createdDate,
    createdUserId: client.createdUserId,
    updatedDate: client.updatedDate,
    updatedUserId: client.updatedUserId
  };
};

/**
 * Update client
 * @param {string} clientId - Client UUID
 * @param {Object} clientData - Client data to update
 * @param {Object} context - Audit context { userId }
 * @returns {Promise<Object>} Updated client object
 */
export const updateClient = async (clientId, clientData, context) => {
  logger.debug('Updating client', { clientId });
  
  const client = await clientRepository.findByIdOrFail(clientId);
  
  if (clientData.name && clientData.name !== client.name) {
    const existing = await clientRepository.findOne({ name: clientData.name });
    if (existing) {
      throw new ConflictError('Client with this name already exists', { field: 'name', value: clientData.name });
    }
  }

  const updateData = {};
  if (clientData.name !== undefined) updateData.name = clientData.name;
  if (clientData.email !== undefined) updateData.email = clientData.email || null;
  if (clientData.phone !== undefined) updateData.phone = clientData.phone || null;
  if (clientData.isActive !== undefined) updateData.isActive = clientData.isActive;
  if (clientData.clientMetadata !== undefined) updateData.clientMetadata = clientData.clientMetadata;

  const updatedClient = await clientRepository.update(clientId, updateData, context);
  
  logger.info('Client updated', { clientId });
  
  return {
    id: updatedClient.id,
    name: updatedClient.name,
    email: updatedClient.email,
    phone: updatedClient.phone,
    isActive: updatedClient.isActive,
    clientMetadata: updatedClient.clientMetadata,
    createdDate: updatedClient.createdDate,
    createdUserId: updatedClient.createdUserId,
    updatedDate: updatedClient.updatedDate,
    updatedUserId: updatedClient.updatedUserId
  };
};

/**
 * List clients
 * @param {Object} filters - Filter parameters
 * @param {Object} pagination - Pagination parameters
 * @param {Array} sort - Sort array
 * @returns {Promise<Object>} { clients, total }
 */
export const listClients = async (filters = {}, pagination = {}, sort = []) => {
  logger.debug('Listing clients', { filters, pagination, sort });
  
  const whereFilters = {};
  if (filters.isActive !== undefined) whereFilters.isActive = filters.isActive;
  if (filters.name) {
    // We could add simple ILIKE search here using Sequelize.Op.iLike if needed,
    // or keep it simple. Let's keep it simple for now or implement search in repo if required.
  }
  
  const result = await clientRepository.findAndCountAll(whereFilters, {
    limit: pagination.limit,
    offset: pagination.offset,
    order: sort.length > 0 ? sort : [['name', 'ASC']]
  });
  
  return {
    clients: result.rows.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      isActive: client.isActive,
      createdDate: client.createdDate
    })),
    total: result.count
  };
};

/**
 * Delete client (soft delete)
 * @param {string} clientId - Client UUID
 * @param {Object} context - Audit context { userId }
 */
export const deleteClient = async (clientId, context) => {
  logger.debug('Deleting client', { clientId });
  await clientRepository.delete(clientId, context);
  logger.info('Client deleted', { clientId });
};

/**
 * Full list for dropdowns: clients created by the given company, sorted by name.
 * @param {string} companyId
 * @param {Object} [opts]
 * @param {string} [opts.search]
 * @param {boolean} [opts.isActive] - Omit for all; true/false to filter
 * @returns {Promise<Object[]>}
 */
export const listAllClientsForCompany = async (companyId, opts = {}) => {
  const { search, isActive } = opts;
  const filterPayload = {};
  if (search) filterPayload.search = search;
  if (isActive !== undefined) filterPayload.isActive = isActive;

  const rows = await clientRepository.findAllForCompany(companyId, filterPayload);
  return rows.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    isActive: client.isActive,
    clientMetadata: client.clientMetadata,
    createdDate: client.createdDate
  }));
};

/**
 * Update only active flag; client must belong to the company.
 * @param {string} clientId
 * @param {boolean} isActive
 * @param {Object} context - { userId }
 * @param {string} companyId
 * @returns {Promise<Object>}
 */
export const setClientActiveStatusForCompany = async (clientId, isActive, context, companyId) => {
  const client = await clientRepository.findByIdOrFail(clientId);
  if (client.createdCompanyId !== companyId) {
    throw new NotFoundError('Client', clientId);
  }

  const updatedClient = await clientRepository.update(
    clientId,
    { isActive: Boolean(isActive) },
    context
  );

  logger.info('Client status updated', { clientId, isActive });

  return {
    id: updatedClient.id,
    name: updatedClient.name,
    email: updatedClient.email,
    phone: updatedClient.phone,
    isActive: updatedClient.isActive,
    clientMetadata: updatedClient.clientMetadata,
    createdDate: updatedClient.createdDate,
    createdUserId: updatedClient.createdUserId,
    updatedDate: updatedClient.updatedDate,
    updatedUserId: updatedClient.updatedUserId
  };
};
