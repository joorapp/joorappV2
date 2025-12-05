# Quick Guide: Exporting Keycloak Configuration

This is a quick reference for exporting your Keycloak realm configuration. For full setup instructions, see `SETUP_INSTRUCTIONS.md`.

## Prerequisites

1. Make sure your Keycloak container is running:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d keycloak
   ```

2. Wait for Keycloak to be ready (check logs):
   ```bash
   docker logs joorapp-keycloak-dev
   ```
   Look for: `"Running the server in development mode"`

## Method 1: Via Keycloak Admin UI (Recommended)

### Step 1: Access Keycloak Admin Console

1. Open your browser and go to: `http://localhost:8080`
2. Click **"Administration Console"**
3. Login with your admin credentials:
   - Username: `admin` (or your `KEYCLOAK_ADMIN` value)
   - Password: `admin` (or your `KEYCLOAK_ADMIN_PASSWORD` value)

### Step 2: Select Your Realm

1. In the top-left corner, click the realm dropdown
2. Select your realm (e.g., `JOOR_APP_V2`)

### Step 3: Export the Realm

1. In the left sidebar, click **"Realm Settings"**
2. Look for the **"Action"** dropdown button (top right of the page, next to "Save")
3. Click **"Action"** → Select **"Partial Export"**
4. In the export dialog, configure what to include:
   - ✅ **Include groups and roles**: Toggle **ON**
   - ✅ **Include clients**: Toggle **ON**
   - ✅ **Include identity providers**: Toggle **ON** (if you have any)
   - ✅ **Include users**: Toggle **ON** (if you want to share users)
   - Leave other options as needed
5. Click **"Export"**
6. The file will download (usually to your Downloads folder)

### Step 4: Place the File

1. Move the downloaded file to the `keycloak_data` directory:
   ```bash
   # On Windows (PowerShell)
   Move-Item ~/Downloads/realm-export.json nodeBE/keycloak_data/realm-export.json
   
   # On Mac/Linux
   mv ~/Downloads/realm-export.json nodeBE/keycloak_data/realm-export.json
   ```

2. If the file has a different name, rename it:
   ```bash
   cd nodeBE/keycloak_data
   mv realm-export-*.json realm-export.json
   ```

### Step 5: Verify

Check that the file exists and has content:
```bash
ls -lh nodeBE/keycloak_data/realm-export.json
```

You should see a JSON file with your realm configuration.

## Method 2: Via Keycloak Admin CLI (Alternative)

If you prefer command line:

```bash
# 1. Configure credentials
docker exec -it joorapp-keycloak-dev /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin

# 2. Export the realm (replace JOOR_APP_V2 with your realm name)
docker exec -it joorapp-keycloak-dev /opt/keycloak/bin/kcadm.sh get realms/JOOR_APP_V2 > nodeBE/keycloak_data/realm-export.json
```

## What Gets Exported?

The export includes:
- ✅ Realm settings and configuration
- ✅ Clients (your application clients)
- ✅ Client secrets (if included)
- ✅ Roles and groups
- ✅ Users (if you toggle it on)
- ✅ Identity providers (if you have any)
- ✅ Authentication flows
- ✅ Other realm-specific configurations

## Important Notes

1. **Client Secrets**: If you export client secrets, make sure they're not sensitive or rotate them after sharing
2. **Users**: Decide if you want to include users or let teammates create their own
3. **File Size**: Large exports can be several MB if you include many users
4. **Sensitive Data**: Review the JSON file before committing to ensure no sensitive data is exposed

## Troubleshooting

### "Cannot connect to Keycloak"
- Check if container is running: `docker ps | grep keycloak`
- Check logs: `docker logs joorapp-keycloak-dev`
- Verify port: `curl http://localhost:8080/health/ready`

### "Login failed"
- Verify admin credentials in your `.env` file
- Check `KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD` values

### "Export file is empty or invalid"
- Make sure you selected the correct realm
- Try exporting again with different options
- Check browser console for errors

### "File not found after export"
- Check your browser's download folder
- Look for files named `realm-export.json` or similar
- Some browsers add timestamps to filenames

## Next Steps

After exporting:
1. Verify the file is in `nodeBE/keycloak_data/realm-export.json`
2. Test that docker-compose can read it (check file permissions)
3. Commit to git (see `SETUP_INSTRUCTIONS.md`)

---

**Quick Command Reference:**

```bash
# Start Keycloak
docker-compose -f docker-compose.dev.yml up -d keycloak

# Check Keycloak logs
docker logs joorapp-keycloak-dev

# Check if Keycloak is ready
curl http://localhost:8080/health/ready

# Access Keycloak
# Open browser: http://localhost:8080
```

