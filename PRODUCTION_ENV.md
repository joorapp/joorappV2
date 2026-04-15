# Production environment variables (GoDaddy VPS / Docker Compose)

Create a single file at the **repository root** named `.env.production`. Docker Compose reads it for **variable substitution** (build args, Postgres, Keycloak) **and** the `backend` service loads the same file via `env_file`.

**Start the stack:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## 1. Compose-only / shared (must match your public URLs)

These are referenced in `docker-compose.prod.yml` or passed into the **frontend build**.

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_NAME` | Yes | Primary Postgres database (app data). Example: `joorapp_prodDB`. |
| `DB_USER` | Yes | Postgres user (also used by Keycloak JDBC). |
| `DB_PASSWORD` | Yes | Strong password for `DB_USER`. |
| `KEYCLOAK_DB_NAME` | Yes | Must be **`joorapp_KeycloakDB`** — this name is created by `nodeBE/postgres_init/init-create-extra-dbs.sql`. |
| `KEYCLOAK_ADMIN` | Yes | Keycloak admin console username. |
| `KEYCLOAK_ADMIN_PASSWORD` | Yes | Keycloak admin password (strong). |
| `KC_HOSTNAME` | Yes | Public hostname for Keycloak **without** `https://` (e.g. `auth.yourdomain.com`). Used with `KC_PROXY=edge` so TLS can terminate on your reverse proxy. |
| `KEYCLOAK_PORT` | No | Host port mapped to Keycloak (default **8080**). Your proxy on the VPS should forward `https://auth...` to `127.0.0.1:${KEYCLOAK_PORT}`. |
| `HTTP_PORT` | No | Host port for the **frontend** Nginx container (default **80**). |
| `VITE_API_BASE_URL` | Yes | **Public origin** the browser uses for API calls. With the bundled Nginx config, use the **same** origin as the SPA (e.g. `https://app.yourdomain.com`) so `/api/...` is proxied to the backend. **No trailing slash.** |
| `VITE_API_TIMEOUT` | No | Frontend API timeout ms (default **10000**). |
| `IMAGE_TAG` | No | Tag for built images (default **prod**). |

---

## 2. Backend (`backend` service — same `.env.production`)

Set these so the API and Keycloak client match your deployment.

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `3030` (internal; matches Nginx `proxy_pass` in `frontend/nginx.conf`). |
| `HOST` | Yes | `0.0.0.0` or `localhost` (used for logging; listener binds to all interfaces when using port only). |
| `CORS_ORIGIN` | Yes | **Exact** browser origin of the SPA, e.g. `https://app.yourdomain.com`. Do **not** use `*` with credentials. |
| `DB_HOST` | Yes | Set to **`postgres`** in Compose (Compose overrides this; do not use `localhost` in production compose). |
| `DB_PORT` | Yes | `5432` |
| `DB_NAME` | Yes | Same as Compose `DB_NAME`. |
| `DB_USER` | Yes | Same as Compose. |
| `DB_PASSWORD` | Yes | Same as Compose. |
| `KEYCLOAK_URL` | Yes | Public base URL of Keycloak, e.g. `https://auth.yourdomain.com` (scheme + host; port only if non-default). Must match realm/issuer and be reachable from **users’ browsers** and from the **backend** (see note below). |
| `KEYCLOAK_REALM` | Yes | Realm name (must match `realm-export.json`), e.g. `JOOR_APP_V2`. |
| `KEYCLOAK_CLIENT_ID` | Yes | Client ID for the app. |
| `KEYCLOAK_CLIENT_SECRET` | Yes | Client secret (must match Keycloak client). |
| `KEYCLOAK_PORT` | Optional | Used only if your tooling reads it; container Keycloak listens on **8080** internally. |
| `KEYCLOAK_DB_NAME` | Yes | Same as Compose — **`joorapp_KeycloakDB`**. |
| `JWT_SECRET` | Yes | Strong random string (see `nodeBE/env.example`). |
| `JWT_EXPIRE` | Yes | e.g. `7d` |
| `API_VERSION` | Yes | `v2` |
| `API_PREFIX` | Yes | `/api` |
| `SWAGGER_ENABLED` | Recommended | `false` in production unless you protect `/api/v2/docs`. |
| `LOG_FILE_PATH` | Yes | e.g. `/app/logs` |
| `LOG_MAX_SIZE` | Yes | e.g. `10m` |
| `LOG_MAX_FILES` | Yes | e.g. `5d` |
| `LOG_DATE_PATTERN` | Yes | e.g. `DD-MM-YYYY` |

Optional / legacy entries from `nodeBE/env.example` (`KEYCLOAK_ADMIN`, etc.) may be present for local tooling; the **running** Keycloak container uses the Compose `KEYCLOAK_*` admin vars.

---

## 3. Keycloak client & reverse proxy on the VPS

1. In Keycloak admin, set the client’s **Valid redirect URIs** and **Web origins** to your real SPA URL (`CORS_ORIGIN` / `VITE_API_BASE_URL` origin).
2. Terminate TLS on **Nginx**, **Caddy**, or **Apache** on the host and proxy:
   - `https://app...` → `http://127.0.0.1:${HTTP_PORT}` (frontend)
   - `https://auth...` → `http://127.0.0.1:${KEYCLOAK_PORT}` (Keycloak)
3. **Backend ↔ Keycloak URL:** `KEYCLOAK_URL` must resolve and be reachable from inside the `backend` container (admin API / JWKS). If `https://auth.yourdomain.com` does not resolve from Docker, add `extra_hosts` or use your LAN/gateway IP in `/etc/hosts` for testing.

---

## 4. After the first deploy

1. **Migrations** (Postgres healthy, backend image built):

   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend node scripts/migrate-database.js dev up
   ```

   (`dev` here is only the script’s profile name; it uses `DB_NAME` from the environment.)

2. **Super admin** (if you use the project script): run `configure:super-admin` from a context that can reach Keycloak and the DB, per `nodeBE/STARTUP_GUIDE.md`.

---

## 5. Network layout (compose)

| Network | Services | Purpose |
|---------|----------|---------|
| `app_internal` | `postgres`, `keycloak`, `backend`, `frontend` | Database, API, IdP, and Nginx → API proxy. |
| `web_public` | `keycloak`, `frontend` | Surfaces that typically receive inbound HTTP(S) from the host port mapping. |

The **backend** is not published to the host; browsers reach it only via **frontend** Nginx at `/api/`.

---

## 6. Minimal `.env.production` template (fill placeholders)

```env
# Compose + Postgres + Keycloak
DB_NAME=joorapp_prodDB
DB_USER=joorapp_prod
DB_PASSWORD=CHANGE_ME
KEYCLOAK_DB_NAME=joorapp_KeycloakDB
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=CHANGE_ME
KC_HOSTNAME=auth.example.com
KEYCLOAK_PORT=8080
HTTP_PORT=80
IMAGE_TAG=prod

# Frontend build (same origin as SPA; Nginx proxies /api to backend)
VITE_API_BASE_URL=https://app.example.com
VITE_API_TIMEOUT=10000

# Backend
NODE_ENV=production
PORT=3030
HOST=0.0.0.0
CORS_ORIGIN=https://app.example.com
KEYCLOAK_URL=https://auth.example.com
KEYCLOAK_REALM=JOOR_APP_V2
KEYCLOAK_CLIENT_ID=Joor_App_Client
KEYCLOAK_CLIENT_SECRET=CHANGE_ME
JWT_SECRET=CHANGE_ME_LONG_RANDOM
JWT_EXPIRE=7d
API_VERSION=v2
API_PREFIX=/api
SWAGGER_ENABLED=false
LOG_FILE_PATH=/app/logs
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5d
LOG_DATE_PATTERN=DD-MM-YYYY
```

Adjust hostnames and secrets. Keep `KEYCLOAK_DB_NAME` aligned with the init SQL.
