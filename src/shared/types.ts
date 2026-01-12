export interface IBackendResponse {
    status: 'ok' | 'error';
    data: unknown;
    timestamp: number;
}

export type NodeType = 'subsystem' | 'device' | 'feature';

export interface IProjectNode {
  id: string; // UUID
  type: NodeType;
  name: string;
  specs: Record<string, string | number | boolean>;
  quantity: number;
  children: IProjectNode[];
}

export interface IProjectMeta {
  name: string;
  create_time: string; // ISO8601
  version: string;
}

export interface IProjectData {
  meta: IProjectMeta;
  context: string;
  structure_tree: IProjectNode[];
}

export interface IServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type LLMProviderType = 'openai' | 'deepseek' | 'custom';

export interface ILLMConfig {
  apiKey?: string;
  model?: string;
  baseURL?: string;
  temperature?: number;
}

export interface ISettings {
  llm: {
    provider: LLMProviderType;
    openai: ILLMConfig;
    deepseek: ILLMConfig;
    custom: ILLMConfig;
  };
  project: {
    lastUsedPath?: string;
  };
}
