/**
 * @author Bhavesh Venugopal
 * Admin Routes
 * Defines API endpoints for administrative functions
 */

import express from 'express';
import {
  getSettings,
  updateSettings,
  getStats,
  // User Management
  createUserInCompany,
  getCompanyUsers,
  getCompanyUserById,
  updateCompanyUser,
  removeUserFromCompany,
  updateUserRole
} from './adminController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { companyContextMiddleware } from '../../middleware/companyContextMiddleware.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * /api/v2/admin/settings:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get system settings and configuration
 *     description: Returns system settings including site name, maintenance mode, max users, and feature flags
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
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
 *                         settings:
 *                           type: object
 *                           properties:
 *                             siteName:
 *                               type: string
 *                               example: "JoorApp"
 *                             maintenanceMode:
 *                               type: boolean
 *                               example: false
 *                             maxUsers:
 *                               type: number
 *                               example: 1000
 *                             features:
 *                               type: object
 *                               properties:
 *                                 registration:
 *                                   type: boolean
 *                                   example: true
 *                                 emailNotifications:
 *                                   type: boolean
 *                                   example: true
 *                                 analytics:
 *                                   type: boolean
 *                                   example: true
 *             example:
 *               success: true
 *               message: "Settings retrieved successfully"
 *               data:
 *                 settings:
 *                   siteName: "JoorApp"
 *                   maintenanceMode: false
 *                   maxUsers: 1000
 *                   features:
 *                     registration: true
 *                     emailNotifications: true
 *                     analytics: true
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/settings"
 *                 method: "GET"
 *                 duration: 98
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/settings', authMiddleware, asyncHandler(getSettings));

/**
 * @swagger
 * /api/v2/admin/settings:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update system settings and configuration
 *     description: Updates system settings. All fields are optional.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *                 description: Site name
 *                 example: "JoorApp V2"
 *               maintenanceMode:
 *                 type: boolean
 *                 description: Maintenance mode flag
 *                 example: false
 *               maxUsers:
 *                 type: number
 *                 description: Maximum number of users
 *                 example: 2000
 *               features:
 *                 type: object
 *                 description: Feature flags
 *                 properties:
 *                   registration:
 *                     type: boolean
 *                     example: true
 *                   emailNotifications:
 *                     type: boolean
 *                     example: false
 *                   analytics:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       200:
 *         description: Settings updated successfully
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
 *                         settings:
 *                           type: object
 *                           properties:
 *                             siteName:
 *                               type: string
 *                               example: "JoorApp V2"
 *                             maintenanceMode:
 *                               type: boolean
 *                               example: false
 *                             maxUsers:
 *                               type: number
 *                               example: 2000
 *                             features:
 *                               type: object
 *                               properties:
 *                                 registration:
 *                                   type: boolean
 *                                   example: true
 *                                 emailNotifications:
 *                                   type: boolean
 *                                   example: false
 *                                 analytics:
 *                                   type: boolean
 *                                   example: true
 *             example:
 *               success: true
 *               message: "Settings updated successfully"
 *               data:
 *                 settings:
 *                   siteName: "JoorApp V2"
 *                   maintenanceMode: false
 *                   maxUsers: 2000
 *                   features:
 *                     registration: true
 *                     emailNotifications: false
 *                     analytics: true
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/settings"
 *                 method: "PUT"
 *                 duration: 234
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/settings', authMiddleware, asyncHandler(updateSettings));

/**
 * @swagger
 * /api/v2/admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get system statistics and analytics
 *     description: Returns system statistics including user counts, system metrics, and API usage statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                         stats:
 *                           type: object
 *                           properties:
 *                             users:
 *                               type: object
 *                               properties:
 *                                 total:
 *                                   type: number
 *                                   example: 1250
 *                                 active:
 *                                   type: number
 *                                   example: 980
 *                                 newThisMonth:
 *                                   type: number
 *                                   example: 45
 *                             system:
 *                               type: object
 *                               properties:
 *                                 uptime:
 *                                   type: number
 *                                   example: 86400
 *                                 memoryUsage:
 *                                   type: string
 *                                   example: "75%"
 *                                 cpuUsage:
 *                                   type: string
 *                                   example: "45%"
 *                             api:
 *                               type: object
 *                               properties:
 *                                 totalRequests:
 *                                   type: number
 *                                   example: 50000
 *                                 requestsToday:
 *                                   type: number
 *                                   example: 1200
 *                                 averageResponseTime:
 *                                   type: string
 *                                   example: "150ms"
 *             example:
 *               success: true
 *               message: "Statistics retrieved successfully"
 *               data:
 *                 stats:
 *                   users:
 *                     total: 1250
 *                     active: 980
 *                     newThisMonth: 45
 *                   system:
 *                     uptime: 86400
 *                     memoryUsage: "75%"
 *                     cpuUsage: "45%"
 *                   api:
 *                     totalRequests: 50000
 *                     requestsToday: 1200
 *                     averageResponseTime: "150ms"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/stats"
 *                 method: "GET"
 *                 duration: 167
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', authMiddleware, asyncHandler(getStats));

// =====================================================
// Company-Scoped User Management Routes
// =====================================================

/**
 * @swagger
 * /api/v2/admin/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new user in the company (Company Admin)
 *     description: Creates a new user in Keycloak and assigns them to the company with a specific role. Requires COMPANY_ADMIN role and company context.
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
 *               - roleId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address (must be valid email format)
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User password (minimum 8 characters, required if new user)
 *                 example: "SecurePassword123"
 *               firstName:
 *                 type: string
 *                 maxLength: 100
 *                 description: User first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: User last name
 *                 example: "Doe"
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: Company role ID (must be a valid UUID and exist in CompanyRole table)
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               keycloakGlobalRole:
 *                 type: string
 *                 enum: [company_admin, company_user]
 *                 description: Keycloak global role for the user
 *                 example: "company_user"
 *     responses:
 *       201:
 *         description: User created and assigned to company successfully
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         companyUser:
 *                           $ref: '#/components/schemas/CompanyUser'
 *             example:
 *               success: true
 *               message: "User created and assigned to company successfully"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174001"
 *                   email: "user@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   keycloakId: "kc-123456"
 *                   keycloakGlobalRole: "company_user"
 *                   isActive: true
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *                 companyUser:
 *                   id: "123e4567-e89b-12d3-a456-426614174002"
 *                   userId: "123e4567-e89b-12d3-a456-426614174001"
 *                   companyId: "123e4567-e89b-12d3-a456-426614174003"
 *                   roleId: "123e4567-e89b-12d3-a456-426614174000"
 *                   isActive: true
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/users"
 *                 method: "POST"
 *                 duration: 456
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
router.post('/users', authMiddleware, companyContextMiddleware, asyncHandler(createUserInCompany));

/**
 * @swagger
 * /api/v2/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users in the company (Company Admin)
 *     description: Returns paginated list of users in the company with optional search, filtering, and sorting. Requires COMPANY_ADMIN role and company context.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., createdAt, email)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for email, firstName, or lastName
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Company users retrieved successfully
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                           companyId:
 *                             type: string
 *                             format: uuid
 *                           roleId:
 *                             type: string
 *                             format: uuid
 *                           isActive:
 *                             type: boolean
 *                           user:
 *                             $ref: '#/components/schemas/User'
 *                           role:
 *                             $ref: '#/components/schemas/CompanyRole'
 *             example:
 *               success: true
 *               message: "Company users retrieved successfully"
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174001"
 *                   userId: "123e4567-e89b-12d3-a456-426614174002"
 *                   companyId: "123e4567-e89b-12d3-a456-426614174003"
 *                   roleId: "123e4567-e89b-12d3-a456-426614174000"
 *                   isActive: true
 *                   user:
 *                     id: "123e4567-e89b-12d3-a456-426614174002"
 *                     email: "user1@example.com"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     isActive: true
 *                   role:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     name: "Manager"
 *                     code: "MANAGER"
 *                     isActive: true
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 25
 *                 pages: 3
 *                 hasNext: true
 *                 hasPrev: false
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/users"
 *                 method: "GET"
 *                 duration: 234
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users', authMiddleware, companyContextMiddleware, asyncHandler(getCompanyUsers));

/**
 * @swagger
 * /api/v2/admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get a specific user in the company by ID (Company Admin)
 *     description: Returns user details including company user association and role. Requires COMPANY_ADMIN role and company context.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Company user retrieved successfully
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         CompanyUser:
 *                           $ref: '#/components/schemas/CompanyUser'
 *                         CompanyRole:
 *                           $ref: '#/components/schemas/CompanyRole'
 *             example:
 *               success: true
 *               message: "Company user retrieved successfully"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174001"
 *                   email: "user@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   keycloakId: "kc-123456"
 *                   keycloakGlobalRole: "company_user"
 *                   isActive: true
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *                   CompanyUser:
 *                     id: "123e4567-e89b-12d3-a456-426614174002"
 *                     roleId: "123e4567-e89b-12d3-a456-426614174000"
 *                     isActive: true
 *                     CompanyRole:
 *                       id: "123e4567-e89b-12d3-a456-426614174000"
 *                       name: "Manager"
 *                       code: "MANAGER"
 *                       description: "Manager role"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001"
 *                 method: "GET"
 *                 duration: 123
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
router.get('/users/:id', authMiddleware, companyContextMiddleware, asyncHandler(getCompanyUserById));

/**
 * @swagger
 * /api/v2/admin/users/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update a user in the company (Company Admin)
 *     description: Updates user details in both Keycloak and database. All fields are optional. Requires COMPANY_ADMIN role and company context.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID (UUID format)
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 100
 *                 description: User first name
 *                 example: "Jane"
 *               lastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: User last name
 *                 example: "Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "jane.smith@example.com"
 *               keycloakGlobalRole:
 *                 type: string
 *                 enum: [company_admin, company_user]
 *                 description: Keycloak global role for the user
 *                 example: "company_user"
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *                 example: true
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
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "User updated successfully"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174001"
 *                   email: "jane.smith@example.com"
 *                   firstName: "Jane"
 *                   lastName: "Smith"
 *                   keycloakId: "kc-123456"
 *                   keycloakGlobalRole: "company_user"
 *                   isActive: true
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T01:00:00.000Z"
 *               timestamp: "2024-01-01T01:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001"
 *                 method: "PUT"
 *                 duration: 345
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
router.put('/users/:id', authMiddleware, companyContextMiddleware, asyncHandler(updateCompanyUser));

/**
 * @swagger
 * /api/v2/admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Remove a user from the company (soft delete CompanyUser association) (Company Admin)
 *     description: Soft deletes the CompanyUser association, removing the user from the company. Requires COMPANY_ADMIN role and company context.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: User removed from company successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       example: {}
 *             example:
 *               success: true
 *               message: "User removed from company successfully"
 *               data: {}
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001"
 *                 method: "DELETE"
 *                 duration: 123
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
router.delete('/users/:id', authMiddleware, companyContextMiddleware, asyncHandler(removeUserFromCompany));

/**
 * @swagger
 * /api/v2/admin/users/{id}/role:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update user role in the company (Company Admin)
 *     description: Updates the user's role within the company. Requires COMPANY_ADMIN role and company context.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID (UUID format)
 *         example: "123e4567-e89b-12d3-a456-426614174001"
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
 *                 description: New role ID (must be a valid UUID and exist in CompanyRole table)
 *                 example: "123e4567-e89b-12d3-a456-426614174010"
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
 *                       type: object
 *                       properties:
 *                         companyUser:
 *                           $ref: '#/components/schemas/CompanyUser'
 *             example:
 *               success: true
 *               message: "User role updated successfully"
 *               data:
 *                 companyUser:
 *                   id: "123e4567-e89b-12d3-a456-426614174002"
 *                   userId: "123e4567-e89b-12d3-a456-426614174001"
 *                   companyId: "123e4567-e89b-12d3-a456-426614174003"
 *                   roleId: "123e4567-e89b-12d3-a456-426614174010"
 *                   isActive: true
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T01:00:00.000Z"
 *               timestamp: "2024-01-01T01:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001/role"
 *                 method: "PUT"
 *                 duration: 234
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
router.put('/users/:id/role', authMiddleware, companyContextMiddleware, asyncHandler(updateUserRole));

export default router;
