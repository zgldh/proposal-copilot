import OpenAI from 'openai';
import { ILLMConfig, ILLMMessage, ILLMResponse, ILLMProvider, ILLMError } from './types';

/**
 * DeepSeek implementation of LLM provider
 */
export class DeepSeekProvider implements ILLMProvider {
  private client: OpenAI | null = null;
  private config: ILLMConfig | null = null;

  /**
   * Configure the DeepSeek provider
   * @param config - Configuration containing API key and model settings
   * @throws ILLMError if API key is missing
   */
  configure(config: ILLMConfig): void {
    if (!config.apiKey) {
      const error: ILLMError = {
        code: 'CONFIG_ERROR',
        message: 'API key is required for DeepSeek provider',
      };
      throw error;
    }
    this.config = { ...config };
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.deepseek.com/v1',
    });
  }

  /**
   * Send messages to DeepSeek API and get response
   * @param messages - Array of conversation messages
   * @returns Response with generated content and usage information
   * @throws ILLMError if provider not configured or API call fails
   */
  async sendMessage(messages: ILLMMessage[]): Promise<ILLMResponse> {
    if (!this.client || !this.config) {
      const error: ILLMError = {
        code: 'CONFIG_ERROR',
        message: 'DeepSeek provider not configured',
      };
      throw error;
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
        const error: ILLMError = {
          code: 'API_ERROR',
          message: 'No response choices returned',
        };
        throw error;
      }

      return {
        content: choice.message.content || '',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (err) {
      if (this.isILLMError(err)) {
        throw err;
      }
      const error: ILLMError = {
        code: 'API_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error calling DeepSeek API',
        details: err,
      };
      throw error;
    }
  }

  /**
   * Check if the provider has been configured
   * @returns true if configured, false otherwise
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  private isILLMError(err: unknown): err is ILLMError {
    return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
  }
}
