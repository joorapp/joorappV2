#!/bin/bash
set -e

# Wait for postgres to be ready
until pg_isready -U "$POSTGRES_USER" -d postgres; do
  sleep 1
done

# Keycloak database name (should match .env KEYCLOAK_DB_NAME)
KEYCLOAK_DB_NAME="${KEYCLOAK_DB_NAME}"

# Validate environment variable is set and not empty
if [ -z "$KEYCLOAK_DB_NAME" ]; then
    echo "Ã¢ÂÅ’ Error: KEYCLOAK_DB_NAME environment variable is not set or is empty"
    echo "   Please set KEYCLOAK_DB_NAME in your .env file"
    exit 1
fi

echo "Ã°Å¸â€œâ€¹ Creating Keycloak database: $KEYCLOAK_DB_NAME"

# Check if database exists, create if it doesn't
# CREATE DATABASE cannot be executed from a function/DO block
DB_EXISTS=$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" -tc "SELECT 1 FROM pg_database WHERE datname = '$KEYCLOAK_DB_NAME'")

if [ -z "$DB_EXISTS" ]; then
    echo "   Database does not exist, creating..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" -c "CREATE DATABASE \"$KEYCLOAK_DB_NAME\";"
else
    echo "   Database already exists, skipping creation"
fi

# Verify database was created
if ! psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" -tc "SELECT 1 FROM pg_database WHERE datname = '$KEYCLOAK_DB_NAME'" | grep -q 1; then
    echo "Ã¢ÂÅ’ Failed to create Keycloak database '$KEYCLOAK_DB_NAME'"
    exit 1
fi

echo "Keycloak database '$KEYCLOAK_DB_NAME' created (or already exists)"
echo "   Keycloak will create its own tables on first startup"
