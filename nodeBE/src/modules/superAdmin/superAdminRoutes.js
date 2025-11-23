/**
 * @author Bhavesh Venugopal
 * Super Admin Routes
 * Defines API endpoints for super admin functionality
 */

import express from 'express';
import { getUserInfo, getDashboard } from './superAdminController.js';
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

export default router;

