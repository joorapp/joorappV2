/**
 * @author Bhavesh Venugopal
 * CompanyRole Model
 * Master table for company-specific roles
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
 * CompanyRole model definition
 * Master table defining available roles within companies
 * Examples: CompanyAdmin, Admin, User, Auditor
 */
const CompanyRole = sequelize.define('CompanyRole', {
  // Business fields
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'name',
    validate: {
      notEmpty: true
    },
    comment: 'Role name (e.g., CompanyAdmin, Admin, User, Auditor)'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'code',
    validate: {
      notEmpty: true
    },
    comment: 'Unique role code/identifier'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Description of the role and its permissions'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active',
    comment: 'Whether the role is active'
  },
  // Spread audit fields
  ...getAuditableFields()
}, {
  tableName: 'company_roles',
  timestamps: false, // Using custom audit fields
  underscored: true,
  freezeTableName: true,
  defaultScope: getDefaultScope(),
  scopes: getScopes(),
  indexes: [
    {
      unique: true,
      fields: ['name'],
      name: 'company_roles_name_unique'
    },
    {
      unique: true,
      fields: ['code'],
      name: 'company_roles_code_unique'
    },
    {
      fields: ['is_active'],
      name: 'company_roles_is_active_idx'
    },
    {
      fields: ['is_deleted'],
      name: 'company_roles_is_deleted_idx'
    }
  ]
});

// Apply audit hooks
const auditHooks = getAuditableHooks();
CompanyRole.addHook('beforeValidate', auditHooks.beforeValidate);
CompanyRole.addHook('beforeCreate', auditHooks.beforeCreate);
CompanyRole.addHook('beforeUpdate', auditHooks.beforeUpdate);

// Apply optimistic locking
applyOptimisticLocking(CompanyRole);

// Override destroy for soft delete
CompanyRole.prototype.destroy = async function(options = {}) {
  const userId = options.context?.userId;
  if (!userId) {
    throw new Error('userId is required in options.context for soft delete');
  }

  this.isDeleted = true;
  this.deletedUserId = userId;
  this.updatedDate = new Date();
  this.updatedUserId = userId;

  await this.save({ hooks: false, context: options.context });
  return this;
};

/**
 * Define model associations
 * @param {Object} models - Object containing all models
 * @returns {void}
 */
CompanyRole.associate = (models) => {
  // BelongsTo Company for createdCompanyId
  CompanyRole.belongsTo(models.Company, {
    foreignKey: 'createdCompanyId',
    as: 'createdByCompany'
  });

  // CompanyRole hasMany relationships
  CompanyRole.hasMany(models.CompanyUser, { 
    foreignKey: 'companyRoleId', 
    as: 'assignments' 
  });

  // Audit field associations (User hasMany CompanyRole)
  // These are defined in User.associate() but listed here for reference
};

export default CompanyRole;

