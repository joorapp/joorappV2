/**
 * @author Bhavesh Venugopal
 * Admin Module API Documentation
 * Documentation for administrative functions and user management endpoints
 */

export const adminDocs = {
  module: 'Admin',
  description: 'Administrative functions and system configuration',
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
    }
  ]
};
