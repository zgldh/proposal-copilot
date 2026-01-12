import { promises as fs } from 'fs';
import * as path from 'path';
import { IProjectData } from '../../shared/types';

const FILE_NAME = 'project.json';

export class ProjectService {
  static createInitialData(name: string): IProjectData {
    return {
      meta: {
        name,
        create_time: new Date().toISOString(),
        version: '1.0.0'
      },
      context: '',
      structure_tree: []
    };
  }

  static async createProject(folderPath: string, name: string): Promise<IProjectData> {
    const filePath = path.join(folderPath, FILE_NAME);
    
    // Ensure we are not overwriting an existing project implicitly
    try {
      await fs.access(filePath);
      throw new Error(`A project already exists in this folder: ${filePath}`);
    } catch (e: unknown) {
      const error = e as NodeJS.ErrnoException;
      if (error.code !== 'ENOENT') throw e;
    }

    const data = this.createInitialData(name);
    await this.saveProject(folderPath, data);
    return data;
  }

  static async loadProject(folderPath: string): Promise<IProjectData> {
    const filePath = path.join(folderPath, FILE_NAME);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    
    if (!this.isProjectData(parsed)) {
      throw new Error('Invalid project.json format');
    }
    return parsed;
  }

  static async saveProject(folderPath: string, data: IProjectData): Promise<void> {
    const filePath = path.join(folderPath, FILE_NAME);
    const tempPath = `${filePath}.tmp`;
    
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, filePath);
  }

  private static isProjectData(obj: unknown): obj is IProjectData {
    // Basic structural validation
    const data = obj as IProjectData;
    return !!(data && typeof data === 'object' && 'meta' in data && 'structure_tree' in data);
  }
}
