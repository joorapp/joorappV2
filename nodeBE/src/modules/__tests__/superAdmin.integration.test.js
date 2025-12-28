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
import { sequelize } from '../../../src/config/database.js';
import { createTestApp, closeTestApp } from '../../../__tests__/helpers/integration.js';
import { getAuthToken } from '../../../__tests__/helpers/auth.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { User, Company, CompanyRole, CompanyUser, Plan } from '../../../src/models/index.js';
import { createUserData, createCompanyData, createRoleData, createCompanyUserData, createPlanData } from '../../../__tests__/helpers/factories.js';
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
      // Plan uses MasterDataEntity - doesn't have createdUserId
      // Soft delete all plans except BASIC (preserve BASIC for system)
      await sequelize.query(`
        UPDATE plans 
        SET is_deleted = true,
            deleted_user_id = :testUserId,
            updated_date = CURRENT_TIMESTAMP
        WHERE code != 'BASIC'
        AND is_deleted = false
      `, {
        replacements: { testUserId: testUser.id },
        type: sequelize.QueryTypes.UPDATE
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
      expect(response.body.meta).toBeDefined();
    });

    it('should create company with all new fields', async () => {
      const companyData = {
        name: `Test Company ${Date.now()}`,
        description: 'Test company description',
        email: 'contact@example.com',
        phone: '+1 234-567-8900',
        buildingAddress: 'Suite 100',
        streetAddress: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        status: 'ACTIVE'
      };

      const response = await request(app)
        .post('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(companyData.name);
      expect(response.body.data.email).toBe(companyData.email);
      expect(response.body.data.phone).toBe(companyData.phone);
      expect(response.body.data.buildingAddress).toBe(companyData.buildingAddress);
      expect(response.body.data.streetAddress).toBe(companyData.streetAddress);
      expect(response.body.data.city).toBe(companyData.city);
      expect(response.body.data.state).toBe(companyData.state);
      expect(response.body.data.postalCode).toBe(companyData.postalCode);
      expect(response.body.data.country).toBe(companyData.country);
      expect(response.body.data.status).toBe(companyData.status);
      expect(response.body.data).not.toHaveProperty('logo'); // Logo excluded from create response
      expect(response.body.meta).toBeDefined();
    });

    it('should use default status NEW when status not provided', async () => {
      const companyData = {
        name: `Test Company ${Date.now()}`
      };

      const response = await request(app)
        .post('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData)
        .expect(201);

      expect(response.body.data.status).toBe('NEW');
    });

    it('should return 400 when status is invalid', async () => {
      const companyData = {
        name: `Test Company ${Date.now()}`,
        status: 'INVALID_STATUS'
      };

      const response = await request(app)
        .post('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
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

    it('should exclude logo from list response (lazy loading)', async () => {
      // Create test company with logo
      if (testUser) {
        await Company.create(
          createCompanyData({
            name: `Company With Logo ${Date.now()}`,
            logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          }),
          { context: { userId: testUser.id } }
        );
      }

      const response = await request(app)
        .get('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Verify logo is excluded from all companies in list
      response.body.data.forEach(company => {
        expect(company).not.toHaveProperty('logo');
      });
    });

    it('should include new fields in list response', async () => {
      // Create test company with new fields
      if (testUser) {
        await Company.create(
          createCompanyData({
            name: `Company With Fields ${Date.now()}`,
            email: 'list@example.com',
            phone: '+1 234-567-8900',
            city: 'New York',
            state: 'NY',
            country: 'United States',
            status: 'ACTIVE'
          }),
          { context: { userId: testUser.id } }
        );
      }

      const response = await request(app)
        .get('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const companyWithFields = response.body.data.find(c => c.email === 'list@example.com');
      expect(companyWithFields).toBeDefined();
      expect(companyWithFields.email).toBe('list@example.com');
      expect(companyWithFields.phone).toBe('+1 234-567-8900');
      expect(companyWithFields.city).toBe('New York');
      expect(companyWithFields.state).toBe('NY');
      expect(companyWithFields.country).toBe('United States');
      expect(companyWithFields.status).toBe('ACTIVE');
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

    it('should exclude logo by default (lazy loading)', async () => {
      const base64Logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const testCompany = await Company.create(
        createCompanyData({ logo: base64Logo }),
        { context: { userId: testUser.id } }
      );

      const response = await request(app)
        .get(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).not.toHaveProperty('logo');
    });

    it('should include logo when includeLogo=true', async () => {
      const base64Logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const testCompany = await Company.create(
        createCompanyData({ logo: base64Logo }),
        { context: { userId: testUser.id } }
      );

      const response = await request(app)
        .get(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .query({ includeLogo: 'true' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('logo');
      expect(response.body.data.logo).toBe(base64Logo);
    });

    it('should include all new fields in response', async () => {
      const testCompany = await Company.create(
        createCompanyData({
          email: 'get@example.com',
          phone: '+1 234-567-8900',
          buildingAddress: 'Suite 100',
          streetAddress: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
          status: 'ACTIVE'
        }),
        { context: { userId: testUser.id } }
      );

      const response = await request(app)
        .get(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('get@example.com');
      expect(response.body.data.phone).toBe('+1 234-567-8900');
      expect(response.body.data.buildingAddress).toBe('Suite 100');
      expect(response.body.data.streetAddress).toBe('123 Main Street');
      expect(response.body.data.city).toBe('New York');
      expect(response.body.data.state).toBe('NY');
      expect(response.body.data.postalCode).toBe('10001');
      expect(response.body.data.country).toBe('United States');
      expect(response.body.data.status).toBe('ACTIVE');
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

    it('should update company with all new fields', async () => {
      const testCompany = await Company.create(createCompanyData(), { context: { userId: testUser.id } });

      const updateData = {
        email: 'updated@example.com',
        phone: '+1 555-123-4567',
        buildingAddress: 'Suite 200',
        streetAddress: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'United States',
        status: 'ACTIVE'
      };

      const response = await request(app)
        .put(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(updateData.email);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.buildingAddress).toBe(updateData.buildingAddress);
      expect(response.body.data.streetAddress).toBe(updateData.streetAddress);
      expect(response.body.data.city).toBe(updateData.city);
      expect(response.body.data.state).toBe(updateData.state);
      expect(response.body.data.postalCode).toBe(updateData.postalCode);
      expect(response.body.data.country).toBe(updateData.country);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should update status to different enum values', async () => {
      const testCompany = await Company.create(
        createCompanyData({ status: 'NEW' }),
        { context: { userId: testUser.id } }
      );

      // Update to ACTIVE
      let response = await request(app)
        .put(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'ACTIVE' })
        .expect(200);

      expect(response.body.data.status).toBe('ACTIVE');

      // Update to LICENSE_EXPIRED
      response = await request(app)
        .put(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'LICENSE_EXPIRED' })
        .expect(200);

      expect(response.body.data.status).toBe('LICENSE_EXPIRED');
    });

    it('should return 400 when status is invalid', async () => {
      const testCompany = await Company.create(createCompanyData(), { context: { userId: testUser.id } });

      const response = await request(app)
        .put(`/api/v2/superAdmin/companies/${testCompany.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
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

  describe('POST /api/v2/superAdmin/plans', () => {
    it('should create plan successfully', async () => {
      const planData = {
        name: `Test Plan ${Date.now()}`,
        code: `PLAN-${Date.now()}`,
        description: 'Test plan description',
        price: 99.99,
        isActive: true
      };

      const response = await request(app)
        .post('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(planData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(planData.name);
      expect(response.body.data.code).toBe(planData.code);
      expect(response.body.data.price).toBe(99.99);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'TEST' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when price is negative', async () => {
      const response = await request(app)
        .post('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Plan',
          code: 'TEST',
          price: -10.00
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v2/superAdmin/plans', () => {
    it('should return paginated list of plans', async () => {
      const response = await request(app)
        .get('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/v2/superAdmin/plans/:id', () => {
    it('should return plan by ID', async () => {
      // First create a plan
      const createResponse = await request(app)
        .post('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Plan ${Date.now()}`,
          code: `PLAN-${Date.now()}`,
          price: 49.99
        })
        .expect(201);

      const planId = createResponse.body.data.id;

      // Then get it
      const response = await request(app)
        .get(`/api/v2/superAdmin/plans/${planId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(planId);
      expect(response.body.data.price).toBe(49.99);
    });
  });

  describe('PUT /api/v2/superAdmin/plans/:id', () => {
    it('should update plan successfully', async () => {
      // First create a plan
      const createResponse = await request(app)
        .post('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Plan ${Date.now()}`,
          code: `PLAN-${Date.now()}`,
          price: 10.00
        })
        .expect(201);

      const planId = createResponse.body.data.id;

      // Then update it
      const response = await request(app)
        .put(`/api/v2/superAdmin/plans/${planId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Plan',
          price: 149.99
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Plan');
      expect(response.body.data.price).toBe(149.99);
    });
  });

  describe('DELETE /api/v2/superAdmin/plans/:id', () => {
    it('should delete plan successfully', async () => {
      // First create a plan
      const createResponse = await request(app)
        .post('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Plan ${Date.now()}`,
          code: `PLAN-${Date.now()}`,
          price: 10.00
        })
        .expect(201);

      const planId = createResponse.body.data.id;

      // Then delete it
      const response = await request(app)
        .delete(`/api/v2/superAdmin/plans/${planId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent deletion of BASIC plan', async () => {
      // Get BASIC plan (should exist from migration)
      const listResponse = await request(app)
        .get('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 100 })
        .expect(200);

      const basicPlan = listResponse.body.data.find(p => p.code === 'BASIC');
      if (basicPlan) {
        const response = await request(app)
          .delete(`/api/v2/superAdmin/plans/${basicPlan.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('BAD_REQUEST');
      }
    });
  });

  describe('Plan Assignment in Company Creation', () => {
    it('should assign BASIC plan to new company by default', async () => {
      // Get BASIC plan ID
      const listResponse = await request(app)
        .get('/api/v2/superAdmin/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 100 })
        .expect(200);

      const basicPlan = listResponse.body.data.find(p => p.code === 'BASIC');
      expect(basicPlan).toBeDefined();

      // Create company
      const companyData = {
        name: `Test Company ${Date.now()}`,
        description: 'Test company'
      };

      const response = await request(app)
        .post('/api/v2/superAdmin/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plan).toBeDefined();
      expect(response.body.data.plan.id).toBe(basicPlan.id);
      expect(response.body.data.plan.code).toBe('BASIC');
    });
  });
});

