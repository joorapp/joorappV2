/**
 * @author Bhavesh Venugopal
 * ProjectTypeRepository tests
 */

import { ProjectType, Company, User } from '../../models/index.js';
import { projectTypeRepository } from '../projectTypeRepository.js';
import {
  createProjectTypeData,
  createCompanyData,
  createUserData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('ProjectTypeRepository', () => {
  let testUser;
  let companyA;
  let companyB;
  let ctxA;
  let ctxB;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData());
    const baseCtx = createAuditContext(testUser.id);
    companyA = await Company.create(createCompanyData({ name: 'PT Repo Co A' }), { context: baseCtx });
    companyB = await Company.create(createCompanyData({ name: 'PT Repo Co B' }), { context: baseCtx });
    ctxA = createAuditContext(testUser.id, companyA.id);
    ctxB = createAuditContext(testUser.id, companyB.id);
  });

  it('findAndCountByCreatedCompany returns only that company', async () => {
    await ProjectType.create(createProjectTypeData({ projectType: 'Alpha' }), { context: ctxA });
    await ProjectType.create(createProjectTypeData({ projectType: 'Beta' }), { context: ctxB });

    const { rows, count } = await projectTypeRepository.findAndCountByCreatedCompany(
      companyA.id,
      {},
      { limit: 10, offset: 0 },
      [['projectType', 'ASC']]
    );

    expect(count).toBe(1);
    expect(rows[0].projectType).toBe('Alpha');
  });

  it('findAllForCompanyDropdown merges two companies and sorts by projectType', async () => {
    await ProjectType.create(createProjectTypeData({ projectType: 'Zebra' }), { context: ctxA });
    await ProjectType.create(createProjectTypeData({ projectType: 'Apple' }), { context: ctxB });

    const list = await projectTypeRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {});

    expect(list.map((r) => r.projectType)).toEqual(['Apple', 'Zebra']);
  });

  it('findAllForCompanyDropdown filters by isActive when provided', async () => {
    await ProjectType.create(createProjectTypeData({ projectType: 'ActiveOne', isActive: true }), { context: ctxA });
    await ProjectType.create(createProjectTypeData({ projectType: 'InactiveOne', isActive: false }), { context: ctxA });
    await ProjectType.create(createProjectTypeData({ projectType: 'ActiveB', isActive: true }), { context: ctxB });

    const activeOnly = await projectTypeRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {
      isActive: true
    });
    expect(activeOnly.map((r) => r.projectType).sort()).toEqual(['ActiveB', 'ActiveOne']);

    const inactiveOnly = await projectTypeRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {
      isActive: false
    });
    expect(inactiveOnly.map((r) => r.projectType)).toEqual(['InactiveOne']);

    const all = await projectTypeRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {});
    expect(all.map((r) => r.projectType).sort()).toEqual(['ActiveB', 'ActiveOne', 'InactiveOne']);
  });

  it('findOneByTypeAndCompany detects duplicate', async () => {
    await ProjectType.create(createProjectTypeData({ projectType: 'Unique Type' }), { context: ctxA });
    const dup = await projectTypeRepository.findOneByTypeAndCompany('Unique Type', companyA.id);
    expect(dup).toBeTruthy();
  });

  it('findAndCountByCreatedCompanies returns rows from both companies', async () => {
    await ProjectType.create(createProjectTypeData({ projectType: 'OnlyA' }), { context: ctxA });
    await ProjectType.create(createProjectTypeData({ projectType: 'OnlyB' }), { context: ctxB });
    await ProjectType.create(createProjectTypeData({ projectType: 'Third' }), { context: ctxA });

    const { rows, count } = await projectTypeRepository.findAndCountByCreatedCompanies(
      [companyA.id, companyB.id],
      {},
      { limit: 10, offset: 0 },
      [['projectType', 'ASC']]
    );

    expect(count).toBe(3);
    expect(rows.map((r) => r.projectType)).toEqual(['OnlyA', 'OnlyB', 'Third']);
  });
});
