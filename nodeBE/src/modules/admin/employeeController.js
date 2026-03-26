/**
 * @author Bhavesh Venugopal
 * Employee Controller
 * Employee domain endpoints (job titles and future employee APIs)
 */

import { logBusiness } from '../../utils/logger.js';
import { successResponse, paginatedResponse } from '../../utils/responseHelpers.js';
import {
  validateUUID,
  validateRequired,
  validateString,
  validateBoolean,
  validateEmail,
  validateNumber
} from '../../utils/validators.js';
import { buildPaginationQuery, buildSortQuery } from '../../utils/businessHelpers.js';
import { isCompanyAdmin } from '../../constants/keycloakRoles.js';
import { ForbiddenError, BadRequestError } from '../../utils/errors.js';
import * as jobTitleService from '../../services/jobTitleService.js';
import * as employeeService from '../../services/employeeService.js';

/**
 * @param {Object} req
 */
const checkAdminPermission = (req) => {
  if (!req.user || !isCompanyAdmin(req.user.keycloakGlobalRole)) {
    throw new ForbiddenError('Admin access required', { requestId: req.id, userId: req.user?.id });
  }
};

/**
 * @param {Object} req
 * @returns {string} companyId
 */
const requireCompanyContext = (req) => {
  if (!req.company?.id) {
    throw new BadRequestError('Company context required. Select a company first.', { requestId: req.id });
  }
  return req.company.id;
};

/**
 * Create job title for current company
 * @param {Object} req
 * @param {Object} res
 */
export const createJobTitle = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { jobTitle, description, isActive } = req.body;
  validateRequired({ jobTitle }, req.id);
  validateString(jobTitle, 'jobTitle', { minLength: 1, maxLength: 255 }, req.id);
  if (description !== undefined && description !== null) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const created = await jobTitleService.createJobTitle(
    { jobTitle, description, isActive: resolvedActive },
    { userId: req.user.id, companyId }
  );

  logBusiness('Job title created (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    jobTitleId: created.id
  });

  res.status(201).json(successResponse('Job title created successfully', created, {}, req, startTime));
};

/**
 * List job titles for current company (paginated): platform defaults + company titles, with canEdit / canDelete
 * @param {Object} req
 * @param {Object} res
 */
export const listJobTitles = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const sortBy = req.query.sortBy || 'jobTitle';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['jobTitle', 'createdDate', 'isActive'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'jobTitle',
    defaultOrder: 'ASC'
  });

  const result = await jobTitleService.listJobTitlesForCompany(
    companyId,
    { isActive, search },
    { page, limit, offset },
    order,
    { requestId: req.id }
  );

  res.status(200).json(
    paginatedResponse(
      'Job titles retrieved successfully',
      result.jobTitles,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

/**
 * All job titles for dropdowns (super admin defaults + current company)
 * @param {Object} req
 * @param {Object} res
 */
export const listAllJobTitles = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }

  const isActive =
    req.query.isActive !== undefined && req.query.isActive !== ''
      ? req.query.isActive === 'true'
      : undefined;

  const items = await jobTitleService.listAllJobTitlesForDropdown(companyId, {
    search,
    isActive,
    requestId: req.id
  });

  res.status(200).json(successResponse('Job titles retrieved successfully', items, {}, req, startTime));
};

/**
 * Get job title by id (tenant-owned or system default; includes canEdit / canDelete)
 * @param {Object} req
 * @param {Object} res
 */
export const getJobTitleById = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const row = await jobTitleService.getJobTitleByIdForCompany(req.params.id, companyId, {
    requestId: req.id
  });
  res.status(200).json(successResponse('Job title retrieved successfully', row, {}, req, startTime));
};

/**
 * Update job title (current company only)
 * @param {Object} req
 * @param {Object} res
 */
export const updateJobTitle = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const { jobTitle, description, isActive } = req.body;
  const payload = {};
  if (jobTitle !== undefined) {
    validateString(jobTitle, 'jobTitle', { minLength: 1, maxLength: 255 }, req.id);
    payload.jobTitle = jobTitle;
  }
  if (description !== undefined) {
    validateString(description, 'description', { required: false, maxLength: 5000 }, req.id);
    payload.description = description;
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await jobTitleService.updateJobTitleForCompany(
    req.params.id,
    payload,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Job title updated (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    jobTitleId: updated.id
  });

  res.status(200).json(successResponse('Job title updated successfully', updated, {}, req, startTime));
};

/**
 * PATCH active / inactive for job title (current company only)
 * @param {Object} req
 * @param {Object} res
 */
export const patchJobTitleStatus = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await jobTitleService.setJobTitleActiveStatusForCompany(
    req.params.id,
    isActive,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Job title status updated (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    jobTitleId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Job title status updated successfully', updated, {}, req, startTime));
};

/**
 * Delete job title (current company only)
 * @param {Object} req
 * @param {Object} res
 */
export const deleteJobTitle = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  await jobTitleService.deleteJobTitleForCompany(
    req.params.id,
    { userId: req.user.id, requestId: req.id },
    companyId
  );

  logBusiness('Job title deleted (company)', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    jobTitleId: req.params.id
  });

  res.status(200).json(successResponse('Job title deleted successfully', null, {}, req, startTime));
};

// --- Employees (people) — company context ---

/**
 * Parse list filters for employees (search, jobTitleId, isActive)
 * @param {Object} req
 * @returns {{ search?: string, jobTitleId?: string, isActive?: boolean }}
 */
const parseEmployeeListFilters = (req) => {
  const search = req.query.search ? String(req.query.search).trim() : undefined;
  if (search) {
    validateString(search, 'search', { minLength: 1, maxLength: 255 }, req.id);
  }
  let jobTitleId;
  if (req.query.jobTitleId !== undefined && req.query.jobTitleId !== '') {
    validateUUID(req.query.jobTitleId, 'jobTitleId', req.id);
    jobTitleId = req.query.jobTitleId;
  }
  const isActive =
    req.query.isActive !== undefined && req.query.isActive !== ''
      ? req.query.isActive === 'true'
      : undefined;
  const filters = {};
  if (search) filters.search = search;
  if (jobTitleId) filters.jobTitleId = jobTitleId;
  if (isActive !== undefined) filters.isActive = isActive;
  return filters;
};

/**
 * Create employee
 * @param {Object} req
 * @param {Object} res
 */
export const createEmployee = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { firstName, lastName, email, phone, employeeMetadata, jobTitleId, salary, isActive } = req.body;
  validateRequired({ firstName, lastName, email, jobTitleId }, req.id);
  validateString(firstName, 'firstName', { minLength: 1, maxLength: 100 }, req.id);
  validateString(lastName, 'lastName', { minLength: 1, maxLength: 100 }, req.id);
  validateEmail(email, 'email', req.id);
  validateUUID(jobTitleId, 'jobTitleId', req.id);
  if (phone !== undefined && phone !== null && phone !== '') {
    validateString(phone, 'phone', { maxLength: 50 }, req.id);
  }
  let resolvedSalary = null;
  if (salary !== undefined && salary !== null && salary !== '') {
    resolvedSalary = validateNumber(salary, 'salary', { required: true }, req.id);
  }
  let resolvedActive = true;
  if (isActive !== undefined && isActive !== null) {
    resolvedActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const created = await employeeService.createEmployee(
    {
      firstName,
      lastName,
      email,
      phone,
      employeeMetadata,
      jobTitleId,
      salary: resolvedSalary,
      isActive: resolvedActive
    },
    { userId: req.user.id, companyId },
    { requestId: req.id }
  );

  logBusiness('Employee created', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    employeeId: created.id
  });

  res.status(201).json(successResponse('Employee created successfully', created, {}, req, startTime));
};

/**
 * List employees (paginated)
 * @param {Object} req
 * @param {Object} res
 */
export const listEmployees = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { page, limit, offset } = buildPaginationQuery(req.query, { defaultLimit: 10, maxLimit: 100 }, req.id);
  const filters = parseEmployeeListFilters(req);

  const sortBy = req.query.sortBy || 'lastName';
  const sortOrder = req.query.sortOrder || 'ASC';
  const allowedSortFields = ['firstName', 'lastName', 'email', 'createdDate', 'isActive', 'salary'];
  const order = buildSortQuery(sortBy, sortOrder, allowedSortFields, {
    defaultSort: 'lastName',
    defaultOrder: 'ASC'
  });

  const result = await employeeService.listEmployeesForCompany(companyId, filters, { page, limit, offset }, order);

  res.status(200).json(
    paginatedResponse(
      'Employees retrieved successfully',
      result.employees,
      { page, limit, total: result.total },
      {},
      req,
      startTime
    )
  );
};

/**
 * All employees (no pagination) — search + jobTitleId + isActive
 * @param {Object} req
 * @param {Object} res
 */
export const listAllEmployees = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const filters = parseEmployeeListFilters(req);
  const order = [
    ['lastName', 'ASC'],
    ['firstName', 'ASC']
  ];

  const items = await employeeService.listAllEmployeesForCompany(companyId, filters, order);
  res.status(200).json(successResponse('Employees retrieved successfully', items, {}, req, startTime));
};

/**
 * Get employee by id
 * @param {Object} req
 * @param {Object} res
 */
export const getEmployeeById = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const row = await employeeService.getEmployeeById(req.params.id, companyId);
  res.status(200).json(successResponse('Employee retrieved successfully', row, {}, req, startTime));
};

/**
 * Update employee
 * @param {Object} req
 * @param {Object} res
 */
export const updateEmployee = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const { firstName, lastName, email, phone, employeeMetadata, jobTitleId, salary, isActive } = req.body;
  const payload = {};
  if (firstName !== undefined) {
    validateString(firstName, 'firstName', { minLength: 1, maxLength: 100 }, req.id);
    payload.firstName = firstName;
  }
  if (lastName !== undefined) {
    validateString(lastName, 'lastName', { minLength: 1, maxLength: 100 }, req.id);
    payload.lastName = lastName;
  }
  if (email !== undefined) {
    validateEmail(email, 'email', req.id);
    payload.email = email;
  }
  if (phone !== undefined) {
    if (phone !== null && phone !== '') {
      validateString(phone, 'phone', { maxLength: 50 }, req.id);
    }
    payload.phone = phone;
  }
  if (employeeMetadata !== undefined) {
    payload.employeeMetadata = employeeMetadata;
  }
  if (jobTitleId !== undefined) {
    validateUUID(jobTitleId, 'jobTitleId', req.id);
    payload.jobTitleId = jobTitleId;
  }
  if (salary !== undefined) {
    if (salary === null || salary === '') {
      payload.salary = null;
    } else {
      payload.salary = validateNumber(salary, 'salary', { required: true }, req.id);
    }
  }
  if (isActive !== undefined) {
    payload.isActive = validateBoolean(isActive, 'isActive', { required: true }, req.id);
  }

  const updated = await employeeService.updateEmployee(
    req.params.id,
    payload,
    { userId: req.user.id, companyId },
    { requestId: req.id }
  );

  logBusiness('Employee updated', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    employeeId: updated.id
  });

  res.status(200).json(successResponse('Employee updated successfully', updated, {}, req, startTime));
};

/**
 * PATCH active / inactive only
 * @param {Object} req
 * @param {Object} res
 */
export const patchEmployeeStatus = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  const isActive = validateBoolean(req.body.isActive, 'isActive', { required: true }, req.id);

  const updated = await employeeService.setEmployeeActiveStatus(req.params.id, isActive, {
    userId: req.user.id,
    companyId
  });

  logBusiness('Employee status updated', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    employeeId: updated.id,
    isActive
  });

  res.status(200).json(successResponse('Employee status updated successfully', updated, {}, req, startTime));
};

/**
 * Soft-delete employee
 * @param {Object} req
 * @param {Object} res
 */
export const deleteEmployee = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);
  validateUUID(req.params.id, 'id', req.id);

  await employeeService.deleteEmployee(req.params.id, { userId: req.user.id, companyId });

  logBusiness('Employee deleted', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    employeeId: req.params.id
  });

  res.status(200).json(successResponse('Employee deleted successfully', null, {}, req, startTime));
};

/**
 * Assign company role to employee (first time: Keycloak + User + CompanyUser + link; else role update only)
 * @param {Object} req
 * @param {Object} res
 */
export const assignEmployeeCompanyRole = async (req, res) => {
  const startTime = Date.now();
  checkAdminPermission(req);
  const companyId = requireCompanyContext(req);

  const { employeeId, roleId } = req.body;
  validateRequired({ employeeId, roleId }, req.id);
  validateUUID(employeeId, 'employeeId', req.id);
  validateUUID(roleId, 'roleId', req.id);

  const result = await employeeService.assignEmployeeCompanyRole(
    employeeId,
    roleId,
    { userId: req.user.id, companyId },
    { requestId: req.id }
  );

  logBusiness('Employee company role assigned', {
    requestId: req.id,
    userId: req.user.id,
    companyId,
    employeeId,
    roleId,
    provisioned: result.provisioned
  });

  const message = result.provisioned
    ? 'Employee enabled for login and role assigned successfully'
    : 'Employee company role updated successfully';

  res.status(200).json(successResponse(message, result, {}, req, startTime));
};
