/**
 * @author Bhavesh Venugopal
 * User Model
 * Reference table for audit foreign keys
 * Note: User model does NOT have audit fields to avoid circular dependency
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { KEYCLOAK_GLOBAL_ROLE_VALUES, KEYCLOAK_GLOBAL_ROLE_DEFAULT } from '../constants/keycloakRoles.js';

/**
 * User model definition
 * Represents a user in the system
 * Users are primarily managed in Keycloak, this table stores business data
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    field: 'id'
  },
  keycloakId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'keycloak_id',
    comment: 'Keycloak user ID for synchronization'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'email',
    validate: {
      isEmail: true,
      notEmpty: true
    },
    comment: 'User email address (synced from Keycloak)'
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'first_name',
    comment: 'User first name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'last_name',
    comment: 'User last name'
  },
  keycloakGlobalRole: {
    type: DataTypes.ENUM(...KEYCLOAK_GLOBAL_ROLE_VALUES),
    allowNull: false,
    defaultValue: KEYCLOAK_GLOBAL_ROLE_DEFAULT,
    field: 'keycloak_global_role',
    comment: 'Global role from Keycloak (SUPER_ADMIN, COMPANY_ADMIN, COMPANY_USER)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active',
    comment: 'Whether the user account is active'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at',
    comment: 'Timestamp of last login'
  }
}, {
  tableName: 'users',
  timestamps: false, // User model doesn't have audit fields (it's the reference table)
  indexes: [
    {
      unique: true,
      fields: ['keycloak_id'],
      name: 'users_keycloak_id_unique'
    },
    {
      unique: true,
      fields: ['email'],
      name: 'users_email_unique'
    },
    {
      fields: ['is_active'],
      name: 'users_is_active_idx'
    }
  ]
});

/**
 * Define model associations
 * @param {Object} models - Object containing all models
 * @returns {void}
 */
User.associate = (models) => {
  // User hasMany relationships for audit foreign keys
  // These associations allow Sequelize to understand the foreign key relationships
  // for createdUserId, updatedUserId, and deletedUserId in other models
  
  // DemoAuditableModel audit associations
  User.hasMany(models.DemoAuditableModel, { 
    foreignKey: 'createdUserId', 
    as: 'createdDemoAuditableModels' 
  });
  User.hasMany(models.DemoAuditableModel, { 
    foreignKey: 'updatedUserId', 
    as: 'updatedDemoAuditableModels' 
  });
  User.hasMany(models.DemoAuditableModel, { 
    foreignKey: 'deletedUserId', 
    as: 'deletedDemoAuditableModels' 
  });

  // Company audit associations
  User.hasMany(models.Company, { 
    foreignKey: 'createdUserId', 
    as: 'createdCompanies' 
  });
  User.hasMany(models.Company, { 
    foreignKey: 'updatedUserId', 
    as: 'updatedCompanies' 
  });
  User.hasMany(models.Company, { 
    foreignKey: 'deletedUserId', 
    as: 'deletedCompanies' 
  });

  // CompanyRole audit associations
  User.hasMany(models.CompanyRole, { 
    foreignKey: 'createdUserId', 
    as: 'createdCompanyRoles' 
  });
  User.hasMany(models.CompanyRole, { 
    foreignKey: 'updatedUserId', 
    as: 'updatedCompanyRoles' 
  });
  User.hasMany(models.CompanyRole, { 
    foreignKey: 'deletedUserId', 
    as: 'deletedCompanyRoles' 
  });

  // CompanyUser associations
  User.hasMany(models.CompanyUser, { 
    foreignKey: 'userId', 
    as: 'companyUsers' 
  });
  // CompanyUser audit associations
  User.hasMany(models.CompanyUser, { 
    foreignKey: 'createdUserId', 
    as: 'createdCompanyUsers' 
  });
  User.hasMany(models.CompanyUser, { 
    foreignKey: 'updatedUserId', 
    as: 'updatedCompanyUsers' 
  });
  User.hasMany(models.CompanyUser, { 
    foreignKey: 'deletedUserId', 
    as: 'deletedCompanyUsers' 
  });
};

export default User;

