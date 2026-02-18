// Electron Main Process
// Manages the desktop application window and Express server

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const os = require('os');
const spawn = require('child_process').spawn;

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
      // Path to the backend server
      const backendPath = path.join(__dirname, '..', 'backend', 'src', 'server.js');
      
      // Set environment variables
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        PORT: EXPRESS_PORT,
        HOST: '127.0.0.1',
        DATABASE_PATH: path.join(getUserDataPath(), 'inventory.db'),
        JWT_SECRET: 'electron-app-secret-key-change-in-production',
        ALLOWED_ORIGINS: 'http://localhost:5173,http://127.0.0.1:5173',
      };

      // Start the server
      expressServer = spawn('node', [backendPath], { 
        env,
        detached: false,
        stdio: 'pipe'
      });

      expressServer.stdout.on('data', (data) => {
        console.log(`[Backend] ${data}`);
      });

      expressServer.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data}`);
      });

      expressServer.on('error', (err) => {
        console.error('Failed to start Express server:', err);
        reject(err);
      });

      // Wait a bit for server to start
      setTimeout(() => {
        resolve(true);
      }, 2000);
    } catch (err) {
      reject(err);
    }
  });
};

// Create Electron window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'), // Add your app icon
  });

  // Load app
  const startURL = isDev ? 
    'http://localhost:5173' : 
    `file://${path.join(__dirname, '../frontend/dist/index.html')}`;

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
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'CSTCO Inventory Management',
              message: 'CSTCO Inventory Management System v1.0.0',
              detail: 'A modern inventory management solution',
            });
          },
        },
      ],
    },
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

// App event handlers
app.on('ready', async () => {
  try {
    // Ensure data directory exists
    ensureDataDirectory();

    // Start Express server
    await startExpressServer();
    console.log('✓ Express server started');

    // Create window
    createWindow();
    createMenu();

    console.log('✓ Electron app started');
  } catch (err) {
    console.error('Error starting app:', err);
    dialog.showErrorBox('Startup Error', 'Failed to start the application');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Kill Express server before quitting
  if (expressServer) {
    expressServer.kill();
  }
  app.quit();
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  if (expressServer) {
    expressServer.kill();
  }
});
