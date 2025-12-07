/**
 * @author Bhavesh Venugopal
 * Setup Test Users for Integration Tests
 * Creates test users in Keycloak with appropriate roles for integration testing
 * 
 * Usage: npm run setup:test-users
 * Prerequisites: Keycloak must be running and accessible
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.test.local');

// Verify .env.test.local file exists and load it (for test database)
if (existsSync(envPath)) {
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error) {
    console.error('❌ Error loading .env.test.local file:', result.error.message);
    process.exit(1);
  }
} else {
  console.error(`❌ Error: .env.test.local file not found at: ${envPath}`);
  console.error('   Please create a .env.test.local file in the nodeBE directory');
  console.error('   This file should contain test database configuration (DB_NAME should be joorapp_testDB)');
  process.exit(1);
}

import { initializeDatabase } from '../src/config/database.js';
import { getAdminClient } from '../src/services/keycloakService.js';
import { logInfo, logError, logWarn } from '../src/utils/logger.js';

// Note: createUserInDB will be imported dynamically after database is initialized

// Test users configuration
const TEST_USERS = [
  {
    email: process.env.TEST_USER_EMAIL || 'test.user@example.com',
    password: process.env.TEST_USER_PASSWORD || 'testPassword123',
    firstName: 'Test',
    lastName: 'User',
    keycloakGlobalRole: 'COMPANY_USER'
  },
  {
    email: process.env.TEST_ADMIN_EMAIL || 'test.admin@example.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'testPassword123',
    firstName: 'Test',
    lastName: 'Admin',
    keycloakGlobalRole: 'COMPANY_ADMIN'
  },
  {
    email: process.env.TEST_SUPER_ADMIN_EMAIL || 'test.superadmin@example.com',
    password: process.env.TEST_SUPER_ADMIN_PASSWORD || 'testPassword123',
    firstName: 'Test',
    lastName: 'SuperAdmin',
    keycloakGlobalRole: 'SUPER_ADMIN'
  }
];

/**
 * Create or update test user in Keycloak and database
 * @param {Object} kcAdminClient - Keycloak admin client
 * @param {Object} userConfig - User configuration
 * @returns {Promise<Object>} Created or updated user object with database info
 */
const createTestUser = async (kcAdminClient, userConfig) => {
  try {
    logInfo(`Checking if test user exists: ${userConfig.email}`);

    // Check if user already exists in Keycloak
    let existingUsers;
    try {
      existingUsers = await kcAdminClient.users.find({
        email: userConfig.email,
        exact: true
      });
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        logError('Keycloak client lacks permissions to manage users', error);
        logError('\n❌ PERMISSION ERROR: Keycloak client service account needs user management roles');
        logError('   To fix this:');
        logError('   1. Go to Keycloak Admin Console → Clients → Joor_App_Client');
        logError('   2. Go to "Service accounts roles" tab');
        logError('   3. Click "Assign role" → Filter by "realm roles"');
        logError('   4. Assign these roles:');
        logError('      - view-users');
        logError('      - manage-users');
        logError('      - view-realm');
        logError('      - manage-realm');
        logError('      - query-users');
        logError('   5. Save and try again\n');
        throw new Error('Keycloak client lacks user management permissions. Please assign service account roles in Keycloak Admin Console.');
      }
      throw error;
    }

    let keycloakUser;
    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      keycloakUser = existingUser;
      logInfo(`Test user already exists in Keycloak: ${userConfig.email}`, { keycloakId: existingUser.id });
      
      // Update password
      try {
        await kcAdminClient.users.resetPassword({
          id: existingUser.id,
          credential: {
            temporary: false,
            type: 'password',
            value: userConfig.password
          }
        });
        logInfo(`Password updated for: ${userConfig.email}`);
      } catch (error) {
        logWarn(`Could not update password for ${userConfig.email}`, { error: error.message });
      }
      
      // Verify and assign role if needed
      if (userConfig.keycloakGlobalRole) {
        try {
          const userRoles = await kcAdminClient.users.listRealmRoleMappings({
            id: existingUser.id
          });
          
          const hasRole = userRoles.some(role => role.name === userConfig.keycloakGlobalRole);
          
          if (!hasRole) {
            const role = await kcAdminClient.roles.findOneByName({
              name: userConfig.keycloakGlobalRole
            });
            await kcAdminClient.users.addRealmRoleMappings({
              id: existingUser.id,
              roles: [role]
            });
            logInfo(`${userConfig.keycloakGlobalRole} role assigned to: ${userConfig.email}`);
          } else {
            logInfo(`${userConfig.keycloakGlobalRole} role already assigned to: ${userConfig.email}`);
          }
        } catch (error) {
          logWarn(`Could not verify/assign ${userConfig.keycloakGlobalRole} role for ${userConfig.email}`, { error: error.message });
        }
      }
    } else {
      // Create new user in Keycloak
      logInfo(`Creating new test user in Keycloak: ${userConfig.email}`);
      keycloakUser = await kcAdminClient.users.create({
        email: userConfig.email,
        firstName: userConfig.firstName,
        lastName: userConfig.lastName,
        enabled: true,
        emailVerified: true,
        username: userConfig.email
      });

      // Set password
      await kcAdminClient.users.resetPassword({
        id: keycloakUser.id,
        credential: {
          temporary: false,
          type: 'password',
          value: userConfig.password
        }
      });

      // Assign role if needed
      if (userConfig.keycloakGlobalRole) {
        try {
          const role = await kcAdminClient.roles.findOneByName({
            name: userConfig.keycloakGlobalRole
          });
          await kcAdminClient.users.addRealmRoleMappings({
            id: keycloakUser.id,
            roles: [role]
          });
          logInfo(`${userConfig.keycloakGlobalRole} role assigned to: ${userConfig.email}`);
        } catch (error) {
          logWarn(`Could not assign ${userConfig.keycloakGlobalRole} role to ${userConfig.email}`, { error: error.message });
        }
      }

      logInfo(`Test user created in Keycloak: ${userConfig.email}`, { keycloakId: keycloakUser.id });
    }

    // Now create or update user in database
    try {
      const { User } = await import('../src/models/index.js');
      
      // Check if user exists in database
      let dbUser = await User.findOne({
        where: { keycloakId: keycloakUser.id }
      });

      if (dbUser) {
        // Update existing user
        dbUser.email = userConfig.email;
        dbUser.firstName = userConfig.firstName;
        dbUser.lastName = userConfig.lastName;
        dbUser.keycloakGlobalRole = userConfig.keycloakGlobalRole;
        await dbUser.save();
        logInfo(`Test user updated in database: ${userConfig.email}`, { userId: dbUser.id, keycloakId: keycloakUser.id });
      } else {
        // Create new user in database
        // Import dynamically to avoid import-time database access
        const { createUserInDB } = await import('../src/services/userService.js');
        dbUser = await createUserInDB({
          keycloakId: keycloakUser.id,
          email: userConfig.email,
          firstName: userConfig.firstName,
          lastName: userConfig.lastName,
          keycloakGlobalRole: userConfig.keycloakGlobalRole
        }, { userId: null }); // No context needed for test setup
        
        logInfo(`Test user created in database: ${userConfig.email}`, { userId: dbUser.id, keycloakId: keycloakUser.id });
      }

      return { keycloakUser, dbUser };
    } catch (error) {
      logWarn(`Could not create/update user in database: ${userConfig.email}`, { error: error.message });
      // Return Keycloak user even if DB creation fails
      return { keycloakUser, dbUser: null };
    }
  } catch (error) {
    logError(`Failed to create/update test user: ${userConfig.email}`, error);
    throw error;
  }
};

/**
 * Main setup function
 */
const setupTestUsers = async () => {
  try {
    logInfo('🚀 Setting up test users for integration tests...');
    logInfo('');
    
    // Initialize database
    await initializeDatabase();
    logInfo('✅ Database initialized');
    
    // Get Keycloak admin client
    const kcAdminClient = await getAdminClient();
    logInfo('✅ Keycloak admin client connected');
    logInfo('');
    
    // Create all test users
    const results = [];
    for (const userConfig of TEST_USERS) {
      try {
        const { keycloakUser, dbUser } = await createTestUser(kcAdminClient, userConfig);
        results.push({ 
          success: true, 
          email: userConfig.email, 
          keycloakId: keycloakUser.id,
          dbUserId: dbUser?.id || null,
          dbCreated: dbUser !== null
        });
      } catch (error) {
        results.push({ success: false, email: userConfig.email, error: error.message });
      }
    }
    
    logInfo('');
    logInfo('📋 Test Users Setup Summary:');
    logInfo('');
    
    let successCount = 0;
    let failCount = 0;
    
    results.forEach(result => {
      if (result.success) {
        const dbStatus = result.dbCreated ? '✅ DB' : '⚠️  DB missing';
        logInfo(`  ✅ ${result.email}`);
        logInfo(`     Keycloak ID: ${result.keycloakId}`);
        if (result.dbUserId) {
          logInfo(`     Database ID: ${result.dbUserId} ${dbStatus}`);
        } else {
          logWarn(`     Database: Not created (${dbStatus})`);
        }
        successCount++;
      } else {
        logError(`  ❌ ${result.email} - ${result.error}`);
        failCount++;
      }
    });
    
    logInfo('');
    if (failCount === 0) {
      logInfo(`✅ All ${successCount} test users setup complete!`);
      logInfo('');
      logInfo('You can now run integration tests:');
      logInfo('  npm run test:integration');
    } else {
      logWarn(`⚠️  ${successCount} succeeded, ${failCount} failed`);
      logWarn('Please fix the errors above and try again');
      process.exit(1);
    }
    
  } catch (error) {
    logError('Failed to setup test users', error);
    process.exit(1);
  }
};

// Run setup
setupTestUsers();

