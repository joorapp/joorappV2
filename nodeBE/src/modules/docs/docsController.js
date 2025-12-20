/**
 * @author Bhavesh Venugopal
 * Docs Controller
 * Handles Swagger UI and OpenAPI specification endpoints
 */

import { createModuleLogger } from '../../utils/logger.js';
import { generateSwaggerSpec } from '../../config/swagger.js';
import yaml from 'js-yaml';

const logger = createModuleLogger('docs');

/**
 * Get OpenAPI JSON specification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSwaggerJson = (req, res) => {
  try {
    logger.info('Swagger JSON spec requested', {
      requestId: req.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    const spec = generateSwaggerSpec();
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(spec);
  } catch (error) {
    logger.error('Failed to generate Swagger JSON spec', error, {
      requestId: req.id
    });
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to generate Swagger specification',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get OpenAPI YAML specification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSwaggerYaml = (req, res) => {
  try {
    logger.info('Swagger YAML spec requested', {
      requestId: req.id,
      ip: req.ip || req.socket?.remoteAddress
    });

    const spec = generateSwaggerSpec();
    const yamlString = yaml.dump(spec, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    });
    
    res.setHeader('Content-Type', 'text/yaml');
    res.status(200).send(yamlString);
  } catch (error) {
    logger.error('Failed to generate Swagger YAML spec', error, {
      requestId: req.id
    });
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to generate Swagger specification',
      timestamp: new Date().toISOString()
    });
  }
};

