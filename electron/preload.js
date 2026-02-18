// Preload Script
// Securely exposes IPC methods to the React app

const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to React
contextBridge.exposeInMainWorld('electron', {
  // Get user data directory
  getUserDataPath: () => ipcRenderer.invoke('get-userdata-path'),
  
  // Get app version
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Get backend URL
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  
  // Send log messages to main process
  log: (message) => ipcRenderer.send('log-message', message),
  
  // Listen for events from main process
  onAppReady: (callback) => {
    ipcRenderer.on('app-ready', callback);
    return () => ipcRenderer.removeListener('app-ready', callback);
  },
});
