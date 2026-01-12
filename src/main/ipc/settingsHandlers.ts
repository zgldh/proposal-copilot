import { ipcMain } from 'electron';
import { SettingsManager } from '../services/SettingsManager';
import { LLMProviderType, ILLMConfig } from '../services/llm/types';
import { IServiceResult } from '../../shared/types';

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async (): Promise<IServiceResult<any>> => {
    try {
      return {
        success: true,
        data: SettingsManager.getSettings(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  ipcMain.handle('settings:update-llm', async (_event, provider: LLMProviderType, config: Partial<ILLMConfig>): Promise<IServiceResult<void>> => {
    try {
      SettingsManager.updateLLMConfig(provider, config);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  ipcMain.handle('settings:set-provider', async (_event, provider: LLMProviderType): Promise<IServiceResult<void>> => {
    try {
      SettingsManager.setCurrentProvider(provider);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}