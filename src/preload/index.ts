import { contextBridge, ipcRenderer } from 'electron';
import { IBackendResponse, IProjectData, IServiceResult } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  checkBackendStatus: (): Promise<IBackendResponse> => {
    return ipcRenderer.invoke('check-backend-status');
  },
  selectDirectory: (): Promise<IServiceResult<string>> => ipcRenderer.invoke('dialog:select-folder'),
  createProject: (path: string, name: string): Promise<IServiceResult<IProjectData>> => ipcRenderer.invoke('project:create', { path, name }),
  loadProject: (path: string): Promise<IServiceResult<IProjectData>> => ipcRenderer.invoke('project:load', { path }),
  saveProject: (path: string, data: IProjectData): Promise<IServiceResult<void>> => ipcRenderer.invoke('project:save', { path, data }),
});
