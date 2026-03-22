/**
 * @author Bhavesh Venugopal
 * Employee service — company-scoped CRUD
 */

import { UniqueConstraintError } from 'sequelize';
import { createModuleLogger } from '../utils/logger.js';
import { employeeRepository } from '../repositories/employeeRepository.js';
import { jobTitleRepository } from '../repositories/jobTitleRepository.js';
import { JobTitle } from '../models/index.js';
import { getSuperAdminCompanyId } from './systemCompanyService.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors.js';
import * as userService from './userService.js';
import * as companyUserService from './companyUserService.js';
import { companyUserRepository } from '../repositories/companyUserRepository.js';
import { KEYCLOAK_GLOBAL_ROLE_DEFAULT } from '../constants/keycloakRoles.js';

const logger = createModuleLogger('employeeService');

/** Default Keycloak password when provisioning employee login (realm policy may override) */
export const EMPLOYEE_LOGIN_DEFAULT_PASSWORD = 'admin';

/**
 * Normalize email for storage and uniqueness (matches DB index LOWER(TRIM(email)))
 * @param {string} email
 * @returns {string}
 */
export const normalizeEmployeeEmail = (email) => String(email).trim().toLowerCase();

/**
 * @param {Object} row - Sequelize Employee with optional jobTitle include
 * @returns {Object}
 */
const toDto = (row) => ({
  id: row.id,
  firstName: row.firstName,
  lastName: row.lastName,
  email: row.email,
  phone: row.phone,
  employeeMetadata: row.employeeMetadata ?? {},
  jobTitleId: row.jobTitleId,
  salary: row.salary,
  isActive: row.isActive,
  companyUserId: row.companyUserId ?? null,
  createdDate: row.createdDate,
  updatedDate: row.updatedDate,
  version: row.version,
  jobTitle: row.jobTitle
    ? {
        id: row.jobTitle.id,
        jobTitle: row.jobTitle.jobTitle,
        description: row.jobTitle.description,
        isActive: row.jobTitle.isActive
      }
    : null
});

const assertOwnedByCompany = (row, companyId) => {
  if (!row || row.createdCompanyId !== companyId) {
    throw new NotFoundError('Employee', row?.id ?? null);
  }
};

/**
 * Job title must be owned by tenant or super-admin company and be active
 * @param {string} jobTitleId
 * @param {string} tenantCompanyId
 * @param {Object} opts
 * @param {string} [opts.requestId]
 * @returns {Promise<void>}
 */
export const assertAssignableJobTitle = async (jobTitleId, tenantCompanyId, opts = {}) => {
  const { requestId } = opts;
  const systemCompanyId = await getSuperAdminCompanyId({ requestId });
  const jt = await jobTitleRepository.findByIdOrFail(jobTitleId);
  const okOwner =
    jt.createdCompanyId === tenantCompanyId || jt.createdCompanyId === systemCompanyId;
  if (!okOwner) {
    throw new BadRequestError('Invalid job title for this company', {
      requestId,
      jobTitleId
    });
  }
  if (!jt.isActive) {
    throw new BadRequestError('Cannot assign an inactive job title', {
      requestId,
      jobTitleId
    });
  }
};

const includeJobTitle = {
  model: JobTitle,
  as: 'jobTitle',
  attributes: ['id', 'jobTitle', 'description', 'isActive']
};

/**
 * @param {Object} data
 * @param {Object} context - { userId, companyId }
 * @param {Object} [opts]
 * @param {string} [opts.requestId]
 * @returns {Promise<Object>}
 */
export const createEmployee = async (data, context, opts = {}) => {
  const { userId, companyId } = context;
  const {
    firstName,
    lastName,
    email,
    phone,
    employeeMetadata,
    jobTitleId,
    salary,
    isActive = true
  } = data;

  await assertAssignableJobTitle(jobTitleId, companyId, opts);

  const normalizedEmail = normalizeEmployeeEmail(email);
  const dup = await employeeRepository.findOneByCompanyAndEmail(companyId, normalizedEmail);
  if (dup) {
    throw new ConflictError('An employee with this email already exists in this company', {
      field: 'email',
      value: email
    });
  }

  try {
    const row = await employeeRepository.create(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone != null && phone !== '' ? String(phone).trim() : null,
        employeeMetadata: employeeMetadata && typeof employeeMetadata === 'object' ? employeeMetadata : {},
        jobTitleId,
        salary: salary === undefined || salary === null ? null : Number(salary),
        isActive
      },
      { userId, companyId }
    );
    const full = await employeeRepository.findByIdOrFail(row.id, { include: [includeJobTitle] });
    logger.info('Employee created', { id: full.id, companyId });
    return toDto(full);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new ConflictError('An employee with this email already exists in this company', {
        field: 'email',
        value: email
      });
    }
    throw err;
  }
};

/**
 * @param {string} id
 * @param {string} companyId
 * @returns {Promise<Object>}
 */
export const getEmployeeById = async (id, companyId) => {
  const row = await employeeRepository.findByIdOrFail(id, { include: [includeJobTitle] });
  assertOwnedByCompany(row, companyId);
  return toDto(row);
};

/**
 * @param {string} companyId
 * @param {Object} filters - { search?, jobTitleId?, isActive? }
 * @param {Object} pagination - { page, limit, offset }
 * @param {Array} order
 * @returns {Promise<{ employees: Object[], total: number }>}
 */
export const listEmployeesForCompany = async (companyId, filters, pagination, order) => {
  const { limit, offset } = pagination;
  const { rows, count } = await employeeRepository.findAndCountByCompany(
    companyId,
    filters,
    { limit, offset },
    order
  );
  return {
    employees: rows.map(toDto),
    total: count
  };
};

/**
 * @param {string} companyId
 * @param {Object} filters
 * @param {Array} order
 * @returns {Promise<Object[]>}
 */
export const listAllEmployeesForCompany = async (companyId, filters, order) => {
  const rows = await employeeRepository.findAllByCompany(companyId, filters, order);
  return rows.map(toDto);
};

/**
 * @param {string} id
 * @param {Object} data
 * @param {Object} context - { userId, companyId }
 * @param {Object} [opts]
 * @returns {Promise<Object>}
 */
export const updateEmployee = async (id, data, context, opts = {}) => {
  const { userId, companyId } = context;
  const row = await employeeRepository.findByIdOrFail(id, { include: [includeJobTitle] });
  assertOwnedByCompany(row, companyId);

  const {
    firstName,
    lastName,
    email,
    phone,
    employeeMetadata,
    jobTitleId,
    salary,
    isActive
  } = data;

  if (jobTitleId !== undefined && jobTitleId !== row.jobTitleId) {
    await assertAssignableJobTitle(jobTitleId, companyId, opts);
  }

  let normalizedEmail;
  if (email !== undefined) {
    normalizedEmail = normalizeEmployeeEmail(email);
    const dup = await employeeRepository.findOneByCompanyAndEmail(companyId, normalizedEmail, id);
    if (dup) {
      throw new ConflictError('An employee with this email already exists in this company', {
        field: 'email',
        value: email
      });
    }
  }

  const updatePayload = {};
  if (firstName !== undefined) updatePayload.firstName = firstName.trim();
  if (lastName !== undefined) updatePayload.lastName = lastName.trim();
  if (email !== undefined) updatePayload.email = normalizedEmail;
  if (phone !== undefined) {
    updatePayload.phone = phone != null && phone !== '' ? String(phone).trim() : null;
  }
  if (employeeMetadata !== undefined) {
    updatePayload.employeeMetadata =
      employeeMetadata && typeof employeeMetadata === 'object' ? employeeMetadata : {};
  }
  if (jobTitleId !== undefined) updatePayload.jobTitleId = jobTitleId;
  if (salary !== undefined) {
    updatePayload.salary = salary === null || salary === '' ? null : Number(salary);
  }
  if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);

  try {
    await employeeRepository.update(id, updatePayload, { userId });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new ConflictError('An employee with this email already exists in this company', {
        field: 'email',
        value: email
      });
    }
    throw err;
  }

  const full = await employeeRepository.findByIdOrFail(id, { include: [includeJobTitle] });
  return toDto(full);
};

/**
 * @param {string} id
 * @param {boolean} isActive
 * @param {Object} context - { userId, companyId }
 * @returns {Promise<Object>}
 */
export const setEmployeeActiveStatus = async (id, isActive, context) => {
  const { userId, companyId } = context;
  const row = await employeeRepository.findByIdOrFail(id, { include: [includeJobTitle] });
  assertOwnedByCompany(row, companyId);
  await employeeRepository.update(id, { isActive: Boolean(isActive) }, { userId });
  const full = await employeeRepository.findByIdOrFail(id, { include: [includeJobTitle] });
  return toDto(full);
};

/**
 * @param {string} id
 * @param {Object} context - { userId, companyId }
 * @returns {Promise<void>}
 */
export const deleteEmployee = async (id, context) => {
  const { userId, companyId } = context;
  const row = await employeeRepository.findByIdOrFail(id);
  assertOwnedByCompany(row, companyId);
  await employeeRepository.delete(id, { userId });
};

/**
 * Assign or update company role for an employee (provision Keycloak + User + CompanyUser on first use).
 * If employee.companyUserId is set, loads that CompanyUser and updates companyRoleId only.
 * @param {string} employeeId
 * @param {string} roleId - company_roles.id (master role)
 * @param {Object} context - { userId, companyId }
 * @param {Object} [opts]
 * @param {string} [opts.requestId]
 * @returns {Promise<{ employee: Object, companyUser: Object, provisioned: boolean }>}
 */
export const assignEmployeeCompanyRole = async (employeeId, roleId, context, opts = {}) => {
  const { userId, companyId } = context;
  const { requestId } = opts;
  const assignCtx = { userId };

  const employee = await employeeRepository.findByIdOrFail(employeeId, { include: [includeJobTitle] });
  assertOwnedByCompany(employee, companyId);

  if (employee.companyUserId) {
    const companyUser = await companyUserRepository.findByIdOrFail(employee.companyUserId);
    if (companyUser.companyId !== companyId) {
      throw new BadRequestError('Employee company user assignment does not belong to this company', {
        requestId,
        employeeId,
        companyUserId: employee.companyUserId
      });
    }

    const updated = await companyUserService.assignUserToCompany(
      companyUser.userId,
      companyId,
      roleId,
      assignCtx
    );

    const full = await employeeRepository.findByIdOrFail(employeeId, { include: [includeJobTitle] });
    logger.info('Employee company role updated', { employeeId, companyId, roleId });
    return {
      employee: toDto(full),
      companyUser: updated,
      provisioned: false
    };
  }

  const email = employee.email;
  const firstName = employee.firstName;
  const lastName = employee.lastName;

  const kcUser = await userService.checkUserExistsInKeycloak(email);
  let dbUser;

  if (kcUser) {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      dbUser = existingUser;
    } else {
      dbUser = await userService.createUserInDB(
        {
          keycloakId: kcUser.id,
          email,
          firstName,
          lastName,
          keycloakGlobalRole: KEYCLOAK_GLOBAL_ROLE_DEFAULT
        },
        assignCtx
      );
    }
  } else {
    const keycloakUser = await userService.createUserInKeycloak({
      email,
      password: EMPLOYEE_LOGIN_DEFAULT_PASSWORD,
      firstName,
      lastName,
      keycloakGlobalRole: KEYCLOAK_GLOBAL_ROLE_DEFAULT
    });
    dbUser = await userService.createUserInDB(
      {
        keycloakId: keycloakUser.id,
        email,
        firstName,
        lastName,
        keycloakGlobalRole: KEYCLOAK_GLOBAL_ROLE_DEFAULT
      },
      assignCtx
    );
  }

  const assignment = await companyUserService.assignUserToCompany(dbUser.id, companyId, roleId, assignCtx);

  await employeeRepository.update(employeeId, { companyUserId: assignment.id }, { userId });

  const full = await employeeRepository.findByIdOrFail(employeeId, { include: [includeJobTitle] });
  logger.info('Employee provisioned for company login', {
    employeeId,
    companyId,
    userId: dbUser.id,
    companyUserId: assignment.id
  });

  return {
    employee: toDto(full),
    companyUser: assignment,
    provisioned: true
  };
};
