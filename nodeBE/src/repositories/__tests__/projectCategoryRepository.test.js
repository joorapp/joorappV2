/**
 * @author Bhavesh Venugopal
 * ProjectCategoryRepository tests
 */

import { ProjectCategory, Company, User } from '../../models/index.js';
import { projectCategoryRepository } from '../projectCategoryRepository.js';
import {
  createProjectCategoryData,
  createCompanyData,
  createUserData,
  createAuditContext
} from '../../../__tests__/helpers/factories.js';
import { cleanDatabase } from '../../../__tests__/helpers/database.js';

describe('ProjectCategoryRepository', () => {
  let testUser;
  let companyA;
  let companyB;
  let ctxA;
  let ctxB;

  beforeEach(async () => {
    await cleanDatabase();
    testUser = await User.create(createUserData());
    const baseCtx = createAuditContext(testUser.id);
    companyA = await Company.create(createCompanyData({ name: 'PC Repo Co A' }), { context: baseCtx });
    companyB = await Company.create(createCompanyData({ name: 'PC Repo Co B' }), { context: baseCtx });
    ctxA = createAuditContext(testUser.id, companyA.id);
    ctxB = createAuditContext(testUser.id, companyB.id);
  });

  it('findAndCountByCreatedCompany returns only that company', async () => {
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'Alpha' }), { context: ctxA });
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'Beta' }), { context: ctxB });

    const { rows, count } = await projectCategoryRepository.findAndCountByCreatedCompany(
      companyA.id,
      {},
      { limit: 10, offset: 0 },
      [['projectCategory', 'ASC']]
    );

    expect(count).toBe(1);
    expect(rows[0].projectCategory).toBe('Alpha');
  });

  it('findAllForCompanyDropdown merges two companies and sorts by projectCategory', async () => {
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'Zebra' }), { context: ctxA });
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'Apple' }), { context: ctxB });

    const list = await projectCategoryRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {});

    expect(list.map((r) => r.projectCategory)).toEqual(['Apple', 'Zebra']);
  });

  it('findAllForCompanyDropdown filters by isActive when provided', async () => {
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'ActiveOne', isActive: true }), {
      context: ctxA
    });
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'InactiveOne', isActive: false }), {
      context: ctxA
    });
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'ActiveB', isActive: true }), {
      context: ctxB
    });

    const activeOnly = await projectCategoryRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {
      isActive: true
    });
    expect(activeOnly.map((r) => r.projectCategory).sort()).toEqual(['ActiveB', 'ActiveOne']);

    const inactiveOnly = await projectCategoryRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {
      isActive: false
    });
    expect(inactiveOnly.map((r) => r.projectCategory)).toEqual(['InactiveOne']);

    const all = await projectCategoryRepository.findAllForCompanyDropdown(companyA.id, companyB.id, {});
    expect(all.map((r) => r.projectCategory).sort()).toEqual(['ActiveB', 'ActiveOne', 'InactiveOne']);
  });

  it('findOneByCategoryAndCompany detects duplicate', async () => {
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'Unique Cat' }), { context: ctxA });
    const dup = await projectCategoryRepository.findOneByCategoryAndCompany('Unique Cat', companyA.id);
    expect(dup).toBeTruthy();
  });

  it('findAndCountByCreatedCompanies returns rows from both companies', async () => {
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'OnlyA' }), { context: ctxA });
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'OnlyB' }), { context: ctxB });
    await ProjectCategory.create(createProjectCategoryData({ projectCategory: 'Third' }), { context: ctxA });

    const { rows, count } = await projectCategoryRepository.findAndCountByCreatedCompanies(
      [companyA.id, companyB.id],
      {},
      { limit: 10, offset: 0 },
      [['projectCategory', 'ASC']]
    );

    expect(count).toBe(3);
    expect(rows.map((r) => r.projectCategory)).toEqual(['OnlyA', 'OnlyB', 'Third']);
  });
});
