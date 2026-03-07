/**
 * @author Bhavesh Venugopal
 * Client Repository
 * Handles all database operations for Clients
 */

import { BaseRepository } from './base/BaseRepository.js';
import Client from '../models/Client.js';

class ClientRepository extends BaseRepository {
  constructor() {
    super(Client);
  }

  // Add custom Client-specific methods here if needed
  // BaseRepository provides common CRUD operations:
  // create, findOne, findById, findAll, findAndCountAll, update, delete (soft), restore, forceDelete
}

export const clientRepository = new ClientRepository();
