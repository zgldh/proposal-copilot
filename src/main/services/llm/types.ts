/**
 * Supported LLM provider types
 */
export type LLMProviderType = 'openai' | 'deepseek' | 'custom';

/**
 * Represents a message in the conversation with the LLM
 */
export interface ILLMMessage {
  /**
   * The role of the message sender
   */
  role: 'system' | 'user' | 'assistant';
  /**
   * The content of the message
   */
  content: string;
}

/**
 * Configuration for an LLM provider
 * @remarks
 * API keys should be handled securely and stored in encrypted storage, not in plain text.
 * Consider using Electron's safeStorage or the operating system's credential manager.
 */
export interface ILLMConfig {
  /**
   * API key for authentication (required for OpenAI and DeepSeek)
   */
  apiKey?: string;
  /**
   * Base URL for the LLM API (required for custom providers)
   */
  baseURL?: string;
  /**
   * Model name to use
   */
  model: string;
  /**
   * Sampling temperature (0-2). Higher values make output more random.
   * @defaultValue 1.0
   */
  temperature?: number;
  /**
   * Maximum number of tokens to generate in the response
   * @remarks Must be a positive integer
   */
  maxTokens?: number;
}

/**
 * Token usage information for an LLM response
 */
export interface TokenUsage {
  /**
   * Number of tokens in the prompt
   */
  promptTokens?: number;
  /**
   * Number of tokens in the completion
   */
  completionTokens?: number;
  /**
   * Total number of tokens used
   */
  totalTokens?: number;
}

/**
 * Response from an LLM provider
 */
export interface ILLMResponse {
  /**
   * The generated content
   */
  content: string;
  /**
   * Token usage information (optional, not all providers provide this)
   */
  usage?: TokenUsage;
}

/**
 * Error type for LLM-related errors
 */
export interface ILLMError {
  /**
   * Error code (e.g., 'CONFIG_ERROR', 'API_ERROR', 'NETWORK_ERROR')
   */
  code: string;
  /**
   * Human-readable error message
   */
  message: string;
  /**
   * Additional error details
   */
  details?: unknown;
}

/**
 * Interface for an LLM provider implementation
 */
export interface ILLMProvider {
  /**
   * Configure the provider with the given configuration
   * @param config - The configuration to apply
   */
  configure(config: ILLMConfig): void;
  /**
   * Send a message to the LLM and get a response
   * @param messages - Array of messages representing the conversation
   * @returns Promise resolving to the LLM response
   * @throws ILLMError if the request fails
   */
  sendMessage(messages: ILLMMessage[]): Promise<ILLMResponse>;
  /**
   * Check if the provider has been configured
   * @returns true if configured, false otherwise
   */
  isConfigured(): boolean;
}
