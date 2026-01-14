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
2. Decide if the project structure needs modification (Add, Update, Delete).
3. Output a JSON object containing a "text" response and an "operations" array.

OUTPUT FORMAT (Strict JSON):
{
  "text": "Your conversational response here.",
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
  ]
}

RULES:
- If adding multiple items, create multiple "add" operations.
- If the user asks to "Add cameras to Security", and "Security" exists, set "targetParentName": "Security".
- If the user asks to "Add Security subsystem", set "targetParentName": null (Root).
- For "nodeData", "type" and "name" are required for additions.
- "quantity" defaults to 1.
- Do NOT return markdown formatting outside the JSON if possible, but the parser will handle it.
`
  }

  extract(rawResponse: string): ConversionResult {
    try {
      // 1. Try to find a JSON block
      let jsonString = rawResponse.trim()
      
      // Regex to extract content between ```json ... ``` or just { ... }
      const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/
      const match = rawResponse.match(codeBlockRegex)
      
      if (match) {
        jsonString = match[1]
      } else {
        // Fallback: try to find the first '{' and last '}'
        const firstBrace = rawResponse.indexOf('{')
        const lastBrace = rawResponse.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonString = rawResponse.substring(firstBrace, lastBrace + 1)
        }
      }

      const parsed = JSON.parse(jsonString)
      
      return {
        textResponse: parsed.text || rawResponse,
        operations: Array.isArray(parsed.operations) ? parsed.operations : []
      }
    } catch (error) {
      console.error('Failed to parse LLM response as JSON:', error)
      // Fallback: Return raw text and no operations
      return {
        textResponse: rawResponse,
        operations: []
      }
    }
  }
}
