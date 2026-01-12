import { IProjectData } from '../../../shared/types';

/**
 * Supported operation types for modifying the project tree
 */
export type OperationType = 'add_node' | 'update_node' | 'delete_node' | 'update_context';

/**
 * Represents an operation to modify the project tree structure
 */
export interface IOperation {
  /**
   * The action to perform on the tree
   */
  action: OperationType;
  /**
   * Node ID path (for update/delete: target node ID, for add: parent node ID)
   * Empty string or undefined means add to root level
   */
  path?: string;
  /**
   * Node data (required for add_node and update_node operations)
   */
  node?: {
    /**
     * Type of the node
     */
    type: 'subsystem' | 'device' | 'feature';
    /**
     * Display name of the node
     */
    name: string;
    /**
     * Quantity of this component
     */
    quantity: number;
    /**
     * Key-value specifications for this node
     */
    specs: Record<string, string | number | boolean>;
  };
  /**
   * Context string (required for update_context operation)
   */
  context?: string;
}

/**
 * Parsed response from LLM containing operations and proactive questions
 */
export interface ILLMResponseParsed {
  /**
   * Array of operations to apply to the project tree
   */
  operations: IOperation[];
  /**
   * Questions the LLM identified as important to ask the user
   */
  proactiveQuestions: string[];
}

/**
 * Represents a single message in the conversation history
 */
export interface IConversationMessage {
  /**
   * Role of the message sender (user or assistant)
   */
  role: 'user' | 'assistant';
  /**
   * Content of the message
   */
  content: string;
  /**
   * Unix timestamp when the message was created
   */
  timestamp: number;
}

/**
 * Interface for the conversation engine that orchestrates chat with LLM
 */
export interface IConversationEngine {
  /**
   * Send a user message and get parsed response from LLM
   * @param message - The user's message
   * @param projectData - Current project data for context
   * @returns Promise resolving to parsed LLM response with operations and questions
   */
  sendUserMessage(message: string, projectData: IProjectData): Promise<ILLMResponseParsed>;
  /**
   * Get the conversation history
   * @returns Array of conversation messages
   */
  getHistory(): IConversationMessage[];
  /**
   * Clear the conversation history
   */
  clearHistory(): void;
}
