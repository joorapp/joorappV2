/**
 * @author Bhavesh Venugopal
 * Auth Routes
 * Defines API endpoints for authentication and company selection
 */

import express from 'express';
import { login, getUserCompanies, selectCompany, getCurrentContext, refreshToken, logout } from './authController.js';
import { authDocs } from './authDocs.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/v2/auth
 * @desc    Auth module documentation endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth module documentation',
    data: authDocs,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/v2/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', asyncHandler(login));

/**
 * @route   GET /api/v2/auth/companies
 * @desc    Get user's associated companies
 * @access  Protected (requires authentication)
 */
router.get('/companies', authMiddleware, asyncHandler(getUserCompanies));

/**
 * @route   POST /api/v2/auth/companies/:companyId/select
 * @desc    Select company for current session
 * @access  Protected (requires authentication)
 */
router.post('/companies/:companyId/select', authMiddleware, asyncHandler(selectCompany));

/**
 * @route   GET /api/v2/auth/context
 * @desc    Get current company context for session
 * @access  Protected (requires authentication)
 */
router.get('/context', authMiddleware, asyncHandler(getCurrentContext));

/**
 * @route   POST /api/v2/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', asyncHandler(refreshToken));

/**
 * @route   POST /api/v2/auth/logout
 * @desc    Logout user and invalidate session
 * @access  Protected (requires authentication)
 */
router.post('/logout', authMiddleware, asyncHandler(logout));

export default router;

