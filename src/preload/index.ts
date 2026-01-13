import { contextBridge, ipcRenderer } from 'electron'

interface LlmProvider {
  id: string
  name: string
  type: 'openai' | 'deepseek' | 'custom'
  api_key: string
  base_url?: string
  model: string
}

interface Settings {
  llm_provider: LlmProvider
  theme: 'light' | 'dark'
}

declare global {
  interface Window {
    electronAPI: {
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<void>
      dialogNewProject: () => Promise<string | null>
      dialogOpenProject: () => Promise<string | null>
      projectCreate: (path: string, name: string) => Promise<string>
      projectRead: (path: string) => Promise<Record<string, unknown>>
      settingsRead: () => Promise<Settings>
      settingsWrite: (settings: Settings) => Promise<boolean>
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
        read: () => Promise<Settings>
        write: (settings: Settings) => Promise<boolean>
      }
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', {
      readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
      writeFile: (path: string, content: string) =>
        ipcRenderer.invoke('fs:writeFile', path, content),
      dialogNewProject: () => ipcRenderer.invoke('dialog:newProject'),
      dialogOpenProject: () => ipcRenderer.invoke('dialog:openProject'),
      projectCreate: (path: string, name: string) =>
        ipcRenderer.invoke('project:create', path, name),
      projectRead: (path: string) => ipcRenderer.invoke('project:read', path),
      settingsRead: () => ipcRenderer.invoke('settings:read') as Promise<Settings>,
      settingsWrite: (settings: Settings) =>
        ipcRenderer.invoke('settings:write', settings) as Promise<boolean>
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
        read: () => ipcRenderer.invoke('settings:read') as Promise<Settings>,
        write: (settings: Settings) =>
          ipcRenderer.invoke('settings:write', settings) as Promise<boolean>
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
    settingsRead: () => ipcRenderer.invoke('settings:read') as Promise<Settings>,
    settingsWrite: (settings: Settings) =>
      ipcRenderer.invoke('settings:write', settings) as Promise<boolean>
  }
}
