/**
 * @author Bhavesh Venugopal
 * Demo Auditable Model
 * Example model demonstrating the AuditableEntity mixin pattern
 * This model includes all audit fields and hooks automatically
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
 * DemoAuditableModel definition
 * Demonstrates how to use the AuditableEntity mixin
 * Includes business fields plus all audit fields automatically
 */
const DemoAuditableModel = sequelize.define('DemoAuditableModel', {
  // Business fields
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name',
    comment: 'Name of the demo record'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Description of the demo record'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'active',
    field: 'status',
    comment: 'Status of the demo record'
  },
  // Spread audit fields from mixin
  ...getAuditableFields()
}, {
  tableName: 'demo_auditable_models',
  timestamps: false, // We use custom audit fields (createdDate, updatedDate)
  underscored: true,
  freezeTableName: true,
  // Apply default scope for soft delete
  defaultScope: getDefaultScope(),
  // Apply additional scopes
  scopes: getScopes(),
  indexes: [
    {
      fields: ['name'],
      name: 'demo_auditable_models_name_idx'
    },
    {
      fields: ['status'],
      name: 'demo_auditable_models_status_idx'
    },
    {
      fields: ['is_deleted'],
      name: 'demo_auditable_models_is_deleted_idx'
    }
  ]
});

// Apply audit hooks using addHook (ensures they run in correct order)
const auditHooks = getAuditableHooks();
DemoAuditableModel.addHook('beforeValidate', auditHooks.beforeValidate);
DemoAuditableModel.addHook('beforeCreate', auditHooks.beforeCreate);
DemoAuditableModel.addHook('beforeUpdate', auditHooks.beforeUpdate);

// Apply optimistic locking (overrides save() method)
applyOptimisticLocking(DemoAuditableModel);

// Override destroy method to implement soft delete
// This prevents the actual SQL DELETE from executing
const originalDestroy = DemoAuditableModel.prototype.destroy;
DemoAuditableModel.prototype.destroy = async function(options = {}) {
  const userId = options?.context?.userId;
  
  if (!userId) {
    throw new Error('userId must be provided in options.context for soft delete');
  }

  // Soft delete: update the record instead of deleting
  this.isDeleted = true;
  this.deletedUserId = userId;
  this.updatedDate = new Date();
  this.updatedUserId = userId;
  
  // Save the changes (skip hooks to avoid recursion)
  await this.save({ 
    hooks: false,
    context: options.context 
  });
  
  // Don't call the original destroy - just return the instance
  return this;
};

/**
 * Define model associations
 * @param {Object} models - Object containing all models
 * @returns {void}
 */
DemoAuditableModel.associate = (models) => {
  // BelongsTo Company for createdCompanyId
  DemoAuditableModel.belongsTo(models.Company, {
    foreignKey: 'createdCompanyId',
    as: 'createdByCompany'
  });

  // Audit field associations (User hasMany DemoAuditableModel)
  // These are defined in User.associate() but listed here for reference
};

export default DemoAuditableModel;

