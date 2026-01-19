import type { ConversionResult } from './ai-types'

export class EntityExtractor {
  generateSystemPrompt(simplifiedTree: any[]): string {
    const treeContext = JSON.stringify(simplifiedTree, null, 2)

    return `You are Proposal-Copilot, an AI assistant for system integration projects.
Your goal is to help users modify their project structure (Tree) while maintaining a helpful conversation.

CURRENT PROJECT STRUCTURE:
\`\`\`json
${treeContext}
\`\`\`

INSTRUCTIONS:
1. Analyze the user's request.
2. Reply with a natural language response first, explaining your actions or answering questions.
3. BE PROACTIVE: If the user's request is broad (e.g., "Add a security system"), suggest a standard breakdown and ask for confirmation.
4. BE INQUISITIVE: If technical details are missing (e.g., "Add 10 cameras" - what type? where?), ask clarifying questions.
5. If you need to modify the structure (Add/Update/Delete), append a JSON block at the very end containing an array of operations.
6. Use "guidance" to provide clickable options for the user to answer your questions or accept your suggestions.

OUTPUT FORMAT:

<Conversational Text>

\`\`\`json
{
  "tool": "search", // Optional: Use ONLY if you lack specific info (specs, prices) to answer.
  "query": "search query string",
  "operations": [
    {
      "type": "add" | "update" | "delete",
      "targetParentName": "Name of parent node (for add)",
      "targetNodeName": "Name of node to update/delete",
      "nodeData": {
        "type": "subsystem" | "device" | "feature",
        "name": "New Node Name",
        "quantity": 1,
        "specs": { "key": "value" }
      }
    }
  ],
  "guidance": {
    "intent": "clarification" | "suggestion",
    "text": "Optional specific question text",
    "options": [
      { "label": "Short Label", "value": "Full text to send back to AI" }
    ]
  }
}
\`\`\`

RULES:
- If adding multiple items, create multiple "add" operations in the array.
- If the user asks to "Add cameras to Security", and "Security" exists, set "targetParentName": "Security".
- If the user asks to "Add Security subsystem", set "targetParentName": null (Root).
- For "nodeData", "type" and "name" are required for additions.
- If you need external information (e.g., "What are the specs of X?", "Compare X and Y", "Price of Z"), output ONLY "tool": "search" and the "query". Do not output operations yet.
- "quantity" defaults to 1.
- Use "guidance" ONLY when the request is ambiguous or you need to suggest standard breakdowns.
- If no guidance or operations are needed, they can be empty or omitted.
`
  }

  extract(rawResponse: string): ConversionResult {
    console.log('[AI-Flow] Extracting entities...')
    // Look for a code block containing JSON (Object or Array)
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/
    const match = rawResponse.match(jsonBlockRegex)

    let textResponse = rawResponse
    let operations: any[] = []
    let guidance: any = undefined
    let searchRequest: any = undefined

    if (match) {
      console.log('[AI-Flow] JSON code block found.')
      try {
        const parsed = JSON.parse(match[1])

        if (Array.isArray(parsed)) {
          // Legacy array format
          operations = parsed
        } else if (typeof parsed === 'object') {
          // New Object format
          if (Array.isArray(parsed.operations)) {
            operations = parsed.operations
          }
          if (parsed.guidance) {
            guidance = parsed.guidance
          }
          if (parsed.tool === 'search' && parsed.query) {
            searchRequest = { tool: 'search', query: parsed.query }
            // If searching, we usually stop operations/guidance for this turn, or keep them empty
            // operations = []
          }
        }

        console.log('[AI-Flow] JSON parsed. Ops:', operations.length, 'Guidance:', !!guidance)
      } catch (e) {
        console.error('[AI-Flow] Failed to parse operations JSON:', e)
      }
    } else {
      console.log('[AI-Flow] No JSON code block found. Attempting fallback parse.')
      // Fallback: Check if the whole response is a legacy JSON object
      try {
        const trimmed = rawResponse.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const parsed = JSON.parse(trimmed)
          if (parsed.text && Array.isArray(parsed.operations)) {
            textResponse = parsed.text
            operations = parsed.operations
          }
        }
      } catch (e) {
        // Just text
      }
    }

    return {
      textResponse,
      operations,
      guidance,
      searchRequest
    }
  }
}
