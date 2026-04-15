/**
 * @author Bhavesh Venugopal
 * ClientType model tests (AuditableEntity, company scope)
 */

import { ClientType, Company, User } from '../index.js';
import {
  createClientTypeData,
  createCompanyData,
  createUserData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';
import { sequelize } from '../../config/database.js';

describe('ClientType Model', () => {
  let testUser;
  let testCompany;
  let auditContext;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData());
    testCompany = await Company.create(createCompanyData({ name: 'ClientType Test Co' }), {
      context: createAuditContext(testUser.id)
    });
    auditContext = createAuditContext(testUser.id, testCompany.id);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should create with audit fields and createdCompanyId', async () => {
    const row = await ClientType.create(createClientTypeData({ clientType: 'Enterprise' }), {
      context: auditContext
    });

    expect(row.clientType).toBe('Enterprise');
    expect(row.createdUserId).toBe(testUser.id);
    expect(row.createdCompanyId).toBe(testCompany.id);
    expect(row.isActive).toBe(true);
    expect(row.version).toBe(1);
    expect(row.isDeleted).toBe(false);
  });

  it('should soft delete with userId in context', async () => {
    const row = await ClientType.create(createClientTypeData(), { context: auditContext });
    await row.destroy({ context: { userId: testUser.id } });

    const deleted = await ClientType.scope('onlyDeleted').findByPk(row.id);
    expect(deleted.isDeleted).toBe(true);
    expect(deleted.deletedUserId).toBe(testUser.id);
  });

  describe('Scopes', () => {
    beforeEach(async () => {
      await sequelize.query('TRUNCATE TABLE client_types CASCADE');
    });

    it('should exclude deleted by default', async () => {
      const row = await ClientType.create(createClientTypeData({ clientType: 'Keep' }), { context: auditContext });
      const doomed = await ClientType.create(createClientTypeData({ clientType: 'Gone' }), { context: auditContext });
      await doomed.destroy({ context: { userId: testUser.id } });

      const all = await ClientType.findAll();
      expect(all.map((r) => r.id)).toContain(row.id);
      expect(all.map((r) => r.id)).not.toContain(doomed.id);
    });
  });
});
