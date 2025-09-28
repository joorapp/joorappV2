# JoorApp Backend API

A Node.js backend API built with Express.js for the JoorApp project.

## Features

- ✅ Express.js framework
- ✅ CORS enabled for cross-origin requests
- ✅ Environment variable configuration with dotenv
- ✅ Request logging with Morgan
- ✅ Centralized error handling
- ✅ Health check endpoints
- ✅ Development auto-restart with Nodemon
- ✅ Clean project structure

## Project Structure

```
NodeBE/
├── src/
│   ├── app.js              # Express app configuration
│   ├── routes/             # API route definitions
│   │   └── healthRoutes.js
│   ├── controllers/        # Request handlers
│   │   └── healthController.js
│   ├── services/           # Business logic (for future use)
│   ├── models/             # Database models (for future use)
│   └── middleware/         # Custom middleware
│       └── errorHandler.js
├── server.js               # Application entry point
├── package.json
├── .gitignore
└── env.example
```

## Installation

1. Navigate to the NodeBE directory:
   ```bash
   cd NodeBE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your configuration.

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

## API Endpoints

### Health Check
- **GET** `/api/v1/health` - Basic health check
- **GET** `/api/v1/status` - Detailed system status
- **GET** `/` - Root endpoint with API information

### Example Response
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0",
  "memory": {
    "used": "25 MB",
    "total": "50 MB"
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | CORS allowed origins | * |

## Development

The project follows clean coding standards with:
- Proper error handling
- Comprehensive logging
- Modular structure
- JSDoc comments
- Environment-based configuration

## License

ISC
