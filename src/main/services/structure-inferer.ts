import type { TreeOperation, TreeNode } from './ai-types'
import { randomUUID } from 'crypto'

export class StructureInferer {
  inferOperations(rawOperations: TreeOperation[], currentTree: TreeNode[]): TreeOperation[] {
    console.log(`[AI-Flow] Inferring structure for ${rawOperations.length} operations`)
    const refinedOps: TreeOperation[] = []
    const flatMap = this.flattenTree(currentTree)

    for (const op of rawOperations) {
      const refinedOp: TreeOperation = { ...op }

      // If this is an add operation, we should assign an ID immediately
      // so subsequent operations in this batch can reference it if needed.
      if (op.type === 'add' && op.nodeData) {
        const newId = randomUUID()
        refinedOp.nodeData = { ...op.nodeData, id: newId }
        // Register this new node in our map so children can find it
        if (op.nodeData.name) {
          flatMap.set(op.nodeData.name.toLowerCase(), newId)
        }
      }

      // 1. Resolve Parent ID for 'add'
      if (op.type === 'add') {
        if (op.targetParentName) {
          const parentId = this.findNodeIdByName(op.targetParentName, flatMap)
          if (parentId) {
            refinedOp.targetParentId = parentId
          } else {
            // If parent not found, it might be a root level addition or an error.
            // For the specific case where AI tries to add to a parent it JUST created in previous lines,
            // the logic above (adding to flatMap) should handle it.
            // If still not found, default to root but warn.
            console.warn(`[AI-Flow] WARN: Parent node '${op.targetParentName}' not found. Defaulting to root.`)
            refinedOp.targetParentId = null
          }
        }
      }

      // 2. Resolve Target Node ID for 'update' / 'delete'
      if ((op.type === 'update' || op.type === 'delete') && !op.targetNodeId && op.targetNodeName) {
         const nodeId = this.findNodeIdByName(op.targetNodeName, flatMap)
         if (nodeId) {
           refinedOp.targetNodeId = nodeId
         }
      }

      refinedOps.push(refinedOp)
    }

    return refinedOps
  }

  private flattenTree(nodes: TreeNode[]): Map<string, string> {
    // Map Name -> ID
    const map = new Map<string, string>()
    const traverse = (list: TreeNode[]) => {
      list.forEach(node => {
        map.set(node.name.toLowerCase(), node.id)
        if (node.children) traverse(node.children)
      })
    }
    traverse(nodes)
    return map
  }

  private findNodeIdByName(name: string, map: Map<string, string>): string | undefined {
    // Simple case-insensitive exact match for MVP
    // Future: Fuzzy search
    return map.get(name.toLowerCase())
  }
}
