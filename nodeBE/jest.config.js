/**
 * @author Bhavesh Venugopal
 * Jest Configuration
 * ES6 modules support for testing
 */

export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 30000,
  transform: {},
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  coverageReporters: [
    'text',         // Detailed table (already showing)
    'text-summary', // Summary line (Coverage: 85% statements, 80% branches, ...)
    'lcov',         // For coverage tools (e.g., Codecov)
    'html'          // HTML report in coverage/ directory
  ],
  moduleFileExtensions: ['js', 'json'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/setup.js'
  ],
  verbose: true,
};

