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
import Plan from './Plan.js';
import Client from './Client.js';
import Project from './Project.js';
import ProjectUser from './ProjectUser.js';
import JobTitle from './JobTitle.js';
import ProjectType from './ProjectType.js';
import ProjectCategory from './ProjectCategory.js';
import ClientType from './ClientType.js';
import Employee from './Employee.js';

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
    DemoAuditableModel,
    Plan,
    Client,
    Project,
    ProjectUser,
    JobTitle,
    ProjectType,
    ProjectCategory,
    ClientType,
    Employee
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
  if (Plan.associate) {
    Plan.associate(models);
  }
  if (Client.associate) {
    Client.associate(models);
  }
  if (Project.associate) {
    Project.associate(models);
  }
  if (ProjectUser.associate) {
    ProjectUser.associate(models);
  }
  if (JobTitle.associate) {
    JobTitle.associate(models);
  }
  if (ProjectType.associate) {
    ProjectType.associate(models);
  }
  if (ProjectCategory.associate) {
    ProjectCategory.associate(models);
  }
  if (ClientType.associate) {
    ClientType.associate(models);
  }
  if (Employee.associate) {
    Employee.associate(models);
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
export {
  User,
  DemoAuditableModel,
  Company,
  CompanyRole,
  CompanyUser,
  UserCompanyContext,
  Plan,
  Client,
  Project,
  ProjectUser,
  JobTitle,
  ProjectType,
  ProjectCategory,
  ClientType,
  Employee
};

// Export default object with all models
export default {
  User,
  DemoAuditableModel,
  Company,
  CompanyRole,
  CompanyUser,
  UserCompanyContext,
  Plan,
  Client,
  Project,
  ProjectUser,
  JobTitle,
  ProjectType,
  ProjectCategory,
  ClientType,
  Employee,
  initializeModels
};

