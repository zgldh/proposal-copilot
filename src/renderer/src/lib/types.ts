export interface Project {
  meta: {
    name: string
    create_time: string
    version: string
  }
  context: string
  structure_tree: TreeNode[]
}

export interface TreeNode {
  id: string
  type: 'subsystem' | 'device' | 'feature'
  name: string
  specs: Record<string, string>
  quantity: number
  children: TreeNode[]
}

export interface LlmProvider {
  id: string
  name: string
  type: 'openai' | 'deepseek' | 'custom'
  api_key: string
  base_url?: string
  model: string
}

export interface Settings {
  llm_provider: LlmProvider
  theme: 'light' | 'dark'
}
