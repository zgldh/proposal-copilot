import { ipcMain, dialog } from 'electron';
import { DocumentGenerator } from '../services/docgen/DocumentGenerator';
import { IServiceResult } from '../../shared/types';

export function registerDocgenHandlers(): void {
  ipcMain.handle('docgen:export-word', async (_e, { projectPath, outputPath }: { projectPath: string; outputPath?: string }): Promise<IServiceResult<string>> => {
    try {
      const result = await DocumentGenerator.exportToWord(projectPath, outputPath);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.filePath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('docgen:export-excel', async (_e, { projectPath, outputPath }: { projectPath: string; outputPath?: string }): Promise<IServiceResult<string>> => {
    try {
      const result = await DocumentGenerator.exportToExcel(projectPath, outputPath);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, data: result.filePath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('docgen:save-as', async (_e, { projectPath, format }: { projectPath: string; format: 'word' | 'excel' }): Promise<IServiceResult<string>> => {
    try {
      const defaultName = 'export';
      const filters = format === 'word'
        ? [{ name: 'Word Document', extensions: ['docx'] }]
        : [{ name: 'Excel Workbook', extensions: ['xlsx'] }];

      const result = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Save dialog canceled' };
      }

      const exportResult = format === 'word'
        ? await DocumentGenerator.exportToWord(projectPath, result.filePath)
        : await DocumentGenerator.exportToExcel(projectPath, result.filePath);

      if (!exportResult.success) {
        return { success: false, error: exportResult.error };
      }

      return { success: true, data: exportResult.filePath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
