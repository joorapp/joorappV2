/**
 * @author Bhavesh Venugopal
 * Auth Module API Documentation
 * Documentation for authentication and company selection endpoints
 */

export const authDocs = {
  module: 'Auth',
  description: 'Authentication and company context management endpoints',
  version: '1.0.0',
  endpoints: [
    {
      method: 'POST',
      path: '/api/v2/auth/login',
      description: 'Login user with email and password',
      access: 'Public',
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
            description: 'User password'
          }
        },
        example: {
          email: 'user@example.com',
          password: 'password123'
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          example: {
            success: true,
            message: 'Login successful',
            data: {
              access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...',
              refresh_token: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...',
              expires_in: 300,
              refresh_expires_in: 1800,
              token_type: 'Bearer'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/login',
              method: 'POST',
              duration: 245
            }
          }
        },
        400: {
          description: 'Validation error - missing email or password',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Email and password are required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/login',
              method: 'POST'
            }
          }
        },
        401: {
          description: 'Invalid credentials',
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
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred during login',
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
    {
      method: 'GET',
      path: '/api/v2/auth/companies',
      description: 'Get list of companies the authenticated user has access to',
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
          description: 'Companies retrieved successfully',
          example: {
            success: true,
            message: 'Companies retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440000',
                name: 'Company Name',
                isActive: true,
                role: {
                  id: '660e8400-e29b-41d4-a716-446655440001',
                  name: 'CompanyAdmin',
                  code: 'COMPANY_ADMIN',
                  description: 'Company administrator role'
                },
                companyUser: {
                  id: '770e8400-e29b-41d4-a716-446655440002',
                  isActive: true
                }
              }
            ],
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/companies',
              method: 'GET',
              duration: 156
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
              endpoint: '/api/v2/auth/companies',
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
              endpoint: '/api/v2/auth/companies',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v2/auth/companies/:companyId/select',
      description: 'Select company for current session',
      access: 'Protected (requires Bearer token)',
      pathParameters: {
        companyId: {
          type: 'UUID',
          required: true,
          description: 'Company ID to select'
        }
      },
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
          description: 'Company selected successfully (or switched if already had a company context)',
          example: {
            success: true,
            message: 'Company selected successfully',
            data: {
              company: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                name: 'Company Name',
                isActive: true
              },
              role: {
                id: '7a9d55d7-e89c-4cab-b30f-0d5d9fc2f7e7',
                name: 'CompanyAdmin',
                code: 'COMPANY_ADMIN',
                description: 'Company administrator with full access to company resources and management capabilities'
              },
              companyUser: {
                id: 'a67a8ca2-b721-43f2-b353-c31f470362a0',
                isActive: true
              },
              user: {
                id: 'cc71c2d3-f88d-44dd-a2c9-e42809296a92',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe'
              }
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/companies/550e8400-e29b-41d4-a716-446655440000/select',
              method: 'POST',
              duration: 189
            }
          }
        },
        400: {
          description: 'Validation error - invalid company ID format or missing session state',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid companyId format',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/companies/550e8400-e29b-41d4-a716-446655440000/select',
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
              endpoint: '/api/v2/auth/companies/550e8400-e29b-41d4-a716-446655440000/select',
              method: 'POST'
            }
          }
        },
        403: {
          description: 'User does not have access to this company',
          example: {
            success: false,
            error: 'FORBIDDEN',
            message: 'You do not have access to this company',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/companies/550e8400-e29b-41d4-a716-446655440000/select',
              method: 'POST'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while selecting company',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/companies/550e8400-e29b-41d4-a716-446655440000/select',
              method: 'POST'
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v2/auth/context',
      description: 'Get current company context for session',
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
          description: 'Company context retrieved successfully or no company selected',
          example: {
            success: true,
            message: 'Company context retrieved successfully',
            data: {
              company: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                name: 'Company Name',
                isActive: true
              }
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/context',
              method: 'GET',
              duration: 98
            }
          },
          exampleNoCompany: {
            success: true,
            message: 'No company selected',
            data: {
              company: null
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/context',
              method: 'GET',
              duration: 87
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
              endpoint: '/api/v2/auth/context',
              method: 'GET'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred while retrieving company context',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/context',
              method: 'GET'
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v2/auth/refresh',
      description: 'Refresh access token using refresh token',
      access: 'Public',
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          refresh_token: {
            type: 'string',
            required: true,
            description: 'Refresh token from login response'
          }
        },
        example: {
          refresh_token: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      responses: {
        200: {
          description: 'Token refreshed successfully',
          example: {
            success: true,
            message: 'Token refreshed successfully',
            data: {
              access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...',
              refresh_token: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...',
              expires_in: 300,
              refresh_expires_in: 1800,
              token_type: 'Bearer'
            },
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/refresh',
              method: 'POST',
              duration: 234
            }
          }
        },
        400: {
          description: 'Validation error - missing refresh token',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/refresh',
              method: 'POST'
            }
          }
        },
        401: {
          description: 'Refresh token expired or invalid',
          example: {
            success: false,
            error: 'TOKEN_EXPIRED',
            message: 'Invalid or expired refresh token',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/refresh',
              method: 'POST'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred during token refresh',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/refresh',
              method: 'POST'
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v2/auth/logout',
      description: 'Logout user and invalidate session',
      access: 'Protected (requires Bearer token)',
      headers: {
        Authorization: {
          type: 'string',
          required: true,
          description: 'Bearer token from login endpoint',
          example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      requestBody: {
        required: true,
        contentType: 'application/json',
        schema: {
          refresh_token: {
            type: 'string',
            required: true,
            description: 'Refresh token to invalidate the specific session in Keycloak. Required for proper session invalidation (e.g., logout from Browser B while Browser A session continues).'
          }
        },
        example: {
          refresh_token: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ...'
        }
      },
      responses: {
        200: {
          description: 'Logout successful',
          example: {
            success: true,
            message: 'Logout successful',
            data: null,
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/logout',
              method: 'POST',
              duration: 167
            }
          }
        },
        400: {
          description: 'Validation error - refresh_token is required',
          example: {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'refresh_token is required',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/logout',
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
              endpoint: '/api/v2/auth/logout',
              method: 'POST'
            }
          }
        },
        500: {
          description: 'Internal server error',
          example: {
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred during logout',
            timestamp: '2024-11-23T12:00:00.000Z',
            meta: {
              requestId: 'req-1234567890',
              endpoint: '/api/v2/auth/logout',
              method: 'POST'
            }
          }
        }
      }
    }
  ]
};

