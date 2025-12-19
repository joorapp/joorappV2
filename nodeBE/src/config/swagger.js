/**
 * @author Bhavesh Venugopal
 * Swagger/OpenAPI Configuration
 * Generates OpenAPI 3.0 specification from JSDoc annotations
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('swagger');

// Dynamically construct server URL from environment variables (same pattern as server.js)
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || '3030';
const serverUrl = `${protocol}://${host}:${port}`;

/**
 * Swagger/OpenAPI 3.0 configuration
 * Defines API metadata, server URLs, security schemes, and reusable schemas
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'JoorApp Backend API V2',
    version: '2.0.0',
    description: 'RESTful API for JoorApp V2 - Complete API documentation with interactive testing',
    contact: {
      name: 'JoorApp API Support',
      email: 'support@joorapp.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: serverUrl,
      description: `${process.env.NODE_ENV || 'development'} server`
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/v2/auth/login endpoint'
      }
    },
    schemas: {
      // Meta field schema - included in all standard responses
      MetaField: {
        type: 'object',
        properties: {
          requestId: {
            type: 'string',
            description: 'Unique request identifier for tracing',
            example: 'req-1234567890'
          },
          endpoint: {
            type: 'string',
            description: 'API endpoint that was called',
            example: '/api/v2/auth/login'
          },
          method: {
            type: 'string',
            description: 'HTTP method used',
            example: 'POST'
          },
          duration: {
            type: 'number',
            description: 'Response time in milliseconds',
            example: 245
          }
        },
        required: ['requestId', 'endpoint', 'method']
      },
      // Success response schema - matches successResponse() helper
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            description: 'Success message'
          },
          data: {
            type: 'object',
            description: 'Response data (can be object, array, or null)',
            nullable: true
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 timestamp'
          },
          meta: {
            $ref: '#/components/schemas/MetaField'
          }
        },
        required: ['success', 'message', 'timestamp', 'meta']
      },
      // Error response schema - matches errorResponse() helper
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            description: 'Error code (e.g., VALIDATION_ERROR, NOT_FOUND, FORBIDDEN)',
            example: 'VALIDATION_ERROR'
          },
          message: {
            type: 'string',
            description: 'Human-readable error message'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 timestamp'
          },
          details: {
            type: 'object',
            description: 'Optional error details',
            nullable: true
          },
          meta: {
            $ref: '#/components/schemas/MetaField'
          }
        },
        required: ['success', 'error', 'message', 'timestamp', 'meta']
      },
      // Pagination schema
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Current page number',
            example: 1
          },
          limit: {
            type: 'integer',
            description: 'Number of items per page',
            example: 10
          },
          total: {
            type: 'integer',
            description: 'Total number of items',
            example: 100
          },
          pages: {
            type: 'integer',
            description: 'Total number of pages',
            example: 10
          },
          hasNext: {
            type: 'boolean',
            description: 'Whether there is a next page',
            example: true
          },
          hasPrev: {
            type: 'boolean',
            description: 'Whether there is a previous page',
            example: false
          }
        },
        required: ['page', 'limit', 'total', 'pages', 'hasNext', 'hasPrev']
      },
      // Paginated response schema - matches paginatedResponse() helper
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            description: 'Success message'
          },
          data: {
            type: 'array',
            description: 'Array of items',
            items: {
              type: 'object'
            }
          },
          pagination: {
            $ref: '#/components/schemas/Pagination'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO 8601 timestamp'
          },
          meta: {
            $ref: '#/components/schemas/MetaField'
          }
        },
        required: ['success', 'message', 'data', 'pagination', 'timestamp', 'meta']
      },
      // Validation error details schema
      ValidationError: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            description: 'Field name that failed validation',
            example: 'email'
          },
          message: {
            type: 'string',
            description: 'Validation error message',
            example: 'Email is required'
          }
        }
      },
      // Not found error details schema
      NotFoundError: {
        type: 'object',
        properties: {
          entityType: {
            type: 'string',
            description: 'Type of entity not found',
            example: 'User'
          },
          entityId: {
            type: 'string',
            description: 'ID of entity not found',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          entity: {
            type: 'string',
            description: 'Entity name (alternative to entityType)',
            example: 'User'
          },
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Entity ID (alternative to entityId)',
            example: '550e8400-e29b-41d4-a716-446655440000'
          }
        }
      },
      // Conflict error details schema
      ConflictError: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            description: 'Field that caused conflict',
            example: 'email'
          },
          value: {
            type: 'string',
            description: 'Value that caused conflict',
            example: 'user@example.com'
          }
        }
      },
      // =====================================================
      // Entity Schemas
      // =====================================================
      // User entity schema
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User UUID',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          keycloakId: {
            type: 'string',
            format: 'uuid',
            description: 'Keycloak user ID',
            example: '660e8400-e29b-41d4-a716-446655440001'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com'
          },
          firstName: {
            type: 'string',
            maxLength: 100,
            description: 'User first name',
            example: 'John'
          },
          lastName: {
            type: 'string',
            maxLength: 100,
            description: 'User last name',
            example: 'Doe'
          },
          keycloakGlobalRole: {
            type: 'string',
            enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER'],
            description: 'Global role from Keycloak',
            example: 'COMPANY_USER'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the user account is active',
            example: true
          },
          lastLoginAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Timestamp of last login',
            example: '2024-11-23T12:00:00.000Z'
          },
          createdDate: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-11-23T12:00:00.000Z'
          }
        },
        required: ['id', 'keycloakId', 'email', 'keycloakGlobalRole', 'isActive']
      },
      // User create request schema
      UserCreateRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            description: 'User password (required if new user, min 8 chars)',
            example: 'SecurePassword123!'
          },
          firstName: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'User first name',
            example: 'John'
          },
          lastName: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'User last name',
            example: 'Doe'
          },
          keycloakGlobalRole: {
            type: 'string',
            enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER'],
            description: 'Global role',
            example: 'COMPANY_USER'
          },
          companyId: {
            type: 'string',
            format: 'uuid',
            description: 'Company UUID (optional, for SuperAdmin endpoints)',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          roleId: {
            type: 'string',
            format: 'uuid',
            description: 'Role UUID (required if companyId provided)',
            example: '550e8400-e29b-41d4-a716-446655440002'
          }
        }
      },
      // User update request schema
      UserUpdateRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'newemail@example.com'
          },
          firstName: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'User first name',
            example: 'Jane'
          },
          lastName: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'User last name',
            example: 'Smith'
          },
          keycloakGlobalRole: {
            type: 'string',
            enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'COMPANY_USER'],
            description: 'Global role',
            example: 'COMPANY_ADMIN'
          },
          isActive: {
            type: 'boolean',
            description: 'Active status',
            example: true
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            description: 'New password (min 8 chars)',
            example: 'NewSecure123!'
          }
        }
      },
      // Company entity schema
      Company: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Company UUID',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          name: {
            type: 'string',
            maxLength: 255,
            description: 'Company name',
            example: 'Acme Corporation'
          },
          code: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Company code/abbreviation',
            example: 'ACME'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Company description',
            example: 'A leading technology company'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the company is active',
            example: true
          },
          createdDate: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-11-23T12:00:00.000Z'
          },
          updatedDate: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2024-11-23T12:00:00.000Z'
          },
          version: {
            type: 'integer',
            description: 'Optimistic locking version',
            example: 1
          }
        },
        required: ['id', 'name', 'isActive']
      },
      // Company create request schema
      CompanyCreateRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            maxLength: 255,
            description: 'Company name',
            example: 'Acme Corporation'
          },
          code: {
            type: 'string',
            maxLength: 50,
            description: 'Company code/abbreviation',
            example: 'ACME'
          },
          description: {
            type: 'string',
            description: 'Company description',
            example: 'A leading technology company'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the company is active',
            example: true
          }
        }
      },
      // Company update request schema
      CompanyUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            maxLength: 255,
            description: 'Company name',
            example: 'Acme Corporation Updated'
          },
          code: {
            type: 'string',
            maxLength: 50,
            description: 'Company code/abbreviation',
            example: 'ACME_UPD'
          },
          description: {
            type: 'string',
            description: 'Company description',
            example: 'Updated company description'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the company is active',
            example: true
          }
        }
      },
      // CompanyRole entity schema
      CompanyRole: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Role UUID',
            example: '550e8400-e29b-41d4-a716-446655440002'
          },
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Role name',
            example: 'Manager'
          },
          code: {
            type: 'string',
            maxLength: 50,
            description: 'Unique role code',
            example: 'MANAGER'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Role description',
            example: 'Manages team and resources'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the role is active',
            example: true
          },
          createdDate: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-11-23T12:00:00.000Z'
          },
          updatedDate: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2024-11-23T12:00:00.000Z'
          },
          version: {
            type: 'integer',
            description: 'Optimistic locking version',
            example: 1
          }
        },
        required: ['id', 'name', 'code', 'isActive']
      },
      // CompanyRole create request schema
      CompanyRoleCreateRequest: {
        type: 'object',
        required: ['name', 'code'],
        properties: {
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Role name',
            example: 'Manager'
          },
          code: {
            type: 'string',
            maxLength: 50,
            description: 'Unique role code',
            example: 'MANAGER'
          },
          description: {
            type: 'string',
            description: 'Role description',
            example: 'Manages team and resources'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the role is active',
            example: true
          }
        }
      },
      // CompanyRole update request schema
      CompanyRoleUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Role name',
            example: 'Senior Manager'
          },
          code: {
            type: 'string',
            maxLength: 50,
            description: 'Unique role code',
            example: 'SENIOR_MANAGER'
          },
          description: {
            type: 'string',
            description: 'Role description',
            example: 'Updated role description'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the role is active',
            example: true
          }
        }
      },
      // CompanyUser entity schema (junction table)
      CompanyUser: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'CompanyUser UUID',
            example: '550e8400-e29b-41d4-a716-446655440004'
          },
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'User UUID',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          companyId: {
            type: 'string',
            format: 'uuid',
            description: 'Company UUID',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          roleId: {
            type: 'string',
            format: 'uuid',
            description: 'CompanyRole UUID',
            example: '550e8400-e29b-41d4-a716-446655440002'
          },
          companyRoleId: {
            type: 'string',
            format: 'uuid',
            description: 'CompanyRole UUID (alternative field name)',
            example: '550e8400-e29b-41d4-a716-446655440002'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether this company-user relationship is active',
            example: true
          },
          createdDate: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-11-23T12:00:00.000Z'
          },
          updatedDate: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2024-11-23T12:00:00.000Z'
          }
        },
        required: ['id', 'userId', 'companyId', 'roleId', 'isActive']
      },
      // CompanyUser create/assign request schema
      CompanyUserCreateRequest: {
        type: 'object',
        required: ['companyId', 'roleId'],
        properties: {
          companyId: {
            type: 'string',
            format: 'uuid',
            description: 'Company UUID',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          roleId: {
            type: 'string',
            format: 'uuid',
            description: 'CompanyRole UUID',
            example: '550e8400-e29b-41d4-a716-446655440002'
          }
        }
      },
      // CompanyUser role update request schema
      CompanyUserRoleUpdateRequest: {
        type: 'object',
        required: ['roleId'],
        properties: {
          roleId: {
            type: 'string',
            format: 'uuid',
            description: 'New CompanyRole UUID',
            example: '550e8400-e29b-41d4-a716-446655440002'
          }
        }
      },
      // Token response schema (for login/refresh)
      TokenResponse: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
            description: 'JWT access token',
            example: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
          },
          refresh_token: {
            type: 'string',
            description: 'JWT refresh token',
            example: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
          },
          expires_in: {
            type: 'integer',
            description: 'Access token expiration time in seconds',
            example: 300
          },
          refresh_expires_in: {
            type: 'integer',
            description: 'Refresh token expiration time in seconds',
            example: 1800
          },
          token_type: {
            type: 'string',
            description: 'Token type',
            example: 'Bearer'
          }
        },
        required: ['access_token', 'refresh_token', 'expires_in', 'refresh_expires_in', 'token_type']
      },
      // Login request schema
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            example: 'password123'
          }
        }
      },
      // Refresh token request schema
      RefreshRequest: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
          refresh_token: {
            type: 'string',
            description: 'Refresh token from login',
            example: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
          }
        }
      },
      // =====================================================
      // Parameter Schemas
      // =====================================================
      // Pagination query parameters
      PaginationQueryParams: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number'
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Items per page (max 100)'
          }
        }
      },
      // Search query parameter
      SearchQueryParams: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Search term for filtering',
            example: 'john'
          }
        }
      },
      // Sort query parameters
      SortQueryParams: {
        type: 'object',
        properties: {
          sortBy: {
            type: 'string',
            description: 'Field to sort by',
            example: 'email'
          },
          sortOrder: {
            type: 'string',
            enum: ['ASC', 'DESC'],
            default: 'ASC',
            description: 'Sort order'
          }
        }
      },
      // UUID path parameter
      UuidPathParam: {
        type: 'string',
        format: 'uuid',
        description: 'Resource UUID',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      // Filter query parameters
      FilterQueryParams: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
            description: 'Filter by active status',
            example: true
          }
        }
      }
    },
    // =====================================================
    // Reusable Response Definitions
    // =====================================================
    responses: {
      ValidationError: {
        description: 'Validation error - Invalid request data',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ErrorResponse' },
                {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'VALIDATION_ERROR'
                    },
                    details: {
                      $ref: '#/components/schemas/ValidationError'
                    }
                  }
                }
              ]
            },
            example: {
              success: false,
              error: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: {
                field: 'email',
                message: 'Email is required'
              },
              timestamp: '2024-11-23T12:00:00.000Z',
              meta: {
                requestId: 'req-1234567890',
                endpoint: '/api/v2/users',
                method: 'POST'
              }
            }
          }
        }
      },
      AuthenticationRequired: {
        description: 'Authentication required - Bearer token missing or invalid',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ErrorResponse' },
                {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'AUTHENTICATION_REQUIRED'
                    },
                    message: {
                      type: 'string',
                      example: 'User not found in request'
                    }
                  }
                }
              ]
            },
            example: {
              success: false,
              error: 'AUTHENTICATION_REQUIRED',
              message: 'User not found in request',
              timestamp: '2024-11-23T12:00:00.000Z',
              meta: {
                requestId: 'req-1234567890',
                endpoint: '/api/v2/users',
                method: 'GET'
              }
            }
          }
        }
      },
      AuthenticationFailed: {
        description: 'Authentication failed - Invalid credentials',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ErrorResponse' },
                {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'AUTHENTICATION_FAILED'
                    },
                    message: {
                      type: 'string',
                      example: 'Invalid credentials'
                    }
                  }
                }
              ]
            },
            example: {
              success: false,
              error: 'AUTHENTICATION_FAILED',
              message: 'Invalid credentials',
              timestamp: '2024-11-23T12:00:00.000Z',
              meta: {
                requestId: 'req-1234567890',
                endpoint: '/api/v2/auth/login',
                method: 'POST'
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ErrorResponse' },
                {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'FORBIDDEN'
                    },
                    message: {
                      type: 'string',
                      example: 'Access denied'
                    }
                  }
                }
              ]
            },
            example: {
              success: false,
              error: 'FORBIDDEN',
              message: 'Access denied',
              timestamp: '2024-11-23T12:00:00.000Z',
              meta: {
                requestId: 'req-1234567890',
                endpoint: '/api/v2/users',
                method: 'GET'
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Not found - Resource does not exist',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ErrorResponse' },
                {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'NOT_FOUND'
                    },
                    message: {
                      type: 'string',
                      example: 'Resource not found'
                    },
                    details: {
                      $ref: '#/components/schemas/NotFoundError'
                    }
                  }
                }
              ]
            },
            example: {
              success: false,
              error: 'NOT_FOUND',
              message: 'User not found',
              details: {
                entity: 'User',
                id: '550e8400-e29b-41d4-a716-446655440000'
              },
              timestamp: '2024-11-23T12:00:00.000Z',
              meta: {
                requestId: 'req-1234567890',
                endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
                method: 'GET'
              }
            }
          }
        }
      },
      Conflict: {
        description: 'Conflict - Resource already exists',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ErrorResponse' },
                {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'CONFLICT'
                    },
                    message: {
                      type: 'string',
                      example: 'Resource already exists'
                    },
                    details: {
                      $ref: '#/components/schemas/ConflictError'
                    }
                  }
                }
              ]
            },
            example: {
              success: false,
              error: 'CONFLICT',
              message: 'User with this email already exists',
              details: {
                field: 'email',
                value: 'user@example.com'
              },
              timestamp: '2024-11-23T12:00:00.000Z',
              meta: {
                requestId: 'req-1234567890',
                endpoint: '/api/v2/users',
                method: 'POST'
              }
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error - Unexpected server error',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ErrorResponse' },
                {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'INTERNAL_SERVER_ERROR'
                    },
                    message: {
                      type: 'string',
                      example: 'An error occurred while processing the request'
                    }
                  }
                }
              ]
            },
            example: {
              success: false,
              error: 'INTERNAL_SERVER_ERROR',
              message: 'An error occurred while processing the request',
              timestamp: '2024-11-23T12:00:00.000Z',
              meta: {
                requestId: 'req-1234567890',
                endpoint: '/api/v2/users',
                method: 'GET'
              }
            }
          }
        }
      }
    },
    // =====================================================
    // Reusable Parameter Definitions
    // =====================================================
    parameters: {
      UuidPathParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid'
        },
        description: 'Resource UUID',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      PageQueryParam: {
        name: 'page',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        },
        description: 'Page number'
      },
      LimitQueryParam: {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10
        },
        description: 'Items per page (max 100)'
      },
      SearchQueryParam: {
        name: 'search',
        in: 'query',
        required: false,
        schema: {
          type: 'string'
        },
        description: 'Search term for filtering',
        example: 'john'
      },
      SortByQueryParam: {
        name: 'sortBy',
        in: 'query',
        required: false,
        schema: {
          type: 'string'
        },
        description: 'Field to sort by',
        example: 'email'
      },
      SortOrderQueryParam: {
        name: 'sortOrder',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          enum: ['ASC', 'DESC'],
          default: 'ASC'
        },
        description: 'Sort order'
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'System health monitoring and diagnostics endpoints'
    },
    {
      name: 'Auth',
      description: 'Authentication and company context management endpoints'
    },
    {
      name: 'Users',
      description: 'User management CRUD operations'
    },
    {
      name: 'Admin',
      description: 'Administrative functions and company-scoped user management'
    },
    {
      name: 'SuperAdmin',
      description: 'Super administrator functions for system-wide management'
    }
  ]
};

/**
 * Swagger JSDoc options
 * Configures where to find JSDoc annotations
 */
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    './src/modules/**/*Routes.js' // Path to route files with Swagger annotations
  ]
};

/**
 * Generate OpenAPI specification from JSDoc annotations
 * @returns {Object} OpenAPI 3.0 specification object
 */
export const generateSwaggerSpec = () => {
  try {
    const spec = swaggerJsdoc(swaggerOptions);
    logger.info('Swagger specification generated successfully', {
      endpoints: Object.keys(spec.paths || {}).length,
      serverUrl
    });
    return spec;
  } catch (error) {
    logger.error('Failed to generate Swagger specification', error);
    throw error;
  }
};

/**
 * Get Swagger options (for direct use with swagger-jsdoc)
 * @returns {Object} Swagger options object
 */
export const getSwaggerOptions = () => {
  return swaggerOptions;
};

export default swaggerOptions;

