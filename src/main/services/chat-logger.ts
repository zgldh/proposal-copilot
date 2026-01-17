import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

export interface LogEntry {
  timestamp: string
  role: 'user' | 'assistant' | 'system'
  content: string | any
}

export class ChatLogger {
  private getLogPath(projectPath: string): string {
    // If projectPath is a directory, append chat-history.json
    // If it's the project.json file, use its directory
    const dir = projectPath.endsWith('project.json')
      ? projectPath.replace('project.json', '')
      : projectPath
    return join(dir, 'chat-history.json')
  }

  log(projectPath: string, role: 'user' | 'assistant' | 'system', content: string | any): void {
    const logPath = this.getLogPath(projectPath)
    let history: LogEntry[] = []

    if (existsSync(logPath)) {
      try {
        const raw = readFileSync(logPath, 'utf-8')
        history = JSON.parse(raw)
      } catch (e) {
        console.error('[ChatLogger] Failed to read existing log:', e)
      }
    }

    history.push({
      timestamp: new Date().toISOString(),
      role,
      content
    })

    try {
      writeFileSync(logPath, JSON.stringify(history, null, 2), 'utf-8')
    } catch (e) {
      console.error('[ChatLogger] Failed to write log:', e)
    }
  }
}

export const chatLogger = new ChatLogger()
