/**
 * @author Bhavesh Venugopal
 * Admin Module Documentation
 * Centralized documentation for all admin-related endpoints
 */

export const adminDocs = {
  module: "Admin",
  description: "Administrative functions, user management, and system configuration",
  version: "2.0.0",
  basePath: "/api/v2/admin",
  lastUpdated: "2024-01-01T00:00:00.000Z",
  totalEndpoints: 4,
  requiresAuth: true,
  endpoints: [
    {
      path: "/api/v2/admin/users",
      method: "GET",
      summary: "Get all users",
      description: "Retrieve a list of all users in the system with pagination and filtering options.",
      tags: ["Admin", "Users", "Management"],
      parameters: [
        {
          name: "page",
          type: "query",
          required: false,
          description: "Page number for pagination",
          example: "1"
        },
        {
          name: "limit",
          type: "query", 
          required: false,
          description: "Number of users per page",
          example: "10"
        },
        {
          name: "search",
          type: "query",
          required: false,
          description: "Search term for filtering users",
          example: "john"
        }
      ],
      requestExample: {
        query: {
          page: 1,
          limit: 10,
          search: "john"
        }
      },
      responseExample: {
        success: true,
        message: "Users retrieved successfully",
        data: {
          users: [
            {
              id: "user123",
              username: "john_doe",
              email: "john@example.com",
              role: "user",
              createdAt: "2024-01-01T00:00:00.000Z",
              lastLogin: "2024-01-01T12:00:00.000Z"
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 100,
            pages: 10
          }
        },
        timestamp: "2024-01-01T00:00:00.000Z"
      },
      errorResponses: [
        {
          code: 401,
          message: "Unauthorized",
          description: "Authentication required"
        },
        {
          code: 403,
          message: "Forbidden", 
          description: "Admin access required"
        },
        {
          code: 500,
          message: "Internal server error",
          description: "Failed to retrieve users"
        }
      ],
      statusCodes: {
        200: "Success - Users retrieved",
        401: "Unauthorized - Authentication required",
        403: "Forbidden - Admin access required",
        500: "Internal Server Error - Failed to retrieve users"
      }
    },
    {
      path: "/api/v2/admin/settings",
      method: "GET",
      summary: "Get system settings",
      description: "Retrieve current system configuration and settings.",
      tags: ["Admin", "Settings", "Configuration"],
      parameters: [],
      requestExample: {},
      responseExample: {
        success: true,
        message: "Settings retrieved successfully",
        data: {
          settings: {
            siteName: "JoorApp",
            maintenanceMode: false,
            maxUsers: 1000,
            features: {
              registration: true,
              emailNotifications: true,
              analytics: true
            }
          }
        },
        timestamp: "2024-01-01T00:00:00.000Z"
      },
      errorResponses: [
        {
          code: 401,
          message: "Unauthorized",
          description: "Authentication required"
        },
        {
          code: 403,
          message: "Forbidden",
          description: "Admin access required"
        }
      ],
      statusCodes: {
        200: "Success - Settings retrieved",
        401: "Unauthorized - Authentication required",
        403: "Forbidden - Admin access required"
      }
    },
    {
      path: "/api/v2/admin/settings",
      method: "PUT",
      summary: "Update system settings",
      description: "Update system configuration and settings.",
      tags: ["Admin", "Settings", "Configuration"],
      parameters: [],
      requestExample: {
        body: {
          siteName: "JoorApp V2",
          maintenanceMode: false,
          maxUsers: 2000,
          features: {
            registration: true,
            emailNotifications: false,
            analytics: true
          }
        }
      },
      responseExample: {
        success: true,
        message: "Settings updated successfully",
        data: {
          settings: {
            siteName: "JoorApp V2",
            maintenanceMode: false,
            maxUsers: 2000,
            features: {
              registration: true,
              emailNotifications: false,
              analytics: true
            }
          }
        },
        timestamp: "2024-01-01T00:00:00.000Z"
      },
      errorResponses: [
        {
          code: 400,
          message: "Bad Request",
          description: "Invalid settings data"
        },
        {
          code: 401,
          message: "Unauthorized",
          description: "Authentication required"
        },
        {
          code: 403,
          message: "Forbidden",
          description: "Admin access required"
        }
      ],
      statusCodes: {
        200: "Success - Settings updated",
        400: "Bad Request - Invalid settings data",
        401: "Unauthorized - Authentication required",
        403: "Forbidden - Admin access required"
      }
    },
    {
      path: "/api/v2/admin/stats",
      method: "GET",
      summary: "Get system statistics",
      description: "Retrieve comprehensive system statistics and analytics.",
      tags: ["Admin", "Statistics", "Analytics"],
      parameters: [],
      requestExample: {},
      responseExample: {
        success: true,
        message: "Statistics retrieved successfully",
        data: {
          stats: {
            users: {
              total: 1250,
              active: 980,
              newThisMonth: 45
            },
            system: {
              uptime: 86400,
              memoryUsage: "75%",
              cpuUsage: "45%"
            },
            api: {
              totalRequests: 50000,
              requestsToday: 1200,
              averageResponseTime: "150ms"
            }
          }
        },
        timestamp: "2024-01-01T00:00:00.000Z"
      },
      errorResponses: [
        {
          code: 401,
          message: "Unauthorized",
          description: "Authentication required"
        },
        {
          code: 403,
          message: "Forbidden",
          description: "Admin access required"
        }
      ],
      statusCodes: {
        200: "Success - Statistics retrieved",
        401: "Unauthorized - Authentication required",
        403: "Forbidden - Admin access required"
      }
    }
  ],
  examples: {
    curl: {
      users: "curl -X GET 'http://localhost:3030/api/v2/admin/users?page=1&limit=10' -H 'Authorization: Bearer YOUR_TOKEN'",
      settings: "curl -X GET http://localhost:3030/api/v2/admin/settings -H 'Authorization: Bearer YOUR_TOKEN'",
      updateSettings: "curl -X PUT http://localhost:3030/api/v2/admin/settings -H 'Authorization: Bearer YOUR_TOKEN' -H 'Content-Type: application/json' -d '{\"siteName\":\"JoorApp V2\"}'",
      stats: "curl -X GET http://localhost:3030/api/v2/admin/stats -H 'Authorization: Bearer YOUR_TOKEN'"
    },
    javascript: {
      users: `fetch('http://localhost:3030/api/v2/admin/users?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(response => response.json())
.then(data => logger.info('Users data:', data));`,
      settings: `fetch('http://localhost:3030/api/v2/admin/settings', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(response => response.json())
.then(data => logger.info('Settings data:', data));`
    }
  },
  notes: [
    "All admin endpoints require authentication",
    "Admin role is required for all operations",
    "Use Bearer token authentication in Authorization header",
    "Pagination is available for list endpoints",
    "Settings updates are logged for audit purposes"
  ]
};