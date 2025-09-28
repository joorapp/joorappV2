/**
 * @author Bhavesh Venugopal
 * Admin Routes
 * Defines API endpoints for administrative functions
 */

import express from 'express';
import { getUsers, getSettings, updateSettings, getStats } from './adminController.js';
import { adminDocs } from './adminDocs.js';

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
 * @route   GET /api/v2/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin
 */
router.get('/users', getUsers);

/**
 * @route   GET /api/v2/admin/settings
 * @desc    Get system settings
 * @access  Admin
 */
router.get('/settings', getSettings);

/**
 * @route   PUT /api/v2/admin/settings
 * @desc    Update system settings
 * @access  Admin
 */
router.put('/settings', updateSettings);

/**
 * @route   GET /api/v2/admin/stats
 * @desc    Get system statistics
 * @access  Admin
 */
router.get('/stats', getStats);

export default router;
