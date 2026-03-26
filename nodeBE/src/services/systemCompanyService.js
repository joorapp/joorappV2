/**
 * @author Bhavesh Venugopal
 * System company helpers (super admin / platform company resolution)
 */

import { companyRepository } from '../repositories/companyRepository.js';
import { InternalServerError } from '../utils/errors.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('systemCompanyService');

/**
 * Resolve the super admin company UUID by configured name
 * @param {Object} [opts]
 * @param {string} [opts.requestId] - Request ID for error context
 * @returns {Promise<string>} Company UUID
 * @throws {InternalServerError} If the company row does not exist
 */
export const getSuperAdminCompanyId = async (opts = {}) => {
  const { requestId } = opts;
  logger.debug('Resolving super admin company id');
  const company = await companyRepository.findSuperAdminCompany();
  if (!company) {
    throw new InternalServerError(
      'Super admin company is not configured. Run configure-first-super-admin.',
      { requestId }
    );
  }
  return company.id;
};
