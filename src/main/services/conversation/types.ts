import { IProjectData } from '../../../shared/types';

export type OperationType = 'add_node' | 'update_node' | 'delete_node' | 'update_context';

export interface IOperation {
  action: OperationType;
  path?: string;
  node?: {
    type: 'subsystem' | 'device' | 'feature';
    name: string;
    quantity: number;
    specs: Record<string, string | number | boolean>;
  };
  context?: string;
}

export interface ILLMResponseParsed {
  operations: IOperation[];
  proactiveQuestions: string[];
}

export interface IConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface IConversationEngine {
  sendUserMessage(message: string, projectData: IProjectData): Promise<ILLMResponseParsed>;
  getHistory(): IConversationMessage[];
  clearHistory(): void;
}
