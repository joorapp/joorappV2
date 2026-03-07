/**
 * @author Bhavesh Venugopal
 * Client Model
 * Represents a client in the system
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
 * Client model definition
 */
const Client = sequelize.define('Client', {
  // Business fields
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name',
    comment: 'Client name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'email',
    comment: 'Client email address'
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'phone',
    comment: 'Client phone number'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active',
    comment: 'Whether the client is active'
  },
  clientMetadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'client_metadata',
    comment: 'Flexible JSON storage for additional client attributes'
  },
  // Spread audit fields
  ...getAuditableFields()
}, {
  tableName: 'clients',
  timestamps: false,
  underscored: true,
  freezeTableName: true,
  defaultScope: getDefaultScope(),
  scopes: getScopes(),
  indexes: [
    {
      fields: ['is_active'],
      name: 'clients_is_active_idx'
    },
    {
      fields: ['is_deleted'],
      name: 'clients_is_deleted_idx'
    },
    {
      fields: ['name'],
      name: 'clients_name_idx'
    }
  ]
});

// Apply audit hooks
const auditHooks = getAuditableHooks();
Client.addHook('beforeValidate', auditHooks.beforeValidate);
Client.addHook('beforeCreate', auditHooks.beforeCreate);
Client.addHook('beforeUpdate', auditHooks.beforeUpdate);

// Apply optimistic locking
applyOptimisticLocking(Client);

// Override destroy for soft delete
Client.prototype.destroy = async function(options = {}) {
  const userId = options.context?.userId;
  if (!userId) {
    throw new Error('userId is required in options.context for soft delete');
  }

  this.isDeleted = true;
  this.deletedUserId = userId;

  await this.save({ context: options.context });
  return this;
};

/**
 * Define model associations
 * @param {Object} models - Object containing all models
 */
Client.associate = (models) => {
  // Client hasMany Projects
  Client.hasMany(models.Project, { 
    foreignKey: 'clientId', 
    as: 'projects' 
  });
};

export default Client;
