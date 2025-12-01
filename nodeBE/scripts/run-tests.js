/**
 * @author Bhavesh Venugopal
 * Test Runner
 * Loads test environment and runs Jest
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.test.local
const envPath = path.resolve(__dirname, '../.env.test.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Failed to load .env.test.local:', result.error.message);
  process.exit(1);
}

console.log('✅ Test environment loaded');
console.log('📊 Database:', process.env.DB_NAME);

// Get Jest arguments from command line
const jestArgs = process.argv.slice(2);

// Run Jest
const jest = spawn(
  'node',
  [
    '--experimental-vm-modules',
    'node_modules/jest/bin/jest.js',
    ...jestArgs
  ],
  {
    stdio: 'inherit',
    env: process.env,  // Pass loaded env vars
    shell: true
  }
);

jest.on('exit', (code) => {
  process.exit(code);
});

