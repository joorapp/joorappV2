/**
 * @author Bhavesh Venugopal
 * Docs Routes
 * Defines API endpoints for Swagger UI and OpenAPI specifications
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateSwaggerSpec } from '../../config/swagger.js';
import { getSwaggerJson, getSwaggerYaml } from './docsController.js';

const router = express.Router();

// Check if Swagger is enabled
const isSwaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';

if (isSwaggerEnabled) {
  try {
    // Generate Swagger spec
    const swaggerSpec = generateSwaggerSpec();

    /**
     * @route   GET /api/v2/docs
     * @desc    Swagger UI interface
     * @access  Public
     */
    router.use('/', swaggerUi.serve);
    router.get('/', swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'JoorApp API V2 Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
      }
    }));

    /**
     * @route   GET /api/v2/docs/json
     * @desc    OpenAPI JSON specification
     * @access  Public
     * Note: Also accessible at /api/v2/docs.json (registered in app.js)
     */
    router.get('/json', getSwaggerJson);

    /**
     * @route   GET /api/v2/docs/yaml
     * @desc    OpenAPI YAML specification
     * @access  Public
     * Note: Also accessible at /api/v2/docs.yaml (registered in app.js)
     */
    router.get('/yaml', getSwaggerYaml);
  } catch (error) {
    logger.error('Failed to initialize Swagger routes', error);
    // Still register routes but return error
    router.get('/', (req, res) => {
      res.status(500).json({
        success: false,
        error: 'SWAGGER_INIT_ERROR',
        message: 'Swagger documentation is not available',
        timestamp: new Date().toISOString()
      });
    });
  }
} else {
  // Return 503 when Swagger is disabled
  router.get('/', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'SERVICE_UNAVAILABLE',
      message: 'Swagger documentation is disabled',
      timestamp: new Date().toISOString()
    });
  });

  router.get('/json', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'SERVICE_UNAVAILABLE',
      message: 'Swagger documentation is disabled',
      timestamp: new Date().toISOString()
    });
  });

  router.get('/yaml', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'SERVICE_UNAVAILABLE',
      message: 'Swagger documentation is disabled',
      timestamp: new Date().toISOString()
    });
  });
}

export default router;

