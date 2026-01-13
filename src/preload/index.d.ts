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

interface ProjectMeta {
  name: string
  create_time: string
  version: string
}

interface TreeNode {
  id: string
  type: 'subsystem' | 'device' | 'feature'
  name: string
  specs: Record<string, string>
  quantity: number
  children: TreeNode[]
}

interface Project {
  meta: ProjectMeta
  context: string
  structure_tree: TreeNode[]
}

declare global {
  interface Window {
    electronAPI: {
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<void>
      dialogNewProject: () => Promise<string | null>
      dialogOpenProject: () => Promise<string | null>
      projectCreate: (path: string, name: string) => Promise<string>
      projectRead: (path: string) => Promise<Project>
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
        read: (path: string) => Promise<Project>
      }
      settings: {
        read: () => Promise<Settings>
        write: (settings: Settings) => Promise<boolean>
      }
    }
  }
}

export {}
