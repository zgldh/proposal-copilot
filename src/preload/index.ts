import { contextBridge, ipcRenderer } from 'electron';
import { IBackendResponse, IProjectData, IServiceResult } from '../shared/types';
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
    sendMessage: (message, projectPath): Promise<IServiceResult<ILLMResponseParsed>> => ipcRenderer.invoke('conversation:send-message', message, projectPath),
    getHistory: (projectPath): Promise<IServiceResult<IConversationMessage[]>> => ipcRenderer.invoke('conversation:get-history', projectPath),
    clearHistory: (projectPath): Promise<IServiceResult<void>> => ipcRenderer.invoke('conversation:clear-history', projectPath),
  },
  settings: {
    get: (): Promise<IServiceResult<any>> => ipcRenderer.invoke('settings:get'),
    updateLLM: (provider, config): Promise<IServiceResult<void>> => ipcRenderer.invoke('settings:update-llm', provider, config),
    setProvider: (provider): Promise<IServiceResult<void>> => ipcRenderer.invoke('settings:set-provider', provider),
  },
});
