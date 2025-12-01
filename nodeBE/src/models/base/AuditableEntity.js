/**
 * @author Bhavesh Venugopal
 * Auditable Entity Mixin
 * Provides reusable audit fields and hooks for all models
 * Models can inherit audit functionality by spreading these fields and hooks
 */

import { DataTypes } from 'sequelize';

/**
 * Get audit field definitions
 * Returns field definitions for all audit columns
 * @returns {Object} Object containing audit field definitions
 */
export const getAuditableFields = () => ({
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
  createdUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdCompanyId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_company_id',
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: 'Company that created this record (non-updatable, set only on create)'
  },
  updatedUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'updated_user_id',
    references: {
      model: 'users',
      key: 'id'
    }
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
    }
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    field: 'version'
  }
});

/**
 * Get audit hooks for automatic field population
 * Returns hooks that automatically set audit fields based on context
 * @returns {Object} Object containing Sequelize hooks
 */
export const getAuditableHooks = () => ({
  /**
   * Before validate hook - sets audit fields before validation runs
   * This runs before validation, so we can set required fields
   * @param {Object} instance - Sequelize model instance
   * @param {Object} options - Sequelize options (should contain context.userId)
   */
  beforeValidate: (instance, options) => {
    // Only set on create (when id is not set or is new)
    if (instance.isNewRecord || !instance.id) {
      const now = new Date();
      const userId = options?.context?.userId;

      if (!userId) {
        throw new Error('userId must be provided in options.context for audit fields');
      }

      // Set audit fields if they're not already set
      if (!instance.createdDate) {
        instance.createdDate = now;
      }
      if (!instance.updatedDate) {
        instance.updatedDate = now;
      }
      if (!instance.createdUserId) {
        instance.createdUserId = userId;
      }
      // Set createdCompanyId from context if provided (non-updatable, only on create)
      if (!instance.createdCompanyId && options?.context?.companyId) {
        instance.createdCompanyId = options.context.companyId;
      }
      if (!instance.updatedUserId) {
        instance.updatedUserId = userId;
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
   * @param {Object} options - Sequelize options (should contain context.userId)
   */
  beforeCreate: (instance, options) => {
    const now = new Date();
    const userId = options?.context?.userId;

    if (!userId) {
      throw new Error('userId must be provided in options.context for audit fields');
    }

    // Ensure all audit fields are set
    instance.createdDate = instance.createdDate || now;
    instance.updatedDate = instance.updatedDate || now;
    instance.createdUserId = instance.createdUserId || userId;
    // Set createdCompanyId from context if provided (non-updatable, only on create)
    if (!instance.createdCompanyId && options?.context?.companyId) {
      instance.createdCompanyId = options.context.companyId;
    }
    instance.updatedUserId = instance.updatedUserId || userId;
    instance.version = instance.version || 1;
    instance.isDeleted = instance.isDeleted || false;
  },

  /**
   * Before update hook - sets updatedDate, updatedUserId, increments version
   * @param {Object} instance - Sequelize model instance
   * @param {Object} options - Sequelize options (should contain context.userId)
   */
  beforeUpdate: (instance, options) => {
    const userId = options?.context?.userId;

    if (!userId) {
      throw new Error('userId must be provided in options.context for audit fields');
    }

    // Only update if something actually changed
    if (instance.changed() && instance.changed().length > 0) {
      // Always update these audit fields on any change
      // Use set() to ensure they're marked as changed
      instance.set('updatedDate', new Date());
      instance.set('updatedUserId', userId);
      // createdCompanyId is non-updatable - prevent changes on update
      if (instance.changed('createdCompanyId')) {
        // Revert any attempt to change createdCompanyId
        instance.set('createdCompanyId', instance._previousDataValues?.createdCompanyId || instance.dataValues?.createdCompanyId);
      }
      
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
   * Sets isDeleted flag and deletedUserId instead of actually deleting
   * @param {Object} instance - Sequelize model instance
   * @param {Object} options - Sequelize options (should contain context.userId)
   */
  beforeDestroy: async (instance, options) => {
    const userId = options?.context?.userId;

    if (!userId) {
      throw new Error('userId must be provided in options.context for soft delete');
    }

    // Soft delete: set flags instead of actually deleting
    instance.isDeleted = true;
    instance.deletedUserId = userId;
    instance.updatedDate = new Date();
    instance.updatedUserId = userId;

    // Update the record instead of deleting (skip hooks to avoid recursion)
    await instance.save({ 
      hooks: false,
      context: options.context 
    });
    
    // Throw an error to prevent Sequelize from actually deleting
    // This is the only way to prevent deletion in Sequelize v6
    throw new Error('SOFT_DELETE_PREVENTED'); // Special error that we'll catch
  }
});

/**
 * Apply optimistic locking to a model
 * Overrides the save() method to add version check before save
 * 
 * @param {Object} Model - Sequelize model class
 * @returns {void}
 * 
 * @description
 * This function implements optimistic locking by checking the version before saving.
 * 
 * IMPLEMENTATION DETAILS:
 * - Uses pre-check approach: Verifies version matches before calling original save()
 * - Uses original save() instead of Model.update() to ensure audit fields (set by hooks) are included
 * 
 * LIMITATIONS & RACE CONDITION WARNING:
 * ⚠️ This implementation has a small race condition window:
 *   1. Version is checked via findByPk()
 *   2. If version matches, original save() is called
 *   3. Between steps 1 and 2, another process could update the record
 * 
 * This means in rare high-concurrency scenarios, two processes could both pass the version check
 * and both update the record. For most applications, this is acceptable.
 * 
 * If you encounter issues with concurrent updates, consider:
 * - Using database-level row locking (SELECT FOR UPDATE)
 * - Implementing version check in WHERE clause using raw SQL
 * - Using Sequelize transactions with appropriate isolation levels
 * 
 * WHY NOT Model.update() WITH VERSION IN WHERE?
 * Model.update() filters out audit fields set by hooks, even when explicitly included in updateData.
 * Using original save() ensures all changed fields (including hook-set audit fields) are included.
 * 
 * @see {@link https://sequelize.org/docs/v6/core-concepts/model-instances/#saving-persistent-instances} Sequelize save() documentation
 */
export const applyOptimisticLocking = (Model) => {
  const originalSave = Model.prototype.save;
  
  Model.prototype.save = async function(options = {}) {
    // Only apply optimistic locking for updates (not creates)
    if (!this.isNewRecord) {
      // Get the expected version from previous values (before any changes)
      const expectedVersion = this._previousDataValues?.version ?? 
                            (this.dataValues?.version !== undefined ? this.dataValues.version : 
                            (this.version !== undefined ? this.version : 1));
      
      // Check version before save to prevent optimistic lock conflicts
      // NOTE: This is a pre-check, not in WHERE clause (see LIMITATIONS above)
      // CRITICAL: Use withDeleted scope to find soft-deleted records
      const currentRecord = await Model.scope('withDeleted').findByPk(this.id, {
        attributes: ['version'],
        raw: true
      });
      
      if (!currentRecord || currentRecord.version !== expectedVersion) {
        // Version mismatch - optimistic lock conflict
        // Reload current version to provide accurate error message
        const currentVersion = currentRecord ? currentRecord.version : 'DELETED';
        
        throw new Error(
          `OptimisticLockError: Record was modified by another process. ` +
          `Expected version: ${expectedVersion}, Current version: ${currentVersion}. ` +
          `Please reload the record and try again.`
        );
      }
      
      // Version matches - proceed with original save()
      // The original save() will include all changed fields including audit fields set by beforeUpdate hook
      return originalSave.call(this, options);
    } else {
      // For new records, use original save
      return originalSave.call(this, options);
    }
  };
};

/**
 * Get default scope for soft delete filtering
 * Automatically excludes deleted rows from all queries
 * @returns {Object} Sequelize scope definition
 */
export const getDefaultScope = () => ({
  where: {
    isDeleted: false
  }
});

/**
 * Get additional scopes for querying deleted records
 * @returns {Object} Sequelize scopes object
 */
export const getScopes = () => ({
  /**
   * Scope to include deleted records
   * Overrides default scope by explicitly removing the isDeleted filter
   */
  withDeleted: {
    defaultScope: false,  // This removes the default scope
    where: {}  // Empty where clause means no filtering
  },
  
  /**
   * Scope to only get deleted records
   * Overrides default scope and filters for deleted records only
   */
  onlyDeleted: {
    defaultScope: false,  // This removes the default scope
    where: {
      isDeleted: true
    }
  }
});

