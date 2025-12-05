# Setup Instructions for Sharing Docker Environment

This document explains how to prepare your Docker setup so teammates can get a fully configured environment (database schema + Keycloak configuration) on first run.

## Overview

When teammates run `docker-compose up` for the first time, they will automatically get:
- ✅ Dev database (`joorapp_devDB`) with all your tables and schema
- ✅ Test database (`joorapp_testDB`) created empty and ready for tests
- ✅ Keycloak with your realm configuration, clients, and users

## Step 1: Export PostgreSQL Database Schema

You need to create a SQL dump of your dev database. **Do NOT include the test database** - it should remain empty for tests.

⚠️ **Important**: Use the `--if-exists` flag to prevent errors when dropping constraints on non-existent tables, and ensure UTF-8 encoding (especially on Windows).

### Option A: Schema Only (Recommended for first time)

This gives teammates the table structure without any data:

**Windows PowerShell:**
```powershell
# Make sure your containers are running
docker-compose -f docker-compose.dev.yml up -d

# Export schema only (no data) with UTF-8 encoding
docker exec -t joorapp-postgres-dev pg_dump -U v2_devDB -d joorapp_devDB --schema-only -c --if-exists | Out-File -Encoding utf8 postgres_init/init-dev-db.sql
```

**Linux/Mac/Git Bash:**
```bash
# Make sure your containers are running
docker-compose -f docker-compose.dev.yml up -d

# Export schema only (no data)
docker exec -t joorapp-postgres-dev pg_dump -U v2_devDB -d joorapp_devDB --schema-only -c --if-exists > postgres_init/init-dev-db.sql
```

### Option B: Schema + Data (If you want to share seed data)

This includes both structure and data:

**Windows PowerShell:**
```powershell
# Export schema + data with UTF-8 encoding
docker exec -t joorapp-postgres-dev pg_dump -U v2_devDB -d joorapp_devDB -c --if-exists | Out-File -Encoding utf8 postgres_init/init-dev-db.sql
```

**Linux/Mac/Git Bash:**
```bash
# Export schema + data
docker exec -t joorapp-postgres-dev pg_dump -U v2_devDB -d joorapp_devDB -c --if-exists > postgres_init/init-dev-db.sql
```

**Important Notes:**
- Replace `v2_devDB` with your actual `DB_USER` value if different
- Replace `joorapp_devDB` with your actual `DB_NAME` value if different
- The `-c` flag ensures "clean" statements (DROP/CREATE) for idempotency
- The `--if-exists` flag adds `IF EXISTS` checks to DROP statements, preventing errors when tables don't exist yet
- On Windows, use `Out-File -Encoding utf8` instead of `>` to ensure UTF-8 encoding (not UTF-16 with BOM)
- Only dump the **dev database**, NOT the test database

### Verify the Export

Check that the file was created and has content:

**Windows PowerShell:**
```powershell
Get-Item postgres_init/init-dev-db.sql | Select-Object Length
Get-Content postgres_init/init-dev-db.sql -TotalCount 20
```

**Linux/Mac/Git Bash:**
```bash
ls -lh postgres_init/init-dev-db.sql
head -20 postgres_init/init-dev-db.sql
```

You should see SQL statements like `DROP TABLE IF EXISTS`, `DROP CONSTRAINT IF EXISTS`, `CREATE TABLE`, etc.

**Verify UTF-8 encoding (Windows):**
```powershell
# Check file encoding (should NOT start with UTF-16 BOM: 0xFF 0xFE)
# The file should be readable by PostgreSQL without encoding errors
```

## Step 2: Export Keycloak Realm Configuration

You need to export your Keycloak realm configuration so teammates get your clients, users, roles, etc.

### Method 1: Via Keycloak Admin UI (Easiest)

1. **Start your Keycloak container** (if not already running):
   ```bash
   docker-compose -f docker-compose.dev.yml up -d keycloak
   ```

2. **Access Keycloak Admin Console**:
   - Open browser: `http://localhost:8080`
   - Login with admin credentials (from your `.env` file)

3. **Navigate to Realm Settings**:
   - Select your realm (e.g., `JOOR_APP_V2`) from the dropdown in the top-left
   - Click **"Realm Settings"** in the left sidebar

4. **Export the Realm**:
   - Click the **"Action"** dropdown button (top right of the page)
   - Select **"Partial Export"**
   - In the export dialog:
     - ✅ Toggle **"Include groups and roles"** to **ON**
     - ✅ Toggle **"Include clients"** to **ON**
     - ✅ Toggle **"Include identity providers"** to **ON** (if you have any)
     - Leave other options as needed
   - Click **"Export"**
   - The file will download (usually named something like `realm-export.json`)

5. **Place the file**:
   ```bash
   # Move the downloaded file to the keycloak_data directory
   # Rename it to realm-export.json if needed
   mv ~/Downloads/realm-export.json keycloak_data/realm-export.json
   ```

### Method 2: Via Keycloak Admin CLI (Alternative)

If you prefer command line:

```bash
# Export realm using Keycloak Admin CLI
docker exec -it joorapp-keycloak-dev /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin

# Export the realm
docker exec -it joorapp-keycloak-dev /opt/keycloak/bin/kcadm.sh get realms/JOOR_APP_V2 > keycloak_data/realm-export.json
```

**Note:** Replace `JOOR_APP_V2` with your actual realm name if different.

### Verify the Export

Check that the file was created:

```bash
ls -lh keycloak_data/realm-export.json
head -30 keycloak_data/realm-export.json
```

You should see JSON with realm configuration, clients, users, etc.

## Step 3: Commit Everything to Git

Once you have both files ready:

```bash
# Check what will be committed
git status

# Add the new files
git add postgres_init/init-dev-db.sql
git add keycloak_data/realm-export.json
git add docker-compose.dev.yml
git add docker/init-test-db.sh

# Commit
git commit -m "Add Docker initialization scripts for team setup

- Add PostgreSQL dev database schema dump
- Add Keycloak realm export
- Update docker-compose to auto-initialize databases and Keycloak
- Add test database creation script"

# Push to repository
git push
```

## Step 4: Instructions for Your Teammates

Share these instructions with your teammates:

### Prerequisites

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

### First Time Setup

#### Step 1: Clone the Repository

```bash
# If you haven't cloned yet
git clone <repository-url>
cd joorappV2/nodeBE

# Or if you already have the repo, pull latest changes
git pull
```

#### Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp env.example .env

# The .env file should already have correct values
# You can verify or edit if needed:
# - DB_NAME=joorapp_devDB
# - DB_USER=v2_devDB
# - DB_PASSWORD=v2_password_dev
# - KEYCLOAK_CLIENT_SECRET=tM9SZq3hQFwDGfw4Qu4ywj6Rt94PgIdP
# - etc.
```

**Note**: The client secret in `.env.example` matches what's in the database, so it should work out of the box.

#### Step 3: Clean Up Any Existing Containers

⚠️ **Important**: This step removes any existing Docker volumes. This is required for the initialization scripts to run.

```bash
# Stop and remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# If the above doesn't work, manually remove the volume:
docker volume rm joorapp-postgres-data 2>/dev/null || true
```

#### Step 4: Start Docker Services

This will automatically:
- Create and initialize the dev database with all tables
- Create an empty test database
- Import Keycloak realm configuration

```bash
# Start all services in detached mode
docker-compose -f docker-compose.dev.yml up -d

# Watch the logs to see initialization progress
docker-compose -f docker-compose.dev.yml logs -f
```

Wait for both services to be healthy (this may take 1-2 minutes on first run).

#### Step 5: Verify Everything is Working

**5.1. Check Container Status:**
```bash
docker-compose -f docker-compose.dev.yml ps
```

You should see both `postgres` and `keycloak` services with status "Up (healthy)".

**5.2. Verify Databases Exist:**
```bash
# List all databases
docker exec -it joorapp-postgres-dev psql -U v2_devDB -d postgres -c "\l"
```

You should see:
- ✅ `joorapp_devDB` (with all your tables)
- ✅ `joorapp_testDB` (empty, ready for tests)

**5.3. Verify Database Tables:**
```bash
# Check tables in dev database
docker exec -it joorapp-postgres-dev psql -U v2_devDB -d joorapp_devDB -c "\dt"
```

You should see your application tables (users, companies, company_roles, etc.) and Keycloak tables.

**5.4. Verify Keycloak is Running:**
```bash
# Check Keycloak health
curl http://localhost:8080/health/ready

# Or open in browser
# http://localhost:8080
```

**5.5. Verify Keycloak Realm:**
1. Open browser: `http://localhost:8080`
2. Click "Administration Console"
3. Login with:
   - Username: `admin` (or your `KEYCLOAK_ADMIN` value)
   - Password: `admin` (or your `KEYCLOAK_ADMIN_PASSWORD` value)
4. Select realm `JOOR_APP_V2` from dropdown
5. Verify you can see:
   - Clients (including `Joor_App_Client`)
   - Users (if any were exported)
   - Roles and groups

#### Step 6: Run Test Database Migrations

The test database is created empty. Run migrations to set up the schema:

```bash
# Make sure you're in the nodeBE directory
cd nodeBE

# Install dependencies (if not already done)
npm install

# Run migrations on test database
npm run migrate:test
```

#### Step 7: Verify Application Can Connect

```bash
# Test database connection
npm run test-db

# Start the application (optional, to verify everything works)
npm run dev
```

The application should start and connect to both Keycloak and the database successfully.

### Subsequent Runs

After the first setup, starting the environment is simple:

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart a specific service
docker-compose -f docker-compose.dev.yml restart postgres
```

**Note**: The initialization scripts only run on first volume creation, so subsequent starts are fast (no re-initialization needed).

## Troubleshooting

### "Database already exists" errors

If teammates see errors about databases already existing, they need to remove volumes:
```bash
docker-compose -f docker-compose.dev.yml down -v
docker volume rm joorapp-postgres-data  # if the above doesn't work
docker-compose -f docker-compose.dev.yml up -d
```

### Keycloak not importing realm

- Check that `realm-export.json` exists in `keycloak_data/`
- Check file permissions (should be readable)
- Check Keycloak logs: `docker logs joorapp-keycloak-dev`
- Ensure `--import-realm` flag is in docker-compose command

### Missing tables in database

- Verify `init-dev-db.sql` has content
- Check PostgreSQL logs: `docker logs joorapp-postgres-dev`
- Ensure the SQL file is properly formatted
- Make sure you removed volumes (`-v` flag) before starting

### UTF-8 encoding errors (Windows)

If you see errors like `ERROR: invalid byte sequence for encoding "UTF8": 0xff`:

- The dump file was created with wrong encoding (UTF-16 with BOM instead of UTF-8)
- Regenerate the dump using `Out-File -Encoding utf8` on Windows (see Step 1)
- Or use Git Bash/WSL instead of PowerShell for the dump command

### DROP CONSTRAINT errors

If you see errors like `ERROR: relation "public.user_company_context" does not exist`:

- The dump was created without the `--if-exists` flag
- Regenerate the dump with `--if-exists` flag (see Step 1)
- This adds `IF EXISTS` checks to all DROP statements

### Application can't connect to Keycloak

- Verify Keycloak is running: `curl http://localhost:8080/health/ready`
- Check `.env` file has correct `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`
- Verify the client secret matches what's in Keycloak:
  1. Go to Keycloak Admin Console → Clients → Joor_App_Client → Credentials
  2. Compare with `KEYCLOAK_CLIENT_SECRET` in your `.env` file

### Port already in use errors

If you see "port already in use" errors:
```bash
# Check what's using the ports
# Windows
netstat -ano | findstr :5432
netstat -ano | findstr :8080

# Mac/Linux
lsof -i :5432
lsof -i :8080

# Stop conflicting services or change ports in docker-compose.dev.yml
```

### Docker permission errors (Linux)

If you get permission denied errors:
```bash
# Add your user to docker group
sudo usermod -aG docker $USER
# Log out and log back in for changes to take effect
```

## Updating the Snapshots

If you make changes to your database schema or Keycloak configuration:

1. **Update database dump**:

   **Windows PowerShell:**
   ```powershell
   docker exec -t joorapp-postgres-dev pg_dump -U v2_devDB -d joorapp_devDB --schema-only -c --if-exists | Out-File -Encoding utf8 postgres_init/init-dev-db.sql
   ```

   **Linux/Mac/Git Bash:**
   ```bash
   docker exec -t joorapp-postgres-dev pg_dump -U v2_devDB -d joorapp_devDB --schema-only -c --if-exists > postgres_init/init-dev-db.sql
   ```

   **For Schema + Data (Windows PowerShell):**
   ```powershell
   docker exec -t joorapp-postgres-dev pg_dump -U v2_devDB -d joorapp_devDB -c --if-exists | Out-File -Encoding utf8 postgres_init/init-dev-db.sql
   ```

   **For Schema + Data (Linux/Mac/Git Bash):**
   ```bash
   docker exec -t joorapp-postgres-dev pg_dump -U v2_devDB -d joorapp_devDB -c --if-exists > postgres_init/init-dev-db.sql
   ```

2. **Update Keycloak export**:
   - Follow Step 2 above to export again
   - Replace the existing `realm-export.json`

3. **Commit and push**:
   ```bash
   git add postgres_init/init-dev-db.sql keycloak_data/realm-export.json
   git commit -m "Update database schema and Keycloak configuration"
   git push
   ```

4. **Notify teammates** to pull and reset:
   ```bash
   git pull
   docker-compose -f docker-compose.dev.yml down -v
   docker-compose -f docker-compose.dev.yml up -d
   ```

---

**Last Updated**: Check this file periodically for updates to the setup process.

