/**
 * @author Bhavesh Venugopal
 * Project Repository
 * Handles all database operations for Projects
 */

import { BaseRepository } from './base/BaseRepository.js';
import Project from '../models/Project.js';

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  // Add custom Project-specific methods here if needed
}

export const projectRepository = new ProjectRepository();
