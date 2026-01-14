import type { LLMProvider, LLMConfig, ChatMessage } from './llm-types'
import type { TreeNode, ConversionResult } from './ai-types'
import { EntityExtractor } from './entity-extractor'
import { StructureInferer } from './structure-inferer'

export class ConversionEngine {
  private entityExtractor: EntityExtractor
  private structureInferer: StructureInferer

  constructor() {
    this.entityExtractor = new EntityExtractor()
    this.structureInferer = new StructureInferer()
  }

  async processMessage(
    message: string,
    history: ChatMessage[],
    currentTree: TreeNode[],
    provider: LLMProvider,
    config: LLMConfig
  ): Promise<ConversionResult> {
    // 1. Simplify Tree for Context (Token optimization)
    const simplifiedTree = this.simplifyTreeForPrompt(currentTree)

    // 2. Construct Prompt
    const systemPrompt = this.entityExtractor.generateSystemPrompt(simplifiedTree)
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-5), // Keep last 5 messages for context
      { role: 'user', content: message }
    ]

    // 3. Call LLM
    const rawResponse = await provider.chat(messages, config)

    // 4. Extract Entities / Parse Intent
    const parsedResult = this.entityExtractor.extract(rawResponse)

    // 5. Infer Structure (Resolve Names to IDs)
    const operations = this.structureInferer.inferOperations(parsedResult.operations, currentTree)

    return {
      textResponse: parsedResult.textResponse,
      operations
    }
  }

  private simplifyTreeForPrompt(nodes: TreeNode[]): any[] {
    return nodes.map(node => ({
      id: node.id,
      type: node.type,
      name: node.name,
      children: node.children ? this.simplifyTreeForPrompt(node.children) : []
    }))
  }
}
