/**
 * @author Bhavesh Venugopal
 * ProjectType Model
 * Project type reference data; scoped by createdCompanyId (super admin company = system defaults)
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

const ProjectType = sequelize.define(
  'ProjectType',
  {
    projectType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'project_type',
      validate: {
        notEmpty: true
      },
      comment: 'Display name of the project type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
      comment: 'Optional description of the project type'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
      comment: 'Whether the project type is active'
    },
    ...getAuditableFields()
  },
  {
    tableName: 'project_types',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    defaultScope: getDefaultScope(),
    scopes: getScopes(),
    indexes: [
      {
        fields: ['is_deleted'],
        name: 'project_types_is_deleted_idx'
      },
      {
        fields: ['is_active'],
        name: 'project_types_is_active_idx'
      },
      {
        fields: ['created_company_id'],
        name: 'project_types_created_company_id_idx'
      },
      {
        fields: ['project_type'],
        name: 'project_types_project_type_idx'
      }
    ]
  }
);

const auditHooks = getAuditableHooks();
ProjectType.addHook('beforeValidate', auditHooks.beforeValidate);
ProjectType.addHook('beforeCreate', auditHooks.beforeCreate);
ProjectType.addHook('beforeUpdate', auditHooks.beforeUpdate);

applyOptimisticLocking(ProjectType);

ProjectType.prototype.destroy = async function (options = {}) {
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
ProjectType.associate = (models) => {
  ProjectType.belongsTo(models.Company, {
    foreignKey: 'createdCompanyId',
    as: 'createdByCompany'
  });
};

export default ProjectType;
