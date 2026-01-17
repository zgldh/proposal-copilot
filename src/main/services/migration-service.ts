import type { Project } from './project-service'

export class MigrationService {
  migrate(data: any): Project {
    const project = { ...data }

    // Initial migration: Ensure schema_version exists
    if (!project.meta.schema_version) {
      project.meta.schema_version = '1.0.0'
    }

    // Ensure last_modified exists
    if (!project.meta.last_modified) {
      project.meta.last_modified = new Date().toISOString()
    }

    // Future migrations would go here based on version comparison

    return project as Project
  }
}
