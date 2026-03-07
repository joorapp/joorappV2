/**
 * @author Bhavesh Venugopal
 * Project Model
 * Represents a project in the system, belonging to a client
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

export const PROJECT_STATUS_VALUES = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
export const PROJECT_STATUS_DEFAULT = 'PLANNING';

/**
 * Project model definition
 */
const Project = sequelize.define('Project', {
  // Business fields
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'client_id',
    references: {
      model: 'clients',
      key: 'id'
    },
    comment: 'Foreign key to clients table'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name',
    comment: 'Project name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Project description'
  },
  status: {
    type: DataTypes.ENUM(...PROJECT_STATUS_VALUES),
    allowNull: false,
    defaultValue: PROJECT_STATUS_DEFAULT,
    field: 'status',
    comment: 'Project status'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'start_date',
    comment: 'Project start date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date',
    comment: 'Project end date'
  },
  projectMetadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'project_metadata',
    comment: 'Flexible JSON storage for additional project attributes'
  },
  // Spread audit fields
  ...getAuditableFields()
}, {
  tableName: 'projects',
  timestamps: false,
  underscored: true,
  freezeTableName: true,
  defaultScope: getDefaultScope(),
  scopes: getScopes(),
  indexes: [
    {
      fields: ['client_id'],
      name: 'projects_client_id_idx'
    },
    {
      fields: ['status'],
      name: 'projects_status_idx'
    },
    {
      fields: ['is_deleted'],
      name: 'projects_is_deleted_idx'
    },
    {
      fields: ['name'],
      name: 'projects_name_idx'
    }
  ]
});

// Apply audit hooks
const auditHooks = getAuditableHooks();
Project.addHook('beforeValidate', auditHooks.beforeValidate);
Project.addHook('beforeCreate', auditHooks.beforeCreate);
Project.addHook('beforeUpdate', auditHooks.beforeUpdate);

// Apply optimistic locking
applyOptimisticLocking(Project);

// Override destroy for soft delete
Project.prototype.destroy = async function(options = {}) {
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
Project.associate = (models) => {
  // Project belongsTo Client
  Project.belongsTo(models.Client, {
    foreignKey: 'clientId',
    as: 'client'
  });

  // Project hasMany ProjectUsers
  Project.hasMany(models.ProjectUser, {
    foreignKey: 'projectId',
    as: 'projectUsers'
  });
  
  // Project belongsToMany Users (through ProjectUser)
  Project.belongsToMany(models.User, {
    through: models.ProjectUser,
    foreignKey: 'projectId',
    otherKey: 'userId',
    as: 'users'
  });
};

export default Project;
