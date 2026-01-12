import OpenAI from 'openai';
import { ILLMConfig, ILLMMessage, ILLMResponse, ILLMProvider } from './types';

export class OpenAIProvider implements ILLMProvider {
  private client: OpenAI | null = null;
  private config: ILLMConfig | null = null;

  configure(config: ILLMConfig): void {
    if (!config.apiKey) {
      throw new Error('API key is required for OpenAI provider');
    }
    this.config = { ...config };
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.openai.com/v1',
    });
  }

  async sendMessage(messages: ILLMMessage[]): Promise<ILLMResponse> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI provider not configured');
    }

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 2000,
    });

    const choice = response.choices[0];
    return {
      content: choice.message.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    };
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
