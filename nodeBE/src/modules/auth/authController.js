/**
 * @author Bhavesh Venugopal
 * Auth Controller
 * Handles authentication and company selection endpoints
 */

import { loginUser, refreshToken as refreshTokenService, logoutUser, verifyToken, getUserFromToken } from '../../services/keycloakService.js';
import { createModuleLogger, logPerformance, logInfo, logError } from '../../utils/logger.js';
import { successResponse } from '../../utils/responseHelpers.js';
import { ValidationError, UnauthorizedError, AuthenticationFailedError, ForbiddenError, SessionError, BadRequestError } from '../../utils/errors.js';
import { validateRequired, validateUUID, validateEmail } from '../../utils/validators.js';
import { isSuperAdmin } from '../../constants/keycloakRoles.js';
import { Op } from 'sequelize';

// Create module-specific logger
const logger = createModuleLogger('auth');

/**
 * Sync user from Keycloak token to database
 * Creates or updates user record based on Keycloak data
 * @param {Object} userInfo - User information from token
 * @returns {Promise<User>} User instance
 */
const syncUserFromKeycloak = async (userInfo) => {
  try {
    // Dynamically import models to avoid import-time database access
    const { User, CompanyUser, Company, CompanyRole } = await import('../../models/index.js');
    
    // Find existing user by Keycloak ID
    let user = await User.findOne({
      where: {
        keycloakId: userInfo.keycloakId
      }
    });

    if (user) {
      // Update existing user
      user.email = userInfo.email;
      user.firstName = userInfo.firstName;
      user.lastName = userInfo.lastName;
      user.keycloakGlobalRole = userInfo.keycloakGlobalRole;
      user.lastLoginAt = new Date();
      await user.save();

      logInfo('User updated from Keycloak', {
        userId: user.id,
        keycloakId: userInfo.keycloakId,
        role: userInfo.keycloakGlobalRole
      });
    } else {
      // Create new user
      user = await User.create({
        keycloakId: userInfo.keycloakId,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        keycloakGlobalRole: userInfo.keycloakGlobalRole,
        isActive: true,
        lastLoginAt: new Date()
      });

      logInfo('User created from Keycloak', {
        userId: user.id,
        keycloakId: userInfo.keycloakId,
        role: userInfo.keycloakGlobalRole
      });
    }

    // If user is SUPER_ADMIN, ensure they're linked to "JOOR APP" company
    if (isSuperAdmin(userInfo.keycloakGlobalRole)) {
      try {
        const joorAppCompany = await Company.findOne({
          where: {
            name: 'JOOR APP',
            isDeleted: false
          }
        });

        if (joorAppCompany) {
          const companyRole = await CompanyRole.findOne({
            where: {
              name: 'CompanyAdmin',
              isDeleted: false
            }
          });

          if (companyRole) {
            const existingLink = await CompanyUser.findOne({
              where: {
                userId: user.id,
                companyId: joorAppCompany.id,
                isDeleted: false
              }
            });

            if (!existingLink) {
              await CompanyUser.create({
                userId: user.id,
                companyId: joorAppCompany.id,
                companyRoleId: companyRole.id,
                isActive: true
              }, {
                context: {
                  userId: user.id,
                  companyId: joorAppCompany.id
                }
              });

              logInfo('SUPER_ADMIN user linked to JOOR APP company', {
                userId: user.id,
                companyId: joorAppCompany.id
              });
            }
          }
        }
      } catch (linkError) {
        logError('Failed to link SUPER_ADMIN to JOOR APP company', linkError);
        // Don't throw - this is not critical for login
      }
    }

    return user;
  } catch (error) {
    logError('Failed to sync user from Keycloak', error);
    throw error;
  }
};

/**
 * Login user with credentials
 * Authenticates with Keycloak, syncs user to database, fetches companies, and returns tokens with user data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const login = async (req, res) => {
  const startTime = Date.now();

  try {
    const { email, password } = req.body;

    // Validate request body
    validateRequired({ email, password }, req.id);
    validateEmail(email, 'email', req.id);

    logger.info('Login attempt', {
      requestId: req.id,
      email: email,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Step 1: Call Keycloak login service
    const loginResponse = await loginUser(email, password);

    if (!loginResponse.success) {
      logger.warn('Login failed', {
        requestId: req.id,
        email: email,
        error: loginResponse.error
      });
      throw new AuthenticationFailedError(
        loginResponse.details || 'Invalid credentials',
        { requestId: req.id, email, error: loginResponse.error }
      );
    }

    // Step 2: Decode access token to extract user information
    const verifyResponse = await verifyToken(loginResponse.data.access_token);
    if (!verifyResponse.success) {
      logger.error('Token verification failed after login', {
        requestId: req.id,
        email: email,
        error: verifyResponse.error
      });
      throw new AuthenticationFailedError(
        'Failed to verify login token',
        { requestId: req.id, email, error: verifyResponse.error }
      );
    }

    // Step 3: Extract user info from decoded token
    const userInfoResponse = getUserFromToken(verifyResponse.decoded);
    if (!userInfoResponse.success) {
      logger.error('Failed to extract user from token', {
        requestId: req.id,
        email: email,
        error: userInfoResponse.error
      });
      throw new AuthenticationFailedError(
        'Failed to extract user information from token',
        { requestId: req.id, email, error: userInfoResponse.error }
      );
    }

    const userInfo = userInfoResponse.user;

    // Step 4: Sync user to database
    const user = await syncUserFromKeycloak(userInfo);

    // Step 5: Fetch user's companies
    const { CompanyUser, Company, CompanyRole, Plan } = await import('../../models/index.js');
    
    const companyUsers = await CompanyUser.findAll({
      where: {
        userId: user.id,
        isActive: true,
        isDeleted: false
      },
      include: [
        {
          model: Company,
          as: 'company',
          where: {
            isDeleted: false
          },
          required: true,
          include: [
            {
              model: Plan,
              as: 'plan',
              required: false
            }
          ]
        },
        {
          model: CompanyRole,
          as: 'role',
          required: true
        }
      ]
    });

    // Format companies response
    const companies = companyUsers.map(cu => ({
      id: cu.company.id,
      name: cu.company.name,
      description: cu.company.description,
      isActive: cu.company.isActive,
      status: cu.company.status,
      email: cu.company.email,
      phone: cu.company.phone,
      buildingAddress: cu.company.buildingAddress,
      streetAddress: cu.company.streetAddress,
      city: cu.company.city,
      state: cu.company.state,
      postalCode: cu.company.postalCode,
      country: cu.company.country,
      plan: cu.company.plan ? {
        id: cu.company.plan.id,
        name: cu.company.plan.name,
        code: cu.company.plan.code,
        description: cu.company.plan.description,
        price: parseFloat(cu.company.plan.price) || 0.00,
        isActive: cu.company.plan.isActive,
        createdDate: cu.company.plan.createdDate,
        updatedDate: cu.company.plan.updatedDate,
        version: cu.company.plan.version
      } : null,
      role: {
        id: cu.role.id,
        name: cu.role.name,
        code: cu.role.code,
        description: cu.role.description
      },
      companyUser: {
        id: cu.id,
        isActive: cu.isActive
      }
    }));

    const duration = Date.now() - startTime;
    logPerformance('Login', duration, { requestId: req.id, email });

    logger.info('Login successful', {
      requestId: req.id,
      email: email,
      userId: user.id,
      keycloakGlobalRole: userInfo.keycloakGlobalRole,
      companyCount: companies.length
    });

    // Remove session_state from response - it's sensitive and available in JWT token
    const { session_state, ...tokenData } = loginResponse.data;

    // Combine token data with user role and companies
    const responseData = {
      ...tokenData,
      keycloak_global_role: userInfo.keycloakGlobalRole,
      companies: companies
    };

    return res.status(200).json(
      successResponse('Login successful', responseData, {}, req, startTime)
    );
  } catch (error) {
    logPerformance('Login', Date.now() - startTime, { requestId: req.id, error: true });
    logger.error('Login error', error, {
      requestId: req.id,
      email: req.body?.email
    });

    // Re-throw to let errorHandler handle
    throw error;
  }
};


/**
 * Select company for current session
 * Creates or updates UserCompanyContext entry linking session to company
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const selectCompany = async (req, res) => {
  const startTime = Date.now();

  try {
    // User should be attached by authMiddleware
    if (!req.user) {
      throw new UnauthorizedError('User not found in request', { requestId: req.id });
    }

    const { companyId } = req.params;
    const sessionState = req.user.sessionState;

    // Validate companyId format (UUID)
    validateUUID(companyId, 'companyId', req.id);

    if (!sessionState) {
      logger.warn('Missing session state', {
        requestId: req.id,
        userId: req.user.id
      });
      throw new SessionError('Session state not found in token', { requestId: req.id, userId: req.user.id });
    }

    logger.info('Company selection requested', {
      requestId: req.id,
      userId: req.user.id,
      companyId: companyId,
      sessionState: sessionState
    });

    // Dynamically import models to avoid import-time database access
    const { CompanyUser, Company, CompanyRole, User, UserCompanyContext, Plan } = await import('../../models/index.js');

    // Validate user has access to this company
    const companyUser = await CompanyUser.findOne({
      where: {
        userId: req.user.id,
        companyId: companyId,
        isActive: true,
        isDeleted: false
      },
      include: [
        {
          model: Company,
          as: 'company',
          where: {
            isDeleted: false
          },
          required: true,
          include: [
            {
              model: Plan,
              as: 'plan',
              required: false
            }
          ]
        },
        {
          model: CompanyRole,
          as: 'role',
          required: true
        },
        {
          model: User,
          as: 'user',
          required: true
        }
      ]
    });

    if (!companyUser) {
      logger.warn('User attempted to select unauthorized company', {
        requestId: req.id,
        userId: req.user.id,
        companyId: companyId
      });
      throw new ForbiddenError('You do not have access to this company', { requestId: req.id, userId: req.user.id, companyId });
    }

    // Create or update UserCompanyContext entry
    const [userCompanyContext, created] = await UserCompanyContext.findOrCreate({
      where: {
        keycloakSessionId: sessionState
      },
      defaults: {
        companyId: companyId
      }
    });

    // Track if this is a switch (entry existed with different company)
    const previousCompanyId = userCompanyContext.companyId;
    const isSwitching = !created && previousCompanyId !== companyId;

    // Always update companyId (even if same - ensures consistency)
    if (!created) {
      userCompanyContext.companyId = companyId;
      await userCompanyContext.save();
    }

    // Format response data
    const responseData = {
      company: {
        id: companyUser.company.id,
        name: companyUser.company.name,
        description: companyUser.company.description,
        isActive: companyUser.company.isActive,
        status: companyUser.company.status,
        email: companyUser.company.email,
        phone: companyUser.company.phone,
        buildingAddress: companyUser.company.buildingAddress,
        streetAddress: companyUser.company.streetAddress,
        city: companyUser.company.city,
        state: companyUser.company.state,
        postalCode: companyUser.company.postalCode,
        country: companyUser.company.country,
        logo: companyUser.company.logo,
        plan: companyUser.company.plan ? {
          id: companyUser.company.plan.id,
          name: companyUser.company.plan.name,
          code: companyUser.company.plan.code,
          description: companyUser.company.plan.description,
          price: parseFloat(companyUser.company.plan.price) || 0.00,
          isActive: companyUser.company.plan.isActive,
          createdDate: companyUser.company.plan.createdDate,
          updatedDate: companyUser.company.plan.updatedDate,
          version: companyUser.company.plan.version
        } : null
      },
      role: {
        id: companyUser.role.id,
        name: companyUser.role.name,
        code: companyUser.role.code,
        description: companyUser.role.description
      },
      companyUser: {
        id: companyUser.id,
        isActive: companyUser.isActive
      },
      user: {
        id: companyUser.user.id,
        email: companyUser.user.email,
        firstName: companyUser.user.firstName,
        lastName: companyUser.user.lastName
      }
    };

    const duration = Date.now() - startTime;
    logPerformance('SelectCompany', duration, {
      requestId: req.id,
      userId: req.user.id,
      companyId: companyId
    });

    // Enhanced logging
    if (isSwitching) {
      logger.info('Company switched', {
        requestId: req.id,
        userId: req.user.id,
        previousCompanyId: previousCompanyId,
        newCompanyId: companyId,
        companyName: companyUser.company.name
      });
    } else if (created) {
      logger.info('Company selected (initial)', {
        requestId: req.id,
        userId: req.user.id,
        companyId: companyId,
        companyName: companyUser.company.name
      });
    } else {
      logger.info('Company re-selected (same company)', {
        requestId: req.id,
        userId: req.user.id,
        companyId: companyId,
        companyName: companyUser.company.name
      });
    }

    return res.status(200).json(
      successResponse(
        isSwitching ? 'Company switched successfully' : 'Company selected successfully',
        responseData,
        {},
        req,
        startTime
      )
    );
  } catch (error) {
    logPerformance('SelectCompany', Date.now() - startTime, { requestId: req.id, error: true });
    logger.error('Select company error', error, {
      requestId: req.id,
      userId: req.user?.id,
      companyId: req.params?.companyId
    });

    // Re-throw to let errorHandler handle
    throw error;
  }
};

/**
 * Get current company context
 * Returns the currently selected company for the session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getCurrentContext = async (req, res) => {
  const startTime = Date.now();

  try {
    // User should be attached by authMiddleware
    if (!req.user) {
      throw new UnauthorizedError('User not found in request', { requestId: req.id });
    }

    const sessionState = req.user.sessionState;

    if (!sessionState) {
      throw new SessionError('Session state not found in token', { requestId: req.id, userId: req.user.id });
    }

    logger.info('Get current context requested', {
      requestId: req.id,
      userId: req.user.id,
      sessionState: sessionState
    });

    // Dynamically import models to avoid import-time database access
    const { UserCompanyContext, Company, Plan } = await import('../../models/index.js');

    // Find company context for this session
    const userCompanyContext = await UserCompanyContext.findOne({
      where: {
        keycloakSessionId: sessionState
      },
      include: [
        {
          model: Company,
          as: 'company',
          required: false,
          include: [
            {
              model: Plan,
              as: 'plan',
              required: false
            }
          ]
        }
      ]
    });

    const duration = Date.now() - startTime;
    logPerformance('GetCurrentContext', duration, { requestId: req.id, userId: req.user.id });

    if (!userCompanyContext || !userCompanyContext.company) {
      logger.info('No company context found', {
        requestId: req.id,
        userId: req.user.id
      });
      return res.status(200).json(
        successResponse('No company selected', { company: null }, {}, req, startTime)
      );
    }

    logger.info('Company context retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyId: userCompanyContext.company.id
    });

    return res.status(200).json(
      successResponse(
        'Company context retrieved successfully',
        {
          company: {
            id: userCompanyContext.company.id,
            name: userCompanyContext.company.name,
            description: userCompanyContext.company.description,
            isActive: userCompanyContext.company.isActive,
            status: userCompanyContext.company.status,
            email: userCompanyContext.company.email,
            phone: userCompanyContext.company.phone,
            buildingAddress: userCompanyContext.company.buildingAddress,
            streetAddress: userCompanyContext.company.streetAddress,
            city: userCompanyContext.company.city,
            state: userCompanyContext.company.state,
            postalCode: userCompanyContext.company.postalCode,
            country: userCompanyContext.company.country,
            plan: userCompanyContext.company.plan ? {
              id: userCompanyContext.company.plan.id,
              name: userCompanyContext.company.plan.name,
              code: userCompanyContext.company.plan.code,
              description: userCompanyContext.company.plan.description,
              price: parseFloat(userCompanyContext.company.plan.price) || 0.00,
              isActive: userCompanyContext.company.plan.isActive,
              createdDate: userCompanyContext.company.plan.createdDate,
              updatedDate: userCompanyContext.company.plan.updatedDate,
              version: userCompanyContext.company.plan.version
            } : null
          }
        },
        {},
        req,
        startTime
      )
    );
  } catch (error) {
    logPerformance('GetCurrentContext', Date.now() - startTime, { requestId: req.id, error: true });
    logger.error('Get current context error', error, {
      requestId: req.id,
      userId: req.user?.id
    });

    // Re-throw to let errorHandler handle
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 * Returns new access_token and refresh_token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const refreshToken = async (req, res) => {
  const startTime = Date.now();

  try {
    const { refresh_token } = req.body;

    // Validate request body
    validateRequired({ refresh_token }, req.id);

    logger.info('Token refresh attempt', {
      requestId: req.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Call Keycloak refresh service
    const refreshResponse = await refreshTokenService(refresh_token);

    if (!refreshResponse.success) {
      logger.warn('Token refresh failed', {
        requestId: req.id,
        error: refreshResponse.error
      });
      
      // Determine appropriate error type
      if (refreshResponse.error === 'Refresh token expired') {
        throw new AuthenticationFailedError(
          refreshResponse.details || 'Refresh token expired',
          { requestId: req.id, error: refreshResponse.error }
        );
      } else {
        throw new BadRequestError(
          refreshResponse.details || 'Invalid refresh token',
          { error: refreshResponse.error },
          { requestId: req.id }
        );
      }
    }

    const duration = Date.now() - startTime;
    logPerformance('RefreshToken', duration, { requestId: req.id });

    logger.info('Token refresh successful', {
      requestId: req.id,
      sessionState: refreshResponse.data.session_state
    });

    // Remove session_state from response - it's sensitive and available in JWT token
    const { session_state, ...tokenData } = refreshResponse.data;

    return res.status(200).json(
      successResponse('Token refreshed successfully', tokenData, {}, req, startTime)
    );
  } catch (error) {
    logPerformance('RefreshToken', Date.now() - startTime, { requestId: req.id, error: true });
    logger.error('Token refresh error', error, {
      requestId: req.id
    });

    // Re-throw to let errorHandler handle
    throw error;
  }
};

/**
 * Logout user and invalidate session
 * Invalidates Keycloak session and cleans up UserCompanyContext
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const logout = async (req, res) => {
  const startTime = Date.now();

  try {
    // User should be attached by authMiddleware
    if (!req.user) {
      throw new UnauthorizedError('User not found in request', { requestId: req.id });
    }

    const { refresh_token } = req.body;
    const sessionState = req.user.sessionState;

    // Refresh token is required for proper session invalidation in Keycloak
    // Without it, we cannot invalidate the specific session (e.g., Browser B while Browser A continues)
    validateRequired({ refresh_token }, req.id);

    logger.info('Logout attempt', {
      requestId: req.id,
      userId: req.user.id,
      email: req.user.email,
      sessionState: sessionState,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Call Keycloak logout to invalidate the specific session
    const logoutResponse = await logoutUser(refresh_token);
    if (!logoutResponse.success) {
      logger.warn('Keycloak logout failed, but continuing with cleanup', {
        requestId: req.id,
        userId: req.user.id,
        error: logoutResponse.error
      });
      // Continue with cleanup even if Keycloak logout fails
    }

    // Clean up UserCompanyContext if session state available
    if (sessionState) {
      try {
        // Dynamically import models to avoid import-time database access
        const { UserCompanyContext } = await import('../../models/index.js');

        const deletedCount = await UserCompanyContext.destroy({
          where: {
            keycloakSessionId: sessionState
          }
        });

        logger.info('UserCompanyContext cleaned up', {
          requestId: req.id,
          userId: req.user.id,
          sessionState: sessionState,
          deletedCount: deletedCount
        });
      } catch (cleanupError) {
        logger.error('Failed to cleanup UserCompanyContext', cleanupError, {
          requestId: req.id,
          userId: req.user.id,
          sessionState: sessionState
        });
        // Don't fail logout if cleanup fails
      }
    }

    const duration = Date.now() - startTime;
    logPerformance('Logout', duration, {
      requestId: req.id,
      userId: req.user.id
    });

    logger.info('Logout successful', {
      requestId: req.id,
      userId: req.user.id,
      email: req.user.email
    });

    return res.status(200).json(
      successResponse('Logout successful', null, {}, req, startTime)
    );
  } catch (error) {
    logPerformance('Logout', Date.now() - startTime, { requestId: req.id, error: true });
    logger.error('Logout error', error, {
      requestId: req.id,
      userId: req.user?.id
    });

    // Re-throw to let errorHandler handle
    throw error;
  }
};

