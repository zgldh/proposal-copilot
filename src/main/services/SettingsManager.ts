import Store from 'electron-store';
import { LLMProviderType, ILLMConfig } from './llm';

interface ISettings {
  llm: {
    provider: LLMProviderType;
    openai: ILLMConfig;
    deepseek: ILLMConfig;
    custom: ILLMConfig;
  };
  project: {
    lastUsedPath?: string;
  };
}

export class SettingsManager {
  private static store: Store<ISettings>;

  static init(): void {
    this.store = new Store<ISettings>({
      defaults: {
        llm: {
          provider: 'openai',
          openai: {
            apiKey: '',
            model: 'gpt-4o-mini',
            temperature: 0.7,
          },
          deepseek: {
            apiKey: '',
            model: 'deepseek-chat',
            temperature: 0.7,
          },
          custom: {
            baseURL: '',
            model: '',
            temperature: 0.7,
          },
        },
        project: {},
      },
    });
  }

  static getSettings(): ISettings {
    if (!this.store) this.init();
    return this.store.store;
  }

  static updateLLMConfig(provider: LLMProviderType, config: Partial<ILLMConfig>): void {
    if (!this.store) this.init();
    this.store.set(`llm.${provider}`, { ...this.store.get(`llm.${provider}`), ...config });
  }

  static getLLMConfig(provider: LLMProviderType): ILLMConfig {
    if (!this.store) this.init();
    return this.store.get(`llm.${provider}`) as ILLMConfig;
  }

  static getCurrentProvider(): LLMProviderType {
    if (!this.store) this.init();
    return this.store.get('llm.provider') as LLMProviderType;
  }

  static setCurrentProvider(provider: LLMProviderType): void {
    if (!this.store) this.init();
    this.store.set('llm.provider', provider);
  }
}