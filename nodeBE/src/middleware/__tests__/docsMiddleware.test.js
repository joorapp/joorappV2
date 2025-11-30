/**
 * @author Bhavesh Venugopal
 * Documentation Middleware Tests
 * Tests for docsMiddleware documentation formatting functionality
 */

import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';

let docsMiddleware;

beforeAll(async () => {
  docsMiddleware = await import('../docsMiddleware.js');
});

describe('Documentation Middleware', () => {
  let req, res;
  const mockDocs = {
    module: 'users',
    description: 'User management endpoints',
    version: '2.0.0',
    basePath: '/api/v2/users',
    lastUpdated: '2025-01-01',
    totalEndpoints: 2,
    endpoints: [
      {
        method: 'GET',
        path: '/api/v2/users',
        summary: 'List users',
        description: 'Get a list of all users',
        tags: ['users', 'list'],
        responseExample: { users: [] },
        statusCodes: { 200: 'Success', 500: 'Server Error' }
      }
    ],
    examples: {
      curl: {
        list: 'curl -X GET http://localhost:3000/api/v2/users'
      },
      javascript: {
        list: 'fetch("/api/v2/users")'
      }
    },
    notes: ['Note 1', 'Note 2']
  };

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {}
    };

    res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('formatDocsResponse', () => {
    it('should format JSON response by default', () => {
      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'users module documentation',
        data: {
          ...mockDocs,
          timestamp: expect.any(String),
          requestedAt: expect.any(String),
          format: 'json'
        }
      });
    });

    it('should format JSON response when format=json is specified', () => {
      // Arrange
      req.query.format = 'json';

      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(res.json).toHaveBeenCalled();
    });

    it('should format HTML response when format=html is specified', () => {
      // Arrange
      req.query.format = 'html';

      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
      const htmlContent = res.send.mock.calls[0][0];
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('users API Documentation');
      expect(htmlContent).toContain('GET');
      expect(htmlContent).toContain('/api/v2/users');
    });

    it('should format Markdown response when format=markdown is specified', () => {
      // Arrange
      req.query.format = 'markdown';

      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/markdown');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
      const markdownContent = res.send.mock.calls[0][0];
      expect(markdownContent).toContain('# users API Documentation');
      expect(markdownContent).toContain('## Endpoints');
      expect(markdownContent).toContain('### GET /api/v2/users');
    });

    it('should include examples by default', () => {
      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.data.examples).toBeDefined();
    });

    it('should exclude examples when examples=false', () => {
      // Arrange
      req.query.examples = 'false';

      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.data.examples).toBeUndefined();
    });

    it('should include examples when examples=true', () => {
      // Arrange
      req.query.examples = 'true';

      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.data.examples).toBeDefined();
    });

    it('should include timestamp and requestedAt in response', () => {
      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.data.timestamp).toBeDefined();
      expect(response.data.requestedAt).toBeDefined();
      expect(typeof response.data.timestamp).toBe('string');
      expect(typeof response.data.requestedAt).toBe('string');
    });

    it('should handle case-insensitive format parameter', () => {
      // Arrange
      req.query.format = 'HTML';

      // Act
      docsMiddleware.formatDocsResponse(mockDocs, req, res);

      // Assert
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
    });

    it('should handle docs without examples', () => {
      // Arrange
      const docsWithoutExamples = { ...mockDocs };
      delete docsWithoutExamples.examples;

      // Act
      docsMiddleware.formatDocsResponse(docsWithoutExamples, req, res);

      // Assert
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.data.examples).toBeUndefined();
    });

    it('should handle docs without notes', () => {
      // Arrange
      const docsWithoutNotes = { ...mockDocs };
      delete docsWithoutNotes.notes;

      // Act
      docsMiddleware.formatDocsResponse(docsWithoutNotes, req, res);

      // Assert
      expect(res.json).toHaveBeenCalled();
    });
  });
});

