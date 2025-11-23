/**
 * @author Bhavesh Venugopal
 * Super Admin Module API Documentation
 * Documentation for super admin-related endpoints
 */

export const superAdminDocs = {
  module: 'Super Admin',
  description: 'Super admin functionality and management endpoints. All endpoints require authentication and SUPER_ADMIN role.',
  version: '2.0.0',
  endpoints: [
    {
      method: 'GET',
      path: '/api/v2/superAdmin/user-info',
      description: 'Get current authenticated user info. Returns information about the currently authenticated user. This endpoint is used to test the authentication middleware and verify user data from Keycloak token.',
      access: 'Protected (requires Bearer token)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      responses: {
        200: {
          description: 'User info retrieved successfully',
          example: {
            success: true,
            message: 'User info retrieved successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              keycloakId: '7d3ea298-66dc-4ece-90de-c4de111e8b7f',
              email: 'admin@example.com',
              firstName: 'Super',
              lastName: 'Admin',
              keycloakGlobalRole: 'SUPER_ADMIN'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/user-info',
              method: 'GET',
              duration: 145
            }
          }
        },
        401: {
          description: 'Authentication required - No token provided or token is invalid/expired',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/user-info',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving user info',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/user-info',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/superAdmin/dashboard',
      description: 'Get super admin dashboard data. Returns dashboard data for super admin users. This endpoint requires SUPER_ADMIN role and provides system overview information.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      responses: {
        200: {
          description: 'Super admin dashboard retrieved successfully',
          example: {
            success: true,
            message: 'Super admin dashboard retrieved successfully',
            data: {
              totalUsers: 150,
              totalCompanies: 25,
              activeSessions: 45,
              systemStatus: 'operational'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/dashboard',
              method: 'GET',
              duration: 234
            }
          }
        },
        401: {
          description: 'Authentication required - No token provided or token is invalid/expired',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/dashboard',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden - Super admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/dashboard',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving dashboard data',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/dashboard',
              method: 'GET'
            }
          }
        }
      }
    }
  ]
};
