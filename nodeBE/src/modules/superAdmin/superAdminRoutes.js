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
  // User Management
  createUserWithCompany,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignUserToCompany,
  updateUserCompanyRole
} from './superAdminController.js';
import { superAdminDocs } from './superAdminDocs.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/v2/superAdmin
 * @desc    Super Admin module documentation endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Super Admin module documentation',
    data: superAdminDocs,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/v2/superAdmin/user-info
 * @desc    Get current authenticated user info (for testing auth middleware)
 * @access  Protected (requires authentication)
 */
router.get('/user-info', authMiddleware, asyncHandler(getUserInfo));

/**
 * @route   GET /api/v2/superAdmin/dashboard
 * @desc    Get super admin dashboard data
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.get('/dashboard', authMiddleware, asyncHandler(getDashboard));

// =====================================================
// Company Management Routes
// =====================================================

/**
 * @route   POST /api/v2/superAdmin/companies
 * @desc    Create new company
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.post('/companies', authMiddleware, asyncHandler(createCompany));

/**
 * @route   GET /api/v2/superAdmin/companies
 * @desc    Get all companies with pagination and filtering
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.get('/companies', authMiddleware, asyncHandler(getCompanies));

/**
 * @route   GET /api/v2/superAdmin/companies/:id
 * @desc    Get company by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.get('/companies/:id', authMiddleware, asyncHandler(getCompanyById));

/**
 * @route   PUT /api/v2/superAdmin/companies/:id
 * @desc    Update company by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.put('/companies/:id', authMiddleware, asyncHandler(updateCompany));

/**
 * @route   DELETE /api/v2/superAdmin/companies/:id
 * @desc    Delete (soft delete) company by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.delete('/companies/:id', authMiddleware, asyncHandler(deleteCompany));

// =====================================================
// Role Management Routes
// =====================================================

/**
 * @route   POST /api/v2/superAdmin/roles
 * @desc    Create new role
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.post('/roles', authMiddleware, asyncHandler(createRole));

/**
 * @route   GET /api/v2/superAdmin/roles
 * @desc    Get all roles with pagination
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.get('/roles', authMiddleware, asyncHandler(getRoles));

/**
 * @route   GET /api/v2/superAdmin/roles/:id
 * @desc    Get role by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.get('/roles/:id', authMiddleware, asyncHandler(getRoleById));

/**
 * @route   PUT /api/v2/superAdmin/roles/:id
 * @desc    Update role by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.put('/roles/:id', authMiddleware, asyncHandler(updateRole));

/**
 * @route   DELETE /api/v2/superAdmin/roles/:id
 * @desc    Delete (soft delete) role by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.delete('/roles/:id', authMiddleware, asyncHandler(deleteRole));

// =====================================================
// User Management Routes
// =====================================================

/**
 * @route   POST /api/v2/superAdmin/users
 * @desc    Create user with optional company assignment
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.post('/users', authMiddleware, asyncHandler(createUserWithCompany));

/**
 * @route   GET /api/v2/superAdmin/users
 * @desc    Get all users (cross-company) with pagination
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.get('/users', authMiddleware, asyncHandler(getUsers));

/**
 * @route   GET /api/v2/superAdmin/users/:id
 * @desc    Get user by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.get('/users/:id', authMiddleware, asyncHandler(getUserById));

/**
 * @route   PUT /api/v2/superAdmin/users/:id
 * @desc    Update user by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.put('/users/:id', authMiddleware, asyncHandler(updateUser));

/**
 * @route   DELETE /api/v2/superAdmin/users/:id
 * @desc    Delete (deactivate) user by ID
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.delete('/users/:id', authMiddleware, asyncHandler(deleteUser));

/**
 * @route   POST /api/v2/superAdmin/users/:id/assign
 * @desc    Assign user to company with role
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.post('/users/:id/assign', authMiddleware, asyncHandler(assignUserToCompany));

/**
 * @route   PUT /api/v2/superAdmin/users/:id/companies/:companyId/role
 * @desc    Update user's role in a company
 * @access  Protected (requires SUPER_ADMIN role)
 */
router.put('/users/:id/companies/:companyId/role', authMiddleware, asyncHandler(updateUserCompanyRole));

export default router;

