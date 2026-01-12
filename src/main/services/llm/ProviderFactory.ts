import { LLMProviderType, ILLMProvider, ILLMError } from './types';
import { OpenAIProvider } from './OpenAIProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { CustomProvider } from './CustomProvider';

/**
 * Factory for creating LLM provider instances
 */
export class ProviderFactory {
  /**
   * Create a new LLM provider instance
   * @param type - The type of provider to create
   * @returns A new provider instance
   * @throws ILLMError if provider type is unknown
   */
  static create(type: LLMProviderType): ILLMProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider();
      case 'deepseek':
        return new DeepSeekProvider();
      case 'custom':
        return new CustomProvider();
      default:
        const error: ILLMError = {
          code: 'CONFIG_ERROR',
          message: `Unknown provider type: ${type}`,
        };
        throw error;
    }
  }
}
