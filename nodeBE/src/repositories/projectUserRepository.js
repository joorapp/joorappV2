/**
 * @author Bhavesh Venugopal
 * ProjectUser Repository
 * Handles all database operations for ProjectUser assignments
 */

import { BaseRepository } from './base/BaseRepository.js';
import ProjectUser from '../models/ProjectUser.js';

class ProjectUserRepository extends BaseRepository {
  constructor() {
    super(ProjectUser);
  }

  // Add custom ProjectUser-specific methods here if needed
}

export const projectUserRepository = new ProjectUserRepository();
