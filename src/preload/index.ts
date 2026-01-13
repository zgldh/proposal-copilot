import { contextBridge, ipcRenderer } from 'electron'

declare global {
  interface Window {
    electronAPI: {
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<void>
      dialogNewProject: () => Promise<string | null>
      dialogOpenProject: () => Promise<string | null>
      projectCreate: (path: string, name: string) => Promise<string>
      projectRead: (path: string) => Promise<Record<string, unknown>>
      settingsRead: () => Promise<Record<string, unknown>>
      settingsWrite: (settings: Record<string, unknown>) => Promise<boolean>
    }
    electron: {
      dialog: {
        newProject: () => Promise<string | null>
        openProject: () => Promise<string | null>
      }
      project: {
        create: (path: string, name: string) => Promise<string>
        read: (path: string) => Promise<Record<string, unknown>>
      }
      settings: {
        read: () => Promise<Record<string, unknown>>
        write: (settings: Record<string, unknown>) => Promise<boolean>
      }
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', {
      readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
      writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content),
      dialogNewProject: () => ipcRenderer.invoke('dialog:newProject'),
      dialogOpenProject: () => ipcRenderer.invoke('dialog:openProject'),
      projectCreate: (path: string, name: string) => ipcRenderer.invoke('project:create', path, name),
      projectRead: (path: string) => ipcRenderer.invoke('project:read', path),
      settingsRead: () => ipcRenderer.invoke('settings:read'),
      settingsWrite: (settings: Record<string, unknown>) => ipcRenderer.invoke('settings:write', settings)
    })

    contextBridge.exposeInMainWorld('electron', {
      dialog: {
        newProject: () => ipcRenderer.invoke('dialog:newProject'),
        openProject: () => ipcRenderer.invoke('dialog:openProject')
      },
      project: {
        create: (path: string, name: string) => ipcRenderer.invoke('project:create', path, name),
        read: (path: string) => ipcRenderer.invoke('project:read', path)
      },
      settings: {
        read: () => ipcRenderer.invoke('settings:read'),
        write: (settings: Record<string, unknown>) => ipcRenderer.invoke('settings:write', settings)
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electronAPI = {
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content),
    dialogNewProject: () => ipcRenderer.invoke('dialog:newProject'),
    dialogOpenProject: () => ipcRenderer.invoke('dialog:openProject'),
    projectCreate: (path: string, name: string) => ipcRenderer.invoke('project:create', path, name),
    projectRead: (path: string) => ipcRenderer.invoke('project:read', path),
    settingsRead: () => ipcRenderer.invoke('settings:read'),
    settingsWrite: (settings: Record<string, unknown>) => ipcRenderer.invoke('settings:write', settings)
  }
}
