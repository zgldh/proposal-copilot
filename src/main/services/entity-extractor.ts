import type { ConversionResult, TreeOperation } from './ai-types'

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
3. If you need to modify the structure (Add/Update/Delete), append a JSON block at the very end containing an array of operations.

OUTPUT FORMAT:
<Conversational Text>

\`\`\`json
[
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
]
\`\`\`

RULES:
- If adding multiple items, create multiple "add" operations in the array.
- If the user asks to "Add cameras to Security", and "Security" exists, set "targetParentName": "Security".
- If the user asks to "Add Security subsystem", set "targetParentName": null (Root).
- For "nodeData", "type" and "name" are required for additions.
- "quantity" defaults to 1.
- Do NOT output the JSON object with "text" and "operations" keys. Use the Text + JSON Block format.
`
  }

  extract(rawResponse: string): ConversionResult {
    console.log('[AI-Flow] Extracting entities...')
    // Look for a code block containing a JSON array
    const jsonBlockRegex = /```(?:json)?\s*(\[[\s\S]*?\])\s*```/
    const match = rawResponse.match(jsonBlockRegex)
    
    let textResponse = rawResponse
    let operations: any[] = []

    if (match) {
      console.log('[AI-Flow] JSON code block found.')
      try {
        operations = JSON.parse(match[1])
        console.log('[AI-Flow] JSON parsed successfully. Operations count:', operations.length)
        // Remove the code block from the text response for final display
        textResponse = rawResponse.replace(match[0], '').trim()
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
      operations
    }
  }
}
