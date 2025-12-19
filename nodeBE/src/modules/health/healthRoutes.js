/**
 * @author Bhavesh Venugopal
 * Health Routes
 * Defines API endpoints for health checks and system monitoring
 */

import express from 'express';
import { getHealthStatus, getPing, getSystemMetrics, getDatabaseHealth } from './healthController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v2/health/status:
 *   get:
 *     tags:
 *       - Health
 *     summary: Get comprehensive system health status
 *     description: "Returns detailed system health information including uptime, memory usage, environment details, and system metrics. Note: Health endpoints do not include the meta field."
 *     responses:
 *       200:
 *         description: System health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                   example: 123.456
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: string
 *                       example: "25 MB"
 *                     total:
 *                       type: string
 *                       example: "50 MB"
 *             example:
 *               success: true
 *               message: "API is running"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               uptime: 123.456
 *               environment: "development"
 *               version: "2.0.0"
 *               memory:
 *                 used: "25 MB"
 *                 total: "50 MB"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/status', getHealthStatus);

/**
 * @swagger
 * /api/v2/health/ping:
 *   get:
 *     tags:
 *       - Health
 *     summary: Simple ping test
 *     description: "Returns a simple ping response to verify API connectivity and basic functionality. Note: Health endpoints do not include the meta field."
 *     responses:
 *       200:
 *         description: Ping successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pong!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 *                 responseTime:
 *                   type: string
 *                   example: "2ms"
 *             example:
 *               success: true
 *               message: "Pong!"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               responseTime: "2ms"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/ping', getPing);

/**
 * @swagger
 * /api/v2/health/metrics:
 *   get:
 *     tags:
 *       - Health
 *     summary: Get detailed system metrics
 *     description: "Returns comprehensive system information including platform, architecture, memory usage, CPU usage, and environment details. Note: Health endpoints do not include the meta field."
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "System metrics retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     system:
 *                       type: object
 *                       properties:
 *                         platform:
 *                           type: string
 *                           example: "win32"
 *                         arch:
 *                           type: string
 *                           example: "x64"
 *                         nodeVersion:
 *                           type: string
 *                           example: "v18.0.0"
 *                         uptime:
 *                           type: number
 *                           example: 123.456
 *                     memory:
 *                       type: object
 *                       description: Node.js memory usage object
 *                     cpu:
 *                       type: object
 *                       description: Node.js CPU usage object
 *                     environment:
 *                       type: object
 *                       properties:
 *                         nodeEnv:
 *                           type: string
 *                           example: "development"
 *                         port:
 *                           type: number
 *                           example: 3030
 *                         corsOrigin:
 *                           type: string
 *                           example: "http://localhost:3000"
 *             example:
 *               success: true
 *               message: "System metrics retrieved successfully"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               metrics:
 *                 system:
 *                   platform: "win32"
 *                   arch: "x64"
 *                   nodeVersion: "v18.0.0"
 *                   uptime: 123.456
 *                 memory:
 *                   rss: 50000000
 *                   heapTotal: 30000000
 *                   heapUsed: 20000000
 *                 cpu:
 *                   user: 1000000
 *                   system: 500000
 *                 environment:
 *                   nodeEnv: "development"
 *                   port: 3030
 *                   corsOrigin: "http://localhost:3000"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/metrics', getSystemMetrics);

/**
 * @swagger
 * /api/v2/health/database:
 *   get:
 *     tags:
 *       - Health
 *     summary: Get database connection health status
 *     description: "Returns database connection status, connection details, and health information. Returns 503 if database is unhealthy, 500 for server errors. Note: Health endpoints do not include the meta field."
 *     responses:
 *       200:
 *         description: Database connection is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Database connection is healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 *                 responseTime:
 *                   type: string
 *                   example: "45ms"
 *                 database:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                       example: true
 *                     database:
 *                       type: string
 *                       example: "joorapp"
 *                     host:
 *                       type: string
 *                       example: "localhost"
 *                     port:
 *                       type: number
 *                       example: 5432
 *                     sequelizeVersion:
 *                       type: string
 *                       example: "6.35.0"
 *             example:
 *               success: true
 *               message: "Database connection is healthy"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               responseTime: "45ms"
 *               database:
 *                 connected: true
 *                 database: "joorapp"
 *                 host: "localhost"
 *                 port: 5432
 *                 sequelizeVersion: "6.35.0"
 *       503:
 *         description: Database connection is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection is unhealthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 *                 responseTime:
 *                   type: string
 *                   example: "100ms"
 *                 database:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                       example: false
 *                     database:
 *                       type: string
 *                       example: "joorapp"
 *                     host:
 *                       type: string
 *                       example: "localhost"
 *                     port:
 *                       type: number
 *                       example: 5432
 *                     error:
 *                       type: string
 *                       example: "Connection timeout"
 *             example:
 *               success: false
 *               message: "Database connection is unhealthy"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               responseTime: "100ms"
 *               database:
 *                 connected: false
 *                 database: "joorapp"
 *                 host: "localhost"
 *                 port: 5432
 *                 error: "Connection timeout"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/database', getDatabaseHealth);

export default router;
