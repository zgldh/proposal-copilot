import { contextBridge, ipcRenderer } from 'electron';
import { IBackendResponse, IProjectData, IServiceResult, ISettings } from '../shared/types';
import { IConversationMessage, ILLMResponseParsed } from '../main/services/conversation/types';
import { LLMProviderType, ILLMConfig } from '../main/services/llm/types';

contextBridge.exposeInMainWorld('electronAPI', {
  checkBackendStatus: (): Promise<IBackendResponse> => {
    return ipcRenderer.invoke('check-backend-status');
  },
  selectDirectory: (): Promise<IServiceResult<string>> => ipcRenderer.invoke('dialog:select-folder'),
  createProject: (path: string, name: string): Promise<IServiceResult<IProjectData>> => ipcRenderer.invoke('project:create', { path, name }),
  loadProject: (path: string): Promise<IServiceResult<IProjectData>> => ipcRenderer.invoke('project:load', { path }),
  saveProject: (path: string, data: IProjectData): Promise<IServiceResult<void>> => ipcRenderer.invoke('project:save', { path, data }),
  conversation: {
    sendMessage: (message: string, projectPath: string): Promise<IServiceResult<ILLMResponseParsed>> => ipcRenderer.invoke('conversation:send-message', message, projectPath),
    getHistory: (projectPath: string): Promise<IServiceResult<IConversationMessage[]>> => ipcRenderer.invoke('conversation:get-history', projectPath),
    clearHistory: (projectPath: string): Promise<IServiceResult<void>> => ipcRenderer.invoke('conversation:clear-history', projectPath),
  },
  settings: {
    get: (): Promise<IServiceResult<ISettings>> => ipcRenderer.invoke('settings:get'),
    updateLLM: (provider: LLMProviderType, config: Partial<ILLMConfig>): Promise<IServiceResult<void>> => ipcRenderer.invoke('settings:update-llm', provider, config),
    setProvider: (provider: LLMProviderType): Promise<IServiceResult<void>> => ipcRenderer.invoke('settings:set-provider', provider),
  },
  docgen: {
    exportWord: (projectPath: string): Promise<IServiceResult<string>> => ipcRenderer.invoke('docgen:export-word', projectPath),
    exportExcel: (projectPath: string): Promise<IServiceResult<string>> => ipcRenderer.invoke('docgen:export-excel', projectPath),
  },
});
