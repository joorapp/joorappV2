/**
 * Server entry point for JoorApp Backend API V2
 * This file starts the Express server and handles graceful shutdown
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

// Verify .env file exists and load it
if (existsSync(envPath)) {
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error) {
    console.error('❌ Error loading .env file:', result.error.message);
    process.exit(1);
  }
} else {
  console.error(`❌ Error: .env file not found at: ${envPath}`);
  console.error('   Please create a .env file in the nodeBE directory');
  process.exit(1);
}

import { createApp, registeredModules } from './src/app.js';
import { logInfo, logError, logWarn } from './src/utils/logger.js';
import { initializeDatabase, closeDatabase } from './src/config/database.js';
// Note: App is created after database/models are initialized to avoid import-time errors

// Get configuration from environment variables - NO FALLBACKS
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const NODE_ENV = process.env.NODE_ENV;

// Validate required environment variables
if (!PORT) {
  console.error('❌ Error: PORT environment variable is required');
  console.error('   Please set PORT in your .env file');
  process.exit(1);
}

if (!HOST) {
  console.error('❌ Error: HOST environment variable is required');
  console.error('   Please set HOST in your .env file');
  process.exit(1);
}

if (!NODE_ENV) {
  console.error('❌ Error: NODE_ENV environment variable is required');
  console.error('   Please set NODE_ENV in your .env file');
  process.exit(1);
}

// Initialize database, models, and start server
(async () => {
  try {
    // Step 1: Initialize database connection
    await initializeDatabase();
    logInfo('✅ Database connection initialized successfully');
    
    // Step 2: Import and initialize models (after database is ready)
    const { initializeModels } = await import('./src/models/index.js');
    initializeModels();
    logInfo('✅ Models initialized successfully');
    
    // Step 3: Create Express app (after models are initialized)
    const app = await createApp();
    logInfo('✅ Express app created with routes');
    
    // Step 4: Start the server
    const server = app.listen(PORT, () => {
      // Get the actual server address (handles different environments)
      const serverAddress = server.address();
      const actualHost = serverAddress.address === '::' ? HOST : serverAddress.address;
      
      // Use environment variables for production URLs
      const protocol = NODE_ENV === 'production' ? 'https' : 'http';
      const baseUrl = `${protocol}://${actualHost}:${PORT}`;
      
      // Log server startup information
      logInfo('🚀 JoorApp Backend API V2 is running', {
        port: PORT,
        host: actualHost,
        environment: NODE_ENV,
        baseUrl,
        pid: process.pid,
        nodeVersion: process.version
      });
      
      // Log startup information for console display
      logInfo(`📡 Environment: ${NODE_ENV}`);
      logInfo(`🌐 Server Address: ${baseUrl}`);
      logInfo(`\n\t\t📚 API Documentation:`);
      
      // Dynamically list all module documentation endpoints
      registeredModules.forEach(module => {
        logInfo(`   🔗 ${module.name} Module: ${baseUrl}${module.path}`);
      });
      
      // Only log health endpoints (system-level)
      logInfo(`\n\t\t🔧 Health Endpoints:`);
      logInfo(`   📊 Health Status: ${baseUrl}/api/v2/health/status`);
      logInfo(`   🏓 Health Ping:   ${baseUrl}/api/v2/health/ping`);
      logInfo(`   📈 Health Metrics: ${baseUrl}/api/v2/health/metrics`);
      logInfo(`   🗄️  Health Database: ${baseUrl}/api/v2/health/database`);
      
      logInfo(`\n\t\t🚀 JoorApp Backend API V2 is running on port ${PORT}`);
    });
    
    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      logWarn(`${signal} received. Shutting down gracefully...`);
      
      // Close server
      server.close(async () => {
        logInfo('HTTP server closed');
        
        // Close database connection
        try {
          await closeDatabase();
          logInfo('Database connection closed');
        } catch (error) {
          logError('Error closing database connection', error);
        }
        
        logInfo('Process terminated');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        logError('Forced shutdown after timeout', null, { timeout: '10s' });
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logError('❌ Failed to initialize application', error);
    logError('Server startup failed. Exiting...');
    process.exit(1);
  }
})();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception occurred', err, {
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logError('Unhandled Promise Rejection occurred', err, {
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
  process.exit(1);
});