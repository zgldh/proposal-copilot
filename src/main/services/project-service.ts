import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { ProjectValidator } from './project-validator'
import { MigrationService } from './migration-service'
import { CheckpointManager } from './checkpoint-manager'

export interface TreeNode {
  id: string
  type: 'subsystem' | 'device' | 'feature'
  name: string
  specs: Record<string, string>
  quantity: number
  children: TreeNode[]
}

export interface Project {
  meta: {
    name: string
    create_time: string
    version: string
    last_modified: string
    schema_version: string
  }
  context: string
  chat_history?: any[]
  structure_tree: TreeNode[]
}

export class ProjectService {
  private validator: ProjectValidator
  private migration: MigrationService
  private checkpoints: CheckpointManager

  constructor() {
    this.validator = new ProjectValidator()
    this.migration = new MigrationService()
    this.checkpoints = new CheckpointManager()
  }

  async loadProject(path: string): Promise<Project> {
    const filePath = path.endsWith('project.json') ? path : join(path, 'project.json')
    if (!existsSync(filePath)) {
      throw new Error(`Project file not found: ${filePath}`)
    }

    const rawData = JSON.parse(readFileSync(filePath, 'utf-8'))

    // Load structure if it exists separately
    const structurePath = join(dirname(filePath), 'structure.json')
    if (existsSync(structurePath)) {
      try {
        rawData.structure_tree = JSON.parse(readFileSync(structurePath, 'utf-8'))
      } catch (e) {
        console.error('[ProjectService] Failed to load structure.json:', e)
        rawData.structure_tree = rawData.structure_tree || []
      }
    } else {
      rawData.structure_tree = rawData.structure_tree || []
    }

    // Load chat history if it exists separately
    const chatHistoryPath = join(dirname(filePath), 'chat-history.json')
    if (existsSync(chatHistoryPath)) {
      try {
        const chatData = JSON.parse(readFileSync(chatHistoryPath, 'utf-8'))
        rawData.chat_history = chatData
      } catch (e) {
        console.error('[ProjectService] Failed to load chat-history.json:', e)
        rawData.chat_history = rawData.chat_history || []
      }
    } else {
      rawData.chat_history = rawData.chat_history || []
    }

    // Migrate
    const migratedData = this.migration.migrate(rawData)

    // Validate
    const validation = this.validator.validate(migratedData)
    if (!validation.valid) {
      throw new Error(`Project validation failed: ${validation.errors?.join(', ')}`)
    }

    return migratedData
  }

  async saveProject(path: string, data: Project): Promise<void> {
    const filePath = path.endsWith('project.json') ? path : join(path, 'project.json')
    const projectDir = dirname(filePath)
    console.log('[ProjectService] Saving to path:', filePath)

    // Validate before save
    const validation = this.validator.validate(data)
    if (!validation.valid) {
      throw new Error(`Cannot save invalid project: ${validation.errors?.join(', ')}`)
    }

    data.meta.last_modified = new Date().toISOString()

    // Split data for separate files
    const { structure_tree, chat_history, ...projectMeta } = data

    // 1. Save project.json (Meta + Context)
    writeFileSync(filePath, JSON.stringify(projectMeta, null, 2), 'utf-8')

    // 2. Save structure.json
    const structurePath = join(projectDir, 'structure.json')
    writeFileSync(structurePath, JSON.stringify(structure_tree || [], null, 2), 'utf-8')

    // 3. Save chat-history.json
    if (chat_history) {
      const chatHistoryPath = join(projectDir, 'chat-history.json')
      writeFileSync(chatHistoryPath, JSON.stringify(chat_history, null, 2), 'utf-8')
    }
  }

  async createSnapshot(path: string, description: string, data?: Project): Promise<string> {
    const project = data || (await this.loadProject(path))
    return this.checkpoints.createCheckpoint(path, project, description)
  }

  async rollback(path: string): Promise<Project | null> {
    const checkpoint = this.checkpoints.getLatestCheckpoint(path)
    if (checkpoint) {
      await this.saveProject(path, checkpoint.project)
      return checkpoint.project
    }
    return null
  }
}

export const projectService = new ProjectService()
