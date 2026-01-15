declare module 'marked' {
  export function parse(markdown: string): string
}

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

interface TreeOperation {
  type: 'add' | 'update' | 'delete' | 'move'
  targetParentId?: string | null
  targetNodeId?: string
  nodeData?: Partial<TreeNode>
  targetParentName?: string // Optional context from AI
  targetNodeName?: string
}

interface GuidanceOption {
  label: string
  value: string
}

interface GuidanceData {
  intent: 'clarification' | 'suggestion'
  text?: string
  options: GuidanceOption[]
}

interface ConversionResult {
  textResponse: string
  operations: TreeOperation[]
  guidance?: GuidanceData
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
      projectRead: (path: string) => Promise<Project>
      projectSave: (path: string, data: Project) => Promise<boolean>
      projectUndo: (path: string) => Promise<Project | null>
      settingsRead: () => Promise<Settings>
      settingsWrite: (settings: Settings) => Promise<boolean>
      ai: {
        testConnection: (config: ProviderConfig) => Promise<boolean>
        chat: (messages: ChatMessage[], config: ProviderConfig) => Promise<string>
        streamChat: (messages: ChatMessage[], config: ProviderConfig) => Promise<void>
        onStreamChunk: (callback: (chunk: string) => void) => () => void
        onStreamComplete: (callback: () => void) => () => void
        onStreamError: (callback: (error: string) => void) => () => void
        cancelProcessing: () => Promise<void>
        ollama: {
          getModels: (baseUrl: string) => Promise<string[]>
        }
        processMessage: (params: {
          message: string
          history: ChatMessage[]
          projectPath: string
          projectContext: TreeNode[]
          config: ProviderConfig
        }) => Promise<ConversionResult>
      }
    }
    electron: {
      dialog: {
        newProject: () => Promise<string | null>
        openProject: () => Promise<string | null>
      }
      project: {
        create: (path: string, name: string) => Promise<string>
        read: (path: string) => Promise<Project>
        save: (path: string, data: Project) => Promise<boolean>
        undo: (path: string) => Promise<Project | null>
      }
      settings: {
        read: () => Promise<Settings>
        write: (settings: Settings) => Promise<boolean>
      }
    }
  }
}

export {}
