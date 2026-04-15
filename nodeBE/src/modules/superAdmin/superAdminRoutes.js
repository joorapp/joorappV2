/**
 * @author Bhavesh Venugopal
 * Super Admin Routes
 * Defines API endpoints for super admin functionality
 */

import express from 'express';
import {
  getUserInfo,
  getDashboard,
  // Company Management
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  // Role Management
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  // Plan Management
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  // User Management
  createUserWithCompany,
  getUsers,
  getUserById,
  updateUser,
  disableUser,
  enableUser,
  assignUserToCompany,
  updateUserCompanyRole,
  createSuperAdminJobTitle,
  listSuperAdminJobTitles,
  getSuperAdminJobTitleById,
  updateSuperAdminJobTitle,
  patchSuperAdminJobTitleStatus,
  deleteSuperAdminJobTitle,
  createSuperAdminProjectType,
  listSuperAdminProjectTypes,
  getSuperAdminProjectTypeById,
  updateSuperAdminProjectType,
  patchSuperAdminProjectTypeStatus,
  deleteSuperAdminProjectType,
  createSuperAdminClientType,
  listSuperAdminClientTypes,
  getSuperAdminClientTypeById,
  updateSuperAdminClientType,
  patchSuperAdminClientTypeStatus,
  deleteSuperAdminClientType,
  createSuperAdminProjectCategory,
  listSuperAdminProjectCategories,
  getSuperAdminProjectCategoryById,
  updateSuperAdminProjectCategory,
  patchSuperAdminProjectCategoryStatus,
  deleteSuperAdminProjectCategory
} from './superAdminController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * /api/v2/superAdmin/user-info:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get current authenticated user info
 *     description: Returns information about the currently authenticated user. This endpoint is used to test the authentication middleware and verify user data from Keycloak token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "User info retrieved successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 keycloakId: "7d3ea298-66dc-4ece-90de-c4de111e8b7f"
 *                 email: "admin@example.com"
 *                 firstName: "Super"
 *                 lastName: "Admin"
 *                 keycloakGlobalRole: "SUPER_ADMIN"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/superAdmin/user-info"
 *                 method: "GET"
 *                 duration: 145
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/user-info', authMiddleware, asyncHandler(getUserInfo));

/**
 * @swagger
 * /api/v2/superAdmin/dashboard:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get super admin dashboard data
 *     description: Returns dashboard data for super admin users. This endpoint requires SUPER_ADMIN role and provides system overview information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Super admin dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                           example: 150
 *                         totalCompanies:
 *                           type: number
 *                           example: 25
 *                         activeSessions:
 *                           type: number
 *                           example: 45
 *                         systemStatus:
 *                           type: string
 *                           example: "operational"
 *             example:
 *               success: true
 *               message: "Super admin dashboard retrieved successfully"
 *               data:
 *                 totalUsers: 150
 *                 totalCompanies: 25
 *                 activeSessions: 45
 *                 systemStatus: "operational"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/superAdmin/dashboard"
 *                 method: "GET"
 *                 duration: 234
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/dashboard', authMiddleware, asyncHandler(getDashboard));

// =====================================================
// Company Management Routes
// =====================================================

/**
 * @swagger
 * /api/v2/superAdmin/companies:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Create new company and admin user
 *     description: Allows super admins to create a new company in the system. Simultaneously creates a user with COMPANY_ADMIN role associated with the newly created company, using the email provided in the company creation request.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyCreateRequest'
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Company'
 *             example:
 *               success: true
 *               message: "Company created successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440001"
 *                 name: "Acme Corporation"
 *                 description: "Leading provider of innovative solutions"
 *                 isActive: true
 *                 status: "NEW"
 *                 email: "contact@acme.com"
 *                 phone: "+1 234-567-8900"
 *                 buildingAddress: "Suite 100"
 *                 streetAddress: "123 Main Street"
 *                 city: "New York"
 *                 state: "NY"
 *                 postalCode: "10001"
 *                 country: "United States"
 *                 plan:
 *                   id: "550e8400-e29b-41d4-a716-446655440003"
 *                   name: "Basic"
 *                   code: "BASIC"
 *                   description: "Basic subscription plan"
 *                   price: 0.00
 *                   isActive: true
 *                   createdDate: "2024-11-23T12:00:00.000Z"
 *                   updatedDate: "2024-11-23T12:00:00.000Z"
 *                   version: 1
 *                 createdDate: "2024-11-23T12:00:00.000Z"
 *                 createdUserId: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/superAdmin/companies"
 *                 method: "POST"
 *                 duration: 245
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/companies', authMiddleware, asyncHandler(createCompany));

/**
 * @swagger
 * /api/v2/superAdmin/companies:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get all companies with pagination and filtering
 *     description: Returns a paginated list of companies with optional search, filtering, and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for company name
 *         example: "Acme"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdDate, isActive]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 *             example:
 *               success: true
 *               message: "Companies retrieved successfully"
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440001"
 *                   name: "Acme Corporation"
 *                   description: "Leading provider"
 *                   isActive: true
 *                   status: "ACTIVE"
 *                   email: "contact@acme.com"
 *                   phone: "+1 234-567-8900"
 *                   buildingAddress: "Suite 100"
 *                   streetAddress: "123 Main Street"
 *                   city: "New York"
 *                   state: "NY"
 *                   postalCode: "10001"
 *                   country: "United States"
 *                   plan:
 *                     id: "550e8400-e29b-41d4-a716-446655440003"
 *                     name: "Basic"
 *                     code: "BASIC"
 *                     description: "Basic subscription plan"
 *                     price: 0.00
 *                     isActive: true
 *                     createdDate: "2024-11-23T12:00:00.000Z"
 *                     updatedDate: "2024-11-23T12:00:00.000Z"
 *                     version: 1
 *                   createdDate: "2024-11-23T12:00:00.000Z"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/superAdmin/companies"
 *                 method: "GET"
 *                 duration: 145
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 25
 *                   totalPages: 3
 *                   hasNext: true
 *                   hasPrevious: false
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/companies', authMiddleware, asyncHandler(getCompanies));

/**
 * @swagger
 * /api/v2/superAdmin/companies/{id}:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get company by ID
 *     description: Returns detailed information about a specific company. Logo is only included when includeLogo query parameter is set to true (lazy loading).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *       - in: query
 *         name: includeLogo
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include logo in response (lazy loading)
 *         example: true
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Company'
 *             example:
 *               success: true
 *               message: "Company retrieved successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440001"
 *                 name: "Acme Corporation"
 *                 description: "Leading provider"
 *                 isActive: true
 *                 status: "ACTIVE"
 *                 email: "contact@acme.com"
 *                 phone: "+1 234-567-8900"
 *                 buildingAddress: "Suite 100"
 *                 streetAddress: "123 Main Street"
 *                 city: "New York"
 *                 state: "NY"
 *                 postalCode: "10001"
 *                 country: "United States"
 *                 plan:
 *                   id: "550e8400-e29b-41d4-a716-446655440003"
 *                   name: "Basic"
 *                   code: "BASIC"
 *                   description: "Basic subscription plan"
 *                   price: 0.00
 *                   isActive: true
 *                   createdDate: "2024-11-23T12:00:00.000Z"
 *                   updatedDate: "2024-11-23T12:00:00.000Z"
 *                   version: 1
 *                 createdDate: "2024-11-23T12:00:00.000Z"
 *                 createdUserId: "550e8400-e29b-41d4-a716-446655440000"
 *                 updatedDate: "2024-11-23T12:05:00.000Z"
 *                 updatedUserId: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/superAdmin/companies/550e8400-e29b-41d4-a716-446655440001"
 *                 method: "GET"
 *                 duration: 95
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/companies/:id', authMiddleware, asyncHandler(getCompanyById));

/**
 * @swagger
 * /api/v2/superAdmin/companies/{id}:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update company by ID
 *     description: Updates company information. All fields are optional.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyUpdateRequest'
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Company'
 *             example:
 *               success: true
 *               message: "Company updated successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440001"
 *                 name: "Updated Acme Corp"
 *                 description: "Updated description"
 *                 isActive: true
 *                 status: "ACTIVE"
 *                 email: "contact@acme.com"
 *                 phone: "+1 234-567-8900"
 *                 buildingAddress: "Suite 200"
 *                 streetAddress: "456 Oak Avenue"
 *                 city: "Los Angeles"
 *                 state: "CA"
 *                 postalCode: "90001"
 *                 country: "United States"
 *                 plan:
 *                   id: "550e8400-e29b-41d4-a716-446655440003"
 *                   name: "Basic"
 *                   code: "BASIC"
 *                   description: "Basic subscription plan"
 *                   price: 0.00
 *                   isActive: true
 *                   createdDate: "2024-11-23T12:00:00.000Z"
 *                   updatedDate: "2024-11-23T12:00:00.000Z"
 *                   version: 1
 *                 createdDate: "2024-11-23T12:00:00.000Z"
 *                 createdUserId: "550e8400-e29b-41d4-a716-446655440000"
 *                 updatedDate: "2024-11-23T12:05:00.000Z"
 *                 updatedUserId: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-11-23T12:05:00.000Z"
 *               meta:
 *                 requestId: "req-1234567891"
 *                 endpoint: "/api/v2/superAdmin/companies/550e8400-e29b-41d4-a716-446655440001"
 *                 method: "PUT"
 *                 duration: 180
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/companies/:id', authMiddleware, asyncHandler(updateCompany));

/**
 * @swagger
 * /api/v2/superAdmin/companies/{id}:
 *   delete:
 *     tags:
 *       - SuperAdmin
 *     summary: Delete (soft delete) company by ID
 *     description: Marks company as deleted. This is a soft delete operation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: "null"
 *                       example: null
 *             example:
 *               success: true
 *               message: "Company deleted successfully"
 *               data: null
 *               timestamp: "2024-11-23T12:10:00.000Z"
 *               meta:
 *                 requestId: "req-1234567892"
 *                 endpoint: "/api/v2/superAdmin/companies/550e8400-e29b-41d4-a716-446655440001"
 *                 method: "DELETE"
 *                 duration: 135
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/companies/:id', authMiddleware, asyncHandler(deleteCompany));

// =====================================================
// Role Management Routes
// =====================================================

/**
 * @swagger
 * /api/v2/superAdmin/roles:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Create new role
 *     description: Allows super admins to create a new company role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleCreateRequest'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CompanyRole'
 *             example:
 *               success: true
 *               message: "Role created successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440002"
 *                 name: "Project Manager"
 *                 code: "PROJECT_MANAGER"
 *                 description: "Manages projects"
 *                 isActive: true
 *                 createdDate: "2024-11-23T12:00:00.000Z"
 *                 createdBy: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567893"
 *                 endpoint: "/api/v2/superAdmin/roles"
 *                 method: "POST"
 *                 duration: 200
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/roles', authMiddleware, asyncHandler(createRole));

/**
 * @swagger
 * /api/v2/superAdmin/roles:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get all roles with pagination
 *     description: Returns a paginated list of company roles with optional filtering and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/FilterQueryParams'
 *       - $ref: '#/components/parameters/SortByQueryParam'
 *       - $ref: '#/components/parameters/SortOrderQueryParam'
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CompanyRole'
 *             example:
 *               success: true
 *               message: "Roles retrieved successfully"
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440002"
 *                   name: "Project Manager"
 *                   code: "PROJECT_MANAGER"
 *                   description: "Manages projects"
 *                   isActive: true
 *                   createdDate: "2024-11-23T12:00:00.000Z"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567894"
 *                 endpoint: "/api/v2/superAdmin/roles"
 *                 method: "GET"
 *                 duration: 150
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 5
 *                   totalPages: 1
 *                   hasNext: false
 *                   hasPrevious: false
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/roles', authMiddleware, asyncHandler(getRoles));

/**
 * @swagger
 * /api/v2/superAdmin/roles/{id}:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get role by ID
 *     description: Returns detailed information about a specific role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440002"
 *                     name:
 *                       type: string
 *                       example: "Project Manager"
 *                     code:
 *                       type: string
 *                       example: "PROJECT_MANAGER"
 *                     description:
 *                       type: string
 *                       example: "Manages projects"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-23T12:00:00.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-11-23T12:00:00.000Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       example: "req-1234567895"
 *                     endpoint:
 *                       type: string
 *                       example: "/api/v2/superAdmin/roles/550e8400-e29b-41d4-a716-446655440002"
 *                     method:
 *                       type: string
 *                       example: "GET"
 *                     duration:
 *                       type: number
 *                       example: 95
 *             example:
 *               success: true
 *               message: "Role retrieved successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440002"
 *                 name: "Project Manager"
 *                 code: "PROJECT_MANAGER"
 *                 description: "Manages projects"
 *                 isActive: true
 *                 createdDate: "2024-11-23T12:00:00.000Z"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567895"
 *                 endpoint: "/api/v2/superAdmin/roles/550e8400-e29b-41d4-a716-446655440002"
 *                 method: "GET"
 *                 duration: 95
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/roles/:id', authMiddleware, asyncHandler(getRoleById));

/**
 * @swagger
 * /api/v2/superAdmin/roles/{id}:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update role by ID
 *     description: Updates role information. All fields are optional.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleUpdateRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CompanyRole'
 *             example:
 *               success: true
 *               message: "Role updated successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440002"
 *                 name: "Updated Project Manager"
 *                 code: "UPDATED_PM"
 *                 description: "Updated description"
 *                 isActive: true
 *                 lastModifiedDate: "2024-11-23T12:05:00.000Z"
 *                 lastModifiedBy: "550e8400-e29b-41d4-a716-446655440000"
 *               timestamp: "2024-11-23T12:05:00.000Z"
 *               meta:
 *                 requestId: "req-1234567896"
 *                 endpoint: "/api/v2/superAdmin/roles/550e8400-e29b-41d4-a716-446655440002"
 *                 method: "PUT"
 *                 duration: 180
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/roles/:id', authMiddleware, asyncHandler(updateRole));

/**
 * @swagger
 * /api/v2/superAdmin/roles/{id}:
 *   delete:
 *     tags:
 *       - SuperAdmin
 *     summary: Delete (soft delete) role by ID
 *     description: Marks role as deleted. This is a soft delete operation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: "null"
 *                       example: null
 *             example:
 *               success: true
 *               message: "Role deleted successfully"
 *               data: null
 *               timestamp: "2024-11-23T12:10:00.000Z"
 *               meta:
 *                 requestId: "req-1234567897"
 *                 endpoint: "/api/v2/superAdmin/roles/550e8400-e29b-41d4-a716-446655440002"
 *                 method: "DELETE"
 *                 duration: 130
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/roles/:id', authMiddleware, asyncHandler(deleteRole));

// =====================================================
// Job titles (system company defaults)
// =====================================================

/**
 * @swagger
 * /api/v2/superAdmin/job-titles:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Create job title (system company)
 *     description: Creates a default job title owned by the super admin company. Requires SUPER_ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobTitleCreateRequest'
 *     responses:
 *       201:
 *         description: Job title created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobTitle'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/job-titles', authMiddleware, asyncHandler(createSuperAdminJobTitle));

/**
 * @swagger
 * /api/v2/superAdmin/job-titles:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: List job titles (system company, paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - $ref: '#/components/parameters/SortByQueryParam'
 *       - $ref: '#/components/parameters/SortOrderQueryParam'
 *     responses:
 *       200:
 *         description: Job titles retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JobTitle'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/job-titles', authMiddleware, asyncHandler(listSuperAdminJobTitles));

/**
 * @swagger
 * /api/v2/superAdmin/job-titles/{id}:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get job title by ID (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Job title retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobTitle'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/job-titles/:id', authMiddleware, asyncHandler(getSuperAdminJobTitleById));

/**
 * @swagger
 * /api/v2/superAdmin/job-titles/{id}:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update job title (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobTitleUpdateRequest'
 *     responses:
 *       200:
 *         description: Job title updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobTitle'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/job-titles/:id', authMiddleware, asyncHandler(updateSuperAdminJobTitle));

/**
 * @swagger
 * /api/v2/superAdmin/job-titles/{id}/status:
 *   patch:
 *     tags:
 *       - SuperAdmin
 *     summary: Set job title active or inactive (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Job title status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobTitle'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/job-titles/:id/status', authMiddleware, asyncHandler(patchSuperAdminJobTitleStatus));

/**
 * @swagger
 * /api/v2/superAdmin/job-titles/{id}:
 *   delete:
 *     tags:
 *       - SuperAdmin
 *     summary: Delete job title (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Job title deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: 'null'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/job-titles/:id', authMiddleware, asyncHandler(deleteSuperAdminJobTitle));

// =====================================================
// Project types (system company defaults)
// =====================================================

/**
 * @swagger
 * /api/v2/superAdmin/project-types:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Create project type (system company)
 *     description: Creates a default project type owned by the super admin company. Requires SUPER_ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectTypeCreateRequest'
 *     responses:
 *       201:
 *         description: Project type created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectType'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/project-types', authMiddleware, asyncHandler(createSuperAdminProjectType));

/**
 * @swagger
 * /api/v2/superAdmin/project-types:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: List project types (system company, paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - $ref: '#/components/parameters/SortByQueryParam'
 *       - $ref: '#/components/parameters/SortOrderQueryParam'
 *     responses:
 *       200:
 *         description: Project types retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectType'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/project-types', authMiddleware, asyncHandler(listSuperAdminProjectTypes));

/**
 * @swagger
 * /api/v2/superAdmin/project-types/{id}:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get project type by ID (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Project type retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectType'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/project-types/:id', authMiddleware, asyncHandler(getSuperAdminProjectTypeById));

/**
 * @swagger
 * /api/v2/superAdmin/project-types/{id}:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update project type (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectTypeUpdateRequest'
 *     responses:
 *       200:
 *         description: Project type updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectType'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/project-types/:id', authMiddleware, asyncHandler(updateSuperAdminProjectType));

/**
 * @swagger
 * /api/v2/superAdmin/project-types/{id}/status:
 *   patch:
 *     tags:
 *       - SuperAdmin
 *     summary: Set project type active or inactive (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Project type status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectType'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/project-types/:id/status', authMiddleware, asyncHandler(patchSuperAdminProjectTypeStatus));

/**
 * @swagger
 * /api/v2/superAdmin/project-types/{id}:
 *   delete:
 *     tags:
 *       - SuperAdmin
 *     summary: Delete project type (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Project type deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: 'null'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/project-types/:id', authMiddleware, asyncHandler(deleteSuperAdminProjectType));

// =====================================================
// Client types (system company defaults)
// =====================================================

/**
 * @swagger
 * /api/v2/superAdmin/client-types:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Create client type (system company)
 *     description: Creates a default client type owned by the super admin company. Requires SUPER_ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientTypeCreateRequest'
 *     responses:
 *       201:
 *         description: Client type created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ClientType'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/client-types', authMiddleware, asyncHandler(createSuperAdminClientType));

/**
 * @swagger
 * /api/v2/superAdmin/client-types:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: List client types (system company, paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - $ref: '#/components/parameters/SortByQueryParam'
 *       - $ref: '#/components/parameters/SortOrderQueryParam'
 *     responses:
 *       200:
 *         description: Client types retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ClientType'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/client-types', authMiddleware, asyncHandler(listSuperAdminClientTypes));

/**
 * @swagger
 * /api/v2/superAdmin/client-types/{id}:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get client type by ID (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Client type retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ClientType'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/client-types/:id', authMiddleware, asyncHandler(getSuperAdminClientTypeById));

/**
 * @swagger
 * /api/v2/superAdmin/client-types/{id}:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update client type (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientTypeUpdateRequest'
 *     responses:
 *       200:
 *         description: Client type updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ClientType'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/client-types/:id', authMiddleware, asyncHandler(updateSuperAdminClientType));

/**
 * @swagger
 * /api/v2/superAdmin/client-types/{id}/status:
 *   patch:
 *     tags:
 *       - SuperAdmin
 *     summary: Set client type active or inactive (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Client type status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ClientType'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/client-types/:id/status', authMiddleware, asyncHandler(patchSuperAdminClientTypeStatus));

/**
 * @swagger
 * /api/v2/superAdmin/client-types/{id}:
 *   delete:
 *     tags:
 *       - SuperAdmin
 *     summary: Delete client type (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Client type deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: 'null'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/client-types/:id', authMiddleware, asyncHandler(deleteSuperAdminClientType));

// =====================================================
// Project categories (system company defaults)
// =====================================================

/**
 * @swagger
 * /api/v2/superAdmin/project-categories:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Create project category (system company)
 *     description: Creates a default project category owned by the super admin company. Requires SUPER_ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectCategoryCreateRequest'
 *     responses:
 *       201:
 *         description: Project category created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectCategory'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/project-categories', authMiddleware, asyncHandler(createSuperAdminProjectCategory));

/**
 * @swagger
 * /api/v2/superAdmin/project-categories:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: List project categories (system company, paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - $ref: '#/components/parameters/SortByQueryParam'
 *       - $ref: '#/components/parameters/SortOrderQueryParam'
 *     responses:
 *       200:
 *         description: Project categories retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectCategory'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/project-categories', authMiddleware, asyncHandler(listSuperAdminProjectCategories));

/**
 * @swagger
 * /api/v2/superAdmin/project-categories/{id}:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get project category by ID (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Project category retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectCategory'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/project-categories/:id', authMiddleware, asyncHandler(getSuperAdminProjectCategoryById));

/**
 * @swagger
 * /api/v2/superAdmin/project-categories/{id}:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update project category (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectCategoryUpdateRequest'
 *     responses:
 *       200:
 *         description: Project category updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectCategory'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/project-categories/:id', authMiddleware, asyncHandler(updateSuperAdminProjectCategory));

/**
 * @swagger
 * /api/v2/superAdmin/project-categories/{id}/status:
 *   patch:
 *     tags:
 *       - SuperAdmin
 *     summary: Set project category active or inactive (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Project category status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectCategory'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/project-categories/:id/status', authMiddleware, asyncHandler(patchSuperAdminProjectCategoryStatus));

/**
 * @swagger
 * /api/v2/superAdmin/project-categories/{id}:
 *   delete:
 *     tags:
 *       - SuperAdmin
 *     summary: Delete project category (system company)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Project category deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: 'null'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/project-categories/:id', authMiddleware, asyncHandler(deleteSuperAdminProjectCategory));

// =====================================================
// Plan Management Routes
// =====================================================

/**
 * @swagger
 * /api/v2/superAdmin/plans:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Create new plan
 *     description: Allows super admins to create a new subscription/license plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanCreateRequest'
 *     responses:
 *       201:
 *         description: Plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Plan'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/plans', authMiddleware, asyncHandler(createPlan));

/**
 * @swagger
 * /api/v2/superAdmin/plans:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get all plans with pagination
 *     description: Returns a paginated list of plans with optional filtering and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - $ref: '#/components/parameters/SortByQueryParam'
 *       - $ref: '#/components/parameters/SortOrderQueryParam'
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Plan'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/plans', authMiddleware, asyncHandler(getPlans));

/**
 * @swagger
 * /api/v2/superAdmin/plans/{id}:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get plan by ID
 *     description: Returns plan details by UUID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Plan'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/plans/:id', authMiddleware, asyncHandler(getPlanById));

/**
 * @swagger
 * /api/v2/superAdmin/plans/{id}:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update plan by ID
 *     description: Updates plan details by UUID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanUpdateRequest'
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Plan'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/plans/:id', authMiddleware, asyncHandler(updatePlan));

/**
 * @swagger
 * /api/v2/superAdmin/plans/{id}:
 *   delete:
 *     tags:
 *       - SuperAdmin
 *     summary: Delete plan by ID
 *     description: Soft deletes a plan by UUID (cannot delete BASIC plan)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       nullable: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/plans/:id', authMiddleware, asyncHandler(deletePlan));

// =====================================================
// User Management Routes
// =====================================================

/**
 * @swagger
 * /api/v2/superAdmin/users:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Create user with optional company assignment
 *     description: Checks if user exists in Keycloak first. Creates user in Keycloak and database, optionally assigns to company with role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Password (required if new user, min 8 chars)
 *                 example: "SecurePass123!"
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: First name (1-100 chars)
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Last name (1-100 chars)
 *                 example: "Doe"
 *               keycloakGlobalRole:
 *                 type: string
 *                 enum: [SUPER_ADMIN, COMPANY_ADMIN, COMPANY_USER]
 *                 description: Global role
 *                 example: "COMPANY_USER"
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 description: Company UUID (if assigning to company)
 *                 example: "550e8400-e29b-41d4-a716-446655440001"
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: Role UUID (required if companyId provided)
 *                 example: "550e8400-e29b-41d4-a716-446655440002"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "User created successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440003"
 *                 keycloakId: "7d3ea298-66dc-4ece-90de-c4de111e8b7f"
 *                 email: "user@example.com"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 keycloakGlobalRole: "COMPANY_USER"
 *                 isActive: true
 *                 createdDate: "2024-11-23T12:00:00.000Z"
 *                 companies:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Company Name"
 *                     description: "A leading technology company"
 *                     isActive: true
 *                     status: "ACTIVE"
 *                     email: "contact@company.com"
 *                     phone: "+1 234-567-8900"
 *                     buildingAddress: "Suite 100"
 *                     streetAddress: "123 Main Street"
 *                     city: "New York"
 *                     state: "NY"
 *                     postalCode: "10001"
 *                     country: "United States"
 *                     plan:
 *                       id: "550e8400-e29b-41d4-a716-446655440003"
 *                       name: "Basic"
 *                       code: "BASIC"
 *                       description: "Basic subscription plan"
 *                       price: 0
 *                       isActive: true
 *                       createdDate: "2024-11-23T12:00:00.000Z"
 *                       updatedDate: "2024-11-23T12:00:00.000Z"
 *                       version: 1
 *                     role:
 *                       id: "660e8400-e29b-41d4-a716-446655440001"
 *                       name: "CompanyAdmin"
 *                       code: "COMPANY_ADMIN"
 *                       description: "Company administrator role"
 *                     companyUser:
 *                       id: "770e8400-e29b-41d4-a716-446655440002"
 *                       isActive: true
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567898"
 *                 endpoint: "/api/v2/superAdmin/users"
 *                 method: "POST"
 *                 duration: 450
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 details:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "email"
 *                     message:
 *                       type: string
 *                       example: "email is required"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-11-23T12:00:00.000Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       example: "req-1234567898"
 *                     endpoint:
 *                       type: string
 *                       example: "/api/v2/superAdmin/users"
 *                     method:
 *                       type: string
 *                       example: "POST"
 *             example:
 *               success: false
 *               error: "VALIDATION_ERROR"
 *               message: "Validation failed"
 *               details:
 *                 field: "email"
 *                 message: "email is required"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567898"
 *                 endpoint: "/api/v2/superAdmin/users"
 *                 method: "POST"
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/users', authMiddleware, asyncHandler(createUserWithCompany));

/**
 * @swagger
 * /api/v2/superAdmin/users:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get all users (cross-company) with pagination
 *     description: Returns a paginated list of all users with optional search, filtering, and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - $ref: '#/components/parameters/SortByQueryParam'
 *       - $ref: '#/components/parameters/SortOrderQueryParam'
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Users retrieved successfully"
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440003"
 *                   keycloakId: "7d3ea298-66dc-4ece-90de-c4de111e8b7f"
 *                   email: "user@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   keycloakGlobalRole: "COMPANY_USER"
 *                   isActive: true
 *                   companies:
 *                     - id: "550e8400-e29b-41d4-a716-446655440000"
 *                       name: "Company Name"
 *                       description: "A leading technology company"
 *                       isActive: true
 *                       status: "ACTIVE"
 *                       email: "contact@company.com"
 *                       phone: "+1 234-567-8900"
 *                       buildingAddress: "Suite 100"
 *                       streetAddress: "123 Main Street"
 *                       city: "New York"
 *                       state: "NY"
 *                       postalCode: "10001"
 *                       country: "United States"
 *                       plan:
 *                         id: "550e8400-e29b-41d4-a716-446655440003"
 *                         name: "Basic"
 *                         code: "BASIC"
 *                         description: "Basic subscription plan"
 *                         price: 0
 *                         isActive: true
 *                         createdDate: "2024-11-23T12:00:00.000Z"
 *                         updatedDate: "2024-11-23T12:00:00.000Z"
 *                         version: 1
 *                       role:
 *                         id: "660e8400-e29b-41d4-a716-446655440001"
 *                         name: "CompanyAdmin"
 *                         code: "COMPANY_ADMIN"
 *                         description: "Company administrator role"
 *                       companyUser:
 *                         id: "770e8400-e29b-41d4-a716-446655440002"
 *                         isActive: true
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567899"
 *                 endpoint: "/api/v2/superAdmin/users"
 *                 method: "GET"
 *                 duration: 180
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 50
 *                 pages: 5
 *                 hasNext: true
 *                 hasPrev: false
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users', authMiddleware, asyncHandler(getUsers));

/**
 * @swagger
 * /api/v2/superAdmin/users/{id}:
 *   get:
 *     tags:
 *       - SuperAdmin
 *     summary: Get user by ID
 *     description: Returns detailed information about a specific user, including company details with logo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "User retrieved successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440003"
 *                 keycloakId: "7d3ea298-66dc-4ece-90de-c4de111e8b7f"
 *                 email: "user@example.com"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 keycloakGlobalRole: "COMPANY_USER"
 *                 isActive: true
 *                 companies:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Company Name"
 *                     description: "A leading technology company"
 *                     isActive: true
 *                     status: "ACTIVE"
 *                     email: "contact@company.com"
 *                     phone: "+1 234-567-8900"
 *                     buildingAddress: "Suite 100"
 *                     streetAddress: "123 Main Street"
 *                     city: "New York"
 *                     state: "NY"
 *                     postalCode: "10001"
 *                     country: "United States"
 *                     logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
 *                     plan:
 *                       id: "550e8400-e29b-41d4-a716-446655440003"
 *                       name: "Basic"
 *                       code: "BASIC"
 *                       description: "Basic subscription plan"
 *                       price: 0
 *                       isActive: true
 *                       createdDate: "2024-11-23T12:00:00.000Z"
 *                       updatedDate: "2024-11-23T12:00:00.000Z"
 *                       version: 1
 *                     role:
 *                       id: "660e8400-e29b-41d4-a716-446655440001"
 *                       name: "CompanyAdmin"
 *                       code: "COMPANY_ADMIN"
 *                       description: "Company administrator role"
 *                     companyUser:
 *                       id: "770e8400-e29b-41d4-a716-446655440002"
 *                       isActive: true
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567900"
 *                 endpoint: "/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003"
 *                 method: "GET"
 *                 duration: 100
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users/:id', authMiddleware, asyncHandler(getUserById));

/**
 * @swagger
 * /api/v2/superAdmin/users/{id}:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update user by ID
 *     description: Updates user in both Keycloak and database. All fields are optional.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "User updated successfully"
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440003"
 *                 keycloakId: "7d3ea298-66dc-4ece-90de-c4de111e8b7f"
 *                 email: "newemail@example.com"
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 keycloakGlobalRole: "COMPANY_ADMIN"
 *                 isActive: true
 *                 createdDate: "2024-11-23T12:00:00.000Z"
 *                 companies:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Company Name"
 *                     description: "A leading technology company"
 *                     isActive: true
 *                     status: "ACTIVE"
 *                     email: "contact@company.com"
 *                     phone: "+1 234-567-8900"
 *                     buildingAddress: "Suite 100"
 *                     streetAddress: "123 Main Street"
 *                     city: "New York"
 *                     state: "NY"
 *                     postalCode: "10001"
 *                     country: "United States"
 *                     plan:
 *                       id: "550e8400-e29b-41d4-a716-446655440003"
 *                       name: "Basic"
 *                       code: "BASIC"
 *                       description: "Basic subscription plan"
 *                       price: 0
 *                       isActive: true
 *                       createdDate: "2024-11-23T12:00:00.000Z"
 *                       updatedDate: "2024-11-23T12:00:00.000Z"
 *                       version: 1
 *                     role:
 *                       id: "660e8400-e29b-41d4-a716-446655440001"
 *                       name: "CompanyAdmin"
 *                       code: "COMPANY_ADMIN"
 *                       description: "Company administrator role"
 *                     companyUser:
 *                       id: "770e8400-e29b-41d4-a716-446655440002"
 *                       isActive: true
 *               timestamp: "2024-11-23T12:05:00.000Z"
 *               meta:
 *                 requestId: "req-1234567901"
 *                 endpoint: "/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003"
 *                 method: "PUT"
 *                 duration: 320
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/users/:id', authMiddleware, asyncHandler(updateUser));

/**
 * @swagger
 * /api/v2/superAdmin/users/{id}/disable:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Disable user by ID
 *     description: Disables user in Keycloak and marks as inactive in database. Users are never deleted, only deactivated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: User disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: "null"
 *                       example: null
 *             example:
 *               success: true
 *               message: "User disabled successfully"
 *               data: null
 *               timestamp: "2024-11-23T12:10:00.000Z"
 *               meta:
 *                 requestId: "req-1234567902"
 *                 endpoint: "/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003/disable"
 *                 method: "PUT"
 *                 duration: 280
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/users/:id/disable', authMiddleware, asyncHandler(disableUser));

/**
 * @swagger
 * /api/v2/superAdmin/users/{id}/enable:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Enable user by ID
 *     description: Enables user in Keycloak and marks as active in database. Sets isActive to true in database and enabled to true in Keycloak.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: User enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: "null"
 *                       example: null
 *             example:
 *               success: true
 *               message: "User enabled successfully"
 *               data: null
 *               timestamp: "2024-11-23T12:10:00.000Z"
 *               meta:
 *                 requestId: "req-1234567902"
 *                 endpoint: "/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003/enable"
 *                 method: "PUT"
 *                 duration: 280
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/users/:id/enable', authMiddleware, asyncHandler(enableUser));

/**
 * @swagger
 * /api/v2/superAdmin/users/{id}/assign:
 *   post:
 *     tags:
 *       - SuperAdmin
 *     summary: Assign user to company with role
 *     description: Creates or updates CompanyUser relationship
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyUserAssignRequest'
 *     responses:
 *       200:
 *         description: User assigned to company successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CompanyUser'
 *             example:
 *               success: true
 *               message: "User assigned to company successfully"
 *               data:
 *                 userId: "550e8400-e29b-41d4-a716-446655440003"
 *                 companyId: "550e8400-e29b-41d4-a716-446655440001"
 *                 roleId: "550e8400-e29b-41d4-a716-446655440002"
 *                 isActive: true
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567903"
 *                 endpoint: "/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003/assign"
 *                 method: "POST"
 *                 duration: 220
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/users/:id/assign', authMiddleware, asyncHandler(assignUserToCompany));

/**
 * @swagger
 * /api/v2/superAdmin/users/{id}/companies/{companyId}/role:
 *   put:
 *     tags:
 *       - SuperAdmin
 *     summary: Update user's role in a company
 *     description: Updates the CompanyUser relationship
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Company UUID
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: Role UUID
 *                 example: "550e8400-e29b-41d4-a716-446655440002"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CompanyUser'
 *             example:
 *               success: true
 *               message: "User role updated successfully"
 *               data:
 *                 userId: "550e8400-e29b-41d4-a716-446655440003"
 *                 companyId: "550e8400-e29b-41d4-a716-446655440001"
 *                 roleId: "550e8400-e29b-41d4-a716-446655440002"
 *                 isActive: true
 *               timestamp: "2024-11-23T12:05:00.000Z"
 *               meta:
 *                 requestId: "req-1234567904"
 *                 endpoint: "/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003/companies/550e8400-e29b-41d4-a716-446655440001/role"
 *                 method: "PUT"
 *                 duration: 190
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/users/:id/companies/:companyId/role', authMiddleware, asyncHandler(updateUserCompanyRole));

export default router;

