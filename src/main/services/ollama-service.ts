import OpenAI from 'openai'
import type { LLMProvider, LLMConfig, ChatMessage, OllamaModelResponse } from './llm-types'

export class OllamaService implements LLMProvider {
  private createClient(config: LLMConfig): OpenAI {
    // OpenAI client requires an API key, but Ollama ignores it.
    // We append /v1 to the base URL if it's not present, as Ollama's openai-compat sits there.
    let baseUrl = config.base_url || 'http://localhost:11434'
    if (!baseUrl.endsWith('/v1')) {
      baseUrl = `${baseUrl.replace(/\/$/, '')}/v1`
    }

    return new OpenAI({
      apiKey: 'ollama', // Placeholder
      baseURL: baseUrl,
      dangerouslyAllowBrowser: false
    })
  }

  async chat(messages: ChatMessage[], config: LLMConfig, options?: { signal?: AbortSignal }): Promise<string> {
    const client = this.createClient(config)
    try {
      const response = await client.chat.completions.create({
        model: config.model,
        messages: messages as any,
        stream: false
      }, options)
      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Ollama Chat Error:', error)
      throw error
    }
  }

  async stream(
    messages: ChatMessage[],
    config: LLMConfig,
    onChunk: (chunk: string) => void,
    options?: { signal?: AbortSignal }
  ): Promise<void> {
    const client = this.createClient(config)
    try {
      const stream = await client.chat.completions.create({
        model: config.model,
        messages: messages as any,
        stream: true
      }, options)
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          onChunk(content)
        }
      }
    } catch (error) {
      console.error('Ollama Stream Error:', error)
      throw error
    }
  }

  async testConnection(config: LLMConfig): Promise<boolean> {
    try {
      const baseUrl = (config.base_url || 'http://localhost:11434').replace(/\/v1\/?$/, '')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${baseUrl}/`, { signal: controller.signal })
      clearTimeout(timeoutId)
      return response.ok
    } catch (e) {
      return false
    }
  }

  async getAvailableModels(baseUrl: string): Promise<string[]> {
    try {
      const cleanUrl = baseUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '')
      const response = await fetch(`${cleanUrl}/api/tags`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }
      
      const data = await response.json() as OllamaModelResponse
      return data.models.map(m => m.name)
    } catch (error) {
      console.error('Failed to list Ollama models:', error)
      return []
    }
  }
}
