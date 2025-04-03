// fileStorage.js
import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

// Create a dedicated directory for storing app assets
const userDataPath = app.getPath('userData');
const assetsDirPath = path.join(userDataPath, 'assets');

// Ensure the assets directory exists
if (!fs.existsSync(assetsDirPath)) {
  fs.mkdirSync(assetsDirPath, { recursive: true });
}

// Save a file to the assets directory and return its path
const saveAsset = (fileBuffer, fileName) => {
  const ext = path.extname(fileName);
  const timestamp = Date.now();
  const sanitizedName = `${path.basename(fileName, ext).replace(/[^a-z0-9]/gi, '_')}_${timestamp}${ext}`;
  const filePath = path.join(assetsDirPath, sanitizedName);
  
  fs.writeFileSync(filePath, fileBuffer);
  return filePath;
};

// Set up IPC communication between main and renderer processes
export const setupFileHandlers = () => {
  // Handler to save a file from renderer process
  ipcMain.handle('save-file', async (event, base64Data, fileName) => {
    try {
      // Convert base64 to buffer
      const fileBuffer = Buffer.from(base64Data.split(',')[1], 'base64');
      const savedPath = saveAsset(fileBuffer, fileName);
      return `file://${savedPath}`;
    } catch (error) {
      console.error('Error saving file:', error);
      return null;
    }
  });

  // Handler to get file path for preloading
  ipcMain.handle('get-file-path', (event, filePath) => {
    if (!filePath || !filePath.startsWith('file://')) return null;
    
    const localPath = filePath.replace('file://', '');
    if (fs.existsSync(localPath)) {
      return `file://${localPath}`;
    }
    return null;
  });
};

export default { setupFileHandlers };