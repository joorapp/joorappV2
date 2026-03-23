/**
 * @author Bhavesh Venugopal
 * Project Category Service
 * Business logic for project categories (scoped by createdCompanyId)
 */

import { createModuleLogger } from '../utils/logger.js';
import { projectCategoryRepository } from '../repositories/projectCategoryRepository.js';
import { getSuperAdminCompanyId } from './systemCompanyService.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors.js';

const logger = createModuleLogger('projectCategoryService');

const SYSTEM_PROJECT_CATEGORY_FORBIDDEN_MSG =
  'This project category is managed by the platform and cannot be edited or deleted from your company.';

const toDto = (row) => ({
  id: row.id,
  projectCategory: row.projectCategory,
  description: row.description,
  isActive: row.isActive,
  createdDate: row.createdDate,
  updatedDate: row.updatedDate,
  version: row.version
});

const toTenantProjectCategoryDto = (row, tenantCompanyId) => ({
  ...toDto(row),
  canEdit: row.createdCompanyId === tenantCompanyId,
  canDelete: row.createdCompanyId === tenantCompanyId
});

const assertOwnedByCompany = (row, expectedCompanyId) => {
  if (!row || row.createdCompanyId !== expectedCompanyId) {
    throw new NotFoundError('ProjectCategory', row?.id ?? null);
  }
};

const isVisibleToTenant = (row, tenantCompanyId, systemCompanyId) =>
  row.createdCompanyId === tenantCompanyId || row.createdCompanyId === systemCompanyId;

const assertCompanyMayMutateProjectCategory = (row, tenantCompanyId, systemCompanyId, context = {}) => {
  if (row.createdCompanyId === systemCompanyId && tenantCompanyId !== systemCompanyId) {
    throw new ForbiddenError(SYSTEM_PROJECT_CATEGORY_FORBIDDEN_MSG, {
      reason: 'SYSTEM_PROJECT_CATEGORY',
      projectCategoryId: row.id,
      ...context
    });
  }
  assertOwnedByCompany(row, tenantCompanyId);
};

export const createProjectCategory = async (data, context) => {
  const { projectCategory, description, isActive = true } = data;
  const { userId, companyId } = context;

  logger.debug('Creating project category', { projectCategory, companyId });

  const duplicate = await projectCategoryRepository.findOneByCategoryAndCompany(projectCategory, companyId);
  if (duplicate) {
    throw new ConflictError('Project category already exists for this company', {
      field: 'projectCategory',
      value: projectCategory
    });
  }

  const row = await projectCategoryRepository.create(
    {
      projectCategory,
      description: description ?? null,
      isActive
    },
    { userId, companyId }
  );

  logger.info('Project category created', { id: row.id, companyId });
  return toDto(row);
};

export const getProjectCategoryByIdForCompany = async (id, companyId, opts = {}) => {
  const { requestId, workspace = 'company' } = opts;

  if (workspace === 'superAdmin') {
    const row = await projectCategoryRepository.findByIdOrFail(id);
    assertOwnedByCompany(row, companyId);
    return toDto(row);
  }

  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (companyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin project category APIs when operating in the system company', {
      requestId
    });
  }
  const row = await projectCategoryRepository.findByIdOrFail(id);
  if (!isVisibleToTenant(row, companyId, systemCompanyId)) {
    throw new NotFoundError('ProjectCategory', id);
  }
  return toTenantProjectCategoryDto(row, companyId);
};

export const listProjectCategoriesForCompany = async (companyId, filters, pagination, order, opts = {}) => {
  const { requestId, workspace = 'company' } = opts;
  const { limit, offset } = pagination;

  if (workspace === 'superAdmin') {
    const { rows, count } = await projectCategoryRepository.findAndCountByCreatedCompany(
      companyId,
      filters,
      { limit, offset },
      order
    );
    return {
      projectCategories: rows.map(toDto),
      total: count
    };
  }

  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (companyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin project category APIs when operating in the system company', {
      requestId
    });
  }
  const { rows, count } = await projectCategoryRepository.findAndCountByCreatedCompanies(
    [companyId, systemCompanyId],
    filters,
    { limit, offset },
    order
  );
  return {
    projectCategories: rows.map((row) => toTenantProjectCategoryDto(row, companyId)),
    total: count
  };
};

export const listAllProjectCategoriesForDropdown = async (currentCompanyId, opts = {}) => {
  const { search, requestId, isActive } = opts;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  if (currentCompanyId === systemCompanyId) {
    throw new ForbiddenError('Use super admin project category APIs when operating in the system company', {
      requestId
    });
  }
  const filterPayload = { search };
  if (isActive !== undefined) {
    filterPayload.isActive = isActive;
  }
  const rows = await projectCategoryRepository.findAllForCompanyDropdown(
    currentCompanyId,
    systemCompanyId,
    filterPayload
  );
  return rows.map(toDto);
};

export const updateProjectCategoryForCompany = async (id, data, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await projectCategoryRepository.findByIdOrFail(id);
  assertCompanyMayMutateProjectCategory(row, tenantCompanyId, systemCompanyId, { requestId });

  const { projectCategory, description, isActive } = data;
  if (projectCategory !== undefined && projectCategory !== row.projectCategory) {
    const duplicate = await projectCategoryRepository.findOneByCategoryAndCompany(
      projectCategory,
      tenantCompanyId,
      id
    );
    if (duplicate) {
      throw new ConflictError('Project category already exists for this company', {
        field: 'projectCategory',
        value: projectCategory
      });
    }
  }

  const updatePayload = {};
  if (projectCategory !== undefined) updatePayload.projectCategory = projectCategory;
  if (description !== undefined) updatePayload.description = description;
  if (isActive !== undefined) updatePayload.isActive = isActive;

  const updated = await projectCategoryRepository.update(id, updatePayload, { userId });
  return toDto(updated);
};

export const setProjectCategoryActiveStatusForCompany = async (id, isActive, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await projectCategoryRepository.findByIdOrFail(id);
  assertCompanyMayMutateProjectCategory(row, tenantCompanyId, systemCompanyId, { requestId });

  const updated = await projectCategoryRepository.update(id, { isActive: Boolean(isActive) }, { userId });
  return toDto(updated);
};

export const deleteProjectCategoryForCompany = async (id, context, tenantCompanyId) => {
  const { userId, requestId } = context;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const row = await projectCategoryRepository.findByIdOrFail(id);
  assertCompanyMayMutateProjectCategory(row, tenantCompanyId, systemCompanyId, { requestId });
  await projectCategoryRepository.delete(id, { userId });
};
