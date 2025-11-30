/**
 * @author Bhavesh Venugopal
 * Express application configuration
 * This file sets up the Express app with middleware and routes
 * 
 * IMPORTANT: Routes are registered lazily via createApp() to ensure
 * models are initialized before any route handlers try to use them.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Import middleware (safe - no model dependencies)
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger, errorLogger } from './middleware/requestLogger.js';
import { errorLogger as winstonErrorLogger } from './middleware/errorLogger.js';

// Import logger
import { logInfo, logDebug } from './utils/logger.js';

/**
 * Create and configure Express application
 * This function is called AFTER database and models are initialized
 * @returns {Express.Application} Configured Express app
 */
export const createApp = async () => {
  // Import routes HERE (after models are initialized)
  // This prevents import-time database access by deferring route imports
  const { healthRoutes } = await import('./modules/health/index.js');
  const { adminRoutes } = await import('./modules/admin/index.js');
  const { superAdminRoutes } = await import('./modules/superAdmin/index.js');
  const { authRoutes } = await import('./modules/auth/index.js');
  const { userRoutes } = await import('./modules/users/index.js');

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

  // API routes - Module-based routing (registered after models are initialized)
  app.use('/api/v2/health', healthRoutes);
  app.use('/api/v2/auth', authRoutes);
  app.use('/api/v2/admin', adminRoutes);
  app.use('/api/v2/superAdmin', superAdminRoutes);
  app.use('/api/v2/users', userRoutes);

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

  return app;
};

// Module registry for startup logging
// Add new modules here when registering routes above
export const registeredModules = [
  { path: '/api/v2/health', name: 'Health' },
  { path: '/api/v2/auth', name: 'Auth' },
  { path: '/api/v2/admin', name: 'Admin' },
  { path: '/api/v2/superAdmin', name: 'Super Admin' },
  { path: '/api/v2/users', name: 'Users' }
];