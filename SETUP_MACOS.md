# macOS Setup Guide - JoorApp V2

Complete step-by-step guide to set up and run the JoorApp V2 application on macOS.

## Prerequisites

Before starting, ensure you have the following installed:

### 1. Install Homebrew (if not already installed)

```bash
# Check if Homebrew is installed
brew --version

# If not installed, run:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Docker Desktop for Mac

**Option A: Using Homebrew (Recommended)**
```bash
brew install --cask docker
```

**Option B: Manual Download**
1. Visit: https://www.docker.com/products/docker-desktop
2. Download Docker Desktop for Mac (Apple Silicon or Intel)
3. Install the `.dmg` file
4. Open Docker Desktop from Applications

**Verify Docker Installation:**
```bash
docker --version
docker-compose --version
```

**Start Docker Desktop:**
- Open Docker Desktop from Applications
- Wait for it to fully start (whale icon in menu bar should be steady)
- Verify it's running:
```bash
docker ps
```

### 3. Install Node.js and npm

**Using Homebrew:**
```bash
# Install Node.js (includes npm)
brew install node

# Verify installation
node --version  # Should be v18 or higher
npm --version
```

**Alternative: Using nvm (Node Version Manager)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc  # or ~/.bash_profile

# Install Node.js
nvm install 18
nvm use 18

# Verify
node --version
npm --version
```

### 4. Install Git (if not already installed)

```bash
# Check if Git is installed
git --version

# If not installed:
brew install git
```

---

## Initial Setup Steps

### Step 1: Clone the Repository

```bash
# Navigate to your desired directory
cd ~/Projects  # or wherever you keep projects

# Clone the repository (replace with your actual repo URL)
git clone <repository-url>
cd joorappV2

# Verify you're in the right directory
ls -la
# You should see: nodeBE, frontend, and other directories
```

### Step 2: Set Up Backend Environment

```bash
# Navigate to backend directory
cd nodeBE

# Copy the example environment file
cp env.example .env

# The .env file should already have correct default values
# You can verify or edit if needed:
cat .env
```

**Important Environment Variables:**
- `DB_NAME=joorapp_devDB`
- `DB_USER=v2_devDB`
- `DB_PASSWORD=v2_password_dev`
- `KEYCLOAK_URL=http://localhost:8080`
- `KEYCLOAK_REALM=JOOR_APP_V2`
- `KEYCLOAK_CLIENT_ID=Joor_App_Client`
- `KEYCLOAK_CLIENT_SECRET=uu2VXrtz4pwfOmW9qebZIDObxOoOsZSG`

### Step 3: Clean Up Any Existing Docker Containers (First Time Only)

⚠️ **Important**: This step removes any existing Docker volumes. This is required for the initialization scripts to run on first setup.

```bash
# Make sure you're in the nodeBE directory
cd nodeBE

# Stop and remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# If the above doesn't work, manually remove the volume:
docker volume rm joorapp-postgres-data 2>/dev/null || true
```

### Step 4: Start Docker Services

This will automatically:
- Create and initialize the dev database with all tables
- Create an empty test database
- Import Keycloak realm configuration
- Start pgAdmin for database management

```bash
# Make sure you're in the nodeBE directory
cd nodeBE

# Start all services in detached mode
docker-compose -f docker-compose.dev.yml up -d

# Watch the logs to see initialization progress
docker-compose -f docker-compose.dev.yml logs -f
```

**Wait for services to be healthy** (this may take 1-2 minutes on first run). You'll see messages like:
- `postgres: database system is ready to accept connections`
- `keycloak: ... Server startup in ...`

Press `Ctrl+C` to stop watching logs (containers will keep running).

### Step 5: Verify Docker Services Are Running

```bash
# Check container status
docker-compose -f docker-compose.dev.yml ps
```

You should see:
- ✅ `postgres` - Status: `Up (healthy)`
- ✅ `keycloak` - Status: `Up (healthy)`
- ✅ `pgadmin` - Status: `Up`

**Verify Databases Exist:**
```bash
# List all databases

docker exec -it cheffinder-postgres-dev psql -U chef_finder_user -d postgres -c "SELECT datname FROM pg_database WHERE datname NOT IN ('template0', 'template1') ORDER BY datname;"

docker exec -it joorapp-postgres-dev psql -U v2_devDB -d postgres -c "\l"
```

You should see:
- ✅ `joorapp_devDB` (with all your tables)
- ✅ `joorapp_testDB` (empty, ready for tests)
- ✅ `joorapp_KeycloakDB` (for Keycloak)

**Verify Database Tables:**
```bash
# Check tables in dev database
docker exec -it joorapp-postgres-dev psql -U v2_devDB -d joorapp_devDB -c "\dt"
```

You should see your application tables (users, companies, company_roles, etc.).

**Verify Keycloak is Running:**
```bash
# Check Keycloak health
curl http://localhost:8080/health/ready

# Or open in browser
open http://localhost:8080
```

**Verify Keycloak Realm:**
1. Open browser: http://localhost:8080
2. Click "Administration Console"
3. Login with:
   - Username: `admin`
   - Password: `admin`
4. Select realm `JOOR_APP_V2` from dropdown
5. Verify you can see:
   - Clients (including `Joor_App_Client`)
   - Users (if any were exported)
   - Roles and groups

**Access pgAdmin (Database Management UI):**
- URL: http://localhost:5050
- Email: `admin@admin.com`
- Password: `admin`

### Step 6: Install Backend Dependencies

```bash
# Make sure you're in the nodeBE directory
cd nodeBE

# Install npm packages
npm install
```

### Step 7: Run Test Database Migrations

The test database is created empty. Run migrations to set up the schema:

```bash
# Make sure you're in the nodeBE directory
cd nodeBE

# Run migrations on test database
npm run migrate:test
```

### Step 8: Verify Backend Can Connect

```bash
# Test database connection
npm run test-db

# If successful, you should see connection success messages
```

### Step 9: Set Up Frontend

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install npm packages
npm install
```

### Step 10: Start the Application

**Terminal 1 - Backend:**
```bash
# Navigate to backend
cd nodeBE

# Start the backend server in development mode
npm run dev
```

The backend should start on `http://localhost:3030`

**Terminal 2 - Frontend:**
```bash
# Navigate to frontend
cd frontend

# Start the frontend development server
npm run dev
```

The frontend should start on `http://localhost:5173` (or another port if 5173 is busy)

**Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3030
- API Docs (Swagger): http://localhost:3030/api/v2/docs
- Keycloak: http://localhost:8080
- pgAdmin: http://localhost:5050

---

## Common Docker Commands

### Start Services
```bash
cd nodeBE
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Services
```bash
cd nodeBE
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f postgres
docker-compose -f docker-compose.dev.yml logs -f keycloak
```

### Restart a Service
```bash
docker-compose -f docker-compose.dev.yml restart postgres
docker-compose -f docker-compose.dev.yml restart keycloak
```

### Check Container Status
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Access PostgreSQL CLI
```bash
docker exec -it joorapp-postgres-dev psql -U v2_devDB -d joorapp_devDB
```

### Access Keycloak Container
```bash
docker exec -it joorapp-keycloak-dev /bin/bash
```

### Remove Everything and Start Fresh
```bash
# Stop and remove containers, networks, and volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove the volume manually if needed
docker volume rm joorapp-postgres-data

# Start fresh
docker-compose -f docker-compose.dev.yml up -d
```

---

## Troubleshooting

### Docker Desktop Not Running

**Symptoms:** `Cannot connect to the Docker daemon`

**Solution:**
1. Open Docker Desktop from Applications
2. Wait for it to fully start (whale icon should be steady)
3. Verify: `docker ps`

### Port Already in Use

**Symptoms:** `Error: bind: address already in use`

**Check what's using the ports:**
```bash
# Check port 5432 (PostgreSQL)
lsof -i :5432

# Check port 8080 (Keycloak)
lsof -i :8080

# Check port 3030 (Backend)
lsof -i :3030

# Check port 5173 (Frontend)
lsof -i :5173
```

**Solution:**
- Stop the conflicting service, or
- Change ports in `docker-compose.dev.yml` and `.env` files

### Database Already Exists Errors

**Symptoms:** `ERROR: database "joorapp_devDB" already exists`

**Solution:**
```bash
cd nodeBE
docker-compose -f docker-compose.dev.yml down -v
docker volume rm joorapp-postgres-data
docker-compose -f docker-compose.dev.yml up -d
```

### Keycloak Not Importing Realm

**Symptoms:** Keycloak starts but realm is missing

**Check:**
```bash
# Verify realm-export.json exists
ls -la nodeBE/keycloak_data/realm-export.json

# Check Keycloak logs
docker logs joorapp-keycloak-dev
```

**Solution:**
- Ensure `realm-export.json` exists in `nodeBE/keycloak_data/`
- Check file permissions: `chmod 644 nodeBE/keycloak_data/realm-export.json`
- Restart Keycloak: `docker-compose -f docker-compose.dev.yml restart keycloak`

### Missing Tables in Database

**Symptoms:** Application can't find tables

**Check:**
```bash
# Verify tables exist
docker exec -it joorapp-postgres-dev psql -U v2_devDB -d joorapp_devDB -c "\dt"

# Check PostgreSQL logs
docker logs joorapp-postgres-dev
```

**Solution:**
- Verify `init-dev-db.sql` has content: `cat nodeBE/postgres_init/init-dev-db.sql | head -20`
- Remove volumes and restart: `docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d`

### Application Can't Connect to Keycloak

**Symptoms:** Backend errors about Keycloak connection

**Verify:**
```bash
# Check Keycloak is running
curl http://localhost:8080/health/ready

# Check .env file has correct values
cat nodeBE/.env | grep KEYCLOAK
```

**Solution:**
- Verify `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET` in `.env`
- Check Keycloak Admin Console → Clients → Joor_App_Client → Credentials tab
- Compare client secret with `.env` file

### Node.js Version Issues

**Symptoms:** `Error: Node.js version not supported`

**Solution:**
```bash
# Check Node.js version
node --version  # Should be v18 or higher

# If using nvm, switch to correct version
nvm use 18

# Or install correct version
nvm install 18
nvm use 18
```

### npm Install Fails

**Symptoms:** Errors during `npm install`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Docker Permission Errors

**Symptoms:** `permission denied while trying to connect to the Docker daemon socket`

**Solution:**
```bash
# Add your user to docker group (if needed)
sudo dscl . -append /Groups/docker GroupMembership $(whoami)

# Restart Docker Desktop
# Or restart your terminal session
```

---

## Daily Workflow

### Starting Your Development Session

```bash
# 1. Start Docker services
cd nodeBE
docker-compose -f docker-compose.dev.yml up -d

# 2. Wait for services to be healthy (check logs)
docker-compose -f docker-compose.dev.yml logs -f
# Press Ctrl+C when services are ready

# 3. Start backend (in a new terminal)
cd nodeBE
npm run dev

# 4. Start frontend (in another new terminal)
cd frontend
npm run dev
```

### Ending Your Development Session

```bash
# Stop backend and frontend (Ctrl+C in their terminals)

# Stop Docker services (optional - they can run in background)
cd nodeBE
docker-compose -f docker-compose.dev.yml stop
```

### Running Tests

```bash
cd nodeBE

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Database Migrations

```bash
cd nodeBE

# Run migrations on dev database
npm run migrate:dev

# Run migrations on test database
npm run migrate:test

# Rollback dev database
npm run migrate:dev:down
```

---

## Useful URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3030
- **API Documentation (Swagger)**: http://localhost:3030/api/v2/docs
- **Keycloak Admin Console**: http://localhost:8080
- **pgAdmin**: http://localhost:5050

---

## Next Steps

1. ✅ Verify all services are running
2. ✅ Test the application by logging in
3. ✅ Explore the API documentation at http://localhost:3030/api/v2/docs
4. ✅ Check Keycloak configuration in the admin console
5. ✅ Review the codebase structure

---

**Need Help?** Check the main `SETUP_INSTRUCTIONS.md` file in the `nodeBE` directory for more detailed information.

