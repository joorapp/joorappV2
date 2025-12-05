#!/bin/bash
set -e

# Wait for postgres to be ready
until pg_isready -U "$POSTGRES_USER" -d postgres; do
  sleep 1
done

# Create test database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    SELECT 'CREATE DATABASE joorapp_testDB'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'joorapp_testDB')\gexec
EOSQL

echo "✅ Test database 'joorapp_testDB' created (or already exists)"

