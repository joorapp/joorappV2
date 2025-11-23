/**
 * @author Bhavesh Venugopal
 * Configure First Super Admin Script
 * Creates initial super admin user in Keycloak and database, sets up system company and roles
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

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

import { initializeDatabase, closeDatabase } from '../src/config/database.js';
import { getAdminClient } from '../src/services/keycloakService.js';
import { createModuleLogger, logInfo, logError, logWarn } from '../src/utils/logger.js';
import { SUPER_ADMIN_COMPANY_NAME, SUPER_ADMIN_DEFAULT_ROLE_NAME, SUPER_ADMIN_DEFAULT_ROLE_CODE } from '../src/constants/superAdmin.js';

const logger = createModuleLogger('configure-super-admin');

// Super Admin Configuration
const SUPER_ADMIN_CONFIG = {
  email: 'joorapp.admin@yopmail.com',
  firstName: 'Joorapp',
  lastName: 'Admin',
  password: process.env.SUPER_ADMIN_PASSWORD || 'admin',
  keycloakGlobalRole: 'SUPER_ADMIN'
};

/**
 * Create super admin user in Keycloak
 * @param {Object} kcAdminClient - Keycloak admin client
 * @returns {Promise<Object>} Created user object with Keycloak ID
 */
const createKeycloakUser = async (kcAdminClient) => {
  try {
    logger.info('Checking if Keycloak user exists...', { email: SUPER_ADMIN_CONFIG.email });

    // Check if user already exists
    let existingUsers;
    try {
      existingUsers = await kcAdminClient.users.find({
        email: SUPER_ADMIN_CONFIG.email,
        exact: true
      });
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        logError('Keycloak client lacks permissions to manage users', error);
        logger.error('\n❌ PERMISSION ERROR: Keycloak client service account needs user management roles');
        logger.error('   To fix this:');
        logger.error('   1. Go to Keycloak Admin Console → Clients → Joor_App_Client');
        logger.error('   2. Go to "Service accounts roles" tab');
        logger.error('   3. Click "Assign role" → Filter by "realm roles"');
        logger.error('   4. Assign these roles:');
        logger.error('      - view-users');
        logger.error('      - manage-users');
        logger.error('      - view-realm');
        logger.error('      - manage-realm');
        logger.error('      - query-users');
        logger.error('   5. Save and try again\n');
        throw new Error('Keycloak client lacks user management permissions. Please assign service account roles in Keycloak Admin Console.');
      }
      throw error;
    }

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      logger.info('Keycloak user already exists', {
        keycloakId: existingUser.id,
        email: SUPER_ADMIN_CONFIG.email
      });

      // Verify user has SUPER_ADMIN role
      let userRoles;
      try {
        userRoles = await kcAdminClient.users.listRealmRoleMappings({
          id: existingUser.id
        });
      } catch (error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          logger.warn('Cannot verify user roles (permission issue), continuing...');
          userRoles = [];
        } else {
          throw error;
        }
      }

      const hasSuperAdminRole = userRoles.some(role => role.name === 'SUPER_ADMIN');
      if (!hasSuperAdminRole) {
        logger.warn('Existing user does not have SUPER_ADMIN role, assigning...');
        try {
          const superAdminRole = await kcAdminClient.roles.findOneByName({
            name: 'SUPER_ADMIN'
          });
          await kcAdminClient.users.addRealmRoleMappings({
            id: existingUser.id,
            roles: [superAdminRole]
          });
          logger.info('SUPER_ADMIN role assigned to existing user');
        } catch (error) {
          if (error.message.includes('403') || error.message.includes('Forbidden')) {
            logger.error('Cannot assign role (permission issue). Please assign SUPER_ADMIN role manually in Keycloak.');
            throw new Error('Keycloak client lacks permission to assign roles. Please assign SUPER_ADMIN role manually.');
          }
          throw error;
        }
      }

      return {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName
      };
    }

    // Create new user
    logger.info('Creating new Keycloak user...', { email: SUPER_ADMIN_CONFIG.email });

    const newUser = await kcAdminClient.users.create({
      email: SUPER_ADMIN_CONFIG.email,
      firstName: SUPER_ADMIN_CONFIG.firstName,
      lastName: SUPER_ADMIN_CONFIG.lastName,
      enabled: true,
      emailVerified: true,
      username: SUPER_ADMIN_CONFIG.email
    });

    // Set password
    await kcAdminClient.users.resetPassword({
      id: newUser.id,
      credential: {
        temporary: false,
        type: 'password',
        value: SUPER_ADMIN_CONFIG.password
      }
    });

    // Assign SUPER_ADMIN role
    const superAdminRole = await kcAdminClient.roles.findOneByName({
      name: 'SUPER_ADMIN'
    });

    await kcAdminClient.users.addRealmRoleMappings({
      id: newUser.id,
      roles: [superAdminRole]
    });

    logger.info('SUPER_ADMIN realm role assigned to user');

    logger.info('Keycloak user created successfully', {
      keycloakId: newUser.id,
      email: SUPER_ADMIN_CONFIG.email
    });

    return {
      id: newUser.id,
      email: SUPER_ADMIN_CONFIG.email,
      firstName: SUPER_ADMIN_CONFIG.firstName,
      lastName: SUPER_ADMIN_CONFIG.lastName
    };
  } catch (error) {
    logError('Failed to create Keycloak user', error);
    throw error;
  }
};

/**
 * Create or get super admin user in database
 * @param {Object} keycloakUser - Keycloak user object
 * @returns {Promise<Object>} Database user object
 */
const createDatabaseUser = async (keycloakUser) => {
  try {
    // Dynamically import models to avoid import-time database access
    const { User } = await import('../src/models/index.js');

    logger.info('Checking if database user exists...', { keycloakId: keycloakUser.id });

    // Check if user already exists
    let dbUser = await User.findOne({
      where: {
        keycloakId: keycloakUser.id
      }
    });

    if (dbUser) {
      logger.info('Database user already exists', {
        userId: dbUser.id,
        keycloakId: keycloakUser.id,
        email: dbUser.email
      });

      // Update user data if needed
      const needsUpdate = 
        dbUser.email !== keycloakUser.email ||
        dbUser.firstName !== keycloakUser.firstName ||
        dbUser.lastName !== keycloakUser.lastName ||
        dbUser.keycloakGlobalRole !== SUPER_ADMIN_CONFIG.keycloakGlobalRole;

      if (needsUpdate) {
        dbUser.email = keycloakUser.email;
        dbUser.firstName = keycloakUser.firstName;
        dbUser.lastName = keycloakUser.lastName;
        dbUser.keycloakGlobalRole = SUPER_ADMIN_CONFIG.keycloakGlobalRole;
        await dbUser.save();
        logger.info('Database user updated');
      }

      return dbUser;
    }

    // Create new user
    logger.info('Creating new database user...');

    dbUser = await User.create({
      keycloakId: keycloakUser.id,
      email: keycloakUser.email,
      firstName: keycloakUser.firstName,
      lastName: keycloakUser.lastName,
      keycloakGlobalRole: SUPER_ADMIN_CONFIG.keycloakGlobalRole,
      isActive: true
    });

    logger.info('Database user created successfully', {
      userId: dbUser.id,
      keycloakId: dbUser.keycloakId,
      email: dbUser.email
    });

    return dbUser;
  } catch (error) {
    logError('Failed to create database user', error);
    throw error;
  }
};

/**
 * Create or get "JOOR APP" company
 * @param {Object} superAdminUser - Super admin user object
 * @returns {Promise<Object>} Company object
 */
const createJoorAppCompany = async (superAdminUser) => {
  try {
    // Dynamically import models to avoid import-time database access
    const { Company } = await import('../src/models/index.js');

    logger.info('Checking if JOOR APP company exists...', { name: SUPER_ADMIN_COMPANY_NAME });

    // Check if company already exists
    let company = await Company.findOne({
      where: {
        name: SUPER_ADMIN_COMPANY_NAME,
        isDeleted: false
      }
    });

    if (company) {
      logger.info('JOOR APP company already exists', {
        companyId: company.id,
        name: company.name
      });
      return company;
    }

    // Create new company
    logger.info('Creating JOOR APP company...');

    company = await Company.create({
      name: SUPER_ADMIN_COMPANY_NAME,
      isActive: true
    }, {
      context: {
        userId: superAdminUser.id,
        companyId: null // System company - no company created it
      }
    });

    logger.info('JOOR APP company created successfully', {
      companyId: company.id,
      name: company.name
    });

    return company;
  } catch (error) {
    logError('Failed to create JOOR APP company', error);
    throw error;
  }
};

/**
 * Create or get "CompanyAdmin" role
 * @param {Object} superAdminUser - Super admin user object
 * @param {Object} joorAppCompany - JOOR APP company object
 * @returns {Promise<Object>} CompanyRole object
 */
const createCompanyAdminRole = async (superAdminUser, joorAppCompany) => {
  try {
    // Dynamically import models to avoid import-time database access
    const { CompanyRole } = await import('../src/models/index.js');

    logger.info('Checking if CompanyAdmin role exists...', { name: SUPER_ADMIN_DEFAULT_ROLE_NAME });

    // Check if role already exists
    let role = await CompanyRole.findOne({
      where: {
        name: SUPER_ADMIN_DEFAULT_ROLE_NAME,
        isDeleted: false
      }
    });

    if (role) {
      logger.info('CompanyAdmin role already exists', {
        roleId: role.id,
        name: role.name,
        code: role.code
      });
      return role;
    }

    // Create new role
    logger.info('Creating CompanyAdmin role...');

    role = await CompanyRole.create({
      name: SUPER_ADMIN_DEFAULT_ROLE_NAME,
      code: SUPER_ADMIN_DEFAULT_ROLE_CODE,
      description: 'Company administrator with full access to company resources and management capabilities',
      isActive: true
    }, {
      context: {
        userId: superAdminUser.id,
        companyId: joorAppCompany.id
      }
    });

    logger.info('CompanyAdmin role created successfully', {
      roleId: role.id,
      name: role.name,
      code: role.code
    });

    return role;
  } catch (error) {
    logError('Failed to create CompanyAdmin role', error);
    throw error;
  }
};

/**
 * Create or get CompanyUser link (Super Admin to JOOR APP)
 * @param {Object} superAdminUser - Super admin user object
 * @param {Object} joorAppCompany - JOOR APP company object
 * @param {Object} companyAdminRole - CompanyAdmin role object
 * @returns {Promise<Object>} CompanyUser object
 */
const createCompanyUserLink = async (superAdminUser, joorAppCompany, companyAdminRole) => {
  try {
    // Dynamically import models to avoid import-time database access
    const { CompanyUser } = await import('../src/models/index.js');

    logger.info('Checking if CompanyUser link exists...', {
      userId: superAdminUser.id,
      companyId: joorAppCompany.id
    });

    // Check if link already exists
    let companyUser = await CompanyUser.findOne({
      where: {
        userId: superAdminUser.id,
        companyId: joorAppCompany.id,
        isDeleted: false
      }
    });

    if (companyUser) {
      logger.info('CompanyUser link already exists', {
        companyUserId: companyUser.id,
        userId: superAdminUser.id,
        companyId: joorAppCompany.id
      });
      return companyUser;
    }

    // Create new link
    logger.info('Creating CompanyUser link...');

    companyUser = await CompanyUser.create({
      userId: superAdminUser.id,
      companyId: joorAppCompany.id,
      companyRoleId: companyAdminRole.id,
      isActive: true
    }, {
      context: {
        userId: superAdminUser.id,
        companyId: joorAppCompany.id
      }
    });

    logger.info('CompanyUser link created successfully', {
      companyUserId: companyUser.id,
      userId: superAdminUser.id,
      companyId: joorAppCompany.id,
      roleId: companyAdminRole.id
    });

    return companyUser;
  } catch (error) {
    logError('Failed to create CompanyUser link', error);
    throw error;
  }
};

/**
 * Main configuration function
 * @returns {Promise<void>}
 */
const configureFirstSuperAdmin = async () => {
  let kcAdminClient = null;

  try {
    logger.info('🚀 Starting first super admin configuration...\n');

    // Step 1: Initialize database
    logger.info('Step 1: Initializing database connection...');
    await initializeDatabase();
    logger.info('✅ Database connection initialized');

    // Step 2: Initialize models
    logger.info('Step 2: Initializing models...');
    const { initializeModels } = await import('../src/models/index.js');
    initializeModels();
    logger.info('✅ Models initialized');

    // Step 3: Get Keycloak admin client (using service account)
    logger.info('Step 3: Authenticating Keycloak admin client...');
    kcAdminClient = await getAdminClient();
    logger.info('✅ Keycloak admin client authenticated\n');

    // Step 4: Create Keycloak user
    logger.info('Step 4: Creating Keycloak user...');
    const keycloakUser = await createKeycloakUser(kcAdminClient);
    logger.info(`✅ Keycloak user: ${keycloakUser.email} (ID: ${keycloakUser.id})\n`);

    // Step 5: Create database user
    logger.info('Step 5: Creating database user...');
    const dbUser = await createDatabaseUser(keycloakUser);
    logger.info(`✅ Database user: ${dbUser.email} (ID: ${dbUser.id})\n`);

    // Step 6: Create JOOR APP company
    logger.info('Step 6: Creating JOOR APP company...');
    const joorAppCompany = await createJoorAppCompany(dbUser);
    logger.info(`✅ Company: ${joorAppCompany.name} (ID: ${joorAppCompany.id})\n`);

    // Step 7: Create CompanyAdmin role
    logger.info('Step 7: Creating CompanyAdmin role...');
    const companyAdminRole = await createCompanyAdminRole(dbUser, joorAppCompany);
    logger.info(`✅ Role: ${companyAdminRole.name} (ID: ${companyAdminRole.id})\n`);

    // Step 8: Create CompanyUser link
    logger.info('Step 8: Creating CompanyUser link...');
    const companyUserLink = await createCompanyUserLink(dbUser, joorAppCompany, companyAdminRole);
    logger.info(`✅ CompanyUser link created (ID: ${companyUserLink.id})\n`);

    // Summary
    logger.info('============================================================');
    logger.info('✅ Configuration Complete!');
    logger.info('============================================================');
    logger.info('Summary:');
    logger.info(`  Keycloak User: ${keycloakUser.email} (${keycloakUser.id})`);
    logger.info(`  Database User: ${dbUser.email} (${dbUser.id})`);
    logger.info(`  Company: ${joorAppCompany.name} (${joorAppCompany.id})`);
    logger.info(`  Role: ${companyAdminRole.name} (${companyAdminRole.id})`);
    logger.info(`  CompanyUser Link: ${companyUserLink.id}`);
    logger.info('============================================================\n');

    logger.info('🎉 First super admin configured successfully!');
    logger.info(`📧 Login email: ${SUPER_ADMIN_CONFIG.email}`);
    logger.info(`🔑 Password: ${SUPER_ADMIN_CONFIG.password}`);
    logger.info('⚠️  Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    logError('❌ Configuration failed', error);
    logger.error('Configuration failed with error:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await closeDatabase();
      logger.info('Database connection closed');
    } catch (error) {
      logError('Error closing database connection', error);
    }
  }
};

// Run configuration
configureFirstSuperAdmin();

