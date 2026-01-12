import { ipcMain } from 'electron';
import { SettingsManager } from '../services/SettingsManager';
import { LLMProviderType, ILLMConfig } from '../services/llm/types';
import { IServiceResult, ISettings } from '../../shared/types';

/**
 * Registers IPC handlers for settings-related operations.
 * Handles retrieving settings, updating LLM configurations, and setting the active provider.
 */
export function registerSettingsHandlers(): void {
  /**
   * IPC handler for retrieving all application settings.
   */
  ipcMain.handle('settings:get', async (): Promise<IServiceResult<ISettings>> => {
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

  /**
   * IPC handler for updating LLM provider configuration.
   */
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

  /**
   * IPC handler for setting the active LLM provider.
   */
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