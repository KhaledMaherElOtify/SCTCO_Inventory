# Inventory Management System - Production LAN Deployment Guide

## Overview

This guide covers deploying a production-ready Inventory Management System on a local network. The system consists of:

- **Backend**: Node.js + Express API running on port 3001
- **Frontend**: React single-page application served via Nginx on port 80
- **Database**: SQLite for local persistence
- **Process Management**: PM2 for automatic restart and system boot integration

## Architecture

```
┌─────────────────────────────────────────────┐
│        Client Machines (LAN)                │
│  • Windows/Mac/Linux browsers               │
│  • Access via http://192.168.1.100          │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Nginx (Port 80)│
         │  • Serves React │
         │  • Proxies API  │
         └───────┬────────┘
                 │
    ┌────────────┴─────────────┐
    │                          │
┌───▼──────┐         ┌────────▼────┐
│ React App│         │Node.js API  │
│ (dist/)  │         │(Port 3001)  │
└──────────┘         └────────┬────┘
                              │
                       ┌──────▼──────┐
                       │ SQLite DB   │
                       │(./data/)    │
                       └─────────────┘
```

## Prerequisites

- **Server Machine**: Windows/Linux/Mac with Node.js ≥16
- **Network**: LAN connectivity between machines
- **Firewall**: Ports 80 and 3001 open (or adjust Nginx config)
- **Node.js & npm**: Installed on server
- **Optional**: PM2 globally (`npm install -g pm2`)

## Step 1: Prepare Backend

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install --legacy-peer-deps
```

### 1.2 Configure Environment

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Key settings:**
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0                          # Listen on all interfaces
JWT_SECRET=your-secure-secret-key     # Change this!
ALLOWED_ORIGINS=http://192.168.1.100  # Your server's LAN IP
```

### 1.3 Initialize Database

```bash
npm run init-db
```

This will:
- Create `data/inventory.db`
- Initialize schema
- Seed default users

**Default Users:**
- Username: `admin` / Password: `admin123` (Admin)
- Username: `storekeeper` / Password: `store123` (Storekeeper)
- Username: `viewer` / Password: `view123` (Viewer)

### 1.4 Test Backend

```bash
npm start
```

Should see:
```
✓ Database initialized
✓ Database schema initialized
✓ Initial data seeded
✅ Server started on http://0.0.0.0:3001
```

Test health endpoint:
```bash
curl http://localhost:3001/health
```

Press Ctrl+C to stop.

## Step 2: Build Frontend

### 2.1 Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2.2 Configure for LAN

Edit `src/config/apiConfig.js` to use your server IP:

```javascript
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // In production, the frontend auto-detects the server IP
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = '3001'; // Backend port
    return `${protocol}//${host}:${port}`;
  }
  return 'http://192.168.1.100:3001'; // Fallback
};
```

### 2.3 Build Production Bundle

```bash
npm run build
```

Output will be in `frontend/dist/`

## Step 3: Set Up Nginx

### Option A: Windows (IIS Alternative)

Windows users can use IIS instead of Nginx:

1. Install IIS (Enable Windows feature)
2. Create website pointing to `frontend/dist/`
3. Configure URL Rewrite module
4. Create reverse proxy to `http://localhost:3001/api`

### Option B: Windows with Nginx

1. Download Nginx from [nginx.org](http://nginx.org)
2. Extract to `C:\nginx`
3. Copy `deployment/nginx.conf` to `C:\nginx\conf\`
4. Edit paths in nginx.conf:
   ```
   root C:/path/to/frontend/dist;
   upstream inventory_api { server 127.0.0.1:3001; }
   ```
5. Start Nginx:
   ```
   cd C:\nginx
   nginx.exe
   ```
6. Test: http://localhost

### Option C: Linux/Mac

1. Install Nginx:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install nginx
   
   # macOS
   brew install nginx
   ```

2. Copy configuration:
   ```bash
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/inventory
   sudo ln -s /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/
   ```

3. Edit paths in `/etc/nginx/sites-available/inventory`

4. Test configuration:
   ```bash
   sudo nginx -t
   ```

5. Start Nginx:
   ```bash
   sudo systemctl start nginx
   # or
   sudo service nginx start
   ```

## Step 4: Production Backend Startup

### Option A: Manual Startup

```bash
cd backend
npm start
```

Keep terminal open or use `nohup`:
```bash
nohup npm start > backend.log 2>&1 &
```

### Option B: PM2 (Recommended)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Edit `deployment/ecosystem.config.js` with correct paths

3. Start with PM2:
   ```bash
   cd deployment
   pm2 start ecosystem.config.js
   ```

4. Enable auto-start on system boot:
   ```bash
   pm2 startup
   pm2 save
   ```

5. Check status:
   ```bash
   pm2 status
   pm2 logs inventory-api
   ```

## Step 5: Verify Deployment

### 5.1 Check Backend

```bash
curl http://localhost:3001/health
# Response: {"status":"OK","timestamp":"...","environment":"production"}
```

### 5.2 Check Frontend

In your browser:
```
http://192.168.1.100     # Or your server's LAN IP
```

Should see login page.

### 5.3 Test Login

Use default credentials:
- Username: `admin`
- Password: `admin123`

## Step 6: Access from Other Machines

From any machine on the LAN:

```
http://192.168.1.100     # Replace with your server's actual IP
```

To find your server's IP:

**Windows:**
```powershell
ipconfig
# Look for IPv4 Address under your active connection
```

**Linux/Mac:**
```bash
ifconfig
# or
ip addr
```

## Database Backup

### Automated Backup

Create a backup script:

**Windows** (backup.bat):
```batch
@echo off
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
copy "C:\path\to\backend\data\inventory.db" "C:\backups\inventory_%mydate%.db"
```

**Linux** (backup.sh):
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
cp /path/to/backend/data/inventory.db /backups/inventory_$DATE.db
```

Schedule with:
- **Windows**: Task Scheduler
- **Linux/Mac**: crontab

### Manual Backup

```bash
# Stop backend first
pm2 stop inventory-api

# Copy database
cp backend/data/inventory.db backups/inventory_$(date +%Y-%m-%d).db

# Restart
pm2 start inventory-api
```

## Troubleshooting

### Frontend shows "Cannot connect to API"

1. Check backend is running: `curl http://localhost:3001/health`
2. Check CORS in `.env`: `ALLOWED_ORIGINS` includes your IP
3. Check Nginx proxy config points to correct backend

### "Port 3001 already in use"

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### Database locked errors

1. Ensure only one backend instance is running
2. Stop PM2 cluster mode (use single instance)
3. Check no other process is using database

### Nginx returns 502 Bad Gateway

1. Check backend is running on port 3001
2. Check Nginx config has correct upstream
3. Check firewall allows localhost:3001

### Users can't login

1. Check database initialized: `backend/data/inventory.db` exists
2. Check default users were seeded
3. Check JWT_SECRET in `.env` is set

## Security Hardening

### 1. Change Default Passwords

Add new admin user:
```bash
# Use API to create users or edit database directly
sqlite3 backend/data/inventory.db

# Update password hash (requires bcryptjs)
UPDATE users SET password_hash='<new_hash>' WHERE username='admin';
```

### 2. Enable HTTPS (Optional)

For production with certificates:

**Windows IIS**: Use built-in HTTPS binding
**Nginx**: Add to `server` block:
```nginx
listen 443 ssl;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
```

### 3. Firewall Rules

Only allow ports 80 and 3001 from LAN:

**Windows Firewall:**
```powershell
netsh advfirewall firewall add rule name="Inventory HTTP" dir=in action=allow protocol=tcp localport=80 remoteip=192.168.1.0/24
```

### 4. Database Encryption

SQLite doesn't support encryption natively. For sensitive data, consider:
- Database wrapper with encryption
- File-level encryption (BitLocker, LUKS)
- Regular secure backups

## Maintenance

### Monitoring

```bash
# Check PM2 status
pm2 status
pm2 logs inventory-api

# Check Nginx status
systemctl status nginx  # Linux
pm2 monit              # PM2 monitor
```

### Logs

**Backend logs:**
```bash
# PM2 logs
pm2 logs inventory-api

# Application logs
tail -f backend/logs/access.log
```

**Nginx logs:**
```bash
# Linux/Mac
tail -f /var/log/nginx/access.log

# Windows
C:\nginx\logs\access.log
```

### Scaling

For more users:

1. Increase PM2 instances in `ecosystem.config.js`:
   ```javascript
   "instances": 4,  // Instead of 2
   ```

2. Load balance with HAProxy or Nginx

3. Consider SQLite limitations (single writer)

## Updates and Deployments

### Update Backend

```bash
cd backend
git pull
npm install --legacy-peer-deps
npm run init-db  # If schema changes
pm2 restart inventory-api
```

### Update Frontend

```bash
cd frontend
git pull
npm install
npm run build
# Nginx auto-serves new dist/ files
```

## Production Checklist

- [ ] Backend `.env` configured with production settings
- [ ] JWT_SECRET changed from default
- [ ] Database initialized and tested
- [ ] Frontend built (`dist/` folder created)
- [ ] Nginx/IIS configured and tested
- [ ] PM2 started and auto-boot enabled
- [ ] Firewall rules allow ports 80 and 3001
- [ ] All machines on LAN can access http://192.168.1.100
- [ ] Login works with default credentials
- [ ] CORS errors resolved
- [ ] Backups automated
- [ ] Team trained on system usage

## Support & Documentation

- API Endpoints: See `backend/src/routes/`
- Frontend Components: See `frontend/src/`
- Database Schema: `backend/sql/schema.sql`
- Error Logs: `backend/logs/`

---

**Deployment Complete!** Your production Inventory Management System is now running on the local network.
