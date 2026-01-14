import OpenAI from 'openai'
import type { LLMProvider, LLMConfig, ChatMessage } from './llm-types'

export class DeepSeekService implements LLMProvider {
  private createClient(config: LLMConfig): OpenAI {
    return new OpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url || 'https://api.deepseek.com',
      dangerouslyAllowBrowser: false
    })
  }

  async chat(messages: ChatMessage[], config: LLMConfig): Promise<string> {
    const client = this.createClient(config)
    try {
      const response = await client.chat.completions.create({
        model: config.model,
        messages: messages as any,
        stream: false
      })
      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('DeepSeek Chat Error:', error)
      throw error
    }
  }

  async stream(
    messages: ChatMessage[],
    config: LLMConfig,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const client = this.createClient(config)
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: messages as any,
      stream: true
    })
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        onChunk(content)
      }
    }
  }

  async testConnection(config: LLMConfig): Promise<boolean> {
    const client = this.createClient(config)
    await client.models.list()
    return true
  }
}
