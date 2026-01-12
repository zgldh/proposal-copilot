import { ILLMProvider, ILLMMessage, LLMProviderType, ILLMConfig, ILLMError } from '../llm';
import { ProviderFactory } from '../llm/ProviderFactory';
import { IProjectData } from '../../../shared/types';
import { IOperation, ILLMResponseParsed, IConversationMessage, IConversationEngine } from './types';

const SYSTEM_PROMPT = `You are a proposal assistant for System Integration projects. 
Your role is to help users build project structure through conversation.

When the user describes requirements, extract structured operations to update the project tree.
Return your response as valid JSON with this schema:
{
  "operations": [
    {
      "action": "add_node" | "update_node" | "delete_node" | "update_context",
      "path": "node-id-or-empty",  // For add_node: parent node ID, for others: target node ID
      "node": {                    // Only for add_node/update_node
        "type": "subsystem" | "device" | "feature",
        "name": "node name",
        "quantity": 1,
        "specs": { "key": "value" }
      },
      "context": "text"            // Only for update_context
    }
  ],
  "proactive_questions": [
    "Question 1 about missing information"
  ]
}

Ask proactive questions when you identify missing technical parameters that would be needed for a complete proposal.
Keep operations simple and focused. If multiple nodes are needed, return multiple add_node operations.`;

/**
 * Engine for managing conversations with LLM and parsing responses into tree operations
 */
export class ConversationEngine implements IConversationEngine {
  private provider: ILLMProvider;
  private history: IConversationMessage[] = [];
  private maxHistoryLength = 20;

  /**
   * Create a new conversation engine
   * @param providerType - Type of LLM provider to use
   * @param config - Configuration for the LLM provider
   */
  constructor(providerType: LLMProviderType, config: ILLMConfig) {
    this.provider = ProviderFactory.create(providerType);
    this.provider.configure(config);
  }

  /**
   * Send a user message and get parsed response from LLM
   * @param message - The user's message
   * @param projectData - Current project data for context
   * @returns Promise resolving to parsed LLM response with operations and questions
   * @throws ILLMError if LLM response parsing fails
   */
  async sendUserMessage(message: string, projectData: IProjectData): Promise<ILLMResponseParsed> {
    const userMessage: IConversationMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    this.history.push(userMessage);

    const llmMessages: ILLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.buildContextMessage(projectData),
      ...this.history.slice(-this.maxHistoryLength).map(m => ({
        role: m.role,
        content: m.content,
      } as ILLMMessage)),
    ];

    const response = await this.provider.sendMessage(llmMessages);

    const assistantMessage: IConversationMessage = {
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
    };
    this.history.push(assistantMessage);

    return this.parseLLMResponse(response.content);
  }

  /**
   * Get the conversation history
   * @returns Array of conversation messages
   */
  getHistory(): IConversationMessage[] {
    return [...this.history];
  }

  /**
   * Clear the conversation history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Build context message with current project data
   * @param projectData - Current project data
   * @returns Message with project context for LLM
   */
  private buildContextMessage(projectData: IProjectData): ILLMMessage[] {
    const contextText = `Current Project:
Name: ${projectData.meta.name}
Context: ${projectData.context}

Project Structure: ${JSON.stringify(projectData.structure_tree, null, 2)}`;

    return [{ role: 'user', content: contextText }];
  }

  /**
   * Parse LLM response to extract operations and proactive questions
   * @param content - Raw LLM response content
   * @returns Parsed response with operations and questions
   * @throws ILLMError if response is not valid JSON or missing required fields
   */
  private parseLLMResponse(content: string): ILLMResponseParsed {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        const error: ILLMError = {
          code: 'API_ERROR',
          message: 'No valid JSON found in LLM response',
        };
        throw error;
      }
      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.operations || !Array.isArray(parsed.operations)) {
        const error: ILLMError = {
          code: 'API_ERROR',
          message: 'LLM response missing required "operations" array',
        };
        throw error;
      }

      if (!parsed.proactive_questions && !parsed.proactiveQuestions) {
        const error: ILLMError = {
          code: 'API_ERROR',
          message: 'LLM response missing required "proactive_questions" or "proactiveQuestions" array',
        };
        throw error;
      }

      const proactiveQuestions = parsed.proactive_questions || parsed.proactiveQuestions;
      if (!Array.isArray(proactiveQuestions)) {
        const error: ILLMError = {
          code: 'API_ERROR',
          message: 'proactive_questions field must be an array',
        };
        throw error;
      }

      return {
        operations: parsed.operations,
        proactiveQuestions,
      };
    } catch (error) {
      if ((error as ILLMError).code) {
        throw error;
      }
      const llmError: ILLMError = {
        code: 'API_ERROR',
        message: `Failed to parse LLM response: ${error instanceof Error ? error.message : String(error)}`,
      };
      throw llmError;
    }
  }
}
