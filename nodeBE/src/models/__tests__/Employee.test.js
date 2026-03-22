/**
 * @author Bhavesh Venugopal
 * Employee model tests
 */

import { Employee, Company, User, JobTitle } from '../index.js';
import {
  createEmployeeData,
  createCompanyData,
  createUserData,
  createJobTitleData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('Employee Model', () => {
  let testUser;
  let testCompany;
  let jobTitle;
  let ctx;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData());
    testCompany = await Company.create(createCompanyData({ name: 'Emp Test Co' }), {
      context: createAuditContext(testUser.id)
    });
    ctx = createAuditContext(testUser.id, testCompany.id);
    jobTitle = await JobTitle.create(createJobTitleData({ jobTitle: 'Engineer' }), { context: ctx });
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should create with audit and job title FK', async () => {
    const row = await Employee.create(
      createEmployeeData(jobTitle.id, { firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.test' }),
      { context: ctx }
    );
    expect(row.firstName).toBe('Jane');
    expect(row.createdCompanyId).toBe(testCompany.id);
    expect(row.jobTitleId).toBe(jobTitle.id);
  });

  it('should soft delete with userId in context', async () => {
    const row = await Employee.create(createEmployeeData(jobTitle.id), { context: ctx });
    await row.destroy({ context: { userId: testUser.id } });
    const deleted = await Employee.scope('withDeleted').findByPk(row.id);
    expect(deleted.isDeleted).toBe(true);
  });
});
