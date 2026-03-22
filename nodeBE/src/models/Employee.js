/**
 * @author Bhavesh Venugopal
 * Employee model — company-scoped HR record.
 * Optional companyUserId links to company_users when the employee can log in for this company.
 * Uses AuditableEntity mixin
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

const Employee = sequelize.define(
  'Employee',
  {
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
      validate: { notEmpty: true },
      comment: 'Given name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
      validate: { notEmpty: true },
      comment: 'Family name'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'email',
      validate: { notEmpty: true, isEmail: true },
      comment: 'Work email; unique per company among non-deleted rows'
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'phone',
      comment: 'Phone number'
    },
    employeeMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: 'employee_metadata',
      comment: 'Flexible JSON for extra attributes (e.g. currency)'
    },
    jobTitleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'job_title_id',
      comment: 'FK to job_titles'
    },
    salary: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      field: 'salary',
      comment: 'Salary amount (currency may live in employee_metadata)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
      comment: 'Employment / record active flag'
    },
    companyUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'company_user_id',
      references: {
        model: 'company_users',
        key: 'id'
      },
      comment: 'Company user row for this employee in this company (login + company role)'
    },
    ...getAuditableFields()
  },
  {
    tableName: 'employees',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    defaultScope: getDefaultScope(),
    scopes: getScopes(),
    indexes: [
      { fields: ['created_company_id'], name: 'employees_created_company_id_idx' },
      { fields: ['job_title_id'], name: 'employees_job_title_id_idx' },
      { fields: ['company_user_id'], name: 'employees_company_user_id_idx' },
      { fields: ['is_deleted'], name: 'employees_is_deleted_idx' },
      { fields: ['is_active'], name: 'employees_is_active_idx' }
    ]
  }
);

const auditHooks = getAuditableHooks();
Employee.addHook('beforeValidate', auditHooks.beforeValidate);
Employee.addHook('beforeCreate', auditHooks.beforeCreate);
Employee.addHook('beforeUpdate', auditHooks.beforeUpdate);

applyOptimisticLocking(Employee);

Employee.prototype.destroy = async function destroyEmployee(options = {}) {
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
 */
Employee.associate = (models) => {
  Employee.belongsTo(models.JobTitle, {
    foreignKey: 'jobTitleId',
    as: 'jobTitle'
  });
  Employee.belongsTo(models.CompanyUser, {
    foreignKey: 'companyUserId',
    as: 'companyUser'
  });
};

export default Employee;
