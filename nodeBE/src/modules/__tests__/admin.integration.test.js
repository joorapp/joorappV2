/**
 * @author Bhavesh Venugopal
 * Admin Integration Tests
 * Tests admin endpoints with full HTTP request/response cycle
 * 
 * Prerequisites:
 * - Keycloak must be running and accessible
 * - Test user with COMPANY_ADMIN role must exist in Keycloak
 * - Run: npm run setup:test-users (before running integration tests)
 * - Test user must be assigned to a company with company context
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { Op } from 'sequelize';
import { createTestApp, closeTestApp } from '../../../__tests__/helpers/integration.js';
import { getAuthToken, getAuthTokens } from '../../../__tests__/helpers/auth.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { User, Company, CompanyRole, CompanyUser, JobTitle } from '../../../src/models/index.js';
import {
  createUserData,
  createCompanyData,
  createRoleData,
  createCompanyUserData,
  createJobTitleData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { SUPER_ADMIN_COMPANY_NAME } from '../../../src/constants/superAdmin.js';
import { v4 as uuidv4 } from 'uuid';

describe('Admin API Integration', () => {
  let app;
  let authToken;
  let testUser;
  let testCompany;
  let testRole;
  let companyUser;
  
  // Test user credentials - should have COMPANY_ADMIN role
  const TEST_USER_EMAIL = process.env.TEST_ADMIN_EMAIL || 'test.admin@example.com';
  const TEST_USER_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'testPassword123';

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
      .get('/api/v2/admin/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    // Get test user in database (should be synced from Keycloak)
    testUser = await User.findOne({ where: { email: TEST_USER_EMAIL } });
    if (!testUser) {
      throw new Error(`Test user ${TEST_USER_EMAIL} not found in database. User should be synced from Keycloak. Run: npm run setup:test-users`);
    }
    
    // Create test company and role
    testCompany = await Company.create(createCompanyData(), { context: { userId: testUser.id } });
    testRole = await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });
    
    // Assign user to company as admin
    companyUser = await CompanyUser.create(
      createCompanyUserData(testUser.id, testCompany.id, testRole.id),
      { context: { userId: testUser.id } }
    );
    
    // Set company context using the select company endpoint
    // This properly creates UserCompanyContext with the correct session_state from the token
    await request(app)
      .post(`/api/v2/auth/companies/${testCompany.id}/select`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  afterAll(async () => {
    // Clean database after tests
    await cleanDatabase();
    
    // Close app if needed
    await closeTestApp(app);
  });

  beforeEach(async () => {
    // Clean up test data before each test (preserve test user and company)
    if (testUser && testCompany) {
      await CompanyUser.destroy({
        where: {
          userId: { [Op.ne]: testUser.id },
          companyId: testCompany.id
        }
      });
    }
  });

  describe('GET /api/v2/admin/settings', () => {
    it('should return settings when authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/admin/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/admin/settings')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v2/admin/settings', () => {
    it('should update settings when authenticated', async () => {
      const settingsData = {
        setting1: 'value1',
        setting2: 'value2'
      };

      const response = await request(app)
        .put('/api/v2/admin/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(settingsData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put('/api/v2/admin/settings')
        .send({ setting1: 'value1' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/admin/stats', () => {
    it('should return stats when authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/admin/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v2/admin/users', () => {
    it('should create user in company when authenticated with company context', async () => {
      const newUserData = {
        email: `newuser-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'New',
        lastName: 'User',
        roleId: testRole.id
      };

      const response = await request(app)
        .post('/api/v2/admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .send(newUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when email is missing', async () => {

      const response = await request(app)
        .post('/api/v2/admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .send({
          password: 'TestPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.message).toContain('email');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v2/admin/users')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/admin/users', () => {
    it('should return company users when authenticated with company context', async () => {
      // Create a test user in the company
      const testUser2 = await User.create(createUserData({ email: `testuser2-${Date.now()}@example.com` }));
      await CompanyUser.create(
        createCompanyUserData(testUser2.id, testCompany.id, testRole.id),
        { context: { userId: testUser.id } }
      );

      const response = await request(app)
        .get('/api/v2/admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.pagination).toBeDefined(); // pagination at root level per cursor rules
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v2/admin/users')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1); // pagination at root level per cursor rules
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/v2/admin/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v2/admin/users/:id', () => {
    it('should return company user by ID when authenticated', async () => {
      const testUser2 = await User.create(createUserData({ email: `getuser-${Date.now()}@example.com` }));
      const companyUser2 = await CompanyUser.create(
        createCompanyUserData(testUser2.id, testCompany.id, testRole.id),
        { context: { userId: testUser.id } }
      );

      const response = await request(app)
        .get(`/api/v2/admin/users/${testUser2.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testUser2.id);
      expect(response.body.meta).toBeDefined();
    });

    it('should return 403 when user not found in company', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .get(`/api/v2/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v2/admin/users/${uuidv4()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v2/admin/users/:id', () => {
    it('should update company user when authenticated', async () => {
      // Create user via API to ensure it exists in both Keycloak and database
      const newUserData = {
        email: `updateuser-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Original',
        lastName: 'Name',
        roleId: testRole.id
      };

      const createResponse = await request(app)
        .post('/api/v2/admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .send(newUserData)
        .expect(201);

      const createdUserId = createResponse.body.data.id;

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put(`/api/v2/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/v2/admin/users/${uuidv4()}`)
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/v2/admin/users/:id', () => {
    it('should remove user from company when authenticated', async () => {
      const testUser2 = await User.create(createUserData({ email: `deleteuser-${Date.now()}@example.com` }));
      await CompanyUser.create(
        createCompanyUserData(testUser2.id, testCompany.id, testRole.id),
        { context: { userId: testUser.id } }
      );

      const response = await request(app)
        .delete(`/api/v2/admin/users/${testUser2.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/v2/admin/users/${uuidv4()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v2/admin/users/:id/role', () => {
    it('should update user role in company when authenticated', async () => {
      const testUser2 = await User.create(createUserData({ email: `updaterole-${Date.now()}@example.com` }));
      await CompanyUser.create(
        createCompanyUserData(testUser2.id, testCompany.id, testRole.id),
        { context: { userId: testUser.id } }
      );

      const newRole = await CompanyRole.create(createRoleData(), { context: { userId: testUser.id } });

      const response = await request(app)
        .put(`/api/v2/admin/users/${testUser2.id}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .send({ roleId: newRole.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it('should return 400 when roleId is missing', async () => {
      const response = await request(app)
        .put(`/api/v2/admin/users/${uuidv4()}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Company-Id', testCompany.id)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
      expect(response.body.meta).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/v2/admin/users/${uuidv4()}/role`)
        .send({ roleId: uuidv4() })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Job titles (/api/v2/admin/employees/job-titles)', () => {
    it('should create company job title, list paginated, and merge system + tenant in /all', async () => {
      let systemCompany = await Company.findOne({ where: { name: SUPER_ADMIN_COMPANY_NAME } });
      if (!systemCompany) {
        systemCompany = await Company.create(
          createCompanyData({ name: SUPER_ADMIN_COMPANY_NAME, description: 'Integration system company' }),
          { context: { userId: testUser.id } }
        );
      }

      const sysTitle = `SysJob-${Date.now()}`;
      await JobTitle.create(createJobTitleData({ jobTitle: sysTitle }), {
        context: createAuditContext(testUser.id, systemCompany.id)
      });

      const tenantTitle = `TenJob-${Date.now()}`;
      const postRes = await request(app)
        .post('/api/v2/admin/employees/job-titles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ jobTitle: tenantTitle, isActive: true })
        .expect(201);

      expect(postRes.body.success).toBe(true);
      expect(postRes.body.data.jobTitle).toBe(tenantTitle);
      expect(postRes.body.meta).toBeDefined();

      const listRes = await request(app)
        .get('/api/v2/admin/employees/job-titles?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listRes.body.pagination).toBeDefined();
      expect(listRes.body.data.some((t) => t.jobTitle === tenantTitle)).toBe(true);
      expect(listRes.body.data.some((t) => t.jobTitle === sysTitle)).toBe(true);

      const sysItem = listRes.body.data.find((t) => t.jobTitle === sysTitle);
      const tenItem = listRes.body.data.find((t) => t.jobTitle === tenantTitle);
      expect(sysItem).toBeDefined();
      expect(tenItem).toBeDefined();
      expect(sysItem.canEdit).toBe(false);
      expect(sysItem.canDelete).toBe(false);
      expect(tenItem.canEdit).toBe(true);
      expect(tenItem.canDelete).toBe(true);

      const patchSys = await request(app)
        .put(`/api/v2/admin/employees/job-titles/${sysItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ jobTitle: 'Hacked' })
        .expect(403);
      expect(patchSys.body.success).toBe(false);

      const allRes = await request(app)
        .get('/api/v2/admin/employees/job-titles/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const names = allRes.body.data.map((t) => t.jobTitle);
      expect(names).toContain(tenantTitle);
      expect(names).toContain(sysTitle);
    });
  });
});

