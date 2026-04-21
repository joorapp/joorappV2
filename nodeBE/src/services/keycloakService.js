/**
 * @author Bhavesh Venugopal
 * Keycloak Service
 * Handles Keycloak operations: token verification, public key fetching, admin client operations
 */

import KcAdminClient from '@keycloak/keycloak-admin-client';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';
import { createModuleLogger, logError, logInfo, logDebug } from '../utils/logger.js';

const logger = createModuleLogger('keycloak');

/**
 * Validate required Keycloak environment variables
 * @returns {Object} Configuration object with validated values
 * @throws {Error} If required environment variables are missing
 */
const validateAndGetConfig = () => {
  const requiredEnvVars = ['KEYCLOAK_URL', 'KEYCLOAK_REALM', 'KEYCLOAK_CLIENT_ID', 'KEYCLOAK_CLIENT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logError('Missing required Keycloak environment variables', null, { missingVars });
    throw new Error(`Missing required Keycloak environment variables: ${missingVars.join(', ')}`);
  }

  return {
    KEYCLOAK_URL: process.env.KEYCLOAK_URL,
    KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET
  };
};

// Public key cache
let publicKeyCache = {
  key: null,
  pem: null,
  expiresAt: null,
  ttl: 60 * 60 * 1000 // 1 hour in milliseconds
};

// Keycloak admin client instance (client_credentials; access token has finite lifetime)
let kcAdminClient = null;

/** Wall-clock ms when the current admin access token expires (from JWT `exp`). */
let adminTokenExpiryTimeMs = null;

/** Proactive refresh: re-auth this many ms before Keycloak expires the access token (clock drift safety net). */
const ADMIN_TOKEN_REFRESH_BUFFER_MS = 60_000;

/** In-flight admin auth promise so concurrent callers share one `auth()` (single-flight). */
let adminAuthInFlight = null;

/**
 * Derive absolute expiry time from the admin access token JWT (`exp` claim).
 * Matches Keycloak's `expires_in` semantics; `auth()` does not expose `expires_in` to callers.
 *
 * @param {string|undefined} accessToken - Bearer access token from Keycloak
 * @returns {number | null} Expiry as epoch milliseconds, or null if not decodable
 */
const getAdminTokenExpiryTimeMs = (accessToken) => {
  if (!accessToken) {
    return null;
  }
  const decoded = jwt.decode(accessToken);
  if (!decoded || typeof decoded.exp !== 'number') {
    return null;
  }
  return decoded.exp * 1000;
};

/**
 * True if cached client should still be used (token exists and is not within refresh buffer of expiry).
 *
 * @returns {boolean}
 */
const isAdminClientTokenFresh = () => {
  if (!kcAdminClient || adminTokenExpiryTimeMs == null) {
    return false;
  }
  return Date.now() < adminTokenExpiryTimeMs - ADMIN_TOKEN_REFRESH_BUFFER_MS;
};

/**
 * Run client_credentials auth, set `kcAdminClient` + `adminTokenExpiryTimeMs` together (single update site).
 *
 * @returns {Promise<KcAdminClient>} Authenticated admin client
 */
const authenticateAdminClientOnce = async () => {
  const config = validateAndGetConfig();

  const client = new KcAdminClient({
    baseUrl: config.KEYCLOAK_URL,
    realmName: config.KEYCLOAK_REALM
  });

  await client.auth({
    grantType: 'client_credentials',
    clientId: config.KEYCLOAK_CLIENT_ID,
    clientSecret: config.KEYCLOAK_CLIENT_SECRET
  });

  let expiryMs = getAdminTokenExpiryTimeMs(client.accessToken);

  if (expiryMs == null) {
    logger.warn(
      'Admin access token missing exp claim; using 60s fallback — verify Keycloak client_credentials tokens'
    );
    expiryMs = Date.now() + 60_000;
  }

  kcAdminClient = client;
  adminTokenExpiryTimeMs = expiryMs;

  logger.info('Keycloak admin client authenticated successfully', {
    tokenExpiresAt: new Date(adminTokenExpiryTimeMs).toISOString(),
    refreshBufferSeconds: ADMIN_TOKEN_REFRESH_BUFFER_MS / 1000
  });

  return kcAdminClient;
};

/**
 * Initialize Keycloak admin client with proactive token refresh and single-flight re-auth.
 *
 * @returns {Promise<KcAdminClient>} Authenticated admin client
 */
const initializeAdminClient = async () => {
  if (isAdminClientTokenFresh()) {
    return kcAdminClient;
  }

  if (adminAuthInFlight) {
    return adminAuthInFlight;
  }

  adminAuthInFlight = (async () => {
    try {
      return await authenticateAdminClientOnce();
    } catch (error) {
      logError('Failed to authenticate Keycloak admin client', error);
      kcAdminClient = null;
      adminTokenExpiryTimeMs = null;
      throw new Error(`Keycloak admin client authentication failed: ${error.message}`);
    } finally {
      adminAuthInFlight = null;
    }
  })();

  return adminAuthInFlight;
};

/**
 * Get Keycloak realm public key (JWK)
 * Fetches the public key from Keycloak's JWKS endpoint
 * @returns {Promise<Object>} Public key in JWK format
 */
const fetchPublicKey = async () => {
  try {
    const config = validateAndGetConfig();
    const jwksUrl = `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/certs`;
    logger.debug('Fetching public key from Keycloak', { jwksUrl });

    const response = await axios.get(jwksUrl);
    const keys = response.data.keys;

    if (!keys || keys.length === 0) {
      throw new Error('No public keys found in Keycloak JWKS response');
    }

    // Find the RSA key (Keycloak typically uses RS256)
    const rsaKey = keys.find(key => key.kty === 'RSA' && key.use === 'sig');
    if (!rsaKey) {
      throw new Error('No RSA signing key found in Keycloak JWKS response');
    }

    logger.debug('Public key fetched successfully', { kid: rsaKey.kid });
    return rsaKey;
  } catch (error) {
    logError('Failed to fetch public key from Keycloak', error);
    throw new Error('Failed to fetch Keycloak public key');
  }
};

/**
 * Get Keycloak public key in PEM format
 * Caches the public key to reduce API calls
 * @returns {Promise<string>} Public key in PEM format
 */
export const getPublicKey = async () => {
  try {
    // Check cache
    if (publicKeyCache.pem && publicKeyCache.expiresAt && Date.now() < publicKeyCache.expiresAt) {
      logger.debug('Using cached public key');
      return {
        success: true,
        publicKey: publicKeyCache.key,
        publicKeyPem: publicKeyCache.pem
      };
    }

    // Fetch new public key
    logger.info('Fetching new public key from Keycloak');
    const jwk = await fetchPublicKey();

    // Convert JWK to PEM
    const pem = jwkToPem(jwk);

    // Update cache
    publicKeyCache = {
      ...publicKeyCache,
      key: jwk,
      pem: pem,
      expiresAt: Date.now() + publicKeyCache.ttl
    };

    logger.info('Public key cached successfully', { expiresAt: new Date(publicKeyCache.expiresAt).toISOString() });

    return {
      success: true,
      publicKey: jwk,
      publicKeyPem: pem
    };
  } catch (error) {
    logError('Failed to get public key', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clear public key cache
 * Useful when key rotation is detected
 * @returns {void}
 */
export const clearPublicKeyCache = () => {
  publicKeyCache = {
    key: null,
    pem: null,
    expiresAt: null,
    ttl: 60 * 60 * 1000
  };
  logger.info('Public key cache cleared');
};

/**
 * Verify JWT token using Keycloak public key
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded token payload if valid, error if invalid
 */
export const verifyToken = async (token) => {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Token is required'
      };
    }

    // Get public key
    const keyResponse = await getPublicKey();
    if (!keyResponse.success) {
      return {
        success: false,
        error: 'Failed to get Keycloak public key',
        details: keyResponse.error
      };
    }

    // Verify token
    const config = validateAndGetConfig();
    const decoded = jwt.verify(token, keyResponse.publicKeyPem, {
      algorithms: ['RS256'],
      issuer: `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}`,
      audience: 'account'
    });

    logger.debug('Token verified successfully', { 
      sub: decoded.sub,
      email: decoded.email,
      roles: decoded.realm_access?.roles 
    });

    return {
      success: true,
      decoded: decoded
    };
  } catch (error) {
    // Clear cache on verification failure (might be key rotation)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      clearPublicKeyCache();
    }

    logError('Token verification failed', error);

    if (error.name === 'JsonWebTokenError') {
      return {
        success: false,
        error: 'Invalid token',
        details: error.message
      };
    }

    if (error.name === 'TokenExpiredError') {
      return {
        success: false,
        error: 'Token expired',
        details: error.message
      };
    }

    if (error.name === 'NotBeforeError') {
      return {
        success: false,
        error: 'Token not active yet',
        details: error.message
      };
    }

    return {
      success: false,
      error: 'Token verification failed',
      details: error.message
    };
  }
};

/**
 * Extract user information from verified token
 * @param {Object} decodedToken - Decoded JWT token payload
 * @returns {Object} User information extracted from token
 */
export const getUserFromToken = (decodedToken) => {
  try {
    const userInfo = {
      keycloakId: decodedToken.sub,
      email: decodedToken.email || decodedToken.preferred_username,
      firstName: decodedToken.given_name || decodedToken.name?.split(' ')[0],
      lastName: decodedToken.family_name || decodedToken.name?.split(' ').slice(1).join(' '),
      sessionState: decodedToken.sid || decodedToken.session_state,
      roles: decodedToken.realm_access?.roles || [],
      keycloakGlobalRole: null // Will be mapped from roles
    };

    // Map Keycloak realm roles to global role enum
    // Valid global roles: SUPER_ADMIN, COMPANY_ADMIN, COMPANY_USER
    if (userInfo.roles.includes('SUPER_ADMIN')) {
      userInfo.keycloakGlobalRole = 'SUPER_ADMIN';
    } else if (userInfo.roles.includes('COMPANY_ADMIN')) {
      userInfo.keycloakGlobalRole = 'COMPANY_ADMIN';
    } else if (userInfo.roles.includes('COMPANY_USER')) {
      userInfo.keycloakGlobalRole = 'COMPANY_USER';
    } else {
      // Default to COMPANY_USER if no valid role found
      userInfo.keycloakGlobalRole = 'COMPANY_USER';
      logger.warn('No valid global role found in token, defaulting to COMPANY_USER', {
        roles: userInfo.roles,
        keycloakId: userInfo.keycloakId
      });
    }

    return {
      success: true,
      user: userInfo
    };
  } catch (error) {
    logError('Failed to extract user from token', error);
    return {
      success: false,
      error: 'Failed to extract user information from token',
      details: error.message
    };
  }
};

/**
 * Get authenticated Keycloak admin client
 * @returns {Promise<KcAdminClient>} Authenticated admin client
 */
export const getAdminClient = async () => {
  try {
    return await initializeAdminClient();
  } catch (error) {
    logError('Failed to get Keycloak admin client', error);
    throw error;
  }
};

/**
 * Serialize a Keycloak Admin API error for logs (Fetch `NetworkError`, Axios, or plain `Error`).
 * Avoids assuming a single error shape; safe for production diagnostics.
 *
 * @param {unknown} error - Caught error
 * @returns {string}
 */
export const formatKeycloakAdminErrorForLog = (error) => {
  if (error == null) {
    return String(error);
  }
  if (typeof error !== 'object') {
    return String(error);
  }
  const parts = [];
  const err = /** @type {Record<string, unknown>} */ (error);
  if (typeof err.name === 'string') {
    parts.push(`name=${err.name}`);
  }
  if (typeof err.message === 'string') {
    parts.push(`message=${err.message}`);
  }
  const rawStatus = err.response?.status ?? err.responseStatus;
  if (rawStatus != null && rawStatus !== '') {
    parts.push(`httpStatus=${String(rawStatus)}`);
  }
  if (err.responseData != null) {
    try {
      const data = err.responseData;
      const s =
        typeof data === 'string' ? data : JSON.stringify(data);
      parts.push(`responseData=${s.length > 800 ? `${s.slice(0, 800)}…` : s}`);
    } catch {
      parts.push('responseData=[unserializable]');
    }
  }
  return parts.length > 0 ? parts.join(' | ') : String(error);
};

/**
 * True if an error from Keycloak Admin HTTP layer represents 401 Unauthorized.
 * Defense in depth: HTTP status (Axios or Fetch `Response`) and message fallback — production
 * logs have shown plain `Error`-shaped messages without a reliable `.response.status` check.
 *
 * @param {unknown} error - Caught error
 * @returns {boolean}
 */
export const isAdminApiUnauthorized = (error) => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const err = /** @type {Record<string, unknown>} */ (error);
  const rawStatus = err.response?.status ?? err.responseStatus;
  if (rawStatus != null && rawStatus !== '') {
    const statusNum = Number(rawStatus);
    if (!Number.isNaN(statusNum) && statusNum === 401) {
      return true;
    }
  }
  const msg = typeof err.message === 'string' ? err.message : '';
  if (msg.includes('401') || msg.includes('Unauthorized')) {
    return true;
  }
  return false;
};

/**
 * Run a callback with an authenticated Keycloak admin client.
 * On 401 (e.g. server-side session idle while JWT `exp` still valid), clears the cached client,
 * re-authenticates with `client_credentials`, and retries the callback exactly once.
 *
 * @param {(client: import('@keycloak/keycloak-admin-client').default) => Promise<*>} task - Admin API work
 * @returns {Promise<*>} Result of `task`
 * @throws {Error} Propagates non-401 errors, or the last error if retry also fails
 */
export const executeAdminTask = async (task) => {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const client = await initializeAdminClient();
    try {
      const result = await task(client);
      if (attempt === 1) {
        logger.info(
          'Keycloak admin operation succeeded after re-authentication (401 retry path).',
          {
            event: 'KEYCLOAK_ADMIN_401_RETRY_SUCCESS',
            attempt: 2
          }
        );
      }
      return result;
    } catch (error) {
      lastError = error;
      const keycloakErrorSummary = formatKeycloakAdminErrorForLog(error);
      if (attempt === 0 && isAdminApiUnauthorized(error)) {
        logger.warn(
          'Keycloak admin API returned 401 — treating as unauthorized; clearing cached client and re-authenticating with client_credentials, then retrying the operation once.',
          {
            event: 'KEYCLOAK_ADMIN_401_RETRY',
            phase: 'reauth_before_retry',
            attempt: 1,
            maxAttempts: 2,
            willRetryOnce: true,
            httpStatus: error?.response?.status ?? error?.responseStatus,
            keycloakErrorSummary
          }
        );
        logger.warn(
          'KEYCLOAK_ADMIN_401_RETRY: retry attempt starting (same admin task after fresh auth).',
          {
            event: 'KEYCLOAK_ADMIN_401_RETRY',
            phase: 'retry_start',
            keycloakErrorSummary
          }
        );
        kcAdminClient = null;
        adminTokenExpiryTimeMs = null;
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

/**
 * Test Keycloak connection
 * @returns {Promise<Object>} Connection test result
 */
export const testConnection = async () => {
  try {
    const publicKeyResponse = await getPublicKey();
    if (!publicKeyResponse.success) {
      return {
        success: false,
        error: 'Failed to fetch public key',
        details: publicKeyResponse.error
      };
    }

    const adminClient = await getAdminClient();
    if (!adminClient) {
      return {
        success: false,
        error: 'Failed to authenticate admin client'
      };
    }

    return {
      success: true,
      message: 'Keycloak connection successful'
    };
  } catch (error) {
    logError('Keycloak connection test failed', error);
    return {
      success: false,
      error: 'Keycloak connection test failed',
      details: error.message
    };
  }
};

/**
 * Login user with username and password (password grant)
 * Calls Keycloak token endpoint to authenticate user
 * @param {string} username - User email or username
 * @param {string} password - User password
 * @returns {Promise<Object>} Token response with access_token, refresh_token, session_state
 */
export const loginUser = async (username, password) => {
  try {
    const config = validateAndGetConfig();
    const tokenUrl = `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    logger.debug('Attempting user login', { username, realm: config.KEYCLOAK_REALM });

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'password',
        client_id: config.KEYCLOAK_CLIENT_ID,
        client_secret: config.KEYCLOAK_CLIENT_SECRET,
        username: username,
        password: password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    logger.info('User login successful', { username });

    return {
      success: true,
      data: {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        refresh_expires_in: response.data.refresh_expires_in,
        token_type: response.data.token_type,
        session_state: response.data.session_state
      }
    };
  } catch (error) {
    logError('User login failed', error, { username });

    // Handle specific Keycloak error responses
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        return {
          success: false,
          error: 'Invalid credentials',
          details: errorData.error_description || 'Invalid username or password'
        };
      }

      if (status === 400) {
        return {
          success: false,
          error: 'Invalid request',
          details: errorData.error_description || errorData.error || 'Invalid request parameters'
        };
      }

      return {
        success: false,
        error: 'Keycloak authentication failed',
        details: errorData.error_description || error.message
      };
    }

    // Network or other errors
    return {
      success: false,
      error: 'Login request failed',
      details: error.message
    };
  }
};

/**
 * Refresh access token using refresh token
 * Calls Keycloak token endpoint with refresh_token grant type
 * @param {string} refreshToken - Refresh token from login
 * @returns {Promise<Object>} New token response with access_token, refresh_token, session_state
 */
export const refreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      return {
        success: false,
        error: 'Refresh token is required'
      };
    }

    const config = validateAndGetConfig();
    const tokenUrl = `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    logger.debug('Attempting token refresh', { realm: config.KEYCLOAK_REALM });

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.KEYCLOAK_CLIENT_ID,
        client_secret: config.KEYCLOAK_CLIENT_SECRET,
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Extract session_state from new access_token
    let sessionState = null;
    try {
      const decoded = jwt.decode(response.data.access_token);
      sessionState = decoded.sid || decoded.session_state || null;
    } catch (decodeError) {
      logger.warn('Failed to decode access token for session_state', { error: decodeError.message });
    }

    logger.info('Token refresh successful');

    return {
      success: true,
      data: {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        refresh_expires_in: response.data.refresh_expires_in,
        token_type: response.data.token_type,
        session_state: sessionState
      }
    };
  } catch (error) {
    logError('Token refresh failed', error);

    // Handle specific Keycloak error responses
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 400) {
        return {
          success: false,
          error: 'Invalid refresh token',
          details: errorData.error_description || errorData.error || 'Invalid refresh token'
        };
      }

      if (status === 401) {
        return {
          success: false,
          error: 'Refresh token expired',
          details: errorData.error_description || 'Refresh token has expired'
        };
      }

      return {
        success: false,
        error: 'Keycloak refresh failed',
        details: errorData.error_description || error.message
      };
    }

    // Network or other errors
    return {
      success: false,
      error: 'Token refresh request failed',
      details: error.message
    };
  }
};

/**
 * Logout user and invalidate session in Keycloak
 * Calls Keycloak logout endpoint to invalidate session
 * @param {string} refreshToken - Refresh token to invalidate
 * @returns {Promise<Object>} Logout response
 */
export const logoutUser = async (refreshToken) => {
  try {
    if (!refreshToken) {
      return {
        success: false,
        error: 'Refresh token is required for logout'
      };
    }

    const config = validateAndGetConfig();
    const logoutUrl = `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/logout`;

    logger.debug('Attempting user logout', { realm: config.KEYCLOAK_REALM });

    const response = await axios.post(
      logoutUrl,
      new URLSearchParams({
        client_id: config.KEYCLOAK_CLIENT_ID,
        client_secret: config.KEYCLOAK_CLIENT_SECRET,
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    logger.info('User logout successful');

    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    logError('User logout failed', error);

    // Handle specific Keycloak error responses
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // Keycloak may return 204 (No Content) for successful logout
      if (status === 204 || status === 200) {
        return {
          success: true,
          message: 'Logout successful'
        };
      }

      if (status === 400) {
        return {
          success: false,
          error: 'Invalid logout request',
          details: errorData.error_description || errorData.error || 'Invalid refresh token'
        };
      }

      return {
        success: false,
        error: 'Keycloak logout failed',
        details: errorData.error_description || error.message
      };
    }

    // Network or other errors
    return {
      success: false,
      error: 'Logout request failed',
      details: error.message
    };
  }
};

