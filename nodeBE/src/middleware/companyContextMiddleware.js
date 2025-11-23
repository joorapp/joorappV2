/**
 * @author Bhavesh Venugopal
 * Company Context Middleware
 * Loads active company context for authenticated sessions
 * Must run after authMiddleware (requires req.user)
 */

import { createRequestLogger, logError, logInfo, logDebug } from '../utils/logger.js';

/**
 * Company context middleware
 * Loads company from UserCompanyContext table based on session state
 * Sets req.company for use in route handlers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>}
 */
export const companyContextMiddleware = async (req, res, next) => {
  const requestId = req.id || `req-${Date.now()}`;
  const logger = createRequestLogger(
    requestId,
    req.user?.id || 'anonymous',
    req.ip || req.socket?.remoteAddress
  );

  try {
    // Check if user is authenticated (authMiddleware should have set req.user)
    if (!req.user) {
      // If no user, continue without company context
      req.company = null;
      return next();
    }

    const sessionState = req.user.sessionState;

    // If no session state, continue without company context
    if (!sessionState) {
      logDebug('No session state found, skipping company context', {
        requestId,
        userId: req.user.id
      });
      req.company = null;
      return next();
    }

    // Dynamically import models to avoid import-time database access
    const { UserCompanyContext, Company } = await import('../models/index.js');

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

    if (userCompanyContext && userCompanyContext.company) {
      // Company context found, attach to request
      req.company = {
        id: userCompanyContext.company.id,
        name: userCompanyContext.company.name,
        isActive: userCompanyContext.company.isActive
      };

      logDebug('Company context loaded', {
        requestId,
        userId: req.user.id,
        companyId: req.company.id,
        companyName: req.company.name
      });
    } else {
      // No company context found, set to null
      req.company = null;
      logDebug('No company context found for session', {
        requestId,
        userId: req.user.id,
        sessionState: sessionState
      });
    }

    next();
  } catch (error) {
    // Log error but don't fail the request
    // Company context is optional - routes can work without it
    logError('Company context middleware error', error, {
      requestId,
      userId: req.user?.id,
      path: req.path
    });

    // Set company to null on error and continue
    req.company = null;
    next();
  }
};

