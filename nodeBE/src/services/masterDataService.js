/**
 * @author Bhavesh Venugopal
 * Master Data Service
 * Handles seeding of system-required master data on application startup
 * Ensures critical system data (like BASIC plan) exists and is properly configured
 */

import { createModuleLogger } from '../utils/logger.js';
import { planRepository } from '../repositories/planRepository.js';
import { BASIC_PLAN_MASTER_DATA, MASTER_DATA_CONFIG } from '../constants/masterData.js';
import { Plan } from '../models/index.js';

const logger = createModuleLogger('masterDataService');

/**
 * Check and seed BASIC plan
 * Ensures BASIC plan exists and is active (not soft-deleted)
 * Updates plan if it exists but doesn't match master data
 * Restores plan if it's soft-deleted
 * Creates plan if it doesn't exist
 * @returns {Promise<Object>} Seeding result { seeded: boolean, plan: Object|null, action: string }
 * @throws {Error} If seeding fails
 */
export async function checkAndSeedBasicPlan() {
  logger.debug('Checking BASIC plan master data');
  
  try {
    // Check if BASIC plan exists (including soft-deleted) - use unscoped to bypass default scope
    const existingPlan = await Plan.unscoped().findOne({
      where: { code: BASIC_PLAN_MASTER_DATA.code }
    });
    
    if (existingPlan) {
      // Plan exists - check if it's soft-deleted
      if (existingPlan.isDeleted) {
        // Restore soft-deleted BASIC plan
        logger.info('Restoring soft-deleted BASIC plan', { planId: existingPlan.id });
        
        // Use repository restore method (no context required for master data)
        const restoredPlan = await planRepository.restore(existingPlan.id);
        
        logger.info('BASIC plan restored successfully', { planId: restoredPlan.id });
        return { seeded: true, plan: restoredPlan, action: 'restored' };
      }
      
      // Plan exists and is active - update if needed to match master data
      let needsUpdate = false;
      const updates = {};
      
      if (existingPlan.name !== BASIC_PLAN_MASTER_DATA.name) {
        updates.name = BASIC_PLAN_MASTER_DATA.name;
        needsUpdate = true;
      }
      if (existingPlan.description !== BASIC_PLAN_MASTER_DATA.description) {
        updates.description = BASIC_PLAN_MASTER_DATA.description;
        needsUpdate = true;
      }
      if (parseFloat(existingPlan.price) !== BASIC_PLAN_MASTER_DATA.price) {
        updates.price = BASIC_PLAN_MASTER_DATA.price;
        needsUpdate = true;
      }
      if (existingPlan.isActive !== BASIC_PLAN_MASTER_DATA.isActive) {
        updates.isActive = BASIC_PLAN_MASTER_DATA.isActive;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        logger.info('Updating BASIC plan to match master data', { 
          planId: existingPlan.id,
          updates 
        });
        
        // Use repository update method (no context required for master data)
        const updatedPlan = await planRepository.update(existingPlan.id, updates);
        
        logger.info('BASIC plan updated to match master data', { planId: updatedPlan.id });
        return { seeded: true, plan: updatedPlan, action: 'updated' };
      }
      
      logger.debug('BASIC plan exists and matches master data', { planId: existingPlan.id });
      return { seeded: false, plan: existingPlan, action: 'exists' };
    }
    
    // Plan doesn't exist - create it
    logger.info('Creating BASIC plan master data');
    
    // Use repository to create plan (no context required for master data)
    const newPlan = await planRepository.create({
      name: BASIC_PLAN_MASTER_DATA.name,
      code: BASIC_PLAN_MASTER_DATA.code,
      description: BASIC_PLAN_MASTER_DATA.description,
      price: BASIC_PLAN_MASTER_DATA.price,
      isActive: BASIC_PLAN_MASTER_DATA.isActive
    });
    
    logger.info('BASIC plan created successfully', { planId: newPlan.id });
    return { seeded: true, plan: newPlan, action: 'created' };
    
  } catch (error) {
    logger.error('Failed to seed BASIC plan', error);
    throw error;
  }
}

/**
 * Check and seed all master data
 * Main entry point for master data seeding
 * Called during application startup after models are initialized
 * @returns {Promise<Object>} Seeding results for all master data types
 * 
 * @example
 * const results = await checkAndSeedMasterData();
 * // results = {
 * //   BASIC_PLAN: { seeded: true, plan: {...}, action: 'created' },
 * //   errors: []
 * // }
 */
export async function checkAndSeedMasterData() {
  logger.info('Starting master data seeding check');
  
  const results = {
    BASIC_PLAN: null,
    // Future: Add other master data results
    // DEFAULT_ROLES: null,
    errors: []
  };
  
  try {
    // Seed BASIC plan
    results.BASIC_PLAN = await checkAndSeedBasicPlan();
    logger.info('BASIC plan seeding completed', { 
      action: results.BASIC_PLAN.action,
      planId: results.BASIC_PLAN.plan?.id 
    });
  } catch (error) {
    logger.error('BASIC plan seeding failed', error);
    results.errors.push({ 
      type: 'BASIC_PLAN', 
      error: error.message,
      stack: error.stack 
    });
  }
  
  // Future: Add other master data seeding here
  // try {
  //   results.DEFAULT_ROLES = await checkAndSeedDefaultRoles();
  //   logger.info('Default roles seeding completed', results.DEFAULT_ROLES);
  // } catch (error) {
  //   logger.error('Default roles seeding failed', error);
  //   results.errors.push({ type: 'DEFAULT_ROLES', error: error.message });
  // }
  
  const seededCount = Object.values(results)
    .filter(r => r && typeof r === 'object' && r.seeded === true).length;
  const errorCount = results.errors.length;
  
  if (errorCount > 0) {
    logger.warn('Master data seeding completed with errors', {
      seeded: seededCount,
      errors: errorCount,
      errorDetails: results.errors
    });
  } else {
    logger.info('Master data seeding completed successfully', {
      seeded: seededCount,
      total: Object.keys(MASTER_DATA_CONFIG).length
    });
  }
  
  return results;
}


