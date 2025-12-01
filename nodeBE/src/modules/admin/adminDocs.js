/**
 * @author Bhavesh Venugopal
 * Admin Module API Documentation
 * Documentation for administrative functions and user management endpoints
 */

export const adminDocs = {
  module: 'Admin',
  description: 'Administrative functions and system configuration.',
  version: '2.0.0',
  endpoints: [
    {
      method: 'GET',
      path: '/api/v2/admin/settings',
      description: 'Get system settings and configuration',
      access: 'Protected (requires Bearer token)',
      responses: {
        200: {
          description: 'Settings retrieved successfully',
          example: {
            success: true,
            message: 'Settings retrieved successfully',
            data: {
              settings: {
                siteName: 'JoorApp',
                maintenanceMode: false,
                maxUsers: 1000,
                features: {
                  registration: true,
                  emailNotifications: true,
                  analytics: true
                }
              }
            },
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
              method: 'GET',
              duration: 98
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden - Admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Admin access required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve settings',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v2/admin/settings',
      description: 'Update system settings and configuration',
      access: 'Protected (requires Bearer token)',
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          siteName: {
            type: 'string',
            required: false,
            description: 'Site name'
          },
          maintenanceMode: {
            type: 'boolean',
            required: false,
            description: 'Maintenance mode flag'
          },
          maxUsers: {
            type: 'number',
            required: false,
            description: 'Maximum number of users'
          },
          features: {
            type: 'object',
            required: false,
            description: 'Feature flags'
          }
        },
        example: {
          siteName: 'JoorApp V2',
          maintenanceMode: false,
          maxUsers: 2000,
          features: {
            registration: true,
            emailNotifications: false,
            analytics: true
          }
        }
      },
      responses: {
        200: {
          description: 'Settings updated successfully',
          example: {
            success: true,
            message: 'Settings updated successfully',
            data: {
              settings: {
                siteName: 'JoorApp V2',
                maintenanceMode: false,
                maxUsers: 2000,
                features: {
                  registration: true,
                  emailNotifications: false,
                  analytics: true
                }
              }
            },
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
              method: 'PUT',
              duration: 234
            }
          }
        },
        400: {
          description: 'Bad request - Invalid settings data',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid settings data',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
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
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
              method: 'PUT'
            }
          }
        },
        403: {
          description: 'Forbidden - Admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Admin access required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
              method: 'PUT'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update settings',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/settings',
              method: 'PUT'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/admin/stats',
      description: 'Get system statistics and analytics',
      access: 'Protected (requires Bearer token)',
      responses: {
        200: {
          description: 'Statistics retrieved successfully',
          example: {
            success: true,
            message: 'Statistics retrieved successfully',
            data: {
              stats: {
                users: {
                  total: 1250,
                  active: 980,
                  newThisMonth: 45
                },
                system: {
                  uptime: 86400,
                  memoryUsage: '75%',
                  cpuUsage: '45%'
                },
                api: {
                  totalRequests: 50000,
                  requestsToday: 1200,
                  averageResponseTime: '150ms'
                }
              }
            },
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/stats',
              method: 'GET',
              duration: 167
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/stats',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden - Admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Admin access required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/stats',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve statistics',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/stats',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v2/admin/users',
      description: 'Create a new user in the company (Company Admin)',
      access: 'Protected (requires Bearer token and Company Admin role)',
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          email: {
            type: 'string',
            required: true,
            description: 'User email address (must be valid email format)'
          },
          password: {
            type: 'string',
            required: true,
            description: 'User password (minimum 8 characters, required if new user)'
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
          roleId: {
            type: 'string',
            required: true,
            description: 'Company role ID (must be a valid UUID and exist in CompanyRole table)'
          },
          keycloakGlobalRole: {
            type: 'string',
            required: false,
            enum: ['company_admin', 'company_user'],
            description: 'Keycloak global role for the user'
          }
        },
        example: {
          email: 'user@example.com',
          password: 'SecurePassword123',
          firstName: 'John',
          lastName: 'Doe',
          roleId: '123e4567-e89b-12d3-a456-426614174000',
          keycloakGlobalRole: 'company_user'
        }
      },
      responses: {
        201: {
          description: 'User created and assigned to company successfully',
          example: {
            success: true,
            message: 'User created and assigned to company successfully',
            data: {
              user: {
                id: '123e4567-e89b-12d3-a456-426614174001',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe',
                keycloakId: 'kc-123456',
                keycloakGlobalRole: 'company_user',
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
              },
              companyUser: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                userId: '123e4567-e89b-12d3-a456-426614174001',
                companyId: '123e4567-e89b-12d3-a456-426614174003',
                roleId: '123e4567-e89b-12d3-a456-426614174000',
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
              }
            },
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'POST',
              duration: 456
            }
          }
        },
        400: {
          description: 'Bad request - Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Email is required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
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
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'POST'
            }
          }
        },
        403: {
          description: 'Forbidden - Company Admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Company Admin access required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'POST'
            }
          }
        },
        404: {
          description: 'Not found - Role not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'CompanyRole not found',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'POST'
            }
          }
        },
        409: {
          description: 'Conflict - User already exists',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'User already exists with this email',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
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
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'POST'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/admin/users',
      description: 'Get all users in the company (Company Admin)',
      access: 'Protected (requires Bearer token and Company Admin role)',
      queryParameters: {
        page: {
          type: 'number',
          required: false,
          description: 'Page number for pagination (default: 1)'
        },
        limit: {
          type: 'number',
          required: false,
          description: 'Number of items per page (default: 10)'
        },
        sortBy: {
          type: 'string',
          required: false,
          description: 'Field to sort by (e.g., createdAt, email)'
        },
        sortOrder: {
          type: 'string',
          required: false,
          enum: ['asc', 'desc'],
          description: 'Sort order (default: desc)'
        },
        search: {
          type: 'string',
          required: false,
          description: 'Search term for email, firstName, or lastName'
        },
        isActive: {
          type: 'boolean',
          required: false,
          description: 'Filter by active status'
        }
      },
      responses: {
        200: {
          description: 'Company users retrieved successfully',
          example: {
            success: true,
            message: 'Company users retrieved successfully',
            data: {
              users: [
                {
                  id: '123e4567-e89b-12d3-a456-426614174001',
                  email: 'user1@example.com',
                  firstName: 'John',
                  lastName: 'Doe',
                  keycloakId: 'kc-123456',
                  keycloakGlobalRole: 'company_user',
                  isActive: true,
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-01T00:00:00.000Z',
                  CompanyUser: {
                    id: '123e4567-e89b-12d3-a456-426614174002',
                    roleId: '123e4567-e89b-12d3-a456-426614174000',
                    isActive: true,
                    CompanyRole: {
                      id: '123e4567-e89b-12d3-a456-426614174000',
                      name: 'Manager',
                      code: 'MANAGER'
                    }
                  }
                }
              ]
            },
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'GET',
              duration: 234,
              pagination: {
                page: 1,
                limit: 10,
                totalItems: 25,
                totalPages: 3
              }
            }
          }
        },
        401: {
          description: 'Authentication required',
          example: {
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User not found in request',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden - Company Admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Company Admin access required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve company users',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/admin/users/:id',
      description: 'Get a specific user in the company by ID (Company Admin)',
      access: 'Protected (requires Bearer token and Company Admin role)',
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'User ID (UUID format)'
        }
      },
      responses: {
        200: {
          description: 'Company user retrieved successfully',
          example: {
            success: true,
            message: 'Company user retrieved successfully',
            data: {
              user: {
                id: '123e4567-e89b-12d3-a456-426614174001',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe',
                keycloakId: 'kc-123456',
                keycloakGlobalRole: 'company_user',
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
                CompanyUser: {
                  id: '123e4567-e89b-12d3-a456-426614174002',
                  roleId: '123e4567-e89b-12d3-a456-426614174000',
                  isActive: true,
                  CompanyRole: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Manager',
                    code: 'MANAGER',
                    description: 'Manager role'
                  }
                }
              }
            },
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'GET',
              duration: 123
            }
          }
        },
        400: {
          description: 'Bad request - Invalid user ID',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid user ID format',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/invalid-id',
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
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'GET'
            }
          }
        },
        403: {
          description: 'Forbidden - Company Admin access required or user not in company',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'User not found in company',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'GET'
            }
          }
        },
        404: {
          description: 'Not found - User not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'User not found',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve company user',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v2/admin/users/:id',
      description: 'Update a user in the company (Company Admin)',
      access: 'Protected (requires Bearer token and Company Admin role)',
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'User ID (UUID format)'
        }
      },
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
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
          email: {
            type: 'string',
            required: false,
            description: 'User email address'
          },
          keycloakGlobalRole: {
            type: 'string',
            required: false,
            enum: ['company_admin', 'company_user'],
            description: 'Keycloak global role for the user'
          },
          isActive: {
            type: 'boolean',
            required: false,
            description: 'Active status'
          }
        },
        example: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
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
              user: {
                id: '123e4567-e89b-12d3-a456-426614174001',
                email: 'jane.smith@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                keycloakId: 'kc-123456',
                keycloakGlobalRole: 'company_user',
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T01:00:00.000Z'
              }
            },
            timestamp: '2024-01-01T01:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'PUT',
              duration: 345
            }
          }
        },
        400: {
          description: 'Bad request - Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid email format',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
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
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'PUT'
            }
          }
        },
        403: {
          description: 'Forbidden - Company Admin access required or user not in company',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Company Admin access required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'PUT'
            }
          }
        },
        404: {
          description: 'Not found - User not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'User not found',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'PUT'
            }
          }
        },
        409: {
          description: 'Conflict - Email already in use',
          example: {
            success: false,
            error: 'CONFLICT',
            message: 'Email already in use',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
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
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'PUT'
            }
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/v2/admin/users/:id',
      description: 'Remove a user from the company (soft delete CompanyUser association) (Company Admin)',
      access: 'Protected (requires Bearer token and Company Admin role)',
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'User ID (UUID format)'
        }
      },
      responses: {
        200: {
          description: 'User removed from company successfully',
          example: {
            success: true,
            message: 'User removed from company successfully',
            data: {},
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'DELETE',
              duration: 123
            }
          }
        },
        400: {
          description: 'Bad request - Invalid user ID',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid user ID format',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/invalid-id',
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
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'DELETE'
            }
          }
        },
        403: {
          description: 'Forbidden - Company Admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Company Admin access required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'DELETE'
            }
          }
        },
        404: {
          description: 'Not found - User not found or not in company',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'User not found in company',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'DELETE'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to remove user from company',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001',
              method: 'DELETE'
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v2/admin/users/:id/role',
      description: 'Update user role in the company (Company Admin)',
      access: 'Protected (requires Bearer token and Company Admin role)',
      pathParameters: {
        id: {
          type: 'string',
          required: true,
          description: 'User ID (UUID format)'
        }
      },
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          roleId: {
            type: 'string',
            required: true,
            description: 'New role ID (must be a valid UUID and exist in CompanyRole table)'
          }
        },
        example: {
          roleId: '123e4567-e89b-12d3-a456-426614174010'
        }
      },
      responses: {
        200: {
          description: 'User role updated successfully',
          example: {
            success: true,
            message: 'User role updated successfully',
            data: {
              companyUser: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                userId: '123e4567-e89b-12d3-a456-426614174001',
                companyId: '123e4567-e89b-12d3-a456-426614174003',
                roleId: '123e4567-e89b-12d3-a456-426614174010',
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T01:00:00.000Z'
              }
            },
            timestamp: '2024-01-01T01:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001/role',
              method: 'PUT',
              duration: 234
            }
          }
        },
        400: {
          description: 'Bad request - Validation error',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Role ID is required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001/role',
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
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001/role',
              method: 'PUT'
            }
          }
        },
        403: {
          description: 'Forbidden - Company Admin access required',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'Company Admin access required',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001/role',
              method: 'PUT'
            }
          }
        },
        404: {
          description: 'Not found - User or role not found',
          example: {
            success: false,
            error: 'NOT_FOUND',
            message: 'CompanyRole not found',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001/role',
              method: 'PUT'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update user role',
            timestamp: '2024-01-01T00:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/admin/users/123e4567-e89b-12d3-a456-426614174001/role',
              method: 'PUT'
            }
          }
        }
      }
    }
  ]
};
