/**
 * @author Bhavesh Venugopal
 * Database Configuration
 * Sequelize connection setup for PostgreSQL
 */

import { Sequelize } from 'sequelize';
import { createModuleLogger, logError } from '../utils/logger.js';
import { format as sqlFormatter } from 'sql-formatter';

// Create module-specific logger
const logger = createModuleLogger('database');

// Validate required environment variables
// const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'DB_HOST'];
// const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// if (missingVars.length > 0) {
//   logError('Missing required database environment variables', null, {
//     missingVars,
//     module: 'database'
//   });
//   throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
// }

// Determine if we should use beautified SQL logging
const isLocalEnvironment = process.env.NODE_ENV === 'development' || 
                          process.env.NODE_ENV === 'local' ||
                          !process.env.NODE_ENV;

/**
 * Create beautified SQL logger with parameter extraction
 * @returns {Function|false} Logging function or false to disable
 */
const createSqlLogger = () => {
  if (!isLocalEnvironment) {
    return false; // Disable detailed logging in production
  }

  return (queryString, timing) => {
    try {
      // Extract SQL query and parameters from Sequelize logging callback
      // Sequelize passes: (queryString, timing) or sometimes an object
      let sqlQuery = '';
      let parameters = null;
      let queryType = 'query';
      
      // Handle different Sequelize callback formats
      if (typeof queryString === 'string') {
        // Standard format: Sequelize passes SQL string directly
        sqlQuery = queryString;
        
        // Try to extract parameters from the query string if they're embedded
        // Some Sequelize versions embed parameters in the message
        const paramMatch = queryString.match(/bind:\s*\[(.*?)\]/);
        if (paramMatch) {
          try {
            const paramString = paramMatch[1].trim();
            if (paramString) {
              parameters = paramString.split(',').map(p => {
                const trimmed = p.trim();
                try {
                  return JSON.parse(trimmed);
                } catch {
                  return trimmed;
                }
              });
            }
          } catch (e) {
            // Couldn't parse parameters from string
          }
        }
      } else if (queryString && typeof queryString === 'object') {
        // Sequelize v6+ might pass an object with sql and bind properties
        sqlQuery = queryString.sql || queryString.query || String(queryString);
        parameters = queryString.bind || queryString.bindings || queryString.parameters;
        queryType = queryString.type || 'query';
      } else {
        sqlQuery = String(queryString);
      }

      // Format SQL query using sql-formatter
      let formattedSql = sqlQuery;
      try {
        formattedSql = sqlFormatter(sqlQuery, {
          language: 'postgresql',
          uppercase: true,
          linesBetweenQueries: 2
        });
      } catch (formatError) {
        // If formatting fails, use original query
        formattedSql = sqlQuery;
      }

      // Enhance parameters with position and type information
      let enhancedParameters = null;
      if (parameters && Array.isArray(parameters) && parameters.length > 0) {
        enhancedParameters = parameters.map((param, index) => {
          const paramValue = param;
          return {
            position: index + 1,
            placeholder: `$${index + 1}`,
            value: paramValue,
            type: typeof paramValue === 'string' ? 'string' : 
                  typeof paramValue === 'number' ? 'number' :
                  typeof paramValue === 'boolean' ? 'boolean' :
                  paramValue === null ? 'null' : 'object'
          };
        });
      }

      // Log SQL query with beautified format
      logger.debug('SQL Query Executed', {
        query: formattedSql,
        rawQuery: sqlQuery,
        parameters: enhancedParameters || parameters,
        parameterCount: parameters ? parameters.length : 0,
        queryType: queryType,
        executionTime: timing
      });

    } catch (error) {
      // Fallback logging if parsing fails
      logger.debug('SQL Query (unformatted)', {
        originalMessage: String(queryString),
        error: {
          message: error.message,
          stack: error.stack
        }
      });
    }
  };
};

// Lazy database configuration getter
const getDbConfig = () => {
  // Validate required environment variables
  const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'DB_HOST'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logError('Missing required database environment variables', null, {
      missingVars,
      module: 'database'
    });
    throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
  }

  return {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: 'postgres',
    logging: createSqlLogger(),
    benchmark: true,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  };
};

// Lazy Sequelize instance
let sequelizeInstance = null;

const getSequelize = () => {
  if (!sequelizeInstance) {
    const dbConfig = getDbConfig(); // This validates and gets config
    
    // Always use individual config values for consistency
    // This ensures credentials come from a single source (DB_* env vars)
    sequelizeInstance = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        benchmark: dbConfig.benchmark,
        pool: dbConfig.pool,
        define: dbConfig.define
      }
    );
  }
  return sequelizeInstance;
};

/**
 * Test database connection
 * @returns {Promise<Object>} Connection test result
 */
export const testDatabaseConnection = async () => {
  try {
    const dbConfig = getDbConfig();
    const sequelize = getSequelize();
    
    logger.info('Testing database connection', {
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username
    });

    await sequelize.authenticate();
    
    logger.info('Database connection successful', {
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    });

    return {
      success: true,
      message: 'Database connection successful',
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      sequelizeVersion: Sequelize.version
    };
  } catch (error) {
    let dbConfig = {};
    try {
      dbConfig = getDbConfig();
    } catch {
      // Config validation failed, use empty object
    }
    
    logError('Database connection failed', error, {
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    });

    return {
      success: false,
      message: 'Database connection failed',
      error: error.message,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    };
  }
};

/**
 * Initialize database connection
 * Call this on application startup
 * @returns {Promise<void>}
 */
export const initializeDatabase = async () => {
  try {
    const dbConfig = getDbConfig();
    
    logger.info('Initializing database connection', {
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    });

    const connectionResult = await testDatabaseConnection();
    
    if (!connectionResult.success) {
      throw new Error(`Database initialization failed: ${connectionResult.error}`);
    }

    logger.info('Database initialized successfully', {
      database: dbConfig.database,
      sequelizeVersion: Sequelize.version
    });
  } catch (error) {
    logError('Database initialization failed', error, {
      database: (() => {
        try {
          return getDbConfig().database;
        } catch {
          return 'unknown';
        }
      })()
    });
    throw error;
  }
};

/**
 * Close database connection
 * Call this on application shutdown
 * @returns {Promise<void>}
 */
export const closeDatabase = async () => {
  try {
    logger.info('Closing database connection');
    if (sequelizeInstance) {
      await sequelizeInstance.close();
    }
    logger.info('Database connection closed successfully');
  } catch (error) {
    logError('Error closing database connection', error);
    throw error;
  }
};

// Export Sequelize instance with lazy initialization
export const sequelize = new Proxy({}, {
  get(target, prop) {
    const instance = getSequelize();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default sequelize;

