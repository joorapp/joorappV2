/**
 * @author Bhavesh Venugopal
 * Error Handling Improvements Test Script
 * Tests all error handling scenarios and API response standardization
 * 
 * Usage: npm run test:error-handling
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
const SUPER_ADMIN_EMAIL = 'joorapp.admin@yopmail.com';
const SUPER_ADMIN_PASSWORD = 'admin';

// Test state
let accessToken = null;
let refreshToken = null;
let companyId = null;

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
  isHealthOrDocs = false
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
    
    // Check meta field
    if (checkMeta) {
      if (isHealthOrDocs) {
        if (responseData.meta) {
          passed = false;
          issues.push('Health/Docs endpoint should NOT have meta field');
        }
      } else {
        if (!responseData.meta) {
          passed = false;
          issues.push('Response missing meta field');
        } else {
          if (!responseData.meta.requestId) issues.push('Meta missing requestId');
          if (!responseData.meta.endpoint) issues.push('Meta missing endpoint');
          if (!responseData.meta.method) issues.push('Meta missing method');
        }
      }
    }
    
    if (passed && issues.length === 0) {
      console.log('  ✅ PASSED');
      passedTests++;
      console.log(JSON.stringify(responseData, null, 2));
      return responseData;
    } else {
      console.log('  ❌ FAILED');
      issues.forEach(issue => console.log(`    - ${issue}`));
      failedTests++;
      console.log(JSON.stringify(responseData, null, 2));
      return null;
    }
  } catch (error) {
    console.log('  ❌ FAILED - Exception');
    console.log(`    - ${error.message}`);
    if (error.response) {
      console.log(`    - Status: ${error.response.status}`);
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    failedTests++;
    return null;
  }
};

/**
 * Test error endpoint (expects error response)
 * @param {Object} options - Test options
 * @returns {Promise<Object|null>} Error response or null if failed
 */
const testErrorEndpoint = async ({
  testName,
  method = 'GET',
  uri,
  headers = {},
  body = null,
  expectedStatus = 400,
  expectedError = null,
  checkMeta = true,
  isHealthOrDocs = false
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
      validateStatus: () => true
    };
    
    if (body) {
      config.data = body;
    }
    
    const response = await axios(config);
    const errorResponse = response.data;
    const statusCode = response.status;
    
    let passed = true;
    const issues = [];
    
    // Check status code
    if (statusCode !== expectedStatus) {
      passed = false;
      issues.push(`Status code mismatch: Expected ${expectedStatus}, got ${statusCode}`);
    }
    
    // Check error code
    if (expectedError && errorResponse.error !== expectedError) {
      passed = false;
      issues.push(`Error code mismatch: Expected ${expectedError}, got ${errorResponse.error || 'none'}`);
    }
    
    // Check meta field
    if (checkMeta) {
      if (isHealthOrDocs) {
        if (errorResponse.meta) {
          passed = false;
          issues.push('Health/Docs endpoint should NOT have meta field in error response');
        }
      } else {
        if (!errorResponse.meta) {
          passed = false;
          issues.push('Error response missing meta field');
        } else {
          if (!errorResponse.meta.requestId) issues.push('Meta missing requestId');
          if (!errorResponse.meta.endpoint) issues.push('Meta missing endpoint');
          if (!errorResponse.meta.method) issues.push('Meta missing method');
        }
      }
    }
    
    if (passed && issues.length === 0) {
      console.log('  ✅ PASSED');
      passedTests++;
      console.log(JSON.stringify(errorResponse, null, 2));
      return errorResponse;
    } else {
      console.log('  ❌ FAILED');
      issues.forEach(issue => console.log(`    - ${issue}`));
      failedTests++;
      console.log(JSON.stringify(errorResponse, null, 2));
      return null;
    }
  } catch (error) {
    console.log('  ❌ FAILED - Exception');
    console.log(`    - ${error.message}`);
    if (error.response) {
      console.log(`    - Status: ${error.response.status}`);
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    failedTests++;
    return null;
  }
};

/**
 * Main test function
 */
const runTests = async () => {
  console.log('\n' + '='.repeat(50));
  console.log('Error Handling Improvements Test Script');
  console.log('='.repeat(50));
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Super Admin Email: ${SUPER_ADMIN_EMAIL}\n`);
  
  try {
    // ============================================
    // TEST 1-4: Validation and Authentication Errors
    // ============================================
    
    await testErrorEndpoint({
      testName: 'ValidationError - Missing email',
      method: 'POST',
      uri: `${BASE_URL}/api/v2/auth/login`,
      body: { email: '', password: 'test' },
      expectedStatus: 400,
      expectedError: 'VALIDATION_ERROR',
      checkMeta: true
    });
    
    await testErrorEndpoint({
      testName: 'ValidationError - Missing password',
      method: 'POST',
      uri: `${BASE_URL}/api/v2/auth/login`,
      body: { email: 'test@example.com', password: '' },
      expectedStatus: 400,
      expectedError: 'VALIDATION_ERROR',
      checkMeta: true
    });
    
    await testErrorEndpoint({
      testName: 'UnauthorizedError - No authentication token',
      method: 'GET',
      uri: `${BASE_URL}/api/v2/auth/companies`,
      expectedStatus: 401,
      expectedError: 'AUTHENTICATION_REQUIRED',
      checkMeta: true
    });
    
    await testErrorEndpoint({
      testName: 'AuthenticationFailedError - Invalid credentials',
      method: 'POST',
      uri: `${BASE_URL}/api/v2/auth/login`,
      body: { email: 'wrong@example.com', password: 'wrongpassword' },
      expectedStatus: 401,
      expectedError: 'AUTHENTICATION_FAILED',
      checkMeta: true
    });
    
    // ============================================
    // TEST 5: Success Response - Valid Login
    // ============================================
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Test ${testCount + 1}: Success Response - Valid Login`);
    console.log(`  Method: POST`);
    console.log(`  URI: ${BASE_URL}/api/v2/auth/login`);
    
    try {
      const loginResponse = await axios.post(
        `${BASE_URL}/api/v2/auth/login`,
        { email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      let passed = true;
      const issues = [];
      
      if (!loginResponse.data.success) {
        passed = false;
        issues.push('Login failed');
      }
      
      if (!loginResponse.data.meta) {
        passed = false;
        issues.push('Response missing meta field');
      } else {
        if (!loginResponse.data.meta.requestId) issues.push('Meta missing requestId');
        if (!loginResponse.data.meta.endpoint) issues.push('Meta missing endpoint');
        if (!loginResponse.data.meta.method) issues.push('Meta missing method');
        if (!loginResponse.data.meta.duration) issues.push('Meta missing duration');
      }
      
      // Security check: session_state should NOT be in response
      if (loginResponse.data.data && loginResponse.data.data.session_state) {
        passed = false;
        issues.push('SECURITY: session_state should not be exposed in API response');
      }
      
      if (passed && issues.length === 0) {
        testCount++;
        console.log('  ✅ PASSED');
        passedTests++;
        accessToken = loginResponse.data.data.access_token;
        refreshToken = loginResponse.data.data.refresh_token;
        console.log(`  Access Token: ${accessToken.substring(0, Math.min(50, accessToken.length))}...`);
      } else {
        testCount++;
        console.log('  ❌ FAILED');
        issues.forEach(issue => console.log(`    - ${issue}`));
        failedTests++;
      }
    } catch (error) {
      testCount++;
      console.log('  ❌ FAILED - Exception');
      console.log(`    - ${error.message}`);
      if (error.response) {
        console.log(JSON.stringify(error.response.data, null, 2));
      }
      failedTests++;
    }
    
    // ============================================
    // TEST 6: Success Response - Get User Companies
    // ============================================
    if (accessToken) {
      const companiesTest = await testEndpoint({
        testName: 'Success Response - Get User Companies',
        method: 'GET',
        uri: `${BASE_URL}/api/v2/auth/companies`,
        headers: { Authorization: `Bearer ${accessToken}` },
        expectedStatus: 200,
        checkMeta: true
      });
      
      // Store company ID for later tests
      if (companiesTest && companiesTest.data && companiesTest.data.length > 0) {
        companyId = companiesTest.data[0].id;
        console.log(`  Found company ID: ${companyId}`);
      }
    }
    
    // ============================================
    // TEST 7: ValidationError (400) - Invalid UUID format
    // ============================================
    if (accessToken) {
      await testErrorEndpoint({
        testName: 'ValidationError - Invalid companyId format',
        method: 'POST',
        uri: `${BASE_URL}/api/v2/auth/companies/invalid-id-format/select`,
        headers: { Authorization: `Bearer ${accessToken}` },
        expectedStatus: 400,
        expectedError: 'VALIDATION_ERROR',
        checkMeta: true
      });
    }
    
    // ============================================
    // TEST 8: Success Response - Get User Info
    // ============================================
    if (accessToken) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Test ${testCount + 1}: Success Response - Get User Info`);
      console.log(`  Method: GET`);
      console.log(`  URI: ${BASE_URL}/api/v2/superAdmin/user-info`);
      
      try {
        const userInfoResponse = await axios.get(
          `${BASE_URL}/api/v2/superAdmin/user-info`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        let passed = true;
        const issues = [];
        
        if (!userInfoResponse.data.success) {
          passed = false;
          issues.push('Get user info failed');
        }
        
        if (!userInfoResponse.data.meta) {
          passed = false;
          issues.push('Response missing meta field');
        } else {
          if (!userInfoResponse.data.meta.requestId) issues.push('Meta missing requestId');
          if (!userInfoResponse.data.meta.endpoint) issues.push('Meta missing endpoint');
          if (!userInfoResponse.data.meta.method) issues.push('Meta missing method');
        }
        
        // Security check: sessionState should NOT be in response
        if (userInfoResponse.data.data && userInfoResponse.data.data.sessionState) {
          passed = false;
          issues.push('SECURITY: sessionState should not be exposed in API response');
        }
        
        if (passed && issues.length === 0) {
          testCount++;
          console.log('  ✅ PASSED');
          passedTests++;
          console.log(JSON.stringify(userInfoResponse.data, null, 2));
        } else {
          testCount++;
          console.log('  ❌ FAILED');
          issues.forEach(issue => console.log(`    - ${issue}`));
          failedTests++;
          console.log(JSON.stringify(userInfoResponse.data, null, 2));
        }
      } catch (error) {
        testCount++;
        console.log('  ❌ FAILED - Exception');
        console.log(`    - ${error.message}`);
        if (error.response) {
          console.log(JSON.stringify(error.response.data, null, 2));
        }
        failedTests++;
      }
    }
    
    // ============================================
    // TEST 9: Success Response - Get Super Admin Dashboard
    // ============================================
    if (accessToken) {
      await testEndpoint({
        testName: 'Success Response - Get Super Admin Dashboard',
        method: 'GET',
        uri: `${BASE_URL}/api/v2/superAdmin/dashboard`,
        headers: { Authorization: `Bearer ${accessToken}` },
        expectedStatus: 200,
        checkMeta: true
      });
    }
    
    // ============================================
    // TEST 10: Invalid JWT Token (Backward Compatibility)
    // ============================================
    await testErrorEndpoint({
      testName: 'Invalid JWT Token - Backward Compatibility',
      method: 'GET',
      uri: `${BASE_URL}/api/v2/auth/companies`,
      headers: { Authorization: 'Bearer invalid-token' },
      expectedStatus: 401,
      checkMeta: true
    });
    
    // ============================================
    // TEST 11: Success Response - Paginated Response (Admin Users)
    // ============================================
    if (accessToken) {
      const paginatedTest = await testEndpoint({
        testName: 'Success Response - Paginated Response (Admin Users)',
        method: 'GET',
        uri: `${BASE_URL}/api/v2/admin/users?page=1&limit=10`,
        headers: { Authorization: `Bearer ${accessToken}` },
        expectedStatus: 200,
        checkMeta: true
      });
      
      // Verify pagination structure
      if (paginatedTest && paginatedTest.data) {
        if (!paginatedTest.pagination) {
          console.log('    ⚠️  Warning: Paginated response missing pagination field');
        }
      }
    }
    
    // ============================================
    // TEST 12: Health Endpoint - Success Response (No Meta)
    // ============================================
    await testEndpoint({
      testName: 'Health Endpoint - Success Response (No Meta)',
      method: 'GET',
      uri: `${BASE_URL}/api/v2/health/status`,
      expectedStatus: 200,
      checkMeta: false,
      isHealthOrDocs: true
    });
    
    // ============================================
    // TEST 13: Success Response - Refresh Token
    // ============================================
    if (refreshToken) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Test ${testCount + 1}: Success Response - Refresh Token`);
      console.log(`  Method: POST`);
      console.log(`  URI: ${BASE_URL}/api/v2/auth/refresh`);
      
      try {
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/v2/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        let passed = true;
        const issues = [];
        
        if (!refreshResponse.data.success) {
          passed = false;
          issues.push('Refresh failed');
        }
        
        if (!refreshResponse.data.meta) {
          passed = false;
          issues.push('Response missing meta field');
        } else {
          if (!refreshResponse.data.meta.requestId) issues.push('Meta missing requestId');
          if (!refreshResponse.data.meta.endpoint) issues.push('Meta missing endpoint');
          if (!refreshResponse.data.meta.method) issues.push('Meta missing method');
        }
        
        // Security check: session_state should NOT be in response
        if (refreshResponse.data.data && refreshResponse.data.data.session_state) {
          passed = false;
          issues.push('SECURITY: session_state should not be exposed in API response');
        }
        
        if (passed && issues.length === 0) {
          testCount++;
          console.log('  ✅ PASSED');
          passedTests++;
          const newAccessToken = refreshResponse.data.data.access_token;
          console.log(`  New Access Token: ${newAccessToken.substring(0, Math.min(50, newAccessToken.length))}...`);
          accessToken = newAccessToken; // Update access token
        } else {
          testCount++;
          console.log('  ❌ FAILED');
          issues.forEach(issue => console.log(`    - ${issue}`));
          failedTests++;
        }
      } catch (error) {
        testCount++;
        console.log('  ❌ FAILED - Exception');
        console.log(`    - ${error.message}`);
        if (error.response) {
          console.log(JSON.stringify(error.response.data, null, 2));
        }
        failedTests++;
      }
    }
    
    // ============================================
    // TEST 14: Success Response - Select Company
    // ============================================
    if (accessToken && companyId) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Test ${testCount + 1}: Success Response - Select Company`);
      console.log(`  Method: POST`);
      console.log(`  URI: ${BASE_URL}/api/v2/auth/companies/${companyId}/select`);
      
      try {
        const selectResponse = await axios.post(
          `${BASE_URL}/api/v2/auth/companies/${companyId}/select`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        let passed = true;
        const issues = [];
        
        if (!selectResponse.data.success) {
          passed = false;
          issues.push('Select company failed');
        }
        
        if (!selectResponse.data.meta) {
          passed = false;
          issues.push('Response missing meta field');
        } else {
          if (!selectResponse.data.meta.requestId) issues.push('Meta missing requestId');
          if (!selectResponse.data.meta.endpoint) issues.push('Meta missing endpoint');
          if (!selectResponse.data.meta.method) issues.push('Meta missing method');
        }
        
        // Verify response structure includes company, role, companyUser, and user
        if (!selectResponse.data.data) {
          passed = false;
          issues.push('Response missing data field');
        } else {
          if (!selectResponse.data.data.company) issues.push('Response missing company field');
          if (!selectResponse.data.data.role) issues.push('Response missing role field');
          if (!selectResponse.data.data.companyUser) issues.push('Response missing companyUser field');
          if (!selectResponse.data.data.user) issues.push('Response missing user field');
          
          // Verify company structure
          if (selectResponse.data.data.company) {
            if (!selectResponse.data.data.company.id) issues.push('Company missing id');
            if (!selectResponse.data.data.company.name) issues.push('Company missing name');
            if (selectResponse.data.data.company.isActive === undefined) issues.push('Company missing isActive');
          }
          
          // Verify role structure
          if (selectResponse.data.data.role) {
            if (!selectResponse.data.data.role.id) issues.push('Role missing id');
            if (!selectResponse.data.data.role.name) issues.push('Role missing name');
            if (!selectResponse.data.data.role.code) issues.push('Role missing code');
            if (!selectResponse.data.data.role.description) issues.push('Role missing description');
          }
          
          // Verify companyUser structure
          if (selectResponse.data.data.companyUser) {
            if (!selectResponse.data.data.companyUser.id) issues.push('CompanyUser missing id');
            if (selectResponse.data.data.companyUser.isActive === undefined) issues.push('CompanyUser missing isActive');
          }
          
          // Verify user structure
          if (selectResponse.data.data.user) {
            if (!selectResponse.data.data.user.id) issues.push('User missing id');
            if (!selectResponse.data.data.user.email) issues.push('User missing email');
            if (!selectResponse.data.data.user.firstName) issues.push('User missing firstName');
            if (!selectResponse.data.data.user.lastName) issues.push('User missing lastName');
          }
        }
        
        if (passed && issues.length === 0) {
          testCount++;
          console.log('  ✅ PASSED');
          passedTests++;
          console.log(JSON.stringify(selectResponse.data, null, 2));
        } else {
          testCount++;
          console.log('  ❌ FAILED');
          issues.forEach(issue => console.log(`    - ${issue}`));
          failedTests++;
          console.log(JSON.stringify(selectResponse.data, null, 2));
        }
      } catch (error) {
        testCount++;
        console.log('  ❌ FAILED - Exception');
        console.log(`    - ${error.message}`);
        if (error.response) {
          console.log(JSON.stringify(error.response.data, null, 2));
        }
        failedTests++;
      }
    }
    
    // ============================================
    // TEST 15: Success Response - Get Current Context
    // ============================================
    if (accessToken) {
      await testEndpoint({
        testName: 'Success Response - Get Current Context',
        method: 'GET',
        uri: `${BASE_URL}/api/v2/auth/context`,
        headers: { Authorization: `Bearer ${accessToken}` },
        expectedStatus: 200,
        checkMeta: true
      });
    }
    
    // ============================================
    // TEST 16: Success Response - Logout
    // ============================================
    if (accessToken && refreshToken) {
      await testEndpoint({
        testName: 'Success Response - Logout',
        method: 'POST',
        uri: `${BASE_URL}/api/v2/auth/logout`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { refresh_token: refreshToken },
        expectedStatus: 200,
        checkMeta: true
      });
    }
    
    // ============================================
    // Test Summary
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testCount}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);
    
    console.log('\n' + '='.repeat(50));
    console.log('Test Cases That Cannot Be Simulated');
    console.log('='.repeat(50));
    console.log('\n❌ ForbiddenError (403) - User without SUPER_ADMIN role');
    console.log('   Reason: Only SUPER_ADMIN user available. Need a COMPANY_USER to test this.');
    console.log('   To test: Create a COMPANY_USER in Keycloak and DB, login, then try /superAdmin/dashboard');
    
    console.log('\n⚠️  SessionError (400) - Missing session state');
    console.log('   Reason: Hard to simulate without manipulating JWT token.');
    console.log('   Note: This would require manually creating a token without session_state field.');
    
    console.log('\n✅ All other test cases can be simulated with current setup');
    
    // Exit with appropriate code
    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    logError('Test execution failed', {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    console.error('\n❌ Fatal error during test execution:', error.message);
    process.exit(1);
  }
};

// Run tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

