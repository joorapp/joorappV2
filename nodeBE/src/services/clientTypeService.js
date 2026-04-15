/**
 * @author Bhavesh Venugopal
 * Client Type Service
 * Business logic for client types (scoped by createdCompanyId)
 */

import { createModuleLogger } from '../utils/logger.js';
import { clientTypeRepository } from '../repositories/clientTypeRepository.js';
import { getSuperAdminCompanyId } from './systemCompanyService.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors.js';

const logger = createModuleLogger('clientTypeService');

const SYSTEM_CLIENT_TYPE_FORBIDDEN_MSG =
  'This client type is managed by the platform and cannot be edited or deleted from your company.';

/**
 * @param {Object} row
 * @returns {Object}
 */
const toDto = (row) => ({
  id: row.id,
  clientType: row.clientType,
  description: row.description,
  isActive: row.isActive,
  createdDate: row.createdDate,
  updatedDate: row.updatedDate,
  version: row.version
});

/**
 * @param {Object} row
 * @param {string} tenantCompanyId
 * @returns {Object}
 */
const toTenantClientTypeDto = (row, tenantCompanyId) => ({
  ...toDto(row),
  canEdit: row.createdCompanyId === tenantCompanyId,
  canDelete: row.createdCompanyId === tenantCompanyId
});

/**
 * @param {Object} row
 * @param {string} expectedCompanyId
 * @throws {NotFoundError}
 */
const assertOwnedByCompany = (row, expectedCompanyId) => {
  if (!row || row.createdCompanyId !== expectedCompanyId) {
    throw new NotFoundError('ClientType', row?.id ?? null);
  }
};

/**
 * @param {Object} row
 * @param {string} tenantCompanyId
 * @param {string} systemCompanyId
 * @returns {boolean}
 */
const isVisibleToTenant = (row, tenantCompanyId, systemCompanyId) =>
  row.createdCompanyId === tenantCompanyId || row.createdCompanyId === systemCompanyId;

/**
 * @param {Object} row
 * @param {string} tenantCompanyId
 * @param {string} systemCompanyId
 * @param {Object} [context]
 * @throws {ForbiddenError}
 */
const assertCompanyMayMutateClientType = (row, tenantCompanyId, systemCompanyId, context = {}) => {
  if (row.createdCompanyId === systemCompanyId && tenantCompanyId !== systemCompanyId) {
    throw new ForbiddenError(SYSTEM_CLIENT_TYPE_FORBIDDEN_MSG, {
      reason: 'SYSTEM_CLIENT_TYPE',
      clientTypeId: row.id,
      ...context
    });
  }
  assertOwnedByCompany(row, tenantCompanyId);
};

/**
 * @param {Object} data - { clientType, description?, isActive? }
 * @param {Object} context - { userId, companyId }
 * @returns {Promise<Object>}
 */
export const createClientType = async (data, context) => {
  const { clientType, description, isActive = true } = data;
  const { userId, companyId } = context;

  logger.debug('Creating client type', { clientType, companyId });

  const duplicate = await clientTypeRepository.findOneByClientTypeAndCompany(clientType, companyId);
  if (duplicate) {
    throw new ConflictError('Client type already exists for this company', {
      field: 'clientType',
      value: clientType
    });
  }

  const row = await clientTypeRepository.create(
    {
      clientType,
      description: description ?? null,
      isActive
    },
    { userId, companyId }
  );

  logger.info('Client type created', { id: row.id, companyId });
  return toDto(row);
};

/**
 * @param {string} id
 * @param {string} companyId
 * @param {Object} [opts]
 * @returns {Promise<Object>}
 */
export const getClientTypeByIdForCompany = async (id, companyId, opts = {}) => {
  const { requestId, workspace = 'company' } = opts;

  if (workspace === 'superAdmin') {
    const row = await clientTypeRepository.findByIdOrFail(id);
    assertOwnedByCompany(row, companyId);
    return toDto(row);
  }

  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (companyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin client type APIs when operating in the system company', {
      requestId
    });
  }
  const row = await clientTypeRepository.findByIdOrFail(id);
  if (!isVisibleToTenant(row, companyId, systemCompanyId)) {
    throw new NotFoundError('ClientType', id);
  }
  return toTenantClientTypeDto(row, companyId);
};

/**
 * @param {string} companyId
 * @param {Object} filters
 * @param {Object} pagination
 * @param {Array} order
 * @param {Object} [opts]
 * @returns {Promise<{ clientTypes: Object[], total: number }>}
 */
export const listClientTypesForCompany = async (companyId, filters, pagination, order, opts = {}) => {
  const { requestId, workspace = 'company' } = opts;
  const { limit, offset } = pagination;

  if (workspace === 'superAdmin') {
    const { rows, count } = await clientTypeRepository.findAndCountByCreatedCompany(
      companyId,
      filters,
      { limit, offset },
      order
    );
    return {
      clientTypes: rows.map(toDto),
      total: count
    };
  }

  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (companyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin client type APIs when operating in the system company', {
      requestId
    });
  }
  const { rows, count } = await clientTypeRepository.findAndCountByCreatedCompanies(
    [companyId, systemCompanyId],
    filters,
    { limit, offset },
    order
  );
  return {
    clientTypes: rows.map((row) => toTenantClientTypeDto(row, companyId)),
    total: count
  };
};

/**
 * @param {string} currentCompanyId
 * @param {Object} [opts]
 * @returns {Promise<Object[]>}
 */
export const listAllClientTypesForDropdown = async (currentCompanyId, opts = {}) => {
  const { search, requestId, isActive } = opts;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (currentCompanyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin client type APIs when operating in the system company', {
      requestId
    });
  }
  const filterPayload = { search };
  if (isActive !== undefined) {
    filterPayload.isActive = isActive;
  }
  const rows = await clientTypeRepository.findAllForCompanyDropdown(
    currentCompanyId,
    systemCompanyId,
    filterPayload
  );
  return rows.map(toDto);
};

/**
 * @param {string} id
 * @param {Object} data
 * @param {Object} context
 * @param {string} tenantCompanyId
 * @returns {Promise<Object>}
 */
export const updateClientTypeForCompany = async (id, data, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await clientTypeRepository.findByIdOrFail(id);
  assertCompanyMayMutateClientType(row, tenantCompanyId, systemCompanyId, { requestId });

  const { clientType, description, isActive } = data;
  if (clientType !== undefined && clientType !== row.clientType) {
    const duplicate = await clientTypeRepository.findOneByClientTypeAndCompany(clientType, tenantCompanyId, id);
    if (duplicate) {
      throw new ConflictError('Client type already exists for this company', {
        field: 'clientType',
        value: clientType
      });
    }
  }

  const updatePayload = {};
  if (clientType !== undefined) updatePayload.clientType = clientType;
  if (description !== undefined) updatePayload.description = description;
  if (isActive !== undefined) updatePayload.isActive = isActive;

  const updated = await clientTypeRepository.update(id, updatePayload, { userId });
  return toDto(updated);
};

/**
 * @param {string} id
 * @param {boolean} isActive
 * @param {Object} context
 * @param {string} tenantCompanyId
 * @returns {Promise<Object>}
 */
export const setClientTypeActiveStatusForCompany = async (id, isActive, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await clientTypeRepository.findByIdOrFail(id);
  assertCompanyMayMutateClientType(row, tenantCompanyId, systemCompanyId, { requestId });

  const updated = await clientTypeRepository.update(id, { isActive: Boolean(isActive) }, { userId });
  return toDto(updated);
};

/**
 * @param {string} id
 * @param {Object} context
 * @param {string} tenantCompanyId
 * @returns {Promise<void>}
 */
export const deleteClientTypeForCompany = async (id, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await clientTypeRepository.findByIdOrFail(id);
  assertCompanyMayMutateClientType(row, tenantCompanyId, systemCompanyId, { requestId });
  await clientTypeRepository.delete(id, { userId });
};
