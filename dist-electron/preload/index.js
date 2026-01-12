"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  checkBackendStatus: () => {
    return electron.ipcRenderer.invoke("check-backend-status");
  },
  selectDirectory: () => electron.ipcRenderer.invoke("dialog:select-folder"),
  createProject: (path, name) => electron.ipcRenderer.invoke("project:create", { path, name }),
  loadProject: (path) => electron.ipcRenderer.invoke("project:load", { path }),
  saveProject: (path, data) => electron.ipcRenderer.invoke("project:save", { path, data })
});
