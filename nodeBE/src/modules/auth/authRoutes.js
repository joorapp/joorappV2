/**
 * @author Bhavesh Venugopal
 * Auth Routes
 * Defines API endpoints for authentication and company selection
 */

import express from 'express';
import { login, selectCompany, getCurrentContext, refreshToken, logout } from './authController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * /api/v2/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user with email and password
 *     description: Authenticates user with Keycloak, syncs user to database, fetches companies, and returns tokens with user data including keycloak_global_role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
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
 *                         access_token:
 *                           type: string
 *                           example: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ..."
 *                         refresh_token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ..."
 *                         expires_in:
 *                           type: number
 *                           example: 300
 *                         refresh_expires_in:
 *                           type: number
 *                           example: 1800
 *                         token_type:
 *                           type: string
 *                           example: "Bearer"
 *                         keycloak_global_role:
 *                           type: string
 *                           enum: [SUPER_ADMIN, COMPANY_ADMIN, COMPANY_USER]
 *                           example: "SUPER_ADMIN"
 *                           description: "User's global role from Keycloak"
 *                         companies:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                               name:
 *                                 type: string
 *                                 example: "Company Name"
 *                               isActive:
 *                                 type: boolean
 *                                 example: true
 *                               role:
 *                                 $ref: '#/components/schemas/CompanyRole'
 *                               companyUser:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                     example: "770e8400-e29b-41d4-a716-446655440002"
 *                                   isActive:
 *                                     type: boolean
 *                                     example: true
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 access_token: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ..."
 *                 refresh_token: "eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ..."
 *                 expires_in: 300
 *                 refresh_expires_in: 1800
 *                 token_type: "Bearer"
 *                 keycloak_global_role: "SUPER_ADMIN"
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
 *                       price: 0.00
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
 *
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/auth/login"
 *                 method: "POST"
 *                 duration: 245
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationFailed'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/login', asyncHandler(login));


/**
 * @swagger
 * /api/v2/auth/companies/{companyId}/select:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Select company for current session
 *     description: Creates or updates UserCompanyContext entry linking session to company. Can switch companies if already has a company context.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/UuidPathParam'
 *         description: Company ID to select
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Company selected successfully (or switched if already had a company context)
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
 *                         company:
 *                           $ref: '#/components/schemas/Company'
 *                         role:
 *                           $ref: '#/components/schemas/CompanyRole'
 *                         companyUser:
 *                           $ref: '#/components/schemas/CompanyUser'
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Company selected successfully"
 *               data:
 *                 company:
 *                   id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "Company Name"
 *                   description: "A leading technology company"
 *                   isActive: true
 *                   status: "ACTIVE"
 *                   email: "contact@company.com"
 *                   phone: "+1 234-567-8900"
 *                   buildingAddress: "Suite 100"
 *                   streetAddress: "123 Main Street"
 *                   city: "New York"
 *                   state: "NY"
 *                   postalCode: "10001"
 *                   country: "United States"
 *                   logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
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
 *                 role:
 *                   id: "7a9d55d7-e89c-4cab-b30f-0d5d9fc2f7e7"
 *                   name: "CompanyAdmin"
 *                   code: "COMPANY_ADMIN"
 *                   description: "Company administrator with full access to company resources and management capabilities"
 *                 companyUser:
 *                   id: "a67a8ca2-b721-43f2-b353-c31f470362a0"
 *                   isActive: true
 *                 user:
 *                   id: "cc71c2d3-f88d-44dd-a2c9-e42809296a92"
 *                   email: "user@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/auth/companies/550e8400-e29b-41d4-a716-446655440000/select"
 *                 method: "POST"
 *                 duration: 189
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/companies/:companyId/select', authMiddleware, asyncHandler(selectCompany));

/**
 * @swagger
 * /api/v2/auth/context:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current company context for session
 *     description: Returns the currently selected company for the session, or null if no company is selected
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company context retrieved successfully or no company selected
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
 *                         company:
 *                           oneOf:
 *                             - $ref: '#/components/schemas/Company'
 *                             - type: "null"
 *                               example: null
 *             examples:
 *               withCompany:
 *                 summary: Company context exists
 *                 value:
 *                   success: true
 *                   message: "Company context retrieved successfully"
 *                   data:
 *                     company:
 *                       id: "550e8400-e29b-41d4-a716-446655440000"
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
 *                         price: 0.00
 *                         isActive: true
 *                         createdDate: "2024-11-23T12:00:00.000Z"
 *                         updatedDate: "2024-11-23T12:00:00.000Z"
 *                         version: 1
 *                   timestamp: "2024-11-23T12:00:00.000Z"
 *                   meta:
 *                     requestId: "req-1234567890"
 *                     endpoint: "/api/v2/auth/context"
 *                     method: "GET"
 *                     duration: 98
 *               noCompany:
 *                 summary: No company selected
 *                 value:
 *                   success: true
 *                   message: "No company selected"
 *                   data:
 *                     company: null
 *                   timestamp: "2024-11-23T12:00:00.000Z"
 *                   meta:
 *                     requestId: "req-1234567890"
 *                     endpoint: "/api/v2/auth/context"
 *                     method: "GET"
 *                     duration: 87
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/context', authMiddleware, asyncHandler(getCurrentContext));

/**
 * @swagger
 * /api/v2/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token using refresh token
 *     description: Returns new access_token and refresh_token using the provided refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TokenResponse'
 *             example:
 *               success: true
 *               message: "Token refreshed successfully"
 *               data:
 *                 access_token: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ..."
 *                 refresh_token: "eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ..."
 *                 expires_in: 300
 *                 refresh_expires_in: 1800
 *                 token_type: "Bearer"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/auth/refresh"
 *                 method: "POST"
 *                 duration: 234
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationFailed'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/refresh', asyncHandler(refreshToken));

/**
 * @swagger
 * /api/v2/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user and invalidate session
 *     description: Invalidates Keycloak session and cleans up UserCompanyContext. Requires refresh_token for proper session invalidation (e.g., logout from Browser B while Browser A session continues).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Logout successful
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
 *               message: "Logout successful"
 *               data: null
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/auth/logout"
 *                 method: "POST"
 *                 duration: 167
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/logout', authMiddleware, asyncHandler(logout));

export default router;

