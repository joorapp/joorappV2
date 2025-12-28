/**
 * @author Bhavesh Venugopal
 * Master Data Entity Mixin
 * Provides reusable audit fields and hooks for master data models
 * Master data models don't track user audit fields (createdUserId, updatedUserId, createdCompanyId)
 * Models can inherit audit functionality by spreading these fields and hooks
 */

import { DataTypes } from 'sequelize';
import {
  getDefaultScope,
  getScopes,
  applyOptimisticLocking
} from './AuditableEntity.js';

/**
 * Get master data field definitions
 * Returns field definitions for master data audit columns (without user FKs)
 * @returns {Object} Object containing master data field definitions
 */
export const getMasterDataFields = () => ({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    field: 'id'
  },
  createdDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_date'
  },
  updatedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_date'
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_deleted'
  },
  deletedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'deleted_user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who soft-deleted this record (optional, nullable)'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    field: 'version'
  }
});

/**
 * Get master data hooks for automatic field population
 * Returns hooks that automatically set audit fields (without requiring userId)
 * @returns {Object} Object containing Sequelize hooks
 */
export const getMasterDataHooks = () => ({
  /**
   * Before validate hook - sets audit fields before validation runs
   * This runs before validation, so we can set required fields
   * @param {Object} instance - Sequelize model instance
   * @param {Object} options - Sequelize options (no context.userId required)
   */
  beforeValidate: (instance, options) => {
    // Only set on create (when id is not set or is new)
    if (instance.isNewRecord || !instance.id) {
      const now = new Date();

      // Set audit fields if they're not already set
      if (!instance.createdDate) {
        instance.createdDate = now;
      }
      if (!instance.updatedDate) {
        instance.updatedDate = now;
      }
      if (instance.version === undefined || instance.version === null) {
        instance.version = 1;
      }
      if (instance.isDeleted === undefined || instance.isDeleted === null) {
        instance.isDeleted = false;
      }
    }
  },

  /**
   * Before create hook - ensures audit fields are set (backup)
   * @param {Object} instance - Sequelize model instance
   * @param {Object} options - Sequelize options (no context.userId required)
   */
  beforeCreate: (instance, options) => {
    const now = new Date();

    // Ensure all audit fields are set
    instance.createdDate = instance.createdDate || now;
    instance.updatedDate = instance.updatedDate || now;
    instance.version = instance.version || 1;
    instance.isDeleted = instance.isDeleted || false;
  },

  /**
   * Before update hook - sets updatedDate, increments version
   * @param {Object} instance - Sequelize model instance
   * @param {Object} options - Sequelize options (no context.userId required)
   */
  beforeUpdate: (instance, options) => {
    // Only update if something actually changed
    if (instance.changed() && instance.changed().length > 0) {
      // Always update these audit fields on any change
      // Use set() to ensure they're marked as changed
      instance.set('updatedDate', new Date());

      // Get the expected version from previous values (before the update)
      // This is the version we expect to be in the database
      const expectedVersion = instance._previousDataValues?.version ??
                            (instance.dataValues?.version !== undefined ? instance.dataValues.version :
                            (instance.version !== undefined ? instance.version : 1));

      // Increment version for optimistic locking
      const newVersion = expectedVersion + 1;

      // Use set() to ensure version is marked as changed
      instance.set('version', newVersion);

      // Store expected version in options for save method override
      options._expectedVersion = expectedVersion;
    }
  },

  /**
   * Before destroy hook - implements soft delete
   * Sets isDeleted flag and deletedUserId (if provided in options)
   * @param {Object} instance - Sequelize model instance
   * @param {Object} options - Sequelize options (deletedUserId can be passed in options.deletedUserId)
   */
  beforeDestroy: async (instance, options) => {
    // Soft delete: set flags instead of actually deleting
    // deletedUserId can be passed in options.deletedUserId (optional)
    const deletedUserId = options?.deletedUserId || null;

    instance.isDeleted = true;
    instance.deletedUserId = deletedUserId;
    instance.updatedDate = new Date();

    // Update the record instead of deleting (skip hooks to avoid recursion)
    await instance.save({
      hooks: false,
      ...options
    });

    // Throw an error to prevent Sequelize from actually deleting
    // This is the only way to prevent deletion in Sequelize v6
    throw new Error('SOFT_DELETE_PREVENTED'); // Special error that we'll catch
  }
});

/**
 * Re-export scope and locking utilities from AuditableEntity
 * Master data entities use the same scopes and optimistic locking
 */
export { getDefaultScope, getScopes, applyOptimisticLocking };

