/**
 * @author Bhavesh Venugopal
 * Auth Controller
 * Handles authentication and company selection endpoints
 */

import { loginUser, refreshToken as refreshTokenService, logoutUser } from '../../services/keycloakService.js';
import { createModuleLogger, logPerformance } from '../../utils/logger.js';
import { successResponse } from '../../utils/responseHelpers.js';
import { ValidationError, UnauthorizedError, AuthenticationFailedError, ForbiddenError, SessionError, BadRequestError } from '../../utils/errors.js';
import { validateRequired, validateUUID, validateEmail } from '../../utils/validators.js';
import { Op } from 'sequelize';

// Create module-specific logger
const logger = createModuleLogger('auth');

/**
 * Login user with credentials
 * Calls Keycloak to authenticate and returns tokens
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

    // Call Keycloak login service
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

    const duration = Date.now() - startTime;
    logPerformance('Login', duration, { requestId: req.id, email });

    logger.info('Login successful', {
      requestId: req.id,
      email: email,
      sessionState: loginResponse.data.session_state
    });

    // Remove session_state from response - it's sensitive and available in JWT token
    const { session_state, ...tokenData } = loginResponse.data;

    return res.status(200).json(
      successResponse('Login successful', tokenData, {}, req, startTime)
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
 * Get user's associated companies
 * Returns list of companies the authenticated user has access to
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getUserCompanies = async (req, res) => {
  const startTime = Date.now();

  try {
    // User should be attached by authMiddleware
    if (!req.user) {
      throw new UnauthorizedError('User not found in request', { requestId: req.id });
    }

    logger.info('Get user companies requested', {
      requestId: req.id,
      userId: req.user.id,
      email: req.user.email
    });

    // Dynamically import models to avoid import-time database access
    const { CompanyUser, Company, CompanyRole } = await import('../../models/index.js');

    // Find all companies user has access to
    const companyUsers = await CompanyUser.findAll({
      where: {
        userId: req.user.id,
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
          required: true
        },
        {
          model: CompanyRole,
          as: 'role',
          required: true
        }
      ]
    });

    // Format response
    const companies = companyUsers.map(cu => ({
      id: cu.company.id,
      name: cu.company.name,
      isActive: cu.company.isActive,
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
    logPerformance('GetUserCompanies', duration, {
      requestId: req.id,
      userId: req.user.id,
      count: companies.length
    });

    logger.info('User companies retrieved successfully', {
      requestId: req.id,
      userId: req.user.id,
      companyCount: companies.length
    });

    return res.status(200).json(
      successResponse('Companies retrieved successfully', companies, {}, req, startTime)
    );
  } catch (error) {
    logPerformance('GetUserCompanies', Date.now() - startTime, { requestId: req.id, error: true });
    logger.error('Get user companies error', error, {
      requestId: req.id,
      userId: req.user?.id
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
    const { CompanyUser, Company, CompanyRole, User, UserCompanyContext } = await import('../../models/index.js');

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
          required: true
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
        isActive: companyUser.company.isActive
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
      return res.status(400).json(
        errorResponse('Session state not found in token', 'SESSION_ERROR', 400, null, req)
      );
    }

    logger.info('Get current context requested', {
      requestId: req.id,
      userId: req.user.id,
      sessionState: sessionState
    });

    // Dynamically import models to avoid import-time database access
    const { UserCompanyContext, Company } = await import('../../models/index.js');

    // Find company context for this session
    const userCompanyContext = await UserCompanyContext.findOne({
      where: {
        keycloakSessionId: sessionState
      },
      include: [
        {
          model: Company,
          as: 'company',
          required: false
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
            isActive: userCompanyContext.company.isActive
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

