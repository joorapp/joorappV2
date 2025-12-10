/**
 * @author Bhavesh Venugopal
 * CompanyRepository Tests
 * Tests for CompanyRepository complex query methods and CRUD with audit context
 */

import { companyRepository } from '../companyRepository.js';
import { Company, User, CompanyUser, CompanyRole } from '../../models/index.js';
import { createCompanyData, createUserData, createRoleData, createCompanyUserData, createAuditContext } from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { NotFoundError } from '../../utils/errors.js';
import { sequelize } from '../../config/database.js';

describe('CompanyRepository', () => {
  let testUser;
  let auditContext;

  beforeEach(async () => {
    await cleanDatabase();
    
    testUser = await User.create(createUserData());
    auditContext = createAuditContext(testUser.id);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('BaseRepository Methods with Audit', () => {
    beforeEach(async () => {
      // Clean companies table to ensure test isolation
      await sequelize.query('TRUNCATE TABLE companies CASCADE');
    });

    it('should create company with context using create', async () => {
      // Arrange
      const companyData = createCompanyData({ name: 'Test Company' });

      // Act
      const company = await companyRepository.create(companyData, auditContext);

      // Assert
      expect(company).toBeDefined();
      expect(company.id).toBeValidUUID();
      expect(company.name).toBe('Test Company');
      expect(company.createdUserId).toBe(testUser.id);
    });

    it('should update company with context using update', async () => {
      // Arrange
      const company = await companyRepository.create(
        createCompanyData({ name: 'Old Name' }),
        auditContext
      );

      // Act
      const updated = await companyRepository.update(
        company.id,
        { name: 'New Name' },
        auditContext
      );

      // Assert
      expect(updated.name).toBe('New Name');
      expect(updated.updatedUserId).toBe(testUser.id);
      expect(updated.version).toBe(2); // Version incremented
    });

    it('should soft delete company using delete', async () => {
      // Arrange
      const company = await companyRepository.create(
        createCompanyData(),
        auditContext
      );

      // Act
      await companyRepository.delete(company.id, auditContext);

      // Assert - should not be found by default
      const found = await companyRepository.findById(company.id);
      expect(found).toBeNull();

      // But should be found with includeDeleted
      const foundDeleted = await companyRepository.findByIdIncludingDeleted(company.id);
      expect(foundDeleted).toBeDefined();
      expect(foundDeleted.isDeleted).toBe(true);
    });

    it('should restore soft-deleted company using restore', async () => {
      // Arrange
      const company = await companyRepository.create(
        createCompanyData(),
        auditContext
      );
      await companyRepository.delete(company.id, auditContext);

      // Act
      const restored = await companyRepository.restore(company.id, auditContext);

      // Assert
      expect(restored.isDeleted).toBe(false);
      
      // Should be found by default now
      const found = await companyRepository.findById(company.id);
      expect(found).toBeDefined();
    });

    it('should count companies excluding deleted', async () => {
      // Arrange
      await companyRepository.create(createCompanyData({ name: 'Company 1' }), auditContext);
      const company2 = await companyRepository.create(createCompanyData({ name: 'Company 2' }), auditContext);
      await companyRepository.delete(company2.id, auditContext);

      // Act
      const count = await companyRepository.count();

      // Assert
      expect(count).toBe(1); // Only non-deleted
    });

    it('should count all companies including deleted', async () => {
      // Arrange
      await companyRepository.create(createCompanyData({ name: 'Company 1' }), auditContext);
      const company2 = await companyRepository.create(createCompanyData({ name: 'Company 2' }), auditContext);
      await companyRepository.delete(company2.id, auditContext);

      // Act
      const count = await companyRepository.countIncludingDeleted();

      // Assert
      expect(count).toBe(2); // Both active and deleted
    });
  });

  describe('Complex Query: findCompanyWithUsers', () => {
    let testCompany, testRole, user2;

    beforeEach(async () => {
      testCompany = await companyRepository.create(
        createCompanyData({ name: 'Test Company' }),
        auditContext
      );
      
      testRole = await CompanyRole.create(
        createRoleData(testCompany.id, { name: 'Manager', code: 'MANAGER' }),
        { context: auditContext }
      );
      
      user2 = await User.create(createUserData({ email: 'user2@example.com' }));

      // Assign users to company
      await CompanyUser.create(
        createCompanyUserData(testUser.id, testCompany.id, testRole.id),
        { context: auditContext }
      );
      await CompanyUser.create(
        createCompanyUserData(user2.id, testCompany.id, testRole.id),
        { context: auditContext }
      );
    });

    it('should find company with all users and roles', async () => {
      // Act
      const result = await companyRepository.findCompanyWithUsers(testCompany.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(testCompany.id);
      expect(result.name).toBe('Test Company');
    });

    it('should throw NotFoundError for non-existent company', async () => {
      // Act & Assert
      await expect(
        companyRepository.findCompanyWithUsers('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Complex Query: searchCompanies', () => {
    beforeEach(async () => {
      // Clean companies table to ensure test isolation
      await sequelize.query('TRUNCATE TABLE companies CASCADE');
      
      await companyRepository.create(
        createCompanyData({ name: 'Acme Corporation', code: 'ACME' }),
        auditContext
      );
      await companyRepository.create(
        createCompanyData({ name: 'Tech Solutions', code: 'TECH' }),
        auditContext
      );
      await companyRepository.create(
        createCompanyData({ name: 'Global Services', code: 'GLOBAL' }),
        auditContext
      );
    });

    it('should search companies by name', async () => {
      // Act
      const result = await companyRepository.searchCompanies('Acme');

      // Assert
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toContain('Acme');
    });

    it('should search companies by code', async () => {
      // Act
      const result = await companyRepository.searchCompanies('TECH');

      // Assert
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].code).toBe('TECH');
    });

    it('should support pagination', async () => {
      // Act
      const result = await companyRepository.searchCompanies('', { limit: 2, offset: 0 });

      // Assert
      expect(result.rows).toHaveLength(2);
      expect(result.count).toBe(3);
    });

    it('should support sorting', async () => {
      // Act
      const result = await companyRepository.searchCompanies('', {}, { sortBy: 'name', sortOrder: 'ASC' });

      // Assert
      expect(result.rows.length).toBe(3);
      const names = result.rows.map(c => c.name);
      expect(names).toEqual(['Acme Corporation', 'Global Services', 'Tech Solutions']);
    });
  });

  describe('Complex Query: findCompaniesByCreatedUser', () => {
    let user2, user2Context;

    beforeEach(async () => {
      user2 = await User.create(createUserData({ email: 'user2@example.com' }));
      user2Context = createAuditContext(user2.id);

      // testUser creates 2 companies
      await companyRepository.create(createCompanyData({ name: 'Company 1' }), auditContext);
      await companyRepository.create(createCompanyData({ name: 'Company 2' }), auditContext);

      // user2 creates 1 company
      await companyRepository.create(createCompanyData({ name: 'Company 3' }), user2Context);
    });

    it('should find all companies created by a user', async () => {
      // Act
      const companies = await companyRepository.findCompaniesByCreatedUser(testUser.id);

      // Assert
      expect(companies).toHaveLength(2);
      expect(companies.every(c => c.createdUserId === testUser.id)).toBe(true);
    });

    it('should return empty array for user who created no companies', async () => {
      // Arrange
      const user3 = await User.create(createUserData({ email: 'user3@example.com' }));

      // Act
      const companies = await companyRepository.findCompaniesByCreatedUser(user3.id);

      // Assert
      expect(companies).toHaveLength(0);
    });
  });

  describe('Complex Query: findActiveCompanies', () => {
    beforeEach(async () => {
      // Clean companies table to ensure test isolation
      await sequelize.query('TRUNCATE TABLE companies CASCADE');
      
      await companyRepository.create(
        createCompanyData({ name: 'Active Company 1', isActive: true }),
        auditContext
      );
      await companyRepository.create(
        createCompanyData({ name: 'Active Company 2', isActive: true }),
        auditContext
      );
      await companyRepository.create(
        createCompanyData({ name: 'Inactive Company', isActive: false }),
        auditContext
      );
    });

    it('should find only active companies', async () => {
      // Act
      const companies = await companyRepository.findActiveCompanies();

      // Assert
      expect(companies).toHaveLength(2);
      expect(companies.every(c => c.isActive === true)).toBe(true);
    });

    it('should support filtering active companies with additional filters', async () => {
      // Act
      const companies = await companyRepository.findActiveCompanies({ name: 'Active Company 1' });

      // Assert
      expect(companies).toHaveLength(1);
      expect(companies[0].name).toBe('Active Company 1');
    });
  });
});

