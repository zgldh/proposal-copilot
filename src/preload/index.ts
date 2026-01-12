import { contextBridge, ipcRenderer } from 'electron';
import { IBackendResponse } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  checkBackendStatus: (): Promise<IBackendResponse> => {
    return ipcRenderer.invoke('check-backend-status');
  }
});
