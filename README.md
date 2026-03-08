# JoorApp V2

A full-stack application with role-based access control, multi-company support, and comprehensive API documentation.

## Overview

JoorApp V2 is a multi-tenant application that supports:
- **Super Admin** role for system-wide management
- **Company** role for individual company operations
- Multi-company context switching for users
- RESTful API with Swagger documentation
- Modern React frontend with TypeScript

## Tech Stack

### Backend (`nodeBE/`)
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Keycloak integration
- **Logging**: Winston (structured logging)
- **API Docs**: Swagger/OpenAPI 3.0
- **Testing**: Jest with Supertest

### Frontend (`frontend/`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: React Context API
- **Styling**: SCSS with Bootstrap
- **HTTP Client**: Axios
- **i18n**: i18next (English, German, Arabic)
- **Forms**: Formik with Yup validation

## Architecture

### Backend Architecture
```
nodeBE/
├── src/
│   ├── modules/          # Feature modules (auth, users, admin, etc.)
│   ├── models/           # Sequelize database models
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   ├── middleware/       # Express middleware
│   └── utils/            # Utility functions
```

**Module Structure**: Each module follows a consistent pattern:
- `{module}Routes.js` - Route definitions with Swagger annotations
- `{module}Controller.js` - Request handlers
- `index.js` - Module exports

**API Versioning**: All endpoints under `/api/v2/`

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Shared components (Header, Sidebar, etc.)
│   │   └── modules/      # Feature modules (company, superadmin)
│   ├── context/          # React Context providers
│   ├── core/             # Core utilities (API, HTTP handler, toast)
│   ├── routes/           # Route definitions
│   └── i18n/             # Internationalization files
```

**Module Structure**: Role-based modules with their own routes, layouts, and components.

## Key Features

### Authentication & Authorization
- Keycloak-based authentication
- JWT token management
- Role-based access control (Super Admin, Company)
- Multi-company context switching
- Protected routes on frontend

### API Features
- RESTful API design
- Standardized response format
- Request ID tracking
- Comprehensive error handling
- Swagger/OpenAPI documentation
- Health check endpoints

### Frontend Features
- Role-based routing
- Multi-language support (i18n)
- Toast notifications
- Responsive design
- Protected route guards

## Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Keycloak server
- npm or yarn

### Backend Setup

1. Navigate to backend:
```bash
cd nodeBE
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `env.example`):
```bash
cp env.example .env
```

4. Configure environment variables (see `nodeBE/env.example`)

5. Run database migrations:
```bash
npm run migrate:dev
```

6. Start development server:
```bash
npm run dev
```

Backend runs on `http://localhost:3030` (configurable via `.env`)

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3030
VITE_TOAST_AUTO_CLOSE=5000
VITE_TOAST_POSITION=top-right
```

4. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default)

## Project Structure

### Backend Modules
- **health** - System health monitoring
- **auth** - Authentication and company context
- **users** - User management
- **admin** - Administrative functions
- **superAdmin** - Super administrator functions
- **docs** - Swagger documentation

### Frontend Modules
- **company** - Company user interface (dashboard, sidebar, header, footer)
- **superadmin** - Super admin interface (dashboard, client management)

## API Documentation

Once the backend is running, access Swagger UI at:
- **Swagger UI**: `http://localhost:3030/api/v2/docs`
- **OpenAPI JSON**: `http://localhost:3030/api/v2/docs/json`
- **OpenAPI YAML**: `http://localhost:3030/api/v2/docs/yaml`

## Testing

### Backend Tests
```bash
# Run all tests with coverage
npm test

# Run tests without coverage
npm run test:quick

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Database Migrations
```bash
# Run migrations
npm run migrate:dev

# Rollback migrations
npm run migrate:dev:down
```

## Development Guidelines

### Backend
- Use ES6 modules (`import/export`) - NO `require()`
- Use Winston logger - NO `console.log`
- Follow module-based architecture
- All routes under `/api/v2/{module}`
- Include request ID in logs
- Write tests for all modules

### Frontend
- Use functional components with hooks
- TypeScript for type safety
- SCSS for styling (BEM methodology)
- Context API for state management
- Formik + Yup for form validation

## Environment Variables

### Backend (Required)
- `PORT`, `HOST`, `NODE_ENV`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`
- `CORS_ORIGIN`
- `LOG_FILE_PATH`

### Frontend (Required)
- `VITE_API_BASE_URL` - Backend API URL

See `nodeBE/env.example` for complete backend configuration.

## Key Concepts

### Multi-Company Context
Users can belong to multiple companies. The application supports:
- Company selection after login
- Context switching between companies
- Company-specific data isolation

### Role-Based Access
- **Super Admin**: System-wide management, company creation, user management
- **Company**: Company-specific operations, dashboard, reports

### API Response Format
All API responses follow a standardized format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "meta": {
    "requestId": "req-1234567890",
    "endpoint": "/api/v2/users",
    "method": "GET",
    "duration": 145
  }
}
```

## License

ISC

