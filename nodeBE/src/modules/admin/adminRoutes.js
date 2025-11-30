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
import { adminDocs } from './adminDocs.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { companyContextMiddleware } from '../../middleware/companyContextMiddleware.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/v2/admin
 * @desc    Admin module documentation endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin module documentation',
    data: adminDocs,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/v2/admin/settings
 * @desc    Get system settings
 * @access  Admin (requires authentication)
 */
router.get('/settings', authMiddleware, asyncHandler(getSettings));

/**
 * @route   PUT /api/v2/admin/settings
 * @desc    Update system settings
 * @access  Admin (requires authentication)
 */
router.put('/settings', authMiddleware, asyncHandler(updateSettings));

/**
 * @route   GET /api/v2/admin/stats
 * @desc    Get system statistics
 * @access  Admin (requires authentication)
 */
router.get('/stats', authMiddleware, asyncHandler(getStats));

// =====================================================
// Company-Scoped User Management Routes
// =====================================================

/**
 * @route   POST /api/v2/admin/users
 * @desc    Create user in company
 * @access  Protected (requires COMPANY_ADMIN role and company context)
 */
router.post('/users', authMiddleware, companyContextMiddleware, asyncHandler(createUserInCompany));

/**
 * @route   GET /api/v2/admin/users
 * @desc    Get company users with pagination
 * @access  Protected (requires COMPANY_ADMIN role and company context)
 */
router.get('/users', authMiddleware, companyContextMiddleware, asyncHandler(getCompanyUsers));

/**
 * @route   GET /api/v2/admin/users/:id
 * @desc    Get company user by ID
 * @access  Protected (requires COMPANY_ADMIN role and company context)
 */
router.get('/users/:id', authMiddleware, companyContextMiddleware, asyncHandler(getCompanyUserById));

/**
 * @route   PUT /api/v2/admin/users/:id
 * @desc    Update company user by ID
 * @access  Protected (requires COMPANY_ADMIN role and company context)
 */
router.put('/users/:id', authMiddleware, companyContextMiddleware, asyncHandler(updateCompanyUser));

/**
 * @route   DELETE /api/v2/admin/users/:id
 * @desc    Remove user from company
 * @access  Protected (requires COMPANY_ADMIN role and company context)
 */
router.delete('/users/:id', authMiddleware, companyContextMiddleware, asyncHandler(removeUserFromCompany));

/**
 * @route   PUT /api/v2/admin/users/:id/role
 * @desc    Update user's role in company
 * @access  Protected (requires COMPANY_ADMIN role and company context)
 */
router.put('/users/:id/role', authMiddleware, companyContextMiddleware, asyncHandler(updateUserRole));

export default router;
