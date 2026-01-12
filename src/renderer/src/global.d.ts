import { IBackendResponse, IServiceResult, IProjectData } from '../../shared/types';

export interface IElectronAPI {
  checkBackendStatus: () => Promise<IBackendResponse>;
  selectDirectory: () => Promise<IServiceResult<string>>;
  createProject: (path: string, name: string) => Promise<IServiceResult<IProjectData>>;
  loadProject: (path: string) => Promise<IServiceResult<IProjectData>>;
  saveProject: (path: string, data: IProjectData) => Promise<IServiceResult<void>>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
