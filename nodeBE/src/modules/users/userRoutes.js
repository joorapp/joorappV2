/**
 * @author Bhavesh Venugopal
 * User Routes
 * Defines API endpoints for user management CRUD operations
 */

import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from './userController.js';
import { userDocs } from './userDocs.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/v2/users
 * @desc    Users module documentation endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Users module documentation',
    data: userDocs,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/v2/users/list
 * @desc    Get all users with pagination, filtering, and sorting
 * @access  Protected (requires Bearer token)
 */
router.get('/list', authMiddleware, asyncHandler(getUsers));

/**
 * @route   GET /api/v2/users/:id
 * @desc    Get single user by ID
 * @access  Protected (requires Bearer token)
 */
router.get('/:id', authMiddleware, asyncHandler(getUserById));

/**
 * @route   POST /api/v2/users
 * @desc    Create new user
 * @access  Protected (requires Bearer token)
 */
router.post('/', authMiddleware, asyncHandler(createUser));

/**
 * @route   PUT /api/v2/users/:id
 * @desc    Update user by ID
 * @access  Protected (requires Bearer token)
 */
router.put('/:id', authMiddleware, asyncHandler(updateUser));

/**
 * @route   DELETE /api/v2/users/:id
 * @desc    Soft delete user by ID
 * @access  Protected (requires Bearer token)
 */
router.delete('/:id', authMiddleware, asyncHandler(deleteUser));

export default router;

