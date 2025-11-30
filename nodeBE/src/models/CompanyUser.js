/**
 * @author Bhavesh Venugopal
 * CompanyUser Model
 * Junction table linking users to companies with their roles
 * Uses AuditableEntity mixin for audit tracking
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import {
  getAuditableFields,
  getAuditableHooks,
  getDefaultScope,
  getScopes,
  applyOptimisticLocking
} from './base/AuditableEntity.js';

/**
 * CompanyUser model definition
 * Links users to companies with their specific role in that company
 * One user can have different roles in different companies
 */
const CompanyUser = sequelize.define('CompanyUser', {
  // Business fields
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Reference to user'
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'company_id',
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: 'Reference to company'
  },
  companyRoleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'company_role_id',
    references: {
      model: 'company_roles',
      key: 'id'
    },
    comment: 'Reference to company role'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active',
    comment: 'Whether this company-user relationship is active'
  },
  // Spread audit fields
  ...getAuditableFields()
}, {
  tableName: 'company_users',
  timestamps: false, // Using custom audit fields
  underscored: true,
  freezeTableName: true,
  defaultScope: getDefaultScope(),
  scopes: getScopes(),
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'company_id'],
      name: 'company_users_user_company_unique'
    },
    {
      fields: ['user_id'],
      name: 'company_users_user_id_idx'
    },
    {
      fields: ['company_id'],
      name: 'company_users_company_id_idx'
    },
    {
      fields: ['company_role_id'],
      name: 'company_users_company_role_id_idx'
    },
    {
      fields: ['is_deleted'],
      name: 'company_users_is_deleted_idx'
    }
  ]
});

// Apply audit hooks
const auditHooks = getAuditableHooks();
CompanyUser.addHook('beforeValidate', auditHooks.beforeValidate);
CompanyUser.addHook('beforeCreate', auditHooks.beforeCreate);
CompanyUser.addHook('beforeUpdate', auditHooks.beforeUpdate);

// Apply optimistic locking
applyOptimisticLocking(CompanyUser);

// Override destroy for soft delete
CompanyUser.prototype.destroy = async function(options = {}) {
  const userId = options.context?.userId;
  if (!userId) {
    throw new Error('userId is required in options.context for soft delete');
  }

  // Set soft delete fields
  this.isDeleted = true;
  this.deletedUserId = userId;

  // Save with hooks enabled
  // - beforeUpdate hook will set updatedDate, updatedUserId
  // - beforeUpdate hook will increment version
  // - Optimistic locking will detect concurrent modifications
  await this.save({ context: options.context });
  return this;
};

/**
 * Define model associations
 * @param {Object} models - Object containing all models
 * @returns {void}
 */
CompanyUser.associate = (models) => {
  // BelongsTo relationships
  CompanyUser.belongsTo(models.User, { 
    foreignKey: 'userId', 
    as: 'user' 
  });
  CompanyUser.belongsTo(models.Company, { 
    foreignKey: 'companyId', 
    as: 'company' 
  });
  CompanyUser.belongsTo(models.CompanyRole, { 
    foreignKey: 'companyRoleId', 
    as: 'role' 
  });
  CompanyUser.belongsTo(models.Company, { 
    foreignKey: 'createdCompanyId', 
    as: 'createdByCompany' 
  });

  // Audit field associations (User hasMany CompanyUser)
  // These are defined in User.associate() but listed here for reference
};

export default CompanyUser;

