/**
 * @author Bhavesh Venugopal
 * Admin Routes
 * Defines API endpoints for administrative functions
 */

import express from 'express';
import { getSettings, updateSettings, getStats } from './adminController.js';
import { adminDocs } from './adminDocs.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
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

export default router;
