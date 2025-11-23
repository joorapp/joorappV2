/**
 * @author Bhavesh Venugopal
 * Health Routes
 * Defines API endpoints for health checks and system monitoring
 */

import express from 'express';
import { getHealthStatus, getPing, getSystemMetrics, getDatabaseHealth } from './healthController.js';
import { healthDocs } from './healthDocs.js';

const router = express.Router();

/**
 * @route   GET /api/v2/health
 * @desc    Health module documentation endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Health module documentation',
    data: healthDocs,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/v2/health/status
 * @desc    Get comprehensive system health status
 * @access  Public
 */
router.get('/status', getHealthStatus);

/**
 * @route   GET /api/v2/health/ping
 * @desc    Simple ping test
 * @access  Public
 */
router.get('/ping', getPing);

/**
 * @route   GET /api/v2/health/metrics
 * @desc    Get detailed system metrics
 * @access  Public
 */
router.get('/metrics', getSystemMetrics);

/**
 * @route   GET /api/v2/health/database
 * @desc    Get database connection health status
 * @access  Public
 */
router.get('/database', getDatabaseHealth);

export default router;
