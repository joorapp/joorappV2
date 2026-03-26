/**
 * @author Bhavesh Venugopal
 * ProjectType model tests (AuditableEntity, company scope)
 */

import { ProjectType, Company, User } from '../index.js';
import {
  createProjectTypeData,
  createCompanyData,
  createUserData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { sequelize } from '../../config/database.js';

describe('ProjectType Model', () => {
  let testUser;
  let testCompany;
  let auditContext;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData());
    testCompany = await Company.create(createCompanyData({ name: 'ProjectType Test Co' }), {
      context: createAuditContext(testUser.id)
    });
    auditContext = createAuditContext(testUser.id, testCompany.id);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should create with audit fields and createdCompanyId', async () => {
    const row = await ProjectType.create(createProjectTypeData({ projectType: 'Internal' }), {
      context: auditContext
    });

    expect(row.projectType).toBe('Internal');
    expect(row.createdUserId).toBe(testUser.id);
    expect(row.createdCompanyId).toBe(testCompany.id);
    expect(row.isActive).toBe(true);
    expect(row.version).toBe(1);
    expect(row.isDeleted).toBe(false);
  });

  it('should soft delete with userId in context', async () => {
    const row = await ProjectType.create(createProjectTypeData(), { context: auditContext });
    await row.destroy({ context: { userId: testUser.id } });

    const deleted = await ProjectType.scope('onlyDeleted').findByPk(row.id);
    expect(deleted.isDeleted).toBe(true);
    expect(deleted.deletedUserId).toBe(testUser.id);
  });

  describe('Scopes', () => {
    beforeEach(async () => {
      await sequelize.query('TRUNCATE TABLE project_types CASCADE');
    });

    it('should exclude deleted by default', async () => {
      const row = await ProjectType.create(createProjectTypeData({ projectType: 'Keep' }), { context: auditContext });
      const doomed = await ProjectType.create(createProjectTypeData({ projectType: 'Gone' }), { context: auditContext });
      await doomed.destroy({ context: { userId: testUser.id } });

      const all = await ProjectType.findAll();
      expect(all.map((r) => r.id)).toContain(row.id);
      expect(all.map((r) => r.id)).not.toContain(doomed.id);
    });
  });
});
