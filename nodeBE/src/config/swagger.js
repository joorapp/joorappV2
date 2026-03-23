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
          },
          companies: {
            type: 'array',
            description: 'Array of companies the user is associated with',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Company UUID',
                  example: '550e8400-e29b-41d4-a716-446655440000'
                },
                name: {
                  type: 'string',
                  description: 'Company name',
                  example: 'Company Name'
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
                },
                status: {
                  type: 'string',
                  enum: ['NEW', 'ACTIVE', 'LICENSE_EXPIRED'],
                  description: 'Company status',
                  example: 'ACTIVE'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Company email',
                  example: 'contact@company.com'
                },
                phone: {
                  type: 'string',
                  description: 'Company phone',
                  example: '+1 234-567-8900'
                },
                buildingAddress: {
                  type: 'string',
                  description: 'Building address',
                  example: 'Suite 100'
                },
                streetAddress: {
                  type: 'string',
                  description: 'Street address',
                  example: '123 Main Street'
                },
                city: {
                  type: 'string',
                  description: 'City',
                  example: 'New York'
                },
                state: {
                  type: 'string',
                  description: 'State',
                  example: 'NY'
                },
                postalCode: {
                  type: 'string',
                  description: 'Postal code',
                  example: '10001'
                },
                country: {
                  type: 'string',
                  description: 'Country',
                  example: 'United States'
                },
                logo: {
                  type: 'string',
                  description: 'Base64 encoded company logo (only included in single user GET response)',
                  example: null
                },
                plan: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440003'
                    },
                    name: {
                      type: 'string',
                      example: 'Basic'
                    },
                    code: {
                      type: 'string',
                      example: 'BASIC'
                    },
                    description: {
                      type: 'string',
                      example: 'Basic subscription plan'
                    },
                    price: {
                      type: 'number',
                      example: 0
                    },
                    isActive: {
                      type: 'boolean',
                      example: true
                    },
                    createdDate: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-11-23T12:00:00.000Z'
                    },
                    updatedDate: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-11-23T12:00:00.000Z'
                    },
                    version: {
                      type: 'integer',
                      example: 1
                    }
                  }
                },
                role: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                      example: '660e8400-e29b-41d4-a716-446655440001'
                    },
                    name: {
                      type: 'string',
                      example: 'CompanyAdmin'
                    },
                    code: {
                      type: 'string',
                      example: 'COMPANY_ADMIN'
                    },
                    description: {
                      type: 'string',
                      example: 'Company administrator role'
                    }
                  }
                },
                companyUser: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                      example: '770e8400-e29b-41d4-a716-446655440002'
                    },
                    isActive: {
                      type: 'boolean',
                      example: true
                    }
                  }
                }
              }
            }
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
          status: {
            type: 'string',
            enum: ['NEW', 'ACTIVE', 'LICENSE_EXPIRED'],
            description: 'Company status',
            example: 'NEW'
          },
          email: {
            type: 'string',
            format: 'email',
            nullable: true,
            description: 'Company email address',
            example: 'contact@acme.com'
          },
          phone: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Company phone number',
            example: '+1 234-567-8900'
          },
          buildingAddress: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Building number, unit, or premise address',
            example: 'Suite 100'
          },
          streetAddress: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Street name, area, or locality',
            example: '123 Main Street'
          },
          city: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'City name',
            example: 'New York'
          },
          state: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'State or province',
            example: 'NY'
          },
          postalCode: {
            type: 'string',
            maxLength: 20,
            nullable: true,
            description: 'Postal or ZIP code',
            example: '10001'
          },
          country: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'Country name',
            example: 'United States'
          },
          logo: {
            type: 'string',
            nullable: true,
            description: 'Base64 encoded company logo (only included when includeLogo=true)',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
          },
          plan: {
            $ref: '#/components/schemas/Plan',
            nullable: true,
            description: 'Associated subscription plan object (assigned automatically to BASIC plan for new companies)'
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
        required: ['id', 'name', 'isActive', 'status']
      },
      // Company create request schema
      CompanyCreateRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Company name',
            example: 'Acme Corporation'
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
          email: {
            type: 'string',
            format: 'email',
            nullable: true,
            description: 'Company email address',
            example: 'contact@acme.com'
          },
          phone: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Company phone number',
            example: '+1 234-567-8900'
          },
          buildingAddress: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Building number, unit, or premise address',
            example: 'Suite 100'
          },
          streetAddress: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Street name, area, or locality',
            example: '123 Main Street'
          },
          city: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'City name',
            example: 'New York'
          },
          state: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'State or province',
            example: 'NY'
          },
          postalCode: {
            type: 'string',
            maxLength: 20,
            nullable: true,
            description: 'Postal or ZIP code',
            example: '10001'
          },
          country: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'Country name',
            example: 'United States'
          },
          logo: {
            type: 'string',
            nullable: true,
            description: 'Base64 encoded company logo',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
          },
          status: {
            type: 'string',
            enum: ['NEW', 'ACTIVE', 'LICENSE_EXPIRED'],
            default: 'NEW',
            description: 'Company status (defaults to NEW)',
            example: 'NEW'
          },
          planId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'Plan UUID (optional, defaults to BASIC plan if not provided)',
            example: '550e8400-e29b-41d4-a716-446655440003'
          }
        }
      },
      // Company update request schema
      CompanyUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Company name',
            example: 'Acme Corporation Updated'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Company description',
            example: 'Updated company description'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the company is active',
            example: true
          },
          email: {
            type: 'string',
            format: 'email',
            nullable: true,
            description: 'Company email address',
            example: 'contact@acme.com'
          },
          phone: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Company phone number',
            example: '+1 234-567-8900'
          },
          buildingAddress: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Building number, unit, or premise address',
            example: 'Suite 100'
          },
          streetAddress: {
            type: 'string',
            maxLength: 255,
            nullable: true,
            description: 'Street name, area, or locality',
            example: '123 Main Street'
          },
          city: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'City name',
            example: 'New York'
          },
          state: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'State or province',
            example: 'NY'
          },
          postalCode: {
            type: 'string',
            maxLength: 20,
            nullable: true,
            description: 'Postal or ZIP code',
            example: '10001'
          },
          country: {
            type: 'string',
            maxLength: 100,
            nullable: true,
            description: 'Country name',
            example: 'United States'
          },
          logo: {
            type: 'string',
            nullable: true,
            description: 'Base64 encoded company logo',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
          },
          status: {
            type: 'string',
            enum: ['NEW', 'ACTIVE', 'LICENSE_EXPIRED'],
            description: 'Company status',
            example: 'ACTIVE'
          },
          planId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'Plan UUID',
            example: '550e8400-e29b-41d4-a716-446655440003'
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
      JobTitle: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Job title UUID',
            example: '550e8400-e29b-41d4-a716-446655440030'
          },
          jobTitle: {
            type: 'string',
            maxLength: 255,
            description: 'Job title name',
            example: 'Software Engineer'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Optional description',
            example: 'Builds and maintains software'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the job title is active',
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
        required: ['id', 'jobTitle', 'isActive']
      },
      JobTitleCompanyWorkspace: {
        allOf: [
          { $ref: '#/components/schemas/JobTitle' },
          {
            type: 'object',
            description:
              'Job title in company-admin context. Platform-managed titles (super admin company) include canEdit and canDelete false.',
            properties: {
              canEdit: {
                type: 'boolean',
                description: 'True when the title was created by the current company (tenant may edit)',
                example: true
              },
              canDelete: {
                type: 'boolean',
                description: 'True when the title was created by the current company (tenant may delete)',
                example: false
              }
            },
            required: ['canEdit', 'canDelete']
          }
        ]
      },
      JobTitleCreateRequest: {
        type: 'object',
        required: ['jobTitle'],
        properties: {
          jobTitle: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Job title name',
            example: 'Product Manager'
          },
          description: {
            type: 'string',
            description: 'Optional description',
            example: 'Owns product roadmap'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the job title is active',
            example: true
          }
        }
      },
      JobTitleUpdateRequest: {
        type: 'object',
        properties: {
          jobTitle: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Job title name',
            example: 'Senior Product Manager'
          },
          description: {
            type: 'string',
            description: 'Optional description',
            example: 'Updated description'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the job title is active',
            example: false
          }
        }
      },
      ProjectType: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Project type UUID',
            example: '550e8400-e29b-41d4-a716-446655440031'
          },
          projectType: {
            type: 'string',
            maxLength: 255,
            description: 'Project type name',
            example: 'Internal'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Optional description',
            example: 'Internal delivery projects'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the project type is active',
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
        required: ['id', 'projectType', 'isActive']
      },
      ProjectTypeCompanyWorkspace: {
        allOf: [
          { $ref: '#/components/schemas/ProjectType' },
          {
            type: 'object',
            description:
              'Project type in company-admin context. Platform-managed types (super admin company) include canEdit and canDelete false.',
            properties: {
              canEdit: {
                type: 'boolean',
                description: 'True when the type was created by the current company (tenant may edit)',
                example: true
              },
              canDelete: {
                type: 'boolean',
                description: 'True when the type was created by the current company (tenant may delete)',
                example: false
              }
            },
            required: ['canEdit', 'canDelete']
          }
        ]
      },
      ProjectTypeCreateRequest: {
        type: 'object',
        required: ['projectType'],
        properties: {
          projectType: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Project type name',
            example: 'Client-facing'
          },
          description: {
            type: 'string',
            description: 'Optional description',
            example: 'Work delivered to external clients'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the project type is active',
            example: true
          }
        }
      },
      ProjectTypeUpdateRequest: {
        type: 'object',
        properties: {
          projectType: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Project type name',
            example: 'Client delivery'
          },
          description: {
            type: 'string',
            description: 'Optional description',
            example: 'Updated description'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the project type is active',
            example: false
          }
        }
      },
      ProjectCategory: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Project category UUID',
            example: '550e8400-e29b-41d4-a716-446655440032'
          },
          projectCategory: {
            type: 'string',
            maxLength: 255,
            description: 'Project category name',
            example: 'Strategic'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Optional description',
            example: 'Strategic initiatives'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the project category is active',
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
        required: ['id', 'projectCategory', 'isActive']
      },
      ProjectCategoryCompanyWorkspace: {
        allOf: [
          { $ref: '#/components/schemas/ProjectCategory' },
          {
            type: 'object',
            description:
              'Project category in company-admin context. Platform-managed categories (super admin company) include canEdit and canDelete false.',
            properties: {
              canEdit: {
                type: 'boolean',
                description: 'True when the category was created by the current company (tenant may edit)',
                example: true
              },
              canDelete: {
                type: 'boolean',
                description: 'True when the category was created by the current company (tenant may delete)',
                example: false
              }
            },
            required: ['canEdit', 'canDelete']
          }
        ]
      },
      ProjectCategoryCreateRequest: {
        type: 'object',
        required: ['projectCategory'],
        properties: {
          projectCategory: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Project category name',
            example: 'Operational'
          },
          description: {
            type: 'string',
            description: 'Optional description',
            example: 'Day-to-day operations'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the project category is active',
            example: true
          }
        }
      },
      ProjectCategoryUpdateRequest: {
        type: 'object',
        properties: {
          projectCategory: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Project category name',
            example: 'Operations'
          },
          description: {
            type: 'string',
            description: 'Optional description',
            example: 'Updated description'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the project category is active',
            example: false
          }
        }
      },
      EmployeeJobTitleSummary: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', format: 'uuid' },
          jobTitle: { type: 'string' },
          description: { type: 'string', nullable: true },
          isActive: { type: 'boolean' }
        }
      },
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string', maxLength: 100 },
          lastName: { type: 'string', maxLength: 100 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true, maxLength: 50 },
          employeeMetadata: { type: 'object', additionalProperties: true },
          jobTitleId: { type: 'string', format: 'uuid' },
          salary: { type: 'number', format: 'double', nullable: true },
          isActive: { type: 'boolean' },
          companyUserId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'Set when employee can log in for this company (links to company_users)'
          },
          createdDate: { type: 'string', format: 'date-time' },
          updatedDate: { type: 'string', format: 'date-time' },
          version: { type: 'integer' },
          jobTitle: { $ref: '#/components/schemas/EmployeeJobTitleSummary' }
        },
        required: ['id', 'firstName', 'lastName', 'email', 'jobTitleId', 'isActive']
      },
      EmployeeCreateRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'jobTitleId'],
        properties: {
          firstName: { type: 'string', minLength: 1, maxLength: 100 },
          lastName: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', maxLength: 50 },
          employeeMetadata: { type: 'object', additionalProperties: true },
          jobTitleId: { type: 'string', format: 'uuid' },
          salary: { type: 'number', format: 'double' },
          isActive: { type: 'boolean', default: true }
        }
      },
      EmployeeUpdateRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string', minLength: 1, maxLength: 100 },
          lastName: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true, maxLength: 50 },
          employeeMetadata: { type: 'object', additionalProperties: true },
          jobTitleId: { type: 'string', format: 'uuid' },
          salary: { type: 'number', format: 'double', nullable: true },
          isActive: { type: 'boolean' }
        }
      },
      EmployeeStatusPatchRequest: {
        type: 'object',
        required: ['isActive'],
        properties: {
          isActive: { type: 'boolean', description: 'Whether the employee record is active' }
        }
      },
      // Role create request schema (for superAdmin/roles POST)
      RoleCreateRequest: {
        type: 'object',
        required: ['name', 'code'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Role name',
            example: 'Project Manager'
          },
          code: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            description: 'Unique role code',
            example: 'PROJECT_MANAGER'
          },
          description: {
            type: 'string',
            description: 'Role description',
            example: 'Manages projects'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the role is active',
            example: true
          }
        }
      },
      // Role update request schema (for superAdmin/roles PUT)
      RoleUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Role name',
            example: 'Updated Project Manager'
          },
          code: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            description: 'Unique role code',
            example: 'UPDATED_PM'
          },
          description: {
            type: 'string',
            description: 'Role description',
            example: 'Updated description'
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
      // Plan entity schema
      Plan: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Plan UUID',
            example: '550e8400-e29b-41d4-a716-446655440003'
          },
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Plan name',
            example: 'Basic'
          },
          code: {
            type: 'string',
            maxLength: 50,
            description: 'Unique plan code',
            example: 'BASIC'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Plan description',
            example: 'Basic subscription plan - default plan for new companies'
          },
          price: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            description: 'Plan price/cost',
            example: 0.00
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the plan is active',
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
        required: ['id', 'name', 'code', 'price', 'isActive']
      },
      // Plan create request schema
      PlanCreateRequest: {
        type: 'object',
        required: ['name', 'code'],
        properties: {
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Plan name',
            example: 'Premium'
          },
          code: {
            type: 'string',
            maxLength: 50,
            description: 'Unique plan code',
            example: 'PREMIUM'
          },
          description: {
            type: 'string',
            description: 'Plan description',
            example: 'Premium subscription plan with advanced features'
          },
          price: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            default: 0.00,
            description: 'Plan price/cost',
            example: 99.99
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the plan is active',
            example: true
          }
        }
      },
      // Plan update request schema
      PlanUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            maxLength: 100,
            description: 'Plan name',
            example: 'Updated Premium'
          },
          code: {
            type: 'string',
            maxLength: 50,
            description: 'Unique plan code',
            example: 'PREMIUM'
          },
          description: {
            type: 'string',
            description: 'Plan description',
            example: 'Updated plan description'
          },
          price: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            description: 'Plan price/cost',
            example: 149.99
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the plan is active',
            example: true
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
      // Client entity schema
      Client: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Client UUID',
            example: '550e8400-e29b-41d4-a716-446655440010'
          },
          name: {
            type: 'string',
            maxLength: 255,
            description: 'Client name',
            example: 'Acme Corp'
          },
          email: {
            type: 'string',
            format: 'email',
            nullable: true,
            description: 'Client email address',
            example: 'contact@acme.com'
          },
          phone: {
            type: 'string',
            maxLength: 50,
            nullable: true,
            description: 'Client phone number',
            example: '+1 234-567-8900'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the client is active',
            example: true
          },
          clientMetadata: {
            type: 'object',
            nullable: true,
            description: 'Additional flexible metadata for the client',
            example: { industry: 'Tech', region: 'NA' }
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
        required: ['id', 'name', 'isActive']
      },
      // Project entity schema
      Project: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Project UUID',
            example: '550e8400-e29b-41d4-a716-446655440020'
          },
          clientId: {
            type: 'string',
            format: 'uuid',
            description: 'Associated Client UUID',
            example: '550e8400-e29b-41d4-a716-446655440010'
          },
          name: {
            type: 'string',
            maxLength: 255,
            description: 'Project name',
            example: 'Website Redesign'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Project description',
            example: 'Complete overhaul of the corporate website'
          },
          status: {
            type: 'string',
            enum: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
            description: 'Project status',
            example: 'IN_PROGRESS'
          },
          startDate: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Project start date',
            example: '2024-01-01'
          },
          endDate: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Project end date',
            example: '2024-12-31'
          },
          projectMetadata: {
            type: 'object',
            nullable: true,
            description: 'Additional flexible metadata for the project',
            example: { budget: 50000, priority: 'High' }
          },
          client: {
            $ref: '#/components/schemas/Client'
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
        required: ['id', 'clientId', 'name', 'status']
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
  // Tag order controls Swagger UI sidebar order (OpenAPI `tags` array sequence).
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and company context management endpoints'
    },
    {
      name: 'Health',
      description: 'System health monitoring and diagnostics endpoints'
    },
    {
      name: 'Users',
      description: 'User management CRUD operations'
    },
    {
      name: 'SuperAdmin',
      description: 'Super administrator functions for system-wide management'
    },
    {
      name: 'Admin',
      description: 'Administrative functions and company-scoped user management'
    },
    {
      name: 'Admin Clients',
      description: 'Client management for company administrators'
    },
    {
      name: 'Admin Employees',
      description: 'Employee and job title management for company administrators'
    },
    {
      name: 'Admin Projects',
      description: 'Project management for company administrators'
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

