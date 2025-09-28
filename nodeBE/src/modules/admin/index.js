/**
 * @author Bhavesh Venugopal
 * Admin Module Index
 * Exports admin module components
 */

import adminRoutes from './adminRoutes.js';
import { adminDocs } from './adminDocs.js';

export {
  adminRoutes,
  adminDocs
};

export default {
  routes: adminRoutes,
  docs: adminDocs,
  moduleName: 'admin'
};
