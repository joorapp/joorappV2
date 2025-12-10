/**
 * @author Bhavesh Venugopal
 * Super Admin Integration Tests
 * Tests superAdmin endpoints with full HTTP request/response cycle
 * 
 * Prerequisites:
 * - Keycloak must be running and accessible
 * - Test user with SUPER_ADMIN role must exist in Keycloak
 * - Run: npm run setup:test-users (before running integration tests)
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { Op } from 'sequelize';
import { createTestApp, closeTestApp } from '../../../__tests__/helpers/integration.js';
import { getAuthToken } from '../../../__tests__/helpers/auth.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { User, Company, CompanyRole, CompanyUser } from '../../../src/models/index.js';
import { createUserData, createCompanyData, createRoleData, createCompanyUserData } from '../../../__tests__/helpers/factories.js';
import { v4 as uuidv4 } from 'uuid';

describe('Super Admin API Integration', () => {
  let app;
  let authToken;
  let testUser;
  
  // Test user credentials - should have SUPER_ADMIN role
  const TEST_USER_EMAIL = process.env.TEST_SUPER_ADMIN_EMAIL || 'test.superadmin@example.com';
  const TEST_USER_PASSWORD = process.env.TEST_SUPER_ADMIN_PASSWORD || 'testPassword123';

  beforeAll(async () => {
    // Clean database before tests
    await cleanDatabase();
    
    // Initialize Express app with all middleware and routes
    app = await createTestApp();
    
    // Get auth token for protected endpoints
    // This MUST succeed - if it fails, run: npm run setup:test-users
    authToken = await getAuthToken(app, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    
    // Sync user from Keycloak to database (authMiddleware syncs on first authenticated request)
    await request(app)
      .get('/api/v2/superAdmin/user-info')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    // Get test user in database (should be synced from Keycloak)
    testUser = await User.findOne({ where: { email: TEST_USER_EMAIL } });
    if (!testUser) {
      throw new Error(`Test user ${TEST_USER_EMAIL} not found in database. User should be synced from Keycloak. Run: npm run setup:test-users`);
    }
  });

  afterAll(async () => {
    // Clean database after tests
    await cleanDatabase();
    
    // Close app if needed
    await closeTestApp(app);
  });

  beforeEach(async () => {
    // Clean up test data before each test (preserve test user)
    if (testUser) {
      await CompanyUser.destroy({
        where: {
          userId: { [Op.ne]: testUser.id }
        }
      });
      await Company.destroy({
        where: {
          createdUserId: { [Op.ne]: testUser.id }
        }
      });
      await CompanyRole.destroy({
        where: {
          createdUserId: { [Op.ne]: testUser.id }
        }
      });
      await User.destroy({
        where: {
          id: { [Op.ne]: testUser.id }
        }
      });
    } else {
      await cleanDatabase();
    }
  });

  describe('GET /api/v2/superAdmin/user-info', () => {
    it('should return user info when authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/user-info')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/user-info')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/superAdmin/dashboard', () => {
    it('should return dashboard data when authenticated as super admin', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v2/superAdmin/companies', () => {
    it('should create company when authenticated as super admin', async () => {
      const companyData = {
        name: `Test Company ${Date.now()}`,
        code: `TEST${Date.now()}`,
        description: 'Test company description'
      };

      const response = await request(app)
        .post('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(companyData.name);
      expect(response.body.data.code).toBe(companyData.code);
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TEST'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('name');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v2/superAdmin/companies')
        .send({
          name: 'Test Company',
          code: 'TEST'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/superAdmin/companies', () => {
    it('should return companies list when authenticated as super admin', async () => {
      // Create test companies
      if (testUser) {
        await Company.create(createCompanyData(), { context: { userId: testUser.id } });
        await Company.create(createCompanyData(), { context: { userId: testUser.id } });
      }

      const response = await request(app)
        .get('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.pagination).toBeDefined(); // pagination at root level per cursor rules
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/companies')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/companies')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/superAdmin/companies/:id', () => {
    it('should return company by ID when authenticated', async () => {
      const testCompany = await Company.create(createCompanyData(), { context: { userId: testUser.id } });

      const response = await request(app)
        .get(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testCompany.id);
      expect(response.body.meta).toBeDefined();
    });

    it('should return 404 when company not found', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .get(`/api/v2/superAdmin/companies/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('COMPANY_NOT_FOUND');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v2/superAdmin/companies/${uuidv4()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v2/superAdmin/companies/:id', () => {
    it('should update company when authenticated', async () => {
      const testCompany = await Company.create(createCompanyData(), { context: { userId: testUser.id } });

      const updateData = {
        name: `Updated Company Name ${Date.now()}-${Math.random().toString(36).substring(7)}`,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/v2/superAdmin/companies/${uuidv4()}`)
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/v2/superAdmin/companies/:id', () => {
    it('should delete company when authenticated', async () => {
      const testCompany = await Company.create(createCompanyData(), { context: { userId: testUser.id } });

      const response = await request(app)
        .delete(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/v2/superAdmin/companies/${uuidv4()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v2/superAdmin/roles', () => {
    it('should create role when authenticated as super admin', async () => {
      const roleData = {
        name: `Test Role ${Date.now()}`,
        code: `TEST${Date.now()}`,
        description: 'Test role description'
      };

      const response = await request(app)
        .post('/api/v2/superAdmin/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(roleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(roleData.name);
      expect(response.body.data.code).toBe(roleData.code);
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/v2/superAdmin/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TEST'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('name');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v2/superAdmin/roles')
        .send({
          name: 'Test Role',
          code: 'TEST'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/superAdmin/roles', () => {
    it('should return roles list when authenticated', async () => {
      // Create test roles
      await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });
      await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });

      const response = await request(app)
        .get('/api/v2/superAdmin/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.pagination).toBeDefined(); // pagination at root level per cursor rules
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/roles')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/superAdmin/roles/:id', () => {
    it('should return role by ID when authenticated', async () => {
      const testRole = await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });

      const response = await request(app)
        .get(`/api/v2/superAdmin/roles/${testRole.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testRole.id);
      expect(response.body.meta).toBeDefined();
    });

    it('should return 404 when role not found', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .get(`/api/v2/superAdmin/roles/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('COMPANYROLE_NOT_FOUND');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v2/superAdmin/roles/${uuidv4()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v2/superAdmin/roles/:id', () => {
    it('should update role when authenticated', async () => {
      const testRole = await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });

      const updateData = {
        name: `Updated Role Name ${Date.now()}-${Math.random().toString(36).substring(7)}`,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v2/superAdmin/roles/${testRole.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/v2/superAdmin/roles/${uuidv4()}`)
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/v2/superAdmin/roles/:id', () => {
    it('should delete role when authenticated', async () => {
      const testRole = await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });

      const response = await request(app)
        .delete(`/api/v2/superAdmin/roles/${testRole.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/v2/superAdmin/roles/${uuidv4()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v2/superAdmin/users', () => {
    it('should create user when authenticated as super admin', async () => {
      const userData = {
        email: `newuser-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'New',
        lastName: 'User',
        keycloakGlobalRole: 'COMPANY_USER'
      };

      const response = await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'TestPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('email');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v2/superAdmin/users')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/superAdmin/users', () => {
    it('should return users list when authenticated', async () => {
      // Create test users via API (ensures they exist in both Keycloak and DB)
      const userData1 = {
        email: `user1-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'User',
        lastName: 'One',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      const userData2 = {
        email: `user2-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'User',
        lastName: 'Two',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      
      await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData1)
        .expect(201);
      
      await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData2)
        .expect(201);

      const response = await request(app)
        .get('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.pagination).toBeDefined(); // pagination at root level per cursor rules
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/superAdmin/users/:id', () => {
    it('should return user by ID when authenticated', async () => {
      // Create user via API (ensures it exists in both Keycloak and DB)
      const userData = {
        email: `getuser-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Get',
        lastName: 'User',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      
      const createResponse = await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);
      
      const userId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v2/superAdmin/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(userId);
      expect(response.body.meta).toBeDefined();
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .get(`/api/v2/superAdmin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('USER_NOT_FOUND');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v2/superAdmin/users/${uuidv4()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v2/superAdmin/users/:id', () => {
    it('should update user when authenticated', async () => {
      // Create user via API (ensures it exists in both Keycloak and DB)
      const userData = {
        email: `updateuser-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Update',
        lastName: 'User',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      
      const createResponse = await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);
      
      const userId = createResponse.body.data.id;

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put(`/api/v2/superAdmin/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/v2/superAdmin/users/${uuidv4()}`)
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v2/superAdmin/users/:id/disable', () => {
    it('should disable user when authenticated', async () => {
      // Create user via API (ensures it exists in both Keycloak and DB)
      const userData = {
        email: `disableuser-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Disable',
        lastName: 'User',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      
      const createResponse = await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);
      
      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v2/superAdmin/users/${userId}/disable`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('disabled');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/v2/superAdmin/users/${uuidv4()}/disable`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v2/superAdmin/users/:id/assign', () => {
    it('should assign user to company when authenticated', async () => {
      // Create user via API (ensures it exists in both Keycloak and DB)
      const userData = {
        email: `assignuser-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Assign',
        lastName: 'User',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      
      const createResponse = await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);
      
      const userId = createResponse.body.data.id;
      
      const testCompany = await Company.create(createCompanyData(), { context: { userId: testUser.id } });
      const testRole = await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });

      const assignData = {
        companyId: testCompany.id,
        roleId: testRole.id
      };

      const response = await request(app)
        .post(`/api/v2/superAdmin/users/${userId}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(assignData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when companyId is missing', async () => {
      const response = await request(app)
        .post(`/api/v2/superAdmin/users/${uuidv4()}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roleId: uuidv4()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/api/v2/superAdmin/users/${uuidv4()}/assign`)
        .send({
          companyId: uuidv4(),
          roleId: uuidv4()
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v2/superAdmin/users/:id/companies/:companyId/role', () => {
    it('should update user role in company when authenticated', async () => {
      // Create user via API (ensures it exists in both Keycloak and DB)
      const userData = {
        email: `updaterole-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Update',
        lastName: 'Role',
        keycloakGlobalRole: 'COMPANY_USER'
      };
      
      const createResponse = await request(app)
        .post('/api/v2/superAdmin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);
      
      const userId = createResponse.body.data.id;
      
      const testCompany = await Company.create(createCompanyData(), { context: { userId: testUser.id } });
      const testRole = await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });
      const newRole = await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });
      
      // Assign user to company first
      await CompanyUser.create(
        createCompanyUserData(userId, testCompany.id, testRole.id),
        { context: { userId: testUser.id } }
      );

      const response = await request(app)
        .put(`/api/v2/superAdmin/users/${userId}/companies/${testCompany.id}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ roleId: newRole.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when companyRoleId is missing', async () => {
      const response = await request(app)
        .put(`/api/v2/superAdmin/users/${uuidv4()}/companies/${uuidv4()}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/v2/superAdmin/users/${uuidv4()}/companies/${uuidv4()}/role`)
        .send({ roleId: uuidv4() })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});

