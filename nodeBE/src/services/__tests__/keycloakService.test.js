/**
 * Keycloak service — admin client 401 detection tests
 */

import { describe, it, expect } from '@jest/globals';
import { isAdminApiUnauthorized } from '../keycloakService.js';

describe('isAdminApiUnauthorized', () => {
  it('returns true for plain Error with message HTTP 401 Unauthorized (production-shaped)', () => {
    const err = new Error('HTTP 401 Unauthorized');
    expect(isAdminApiUnauthorized(err)).toBe(true);
  });

  it('returns true when Fetch/Axios-like error has numeric status 401', () => {
    expect(isAdminApiUnauthorized({ response: { status: 401 } })).toBe(true);
  });

  it('returns true when status is string "401"', () => {
    expect(isAdminApiUnauthorized({ response: { status: '401' } })).toBe(true);
  });

  it('returns true when responseStatus is 401 (Axios compatibility)', () => {
    expect(isAdminApiUnauthorized({ responseStatus: 401 })).toBe(true);
  });

  it('returns true when message contains Unauthorized without 401 code', () => {
    expect(isAdminApiUnauthorized({ message: 'Unauthorized: invalid token' })).toBe(true);
  });

  it('returns false for 403', () => {
    expect(isAdminApiUnauthorized({ response: { status: 403 }, message: 'Forbidden' })).toBe(false);
  });

  it('returns false for null and non-objects', () => {
    expect(isAdminApiUnauthorized(null)).toBe(false);
    expect(isAdminApiUnauthorized(undefined)).toBe(false);
    expect(isAdminApiUnauthorized('oops')).toBe(false);
  });
});
