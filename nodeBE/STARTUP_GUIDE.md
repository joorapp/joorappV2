# JoorApp V2 Backend - Startup Guide

This guide provides step-by-step instructions to start the JoorApp V2 Backend development environment from scratch.

## Prerequisites

Before starting, ensure you have:
- ✅ **Docker** installed and running ([Download Docker](https://www.docker.com/products/docker-desktop))
- ✅ **Docker Compose** installed (usually comes with Docker Desktop)
- ✅ **Node.js** (v18 or higher) and **npm** installed
- ✅ **Git** installed

Verify installations:
```bash
docker --version
docker-compose --version
node --version
npm --version
git --version
```

## Step-by-Step Startup Instructions

### Step 1: Clean Up Existing Docker Containers and Volumes

**Command:**
```bash
docker-compose -f docker-compose.dev.yml down -v
```

**What it does:**
- Stops all running containers (PostgreSQL, Keycloak)
- Removes containers, networks, and **volumes** (`-v` flag)
- Ensures a clean state for initialization scripts to run properly
- **Important**: This removes all existing data, so only run this when you want a fresh start

**Expected output:**
```
Stopping joorapp-keycloak-dev ... done
Stopping joorapp-postgres-dev ... done
Removing joorapp-keycloak-dev ... done
Removing joorapp-postgres-dev ... done
Removing network joorapp-dev-network
Removing volume joorapp-postgres-data
```

---

### Step 2: Start Docker Services

**Command:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**What it does:**
- Starts PostgreSQL and Keycloak containers in detached mode (`-d`)
- Creates Docker volumes for persistent data
- Runs initialization scripts:
  - Creates `joorapp_devDB` database with schema (from `postgres_init/init-dev-db.sql`)
  - Creates `joorapp_testDB` database (empty, ready for tests)
  - Imports Keycloak realm configuration (from `keycloak_data/realm-export.json`)
- Services run in the background

**Expected output:**
```
Creating network "joorapp-dev-network" ... done
Creating volume "joorapp-postgres-data" ... done
Creating joorapp-postgres-dev ... done
Creating joorapp-keycloak-dev ... done
```

**Wait time:** 1-2 minutes on first run (Keycloak takes time to start)

---

### Step 3: Verify Databases Are Created

**Command:**
```bash
docker exec -it joorapp-postgres-dev psql -U v2_devDB -d postgres -c "SELECT datname FROM pg_database WHERE datname NOT IN ('template0', 'template1') ORDER BY datname;"
```

**What it does:**
- Connects to PostgreSQL container as `v2_devDB` user
- Lists all databases (excluding system templates)
- Verifies that required databases exist

**Expected output:**
```
      datname       
--------------------
 joorapp_KeycloakDB
 joorapp_devDB
 joorapp_testDB
 postgres
(4 rows)
```

**What each database is for:**
- `joorapp_KeycloakDB` - Keycloak's internal database
- `joorapp_devDB` - Development database (with schema from migrations)
- `joorapp_testDB` - Test database (empty, for running tests)
- `postgres` - Default PostgreSQL database

**If you see errors:**
- Wait a bit longer (PostgreSQL might still be initializing)
- Check container logs: `docker logs joorapp-postgres-dev`
- Verify container is running: `docker ps`

---

### Step 4: Run Database Migrations (Development Database)

**Command:**
```bash
npm run migrate
```

**What it does:**
- Runs all database migrations on the **development database** (`joorapp_devDB`)
- Creates/updates tables, indexes, constraints, and seed data
- Ensures database schema matches the latest codebase
- Uses migration scripts from `src/migrations/`

**Expected output:**
```
Running migrations on development database...
Migration: 20241130100000-create-users-table.js ... ✅
Migration: 20241130150000-create-plans-table.js ... ✅
Migration: 20241130200000-create-companies-table.js ... ✅
...
All migrations completed successfully!
```

**Note:** If migrations were already run, you'll see "Migration already applied" messages.

---

### Step 5: Run Database Migrations (Test Database)

**Command:**
```bash
npm run migrate:test
```

**What it does:**
- Runs all database migrations on the **test database** (`joorapp_testDB`)
- Sets up the same schema as development database
- Prepares test database for running tests
- Ensures test isolation (separate database from dev)

**Expected output:**
```
Running migrations on test database...
Migration: 20241130100000-create-users-table.js ... ✅
Migration: 20241130150000-create-plans-table.js ... ✅
...
All migrations completed successfully!
```

**Why separate test database?**
- Tests can modify data without affecting development
- Tests can run in parallel with development
- Clean state for each test run

---

### Step 6: Verify Keycloak is Running

**⚠️ CRITICAL**: Before proceeding, you **MUST** ensure Keycloak is fully up and running.

**Option A: Check via Browser (Recommended)**
1. Open your browser
2. Navigate to: `http://localhost:8080`
3. You should see the Keycloak welcome page or login page
4. If you see the page, Keycloak is running ✅

**Option B: Check via Command Line**
```bash
# Check Keycloak health endpoint
curl http://localhost:8080/health/ready

# Or check container status
docker ps | grep keycloak
```

**Expected output:**
- Browser: Keycloak welcome/login page loads
- Command: `{"status":"UP"}` or container shows "Up (healthy)"

**If Keycloak is NOT running:**
- Wait 1-2 minutes (Keycloak takes time to start)
- Check logs: `docker logs joorapp-keycloak-dev`
- Restart: `docker-compose -f docker-compose.dev.yml restart keycloak`
- **DO NOT proceed to Step 7 until Keycloak is running**

---

### Step 7: Configure Super Admin User

**Command:**
```bash
npm run configure:super-admin
```

**What it does:**
- Creates the first super admin user in Keycloak
- Creates the "JOOR APP" company in the database
- Assigns the BASIC plan to the company
- Sets up default company roles
- Configures initial system data

**Expected output:**
```
Configuring super admin user...
✅ Super admin user created in Keycloak
✅ JOOR APP company created
✅ BASIC plan assigned to company
✅ Default roles created
Configuration completed successfully!
```

**⚠️ IMPORTANT**: This step **REQUIRES** Keycloak to be running. If Keycloak is not ready, you'll see connection errors:
```
Error: Failed to connect to Keycloak
Error: ECONNREFUSED
```

**If you see connection errors:**
1. Verify Keycloak is running (see Step 6)
2. Wait a bit longer if Keycloak just started
3. Check Keycloak logs: `docker logs joorapp-keycloak-dev`
4. Retry the command

**What gets created:**
- Super admin user in Keycloak (credentials from `.env` file)
- "JOOR APP" company in database
- Default company roles (Owner, Admin, User)
- BASIC plan assignment

---

### Step 8: Run Tests

**Command:**
```bash
npm test
```

**What it does:**
- Runs all unit tests and integration tests
- Cleans test database before running tests
- Sets up test users in Keycloak and database
- Generates test coverage report
- Validates all functionality works correctly

**Expected output:**
```
Running tests...
PASS  src/models/__tests__/User.test.js
PASS  src/services/__tests__/companyService.test.js
...
Test Suites: 42 passed, 42 total
Tests:       790 passed, 790 total
Coverage:    85% statements, 80% branches, 90% functions, 85% lines
```

**Test execution flow:**
1. Database cleanup (truncates all tables)
2. Test users setup (creates users in Keycloak and database)
3. All tests run (unit + integration)
4. Coverage report generated

**Alternative test commands:**
```bash
# Run tests without coverage (faster)
npm run test:quick

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode (auto-rerun on file changes)
npm run test:watch
```

---

## Complete Startup Sequence (Quick Reference)

Here's the complete sequence in one block:

```bash
# Step 1: Clean up Docker containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Step 2: Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# Step 3: Verify databases (wait for PostgreSQL to be ready)
docker exec -it joorapp-postgres-dev psql -U v2_devDB -d postgres -c "SELECT datname FROM pg_database WHERE datname NOT IN ('template0', 'template1') ORDER BY datname;"

# Step 4: Run migrations on development database
npm run migrate

# Step 5: Run migrations on test database
npm run migrate:test

# Step 6: Verify Keycloak is running (IMPORTANT!)
# Open browser: http://localhost:8080
# OR check: curl http://localhost:8080/health/ready

# Step 7: Configure super admin (ONLY after Keycloak is ready!)
npm run configure:super-admin

# Step 8: Run tests
npm test
```

---

## Troubleshooting

### Keycloak Not Starting

**Symptoms:**
- `npm run configure:super-admin` fails with connection errors
- Browser shows "Connection refused" at `http://localhost:8080`

**Solutions:**
1. Check container status: `docker ps | grep keycloak`
2. Check logs: `docker logs joorapp-keycloak-dev`
3. Wait 1-2 minutes (Keycloak takes time to initialize)
4. Restart: `docker-compose -f docker-compose.dev.yml restart keycloak`
5. Check port 8080 is not in use: `netstat -ano | findstr :8080` (Windows) or `lsof -i :8080` (Mac/Linux)

### Database Connection Errors

**Symptoms:**
- Migrations fail with "connection refused" or "authentication failed"

**Solutions:**
1. Verify PostgreSQL is running: `docker ps | grep postgres`
2. Check logs: `docker logs joorapp-postgres-dev`
3. Verify `.env` file has correct database credentials
4. Wait for PostgreSQL to fully initialize (30-60 seconds)

### Migration Errors

**Symptoms:**
- "Migration already applied" (this is OK - migration was already run)
- "Table already exists" (run `down -v` to clean up)

**Solutions:**
1. If migration already applied: This is normal, continue to next step
2. If table conflicts: Run `docker-compose -f docker-compose.dev.yml down -v` and start over
3. Check migration files are valid: `ls src/migrations/`

### Test Failures

**Symptoms:**
- Tests fail with database connection errors
- Tests fail with Keycloak connection errors

**Solutions:**
1. Ensure test database migrations ran: `npm run migrate:test`
2. Ensure Keycloak is running: `curl http://localhost:8080/health/ready`
3. Check `.env` file has correct test database credentials
4. Run database cleanup: `node scripts/clean-test-database.js`

---

## Next Steps

After successful startup:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access API documentation:**
   - Swagger UI: `http://localhost:3030/api/v2/docs`

3. **Access Keycloak Admin Console:**
   - URL: `http://localhost:8080`
   - Username: `admin` (or from `.env`)
   - Password: `admin` (or from `.env`)

4. **Verify API is working:**
   ```bash
   curl http://localhost:3030/api/v2/health/status
   ```

---

## Daily Development Workflow

Once everything is set up, your daily workflow is simpler:

```bash
# Start services (if not already running)
docker-compose -f docker-compose.dev.yml up -d

# Start development server
npm run dev

# Run tests (when needed)
npm test
```

**Note:** You don't need to run migrations or configure super admin every day - only on first setup or after pulling schema changes.

---

## Related Documentation

- **README.md** - General project information
- **SETUP_INSTRUCTIONS.md** - Detailed setup for sharing Docker environment
- **.cursor/rules/** - Development rules and guidelines

---

**Last Updated**: December 2024

