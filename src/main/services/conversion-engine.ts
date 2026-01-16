import type { LLMProvider, LLMConfig, ChatMessage } from './llm-types'
import type { TreeNode, ConversionResult } from './ai-types'
import { EntityExtractor } from './entity-extractor'
import { StructureInferer } from './structure-inferer'
import { SearchService } from './search-service'
import type { Settings } from '../ipc-handlers'

export class ConversionEngine {
  private entityExtractor: EntityExtractor
  private structureInferer: StructureInferer
  private searchService: SearchService

  constructor() {
    this.entityExtractor = new EntityExtractor()
    this.structureInferer = new StructureInferer()
    this.searchService = new SearchService()
  }

  async processMessage(
    message: string,
    history: ChatMessage[],
    currentTree: TreeNode[],
    provider: LLMProvider,
    llmConfig: LLMConfig,
    settings: Settings,
    onChunk?: (chunk: string) => void,
    options?: { signal?: AbortSignal }
  ): Promise<ConversionResult> {
    console.log('[AI-Flow] Processing message. Length:', message.length)

    // 1. Simplify Tree
    const simplifiedTree = this.simplifyTreeForPrompt(currentTree)
    const systemPrompt = this.entityExtractor.generateSystemPrompt(simplifiedTree)

    // 2. Initial Prompt Construction
    let messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-5), // Keep last 5 messages for context
      { role: 'user', content: message }
    ]

    // 3. First Pass LLM Call
    let rawResult = await this.executeTurn(messages, provider, llmConfig, onChunk, options)

    // 4. Check for Search Request (Max 1 hop for MVP)
    if (rawResult.searchRequest) {
      console.log('[AI-Flow] Search requested:', rawResult.searchRequest.query)
      
      // Execute Search
      const searchResults = await this.searchService.search(rawResult.searchRequest.query, {
        provider: settings.search_provider,
        apiKey: settings.search_api_key
      })

      // Construct Search Context
      const searchContext = `[System] Search Results for "${rawResult.searchRequest.query}":\n` + 
        searchResults.map(r => `Source: ${r.title}\n${r.content}`).join('\n\n')
      
      // Augment History for 2nd Pass
      messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-5),
        { role: 'user', content: message },
        { role: 'system', content: searchContext }
      ]

      console.log('[AI-Flow] Re-prompting with search results...')
      
      // 5. Second Pass
      rawResult = await this.executeTurn(messages, provider, llmConfig, onChunk, options)
    }

    // Final Inference
    const operations = this.structureInferer.inferOperations(rawResult.operations, currentTree)
    console.log('[AI-Flow] Final inferred operations count:', operations.length)

    return {
      ...rawResult,
      operations
    }
  }

  private async executeTurn(
    messages: ChatMessage[],
    provider: LLMProvider,
    config: LLMConfig,
    onChunk?: (chunk: string) => void,
    options?: { signal?: AbortSignal }
  ): Promise<ConversionResult> {
    console.log('[AI-Flow] Sending request to LLM. Provider:', config.id, 'Model:', config.model)
    let rawResponse = ''
    if (onChunk) {
      await provider.stream(messages, config, (chunk) => {
        rawResponse += chunk
        onChunk(chunk)
      }, options)
    } else {
      rawResponse = await provider.chat(messages, config, options)
    }
    
    console.log('[AI-Flow] LLM Response received. Length:', rawResponse.length)

    const parsedResult = this.entityExtractor.extract(rawResponse)

    return {
      textResponse: parsedResult.textResponse,
      operations: parsedResult.operations, // Raw operations
      guidance: parsedResult.guidance,
      searchRequest: parsedResult.searchRequest
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
