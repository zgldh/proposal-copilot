import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { DocumentGenerator } from '../services/docgen/DocumentGenerator';
import { IServiceResult, IProjectData } from '../../shared/types';

export function registerDocgenHandlers(): void {
  ipcMain.handle('docgen:export-word', async (_e, projectPath: string): Promise<IServiceResult<string>> => {
    try {
      const projectData = JSON.parse(await fs.readFile(path.join(projectPath, 'project.json'), 'utf-8')) as IProjectData;

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
      const projectData = JSON.parse(await fs.readFile(path.join(projectPath, 'project.json'), 'utf-8')) as IProjectData;

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
