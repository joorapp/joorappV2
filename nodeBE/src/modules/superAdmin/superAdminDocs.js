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
    },
    // COMPANY MANAGEMENT ENDPOINTS
    {
      method: 'POST',
      path: '/api/v2/superAdmin/companies',
      description: 'Create new company. Allows super admins to create a new company in the system.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint'
        }
      },
      requestBody: {
        name: {
          type: 'string',
          required: true,
          description: 'Company name (1-100 characters)',
          example: 'Acme Corporation'
        },
        code: {
          type: 'string',
          required: false,
          description: 'Company code (unique identifier, max 50 characters)',
          example: 'ACME001'
        },
        description: {
          type: 'string',
          required: false,
          description: 'Company description',
          example: 'Leading provider of innovative solutions'
        },
        isActive: {
          type: 'boolean',
          required: false,
          description: 'Company active status',
          example: true
        }
      },
      responses: {
        201: {
          description: 'Company created successfully',
          example: {
            success: true,
            message: 'Company created successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Acme Corporation',
              code: 'ACME001',
              description: 'Leading provider of innovative solutions',
              isActive: true,
              createdDate: '2024-11-23T12:00:00.000Z',
              createdUserId: '550e8400-e29b-41d4-a716-446655440000'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'POST',
              duration: 245
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { field: 'name', message: 'name is required' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'POST'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'POST'
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
              endpoint: '/api/v2/superAdmin/companies',
              method: 'POST'
            }
          }
        },
        409: {
          description: 'Conflict - Company name or code already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'Company with this name already exists',
            details: { field: 'name', value: 'Acme Corporation' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'POST'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while creating company',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'POST'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/superAdmin/companies',
      description: 'Get all companies with pagination and filtering. Returns a paginated list of companies.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint'
        }
      },
      queryParameters: {
        page: {
          type: 'number',
          required: false,
          description: 'Page number (default: 1)',
          example: 1
        },
        limit: {
          type: 'number',
          required: false,
          description: 'Items per page (default: 10, max: 100)',
          example: 10
        },
        search: {
          type: 'string',
          required: false,
          description: 'Search term for company name',
          example: 'Acme'
        },
        isActive: {
          type: 'boolean',
          required: false,
          description: 'Filter by active status',
          example: true
        },
        sortBy: {
          type: 'string',
          required: false,
          description: 'Field to sort by (name, createdDate, isActive)',
          example: 'name'
        },
        sortOrder: {
          type: 'string',
          required: false,
          description: 'Sort order (ASC or DESC)',
          example: 'ASC'
        }
      },
      responses: {
        200: {
          description: 'Companies retrieved successfully',
          example: {
            success: true,
            message: 'Companies retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Acme Corporation',
                code: 'ACME001',
                description: 'Leading provider',
                isActive: true,
                createdDate: '2024-11-23T12:00:00.000Z'
              }
            ],
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'GET',
              duration: 145,
              pagination: { page: 1, limit: 10, total: 25, totalPages: 3, hasNext: true, hasPrevious: false }
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving companies',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/superAdmin/companies/:id',
      description: 'Get company by ID. Returns detailed information about a specific company.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint'
        }
      },
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'Company UUID',
          example: '550e8400-e29b-41d4-a716-446655440001'
        }
      },
      responses: {
        200: {
          description: 'Company retrieved successfully',
          example: {
            success: true,
            message: 'Company retrieved successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Acme Corporation',
              code: 'ACME001',
              description: 'Leading provider',
              isActive: true,
              createdDate: '2024-11-23T12:00:00.000Z',
              createdUserId: '550e8400-e29b-41d4-a716-446655440000'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies/550e8400-e29b-41d4-a716-446655440001',
              method: 'GET',
              duration: 95
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid UUID format',
            details: { field: 'id' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'GET'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'GET'
            }
          }
        },
        404: {
          description: 'Company not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'Company not found',
            details: { entity: 'Company', id: '550e8400-e29b-41d4-a716-446655440001' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving company',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v2/superAdmin/companies/:id',
      description: 'Update company by ID. Updates company information.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint'
        }
      },
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'Company UUID',
          example: '550e8400-e29b-41d4-a716-446655440001'
        }
      },
      requestBody: {
        name: {
          type: 'string',
          required: false,
          description: 'Company name',
          example: 'Updated Acme Corp'
        },
        code: {
          type: 'string',
          required: false,
          description: 'Company code (unique identifier, max 50 characters)',
          example: 'ACME002'
        },
        description: {
          type: 'string',
          required: false,
          description: 'Company description',
          example: 'Updated description'
        },
        isActive: {
          type: 'boolean',
          required: false,
          description: 'Active status',
          example: true
        }
      },
      responses: {
        200: {
          description: 'Company updated successfully',
          example: {
            success: true,
            message: 'Company updated successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Updated Acme Corp',
              code: 'ACME002',
              description: 'Updated description',
              isActive: true,
              createdDate: '2024-11-23T12:00:00.000Z',
              createdUserId: '550e8400-e29b-41d4-a716-446655440000',
              updatedDate: '2024-11-23T12:05:00.000Z',
              updatedUserId: '550e8400-e29b-41d4-a716-446655440000'
            },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567891',
              endpoint: '/api/v2/superAdmin/companies/550e8400-e29b-41d4-a716-446655440001',
              method: 'PUT',
              duration: 180
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { field: 'name', message: 'name must be between 1 and 100 characters' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567891',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'PUT'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567891',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'PUT'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567891',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'PUT'
            }
          }
        },
        404: {
          description: 'Company not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'Company not found',
            details: { entity: 'Company', id: '550e8400-e29b-41d4-a716-446655440001' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567891',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'PUT'
            }
          }
        },
        409: {
          description: 'Conflict - Company name or code already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'Company with this name already exists',
            details: { field: 'name', value: 'Updated Acme Corp' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567891',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'PUT'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while updating company',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567891',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'PUT'
            }
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/v2/superAdmin/companies/:id',
      description: 'Delete (soft delete) company by ID. Marks company as deleted.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint'
        }
      },
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'Company UUID',
          example: '550e8400-e29b-41d4-a716-446655440001'
        }
      },
      responses: {
        200: {
          description: 'Company deleted successfully',
          example: {
            success: true,
            message: 'Company deleted successfully',
            data: null,
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567892',
              endpoint: '/api/v2/superAdmin/companies/550e8400-e29b-41d4-a716-446655440001',
              method: 'DELETE',
              duration: 135
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid UUID format',
            details: { field: 'id' },
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567892',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'DELETE'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567892',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'DELETE'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567892',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'DELETE'
            }
          }
        },
        404: {
          description: 'Company not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'Company not found',
            details: { entity: 'Company', id: '550e8400-e29b-41d4-a716-446655440001' },
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567892',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'DELETE'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while deleting company',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567892',
              endpoint: '/api/v2/superAdmin/companies/:id',
              method: 'DELETE'
            }
          }
        }
      }
    },
    // ROLE MANAGEMENT ENDPOINTS
    {
      method: 'POST',
      path: '/api/v2/superAdmin/roles',
      description: 'Create new role. Allows super admins to create a new company role.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      requestBody: {
        name: { type: 'string', required: true, description: 'Role name (1-100 characters)', example: 'Project Manager' },
        code: { type: 'string', required: true, description: 'Role code (1-50 characters)', example: 'PROJECT_MANAGER' },
        description: { type: 'string', required: false, description: 'Role description', example: 'Manages projects' },
        isActive: { type: 'boolean', required: false, description: 'Role active status', example: true }
      },
      responses: {
        201: {
          description: 'Role created successfully',
          example: {
            success: true,
            message: 'Role created successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440002',
              name: 'Project Manager',
              code: 'PROJECT_MANAGER',
              description: 'Manages projects',
              isActive: true,
              createdDate: '2024-11-23T12:00:00.000Z',
              createdBy: '550e8400-e29b-41d4-a716-446655440000'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567893',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'POST',
              duration: 200
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { field: 'name', message: 'name is required' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567893',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'POST'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567893',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'POST'
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
              requestId: 'req-1234567893',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'POST'
            }
          }
        },
        409: {
          description: 'Conflict - Role name or code already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'Role with this code already exists',
            details: { field: 'code', value: 'PROJECT_MANAGER' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567893',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'POST'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while creating role',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567893',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'POST'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/superAdmin/roles',
      description: 'Get all roles with pagination. Returns a paginated list of company roles.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      queryParameters: {
        page: { type: 'number', required: false, description: 'Page number (default: 1)', example: 1 },
        limit: { type: 'number', required: false, description: 'Items per page (default: 10, max: 100)', example: 10 },
        isActive: { type: 'boolean', required: false, description: 'Filter by active status', example: true },
        sortBy: { type: 'string', required: false, description: 'Field to sort by (name, code, createdDate, isActive)', example: 'name' },
        sortOrder: { type: 'string', required: false, description: 'Sort order (ASC or DESC)', example: 'ASC' }
      },
      responses: {
        200: {
          description: 'Roles retrieved successfully',
          example: {
            success: true,
            message: 'Roles retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                name: 'Project Manager',
                code: 'PROJECT_MANAGER',
                description: 'Manages projects',
                isActive: true,
                createdDate: '2024-11-23T12:00:00.000Z'
              }
            ],
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567894',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'GET',
              duration: 150,
              pagination: { page: 1, limit: 10, total: 5, totalPages: 1, hasNext: false, hasPrevious: false }
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567894',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567894',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving roles',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567894',
              endpoint: '/api/v2/superAdmin/roles',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/superAdmin/roles/:id',
      description: 'Get role by ID. Returns detailed information about a specific role.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      pathParameters: {
        id: { type: 'string', required: true, description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440002' }
      },
      responses: {
        200: {
          description: 'Role retrieved successfully',
          example: {
            success: true,
            message: 'Role retrieved successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440002',
              name: 'Project Manager',
              code: 'PROJECT_MANAGER',
              description: 'Manages projects',
              isActive: true,
              createdDate: '2024-11-23T12:00:00.000Z'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567895',
              endpoint: '/api/v2/superAdmin/roles/550e8400-e29b-41d4-a716-446655440002',
              method: 'GET',
              duration: 95
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid UUID format',
            details: { field: 'id' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567895',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'GET'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567895',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567895',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'GET'
            }
          }
        },
        404: {
          description: 'Role not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'Role not found',
            details: { entity: 'CompanyRole', id: '550e8400-e29b-41d4-a716-446655440002' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567895',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving role',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567895',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v2/superAdmin/roles/:id',
      description: 'Update role by ID. Updates role information.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      pathParameters: {
        id: { type: 'string', required: true, description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440002' }
      },
      requestBody: {
        name: { type: 'string', required: false, description: 'Role name', example: 'Updated Project Manager' },
        code: { type: 'string', required: false, description: 'Role code', example: 'UPDATED_PM' },
        description: { type: 'string', required: false, description: 'Role description', example: 'Updated description' },
        isActive: { type: 'boolean', required: false, description: 'Active status', example: true }
      },
      responses: {
        200: {
          description: 'Role updated successfully',
          example: {
            success: true,
            message: 'Role updated successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440002',
              name: 'Updated Project Manager',
              code: 'UPDATED_PM',
              description: 'Updated description',
              isActive: true,
              lastModifiedDate: '2024-11-23T12:05:00.000Z',
              lastModifiedBy: '550e8400-e29b-41d4-a716-446655440000'
            },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567896',
              endpoint: '/api/v2/superAdmin/roles/550e8400-e29b-41d4-a716-446655440002',
              method: 'PUT',
              duration: 180
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { field: 'name' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567896',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'PUT'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567896',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'PUT'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567896',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'PUT'
            }
          }
        },
        404: {
          description: 'Role not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'Role not found',
            details: { entity: 'CompanyRole', id: '550e8400-e29b-41d4-a716-446655440002' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567896',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'PUT'
            }
          }
        },
        409: {
          description: 'Conflict - Role name or code already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'Role with this code already exists',
            details: { field: 'code', value: 'UPDATED_PM' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567896',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'PUT'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while updating role',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567896',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'PUT'
            }
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/v2/superAdmin/roles/:id',
      description: 'Delete (soft delete) role by ID. Marks role as deleted.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      pathParameters: {
        id: { type: 'string', required: true, description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440002' }
      },
      responses: {
        200: {
          description: 'Role deleted successfully',
          example: {
            success: true,
            message: 'Role deleted successfully',
            data: null,
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567897',
              endpoint: '/api/v2/superAdmin/roles/550e8400-e29b-41d4-a716-446655440002',
              method: 'DELETE',
              duration: 130
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid UUID format',
            details: { field: 'id' },
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567897',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'DELETE'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567897',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'DELETE'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567897',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'DELETE'
            }
          }
        },
        404: {
          description: 'Role not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'Role not found',
            details: { entity: 'CompanyRole', id: '550e8400-e29b-41d4-a716-446655440002' },
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567897',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'DELETE'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while deleting role',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567897',
              endpoint: '/api/v2/superAdmin/roles/:id',
              method: 'DELETE'
            }
          }
        }
      }
    },
    // USER MANAGEMENT ENDPOINTS
    {
      method: 'POST',
      path: '/api/v2/superAdmin/users',
      description: 'Create user with optional company assignment. Checks if user exists in Keycloak first.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      requestBody: {
        email: { type: 'string', required: true, description: 'User email', example: 'user@example.com' },
        password: { type: 'string', required: 'conditional', description: 'Password (required if new user, min 8 chars)', example: 'SecurePass123!' },
        firstName: { type: 'string', required: false, description: 'First name (1-100 chars)', example: 'John' },
        lastName: { type: 'string', required: false, description: 'Last name (1-100 chars)', example: 'Doe' },
        keycloakGlobalRole: { type: 'string', required: false, description: 'Global role (SUPER_ADMIN, COMPANY_ADMIN, COMPANY_USER)', example: 'COMPANY_USER' },
        companyId: { type: 'string', required: false, description: 'Company UUID (if assigning to company)', example: '550e8400-e29b-41d4-a716-446655440001' },
        roleId: { type: 'string', required: 'conditional', description: 'Role UUID (required if companyId provided)', example: '550e8400-e29b-41d4-a716-446655440002' }
      },
      responses: {
        201: {
          description: 'User created successfully',
          example: {
            success: true,
            message: 'User created successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440003',
              keycloakId: '7d3ea298-66dc-4ece-90de-c4de111e8b7f',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              keycloakGlobalRole: 'COMPANY_USER',
              isActive: true,
              createdDate: '2024-11-23T12:00:00.000Z'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567898',
              endpoint: '/api/v2/superAdmin/users',
              method: 'POST',
              duration: 450
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { field: 'email', message: 'email is required' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567898',
              endpoint: '/api/v2/superAdmin/users',
              method: 'POST'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567898',
              endpoint: '/api/v2/superAdmin/users',
              method: 'POST'
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
              requestId: 'req-1234567898',
              endpoint: '/api/v2/superAdmin/users',
              method: 'POST'
            }
          }
        },
        404: {
          description: 'Company or role not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'Company not found',
            details: { entity: 'Company', id: '550e8400-e29b-41d4-a716-446655440001' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567898',
              endpoint: '/api/v2/superAdmin/users',
              method: 'POST'
            }
          }
        },
        409: {
          description: 'Conflict - Email already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'User with this email already exists',
            details: { field: 'email', value: 'user@example.com' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567898',
              endpoint: '/api/v2/superAdmin/users',
              method: 'POST'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while creating user',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567898',
              endpoint: '/api/v2/superAdmin/users',
              method: 'POST'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/superAdmin/users',
      description: 'Get all users (cross-company) with pagination. Returns a paginated list of all users.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      queryParameters: {
        page: { type: 'number', required: false, description: 'Page number (default: 1)', example: 1 },
        limit: { type: 'number', required: false, description: 'Items per page (default: 10, max: 100)', example: 10 },
        search: { type: 'string', required: false, description: 'Search term for email, firstName, lastName', example: 'john' },
        sortBy: { type: 'string', required: false, description: 'Field to sort by (email, firstName, lastName, keycloakGlobalRole, isActive)', example: 'email' },
        sortOrder: { type: 'string', required: false, description: 'Sort order (ASC or DESC)', example: 'ASC' }
      },
      responses: {
        200: {
          description: 'Users retrieved successfully',
          example: {
            success: true,
            message: 'Users retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440003',
                keycloakId: '7d3ea298-66dc-4ece-90de-c4de111e8b7f',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe',
                keycloakGlobalRole: 'COMPANY_USER',
                isActive: true
              }
            ],
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567899',
              endpoint: '/api/v2/superAdmin/users',
              method: 'GET',
              duration: 180,
              pagination: { page: 1, limit: 10, total: 50, totalPages: 5, hasNext: true, hasPrevious: false }
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567899',
              endpoint: '/api/v2/superAdmin/users',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567899',
              endpoint: '/api/v2/superAdmin/users',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving users',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567899',
              endpoint: '/api/v2/superAdmin/users',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/superAdmin/users/:id',
      description: 'Get user by ID. Returns detailed information about a specific user.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      pathParameters: {
        id: { type: 'string', required: true, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440003' }
      },
      responses: {
        200: {
          description: 'User retrieved successfully',
          example: {
            success: true,
            message: 'User retrieved successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440003',
              keycloakId: '7d3ea298-66dc-4ece-90de-c4de111e8b7f',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              keycloakGlobalRole: 'COMPANY_USER',
              isActive: true
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567900',
              endpoint: '/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003',
              method: 'GET',
              duration: 100
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid UUID format',
            details: { field: 'id' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567900',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'GET'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567900',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567900',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'GET'
            }
          }
        },
        404: {
          description: 'User not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'User not found',
            details: { entity: 'User', id: '550e8400-e29b-41d4-a716-446655440003' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567900',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving user',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567900',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v2/superAdmin/users/:id',
      description: 'Update user by ID. Updates user in both Keycloak and database.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      pathParameters: {
        id: { type: 'string', required: true, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440003' }
      },
      requestBody: {
        email: { type: 'string', required: false, description: 'User email', example: 'newemail@example.com' },
        firstName: { type: 'string', required: false, description: 'First name', example: 'Jane' },
        lastName: { type: 'string', required: false, description: 'Last name', example: 'Smith' },
        keycloakGlobalRole: { type: 'string', required: false, description: 'Global role', example: 'COMPANY_ADMIN' },
        isActive: { type: 'boolean', required: false, description: 'Active status', example: true },
        password: { type: 'string', required: false, description: 'New password (min 8 chars)', example: 'NewSecure123!' }
      },
      responses: {
        200: {
          description: 'User updated successfully',
          example: {
            success: true,
            message: 'User updated successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440003',
              email: 'newemail@example.com',
              firstName: 'Jane',
              lastName: 'Smith',
              keycloakGlobalRole: 'COMPANY_ADMIN',
              isActive: true,
              lastModifiedDate: '2024-11-23T12:05:00.000Z'
            },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567901',
              endpoint: '/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003',
              method: 'PUT',
              duration: 320
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { field: 'email' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567901',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'PUT'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567901',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'PUT'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567901',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'PUT'
            }
          }
        },
        404: {
          description: 'User not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'User not found',
            details: { entity: 'User', id: '550e8400-e29b-41d4-a716-446655440003' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567901',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'PUT'
            }
          }
        },
        409: {
          description: 'Conflict - Email already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'Email already exists',
            details: { field: 'email', value: 'newemail@example.com' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567901',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'PUT'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while updating user',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567901',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'PUT'
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v2/superAdmin/users/:id/disable',
      description: 'Disable user by ID. Disables user in Keycloak and marks as inactive in database. Users are never deleted, only deactivated.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      pathParameters: {
        id: { type: 'string', required: true, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440003' }
      },
      responses: {
        200: {
          description: 'User disabled successfully',
          example: {
            success: true,
            message: 'User disabled successfully',
            data: null,
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567902',
              endpoint: '/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003/disable',
              method: 'PUT',
              duration: 280
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid UUID format',
            details: { field: 'id' },
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567902',
              endpoint: '/api/v2/superAdmin/users/:id/disable',
              method: 'PUT'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567902',
              endpoint: '/api/v2/superAdmin/users/:id/disable',
              method: 'PUT'
            }
          }
        },
        403: {
          description: 'Forbidden',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567902',
              endpoint: '/api/v2/superAdmin/users/:id/disable',
              method: 'PUT'
            }
          }
        },
        404: {
          description: 'User not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'User not found',
            details: { entity: 'User', id: '550e8400-e29b-41d4-a716-446655440003' },
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567902',
              endpoint: '/api/v2/superAdmin/users/:id/disable',
              method: 'PUT'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while deleting user',
            timestamp: '2024-11-23T12:10:00.000Z',
            meta: {
              requestId: 'req-1234567902',
              endpoint: '/api/v2/superAdmin/users/:id',
              method: 'DELETE'
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v2/superAdmin/users/:id/assign',
      description: 'Assign user to company with role. Creates or updates CompanyUser relationship.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      pathParameters: {
        id: { type: 'string', required: true, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440003' }
      },
      requestBody: {
        companyId: { type: 'string', required: true, description: 'Company UUID', example: '550e8400-e29b-41d4-a716-446655440001' },
        roleId: { type: 'string', required: true, description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440002' }
      },
      responses: {
        200: {
          description: 'User assigned to company successfully',
          example: {
            success: true,
            message: 'User assigned to company successfully',
            data: {
              userId: '550e8400-e29b-41d4-a716-446655440003',
              companyId: '550e8400-e29b-41d4-a716-446655440001',
              roleId: '550e8400-e29b-41d4-a716-446655440002',
              isActive: true
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567903',
              endpoint: '/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003/assign',
              method: 'POST',
              duration: 220
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { field: 'companyId', message: 'companyId is required' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567903',
              endpoint: '/api/v2/superAdmin/users/:id/assign',
              method: 'POST'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567903',
              endpoint: '/api/v2/superAdmin/users/:id/assign',
              method: 'POST'
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
              requestId: 'req-1234567903',
              endpoint: '/api/v2/superAdmin/users/:id/assign',
              method: 'POST'
            }
          }
        },
        404: {
          description: 'User, company, or role not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'Company not found',
            details: { entity: 'Company', id: '550e8400-e29b-41d4-a716-446655440001' },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567903',
              endpoint: '/api/v2/superAdmin/users/:id/assign',
              method: 'POST'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while assigning user to company',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567903',
              endpoint: '/api/v2/superAdmin/users/:id/assign',
              method: 'POST'
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v2/superAdmin/users/:id/companies/:companyId/role',
      description: 'Update user\'s role in a company. Updates the CompanyUser relationship.',
      access: 'Protected (requires Bearer token and SUPER_ADMIN role)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      pathParameters: {
        id: { type: 'string', required: true, description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440003' },
        companyId: { type: 'string', required: true, description: 'Company UUID', example: '550e8400-e29b-41d4-a716-446655440001' }
      },
      requestBody: {
        roleId: { type: 'string', required: true, description: 'Role UUID', example: '550e8400-e29b-41d4-a716-446655440002' }
      },
      responses: {
        200: {
          description: 'User role updated successfully',
          example: {
            success: true,
            message: 'User role updated successfully',
            data: {
              userId: '550e8400-e29b-41d4-a716-446655440003',
              companyId: '550e8400-e29b-41d4-a716-446655440001',
              roleId: '550e8400-e29b-41d4-a716-446655440002',
              isActive: true
            },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567904',
              endpoint: '/api/v2/superAdmin/users/550e8400-e29b-41d4-a716-446655440003/companies/550e8400-e29b-41d4-a716-446655440001/role',
              method: 'PUT',
              duration: 190
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { field: 'roleId', message: 'roleId is required' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567904',
              endpoint: '/api/v2/superAdmin/users/:id/companies/:companyId/role',
              method: 'PUT'
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567904',
              endpoint: '/api/v2/superAdmin/users/:id/companies/:companyId/role',
              method: 'PUT'
            }
          }
        },
        403: {
          description: 'Forbidden - Super admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Super admin access required',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567904',
              endpoint: '/api/v2/superAdmin/users/:id/companies/:companyId/role',
              method: 'PUT'
            }
          }
        },
        404: {
          description: 'User, company, role, or assignment not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'CompanyUser assignment not found',
            details: { userId: '550e8400-e29b-41d4-a716-446655440003', companyId: '550e8400-e29b-41d4-a716-446655440001' },
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567904',
              endpoint: '/api/v2/superAdmin/users/:id/companies/:companyId/role',
              method: 'PUT'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while updating user role',
            timestamp: '2024-11-23T12:05:00.000Z',
            meta: {
              requestId: 'req-1234567904',
              endpoint: '/api/v2/superAdmin/users/:id/companies/:companyId/role',
              method: 'PUT'
            }
          }
        }
      }
    }
  ]
};
