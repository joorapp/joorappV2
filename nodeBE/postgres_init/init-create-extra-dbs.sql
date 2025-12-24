-- Create additional databases used by the application
-- NOTE: This file runs only on first initialization of the Postgres data directory.

-- Create test database (same style as dev DB: created at init time)
CREATE DATABASE "joorapp_testDB";

-- Create Keycloak database (empty; Keycloak will manage its own schema)
CREATE DATABASE "joorapp_KeycloakDB";


