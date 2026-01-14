import { dialog, BrowserWindow, ipcMain } from 'electron'
import { existsSync, writeFileSync, readFileSync, readdirSync } from 'fs'
import { join, normalize } from 'path'
import { app } from 'electron'

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

export interface Project {
  meta: ProjectMeta
  context: string
  structure_tree: TreeNode[]
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
}

export function setupProjectHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('fs:readFile', async (_event, path: string) => {
    if (!existsSync(path)) {
      throw new Error('File not found')
    }
    return readFileSync(path, 'utf-8')
  })

  ipcMain.handle('fs:writeFile', async (_event, path: string, content: string) => {
    writeFileSync(path, content, 'utf-8')
  })

  ipcMain.handle('fs:isDirectoryEmpty', async (_event, path: string) => {
    const files = readdirSync(path)
    return files.length === 0
  })

  ipcMain.handle('dialog:newProject', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Create New Project',
      buttonLabel: 'Select Folder',
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return normalize(result.filePaths[0])
  })

  ipcMain.handle('dialog:openProject', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Project',
      buttonLabel: 'Open',
      properties: ['openDirectory', 'openFile'],
      filters: [{ name: 'Project JSON', extensions: ['json'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return normalize(result.filePaths[0])
  })

  ipcMain.handle('project:create', async (_event, projectPath: string, projectName: string) => {
    const project: Project = {
      meta: {
        name: projectName,
        create_time: new Date().toISOString(),
        version: '1.0.0'
      },
      context: '',
      structure_tree: []
    }

    const projectJsonPath = join(projectPath, 'project.json')
    writeFileSync(projectJsonPath, JSON.stringify(project, null, 2))

    return projectJsonPath
  })

  ipcMain.handle('project:read', async (_event, path: string) => {
    const projectJsonPath = path.endsWith('project.json') ? path : join(path, 'project.json')

    if (!existsSync(projectJsonPath)) {
      throw new Error('project.json not found')
    }

    const content = readFileSync(projectJsonPath, 'utf-8')
    return JSON.parse(content)
  })
}

const SETTINGS_PATH = join(app.getPath('userData'), 'settings.json')

function readSettings(): Settings {
  if (!existsSync(SETTINGS_PATH)) {
    const defaultSettings = createDefaultSettings()
    writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2))
    return defaultSettings
  }

  const content = readFileSync(SETTINGS_PATH, 'utf-8')
  const raw = JSON.parse(content)

  // Migration logic: convert legacy settings if 'llm_provider' exists
  if (raw.llm_provider) {
    const legacy = raw.llm_provider
    const defaultSettings = createDefaultSettings()

    // Map legacy values to the appropriate provider in new structure
    const targetId =
      legacy.type === 'deepseek' ? 'deepseek' : legacy.type === 'custom' ? 'custom' : 'openai'

    defaultSettings.active_provider_id = targetId
    defaultSettings.theme = raw.theme || 'light'

    if (defaultSettings.providers[targetId]) {
      defaultSettings.providers[targetId].api_key = legacy.api_key || ''
      defaultSettings.providers[targetId].base_url =
        legacy.base_url || defaultSettings.providers[targetId].base_url
      defaultSettings.providers[targetId].model =
        legacy.model || defaultSettings.providers[targetId].model
    }

    // Save migrated settings
    writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2))
    return defaultSettings
  }

  return raw
}

function createDefaultSettings(): Settings {
  return {
    theme: 'dark',
    active_provider_id: 'openai',
    providers: {
      openai: {
        id: 'openai',
        name: 'OpenAI',
        api_key: '',
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-4'
      },
      deepseek: {
        id: 'deepseek',
        name: 'DeepSeek',
        api_key: '',
        base_url: 'https://api.deepseek.com',
        model: 'deepseek-chat'
      },
      custom: {
        id: 'custom',
        name: 'Custom (Ollama)',
        api_key: 'sk-placeholder',
        base_url: 'http://localhost:11434/v1',
        model: 'llama3'
      }
    }
  }
}

function writeSettings(settings: Settings): void {
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

export function setupSettingsHandlers() {
  ipcMain.handle('settings:read', async () => {
    return readSettings()
  })

  ipcMain.handle('settings:write', async (_event, settings: Settings) => {
    writeSettings(settings)
    return true
  })
}
