"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const FILE_NAME = "project.json";
class ProjectService {
  static createInitialData(name) {
    return {
      meta: {
        name,
        create_time: (/* @__PURE__ */ new Date()).toISOString(),
        version: "1.0.0"
      },
      context: "",
      structure_tree: []
    };
  }
  static async createProject(folderPath, name) {
    const filePath = path__namespace.join(folderPath, FILE_NAME);
    try {
      await fs.promises.access(filePath);
      throw new Error(`A project already exists in this folder: ${filePath}`);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    const data = this.createInitialData(name);
    await this.saveProject(folderPath, data);
    return data;
  }
  static async loadProject(folderPath) {
    const filePath = path__namespace.join(folderPath, FILE_NAME);
    const content = await fs.promises.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (!this.isProjectData(parsed)) {
      throw new Error("Invalid project.json format");
    }
    return parsed;
  }
  static async saveProject(folderPath, data) {
    const filePath = path__namespace.join(folderPath, FILE_NAME);
    const tempPath = `${filePath}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
    await fs.promises.rename(tempPath, filePath);
  }
  static isProjectData(obj) {
    const data = obj;
    return !!(data && typeof data === "object" && "meta" in data && "structure_tree" in data);
  }
}
function registerProjectHandlers() {
  electron.ipcMain.handle("dialog:select-folder", async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory", "promptToCreate"],
      title: "Select Project Folder"
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: "Selection canceled" };
    }
    return { success: true, data: result.filePaths[0] };
  });
  electron.ipcMain.handle("project:create", async (_e, { path: path2, name }) => {
    try {
      const data = await ProjectService.createProject(path2, name);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  electron.ipcMain.handle("project:load", async (_e, { path: path2 }) => {
    try {
      const data = await ProjectService.loadProject(path2);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  electron.ipcMain.handle("project:save", async (_e, { path: path2, data }) => {
    try {
      await ProjectService.saveProject(path2, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path__namespace.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path__namespace.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.ipcMain.handle("check-backend-status", async (_event) => {
  return {
    status: "ok",
    data: "Node.js Backend Ready",
    timestamp: Date.now()
  };
});
electron.app.on("ready", () => {
  registerProjectHandlers();
  createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
