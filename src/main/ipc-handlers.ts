import { dialog, BrowserWindow, ipcMain } from 'electron'
import { existsSync, writeFileSync, readFileSync, readdirSync } from 'fs'
import { join, normalize } from 'path'
import { app } from 'electron'
import { projectService, Project } from './services/project-service'

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

export function setupProjectHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('fs:readFile', async (_event, path: string) => {
    console.log('[IPC] fs:readFile', path)
    if (!existsSync(path)) {
      console.error('[IPC] fs:readFile error: Not found', path)
      throw new Error('File not found')
    }
    return readFileSync(path, 'utf-8')
  })

  ipcMain.handle('fs:writeFile', async (_event, path: string, content: string) => {
    console.log('[IPC] fs:writeFile', path)
    try {
      writeFileSync(path, content, 'utf-8')
    } catch (error) {
      console.error('[IPC] fs:writeFile error:', error)
      throw error
    }
  })

  ipcMain.handle('fs:isDirectoryEmpty', async (_event, path: string) => {
    console.log('[IPC] fs:isDirectoryEmpty', path)
    const files = readdirSync(path)
    return files.length === 0
  })

  ipcMain.handle('dialog:newProject', async () => {
    console.log('[IPC] dialog:newProject')
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Create New Project',
      buttonLabel: 'Select Folder',
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      console.log('[IPC] dialog:newProject canceled')
      return null
    }

    console.log('[IPC] dialog:newProject selected', result.filePaths[0])
    return normalize(result.filePaths[0])
  })

  ipcMain.handle('dialog:openProject', async () => {
    console.log('[IPC] dialog:openProject')
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Project',
      buttonLabel: 'Open',
      properties: ['openDirectory', 'openFile'],
      filters: [{ name: 'Project JSON', extensions: ['json'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
      console.log('[IPC] dialog:openProject canceled')
      return null
    }

    console.log('[IPC] dialog:openProject selected', result.filePaths[0])
    return normalize(result.filePaths[0])
  })

  ipcMain.handle('project:create', async (_event, projectPath: string, projectName: string) => {
    console.log('[IPC] project:create', { projectPath, projectName })
    const initialProject = {
      meta: {
        name: projectName,
        create_time: new Date().toISOString(),
        version: '1.0.0',
        last_modified: new Date().toISOString(),
        schema_version: '1.0.0'
      },
      context: '',
      chat_history: [],
      structure_tree: [] as any[]
    }

    const projectJsonPath = join(projectPath, 'project.json')
    // We use save which handles validation (though initial is valid) and formatting
    try {
      await projectService.saveProject(projectJsonPath, initialProject as Project)
      console.log('[IPC] project:create success', projectJsonPath)
      return projectJsonPath
    } catch (error) {
      console.error('[IPC] project:create error:', error)
      throw error
    }
  })

  ipcMain.handle('project:read', async (_event, path: string) => {
    console.log('[IPC] project:read', path)
    // ProjectService handles validation and migration on load
    try {
      return await projectService.loadProject(path)
    } catch (error) {
      console.error('[IPC] project:read error:', error)
      throw error
    }
  })

  ipcMain.handle('project:save', async (_event, path: string, data: Project) => {
    console.log('[IPC] project:save', path)
    try {
      await projectService.saveProject(path, data)
      return true
    } catch (error) {
      console.error('[IPC] project:save error:', error)
      throw error
    }
  })

  ipcMain.handle('project:undo', async (_event, path: string) => {
    console.log('[IPC] project:undo', path)
    try {
      const restoredProject = await projectService.rollback(path)
      return restoredProject
    } catch (error) {
      console.error('[IPC] project:undo error:', error)
      throw error
    }
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

  const defaults = createDefaultSettings()
  // Migration logic: convert legacy settings if 'llm_provider' exists
  if (raw.llm_provider) {
    const legacy = raw.llm_provider
    const defaultSettings = defaults

    // Map legacy values to the appropriate provider in new structure
    const targetId =
      legacy.type === 'deepseek' ? 'deepseek' : legacy.type === 'custom' ? 'ollama' : 'openai'

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

  // Merge with defaults to ensure new fields (like search_provider) exist
  const merged = { ...defaults, ...raw }
  // Ensure providers object is also merged correctly if keys are missing? For now top level merge is sufficient for scalar new fields.
  return merged
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
      ollama: {
        id: 'ollama',
        name: 'Ollama (Local)',
        api_key: 'ollama',
        base_url: 'http://localhost:11434',
        model: ''
      }
    },
    search_provider: 'mock',
    search_api_key: ''
  }
}

function writeSettings(settings: Settings): void {
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

export function setupSettingsHandlers() {
  ipcMain.handle('settings:read', async () => {
    console.log('[IPC] settings:read')
    return readSettings()
  })

  ipcMain.handle('settings:write', async (_event, settings: Settings) => {
    console.log('[IPC] settings:write')
    try {
      writeSettings(settings)
      return true
    } catch (error) {
      console.error('[IPC] settings:write error:', error)
      throw error
    }
  })
}
