# JoorApp Backend API V2

A Node.js backend API built with Express.js for the JoorApp project.

## Features

- ✅ Express.js framework
- ✅ CORS enabled for cross-origin requests
- ✅ Environment variable configuration with dotenv
- ✅ Request logging with Winston (NO console.log)
- ✅ Centralized error handling
- ✅ Health check endpoints
- ✅ **Swagger/OpenAPI 3.0 API documentation**
- ✅ Development auto-restart with Nodemon
- ✅ Clean module-based architecture
- ✅ PostgreSQL database with Sequelize ORM
- ✅ Keycloak authentication integration
- ✅ Comprehensive test coverage

## Project Structure

```
nodeBE/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Application entry point
│   ├── config/                   # Configuration files
│   │   ├── database.js          # Database connection
│   │   └── swagger.js           # Swagger/OpenAPI configuration
│   ├── modules/                  # Feature modules
│   │   ├── health/              # Health check endpoints
│   │   ├── auth/                # Authentication endpoints
│   │   ├── users/               # User management
│   │   ├── admin/               # Admin functions
│   │   ├── superAdmin/          # Super admin functions
│   │   └── docs/                # Swagger documentation
│   ├── middleware/              # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── models/                  # Database models
│   ├── repositories/            # Data access layer
│   ├── services/                # Business logic layer
│   └── utils/                   # Utility functions
├── __tests__/                   # Test helpers and setup
├── scripts/                     # Utility scripts
├── package.json
├── .env
└── env.example
```

## Installation

1. Navigate to the nodeBE directory:
   ```bash
   cd nodeBE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your configuration (see Environment Variables section).

5. (Optional) Set up test users in Keycloak:
   ```bash
   npm run setup:test-users
   ```

## Usage

### Development Mode
```bash
npm run dev
```
This will start the server with Nodemon for auto-restart on file changes.

### Production Mode
```bash
npm start
```

### Testing
```bash
# Run all tests with coverage
npm test

# Run tests without coverage
npm run test:quick

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

## API Documentation

### Swagger UI

The API documentation is available via **Swagger UI** at:

- **Swagger UI**: `http://localhost:3030/api/v2/docs`
- **OpenAPI JSON**: `http://localhost:3030/api/v2/docs/json`
- **OpenAPI YAML**: `http://localhost:3030/api/v2/docs/yaml`

**Features:**
- Interactive API documentation
- Try it out functionality
- Request/response examples
- Authentication support (Bearer token)
- All response codes documented (200, 400, 401, 403, 404, 500, etc.)

**Note**: Swagger can be enabled/disabled via `SWAGGER_ENABLED` environment variable (default: `true`).

### API Endpoints

All API endpoints are under `/api/v2/`:

- **Health**: `/api/v2/health/*` - System health monitoring
- **Auth**: `/api/v2/auth/*` - Authentication and company context
- **Users**: `/api/v2/users/*` - User management
- **Admin**: `/api/v2/admin/*` - Administrative functions
- **SuperAdmin**: `/api/v2/superAdmin/*` - Super administrator functions

### Example Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "meta": {
    "requestId": "req-1234567890",
    "endpoint": "/api/v2/users/123",
    "method": "GET",
    "duration": 145
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Resource not found",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "meta": {
    "requestId": "req-1234567890",
    "endpoint": "/api/v2/users/123",
    "method": "GET"
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "meta": {
    "requestId": "req-1234567890",
    "endpoint": "/api/v2/users/list",
    "method": "GET",
    "duration": 234
  }
}
```

**Note**: Health endpoints do NOT include the `meta` field (special case).

## Environment Variables

### Server Configuration (REQUIRED)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3030 |
| `HOST` | Server host | localhost |
| `NODE_ENV` | Environment (development/production) | development |

### CORS Configuration (REQUIRED)
| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | CORS allowed origins | * |

### Logging Configuration (REQUIRED)
| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_FILE_PATH` | Log files directory | ./logs |
| `LOG_MAX_SIZE` | Max log file size | 10m |
| `LOG_MAX_FILES` | Max log files to keep | 5d |
| `LOG_DATE_PATTERN` | Log file date pattern | DD-MM-YYYY |

**Note**: Log levels are hardcoded per transport (see env.example for details).

### Database Configuration (REQUIRED)
| Variable | Description |
|----------|-------------|
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |

### Keycloak Configuration (REQUIRED)
| Variable | Description |
|----------|-------------|
| `KEYCLOAK_URL` | Keycloak server URL |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret |
| `KEYCLOAK_ADMIN` | Keycloak admin username |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin password |

### Swagger Configuration (OPTIONAL)
| Variable | Description | Default |
|----------|-------------|---------|
| `SWAGGER_ENABLED` | Enable/disable Swagger UI | true |

**Note**: Server URL for Swagger is dynamically constructed from `HOST` and `PORT` environment variables.

## Development

The project follows clean coding standards with:

- **ES6 modules** - No `require()` or `module.exports`
- **Winston logging** - NO `console.log` allowed
- **Module-based architecture** - All features in `src/modules/`
- **Standardized API responses** - Using response helpers
- **Comprehensive error handling** - Custom error classes
- **JSDoc comments** - All functions documented
- **Environment-based configuration** - NO hardcoded fallbacks
- **Test coverage** - Unit and integration tests

### Code Standards

- Use ES6 modules: `import/export`
- Use Winston logger: `import { logInfo } from '../utils/logger.js'`
- Module structure: routes, controller, index.js
- All routes under `/api/v2/{module}`
- Request ID always included in logs: `requestId: req.id`

### Creating New Modules

1. Create directory: `src/modules/{moduleName}/`
2. Create `{module}Routes.js` - Route definitions with Swagger annotations
3. Create `{module}Controller.js` - Request handlers
4. Create `index.js` - Module exports
5. Register in `app.js`: `app.use('/api/v2/{module}', {module}Routes)`
6. Add Swagger annotations to routes using JSDoc `@swagger` tags

See `.cursor/rules/module-structure.mdc` for complete guidelines.

## Testing

### Test Structure

- **Unit Tests**: `src/**/__tests__/*.test.js`
- **Integration Tests**: `src/modules/__tests__/*.integration.test.js`
- **Test Helpers**: `__tests__/helpers/`

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests without coverage (faster)
npm run test:quick

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

### Test Requirements

- All models must have tests
- All repositories must have tests
- All services must have tests
- All controllers must have tests
- All middleware must have tests
- All modules must have integration tests

See `.cursor/rules/testing.mdc` for complete testing guidelines.

## API Versioning

All API endpoints are under `/api/v2/`. API versioning is hardcoded in the codebase (not via environment variables).

## License

ISC
