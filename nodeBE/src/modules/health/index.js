/**
 * @author Bhavesh Venugopal
 * Health Module Index
 * Exports health module components
 */

import healthRoutes from './healthRoutes.js';
import { healthDocs } from './healthDocs.js';

export {
  healthRoutes,
  healthDocs
};

export default {
  routes: healthRoutes,
  docs: healthDocs,
  moduleName: 'health'
};
