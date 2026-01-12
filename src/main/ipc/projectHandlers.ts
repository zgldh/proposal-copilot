import { ipcMain, dialog } from 'electron';
import { ProjectService } from '../services/ProjectService';
import { IProjectData, IServiceResult } from '../../shared/types';

export function registerProjectHandlers(): void {
  ipcMain.handle('dialog:select-folder', async (): Promise<IServiceResult<string>> => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
      title: 'Select Project Folder'
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'Selection canceled' };
    }
    return { success: true, data: result.filePaths[0] };
  });

  ipcMain.handle('project:create', async (_e, { path, name }: { path: string; name: string }): Promise<IServiceResult<IProjectData>> => {
    try {
      const data = await ProjectService.createProject(path, name);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('project:load', async (_e, { path }: { path: string }): Promise<IServiceResult<IProjectData>> => {
    try {
      const data = await ProjectService.loadProject(path);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('project:save', async (_e, { path, data }: { path: string; data: IProjectData }): Promise<IServiceResult<void>> => {
    try {
      await ProjectService.saveProject(path, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
