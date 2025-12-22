/**
 * @author Bhavesh Venugopal
 * User Routes
 * Defines API endpoints for user management CRUD operations
 */

import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from './userController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const router = express.Router();

/**
 * @swagger
 * /api/v2/users/list:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users with pagination, filtering, and sorting
 *     description: Returns paginated list of users with optional search, filtering, and sorting capabilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/SearchQueryParam'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [email, firstName, lastName, keycloakGlobalRole, isActive, createdDate, lastLoginAt]
 *           default: email
 *         description: Field to sort by
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
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   keycloakId: "660e8400-e29b-41d4-a716-446655440001"
 *                   email: "user@example.com"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   keycloakGlobalRole: "COMPANY_USER"
 *                   isActive: true
 *                   lastLoginAt: "2024-11-23T12:00:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 25
 *                 pages: 3
 *                 hasNext: true
 *                 hasPrev: false
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/users/list"
 *                 method: "GET"
 *                 duration: 189
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/list', authMiddleware, asyncHandler(getUsers));

/**
 * @swagger
 * /api/v2/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get single user by ID
 *     description: Returns user details by UUID
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
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 keycloakId: "660e8400-e29b-41d4-a716-446655440001"
 *                 email: "user@example.com"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 keycloakGlobalRole: "COMPANY_USER"
 *                 isActive: true
 *                 lastLoginAt: "2024-11-23T12:00:00.000Z"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/users/550e8400-e29b-41d4-a716-446655440000"
 *                 method: "GET"
 *                 duration: 45
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authMiddleware, asyncHandler(getUserById));

/**
 * @swagger
 * /api/v2/users/create:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create new user in Keycloak and database
 *     description: Creates user in both Keycloak and database. If user exists in Keycloak, syncs to database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/UserCreateRequest'
 *               - type: object
 *                 required:
 *                   - password
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
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 keycloakId: "660e8400-e29b-41d4-a716-446655440001"
 *                 email: "newuser@example.com"
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 keycloakGlobalRole: "COMPANY_USER"
 *                 isActive: true
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/users/create"
 *                 method: "POST"
 *                 duration: 456
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/create', authMiddleware, asyncHandler(createUser));

/**
 * @swagger
 * /api/v2/users/{id}:
 *   put:
 *     tags:
 *       - Users
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
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 keycloakId: "660e8400-e29b-41d4-a716-446655440001"
 *                 email: "user@example.com"
 *                 firstName: "John"
 *                 lastName: "Updated"
 *                 keycloakGlobalRole: "COMPANY_USER"
 *                 isActive: true
 *                 lastLoginAt: "2024-11-23T12:00:00.000Z"
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/users/550e8400-e29b-41d4-a716-446655440000"
 *                 method: "PUT"
 *                 duration: 234
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authMiddleware, asyncHandler(updateUser));

/**
 * @swagger
 * /api/v2/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Soft delete user by ID
 *     description: Soft deletes user by disabling in Keycloak and marking as inactive in database. Cannot delete own account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UuidPathParam'
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *               message: "User deleted successfully"
 *               data: null
 *               timestamp: "2024-11-23T12:00:00.000Z"
 *               meta:
 *                 requestId: "req-1234567890"
 *                 endpoint: "/api/v2/users/550e8400-e29b-41d4-a716-446655440000"
 *                 method: "DELETE"
 *                 duration: 189
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthenticationRequired'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware, asyncHandler(deleteUser));

export default router;

