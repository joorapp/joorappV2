/**
 * @author Bhavesh Venugopal
 * JobTitle model tests (AuditableEntity, company scope)
 */

import { JobTitle, Company, User } from '../index.js';
import {
  createJobTitleData,
  createCompanyData,
  createUserData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { sequelize } from '../../config/database.js';

describe('JobTitle Model', () => {
  let testUser;
  let testCompany;
  let auditContext;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData());
    testCompany = await Company.create(createCompanyData({ name: 'JobTitle Test Co' }), {
      context: createAuditContext(testUser.id)
    });
    auditContext = createAuditContext(testUser.id, testCompany.id);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should create with audit fields and createdCompanyId', async () => {
    const row = await JobTitle.create(createJobTitleData({ jobTitle: 'Engineer' }), {
      context: auditContext
    });

    expect(row.jobTitle).toBe('Engineer');
    expect(row.createdUserId).toBe(testUser.id);
    expect(row.createdCompanyId).toBe(testCompany.id);
    expect(row.isActive).toBe(true);
    expect(row.version).toBe(1);
    expect(row.isDeleted).toBe(false);
  });

  it('should soft delete with userId in context', async () => {
    const row = await JobTitle.create(createJobTitleData(), { context: auditContext });
    await row.destroy({ context: { userId: testUser.id } });

    const deleted = await JobTitle.scope('onlyDeleted').findByPk(row.id);
    expect(deleted.isDeleted).toBe(true);
    expect(deleted.deletedUserId).toBe(testUser.id);
  });

  describe('Scopes', () => {
    beforeEach(async () => {
      await sequelize.query('TRUNCATE TABLE job_titles CASCADE');
    });

    it('should exclude deleted by default', async () => {
      const row = await JobTitle.create(createJobTitleData({ jobTitle: 'Keep' }), { context: auditContext });
      const doomed = await JobTitle.create(createJobTitleData({ jobTitle: 'Gone' }), { context: auditContext });
      await doomed.destroy({ context: { userId: testUser.id } });

      const all = await JobTitle.findAll();
      expect(all.map((r) => r.id)).toContain(row.id);
      expect(all.map((r) => r.id)).not.toContain(doomed.id);
    });
  });
});
