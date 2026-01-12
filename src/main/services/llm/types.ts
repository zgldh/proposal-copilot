export type LLMProviderType = 'openai' | 'deepseek' | 'custom';

export interface ILLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ILLMConfig {
  apiKey?: string;
  baseURL?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ILLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ILLMProvider {
  configure(config: ILLMConfig): void;
  sendMessage(messages: ILLMMessage[]): Promise<ILLMResponse>;
  isConfigured(): boolean;
}
