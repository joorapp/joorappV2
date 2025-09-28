/**
 * @author Bhavesh Venugopal
 * Express application configuration
 * This file sets up the Express app with middleware and routes
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Import modules
import { healthRoutes } from './modules/health/index.js';
import { adminRoutes } from './modules/admin/index.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger, errorLogger } from './middleware/requestLogger.js';
import { errorLogger as winstonErrorLogger } from './middleware/errorLogger.js';

// Import logger
import { logInfo, logDebug } from './utils/logger.js';

// Create Express app
const app = express();

// CORS configuration - NO FALLBACKS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (replaces Morgan)
app.use(requestLogger);

// Logging middleware for non-test environments
if (process.env.NODE_ENV !== 'test') {
  // Use Winston-based logging instead of Morgan
  logInfo('Application middleware initialized', {
    environment: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN
  });
}

// Request logging middleware
app.use((req, res, next) => {
  logDebug('Request received', {
    method: req.method,
    path: req.path,
    requestId: req.id,
    ip: req.ip || req.socket?.remoteAddress
  });
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  logInfo('Root endpoint accessed', {
    requestId: req.id,
    ip: req.ip || req.socket?.remoteAddress
  });
  
  res.json({
    success: true,
    message: 'JoorApp Backend API V2',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes - Module-based routing
app.use('/api/v2/health', healthRoutes);
app.use('/api/v2/admin', adminRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  logInfo('Route not found', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.socket?.remoteAddress
  });
  
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error logging middleware (must be before error handler)
app.use(winstonErrorLogger);
app.use(errorLogger);

// Global error handler middleware (must be last)
app.use(errorHandler);

export default app;