// Electron Main Process
// Manages the desktop application window and Express server

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const os = require('os');
const { spawn } = require('child_process');

let mainWindow;
let expressServer = null;
const EXPRESS_PORT = 3001;

// Get the user data directory for database storage
const getUserDataPath = () => {
  return path.join(app.getPath('userData'), 'data');
};

// Ensure database directory exists
const ensureDataDirectory = () => {
  const dataDir = getUserDataPath();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
};

// Start Express server
const startExpressServer = () => {
  return new Promise((resolve, reject) => {
    try {
      const backendDir = path.join(__dirname, '..', 'backend');
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        PORT: EXPRESS_PORT,
        HOST: '127.0.0.1',
        DATABASE_PATH: path.join(getUserDataPath(), 'inventory.db'),
        JWT_SECRET: 'electron-app-secret-key-change-in-production',
      };

      console.log('Starting backend from:', backendDir);
      console.log('Database path:', env.DATABASE_PATH);

      // Start npm start in backend directory
      expressServer = spawn('npm', ['start'], {
        cwd: backendDir,
        env: env,
        stdio: 'inherit',
        shell: true
      });

      expressServer.on('error', (err) => {
        console.error('Failed to start Express server:', err);
        reject(err);
      });

      // Wait for server to start
      setTimeout(() => {
        resolve(true);
      }, 3000);

    } catch (err) {
      console.error('Error in startExpressServer:', err);
      reject(err);
    }
  });
};

// Create Electron window
const createWindow = () => {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const windowConfig = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true
    }
  };

  // Only set icon if it exists
  if (fs.existsSync(iconPath)) {
    windowConfig.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowConfig);

  const startURL = isDev ?
    'http://localhost:5173' :
    `file://${path.join(__dirname, '../frontend/dist/index.html')}`;

  console.log('Loading URL:', startURL);
  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Create application menu
const createMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

// IPC Handlers
ipcMain.handle('get-userdata-path', () => {
  return getUserDataPath();
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-backend-url', () => {
  return `http://localhost:${EXPRESS_PORT}`;
});

// App lifecycle
app.on('ready', async () => {
  try {
    console.log('App starting...');
    ensureDataDirectory();
    
    if (!isDev) {
      await startExpressServer();
      console.log('Backend server started');
    }

    createWindow();
    createMenu();
    console.log('App ready');
  } catch (err) {
    console.error('Error starting app:', err);
    dialog.showErrorBox('Startup Error', 'Failed to start application');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (expressServer) {
    console.log('Killing backend server');
    expressServer.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (expressServer) expressServer.kill();
  app.quit();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  if (expressServer) expressServer.kill();
  process.exit(1);
});
