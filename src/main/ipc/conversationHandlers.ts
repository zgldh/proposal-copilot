import { ipcMain } from 'electron';
import { IConversationMessage, ILLMResponseParsed } from '../services/conversation/types';
import { ConversationEngine } from '../services/conversation/ConversationEngine';
import { TreeOperations } from '../services/conversation/TreeOperations';
import { ProjectService } from '../services/ProjectService';
import { SettingsManager } from '../services/SettingsManager';
import { IProjectData } from '../../shared/types';
import { IServiceResult } from '../../shared/types';

const activeEngines = new Map<string, ConversationEngine>();

export function registerConversationHandlers(): void {
  ipcMain.handle('conversation:send-message', async (_event, message: string, projectPath: string): Promise<IServiceResult<ILLMResponseParsed>> => {
    try {
      const projectData = await ProjectService.loadProject(projectPath);
      const provider = SettingsManager.getCurrentProvider();
      const config = SettingsManager.getLLMConfig(provider);

      let engine = activeEngines.get(projectPath);
      if (!engine) {
        engine = new ConversationEngine(provider, config);
        activeEngines.set(projectPath, engine);
      }

      const response = await engine.sendUserMessage(message, projectData);

      if (response.operations.length > 0) {
        const updatedData = TreeOperations.applyOperations(projectData, response.operations);
        await ProjectService.saveProject(projectPath, updatedData);
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  ipcMain.handle('conversation:get-history', async (_event, projectPath: string): Promise<IServiceResult<IConversationMessage[]>> => {
    try {
      const engine = activeEngines.get(projectPath);
      if (!engine) {
        return { success: true, data: [] };
      }
      return {
        success: true,
        data: engine.getHistory(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  ipcMain.handle('conversation:clear-history', async (_event, projectPath: string): Promise<IServiceResult<void>> => {
    try {
      const engine = activeEngines.get(projectPath);
      if (engine) {
        engine.clearHistory();
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}