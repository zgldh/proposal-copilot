import { ElectronAPI } from '@electron-toolkit/preload'

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

export {}
