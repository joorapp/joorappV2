/**
 * @author Bhavesh Venugopal
 * Winston Logger Configuration
 * Centralized logging configuration for the application
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables - NO FALLBACKS
// const requiredEnvVars = ['LOG_FILE_PATH', 'LOG_MAX_SIZE', 'LOG_MAX_FILES'];
// const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// if (missingVars.length > 0) {
//   console.error('❌ Error: Missing required logging environment variables');
//   console.error(`   Missing: ${missingVars.join(', ')}`);
//   console.error('   Please set these in your .env file');
//   process.exit(1);
// }

// Log levels are hardcoded per transport (no LOG_LEVEL env var needed)
// app.log: 'info' (logs error, warn, info)
// console: 'debug' in dev, 'info' in prod
// error.log: 'error' (only errors)
// access.log: 'http' (only http level)
// sql.log: 'debug' (all levels, but filtered to SQL messages only)
const defaultLogLevel = 'info';
const consoleLogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Log levels configuration
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Log colors for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// Add colors to winston
winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `[${timestamp}] ${level}: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` - ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports = [];

// Console transport for development
// Level: 'debug' in development, 'info' in production
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: consoleLogLevel,
      format: consoleFormat
    })
  );
}

// File transports
// EXCEPTION: Using fallbacks for log file config (temporary until dotenv issue resolved)
const logDir = process.env.LOG_FILE_PATH || './logs';
const logMaxSize = process.env.LOG_MAX_SIZE || '10m';
const logMaxFiles = process.env.LOG_MAX_FILES || '5d';

// Application logs
// Level: 'info' (logs error, warn, info - but NOT http or debug)
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'app-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    maxSize: logMaxSize,
    maxFiles: logMaxFiles,
    level: defaultLogLevel,
    format: fileFormat
  })
);

// Error logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    maxSize: logMaxSize,
    maxFiles: logMaxFiles,
    level: 'error',
    format: fileFormat
  })
);

// HTTP access logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'access-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    maxSize: logMaxSize,
    maxFiles: logMaxFiles,
    level: 'http',
    format: fileFormat
  })
);

// SQL query logs - readable format (no escape sequences)
const sqlLogFormat = winston.format.printf(({ timestamp, level, message, query, parameters, queryType, executionTime, ...meta }) => {
  let output = `\n${'='.repeat(80)}\n`;
  output += `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
  output += `${'='.repeat(80)}\n`;
  
  if (query) {
    output += `SQL Query:\n${query}\n`;
  }
  
  if (parameters && parameters.length > 0) {
    output += `\nParameters:\n`;
    parameters.forEach((param, index) => {
      if (typeof param === 'object' && param.position !== undefined) {
        // Detailed parameter object
        output += `  ${param.placeholder || `$${param.position}`}: ${JSON.stringify(param.value)} (${param.type || 'unknown'})\n`;
      } else {
        // Simple parameter
        output += `  $${index + 1}: ${JSON.stringify(param)}\n`;
      }
    });
  }
  
  if (queryType) {
    output += `\nQuery Type: ${queryType}\n`;
  }
  
  if (executionTime !== undefined && executionTime !== null) {
    output += `\nExecution Time: ${executionTime}ms\n`;
  }
  
  if (Object.keys(meta).length > 0) {
    output += `\nAdditional Info: ${JSON.stringify(meta, null, 2)}\n`;
  }
  
  output += `${'='.repeat(80)}\n`;
  return output;
});

// SQL query logs transport - ONLY SQL-related logs go here
// Filter: Only logs with message 'SQL Query Executed' or 'SQL Query (unformatted)'
const sqlLogFilter = winston.format((info) => {
  // Only pass through SQL-related log messages
  if (info.message === 'SQL Query Executed' || info.message === 'SQL Query (unformatted)') {
    return info;
  }
  // Return false to exclude this log from SQL transport
  return false;
})();

transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'sql-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    maxSize: logMaxSize,
    maxFiles: logMaxFiles,
    level: 'debug',
    format: winston.format.combine(
      sqlLogFilter, // Filter first - only SQL logs pass through
      winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
      sqlLogFormat
    )
  })
);

// Create the logger
// Main logger level: 'info' (logs error, warn, info - but NOT http or debug)
const logger = winston.createLogger({
  level: defaultLogLevel,
  levels: logLevels,
  format: fileFormat,
  transports,
  exitOnError: false
});

// Add request ID and user context to logs
logger.addRequestContext = (req, res, next) => {
  req.logger = logger.child({
    requestId: req.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: req.user?.id || 'anonymous',
    ip: req.ip || req.socket?.remoteAddress,
    userAgent: req.get('User-Agent') || 'unknown'
  });
  next();
};

export default logger;
