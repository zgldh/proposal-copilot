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

export interface Tab {
  id: string
  type: 'home' | 'settings' | 'project'
  title: string
  path?: string // Required for 'project' type
  isDirty?: boolean
}

export interface ProviderConfig {
  id: string
  name: string
  api_key: string
  base_url?: string
  model: string
}

export interface Settings {
  theme: 'light' | 'dark'
  active_provider_id: string
  providers: Record<string, ProviderConfig>
  search_provider: 'mock' | 'tavily' | 'metaso'
  search_api_key: string
}
