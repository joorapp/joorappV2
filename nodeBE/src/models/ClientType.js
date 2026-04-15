/**
 * @author Bhavesh Venugopal
 * ClientType Model
 * Client type reference data; scoped by createdCompanyId (super admin company = system defaults)
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

const ClientType = sequelize.define(
  'ClientType',
  {
    clientType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'client_type',
      validate: {
        notEmpty: true
      },
      comment: 'Display name of the client type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
      comment: 'Optional description of the client type'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
      comment: 'Whether the client type is active'
    },
    ...getAuditableFields()
  },
  {
    tableName: 'client_types',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    defaultScope: getDefaultScope(),
    scopes: getScopes(),
    indexes: [
      {
        fields: ['is_deleted'],
        name: 'client_types_is_deleted_idx'
      },
      {
        fields: ['is_active'],
        name: 'client_types_is_active_idx'
      },
      {
        fields: ['created_company_id'],
        name: 'client_types_created_company_id_idx'
      },
      {
        fields: ['client_type'],
        name: 'client_types_client_type_idx'
      }
    ]
  }
);

const auditHooks = getAuditableHooks();
ClientType.addHook('beforeValidate', auditHooks.beforeValidate);
ClientType.addHook('beforeCreate', auditHooks.beforeCreate);
ClientType.addHook('beforeUpdate', auditHooks.beforeUpdate);

applyOptimisticLocking(ClientType);

ClientType.prototype.destroy = async function (options = {}) {
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
 * @param {Object} models
 * @returns {void}
 */
ClientType.associate = (models) => {
  ClientType.belongsTo(models.Company, {
    foreignKey: 'createdCompanyId',
    as: 'createdByCompany'
  });
};

export default ClientType;
