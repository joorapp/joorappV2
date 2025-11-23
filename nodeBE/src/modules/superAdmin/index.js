/**
 * @author Bhavesh Venugopal
 * Super Admin Module Index
 * Exports super admin module components
 */

import superAdminRoutes from './superAdminRoutes.js';
import { superAdminDocs } from './superAdminDocs.js';

export {
  superAdminRoutes,
  superAdminDocs
};

export default {
  routes: superAdminRoutes,
  docs: superAdminDocs,
  moduleName: 'superAdmin'
};

