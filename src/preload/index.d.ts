import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI & {
      dialog: {
        newProject: () => Promise<string | null>
        openProject: () => Promise<string | null>
      }
    }
    api: unknown
  }
}
