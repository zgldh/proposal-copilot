import { LLMProviderType, ILLMProvider } from './types';
import { OpenAIProvider } from './OpenAIProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { CustomProvider } from './CustomProvider';

export class ProviderFactory {
  static create(type: LLMProviderType): ILLMProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider();
      case 'deepseek':
        return new DeepSeekProvider();
      case 'custom':
        return new CustomProvider();
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }
}
