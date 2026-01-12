import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { IBackendResponse } from '../shared/types';
import { registerProjectHandlers } from './ipc/projectHandlers';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let pythonProcess: ChildProcess | null = null;

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

function getPythonPath(): string {
  if (app.isPackaged) {
    // TODO: Adjust for production bundled binary path
    return path.join(process.resourcesPath, 'engine', 'main');
  }
  // Dev mode assumption: venv exists or use system python
  // In a real scenario, we might check fs.existsSync for venv
  const venvPython = path.join(__dirname, '../../engine/venv/bin/python');
  return 'python3'; // Simplification for task: assumes python3 is in PATH
}

function initPythonEngine(): void {
  const pythonExec = getPythonPath();
  const scriptPath = path.join(__dirname, '../../engine/main.py');

  console.log(`Starting Python engine: ${pythonExec} ${scriptPath}`);

  pythonProcess = spawn(pythonExec, ['-u', scriptPath]); // -u for unbuffered output

  if (pythonProcess.stdout) {
    pythonProcess.stdout.on('data', (data: Buffer) => {
      console.log(`[Python Stdout]: ${data.toString()}`);
    });
  }

  if (pythonProcess.stderr) {
    pythonProcess.stderr.on('data', (data: Buffer) => {
      console.error(`[Python Stderr]: ${data.toString()}`);
    });
  }

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
}

function killPythonEngine(): void {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
}

// IPC Handlers
ipcMain.handle('check-backend-status', async (_event: IpcMainInvokeEvent): Promise<IBackendResponse> => {
  return new Promise((resolve) => {
    // In a real app, we'd use a more robust request/response ID matching system.
    // For this ping test, we send a line and expect the next line to be the response.
    if (!pythonProcess || !pythonProcess.stdin || !pythonProcess.stdout) {
      resolve({ status: 'error', data: 'Python process not ready', timestamp: Date.now() });
      return;
    }

    const handler = (data: Buffer) => {
      pythonProcess?.stdout?.removeListener('data', handler);
      try {
        const response = JSON.parse(data.toString()) as unknown; // Safe parsing
        // We assume the response structure matches IBackendResponse for this demo, 
        // but in strict code we would validate 'response' is an object with correct fields.
        resolve(response as IBackendResponse);
      } catch (e) {
        resolve({ status: 'error', data: 'Failed to parse backend response', timestamp: Date.now() });
      }
    };

    pythonProcess.stdout.once('data', handler);
    pythonProcess.stdin.write(JSON.stringify({ command: 'ping' }) + '\n');
  });
});

app.on('ready', () => {
  registerProjectHandlers();
  createWindow();
  initPythonEngine();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  killPythonEngine();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
