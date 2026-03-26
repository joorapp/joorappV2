/**
 * @author Bhavesh Venugopal
 * ProjectUser Model
 * Represents the many-to-many relationship between Projects and Users (Assignments)
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
 * ProjectUser model definition
 */
const ProjectUser = sequelize.define('ProjectUser', {
  // Business fields
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id',
    references: {
      model: 'projects',
      key: 'id'
    },
    comment: 'Foreign key to projects table'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Foreign key to users table'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active',
    comment: 'Whether this assignment is active'
  },
  // Spread audit fields
  ...getAuditableFields()
}, {
  tableName: 'project_users',
  timestamps: false,
  underscored: true,
  freezeTableName: true,
  defaultScope: getDefaultScope(),
  scopes: getScopes(),
  indexes: [
    {
      unique: true,
      fields: ['project_id', 'user_id'],
      where: {
        is_deleted: false
      },
      name: 'project_users_project_user_unique'
    },
    {
      fields: ['project_id'],
      name: 'project_users_project_id_idx'
    },
    {
      fields: ['user_id'],
      name: 'project_users_user_id_idx'
    },
    {
      fields: ['is_active'],
      name: 'project_users_is_active_idx'
    }
  ]
});

// Apply audit hooks
const auditHooks = getAuditableHooks();
ProjectUser.addHook('beforeValidate', auditHooks.beforeValidate);
ProjectUser.addHook('beforeCreate', auditHooks.beforeCreate);
ProjectUser.addHook('beforeUpdate', auditHooks.beforeUpdate);

// Apply optimistic locking
applyOptimisticLocking(ProjectUser);

// Override destroy for soft delete
ProjectUser.prototype.destroy = async function(options = {}) {
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
ProjectUser.associate = (models) => {
  // ProjectUser belongsTo Project
  ProjectUser.belongsTo(models.Project, {
    foreignKey: 'projectId',
    as: 'project'
  });

  // ProjectUser belongsTo User
  ProjectUser.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

export default ProjectUser;
