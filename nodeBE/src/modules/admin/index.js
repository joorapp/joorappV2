/**
 * @author Bhavesh Venugopal
 * Admin Module Index
 * Exports admin module components
 */

import adminRoutes from './adminRoutes.js';

export {
  adminRoutes
};

export default {
  routes: adminRoutes,
  moduleName: 'admin'
};
