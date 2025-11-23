/**
 * @author Bhavesh Venugopal
 * Users Module API Documentation
 * Documentation for user management CRUD endpoints
 */

export const userDocs = {
  module: 'Users',
  description: 'User management CRUD operations',
  version: '1.0.0',
  endpoints: [
    {
      method: 'GET',
      path: '/api/v2/users/list',
      description: 'Get all users with pagination, filtering, and sorting',
      access: 'Protected (requires Bearer token)',
      queryParameters: {
        page: {
          type: 'number',
          required: false,
          description: 'Page number for pagination',
          example: '1'
        },
        limit: {
          type: 'number',
          required: false,
          description: 'Number of users per page (max 100)',
          example: '10'
        },
        search: {
          type: 'string',
          required: false,
          description: 'Search term for filtering users by email, firstName, or lastName',
          example: 'john'
        },
        sortBy: {
          type: 'string',
          required: false,
          description: 'Field to sort by (email, firstName, lastName, keycloakGlobalRole, isActive, createdDate, lastLoginAt)',
          example: 'createdDate'
        },
        sortOrder: {
          type: 'string',
          required: false,
          description: 'Sort order (ASC or DESC)',
          example: 'DESC'
        }
      },
      responses: {
        200: {
          description: 'Users retrieved successfully',
          example: {
            success: true,
            message: 'Users retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440000',
                keycloakId: '660e8400-e29b-41d4-a716-446655440001',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe',
                keycloakGlobalRole: 'COMPANY_USER',
                isActive: true,
                lastLoginAt: '2024-11-23T12:00:00.000Z'
              }
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 25,
              pages: 3,
              hasNext: true,
              hasPrev: false
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/list',
              method: 'GET',
              duration: 189
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
              endpoint: '/api/v2/users/list',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve users',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/list',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/users/:id',
      description: 'Get single user by ID',
      access: 'Protected (requires Bearer token)',
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'User UUID',
          example: '550e8400-e29b-41d4-a716-446655440000'
        }
      },
      responses: {
        200: {
          description: 'User retrieved successfully',
          example: {
            success: true,
            message: 'User retrieved successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              keycloakId: '660e8400-e29b-41d4-a716-446655440001',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              keycloakGlobalRole: 'COMPANY_USER',
              isActive: true,
              lastLoginAt: '2024-11-23T12:00:00.000Z'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'GET',
              duration: 45
            }
          }
        },
        400: {
          description: 'Validation error - invalid user ID format',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid id format',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/invalid-id',
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
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
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
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve user',
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
    {
      method: 'POST',
      path: '/api/v2/users',
      description: 'Create new user in Keycloak and database',
      access: 'Protected (requires Bearer token)',
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          email: {
            type: 'string',
            required: true,
            description: 'User email address'
          },
          password: {
            type: 'string',
            required: true,
            description: 'User password (minimum 8 characters)'
          },
          firstName: {
            type: 'string',
            required: false,
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            required: false,
            description: 'User last name'
          },
          keycloakGlobalRole: {
            type: 'string',
            required: false,
            description: 'Global role (SUPER_ADMIN, COMPANY_USER)',
            example: 'COMPANY_USER'
          }
        },
        example: {
          email: 'newuser@example.com',
          password: 'SecurePassword123',
          firstName: 'Jane',
          lastName: 'Smith',
          keycloakGlobalRole: 'COMPANY_USER'
        }
      },
      responses: {
        201: {
          description: 'User created successfully',
          example: {
            success: true,
            message: 'User created successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              keycloakId: '660e8400-e29b-41d4-a716-446655440001',
              email: 'newuser@example.com',
              firstName: 'Jane',
              lastName: 'Smith',
              keycloakGlobalRole: 'COMPANY_USER',
              isActive: true
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users',
              method: 'POST',
              duration: 456
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Email and password are required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users',
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
              endpoint: '/api/v2/users',
              method: 'POST'
            }
          }
        },
        409: {
          description: 'User with this email already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'User with this email already exists',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users',
              method: 'POST'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create user',
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
    {
      method: 'PUT',
      path: '/api/v2/users/:id',
      description: 'Update user by ID (updates both Keycloak and database)',
      access: 'Protected (requires Bearer token)',
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'User UUID',
          example: '550e8400-e29b-41d4-a716-446655440000'
        }
      },
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          email: {
            type: 'string',
            required: false,
            description: 'User email address'
          },
          firstName: {
            type: 'string',
            required: false,
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            required: false,
            description: 'User last name'
          },
          keycloakGlobalRole: {
            type: 'string',
            required: false,
            description: 'Global role (SUPER_ADMIN, COMPANY_USER)'
          },
          isActive: {
            type: 'boolean',
            required: false,
            description: 'Whether the user account is active'
          },
          password: {
            type: 'string',
            required: false,
            description: 'New password (minimum 8 characters)'
          }
        },
        example: {
          firstName: 'John',
          lastName: 'Updated',
          isActive: true
        }
      },
      responses: {
        200: {
          description: 'User updated successfully',
          example: {
            success: true,
            message: 'User updated successfully',
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              keycloakId: '660e8400-e29b-41d4-a716-446655440001',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Updated',
              keycloakGlobalRole: 'COMPANY_USER',
              isActive: true,
              lastLoginAt: '2024-11-23T12:00:00.000Z'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'PUT',
              duration: 234
            }
          }
        },
        400: {
          description: 'Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid id format',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/invalid-id',
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
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
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
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'PUT'
            }
          }
        },
        409: {
          description: 'User with this email already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'User with this email already exists',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'PUT'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update user',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'PUT'
            }
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/v2/users/:id',
      description: 'Soft delete user by ID (disables in Keycloak and marks as inactive in database)',
      access: 'Protected (requires Bearer token)',
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'User UUID',
          example: '550e8400-e29b-41d4-a716-446655440000'
        }
      },
      responses: {
        200: {
          description: 'User deleted successfully',
          example: {
            success: true,
            message: 'User deleted successfully',
            data: null,
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'DELETE',
              duration: 189
            }
          }
        },
        400: {
          description: 'Validation error or cannot delete own account',
          example: {
            success: false,
            error: 'BAD_REQUEST',
            message: 'Cannot delete your own account',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
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
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'DELETE'
            }
          }
        },
        404: {
          description: 'User not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'User not found',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'DELETE'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete user',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/users/550e8400-e29b-41d4-a716-446655440000',
              method: 'DELETE'
            }
          }
        }
      }
    }
  ]
};

