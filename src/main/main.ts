import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { IBackendResponse } from '../shared/types';
import { registerProjectHandlers } from './ipc/projectHandlers';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('check-backend-status', async (): Promise<IBackendResponse> => {
  return {
    status: 'ok',
    data: 'Node.js Backend Ready',
    timestamp: Date.now()
  };
});

app.on('ready', () => {
  registerProjectHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
