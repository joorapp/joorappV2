/**
 * @author Bhavesh Venugopal
 * ProjectCategory Model
 * Project category reference data; scoped by createdCompanyId (super admin company = system defaults)
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

const ProjectCategory = sequelize.define(
  'ProjectCategory',
  {
    projectCategory: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'project_category',
      validate: {
        notEmpty: true
      },
      comment: 'Display name of the project category'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
      comment: 'Optional description of the project category'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
      comment: 'Whether the project category is active'
    },
    ...getAuditableFields()
  },
  {
    tableName: 'project_categories',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    defaultScope: getDefaultScope(),
    scopes: getScopes(),
    indexes: [
      {
        fields: ['is_deleted'],
        name: 'project_categories_is_deleted_idx'
      },
      {
        fields: ['is_active'],
        name: 'project_categories_is_active_idx'
      },
      {
        fields: ['created_company_id'],
        name: 'project_categories_created_company_id_idx'
      },
      {
        fields: ['project_category'],
        name: 'project_categories_project_category_idx'
      }
    ]
  }
);

const auditHooks = getAuditableHooks();
ProjectCategory.addHook('beforeValidate', auditHooks.beforeValidate);
ProjectCategory.addHook('beforeCreate', auditHooks.beforeCreate);
ProjectCategory.addHook('beforeUpdate', auditHooks.beforeUpdate);

applyOptimisticLocking(ProjectCategory);

ProjectCategory.prototype.destroy = async function (options = {}) {
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
ProjectCategory.associate = (models) => {
  ProjectCategory.belongsTo(models.Company, {
    foreignKey: 'createdCompanyId',
    as: 'createdByCompany'
  });
};

export default ProjectCategory;
