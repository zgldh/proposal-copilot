import { IBackendResponse, IServiceResult, IProjectData } from '../../shared/types';

export interface ILLMResponseParsed {
  operations: Array<{
    action: 'add_node' | 'update_node' | 'delete_node' | 'update_context';
    path?: string;
    node?: {
      type: 'subsystem' | 'device' | 'feature';
      name: string;
      quantity: number;
      specs: Record<string, string | number | boolean>;
    };
    context?: string;
  }>;
  proactiveQuestions: string[];
}

export interface IConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ILLMConfig {
  apiKey?: string;
  baseURL?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ILLMSettings {
  provider: 'openai' | 'deepseek' | 'custom';
  openai: ILLMConfig;
  deepseek: ILLMConfig;
  custom: ILLMConfig;
}

export interface IElectronAPI {
  checkBackendStatus: () => Promise<IBackendResponse>;
  selectDirectory: () => Promise<IServiceResult<string>>;
  createProject: (path: string, name: string) => Promise<IServiceResult<IProjectData>>;
  loadProject: (path: string) => Promise<IServiceResult<IProjectData>>;
  saveProject: (path: string, data: IProjectData) => Promise<IServiceResult<void>>;
  conversation: {
    sendMessage: (message: string, projectPath: string) => Promise<{ success: boolean; data?: ILLMResponseParsed; error?: string }>;
    getHistory: (projectPath: string) => Promise<{ success: boolean; data?: IConversationMessage[]; error?: string }>;
    clearHistory: (projectPath: string) => Promise<{ success: boolean; error?: string }>;
  };
  settings: {
    get: () => Promise<{ success: boolean; data?: ILLMSettings; error?: string }>;
    updateLLM: (provider: 'openai' | 'deepseek' | 'custom', config: Partial<ILLMConfig>) => Promise<{ success: boolean; error?: string }>;
    setProvider: (provider: 'openai' | 'deepseek' | 'custom') => Promise<{ success: boolean; error?: string }>;
  };
  docgen: {
    exportWord: (projectPath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    exportExcel: (projectPath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
