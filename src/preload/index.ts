import { contextBridge, ipcRenderer } from 'electron'

interface ProviderConfig {
  id: string
  name: string
  api_key: string
  base_url?: string
  model: string
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface Settings {
  theme: 'light' | 'dark'
  active_provider_id: string
  providers: Record<string, ProviderConfig>
}

declare global {
  interface Window {
    electronAPI: {
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<void>
      isDirectoryEmpty: (path: string) => Promise<boolean>
      dialogNewProject: () => Promise<string | null>
      dialogOpenProject: () => Promise<string | null>
      projectCreate: (path: string, name: string) => Promise<string>
      projectRead: (path: string) => Promise<Record<string, unknown>>
      settingsRead: () => Promise<Settings>
      settingsWrite: (settings: Settings) => Promise<boolean>
      ai: {
        testConnection: (config: ProviderConfig) => Promise<boolean>
        chat: (messages: ChatMessage[], config: ProviderConfig) => Promise<string>
        streamChat: (messages: ChatMessage[], config: ProviderConfig) => Promise<void>
        onStreamChunk: (callback: (chunk: string) => void) => () => void
        onStreamComplete: (callback: () => void) => () => void
        onStreamError: (callback: (error: string) => void) => () => void
        ollama: {
          getModels: (baseUrl: string) => Promise<string[]>
        }
      }
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
      isDirectoryEmpty: (path: string) => ipcRenderer.invoke('fs:isDirectoryEmpty', path),
      dialogNewProject: () => ipcRenderer.invoke('dialog:newProject'),
      dialogOpenProject: () => ipcRenderer.invoke('dialog:openProject'),
      projectCreate: (path: string, name: string) =>
        ipcRenderer.invoke('project:create', path, name),
      projectRead: (path: string) => ipcRenderer.invoke('project:read', path),
      settingsRead: () => ipcRenderer.invoke('settings:read') as Promise<Settings>,
      settingsWrite: (settings: Settings) =>
        ipcRenderer.invoke('settings:write', settings) as Promise<boolean>,
      ai: {
        testConnection: (config: ProviderConfig) =>
          ipcRenderer.invoke('ai:testConnection', config),
        chat: (messages: ChatMessage[], config: ProviderConfig) =>
          ipcRenderer.invoke('ai:chat', messages, config),
        streamChat: (messages: ChatMessage[], config: ProviderConfig) =>
          ipcRenderer.invoke('ai:stream', messages, config),
        onStreamChunk: (callback: (chunk: string) => void) => {
          const subscription = (_: unknown, chunk: string) => callback(chunk)
          ipcRenderer.on('ai:stream-chunk', subscription)
          return () => ipcRenderer.removeListener('ai:stream-chunk', subscription)
        },
        onStreamComplete: (callback: () => void) => {
          ipcRenderer.on('ai:stream-complete', callback)
          return () => ipcRenderer.removeListener('ai:stream-complete', callback)
        },
        onStreamError: (callback: (error: string) => void) => {
          const subscription = (_: unknown, error: string) => callback(error)
          ipcRenderer.on('ai:stream-error', subscription)
          return () => ipcRenderer.removeListener('ai:stream-error', subscription)
        },
        ollama: {
          getModels: (baseUrl: string) => ipcRenderer.invoke('ai:ollama:getModels', baseUrl)
        }
      }
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
    isDirectoryEmpty: (path: string) => ipcRenderer.invoke('fs:isDirectoryEmpty', path),
    dialogNewProject: () => ipcRenderer.invoke('dialog:newProject'),
    dialogOpenProject: () => ipcRenderer.invoke('dialog:openProject'),
    projectCreate: (path: string, name: string) => ipcRenderer.invoke('project:create', path, name),
    projectRead: (path: string) => ipcRenderer.invoke('project:read', path),
    settingsRead: () => ipcRenderer.invoke('settings:read') as Promise<Settings>,
    settingsWrite: (settings: Settings) =>
      ipcRenderer.invoke('settings:write', settings) as Promise<boolean>,
    ai: {
      testConnection: (config: ProviderConfig) =>
        ipcRenderer.invoke('ai:testConnection', config),
      chat: (messages: ChatMessage[], config: ProviderConfig) =>
        ipcRenderer.invoke('ai:chat', messages, config),
      streamChat: (messages: ChatMessage[], config: ProviderConfig) =>
        ipcRenderer.invoke('ai:stream', messages, config),
      onStreamChunk: (callback: (chunk: string) => void) => {
        const subscription = (_: unknown, chunk: string) => callback(chunk)
        ipcRenderer.on('ai:stream-chunk', subscription)
        return () => ipcRenderer.removeListener('ai:stream-chunk', subscription)
      },
      onStreamComplete: (callback: () => void) => {
        ipcRenderer.on('ai:stream-complete', callback)
        return () => ipcRenderer.removeListener('ai:stream-complete', callback)
      },
      onStreamError: (callback: (error: string) => void) => {
        const subscription = (_: unknown, error: string) => callback(error)
        ipcRenderer.on('ai:stream-error', subscription)
        return () => ipcRenderer.removeListener('ai:stream-error', subscription)
      },
      ollama: {
        getModels: (baseUrl: string) => ipcRenderer.invoke('ai:ollama:getModels', baseUrl)
      }
    }
  }
}
