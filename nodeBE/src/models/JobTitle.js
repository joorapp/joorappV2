/**
 * @author Bhavesh Venugopal
 * JobTitle Model
 * Job titles for employees; scoped by createdCompanyId (super admin company = system defaults)
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

const JobTitle = sequelize.define('JobTitle', {
  jobTitle: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'job_title',
    validate: {
      notEmpty: true
    },
    comment: 'Display name of the job title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Optional description of the job title'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active',
    comment: 'Whether the job title is active'
  },
  ...getAuditableFields()
}, {
  tableName: 'job_titles',
  timestamps: false,
  underscored: true,
  freezeTableName: true,
  defaultScope: getDefaultScope(),
  scopes: getScopes(),
  indexes: [
    {
      fields: ['is_deleted'],
      name: 'job_titles_is_deleted_idx'
    },
    {
      fields: ['is_active'],
      name: 'job_titles_is_active_idx'
    },
    {
      fields: ['created_company_id'],
      name: 'job_titles_created_company_id_idx'
    },
    {
      fields: ['job_title'],
      name: 'job_titles_job_title_idx'
    }
  ]
});

const auditHooks = getAuditableHooks();
JobTitle.addHook('beforeValidate', auditHooks.beforeValidate);
JobTitle.addHook('beforeCreate', auditHooks.beforeCreate);
JobTitle.addHook('beforeUpdate', auditHooks.beforeUpdate);

applyOptimisticLocking(JobTitle);

JobTitle.prototype.destroy = async function (options = {}) {
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
 * @returns {void}
 */
JobTitle.associate = (models) => {
  JobTitle.belongsTo(models.Company, {
    foreignKey: 'createdCompanyId',
    as: 'createdByCompany'
  });
  if (models.Employee) {
    JobTitle.hasMany(models.Employee, {
      foreignKey: 'jobTitleId',
      as: 'employees'
    });
  }
};

export default JobTitle;
