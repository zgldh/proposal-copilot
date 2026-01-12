import { IBackendResponse } from '../../shared/types';

export interface IElectronAPI {
  checkBackendStatus: () => Promise<IBackendResponse>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
