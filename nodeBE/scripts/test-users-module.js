/**
 * @author Bhavesh Venugopal
 * Users Module Test Script
 * Tests all CRUD operations for the users module
 * 
 * Usage: npm run test:users
 * Prerequisites: Server running on http://localhost:3030
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import axios from 'axios';
import { logInfo, logError, logWarn } from '../src/utils/logger.js';

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

// Test configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3030';
const SUPER_ADMIN_EMAIL = process.env.TEST_SUPER_ADMIN_EMAIL || 'joorapp.admin@yopmail.com';
const SUPER_ADMIN_PASSWORD = process.env.TEST_SUPER_ADMIN_PASSWORD || 'admin';

// Test state
let accessToken = null;
let createdUserId = null;
let testUserEmail = `test.user.${Date.now()}@example.com`;

// Test counters
let testCount = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Test an endpoint and verify response
 * @param {Object} options - Test options
 * @returns {Promise<Object|null>} Response data or null if failed
 */
const testEndpoint = async ({
  testName,
  method = 'GET',
  uri,
  headers = {},
  body = null,
  expectedStatus = 200,
  expectedError = null,
  checkMeta = true,
  validateResponse = null
}) => {
  testCount++;
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Test ${testCount}: ${testName}`);
  console.log(`  Method: ${method}`);
  console.log(`  URI: ${uri}`);
  
  try {
    const config = {
      method,
      url: uri,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      validateStatus: () => true // Don't throw on any status
    };
    
    if (body) {
      config.data = body;
    }
    
    const response = await axios(config);
    const responseData = response.data;
    const statusCode = response.status;
    
    let passed = true;
    const issues = [];
    
    // Check status code
    if (statusCode !== expectedStatus) {
      passed = false;
      issues.push(`Status code mismatch: Expected ${expectedStatus}, got ${statusCode}`);
    }
    
    // Check error code if expected
    if (expectedError && responseData.error !== expectedError) {
      passed = false;
      issues.push(`Error code mismatch: Expected ${expectedError}, got ${responseData.error || 'none'}`);
    }
    
    // Check meta field for standard responses
    if (checkMeta && statusCode >= 200 && statusCode < 300) {
      if (!responseData.meta) {
        passed = false;
        issues.push('Missing meta field in response');
      } else {
        if (!responseData.meta.requestId) issues.push('Missing requestId in meta');
        if (!responseData.meta.endpoint) issues.push('Missing endpoint in meta');
        if (!responseData.meta.method) issues.push('Missing method in meta');
      }
    }
    
    // Custom validation function
    if (validateResponse && typeof validateResponse === 'function') {
      const validationResult = validateResponse(responseData, statusCode);
      if (validationResult !== true) {
        passed = false;
        issues.push(validationResult);
      }
    }
    
    if (passed) {
      passedTests++;
      console.log(`  ✅ PASSED`);
      return responseData;
    } else {
      failedTests++;
      console.log(`  ❌ FAILED`);
      issues.forEach(issue => console.log(`     - ${issue}`));
      console.log(`  Response:`, JSON.stringify(responseData, null, 2));
      return null;
    }
  } catch (error) {
    failedTests++;
    console.log(`  ❌ FAILED - Exception: ${error.message}`);
    if (error.response) {
      console.log(`  Response:`, JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
};

/**
 * Login and get access token
 */
const login = async () => {
  console.log('\n' + '='.repeat(50));
  console.log('🔐 Logging in to get access token...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/v2/auth/login`, {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    });
    
    if (response.data.success && response.data.data.access_token) {
      accessToken = response.data.data.access_token;
      console.log('✅ Login successful');
      console.log(`   Token: ${accessToken.substring(0, 20)}...`);
      return true;
    } else {
      console.error('❌ Login failed - Invalid response');
      return false;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
};

/**
 * Main test function
 */
const runTests = async () => {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 USERS MODULE TEST SUITE');
  console.log('='.repeat(70));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test User Email: ${testUserEmail}`);
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('\n❌ Cannot proceed without authentication token');
    process.exit(1);
  }
  
  // Step 2: Test GET /users/list (List users)
  await testEndpoint({
    testName: 'List Users - Get all users with pagination',
    method: 'GET',
    uri: `${BASE_URL}/api/v2/users/list?page=1&limit=10`,
    headers: { Authorization: `Bearer ${accessToken}` },
    expectedStatus: 200,
    checkMeta: true,
    validateResponse: (data, status) => {
      if (!data.success) return 'Response success should be true';
      if (!data.data || !Array.isArray(data.data)) return 'Response data should be an array';
      if (!data.pagination) return 'Response should include pagination object';
      if (!data.pagination.page) return 'Pagination should include page';
      if (!data.pagination.limit) return 'Pagination should include limit';
      if (data.pagination.total === undefined) return 'Pagination should include total';
      return true;
    }
  });
  
  // Step 3: Test GET /users/list with search
  await testEndpoint({
    testName: 'List Users - Search functionality',
    method: 'GET',
    uri: `${BASE_URL}/api/v2/users/list?search=${SUPER_ADMIN_EMAIL.split('@')[0]}&page=1&limit=10`,
    headers: { Authorization: `Bearer ${accessToken}` },
    expectedStatus: 200,
    checkMeta: true
  });
  
  // Step 4: Test GET /users/list with sorting
  await testEndpoint({
    testName: 'List Users - Sorting functionality',
    method: 'GET',
    uri: `${BASE_URL}/api/v2/users/list?sortBy=email&sortOrder=ASC&page=1&limit=10`,
    headers: { Authorization: `Bearer ${accessToken}` },
    expectedStatus: 200,
    checkMeta: true
  });
  
  // Step 5: Test POST /users (Create user)
  const createUserResponse = await testEndpoint({
    testName: 'Create User - Create new user',
    method: 'POST',
    uri: `${BASE_URL}/api/v2/users`,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      email: testUserEmail,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      keycloakGlobalRole: 'COMPANY_USER'
    },
    expectedStatus: 201,
    checkMeta: true,
    validateResponse: (data, status) => {
      if (!data.success) return 'Response success should be true';
      if (!data.data) return 'Response should include data';
      if (!data.data.id) return 'User data should include id';
      if (!data.data.email) return 'User data should include email';
      if (data.data.email !== testUserEmail) return 'User email should match';
      createdUserId = data.data.id; // Store for later tests
      return true;
    }
  });
  
  if (!createdUserId && createUserResponse?.data?.id) {
    createdUserId = createUserResponse.data.id;
  }
  
  // Step 6: Test POST /users (Create user - duplicate email)
  await testEndpoint({
    testName: 'Create User - Duplicate email error',
    method: 'POST',
    uri: `${BASE_URL}/api/v2/users`,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      email: testUserEmail,
      password: 'TestPassword123!',
      firstName: 'Duplicate',
      lastName: 'User'
    },
    expectedStatus: 409,
    expectedError: 'RESOURCE_CONFLICT',
    checkMeta: true
  });
  
  // Step 7: Test POST /users (Create user - validation error)
  await testEndpoint({
    testName: 'Create User - Validation error (missing email)',
    method: 'POST',
    uri: `${BASE_URL}/api/v2/users`,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      password: 'TestPassword123!'
    },
    expectedStatus: 400,
    expectedError: 'VALIDATION_ERROR',
    checkMeta: true
  });
  
  // Step 8: Test POST /users (Create user - invalid email)
  await testEndpoint({
    testName: 'Create User - Invalid email format',
    method: 'POST',
    uri: `${BASE_URL}/api/v2/users`,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      email: 'invalid-email',
      password: 'TestPassword123!'
    },
    expectedStatus: 400,
    expectedError: 'VALIDATION_ERROR',
    checkMeta: true
  });
  
  // Step 9: Test GET /users/:id (Get single user)
  if (createdUserId) {
    await testEndpoint({
      testName: 'Get User - Get user by ID',
      method: 'GET',
      uri: `${BASE_URL}/api/v2/users/${createdUserId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      expectedStatus: 200,
      checkMeta: true,
      validateResponse: (data, status) => {
        if (!data.success) return 'Response success should be true';
        if (!data.data) return 'Response should include data';
        if (data.data.id !== createdUserId) return 'User ID should match';
        if (data.data.email !== testUserEmail) return 'User email should match';
        return true;
      }
    });
  } else {
    console.log('\n⚠️  Skipping Get User test - No user ID available');
    failedTests++;
  }
  
  // Step 10: Test GET /users/:id (User not found)
  await testEndpoint({
    testName: 'Get User - User not found',
    method: 'GET',
    uri: `${BASE_URL}/api/v2/users/550e8400-e29b-41d4-a716-446655440000`,
    headers: { Authorization: `Bearer ${accessToken}` },
    expectedStatus: 404,
    expectedError: 'USER_NOT_FOUND',
    checkMeta: true
  });
  
  // Step 11: Test GET /users/:id (Invalid UUID)
  await testEndpoint({
    testName: 'Get User - Invalid UUID format',
    method: 'GET',
    uri: `${BASE_URL}/api/v2/users/invalid-id`,
    headers: { Authorization: `Bearer ${accessToken}` },
    expectedStatus: 400,
    expectedError: 'VALIDATION_ERROR',
    checkMeta: true
  });
  
  // Step 12: Test PUT /users/:id (Update user)
  if (createdUserId) {
    await testEndpoint({
      testName: 'Update User - Update user details',
      method: 'PUT',
      uri: `${BASE_URL}/api/v2/users/${createdUserId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        firstName: 'Updated',
        lastName: 'Name'
      },
      expectedStatus: 200,
      checkMeta: true,
      validateResponse: (data, status) => {
        if (!data.success) return 'Response success should be true';
        if (!data.data) return 'Response should include data';
        if (data.data.firstName !== 'Updated') return 'First name should be updated';
        if (data.data.lastName !== 'Name') return 'Last name should be updated';
        return true;
      }
    });
  } else {
    console.log('\n⚠️  Skipping Update User test - No user ID available');
    failedTests++;
  }
  
  // Step 13: Test PUT /users/:id (Update user - not found)
  await testEndpoint({
    testName: 'Update User - User not found',
    method: 'PUT',
    uri: `${BASE_URL}/api/v2/users/550e8400-e29b-41d4-a716-446655440000`,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      firstName: 'Updated'
    },
    expectedStatus: 404,
    expectedError: 'USER_NOT_FOUND',
    checkMeta: true
  });
  
  // Step 14: Test PUT /users/:id (Update user - duplicate email)
  if (createdUserId) {
    // First, get the super admin user ID to use their email
    const superAdminResponse = await axios.get(`${BASE_URL}/api/v2/superAdmin/user-info`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true
    });
    
    if (superAdminResponse.data?.data?.email) {
      await testEndpoint({
        testName: 'Update User - Duplicate email error',
        method: 'PUT',
        uri: `${BASE_URL}/api/v2/users/${createdUserId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: {
          email: superAdminResponse.data.data.email
        },
        expectedStatus: 409,
        expectedError: 'RESOURCE_CONFLICT',
        checkMeta: true
      });
    }
  }
  
  // Step 15: Test DELETE /users/:id (Delete user)
  if (createdUserId) {
    await testEndpoint({
      testName: 'Delete User - Soft delete user',
      method: 'DELETE',
      uri: `${BASE_URL}/api/v2/users/${createdUserId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      expectedStatus: 200,
      checkMeta: true,
      validateResponse: (data, status) => {
        if (!data.success) return 'Response success should be true';
        return true;
      }
    });
  } else {
    console.log('\n⚠️  Skipping Delete User test - No user ID available');
    failedTests++;
  }
  
  // Step 16: Test DELETE /users/:id (User not found)
  await testEndpoint({
    testName: 'Delete User - User not found',
    method: 'DELETE',
    uri: `${BASE_URL}/api/v2/users/550e8400-e29b-41d4-a716-446655440000`,
    headers: { Authorization: `Bearer ${accessToken}` },
    expectedStatus: 404,
    expectedError: 'USER_NOT_FOUND',
    checkMeta: true
  });
  
  // Step 17: Test DELETE /users/:id (Self-deletion prevention)
  if (createdUserId) {
    // This test requires getting the current user's ID
    const currentUserResponse = await axios.get(`${BASE_URL}/api/v2/superAdmin/user-info`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true
    });
    
    if (currentUserResponse.data?.data?.id) {
      await testEndpoint({
        testName: 'Delete User - Self-deletion prevention',
        method: 'DELETE',
        uri: `${BASE_URL}/api/v2/users/${currentUserResponse.data.data.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        expectedStatus: 400,
        expectedError: 'BAD_REQUEST',
        checkMeta: true
      });
    }
  }
  
  // Step 18: Test GET /users/list (Unauthorized - no token)
  await testEndpoint({
    testName: 'List Users - Unauthorized (no token)',
    method: 'GET',
    uri: `${BASE_URL}/api/v2/users/list`,
    expectedStatus: 401,
    expectedError: 'AUTHENTICATION_REQUIRED',
    checkMeta: true
  });
  
  // Step 19: Test POST /users (Unauthorized - no token)
  await testEndpoint({
    testName: 'Create User - Unauthorized (no token)',
    method: 'POST',
    uri: `${BASE_URL}/api/v2/users`,
    body: {
      email: 'unauthorized@example.com',
      password: 'TestPassword123!'
    },
    expectedStatus: 401,
    expectedError: 'AUTHENTICATION_REQUIRED',
    checkMeta: true
  });
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${testCount}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);
  console.log('='.repeat(70));
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    process.exit(1);
  }
};

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error running tests:', error);
  process.exit(1);
});

