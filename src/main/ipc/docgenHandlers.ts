import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { DocumentGenerator } from '../services/docgen/DocumentGenerator';
import { IServiceResult, IProjectData } from '../../shared/types';

function validateProjectPath(projectPath: string): void {
  if (!projectPath || typeof projectPath !== 'string') {
    throw new Error('Invalid project path');
  }
  if (projectPath.includes('..')) {
    throw new Error('Path traversal detected');
  }
  const normalizedPath = path.normalize(projectPath);
  if (!path.isAbsolute(normalizedPath)) {
    throw new Error('Project path must be absolute');
  }
}

async function loadProject(projectPath: string): Promise<IProjectData> {
  validateProjectPath(projectPath);
  const projectJson = await fs.readFile(path.join(projectPath, 'project.json'), 'utf-8');
  return JSON.parse(projectJson) as IProjectData;
}

export function registerDocgenHandlers(): void {
  ipcMain.handle('docgen:export-word', async (_e, projectPath: string): Promise<IServiceResult<string>> => {
    try {
      const projectData = await loadProject(projectPath);

      const result = await dialog.showSaveDialog({
        defaultPath: `${projectData.meta.name.replace(/\s+/g, '_')}.docx`,
        filters: [{ name: 'Word Document', extensions: ['docx'] }]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Save dialog canceled' };
      }

      await DocumentGenerator.generateWord(projectData, result.filePath);
      return { success: true, data: result.filePath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('docgen:export-excel', async (_e, projectPath: string): Promise<IServiceResult<string>> => {
    try {
      const projectData = await loadProject(projectPath);

      const result = await dialog.showSaveDialog({
        defaultPath: `${projectData.meta.name.replace(/\s+/g, '_')}.xlsx`,
        filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Save dialog canceled' };
      }

      await DocumentGenerator.generateExcel(projectData, result.filePath);
      return { success: true, data: result.filePath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
