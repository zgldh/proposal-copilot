import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

export interface LogEntry {
  role: 'user' | 'assistant' | 'system'
  content: string | any
  timestamp: number
  guidance?: any
}

export class ChatLogger {
  private getLogPath(projectPath: string): string {
    const dir = projectPath.endsWith('project.json')
      ? projectPath.replace('project.json', '')
      : projectPath
    return join(dir, 'chat-history.json')
  }

  log(
    projectPath: string,
    role: 'user' | 'assistant' | 'system',
    content: string | any,
    guidance?: any
  ): void {
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
      role,
      content,
      timestamp: Date.now(),
      guidance
    })

    try {
      writeFileSync(logPath, JSON.stringify(history, null, 2), 'utf-8')
    } catch (e) {
      console.error('[ChatLogger] Failed to write log:', e)
    }
  }
}

export const chatLogger = new ChatLogger()
