/**
 * @author Bhavesh Venugopal
 * Test Keycloak Service
 * Tests the Keycloak service functions
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

import { 
  getPublicKey, 
  verifyToken, 
  getUserFromToken, 
  getAdminClient,
  testConnection 
} from '../src/services/keycloakService.js';
import { logInfo, logError } from '../src/utils/logger.js';

/**
 * Test Keycloak service functions
 * @returns {Promise<void>}
 */
const testKeycloakService = async () => {
  let testPassed = true;
  const errors = [];

  try {
    logInfo('🧪 Starting Keycloak service tests...\n');

    // Test 1: Test connection
    logInfo('Test 1: Testing Keycloak connection...');
    const connectionTest = await testConnection();
    if (connectionTest.success) {
      logInfo('✅ Keycloak connection test passed');
    } else {
      logError('❌ Keycloak connection test failed', null, { error: connectionTest.error });
      testPassed = false;
      errors.push('Connection test failed');
    }

    // Test 2: Get public key
    logInfo('\nTest 2: Fetching public key from Keycloak...');
    const publicKeyResponse = await getPublicKey();
    if (publicKeyResponse.success) {
      logInfo('✅ Public key fetched successfully');
      logInfo(`   Key ID: ${publicKeyResponse.publicKey.kid || 'N/A'}`);
      logInfo(`   Algorithm: ${publicKeyResponse.publicKey.alg || 'N/A'}`);
    } else {
      logError('❌ Failed to fetch public key', null, { error: publicKeyResponse.error });
      testPassed = false;
      errors.push('Public key fetch failed');
    }

    // Test 3: Test public key caching
    logInfo('\nTest 3: Testing public key cache...');
    const startTime = Date.now();
    const cachedKeyResponse = await getPublicKey();
    const endTime = Date.now();
    if (cachedKeyResponse.success && (endTime - startTime) < 100) {
      logInfo('✅ Public key cache working (fast response)');
    } else {
      logInfo('⚠️  Public key cache may not be working (slow response)');
    }

    // Test 4: Get admin client
    logInfo('\nTest 4: Testing admin client authentication...');
    try {
      const adminClient = await getAdminClient();
      if (adminClient) {
        logInfo('✅ Admin client authenticated successfully');
      } else {
        logError('❌ Admin client authentication failed');
        testPassed = false;
        errors.push('Admin client authentication failed');
      }
    } catch (error) {
      logError('❌ Admin client authentication error', error);
      testPassed = false;
      errors.push('Admin client authentication error');
    }

    // Test 5: Token verification (requires a valid token)
    logInfo('\nTest 5: Token verification test...');
    logInfo('   Note: This test requires a valid JWT token.');
    logInfo('   To test, provide a token via environment variable: TEST_TOKEN');
    
    const testToken = process.env.TEST_TOKEN;
    if (testToken) {
      const verifyResponse = await verifyToken(testToken);
      if (verifyResponse.success) {
        logInfo('✅ Token verification successful');
        logInfo(`   User ID: ${verifyResponse.decoded.sub}`);
        logInfo(`   Email: ${verifyResponse.decoded.email || 'N/A'}`);
        
        // Test user extraction
        const userResponse = getUserFromToken(verifyResponse.decoded);
        if (userResponse.success) {
          logInfo('✅ User extraction successful');
          logInfo(`   Keycloak ID: ${userResponse.user.keycloakId}`);
          logInfo(`   Email: ${userResponse.user.email}`);
          logInfo(`   Global Role: ${userResponse.user.keycloakGlobalRole}`);
          logInfo(`   Session State: ${userResponse.user.sessionState || 'N/A'}`);
        } else {
          logError('❌ User extraction failed', null, { error: userResponse.error });
          testPassed = false;
          errors.push('User extraction failed');
        }
      } else {
        logError('❌ Token verification failed', null, { error: verifyResponse.error });
        testPassed = false;
        errors.push('Token verification failed');
      }
    } else {
      logInfo('⚠️  Skipping token verification (no TEST_TOKEN provided)');
      logInfo('   To test: Set TEST_TOKEN environment variable with a valid JWT token');
    }

    // Summary
    logInfo('\n============================================================');
    if (testPassed && errors.length === 0) {
      logInfo('✅ All Keycloak service tests passed!');
      logInfo('✅ Service is ready to use');
    } else {
      logInfo('❌ Some tests failed');
      errors.forEach((error, index) => {
        logInfo(`   ${index + 1}. ${error}`);
      });
    }
    logInfo('============================================================\n');

    process.exit(testPassed && errors.length === 0 ? 0 : 1);
  } catch (error) {
    logError('❌ Test execution failed', error);
    process.exit(1);
  }
};

// Run tests
testKeycloakService();

