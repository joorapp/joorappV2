/**
 * @author Bhavesh Venugopal
 * Models Index
 * Exports all models and defines associations
 */

import User from './User.js';
import DemoAuditableModel from './DemoAuditableModel.js';
import Company from './Company.js';
import CompanyRole from './CompanyRole.js';
import CompanyUser from './CompanyUser.js';
import UserCompanyContext from './UserCompanyContext.js';

/**
 * Initialize model associations
 * Calls each model's associate method to set up relationships
 * @returns {void}
 */
const initializeAssociations = () => {
  // Create models object to pass to associate methods
  const models = {
    User,
    Company,
    CompanyRole,
    CompanyUser,
    UserCompanyContext,
    DemoAuditableModel
  };

  // Call each model's associate method if it exists
  // Order matters: define hasMany relationships before belongsTo
  if (User.associate) {
    User.associate(models);
  }
  if (Company.associate) {
    Company.associate(models);
  }
  if (CompanyRole.associate) {
    CompanyRole.associate(models);
  }
  if (CompanyUser.associate) {
    CompanyUser.associate(models);
  }
  if (UserCompanyContext.associate) {
    UserCompanyContext.associate(models);
  }
  if (DemoAuditableModel.associate) {
    DemoAuditableModel.associate(models);
  }
};

/**
 * Initialize all models
 * Call this after all models are imported
 * @returns {void}
 */
export const initializeModels = () => {
  initializeAssociations();
};

// Export all models
export { User, DemoAuditableModel, Company, CompanyRole, CompanyUser, UserCompanyContext };

// Export default object with all models
export default {
  User,
  DemoAuditableModel,
  Company,
  CompanyRole,
  CompanyUser,
  UserCompanyContext,
  initializeModels
};

