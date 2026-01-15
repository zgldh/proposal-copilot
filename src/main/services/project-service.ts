import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
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
    console.log('[ProjectService] Saving to path:', filePath)

    // Validate before save
    const validation = this.validator.validate(data)
    if (!validation.valid) {
      throw new Error(`Cannot save invalid project: ${validation.errors?.join(', ')}`)
    }

    data.meta.last_modified = new Date().toISOString()
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  async createSnapshot(path: string, description: string): Promise<string> {
    const project = await this.loadProject(path)
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
