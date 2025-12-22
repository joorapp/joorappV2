#!/bin/bash
set -e

# Wait for postgres to be ready
until pg_isready -U "$POSTGRES_USER" -d postgres; do
  sleep 1
done

# Test database name (should match .env TEST_DB_NAME or .env.test.local DB_NAME)
TEST_DB_NAME="${TEST_DB_NAME}"

# Validate environment variable is set and not empty
if [ -z "$TEST_DB_NAME" ]; then
    echo "Ã¢ÂÅ’ Error: TEST_DB_NAME environment variable is not set or is empty"
    echo "   Please set TEST_DB_NAME in your .env file"
    exit 1
fi

echo "Ã°Å¸â€œâ€¹ Creating test database: $TEST_DB_NAME"

# Check if database exists, create if it doesn't
# CREATE DATABASE cannot be executed from a function/DO block
DB_EXISTS=$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" -tc "SELECT 1 FROM pg_database WHERE datname = '$TEST_DB_NAME'")

if [ -z "$DB_EXISTS" ]; then
    echo "   Database does not exist, creating..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" -c "CREATE DATABASE \"$TEST_DB_NAME\";"
else
    echo "   Database already exists, skipping creation"
fi

# Verify database was created
if ! psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" -tc "SELECT 1 FROM pg_database WHERE datname = '$TEST_DB_NAME'" | grep -q 1; then
    echo "Ã¢ÂÅ’ Failed to create test database '$TEST_DB_NAME'"
    exit 1
fi

echo "Test database '$TEST_DB_NAME' created (or already exists)"

# Wait a bit for database to be fully ready
sleep 2

# Restore the same SQL dump used for dev DB to ensure schema consistency
# This ensures test DB has the exact same schema as dev DB (no code column in companies table)
SQL_DUMP_PATH="/docker-entrypoint-initdb.d/01-init-dev-db.sql"

if [ -f "$SQL_DUMP_PATH" ]; then
    echo "Ã°Å¸â€œÂ¥ Restoring SQL dump to test database '$TEST_DB_NAME'..."
    
    # Restore SQL dump to test database
    # The SQL dump should work as-is since we're connecting to the test database
    # pg_dump output is database-agnostic and will restore to whatever database we connect to
    # Use ON_ERROR_STOP=0 to continue on errors (some statements might fail if objects already exist)
    if psql --username "$POSTGRES_USER" --dbname "$TEST_DB_NAME" < "$SQL_DUMP_PATH" 2>&1; then
        echo "Test database '$TEST_DB_NAME' restored from SQL dump"
        echo "Test database now has same schema as dev database"
    else
        echo "Ã¢Å¡Â Ã¯Â¸Â  Warning: Some errors occurred during SQL dump restoration (this may be normal)"
        echo "   Verifying test database schema..."
        # Verify key tables exist
        if psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$TEST_DB_NAME" -tc "SELECT 1 FROM information_schema.tables WHERE table_name = 'companies'" | grep -q 1; then
            echo "Test database schema verified - companies table exists"
        else
            echo "Ã¢ÂÅ’ Test database schema incomplete - companies table not found"
            exit 1
        fi
    fi
else
    echo "Ã¢Å¡Â Ã¯Â¸Â  Warning: SQL dump not found at $SQL_DUMP_PATH"
    echo "   Test database '$TEST_DB_NAME' created but not restored from dump"
    echo "   You may need to run migrations manually: npm run migrate:test"
fi
