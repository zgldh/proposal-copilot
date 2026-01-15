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
    config: LLMConfig,
    onChunk?: (chunk: string) => void
  ): Promise<ConversionResult> {
    console.log('[AI-Flow] Processing message. Length:', message.length)

    // 1. Simplify Tree for Context (Token optimization)
    const simplifiedTree = this.simplifyTreeForPrompt(currentTree)
    console.log('[AI-Flow] Context tree simplified. Root nodes:', simplifiedTree.length)

    // 2. Construct Prompt
    const systemPrompt = this.entityExtractor.generateSystemPrompt(simplifiedTree)
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-5), // Keep last 5 messages for context
      { role: 'user', content: message }
    ]

    // 3. Call LLM
    console.log('[AI-Flow] Sending request to LLM. Provider:', config.id, 'Model:', config.model)
    let rawResponse = ''
    if (onChunk) {
      await provider.stream(messages, config, (chunk) => {
        rawResponse += chunk
        onChunk(chunk)
      })
    } else {
      rawResponse = await provider.chat(messages, config)
    }
    
    console.log('[AI-Flow] LLM Response received. Length:', rawResponse.length)
    console.log('[AI-Flow] Raw Response Content:\n', rawResponse)

    // 4. Extract Entities / Parse Intent
    const parsedResult = this.entityExtractor.extract(rawResponse)

    // 5. Infer Structure (Resolve Names to IDs)
    const operations = this.structureInferer.inferOperations(parsedResult.operations, currentTree)
    console.log('[AI-Flow] Final inferred operations count:', operations.length)

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
