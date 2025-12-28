/**
 * @author Bhavesh Venugopal
 * Plan Model
 * Master table for subscription/license plans
 * Uses MasterDataEntity mixin for audit tracking (no user audit fields)
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import {
  getMasterDataFields,
  getMasterDataHooks,
  getDefaultScope,
  getScopes,
  applyOptimisticLocking
} from './base/MasterDataEntity.js';

/**
 * Plan model definition
 * Master table defining available subscription/license plans
 * Examples: Basic, Premium, Enterprise
 */
const Plan = sequelize.define('Plan', {
  // Business fields
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'name',
    validate: {
      notEmpty: true
    },
    comment: 'Plan name (e.g., Basic, Premium, Enterprise)'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'code',
    validate: {
      notEmpty: true
    },
    comment: 'Unique plan code/identifier (e.g., BASIC)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Plan description'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'price',
    validate: {
      min: 0
    },
    comment: 'Plan price/cost'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active',
    comment: 'Whether the plan is active'
  },
  // Spread master data audit fields (no user FKs)
  ...getMasterDataFields()
}, {
  tableName: 'plans',
  timestamps: false, // Using custom audit fields
  underscored: true,
  freezeTableName: true,
  defaultScope: getDefaultScope(),
  scopes: getScopes(),
  indexes: [
    {
      unique: true,
      fields: ['name'],
      name: 'plans_name_unique'
    },
    {
      unique: true,
      fields: ['code'],
      name: 'plans_code_unique'
    },
    {
      fields: ['is_active'],
      name: 'plans_is_active_idx'
    },
    {
      fields: ['is_deleted'],
      name: 'plans_is_deleted_idx'
    }
  ]
});

// Apply master data hooks (no userId requirement)
const masterDataHooks = getMasterDataHooks();
Plan.addHook('beforeValidate', masterDataHooks.beforeValidate);
Plan.addHook('beforeCreate', masterDataHooks.beforeCreate);
Plan.addHook('beforeUpdate', masterDataHooks.beforeUpdate);

// Apply optimistic locking
applyOptimisticLocking(Plan);

// Override destroy for soft delete
// CRITICAL: Prevent soft deletion of BASIC plan (system master data)
Plan.prototype.destroy = async function(options = {}) {
  // CRITICAL: Prevent soft deletion of BASIC plan (system master data)
  // BASIC plan is required for system operation and cannot be deleted
  if (this.code === 'BASIC') {
    throw new Error('Cannot soft delete BASIC plan. BASIC plan is system master data and cannot be deleted.');
  }

  // Set soft delete fields
  // deletedUserId can be passed in options.deletedUserId (optional, nullable)
  const deletedUserId = options.deletedUserId || null;

  this.isDeleted = true;
  this.deletedUserId = deletedUserId;

  // Save with hooks enabled
  // - beforeUpdate hook will set updatedDate
  // - beforeUpdate hook will increment version
  // - Optimistic locking will detect concurrent modifications
  await this.save(options);
  return this;
};

/**
 * Define model associations
 * @param {Object} models - Object containing all models
 * @returns {void}
 */
Plan.associate = (models) => {
  // Plan hasMany relationships
  Plan.hasMany(models.Company, { 
    foreignKey: 'planId', 
    as: 'companies' 
  });

  // Optional: BelongsTo User for deletedUserId (soft delete tracking)
  Plan.belongsTo(models.User, {
    foreignKey: 'deletedUserId',
    as: 'deletedBy'
  });
};

export default Plan;

