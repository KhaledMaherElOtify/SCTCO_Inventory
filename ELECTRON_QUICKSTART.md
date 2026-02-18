# Quick Start - Electron Desktop App

## Development Mode

Run the app with live backend and frontend:

```bash
# Terminal 1: Start the backend
npm run backend

# Terminal 2: Start the frontend dev server
npm --prefix frontend run dev -- --host

# Terminal 3: Start Electron
npm run electron
```

Or all in one command (requires concurrently):
```bash
npm run electron-dev
```

The app will:
- Load React from http://localhost:5173
- API calls go to http://localhost:3001
- Database stored in `AppData/Roaming/CSTCO Inventory/data/`

## Production Build

Build and package the desktop app:

```bash
npm run dist
```

This creates:
- **Windows:** `dist/CSTCO Inventory Setup 1.0.0.exe` (installer)
- **Windows:** `dist/CSTCO Inventory 1.0.0.exe` (portable)

## Troubleshooting

### Ports Already in Use

Kill existing Node processes:
```bash
taskkill /F /IM node.exe
```

### React Dev Server Not Loading

Make sure you started the frontend dev server:
```bash
npm --prefix frontend run dev -- --host
```

### Backend Not Connecting

Check that port 3001 is available and backend is running.

### SQLite Database Issues

Database location:
`C:\Users\{username}\AppData\Roaming\CSTCO Inventory\data\inventory.db`

Delete it to reset:
```bash
del %APPDATA%\CSTCO Inventory\data\inventory.db
```

## App Structure

```
electron/
  main.js       - App window & process management
  preload.js    - IPC communication bridge

backend/
  src/
    server.js   - Express API server
    config/     - Database and CORS config
    routes/     - API endpoints

frontend/
  src/
    components/ - React components
    pages/      - Page components
    config/     - API configuration
  dist/         - Production build (for packaged app)
```

## API Endpoints

Test the backend is running:
```bash
curl http://localhost:3001/api/
```

Login (test):
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

## Next Steps

1. ✅ Development testing (npm run electron-dev)
2. ✅ Build for production (npm run dist)
3. ⏳ Add app icon (256x256 PNG to assets/icon.png)
4. ⏳ Code signing (optional, for distribution)
5. ⏳ Auto-updates setup (optional)

Enjoy your desktop app!
