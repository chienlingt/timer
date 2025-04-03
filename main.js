import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import Store from 'electron-store';
import fs, { watch } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create user data directory for storing assets
const userDataPath = path.join(app.getPath('userData'), 'assets');

// Ensure the directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = !app.isPackaged;
  
  if (isDev) {
    win.loadURL('http://localhost:5173/');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Central settings file path
const settingsFilePath = path.join(app.getPath('userData'), 'app-settings.json');

ipcMain.handle('load-app-settings', async () => {
  try {
    // Try to load from electron-store first
    const settings = store.get('appSettings');
    
    if (settings) {
      // Resolve any file paths to their full URLs
      if (settings.coverBackground) {
        settings.coverBackground = ensureFileUrl(settings.coverBackground);
      }
      if (settings.defaultBackground) {
        settings.defaultBackground = ensureFileUrl(settings.defaultBackground);
      }
      if (settings.customFontPath) {
        settings.customFontPath = ensureFileUrl(settings.customFontPath);
      }
      
      return settings;
    }
    
    // Fallback to file-based settings if no store data
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath, 'utf8');
      const fileSettings = JSON.parse(data);
      
      // Save to electron-store for next time
      store.set('appSettings', fileSettings);
      
      // Resolve paths
      if (fileSettings.coverBackground) {
        fileSettings.coverBackground = ensureFileUrl(fileSettings.coverBackground);
      }
      if (fileSettings.defaultBackground) {
        fileSettings.defaultBackground = ensureFileUrl(fileSettings.defaultBackground);
      }
      if (fileSettings.customFontPath) {
        fileSettings.customFontPath = ensureFileUrl(fileSettings.customFontPath);
      }
      
      return fileSettings;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading app settings:', error);
    return null;
  }
});

ipcMain.handle('save-app-settings', async (_, settings) => {
  try {
    // Clean up settings object to store local paths instead of URLs
    const cleanSettings = { ...settings };
    
    // Convert file:// URLs to relative paths where possible
    ['coverBackground', 'defaultBackground', 'customFontPath'].forEach(key => {
      if (cleanSettings[key] && cleanSettings[key].startsWith('file://')) {
        const filePath = cleanSettings[key].replace('file://', '');
        
        // If it's in our assets directory, make it relative
        if (filePath.startsWith(userDataPath)) {
          cleanSettings[key] = path.relative(userDataPath, filePath);
        } else {
          cleanSettings[key] = filePath;
        }
      }
    });
    
    // Save to both electron-store and file for redundancy
    store.set('appSettings', cleanSettings);
    fs.writeFileSync(settingsFilePath, JSON.stringify(cleanSettings, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error saving app settings:', error);
    return false;
  }
});

// Helper to ensure paths are proper file:// URLs
function ensureFileUrl(pathOrUrl) {
  if (pathOrUrl.startsWith('file://')) {
    return pathOrUrl;
  }
  
  // Handle relative paths from the assets folder
  if (!path.isAbsolute(pathOrUrl)) {
    const assetPath = path.join(userDataPath, pathOrUrl);
    if (fs.existsSync(assetPath)) {
      return `file://${assetPath}`;
    }
  }
  
  // Handle absolute paths
  if (fs.existsSync(pathOrUrl)) {
    return `file://${pathOrUrl}`;
  }
  
  return pathOrUrl; // Return as-is if we can't resolve it
}

// Set up a watcher for settings changes
let settingsWatcher;
function startSettingsWatcher(win) {
  if (settingsWatcher) {
    settingsWatcher.close();
  }
  
  if (fs.existsSync(settingsFilePath)) {
    settingsWatcher = watch(settingsFilePath, () => {
      try {
        const data = fs.readFileSync(settingsFilePath, 'utf8');
        const settings = JSON.parse(data);
        win.webContents.send('settings-changed', settings);
      } catch (error) {
        console.error('Error reading settings file:', error);
      }
    });
  }
}

// Call this in createWindow after the window is created
startSettingsWatcher(win);

  // Handle file uploads with improved persistence
  ipcMain.handle('save-file', async (event, { fileData, fileName, fileType }) => {
    try {
      // Remove header from base64 data if it exists
      const base64Data = fileData.includes('base64') 
        ? fileData.split('base64,')[1] 
        : fileData;
      
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Create a more structured filename for better organization
      // Format: type-timestamp-originalname
      const uniqueFileName = `${fileType}-${Date.now()}-${fileName}`;
      const filePath = path.join(userDataPath, uniqueFileName);
      
      // Save file
      fs.writeFileSync(filePath, buffer);
      
      // Create a manifest entry for this file
      updateManifest(fileType, uniqueFileName);
      
      // Return the path that can be used later
      return `file://${filePath}`;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  });

  // Update manifest file to track the latest files of each type
  function updateManifest(fileType, fileName) {
    const manifestPath = path.join(userDataPath, 'manifest.json');
    let manifest = {};
    
    // Load existing manifest if it exists
    if (fs.existsSync(manifestPath)) {
      try {
        const data = fs.readFileSync(manifestPath, 'utf8');
        manifest = JSON.parse(data);
      } catch (err) {
        console.error('Error reading manifest:', err);
      }
    }
    
    // Update the entry for this file type
    manifest[fileType] = fileName;
    
    // Save updated manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  // Handle retrieving stored files with manifest support
  ipcMain.handle('get-stored-files', async () => {
    try {
      const manifestPath = path.join(userDataPath, 'manifest.json');
      let activeFiles = [];
      
      // Check if manifest exists and load it
      if (fs.existsSync(manifestPath)) {
        const data = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(data);
        
        // Get all files from the directory
        const allFiles = fs.readdirSync(userDataPath)
          .filter(file => file !== 'manifest.json');
        
        // Only return files that are in the manifest (active files)
        // as well as all font files (they might be needed)
        activeFiles = allFiles.filter(file => {
          const isInManifest = Object.values(manifest).includes(file);
          const isFont = file.includes('font-');
          return isInManifest || isFont;
        });
      } else {
        // If no manifest exists, return all files
        activeFiles = fs.readdirSync(userDataPath)
          .filter(file => file !== 'manifest.json');
      }
      
      // Format the file information for the renderer
      return activeFiles.map(file => ({
        name: file,
        path: `file://${path.join(userDataPath, file)}`
      }));
    } catch (error) {
      console.error('Error getting files:', error);
      return [];
    }
  });

  // Handle font file upload via dialog with improved organization
  ipcMain.handle('upload-font', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Fonts', extensions: ['ttf', 'otf', 'woff', 'woff2'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const fontPath = result.filePaths[0];
      const fontName = path.basename(fontPath);
      
      // Create a more structured filename for fonts
      const uniqueFileName = `font-${Date.now()}-${fontName}`;
      const destPath = path.join(userDataPath, uniqueFileName);
      
      // Copy the font file to our assets directory
      fs.copyFileSync(fontPath, destPath);
      
      // Update manifest for this font
      updateManifest('customFontPath', uniqueFileName);
      
      return {
        name: uniqueFileName,
        path: `file://${destPath}`
      };
    }
    return null;
  });

  // Add a method to get settings with file paths resolved
  ipcMain.handle('get-resolved-settings', async () => {
    try {
      const manifestPath = path.join(userDataPath, 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        const data = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(data);
        
        // Create object with resolved file paths
        const resolvedPaths = {};
        
        for (const [type, fileName] of Object.entries(manifest)) {
          const filePath = path.join(userDataPath, fileName);
          if (fs.existsSync(filePath)) {
            resolvedPaths[type] = `file://${filePath}`;
          }
        }
        
        return resolvedPaths;
      }
      
      return {};
    } catch (error) {
      console.error('Error resolving settings:', error);
      return {};
    }
  });

  // Add to your ipcMain handlers
ipcMain.handle('check-file-exists', (_, filePath) => {
  return fs.existsSync(filePath);
});

// Add a method to clean up old files
ipcMain.handle('cleanup-old-files', async () => {
  try {
    const files = fs.readdirSync(userDataPath);
    const manifestPath = path.join(userDataPath, 'manifest.json');
    let manifest = {};
    
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
    
    // Get active files from manifest
    const activeFiles = new Set(Object.values(manifest));
    
    // Delete any files not in the manifest
    files.forEach(file => {
      if (file !== 'manifest.json' && !activeFiles.has(file)) {
        try {
          fs.unlinkSync(path.join(userDataPath, file));
        } catch (err) {
          console.error(`Error deleting file ${file}:`, err);
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error cleaning up files:', error);
    return false;
  }
});
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});