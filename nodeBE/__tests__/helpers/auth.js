/**
 * @author Bhavesh Venugopal
 * Authentication Test Helpers
 * Provides utilities for authentication in integration tests using real Keycloak
 */

import request from 'supertest';

/**
 * Get authentication token from real Keycloak
 * Logs in via the login endpoint and returns the access token
 * @param {Express.Application} app - Express app instance
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} Access token for use in Authorization header
 * @throws {Error} If login fails
 */
export const getAuthToken = async (app, email, password) => {
  const response = await request(app)
    .post('/api/v2/auth/login')
    .send({ email, password })
    .expect(200);

  if (!response.body.success || !response.body.data?.access_token) {
    throw new Error(`Login failed: ${response.body.message || 'Unknown error'}`);
  }

  return response.body.data.access_token;
};

/**
 * Get authentication token and refresh token from real Keycloak
 * Logs in via the login endpoint and returns both tokens
 * @param {Express.Application} app - Express app instance
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Object with access_token and refresh_token
 * @throws {Error} If login fails
 */
export const getAuthTokens = async (app, email, password) => {
  const response = await request(app)
    .post('/api/v2/auth/login')
    .send({ email, password })
    .expect(200);

  if (!response.body.success || !response.body.data?.access_token) {
    throw new Error(`Login failed: ${response.body.message || 'Unknown error'}`);
  }

  return {
    accessToken: response.body.data.access_token,
    refreshToken: response.body.data.refresh_token
  };
};

