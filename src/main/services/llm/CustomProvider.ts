import OpenAI from 'openai';
import { ILLMConfig, ILLMMessage, ILLMResponse, ILLMProvider, ILLMError } from './types';

export class CustomProvider implements ILLMProvider {
  private client: OpenAI | null = null;
  private config: ILLMConfig | null = null;

  configure(config: ILLMConfig): void {
    if (!config.baseURL) {
      throw { code: 'CONFIG_ERROR', message: 'Base URL is required for custom provider' } as ILLMError;
    }
    if (!config.model) {
      throw { code: 'CONFIG_ERROR', message: 'Model name is required for custom provider' } as ILLMError;
    }
    this.config = { ...config };
    this.client = new OpenAI({
      apiKey: config.apiKey || 'sk-dummy',
      baseURL: config.baseURL,
    });
  }

  async sendMessage(messages: ILLMMessage[]): Promise<ILLMResponse> {
    if (!this.client || !this.config) {
      throw { code: 'CONFIG_ERROR', message: 'Custom provider not configured' } as ILLMError;
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 2000,
      });

      const choice = response.choices[0];
      if (!choice) {
        throw { code: 'API_ERROR', message: 'No response choices returned' } as ILLMError;
      }

      return {
        content: choice.message.content || '',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      if (this.isILLMError(error)) {
        throw error;
      }
      throw { code: 'API_ERROR', message: `Custom LLM API error: ${error instanceof Error ? error.message : String(error)}` } as ILLMError;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  private isILLMError(error: unknown): error is ILLMError {
    return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
  }
}
