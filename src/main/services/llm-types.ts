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
  chat(messages: ChatMessage[], config: LLMConfig): Promise<string>
  stream(messages: ChatMessage[], config: LLMConfig, onChunk: (chunk: string) => void): Promise<void>
  testConnection(config: LLMConfig): Promise<boolean>
}
