/**
 * @author Bhavesh Venugopal
 * EmployeeRepository tests
 */

import { Employee, Company, User, JobTitle } from '../../models/index.js';
import { employeeRepository } from '../employeeRepository.js';
import {
  createEmployeeData,
  createCompanyData,
  createUserData,
  createJobTitleData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('EmployeeRepository', () => {
  let testUser;
  let company;
  let jt;
  let ctx;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData());
    company = await Company.create(createCompanyData({ name: 'Repo Emp Co' }), {
      context: createAuditContext(testUser.id)
    });
    ctx = createAuditContext(testUser.id, company.id);
    jt = await JobTitle.create(createJobTitleData(), { context: ctx });
    await Employee.create(
      createEmployeeData(jt.id, { firstName: 'Alice', lastName: 'Smith', email: 'alice@t.com' }),
      { context: ctx }
    );
    await Employee.create(
      createEmployeeData(jt.id, { firstName: 'Bob', lastName: 'Jones', email: 'bob@t.com', phone: '555' }),
      { context: ctx }
    );
  });

  it('findAndCountByCompany filters by jobTitleId and search', async () => {
    const jt2 = await JobTitle.create(createJobTitleData({ jobTitle: 'Other' }), { context: ctx });
    await Employee.create(
      createEmployeeData(jt2.id, { firstName: 'Carol', lastName: 'White', email: 'carol@t.com' }),
      { context: ctx }
    );

    const { count, rows } = await employeeRepository.findAndCountByCompany(
      company.id,
      { jobTitleId: jt.id, search: 'ali' },
      { limit: 10, offset: 0 },
      [['lastName', 'ASC']]
    );
    expect(count).toBe(1);
    expect(rows[0].firstName).toBe('Alice');
  });

  it('findAllByCompany returns all with job title include', async () => {
    const list = await employeeRepository.findAllByCompany(company.id, {}, [
      ['lastName', 'ASC'],
      ['firstName', 'ASC']
    ]);
    expect(list.length).toBe(2);
    expect(list[0].jobTitle).toBeDefined();
  });
});
