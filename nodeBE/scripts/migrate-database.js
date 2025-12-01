/**
 * @author Bhavesh Venugopal
 * Database Migration Script
 * Runs migrations on specified database (dev or test)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database type from command line (dev or test)
const dbType = process.argv[2] || 'dev';
const action = process.argv[3] || 'up'; // up or down

// Load appropriate .env file
let envPath;
if (dbType === 'test') {
  envPath = path.resolve(__dirname, '../.env.test.local');
} else {
  envPath = path.resolve(__dirname, '../.env');
}

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Failed to load environment file: ${envPath}`);
  console.error(result.error.message);
  process.exit(1);
}

console.log(`\n📊 Database Migration Tool`);
console.log(`Environment: ${dbType.toUpperCase()}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`Action: ${action.toUpperCase()}\n`);

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false
});

// Create Umzug instance
const umzug = new Umzug({
  migrations: {
    glob: ['../src/migrations/*.js', { cwd: __dirname }],
    resolve: ({ name, path: migrationPath, context }) => {
      // Use dynamic import for ES6 modules
      return {
        name,
        up: async () => {
          const migration = await import(`file://${migrationPath}`);
          return migration.up(context.queryInterface, Sequelize);
        },
        down: async () => {
          const migration = await import(`file://${migrationPath}`);
          return migration.down(context.queryInterface, Sequelize);
        },
      };
    },
  },
  context: { queryInterface: sequelize.getQueryInterface(), Sequelize },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Run migrations
async function runMigrations() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    if (action === 'up') {
      console.log('🚀 Running pending migrations...\n');
      const migrations = await umzug.up();
      
      if (migrations.length === 0) {
        console.log('✅ No pending migrations\n');
      } else {
        console.log(`\n✅ Successfully ran ${migrations.length} migration(s):`);
        migrations.forEach(m => console.log(`   - ${m.name}`));
        console.log('');
      }
    } else if (action === 'down') {
      console.log('⏬ Rolling back last migration...\n');
      const migrations = await umzug.down();
      
      if (migrations.length === 0) {
        console.log('✅ No migrations to roll back\n');
      } else {
        console.log(`\n✅ Successfully rolled back ${migrations.length} migration(s):`);
        migrations.forEach(m => console.log(`   - ${m.name}`));
        console.log('');
      }
    } else {
      console.error(`❌ Unknown action: ${action}`);
      console.error('   Use: up or down\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    console.error('');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run
runMigrations();

