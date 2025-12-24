-- Initialize the test database with the same schema as the dev database.
-- This script is executed by the Postgres entrypoint via psql.
--
-- Dev DB is created and initialized by:
--   01-init-dev-db.sql  (runs against POSTGRES_DB = joorapp_devDB)
--
-- Here we:
--   1) Connect to the test database created by init-create-extra-dbs.sql
--   2) Re-run the same init-dev-db.sql script against the test DB

-- Switch to the test database
\connect "joorapp_testDB"

-- Reuse the existing dev DB SQL dump to create the same schema in the test DB
\i /docker-entrypoint-initdb.d/01-init-dev-db.sql


