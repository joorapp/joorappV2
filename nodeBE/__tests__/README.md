# Testing Setup - JoorApp V2 Backend

## ✅ Testing Infrastructure Complete (Phases 1-3)

### What's Been Implemented

#### **Phase 1: Foundation** ✅
1. **Test Helpers** (`__tests__/helpers/`)
   - `factories.js` - Data generation helpers
   - `database.js` - Cleanup utilities
   - `matchers.js` - Custom Jest matchers

2. **Test Configuration**
   - `__tests__/setup.js` - Global setup with custom matchers
   - `scripts/run-tests.js` - Test runner with environment loading
   - `jest.config.js` - Jest configuration for ES6 modules
   - Sequential test execution (`--runInBand`) to avoid deadlocks

3. **Test Commands**
   - `npm test` - Run all tests with coverage
   - `npm run test:quick` - Run tests without coverage
   - `npm run test:watch` - Watch mode
   - `npm run test:unit` - Unit tests only
   - `npm run test:integration` - Integration tests only

#### **Phase 2: Model Tests** ✅
1. **User.test.js** (10 tests)
   - CRUD operations
   - Validation
   - Soft delete
   - Status fields
   - Email uniqueness

2. **Company.test.js** (23 tests)
   - CRUD with audit fields
   - Scopes (default, withDeleted, onlyDeleted)
   - Validation
   - Default values
   - Optimistic locking
   - Context requirements

3. **CompanyRole.test.js** (15 tests)
   - CRUD with audit fields
   - Scopes
   - Validation
   - Unique constraints within company
   - Context requirements

4. **CompanyUser.test.js** (18 tests)
   - CRUD with audit fields
   - Scopes
   - Validation
   - Unique constraints
   - Multi-company assignments

5. **UserCompanyContext.test.js** (12 tests)
   - CRUD without audit fields
   - Validation
   - Foreign key relationships
   - No context required

#### **Phase 3: Repository Tests** ✅
1. **userRepository.test.js** (12 tests)
   - BaseRepository methods
   - Complex queries:
     - `findUserWithCompanies`
     - `searchUsers` (with pagination/sorting)
     - `findUsersByCompany`

2. **companyRepository.test.js** (15 tests)
   - BaseRepository methods with audit
   - Soft delete and restore
   - Complex queries:
     - `findCompanyWithUsers`
     - `searchCompanies` (with pagination/sorting)
     - `findCompaniesByCreatedUser`
     - `findActiveCompanies`

3. **roleRepository.test.js** (10 tests)
   - BaseRepository methods with audit
   - Complex queries:
     - `findRoleWithAssignments`
     - `findRolesByCompany`
     - `findActiveRoles`
     - `findRoleByCode`

4. **companyUserRepository.test.js** (12 tests)
   - BaseRepository methods with audit
   - Complex queries:
     - `findUserCompanies`
     - `findCompanyUsers` (with pagination)
     - `findUserCompanyRole`
     - `checkUserInCompany`
     - `findActiveAssignments`
   - Unique constraint handling:
     - `assignUserToCompany` (upsert logic)

### Test Infrastructure Features

#### **Custom Jest Matchers**
- `toBeValidUUID()` - Validates UUID format
- `toHaveAuditFields()` - Checks for audit fields
- `toHaveValidAuditValues(userId)` - Validates audit values
- `toBeRecentDate(seconds)` - Checks date recency
- `toMatchAPIResponse()` - Validates API response format

#### **Test Factories**
- `createUserData(overrides)` - Generate User test data
- `createCompanyData(overrides)` - Generate Company test data
- `createRoleData(companyId, overrides)` - Generate CompanyRole test data
- `createCompanyUserData(userId, companyId, roleId, overrides)` - Generate CompanyUser test data
- `createContextData(userId, companyId, overrides)` - Generate UserCompanyContext test data
- `createAuditContext(userId, companyId)` - Generate audit context

#### **Database Cleanup Utilities**
- `cleanDatabase()` - Truncate all tables
- `cleanTables(tableNames)` - Truncate specific tables
- `cleanUsers()` - Clean users table only
- `cleanCompanies()` - Clean company-related tables
- `cleanAuditableTables()` - Clean all auditable models
- `getTableCount(tableName)` - Get record count
- `isDatabaseClean()` - Check if all tables are empty

### Test Database

- **Database**: `joorapp_testDB` (PostgreSQL)
- **Environment**: `.env.test.local`
- **Migrations**: Run manually via `npm run migrate:test`
- **Isolation**: Sequential execution to avoid deadlocks

### Current Test Status

**Total Tests Created:** ~110 tests across 9 test files

**Test Distribution:**
- Phase 1: Infrastructure setup ✅
- Phase 2: Model tests (78 tests) ✅
- Phase 3: Repository tests (49 tests) ✅

**Known Issues:**
- Company Model: 4 tests failing (optimistic locking/soft delete interactions)
  - Update with context
  - Soft delete
  - Restore after soft delete
  - Optimistic locking conflict detection

### Running Tests

```bash
# Run all tests with coverage (sequential)
npm test

# Run tests quickly without coverage
npm run test:quick

# Run specific test file
npm run test:quick -- Company.test.js

# Run tests in watch mode
npm run test:watch

# Run with specific pattern
npm run test:quick -- --testNamePattern="should create"
```

### Test File Structure

```
nodeBE/
├── __tests__/
│   ├── helpers/
│   │   ├── factories.js       # Test data generators
│   │   ├── database.js         # Cleanup utilities
│   │   └── matchers.js         # Custom Jest matchers
│   ├── mocks/                  # Mock objects (future)
│   ├── setup.js                # Global test setup
│   └── README.md               # This file
├── src/
│   ├── models/
│   │   └── __tests__/
│   │       ├── User.test.js
│   │       ├── Company.test.js
│   │       ├── CompanyRole.test.js
│   │       ├── CompanyUser.test.js
│   │       └── UserCompanyContext.test.js
│   └── repositories/
│       └── __tests__/
│           ├── userRepository.test.js
│           ├── companyRepository.test.js
│           ├── roleRepository.test.js
│           └── companyUserRepository.test.js
├── scripts/
│   └── run-tests.js            # Custom test runner
└── jest.config.js              # Jest configuration
```

### Next Steps

1. **Fix Known Issues** (4 failing tests in Company.test.js)
   - Debug optimistic locking interaction with soft delete
   - Review hook execution order
   - Test update/save flow

2. **Phase 4: Service Tests** (Future)
   - userService.test.js
   - companyService.test.js
   - roleService.test.js
   - companyUserService.test.js
   - keycloakService.test.js (mocked)

3. **Phase 5: Integration Tests** (Future)
   - API endpoint tests
   - Authentication flow tests
   - Role-based access control tests

4. **Phase 6: Coverage Optimization** (Future)
   - Increase coverage to 70%+
   - Add edge case tests
   - Add error scenario tests

### Testing Best Practices

1. **Use Factories**: Always use factory helpers for test data
2. **Clean Database**: Use cleanup helpers in `beforeEach`/`afterEach`
3. **Sequential Execution**: Tests run with `--runInBand` to avoid deadlocks
4. **Custom Matchers**: Use custom matchers for common assertions
5. **Audit Context**: Always provide context for auditable models
6. **Meaningful Names**: Test names should describe behavior clearly
7. **Arrange-Act-Assert**: Follow AAA pattern in all tests
8. **Isolation**: Each test should be independent

### Migration Management

```bash
# Run migrations on test database
npm run migrate:test

# Run migrations on dev database
npm run migrate:dev

# Revert migrations
npm run migrate:test -- down
```

### Troubleshooting

**Issue**: Tests fail with "deadlock detected"
**Solution**: Tests are now configured to run sequentially with `--runInBand`

**Issue**: "relation does not exist" errors
**Solution**: Run `npm run migrate:test` before running tests

**Issue**: "userId must be provided in options.context"
**Solution**: Use `createAuditContext()` helper for auditable models

**Issue**: UUID validation errors
**Solution**: Use `uuidv4()` or factory helpers to generate valid UUIDs

---

## 📊 Summary

✅ **Complete test infrastructure for Phases 1-3**
✅ **~110 tests created** covering models and repositories
✅ **Custom test helpers** for data generation and cleanup
✅ **Custom Jest matchers** for common assertions
✅ **Sequential test execution** to avoid concurrency issues
⚠️ **4 failing tests** in Company model (known issue with optimistic locking)

**Next Goal:** Fix failing tests, then proceed to Service tests (Phase 4)
