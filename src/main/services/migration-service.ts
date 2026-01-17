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

    if (!project.chat_history) {
      project.chat_history = []
    } else {
      // Fix timestamps if they are strings (legacy from ChatLogger) or missing
      project.chat_history = project.chat_history.map((msg: any) => {
        let timestamp = msg.timestamp
        if (typeof timestamp === 'string') {
          timestamp = new Date(timestamp).getTime()
        }
        if (!timestamp) {
          timestamp = Date.now()
        }
        return { ...msg, timestamp }
      })
    }

    return project as Project
  }
}
