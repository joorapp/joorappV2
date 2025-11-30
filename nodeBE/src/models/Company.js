/**
 * @author Bhavesh Venugopal
 * Company Model
 * Represents a company/organization in the system
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
 * Company model definition
 * Represents a company/organization that uses the system
 */
const Company = sequelize.define('Company', {
  // Business fields
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'name',
    comment: 'Company name'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    field: 'code',
    comment: 'Company code/abbreviation'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Company description'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active',
    comment: 'Whether the company is active'
  },
  // Spread audit fields
  ...getAuditableFields()
}, {
  tableName: 'companies',
  timestamps: false, // Using custom audit fields
  underscored: true,
  freezeTableName: true,
  defaultScope: getDefaultScope(),
  scopes: getScopes(),
  indexes: [
    {
      fields: ['is_active'],
      name: 'companies_is_active_idx'
    },
    {
      fields: ['is_deleted'],
      name: 'companies_is_deleted_idx'
    }
  ]
});

// Apply audit hooks
const auditHooks = getAuditableHooks();
Company.addHook('beforeValidate', auditHooks.beforeValidate);
Company.addHook('beforeCreate', auditHooks.beforeCreate);
Company.addHook('beforeUpdate', auditHooks.beforeUpdate);

// Apply optimistic locking
applyOptimisticLocking(Company);

// Override destroy for soft delete
Company.prototype.destroy = async function(options = {}) {
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
Company.associate = (models) => {
  // Self-referential association for createdCompanyId
  Company.belongsTo(models.Company, {
    foreignKey: 'createdCompanyId',
    as: 'createdByCompany'
  });

  // Company hasMany relationships
  Company.hasMany(models.CompanyUser, { 
    foreignKey: 'companyId', 
    as: 'users' 
  });
  Company.hasMany(models.UserCompanyContext, { 
    foreignKey: 'companyId', 
    as: 'sessionContexts' 
  });

  // Audit field associations (User hasMany Company)
  // These are defined in User.associate() but listed here for reference
};

export default Company;

