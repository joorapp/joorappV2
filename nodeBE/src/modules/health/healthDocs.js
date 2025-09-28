/**
 * @author Bhavesh Venugopal
 * Health Module Documentation
 * Centralized documentation for all health-related endpoints
 */

export const healthDocs = {
  module: "Health",
  description: "System health monitoring, diagnostics, and status endpoints",
  version: "2.0.0",
  basePath: "/api/v2/health",
  lastUpdated: "2024-01-01T00:00:00.000Z",
  totalEndpoints: 3,
  endpoints: [
    {
      path: "/api/v2/health/status",
      method: "GET",
      summary: "Get comprehensive system health status",
      description: "Returns detailed system health information including uptime, memory usage, environment details, and system metrics.",
      tags: ["Health", "System", "Monitoring"],
      parameters: [],
      requestExample: {},
      responseExample: {
        success: true,
        message: "API is running",
        timestamp: "2024-01-01T00:00:00.000Z",
        uptime: 123.456,
        environment: "development",
        version: "2.0.0",
        memory: {
          used: "25 MB",
          total: "50 MB"
        }
      },
      errorResponses: [
        {
          code: 500,
          message: "Health check failed",
          description: "Internal server error during health check"
        }
      ],
      statusCodes: {
        200: "Success - System is healthy",
        500: "Internal Server Error - Health check failed"
      }
    },
    {
      path: "/api/v2/health/ping",
      method: "GET", 
      summary: "Simple ping test",
      description: "Returns a simple ping response to verify API connectivity and basic functionality.",
      tags: ["Health", "Connectivity", "Test"],
      parameters: [],
      requestExample: {},
      responseExample: {
        success: true,
        message: "Pong!",
        timestamp: "2024-01-01T00:00:00.000Z",
        responseTime: "2ms"
      },
      errorResponses: [],
      statusCodes: {
        200: "Success - API is responding"
      }
    },
    {
      path: "/api/v2/health/metrics",
      method: "GET",
      summary: "Get detailed system metrics",
      description: "Returns comprehensive system metrics including CPU usage, memory details, process information, and performance data.",
      tags: ["Health", "Metrics", "Performance"],
      parameters: [],
      requestExample: {},
      responseExample: {
        success: true,
        message: "System metrics retrieved successfully",
        timestamp: "2024-01-01T00:00:00.000Z",
        metrics: {
          system: {
            platform: "win32",
            arch: "x64",
            nodeVersion: "v18.17.0",
            uptime: 123.456
          },
          memory: {
            rss: 45678912,
            heapTotal: 12345678,
            heapUsed: 8765432,
            external: 1234567
          },
          cpu: {
            user: 1234567,
            system: 987654
          }
        }
      },
      errorResponses: [
        {
          code: 500,
          message: "Failed to retrieve system metrics",
          description: "Error occurred while gathering system metrics"
        }
      ],
      statusCodes: {
        200: "Success - Metrics retrieved",
        500: "Internal Server Error - Failed to retrieve metrics"
      }
    }
  ],
  examples: {
    curl: {
      status: "curl -X GET http://localhost:3030/api/v2/health/status",
      ping: "curl -X GET http://localhost:3030/api/v2/health/ping",
      metrics: "curl -X GET http://localhost:3030/api/v2/health/metrics"
    },
    javascript: {
      status: `fetch('http://localhost:3030/api/v2/health/status')
  .then(response => response.json())
  .then(data => logger.info('Health status:', data));`,
      ping: `fetch('http://localhost:3030/api/v2/health/ping')
  .then(response => response.json())
  .then(data => logger.info('Ping response:', data));`
    }
  },
  notes: [
    "All health endpoints are public and do not require authentication",
    "Response times may vary based on system load",
    "Memory usage is reported in MB for readability",
    "Uptime is reported in seconds"
  ]
};