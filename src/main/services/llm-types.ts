export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMConfig {
  id: string
  name: string
  api_key: string
  base_url?: string
  model: string
}

export interface LLMProvider {
  chat(messages: ChatMessage[], config: LLMConfig, options?: { signal?: AbortSignal }): Promise<string>
  stream(messages: ChatMessage[], config: LLMConfig, onChunk: (chunk: string) => void, options?: { signal?: AbortSignal }): Promise<void>
  testConnection(config: LLMConfig): Promise<boolean>
}

export interface OllamaModelResponse {
  models: Array<{
    name: string
    modified_at: string
    size: number
  }>
}
