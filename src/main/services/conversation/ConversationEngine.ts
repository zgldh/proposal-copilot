import { ILLMProvider, ILLMMessage, LLMProviderType, ILLMConfig } from '../llm';
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

export class ConversationEngine implements IConversationEngine {
  private provider: ILLMProvider;
  private history: IConversationMessage[] = [];
  private maxHistoryLength = 20;

  constructor(providerType: LLMProviderType, config: ILLMConfig) {
    this.provider = ProviderFactory.create(providerType);
    this.provider.configure(config);
  }

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

  getHistory(): IConversationMessage[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  private buildContextMessage(projectData: IProjectData): ILLMMessage[] {
    const contextText = `Current Project:
Name: ${projectData.meta.name}
Context: ${projectData.context}

Project Structure: ${JSON.stringify(projectData.structure_tree, null, 2)}`;

    return [{ role: 'user', content: contextText }];
  }

  private parseLLMResponse(content: string): ILLMResponseParsed {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { operations: [], proactiveQuestions: [] };
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        operations: parsed.operations || [],
        proactiveQuestions: parsed.proactive_questions || parsed.proactiveQuestions || [],
      };
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return { operations: [], proactiveQuestions: [] };
    }
  }
}
