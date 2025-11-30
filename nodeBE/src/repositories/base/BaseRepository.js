/**
 * @author Bhavesh Venugopal
 * BaseRepository
 * Abstract base class providing common CRUD operations for all repositories
 * Implements repository pattern with support for soft delete via Sequelize scopes
 */

import { createModuleLogger } from '../../utils/logger.js';
import { validateContext } from '../../utils/contextHelpers.js';
import { NotFoundError } from '../../utils/errors.js';

/**
 * Abstract base repository class
 * Provides common database operations for all entity repositories
 * Cannot be instantiated directly - must be extended by specific repository classes
 */
export class BaseRepository {
  /**
   * Constructor for BaseRepository
   * @param {Object} Model - Sequelize model instance
   * @param {string} entityName - Name of the entity (e.g., 'User', 'Company')
   * @throws {Error} If attempting to instantiate BaseRepository directly
   */
  constructor(Model, entityName) {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository is abstract and cannot be instantiated directly');
    }

    this.Model = Model;
    this.entityName = entityName;
    this.logger = createModuleLogger(`${entityName}Repository`);
  }

  // ========================================
  // Standard Methods (Exclude Deleted)
  // ========================================

  /**
   * Find entity by ID (excludes soft-deleted records)
   * @param {string} id - Entity UUID
   * @param {Object} options - Sequelize query options (include, attributes, etc.)
   * @returns {Promise<Object|null>} Entity instance or null if not found
   */
  async findById(id, options = {}) {
    this.logger.debug(`Finding ${this.entityName} by ID`, { id });
    return await this.Model.findByPk(id, options);
  }

  /**
   * Find entity by ID or throw error (excludes soft-deleted records)
   * @param {string} id - Entity UUID
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object>} Entity instance
   * @throws {NotFoundError} If entity not found
   */
  async findByIdOrFail(id, options = {}) {
    const entity = await this.findById(id, options);
    
    if (!entity) {
      throw new NotFoundError(this.entityName, id);
    }
    
    return entity;
  }

  /**
   * Find all entities matching filters (excludes soft-deleted records)
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options (limit, offset, include, etc.)
   * @returns {Promise<Array>} Array of entity instances
   */
  async findAll(filters = {}, options = {}) {
    this.logger.debug(`Finding all ${this.entityName}`, { filters });
    return await this.Model.findAll({
      where: filters,
      ...options
    });
  }

  /**
   * Find one entity matching filters (excludes soft-deleted records)
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object|null>} Entity instance or null if not found
   */
  async findOne(filters = {}, options = {}) {
    this.logger.debug(`Finding one ${this.entityName}`, { filters });
    return await this.Model.findOne({
      where: filters,
      ...options
    });
  }

  /**
   * Find one entity matching filters or throw error (excludes soft-deleted records)
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object>} Entity instance
   * @throws {NotFoundError} If entity not found
   */
  async findOneOrFail(filters = {}, options = {}) {
    const entity = await this.findOne(filters, options);
    
    if (!entity) {
      throw new NotFoundError(this.entityName);
    }
    
    return entity;
  }

  /**
   * Count entities matching filters (excludes soft-deleted records)
   * @param {Object} filters - Sequelize where clause filters
   * @returns {Promise<number>} Count of entities
   */
  async count(filters = {}) {
    this.logger.debug(`Counting ${this.entityName}`, { filters });
    return await this.Model.count({
      where: filters
    });
  }

  /**
   * Find and count entities (excludes soft-deleted records)
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options (limit, offset, include, etc.)
   * @returns {Promise<Object>} { rows: Array, count: number }
   */
  async findAndCountAll(filters = {}, options = {}) {
    this.logger.debug(`Finding and counting ${this.entityName}`, { filters });
    return await this.Model.findAndCountAll({
      where: filters,
      ...options
    });
  }

  // ========================================
  // Methods Including Deleted
  // ========================================

  /**
   * Find entity by ID including soft-deleted records
   * @param {string} id - Entity UUID
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object|null>} Entity instance or null if not found
   */
  async findByIdIncludingDeleted(id, options = {}) {
    this.logger.debug(`Finding ${this.entityName} by ID (including deleted)`, { id });
    return await this.Model.scope('withDeleted').findByPk(id, options);
  }

  /**
   * Find entity by ID including soft-deleted records or throw error
   * @param {string} id - Entity UUID
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object>} Entity instance
   * @throws {NotFoundError} If entity not found
   */
  async findByIdIncludingDeletedOrFail(id, options = {}) {
    const entity = await this.findByIdIncludingDeleted(id, options);
    
    if (!entity) {
      throw new NotFoundError(this.entityName, id);
    }
    
    return entity;
  }

  /**
   * Find all entities including soft-deleted records
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Array>} Array of entity instances
   */
  async findAllIncludingDeleted(filters = {}, options = {}) {
    this.logger.debug(`Finding all ${this.entityName} (including deleted)`, { filters });
    return await this.Model.scope('withDeleted').findAll({
      where: filters,
      ...options
    });
  }

  /**
   * Find one entity including soft-deleted records
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object|null>} Entity instance or null if not found
   */
  async findOneIncludingDeleted(filters = {}, options = {}) {
    this.logger.debug(`Finding one ${this.entityName} (including deleted)`, { filters });
    return await this.Model.scope('withDeleted').findOne({
      where: filters,
      ...options
    });
  }

  /**
   * Find one entity including soft-deleted records or throw error
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object>} Entity instance
   * @throws {NotFoundError} If entity not found
   */
  async findOneIncludingDeletedOrFail(filters = {}, options = {}) {
    const entity = await this.findOneIncludingDeleted(filters, options);
    
    if (!entity) {
      throw new NotFoundError(this.entityName);
    }
    
    return entity;
  }

  /**
   * Count entities including soft-deleted records
   * @param {Object} filters - Sequelize where clause filters
   * @returns {Promise<number>} Count of entities
   */
  async countIncludingDeleted(filters = {}) {
    this.logger.debug(`Counting ${this.entityName} (including deleted)`, { filters });
    return await this.Model.scope('withDeleted').count({
      where: filters
    });
  }

  /**
   * Find and count entities including soft-deleted records
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object>} { rows: Array, count: number }
   */
  async findAndCountAllIncludingDeleted(filters = {}, options = {}) {
    this.logger.debug(`Finding and counting ${this.entityName} (including deleted)`, { filters });
    return await this.Model.scope('withDeleted').findAndCountAll({
      where: filters,
      ...options
    });
  }

  // ========================================
  // Methods for Deleted Records Only
  // ========================================

  /**
   * Find entity by ID only if soft-deleted
   * @param {string} id - Entity UUID
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object|null>} Entity instance or null if not found or not deleted
   */
  async findByIdDeleted(id, options = {}) {
    this.logger.debug(`Finding deleted ${this.entityName} by ID`, { id });
    return await this.Model.scope('onlyDeleted').findByPk(id, options);
  }

  /**
   * Find all soft-deleted entities
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Array>} Array of soft-deleted entity instances
   */
  async findAllDeleted(filters = {}, options = {}) {
    this.logger.debug(`Finding all deleted ${this.entityName}`, { filters });
    return await this.Model.scope('onlyDeleted').findAll({
      where: filters,
      ...options
    });
  }

  /**
   * Find one soft-deleted entity
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object|null>} Entity instance or null if not found or not deleted
   */
  async findOneDeleted(filters = {}, options = {}) {
    this.logger.debug(`Finding one deleted ${this.entityName}`, { filters });
    return await this.Model.scope('onlyDeleted').findOne({
      where: filters,
      ...options
    });
  }

  /**
   * Count soft-deleted entities
   * @param {Object} filters - Sequelize where clause filters
   * @returns {Promise<number>} Count of soft-deleted entities
   */
  async countDeleted(filters = {}) {
    this.logger.debug(`Counting deleted ${this.entityName}`, { filters });
    return await this.Model.scope('onlyDeleted').count({
      where: filters
    });
  }

  /**
   * Find and count soft-deleted entities
   * @param {Object} filters - Sequelize where clause filters
   * @param {Object} options - Sequelize query options
   * @returns {Promise<Object>} { rows: Array, count: number }
   */
  async findAndCountAllDeleted(filters = {}, options = {}) {
    this.logger.debug(`Finding and counting deleted ${this.entityName}`, { filters });
    return await this.Model.scope('onlyDeleted').findAndCountAll({
      where: filters,
      ...options
    });
  }

  // ========================================
  // CRUD Operations
  // ========================================

  /**
   * Create new entity
   * @param {Object} data - Entity data
   * @param {Object} context - Audit context { userId, companyId? }
   * @param {Object} options - Sequelize options (transaction, etc.)
   * @returns {Promise<Object>} Created entity instance
   * @throws {Error} If context is invalid
   */
  async create(data, context, options = {}) {
    validateContext(context, ['userId']);
    
    this.logger.debug(`Creating ${this.entityName}`, { data, context });
    
    return await this.Model.create(data, {
      ...options,
      context: {
        userId: context.userId,
        companyId: context.companyId || null
      }
    });
  }

  /**
   * Update entity by ID
   * @param {string} id - Entity UUID
   * @param {Object} data - Update data
   * @param {Object} context - Audit context { userId }
   * @param {Object} options - Sequelize options (transaction, etc.)
   * @returns {Promise<Object>} Updated entity instance
   * @throws {NotFoundError} If entity not found
   * @throws {Error} If context is invalid
   */
  async update(id, data, context, options = {}) {
    validateContext(context, ['userId']);
    
    this.logger.debug(`Updating ${this.entityName}`, { id, data, context });
    
    const entity = await this.findByIdOrFail(id, options);
    
    await entity.update(data, {
      ...options,
      context: {
        userId: context.userId
      }
    });
    
    return entity;
  }

  /**
   * Soft delete entity by ID
   * @param {string} id - Entity UUID
   * @param {Object} context - Audit context { userId }
   * @param {Object} options - Sequelize options (transaction, etc.)
   * @returns {Promise<Object>} Soft-deleted entity instance
   * @throws {NotFoundError} If entity not found
   * @throws {Error} If context is invalid
   */
  async delete(id, context, options = {}) {
    validateContext(context, ['userId']);
    
    this.logger.debug(`Soft deleting ${this.entityName}`, { id, context });
    
    const entity = await this.findByIdOrFail(id, options);
    
    await entity.destroy({
      ...options,
      context: {
        userId: context.userId
      }
    });
    
    return entity;
  }

  /**
   * Restore soft-deleted entity by ID
   * @param {string} id - Entity UUID
   * @param {Object} context - Audit context { userId }
   * @param {Object} options - Sequelize options (transaction, etc.)
   * @returns {Promise<Object>} Restored entity instance
   * @throws {NotFoundError} If entity not found in deleted records
   * @throws {Error} If context is invalid
   */
  async restore(id, context, options = {}) {
    validateContext(context, ['userId']);
    
    this.logger.debug(`Restoring ${this.entityName}`, { id, context });
    
    // Find in deleted records only
    const entity = await this.findByIdDeleted(id, options);
    
    if (!entity) {
      throw new NotFoundError(`Deleted ${this.entityName}`, id);
    }
    
    // Restore by setting isDeleted to false
    entity.isDeleted = false;
    entity.deletedUserId = null;
    entity.updatedDate = new Date();
    entity.updatedUserId = context.userId;
    
    await entity.save({
      ...options,
      hooks: false,
      context: {
        userId: context.userId
      }
    });
    
    return entity;
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Check if entity exists matching filters (excludes soft-deleted records)
   * @param {Object} filters - Sequelize where clause filters
   * @returns {Promise<boolean>} True if entity exists
   */
  async exists(filters = {}) {
    this.logger.debug(`Checking if ${this.entityName} exists`, { filters });
    const count = await this.Model.count({
      where: filters
    });
    return count > 0;
  }

  /**
   * Bulk create multiple entities
   * @param {Array<Object>} records - Array of entity data objects
   * @param {Object} context - Audit context { userId, companyId? }
   * @param {Object} options - Sequelize options (transaction, etc.)
   * @returns {Promise<Array>} Array of created entity instances
   * @throws {Error} If context is invalid
   */
  async bulkCreate(records, context, options = {}) {
    validateContext(context, ['userId']);
    
    this.logger.debug(`Bulk creating ${this.entityName}`, { count: records.length, context });
    
    return await this.Model.bulkCreate(records, {
      ...options,
      context: {
        userId: context.userId,
        companyId: context.companyId || null
      }
    });
  }
}

