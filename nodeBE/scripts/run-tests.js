/**
 * @author Bhavesh Venugopal
 * Test Runner
 * Loads test environment, cleans database, sets up test users, and runs Jest
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';

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

/**
 * Run a script and wait for it to complete
 * @param {string} scriptPath - Path to script file
 * @param {string} scriptName - Name of script for logging
 * @returns {Promise<void>}
 */
const runScript = (scriptPath, scriptName) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Running ${scriptName}...`);
    const script = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });

    script.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully\n`);
        resolve();
      } else {
        console.error(`❌ ${scriptName} failed with exit code ${code}`);
        reject(new Error(`${scriptName} failed with exit code ${code}`));
      }
    });

    script.on('error', (error) => {
      console.error(`❌ Error running ${scriptName}:`, error.message);
      reject(error);
    });
  });
};

/**
 * Run Jest tests and wait for completion
 * @param {string[]} jestArgs - Jest command line arguments
 * @returns {Promise<number>} Exit code
 */
const runJest = (jestArgs) => {
  return new Promise((resolve) => {
    const jest = spawn(
      'node',
      [
        '--experimental-vm-modules',
        'node_modules/jest/bin/jest.js',
        ...jestArgs
      ],
      {
        stdio: 'inherit',
        env: process.env,
        shell: true
      }
    );

    jest.on('exit', (code) => {
      resolve(code || 0);
    });

    jest.on('error', (error) => {
      console.error('❌ Error running Jest:', error.message);
      resolve(1);
    });
  });
};

/**
 * Main test runner function
 * Execution order:
 * 1. Clean database
 * 2. Setup test users (needed for integration tests)
 * 3. Run all tests in one Jest run (unit + integration)
 * 
 * All output is continuous (stdio: 'inherit') so you see all progress in one flow
 * Final summary includes all tests and coverage in one report
 */
const runTests = async () => {
  try {
    // Step 1: Clean test database
    await runScript(
      path.resolve(__dirname, 'clean-test-database.js'),
      'Database Cleanup'
    );

    // Step 2: Setup test users (needed for integration tests)
    await runScript(
      path.resolve(__dirname, 'setup-test-users.js'),
      'Test Users Setup'
    );

    // Step 3: Run all tests in one Jest run
    // This gives one continuous output and one final summary with coverage
    console.log('🚀 Running all tests...\n');
    
    // Get Jest arguments from command line (pass through all args including --coverage)
    const jestArgs = process.argv.slice(2);

    // Run all tests - one continuous run, one final summary
    const testExitCode = await runJest(jestArgs);
    
    process.exit(testExitCode);

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    process.exit(1);
  }
};

// Run tests
runTests();

