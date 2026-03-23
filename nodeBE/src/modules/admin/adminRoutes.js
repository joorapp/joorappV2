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
import * as clientController from './clientController.js';
import * as projectController from './projectController.js';
import * as employeeController from './employeeController.js';
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

// =====================================================
// Client Management Routes
// =====================================================

/**
 * @swagger
 * /api/v2/admin/clients:
 *   post:
 *     tags:
 *       - Admin Clients
 *     summary: Create a new client
 *     description: Creates a new client. Requires COMPANY_ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               clientMetadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Client'
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
router.post('/clients', authMiddleware, companyContextMiddleware, asyncHandler(clientController.createClient));

/**
 * @swagger
 * /api/v2/admin/clients:
 *   get:
 *     tags:
 *       - Admin Clients
 *     summary: List clients
 *     description: Retrieves a paginated list of clients. Requires COMPANY_ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
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
 *                         $ref: '#/components/schemas/Client'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/clients', authMiddleware, companyContextMiddleware, asyncHandler(clientController.listClients));

/**
 * @swagger
 * /api/v2/admin/clients/all:
 *   get:
 *     tags:
 *       - Admin Clients
 *     summary: List all clients for dropdowns (no pagination)
 *     description: >
 *       Returns clients created by the current company, sorted by name.
 *       Query isActive: omit for all; true for active only; false for inactive only. Empty isActive= is treated as omitted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active flag; omit to return both active and inactive
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Client'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/clients/all', authMiddleware, companyContextMiddleware, asyncHandler(clientController.listAllClients));

/**
 * @swagger
 * /api/v2/admin/clients/{id}:
 *   get:
 *     tags:
 *       - Admin Clients
 *     summary: Get client by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Client'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/clients/:id', authMiddleware, companyContextMiddleware, asyncHandler(clientController.getClientById));

/**
 * @swagger
 * /api/v2/admin/clients/{id}:
 *   put:
 *     tags:
 *       - Admin Clients
 *     summary: Update client
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               clientMetadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Client'
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
router.put('/clients/:id', authMiddleware, companyContextMiddleware, asyncHandler(clientController.updateClient));

/**
 * @swagger
 * /api/v2/admin/clients/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Clients
 *     summary: Set client active or inactive (current company)
 *     description: Only clients created by the current company can be updated; others return 404.
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
 *         description: Client status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Client'
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
router.patch('/clients/:id/status', authMiddleware, companyContextMiddleware, asyncHandler(clientController.patchClientStatus));

/**
 * @swagger
 * /api/v2/admin/clients/{id}:
 *   delete:
 *     tags:
 *       - Admin Clients
 *     summary: Delete client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/clients/:id', authMiddleware, companyContextMiddleware, asyncHandler(clientController.deleteClient));

// =====================================================
// Employees (job titles and future employee APIs)
// =====================================================

/**
 * @swagger
 * /api/v2/admin/employees/job-titles/all:
 *   get:
 *     tags:
 *       - Admin Employees
 *     summary: List all job titles for dropdowns
 *     description: >
 *       Returns job titles from the super admin company plus the current company, sorted by name.
 *       Query isActive: omit for all; true for active only; false for inactive only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active flag; omit to return both active and inactive
 *     responses:
 *       200:
 *         description: Job titles retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JobTitle'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/employees/job-titles/all',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.listAllJobTitles)
);

/**
 * @swagger
 * /api/v2/admin/employees/job-titles:
 *   post:
 *     tags:
 *       - Admin Employees
 *     summary: Create job title for current company
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
 *         description: Created
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
router.post(
  '/employees/job-titles',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.createJobTitle)
);

/**
 * @swagger
 * /api/v2/admin/employees/job-titles:
 *   get:
 *     tags:
 *       - Admin Employees
 *     summary: List job titles for current company (paginated)
 *     description: Returns job titles owned by the super admin company (platform defaults) plus the current company. Each item includes canEdit and canDelete (false for platform-managed titles).
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
 *         description: Paginated job titles
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
 *                         $ref: '#/components/schemas/JobTitleCompanyWorkspace'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/employees/job-titles',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.listJobTitles)
);

/**
 * @swagger
 * /api/v2/admin/employees/job-titles/{id}:
 *   get:
 *     tags:
 *       - Admin Employees
 *     summary: Get job title by ID (tenant or platform default)
 *     description: Returns a title if it belongs to the current company or the super admin company. Includes canEdit and canDelete.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Job title
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobTitleCompanyWorkspace'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/employees/job-titles/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.getJobTitleById)
);

/**
 * @swagger
 * /api/v2/admin/employees/job-titles/{id}:
 *   put:
 *     tags:
 *       - Admin Employees
 *     summary: Update job title (current company)
 *     description: Forbidden when the job title is owned by the super admin company (platform-managed).
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
 *         description: Updated
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
 *         description: Admin required, or job title is platform-managed and cannot be changed from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  '/employees/job-titles/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.updateJobTitle)
);

/**
 * @swagger
 * /api/v2/admin/employees/job-titles/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Employees
 *     summary: Set job title active or inactive (current company)
 *     description: Forbidden when the job title is owned by the super admin company (platform-managed).
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
 *         description: Updated
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
 *         description: Admin required, or job title is platform-managed and cannot be changed from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  '/employees/job-titles/:id/status',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.patchJobTitleStatus)
);

/**
 * @swagger
 * /api/v2/admin/employees/job-titles/{id}:
 *   delete:
 *     tags:
 *       - Admin Employees
 *     summary: Delete job title (current company)
 *     description: Forbidden when the job title is owned by the super admin company (platform-managed).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Deleted
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
 *         description: Admin required, or job title is platform-managed and cannot be deleted from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  '/employees/job-titles/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.deleteJobTitle)
);

/**
 * @swagger
 * /api/v2/admin/employees/all:
 *   get:
 *     tags:
 *       - Admin Employees
 *     summary: List all employees (no pagination)
 *     description: Filter by search, jobTitleId, and isActive. Sorted by last name, first name.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: jobTitleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by job title id
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Employees retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Employee'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/employees/all',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.listAllEmployees)
);

/**
 * @swagger
 * /api/v2/admin/employees:
 *   get:
 *     tags:
 *       - Admin Employees
 *     summary: List employees (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: jobTitleId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - $ref: '#/components/parameters/SortByQueryParam'
 *       - $ref: '#/components/parameters/SortOrderQueryParam'
 *     responses:
 *       200:
 *         description: Paginated employees
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
 *                         $ref: '#/components/schemas/Employee'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     tags:
 *       - Admin Employees
 *     summary: Create employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCreateRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Employee'
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
router.get(
  '/employees',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.listEmployees)
);
router.post(
  '/employees',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.createEmployee)
);

/**
 * @swagger
 * /api/v2/admin/employees/assign-role:
 *   post:
 *     tags:
 *       - Admin Employees
 *     summary: Assign company role to employee (enable login or update role)
 *     description: >
 *       If the employee has no companyUserId, creates Keycloak user (default password `admin`), DB user,
 *       company assignment with the given role, and sets employee.companyUserId.
 *       If companyUserId is set, updates only the company role on that assignment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - roleId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: company_roles.id (master role)
 *     responses:
 *       200:
 *         description: Role assigned or updated
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
 *                         employee:
 *                           $ref: '#/components/schemas/Employee'
 *                         companyUser:
 *                           type: object
 *                         provisioned:
 *                           type: boolean
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
router.post(
  '/employees/assign-role',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.assignEmployeeCompanyRole)
);

/**
 * @swagger
 * /api/v2/admin/employees/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Employees
 *     summary: Set employee active or inactive
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeStatusPatchRequest'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Employee'
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
router.patch(
  '/employees/:id/status',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.patchEmployeeStatus)
);

/**
 * @swagger
 * /api/v2/admin/employees/{id}:
 *   get:
 *     tags:
 *       - Admin Employees
 *     summary: Get employee by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Employee
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Employee'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     tags:
 *       - Admin Employees
 *     summary: Update employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeUpdateRequest'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Employee'
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
 *   delete:
 *     tags:
 *       - Admin Employees
 *     summary: Soft-delete employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Deleted
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
router.get(
  '/employees/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.getEmployeeById)
);
router.put(
  '/employees/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.updateEmployee)
);
router.delete(
  '/employees/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(employeeController.deleteEmployee)
);

// =====================================================
// Project types (reference data; register before /projects/:id)
// =====================================================

/**
 * @swagger
 * /api/v2/admin/projects/types/all:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: List all project types for dropdowns
 *     description: >
 *       Returns project types from the super admin company plus the current company, sorted by name.
 *       Query isActive: omit for all; true for active only; false for inactive only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active flag; omit to return both active and inactive
 *     responses:
 *       200:
 *         description: Project types retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectType'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/projects/types/all',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.listAllProjectTypes)
);

/**
 * @swagger
 * /api/v2/admin/projects/types:
 *   post:
 *     tags:
 *       - Admin Projects
 *     summary: Create project type for current company
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
 *         description: Created
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
router.post(
  '/projects/types',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.createProjectType)
);

/**
 * @swagger
 * /api/v2/admin/projects/types:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: List project types for current company (paginated)
 *     description: Returns types owned by the super admin company (platform defaults) plus the current company. Each item includes canEdit and canDelete (false for platform-managed types).
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
 *         description: Paginated project types
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
 *                         $ref: '#/components/schemas/ProjectTypeCompanyWorkspace'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/projects/types',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.listProjectTypes)
);

/**
 * @swagger
 * /api/v2/admin/projects/types/{id}:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: Get project type by ID (tenant or platform default)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Project type
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectTypeCompanyWorkspace'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/projects/types/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.getProjectTypeById)
);

/**
 * @swagger
 * /api/v2/admin/projects/types/{id}:
 *   put:
 *     tags:
 *       - Admin Projects
 *     summary: Update project type (current company)
 *     description: Forbidden when the type is owned by the super admin company (platform-managed).
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
 *         description: Updated
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
 *         description: Admin required, or type is platform-managed and cannot be changed from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  '/projects/types/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.updateProjectType)
);

/**
 * @swagger
 * /api/v2/admin/projects/types/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Projects
 *     summary: Set project type active or inactive (current company)
 *     description: Forbidden when the type is owned by the super admin company (platform-managed).
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
 *         description: Updated
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
 *         description: Admin required, or type is platform-managed and cannot be changed from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  '/projects/types/:id/status',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.patchProjectTypeStatus)
);

/**
 * @swagger
 * /api/v2/admin/projects/types/{id}:
 *   delete:
 *     tags:
 *       - Admin Projects
 *     summary: Delete project type (current company)
 *     description: Forbidden when the type is owned by the super admin company (platform-managed).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Deleted
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
 *         description: Admin required, or type is platform-managed and cannot be deleted from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  '/projects/types/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.deleteProjectType)
);

// =====================================================
// Project categories (reference data; register before /projects/:id)
// =====================================================

/**
 * @swagger
 * /api/v2/admin/projects/categories/all:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: List all project categories for dropdowns
 *     description: >
 *       Returns project categories from the super admin company plus the current company, sorted by name.
 *       Query isActive: omit for all; true for active only; false for inactive only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active flag; omit to return both active and inactive
 *     responses:
 *       200:
 *         description: Project categories retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectCategory'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/projects/categories/all',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.listAllProjectCategories)
);

/**
 * @swagger
 * /api/v2/admin/projects/categories:
 *   post:
 *     tags:
 *       - Admin Projects
 *     summary: Create project category for current company
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
 *         description: Created
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
router.post(
  '/projects/categories',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.createProjectCategory)
);

/**
 * @swagger
 * /api/v2/admin/projects/categories:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: List project categories for current company (paginated)
 *     description: Returns categories owned by the super admin company (platform defaults) plus the current company. Each item includes canEdit and canDelete (false for platform-managed categories).
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
 *         description: Paginated project categories
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
 *                         $ref: '#/components/schemas/ProjectCategoryCompanyWorkspace'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/projects/categories',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.listProjectCategories)
);

/**
 * @swagger
 * /api/v2/admin/projects/categories/{id}:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: Get project category by ID (tenant or platform default)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Project category
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectCategoryCompanyWorkspace'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/projects/categories/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.getProjectCategoryById)
);

/**
 * @swagger
 * /api/v2/admin/projects/categories/{id}:
 *   put:
 *     tags:
 *       - Admin Projects
 *     summary: Update project category (current company)
 *     description: Forbidden when the category is owned by the super admin company (platform-managed).
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
 *         description: Updated
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
 *         description: Admin required, or category is platform-managed and cannot be changed from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  '/projects/categories/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.updateProjectCategory)
);

/**
 * @swagger
 * /api/v2/admin/projects/categories/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Projects
 *     summary: Set project category active or inactive (current company)
 *     description: Forbidden when the category is owned by the super admin company (platform-managed).
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
 *         description: Updated
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
 *         description: Admin required, or category is platform-managed and cannot be changed from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  '/projects/categories/:id/status',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.patchProjectCategoryStatus)
);

/**
 * @swagger
 * /api/v2/admin/projects/categories/{id}:
 *   delete:
 *     tags:
 *       - Admin Projects
 *     summary: Delete project category (current company)
 *     description: Forbidden when the category is owned by the super admin company (platform-managed).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Deleted
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
 *         description: Admin required, or category is platform-managed and cannot be deleted from a company workspace
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  '/projects/categories/:id',
  authMiddleware,
  companyContextMiddleware,
  asyncHandler(projectController.deleteProjectCategory)
);

// =====================================================
// Project Management Routes
// =====================================================

/**
 * @swagger
 * /api/v2/admin/projects:
 *   post:
 *     tags:
 *       - Admin Projects
 *     summary: Create a new project
 *     description: Creates a new project. Requires COMPANY_ADMIN role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - name
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               projectMetadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
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
router.post('/projects', authMiddleware, companyContextMiddleware, asyncHandler(projectController.createProject));

/**
 * @swagger
 * /api/v2/admin/projects:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: List projects
 *     description: Retrieves a paginated list of projects. Company admins see all projects. Regular users see projects assigned to them.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
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
 *                         $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/projects', authMiddleware, companyContextMiddleware, asyncHandler(projectController.listProjects));

/**
 * @swagger
 * /api/v2/admin/projects/{id}:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: Get project by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/projects/:id', authMiddleware, companyContextMiddleware, asyncHandler(projectController.getProjectById));

/**
 * @swagger
 * /api/v2/admin/projects/{id}:
 *   put:
 *     tags:
 *       - Admin Projects
 *     summary: Update project
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               projectMetadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
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
router.put('/projects/:id', authMiddleware, companyContextMiddleware, asyncHandler(projectController.updateProject));

/**
 * @swagger
 * /api/v2/admin/projects/{id}:
 *   delete:
 *     tags:
 *       - Admin Projects
 *     summary: Delete project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/projects/:id', authMiddleware, companyContextMiddleware, asyncHandler(projectController.deleteProject));

/**
 * @swagger
 * /api/v2/admin/projects/{projectId}/users:
 *   post:
 *     tags:
 *       - Admin Projects
 *     summary: Assign user to project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User assigned successfully
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
router.post('/projects/:projectId/users', authMiddleware, companyContextMiddleware, asyncHandler(projectController.assignUser));

/**
 * @swagger
 * /api/v2/admin/projects/{projectId}/users:
 *   get:
 *     tags:
 *       - Admin Projects
 *     summary: List assigned users for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/projects/:projectId/users', authMiddleware, companyContextMiddleware, asyncHandler(projectController.listAssignedUsers));

/**
 * @swagger
 * /api/v2/admin/projects/{projectId}/users/{userId}:
 *   delete:
 *     tags:
 *       - Admin Projects
 *     summary: Remove user from project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User removed successfully
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/projects/:projectId/users/:userId', authMiddleware, companyContextMiddleware, asyncHandler(projectController.removeUser));

export default router;
