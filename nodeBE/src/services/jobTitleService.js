/**
 * @author Bhavesh Venugopal
 * Job Title Service
 * Business logic for job titles (scoped by createdCompanyId)
 */

import { createModuleLogger } from '../utils/logger.js';
import { jobTitleRepository } from '../repositories/jobTitleRepository.js';
import { getSuperAdminCompanyId } from './systemCompanyService.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors.js';

const logger = createModuleLogger('jobTitleService');

/** Message when a company admin tries to mutate a system-owned job title */
const SYSTEM_JOB_TITLE_FORBIDDEN_MSG =
  'This job title is managed by the platform and cannot be edited or deleted from your company.';

/**
 * Map model to API DTO
 * @param {Object} row - Sequelize instance
 * @returns {Object}
 */
const toDto = (row) => ({
  id: row.id,
  jobTitle: row.jobTitle,
  description: row.description,
  isActive: row.isActive,
  createdDate: row.createdDate,
  updatedDate: row.updatedDate,
  version: row.version
});

/**
 * Company-admin list/detail DTO: includes UI flags (system-owned titles are read-only)
 * @param {Object} row
 * @param {string} tenantCompanyId - Current company context
 * @returns {Object}
 */
const toTenantJobTitleDto = (row, tenantCompanyId) => ({
  ...toDto(row),
  canEdit: row.createdCompanyId === tenantCompanyId,
  canDelete: row.createdCompanyId === tenantCompanyId
});

/**
 * Ensure row belongs to expected company or throw NotFoundError
 * @param {Object} row - JobTitle instance
 * @param {string} expectedCompanyId
 * @throws {NotFoundError}
 */
const assertOwnedByCompany = (row, expectedCompanyId) => {
  if (!row || row.createdCompanyId !== expectedCompanyId) {
    throw new NotFoundError('JobTitle', row?.id ?? null);
  }
};

/**
 * Company may read job title if owned by tenant or by system company
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
 * @throws {ForbiddenError}
 */
const assertCompanyMayMutateJobTitle = (row, tenantCompanyId, systemCompanyId, context = {}) => {
  if (row.createdCompanyId === systemCompanyId && tenantCompanyId !== systemCompanyId) {
    throw new ForbiddenError(SYSTEM_JOB_TITLE_FORBIDDEN_MSG, {
      reason: 'SYSTEM_JOB_TITLE',
      jobTitleId: row.id,
      ...context
    });
  }
  assertOwnedByCompany(row, tenantCompanyId);
};

/**
 * Create job title for an owning company
 * @param {Object} data - { jobTitle, description?, isActive? }
 * @param {Object} context - { userId, companyId }
 * @returns {Promise<Object>} DTO
 */
export const createJobTitle = async (data, context) => {
  const { jobTitle, description, isActive = true } = data;
  const { userId, companyId } = context;

  logger.debug('Creating job title', { jobTitle, companyId });

  const duplicate = await jobTitleRepository.findOneByTitleAndCompany(jobTitle, companyId);
  if (duplicate) {
    throw new ConflictError('Job title already exists for this company', {
      field: 'jobTitle',
      value: jobTitle
    });
  }

  const row = await jobTitleRepository.create(
    {
      jobTitle,
      description: description ?? null,
      isActive
    },
    { userId, companyId }
  );

  logger.info('Job title created', { id: row.id, companyId });
  return toDto(row);
};

/**
 * Get by id — company workspace (tenant + system defaults, with flags) or super-admin workspace (plain DTO)
 * @param {string} id
 * @param {string} companyId - Tenant company id or super-admin company id
 * @param {Object} [opts]
 * @param {string} [opts.requestId]
 * @param {'company'|'superAdmin'} [opts.workspace='company']
 * @returns {Promise<Object>}
 */
export const getJobTitleByIdForCompany = async (id, companyId, opts = {}) => {
  const { requestId, workspace = 'company' } = opts;

  if (workspace === 'superAdmin') {
    const row = await jobTitleRepository.findByIdOrFail(id);
    assertOwnedByCompany(row, companyId);
    return toDto(row);
  }

  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (companyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin job title APIs when operating in the system company', {
      requestId
    });
  }
  const row = await jobTitleRepository.findByIdOrFail(id);
  if (!isVisibleToTenant(row, companyId, systemCompanyId)) {
    throw new NotFoundError('JobTitle', id);
  }
  return toTenantJobTitleDto(row, companyId);
};

/**
 * Paginated list — company workspace merges system + tenant with flags; super-admin workspace lists system company only (plain DTOs)
 * @param {string} companyId
 * @param {Object} filters - { isActive?, search? }
 * @param {Object} pagination - { page, limit, offset }
 * @param {Array} order
 * @param {Object} [opts]
 * @param {string} [opts.requestId]
 * @param {'company'|'superAdmin'} [opts.workspace='company']
 * @returns {Promise<{ jobTitles: Object[], total: number }>}
 */
export const listJobTitlesForCompany = async (companyId, filters, pagination, order, opts = {}) => {
  const { requestId, workspace = 'company' } = opts;
  const { limit, offset } = pagination;

  if (workspace === 'superAdmin') {
    const { rows, count } = await jobTitleRepository.findAndCountByCreatedCompany(
      companyId,
      filters,
      { limit, offset },
      order
    );
    return {
      jobTitles: rows.map(toDto),
      total: count
    };
  }

  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (companyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin job title APIs when operating in the system company', {
      requestId
    });
  }
  const { rows, count } = await jobTitleRepository.findAndCountByCreatedCompanies(
    [companyId, systemCompanyId],
    filters,
    { limit, offset },
    order
  );
  return {
    jobTitles: rows.map((row) => toTenantJobTitleDto(row, companyId)),
    total: count
  };
};

/**
 * Titles for dropdown (super admin company + current company). Optional isActive filter.
 * @param {string} currentCompanyId
 * @param {Object} [opts]
 * @param {string} [opts.search]
 * @param {boolean} [opts.isActive] - Omit for all; true = active only; false = inactive only
 * @param {string} [opts.requestId]
 * @returns {Promise<Object[]>}
 */
export const listAllJobTitlesForDropdown = async (currentCompanyId, opts = {}) => {
  const { search, requestId, isActive } = opts;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (currentCompanyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin job title APIs when operating in the system company', {
      requestId
    });
  }
  const filterPayload = { search };
  if (isActive !== undefined) {
    filterPayload.isActive = isActive;
  }
  const rows = await jobTitleRepository.findAllForCompanyDropdown(
    currentCompanyId,
    systemCompanyId,
    filterPayload
  );
  return rows.map(toDto);
};

/**
 * Update job title if owned by tenant (not system-managed)
 * @param {string} id
 * @param {Object} data - partial { jobTitle?, description?, isActive? }
 * @param {Object} context - { userId, requestId? }
 * @param {string} tenantCompanyId
 * @returns {Promise<Object>}
 */
export const updateJobTitleForCompany = async (id, data, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await jobTitleRepository.findByIdOrFail(id);
  assertCompanyMayMutateJobTitle(row, tenantCompanyId, systemCompanyId, { requestId });

  const { jobTitle, description, isActive } = data;
  if (jobTitle !== undefined && jobTitle !== row.jobTitle) {
    const duplicate = await jobTitleRepository.findOneByTitleAndCompany(jobTitle, tenantCompanyId, id);
    if (duplicate) {
      throw new ConflictError('Job title already exists for this company', {
        field: 'jobTitle',
        value: jobTitle
      });
    }
  }

  const updatePayload = {};
  if (jobTitle !== undefined) updatePayload.jobTitle = jobTitle;
  if (description !== undefined) updatePayload.description = description;
  if (isActive !== undefined) updatePayload.isActive = isActive;

  const updated = await jobTitleRepository.update(id, updatePayload, { userId });
  return toDto(updated);
};

/**
 * Update only active status if title is tenant-owned (not system-managed)
 * @param {string} id
 * @param {boolean} isActive
 * @param {Object} context - { userId, requestId? }
 * @param {string} tenantCompanyId
 * @returns {Promise<Object>}
 */
export const setJobTitleActiveStatusForCompany = async (id, isActive, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await jobTitleRepository.findByIdOrFail(id);
  assertCompanyMayMutateJobTitle(row, tenantCompanyId, systemCompanyId, { requestId });

  const updated = await jobTitleRepository.update(id, { isActive: Boolean(isActive) }, { userId });
  return toDto(updated);
};

/**
 * Soft delete if tenant-owned (not system-managed)
 * @param {string} id
 * @param {Object} context - { userId, requestId? }
 * @param {string} tenantCompanyId
 * @returns {Promise<void>}
 */
export const deleteJobTitleForCompany = async (id, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await jobTitleRepository.findByIdOrFail(id);
  assertCompanyMayMutateJobTitle(row, tenantCompanyId, systemCompanyId, { requestId });
  await jobTitleRepository.delete(id, { userId });
};
