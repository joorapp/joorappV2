/**
 * Server entry point for JoorApp Backend API V2
 * This file starts the Express server and handles graceful shutdown
 */

import dotenv from 'dotenv';
import app from './src/app.js';
import { logInfo, logError, logWarn } from './src/utils/logger.js';

dotenv.config();

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

// Start the server
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
  logInfo(`\n📚 API Documentation:`);
  logInfo(`   🔗 Health Module: ${baseUrl}/api/v2/health`);
  logInfo(`   🔗 Admin Module:  ${baseUrl}/api/v2/admin`);
  logInfo(`\n🔧 API Endpoints:`);
  logInfo(`   📊 Health Status: ${baseUrl}/api/v2/health/status`);
  logInfo(`   🏓 Health Ping:   ${baseUrl}/api/v2/health/ping`);
  logInfo(`   📈 Health Metrics: ${baseUrl}/api/v2/health/metrics`);
  logInfo(`   👥 Admin Users:   ${baseUrl}/api/v2/admin/users`);
  logInfo(`   ⚙️  Admin Settings: ${baseUrl}/api/v2/admin/settings`);
  logInfo(`   📊 Admin Stats:   ${baseUrl}/api/v2/admin/stats`);
  logInfo(`🚀 JoorApp Backend API V2 is running on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logWarn('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logInfo('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logWarn('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logInfo('Process terminated');
    process.exit(0);
  });
});

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