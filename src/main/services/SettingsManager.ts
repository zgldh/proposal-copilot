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

/**
 * Manages application settings using electron-store for persistent storage.
 * Provides methods for accessing and updating LLM provider configurations.
 */
export class SettingsManager {
  private static store: Store<ISettings>;

  /**
   * Initializes the settings store with default values.
   * Should be called once during application startup.
   */
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

  /**
   * Retrieves a deep copy of all settings.
   * @returns A copy of the settings object.
   */
  static getSettings(): ISettings {
    if (!this.store) this.init();
    return JSON.parse(JSON.stringify(this.store.store));
  }

  /**
   * Updates the configuration for a specific LLM provider.
   * @param provider - The provider to update.
   * @param config - Partial configuration object with values to merge.
   */
  static updateLLMConfig(provider: LLMProviderType, config: Partial<ILLMConfig>): void {
    if (!this.store) this.init();
    this.store.set(`llm.${provider}`, { ...this.store.get(`llm.${provider}`), ...config });
  }

  /**
   * Retrieves the configuration for a specific LLM provider.
   * @param provider - The provider to get configuration for.
   * @returns The provider's configuration or default values if not found.
   */
  static getLLMConfig(provider: LLMProviderType): ILLMConfig {
    if (!this.store) this.init();
    const config = this.store.get(`llm.${provider}`);
    if (!config || typeof config !== 'object') {
      return { apiKey: '', model: '', temperature: 0.7 };
    }
    const defaults: ILLMConfig = { apiKey: '', model: '', temperature: 0.7 };
    return { ...defaults, ...(config as ILLMConfig) };
  }

  /**
   * Retrieves the currently active LLM provider.
   * @returns The provider type.
   */
  static getCurrentProvider(): LLMProviderType {
    if (!this.store) this.init();
    const provider = this.store.get('llm.provider');
    const validProviders: LLMProviderType[] = ['openai', 'deepseek', 'custom'];
    if (validProviders.includes(provider as LLMProviderType)) {
      return provider as LLMProviderType;
    }
    return 'openai';
  }

  /**
   * Sets the active LLM provider.
   * @param provider - The provider to set as active.
   */
  static setCurrentProvider(provider: LLMProviderType): void {
    if (!this.store) this.init();
    this.store.set('llm.provider', provider);
  }
}