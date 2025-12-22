# Docker Initialization Scripts

This directory contains initialization scripts for PostgreSQL databases in Docker.

## Scripts

- `init-keycloak-db.sh` - Creates the Keycloak database
- `init-test-db.sh` - Creates and initializes the test database

## Requirements

These scripts require the following environment variables to be set in `.env`:

- `KEYCLOAK_DB_NAME` - Name of the Keycloak database (e.g., `joorapp_KeycloakDB`)
- `TEST_DB_NAME` - Name of the test database (e.g., `joorapp_testDB`)
- `POSTGRES_USER` - PostgreSQL username (set automatically by docker-compose)
- `DB_USER` - Database user (passed to postgres container)

## Line Endings

**IMPORTANT**: These scripts must use Unix line endings (LF), not Windows line endings (CRLF).

If you're on Windows and the scripts fail with "cannot execute: required file not found", fix line endings:

```powershell
# Run the fix script from the docker directory
cd r:\joorappV2\nodeBE\docker
.\fix-line-endings.ps1
```

Or manually convert:

```powershell
(Get-Content init-keycloak-db.sh -Raw) -replace "`r`n", "`n" | [System.IO.File]::WriteAllText("init-keycloak-db.sh", $_, [System.Text.UTF8Encoding]::new($false))
(Get-Content init-test-db.sh -Raw) -replace "`r`n", "`n" | [System.IO.File]::WriteAllText("init-test-db.sh", $_, [System.Text.UTF8Encoding]::new($false))
```

**Note**: A `.gitattributes` file has been created to ensure these scripts always use LF line endings in Git.

## Execution Order

Scripts in `/docker-entrypoint-initdb.d/` are executed in alphabetical order:

1. `01-init-dev-db.sql` - Restores dev database
2. `02-init-keycloak-db.sh` - Creates Keycloak database
3. `03-init-test-db.sh` - Creates and restores test database

## Troubleshooting

If databases are not created:

1. Check Docker logs: `docker logs joorapp-postgres-dev`
2. Verify environment variables are set in `.env`
3. Ensure scripts have LF line endings (not CRLF)
4. Check that scripts are mounted correctly in `docker-compose.dev.yml`
