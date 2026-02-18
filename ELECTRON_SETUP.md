# Electron Conversion Guide - CSTCO Inventory Management System

## Overview

Your full-stack CSTCO Inventory application has been converted to support both web and desktop deployment using Electron.

## Project Structure

```
├── electron/
│   ├── main.js              # Electron main process
│   └── preload.js           # IPC bridge for secure communication
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── config/
│   └── data/                # SQLite database stored here
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── LoadingScreen.jsx
│   │   ├── config/apiConfig.js
│   │   └── ...
│   └── dist/                # Build output for desktop
├── assets/                  # App icons and assets
└── package.json             # Electron configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd e:\CSTCO\Inventory\Inventory_Management_System
npm install electron electron-builder electron-is-dev wait-on --save-dev
```

### 2. Database Path Management

The SQLite database is automatically stored in the user's data directory:

**Windows:** `C:\Users\{username}\AppData\Roaming\CSTCO Inventory\data\inventory.db`

**macOS:** `~/Library/Application Support/CSTCO Inventory/data/inventory.db`

**Linux:** `~/.config/CSTCO Inventory/data/inventory.db`

This is handled in `electron/main.js`:
```javascript
const getUserDataPath = () => {
  return path.join(app.getPath('userData'), 'data');
};
```

### 3. Development Mode

Run the app in development with hot-reload:

```bash
npm run electron-dev
```

This command:
- Starts the Express backend on `http://localhost:3001`
- Starts the React dev server on `http://localhost:5173`
- Launches Electron window pointing to dev server

### 4. Production Build

Build the desktop application:

```bash
npm run dist
```

This will:
1. Build the React frontend (`npm --prefix frontend run build`)
2. Package everything with electron-builder
3. Generate installer files in the `dist/` folder

**Output files:**
- **Windows:** `.exe` (installer) and `.exe` (portable)
- **macOS:** `.dmg` (installer) and `.zip`
- **Linux:** `.AppImage` and `.deb` (installer)

### 5. Application Icons

Add your app icons to the `assets/` folder:
- **Windows:** `icon.png` (256x256 or larger)
- **macOS:** `icon.icns` (use Image2Icon to convert)
- **Linux:** `icon.png` (256x256 or larger)

## IPC Communication

The application uses Electron's IPC (Inter-Process Communication) for secure communication between the React UI and the Node.js backend process.

### Available IPC Methods (in React):

```javascript
// Get user data directory
const dataPath = await window.electron.getUserDataPath();

// Get app version
const version = await window.electron.getAppVersion();

// Get backend API URL
const backendUrl = await window.electron.getBackendUrl();
```

### Example Usage in React:

```javascript
import { useEffect, useState } from 'react';

function MyComponent() {
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    window.electron?.getAppVersion().then(version => {
      setAppVersion(version);
    });
  }, []);

  return <div>App Version: {appVersion}</div>;
}
```

## Loading Screen

While the Express server is starting, a loading screen is displayed. The loading screen component is located at:

`frontend/src/components/LoadingScreen.jsx`

The Electron main process waits 2 seconds for the server to start before rendering the React window:

```javascript
setTimeout(() => {
  resolve(true);
}, 2000);
```

Adjust this timeout if needed.

## CORS Configuration

For Electron apps, CORS is configured to allow:
- `http://localhost:3001`
- `http://127.0.0.1:3001`
- `http://localhost:5173` (dev mode)
- `http://127.0.0.1:5173` (dev mode)

This is set in `electron/main.js`:
```javascript
ALLOWED_ORIGINS: 'http://localhost:5173,http://127.0.0.1:5173',
```

## Environment Variables

Key environment variables set by Electron:

```javascript
NODE_ENV: 'production'
PORT: 3001
HOST: '127.0.0.1'
DATABASE_PATH: {userData}/data/inventory.db
JWT_SECRET: 'electron-app-secret-key-change-in-production'
```

**Important:** Change the `JWT_SECRET` in production! Generate a secure random string.

## Building for Different Platforms

### Windows

```bash
npm run dist
```

Creates `.exe` installers in `dist/` folder.

### macOS

Requirements:
- Mac computer
- Xcode installed

```bash
npm run dist
```

Creates `.dmg` and `.zip` files.

### Linux

```bash
npm run dist
```

Creates `.AppImage` and `.deb` files.

## Troubleshooting

### "Module did not self-register" Error

If you see this with SQLite3:

```bash
npm install --save-dev electron-rebuild
npx electron-rebuild
npm run dist
```

This recompiles native modules for Electron.

### Port Already in Use

If port 3001 is already in use:

1. Kill existing processes:
   ```bash
   taskkill /F /IM node.exe
   ```

2. Or change the port in `electron/main.js`:
   ```javascript
   const EXPRESS_PORT = 3002;
   ```

### Database File Not Found

Ensure the `userData` directory is created:

The code automatically creates it:
```javascript
ensureDataDirectory();
```

Check the path at runtime:
```javascript
const path = await window.electron.getUserDataPath();
console.log('Database path:', path);
```

## File Size Optimization

To reduce the packaged app size:

1. **Exclude unnecessary files** in `package.json` build config:
   ```json
   "files": [
     "electron/**/*",
     "backend/**/*",
     "frontend/dist/**/*",
     "node_modules/**/*"
   ]
   ```

2. **Build frontend first:**
   ```bash
   npm --prefix frontend run build
   ```
   This creates minified/optimized output.

3. **Use electron-builder compression:**
   Configured in `package.json` for NSIS (Windows).

## Publishing Updates

For auto-updates, use:
- **electron-updater** (recommended)
- **Squirrel.Windows** (Windows)
- **Sparkle** (macOS)

(Setup guide available on request)

## Security Best Practices

1. **Enable Context Isolation:** ✓ Enabled in `main.js`
   ```javascript
   contextIsolation: true
   ```

2. **Disable Node Integration:** ✓ Disabled in `main.js`
   ```javascript
   nodeIntegration: false
   ```

3. **Enable Sandbox:** ✓ Enabled by default

4. **Use Content Security Policy:** Add to `frontend/index.html`:
   ```html
   <meta http-equiv="Content-Security-Policy" content="
     default-src 'self';
     script-src 'self' 'wasm-unsafe-eval';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data:;
   ">
   ```

5. **Keep JWT_SECRET secure:** Use a secure random key in production.

## Performance Tips

1. **Lazy load components** in React
2. **Optimize database queries** in backend
3. **Use production builds** (`npm --prefix frontend run build`)
4. **Monitor memory usage** for the Express process
5. **Cache API responses** where appropriate

## Next Steps

1. ✅ Build the desktop app: `npm run dist`
2. ✅ Test on your system
3. ✅ Add app icons to `assets/` folder
4. ✅ Sign the app (Windows: authenticode, macOS: notarization)
5. ✅ Setup auto-update mechanism
6. ✅ Publish to app stores (optional)

For more information, see:
- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
