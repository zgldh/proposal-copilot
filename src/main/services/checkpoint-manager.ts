import { join, dirname } from 'path'
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, unlinkSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'

interface CheckpointData {
  id: string
  timestamp: string
  description: string
  project: any
}

export class CheckpointManager {
  private getCheckpointDir(projectFilePath: string): string {
    return join(dirname(projectFilePath), '.checkpoints')
  }

  createCheckpoint(projectFilePath: string, data: any, description: string): string {
    const dir = this.getCheckpointDir(projectFilePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    const id = uuidv4()
    const timestamp = new Date().toISOString()
    // Safe filename: ISO timestamp usually has colons, replace them
    const safeTimestamp = timestamp.replace(/[:.]/g, '-')
    const filename = `${safeTimestamp}_${id}.json`
    const filePath = join(dir, filename)

    const checkpoint: CheckpointData = {
      id,
      timestamp,
      description,
      project: data
    }

    writeFileSync(filePath, JSON.stringify(checkpoint, null, 2), 'utf-8')
    this.prune(projectFilePath)
    return id
  }

  prune(projectFilePath: string, maxCount: number = 20): void {
    const dir = this.getCheckpointDir(projectFilePath)
    if (!existsSync(dir)) return

    const files = readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .sort() // ISO timestamp based naming ensures lexicographical sort = chronological

    if (files.length > maxCount) {
      const toDelete = files.slice(0, files.length - maxCount)
      toDelete.forEach(file => unlinkSync(join(dir, file)))
    }
  }

  getLatestCheckpoint(projectFilePath: string): CheckpointData | null {
    const dir = this.getCheckpointDir(projectFilePath)
    if (!existsSync(dir)) return null

    const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort()
    if (files.length === 0) return null

    const content = readFileSync(join(dir, files[files.length - 1]), 'utf-8')
    return JSON.parse(content) as CheckpointData
  }
}
