const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    saveFile: (data) => ipcRenderer.invoke('save-file', data),
    getStoredFiles: () => ipcRenderer.invoke('get-stored-files'),
    uploadFont: () => ipcRenderer.invoke('upload-font'),
    
    // Enhanced settings operations
    loadAppSettings: () => ipcRenderer.invoke('load-app-settings'),
    saveAppSettings: (settings) => ipcRenderer.invoke('save-app-settings', settings),
    
    // Add methods to check if files exist
    checkFileExists: (filePath) => ipcRenderer.invoke('check-file-exists', filePath),
    
    // File watchers for auto-refresh
    watchSettingsChanges: (callback) => {
      ipcRenderer.on('settings-changed', (event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('settings-changed');
    }
  });