import { dialog, BrowserWindow, ipcMain } from 'electron'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
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

export function setupProjectHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('dialog:new-project', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Create New Project',
      buttonLabel: 'Select Folder',
      properties: ['openDirectory']
    })
    
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    
    return result.filePaths[0]
  })

  ipcMain.handle('dialog:open-project', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Project',
      buttonLabel: 'Open',
      properties: ['openDirectory', 'openFile'],
      filters: [{ name: 'Project JSON', extensions: ['json'] }]
    })
    
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    
    return result.filePaths[0]
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
    const defaultSettings: Settings = {
      llm_provider: {
        id: 'default',
        name: 'OpenAI',
        type: 'openai',
        api_key: '',
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-4'
      },
      theme: 'light'
    }
    writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2))
    return defaultSettings
  }
  
  const content = readFileSync(SETTINGS_PATH, 'utf-8')
  return JSON.parse(content)
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
