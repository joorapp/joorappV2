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
import { COMPANY_STATUS_VALUES, COMPANY_STATUS_DEFAULT } from '../constants/companyStatus.js';

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
  // Status field (enum)
  status: {
    type: DataTypes.ENUM(...COMPANY_STATUS_VALUES),
    allowNull: false,
    defaultValue: COMPANY_STATUS_DEFAULT,
    field: 'status',
    comment: 'Company status (NEW, ACTIVE, LICENSE_EXPIRED)'
  },
  // Contact fields
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'email',
    comment: 'Company email address'
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'phone',
    comment: 'Company phone number'
  },
  // Address fields
  buildingAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'building_address',
    comment: 'Building number, unit, or premise address'
  },
  streetAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'street_address',
    comment: 'Street name, area, or locality'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'city',
    comment: 'City name'
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'state',
    comment: 'State or province'
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'postal_code',
    comment: 'Postal or ZIP code'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'country',
    comment: 'Country name'
  },
  // Logo field
  logo: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'logo',
    comment: 'Base64 encoded company logo'
  },
  // Plan foreign key (for future implementation)
  planId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'plan_id',
    comment: 'Foreign key to plans table (future implementation)'
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
    },
    {
      fields: ['status'],
      name: 'companies_status_idx'
    },
    {
      fields: ['email'],
      name: 'companies_email_idx'
    },
    {
      fields: ['plan_id'],
      name: 'companies_plan_id_idx'
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

  // Plan association
  Company.belongsTo(models.Plan, {
    foreignKey: 'planId',
    as: 'plan'
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

