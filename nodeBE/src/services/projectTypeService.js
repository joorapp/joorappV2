/**
 * @author Bhavesh Venugopal
 * Project Type Service
 * Business logic for project types (scoped by createdCompanyId)
 */

import { createModuleLogger } from '../utils/logger.js';
import { projectTypeRepository } from '../repositories/projectTypeRepository.js';
import { getSuperAdminCompanyId } from './systemCompanyService.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors.js';

const logger = createModuleLogger('projectTypeService');

const SYSTEM_PROJECT_TYPE_FORBIDDEN_MSG =
  'This project type is managed by the platform and cannot be edited or deleted from your company.';

/**
 * @param {Object} row
 * @returns {Object}
 */
const toDto = (row) => ({
  id: row.id,
  projectType: row.projectType,
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
const toTenantProjectTypeDto = (row, tenantCompanyId) => ({
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
    throw new NotFoundError('ProjectType', row?.id ?? null);
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
const assertCompanyMayMutateProjectType = (row, tenantCompanyId, systemCompanyId, context = {}) => {
  if (row.createdCompanyId === systemCompanyId && tenantCompanyId !== systemCompanyId) {
    throw new ForbiddenError(SYSTEM_PROJECT_TYPE_FORBIDDEN_MSG, {
      reason: 'SYSTEM_PROJECT_TYPE',
      projectTypeId: row.id,
      ...context
    });
  }
  assertOwnedByCompany(row, tenantCompanyId);
};

/**
 * @param {Object} data - { projectType, description?, isActive? }
 * @param {Object} context - { userId, companyId }
 * @returns {Promise<Object>}
 */
export const createProjectType = async (data, context) => {
  const { projectType, description, isActive = true } = data;
  const { userId, companyId } = context;

  logger.debug('Creating project type', { projectType, companyId });

  const duplicate = await projectTypeRepository.findOneByTypeAndCompany(projectType, companyId);
  if (duplicate) {
    throw new ConflictError('Project type already exists for this company', {
      field: 'projectType',
      value: projectType
    });
  }

  const row = await projectTypeRepository.create(
    {
      projectType,
      description: description ?? null,
      isActive
    },
    { userId, companyId }
  );

  logger.info('Project type created', { id: row.id, companyId });
  return toDto(row);
};

/**
 * @param {string} id
 * @param {string} companyId
 * @param {Object} [opts]
 * @returns {Promise<Object>}
 */
export const getProjectTypeByIdForCompany = async (id, companyId, opts = {}) => {
  const { requestId, workspace = 'company' } = opts;

  if (workspace === 'superAdmin') {
    const row = await projectTypeRepository.findByIdOrFail(id);
    assertOwnedByCompany(row, companyId);
    return toDto(row);
  }

  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (companyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin project type APIs when operating in the system company', {
      requestId
    });
  }
  const row = await projectTypeRepository.findByIdOrFail(id);
  if (!isVisibleToTenant(row, companyId, systemCompanyId)) {
    throw new NotFoundError('ProjectType', id);
  }
  return toTenantProjectTypeDto(row, companyId);
};

/**
 * @param {string} companyId
 * @param {Object} filters
 * @param {Object} pagination
 * @param {Array} order
 * @param {Object} [opts]
 * @returns {Promise<{ projectTypes: Object[], total: number }>}
 */
export const listProjectTypesForCompany = async (companyId, filters, pagination, order, opts = {}) => {
  const { requestId, workspace = 'company' } = opts;
  const { limit, offset } = pagination;

  if (workspace === 'superAdmin') {
    const { rows, count } = await projectTypeRepository.findAndCountByCreatedCompany(
      companyId,
      filters,
      { limit, offset },
      order
    );
    return {
      projectTypes: rows.map(toDto),
      total: count
    };
  }

  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (companyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin project type APIs when operating in the system company', {
      requestId
    });
  }
  const { rows, count } = await projectTypeRepository.findAndCountByCreatedCompanies(
    [companyId, systemCompanyId],
    filters,
    { limit, offset },
    order
  );
  return {
    projectTypes: rows.map((row) => toTenantProjectTypeDto(row, companyId)),
    total: count
  };
};

/**
 * @param {string} currentCompanyId
 * @param {Object} [opts]
 * @returns {Promise<Object[]>}
 */
export const listAllProjectTypesForDropdown = async (currentCompanyId, opts = {}) => {
  const { search, requestId, isActive } = opts;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (currentCompanyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin project type APIs when operating in the system company', {
      requestId
    });
  }
  const filterPayload = { search };
  if (isActive !== undefined) {
    filterPayload.isActive = isActive;
  }
  const rows = await projectTypeRepository.findAllForCompanyDropdown(
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
export const updateProjectTypeForCompany = async (id, data, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await projectTypeRepository.findByIdOrFail(id);
  assertCompanyMayMutateProjectType(row, tenantCompanyId, systemCompanyId, { requestId });

  const { projectType, description, isActive } = data;
  if (projectType !== undefined && projectType !== row.projectType) {
    const duplicate = await projectTypeRepository.findOneByTypeAndCompany(projectType, tenantCompanyId, id);
    if (duplicate) {
      throw new ConflictError('Project type already exists for this company', {
        field: 'projectType',
        value: projectType
      });
    }
  }

  const updatePayload = {};
  if (projectType !== undefined) updatePayload.projectType = projectType;
  if (description !== undefined) updatePayload.description = description;
  if (isActive !== undefined) updatePayload.isActive = isActive;

  const updated = await projectTypeRepository.update(id, updatePayload, { userId });
  return toDto(updated);
};

/**
 * @param {string} id
 * @param {boolean} isActive
 * @param {Object} context
 * @param {string} tenantCompanyId
 * @returns {Promise<Object>}
 */
export const setProjectTypeActiveStatusForCompany = async (id, isActive, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await projectTypeRepository.findByIdOrFail(id);
  assertCompanyMayMutateProjectType(row, tenantCompanyId, systemCompanyId, { requestId });

  const updated = await projectTypeRepository.update(id, { isActive: Boolean(isActive) }, { userId });
  return toDto(updated);
};

/**
 * @param {string} id
 * @param {Object} context
 * @param {string} tenantCompanyId
 * @returns {Promise<void>}
 */
export const deleteProjectTypeForCompany = async (id, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await projectTypeRepository.findByIdOrFail(id);
  assertCompanyMayMutateProjectType(row, tenantCompanyId, systemCompanyId, { requestId });
  await projectTypeRepository.delete(id, { userId });
};
