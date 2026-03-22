/**
 * @author Bhavesh Venugopal
 * JobTitleRepository tests
 */

import { JobTitle, Company, User } from '../../models/index.js';
import { jobTitleRepository } from '../jobTitleRepository.js';
import {
  createJobTitleData,
  createCompanyData,
  createUserData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('JobTitleRepository', () => {
  let testUser;
  let companyA;
  let companyB;
  let ctxA;
  let ctxB;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData());
    const baseCtx = createAuditContext(testUser.id);
    companyA = await Company.create(createCompanyData({ name: 'Repo Co A' }), { context: baseCtx });
    companyB = await Company.create(createCompanyData({ name: 'Repo Co B' }), { context: baseCtx });
    ctxA = createAuditContext(testUser.id, companyA.id);
    ctxB = createAuditContext(testUser.id, companyB.id);
  });

  it('findAndCountByCreatedCompany returns only that company', async () => {
    await JobTitle.create(createJobTitleData({ jobTitle: 'Alpha' }), { context: ctxA });
    await JobTitle.create(createJobTitleData({ jobTitle: 'Beta' }), { context: ctxB });

    const { rows, count } = await jobTitleRepository.findAndCountByCreatedCompany(
      companyA.id,
      {},
      { limit: 10, offset: 0 },
      [['jobTitle', 'ASC']]
    );

    expect(count).toBe(1);
    expect(rows[0].jobTitle).toBe('Alpha');
  });

  it('findAllForCompanyDropdown merges two companies and sorts by jobTitle', async () => {
    await JobTitle.create(createJobTitleData({ jobTitle: 'Zebra' }), { context: ctxA });
    await JobTitle.create(createJobTitleData({ jobTitle: 'Apple' }), { context: ctxB });

    const list = await jobTitleRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {});

    expect(list.map((r) => r.jobTitle)).toEqual(['Apple', 'Zebra']);
  });

  it('findOneByTitleAndCompany detects duplicate', async () => {
    await JobTitle.create(createJobTitleData({ jobTitle: 'Unique Title' }), { context: ctxA });
    const dup = await jobTitleRepository.findOneByTitleAndCompany('Unique Title', companyA.id);
    expect(dup).toBeTruthy();
  });

  it('findAndCountByCreatedCompanies returns rows from both companies', async () => {
    await JobTitle.create(createJobTitleData({ jobTitle: 'OnlyA' }), { context: ctxA });
    await JobTitle.create(createJobTitleData({ jobTitle: 'OnlyB' }), { context: ctxB });
    await JobTitle.create(createJobTitleData({ jobTitle: 'Third' }), { context: ctxA });

    const { rows, count } = await jobTitleRepository.findAndCountByCreatedCompanies(
      [companyA.id, companyB.id],
      {},
      { limit: 10, offset: 0 },
      [['jobTitle', 'ASC']]
    );

    expect(count).toBe(3);
    expect(rows.map((r) => r.jobTitle)).toEqual(['OnlyA', 'OnlyB', 'Third']);
  });
});
