import type { TreeOperation, TreeNode } from './ai-types'
import { randomUUID } from 'crypto'

export class StructureInferer {
  inferOperations(rawOperations: TreeOperation[], currentTree: TreeNode[]): TreeOperation[] {
    const refinedOps: TreeOperation[] = []
    const flatMap = this.flattenTree(currentTree)

    for (const op of rawOperations) {
      const refinedOp: TreeOperation = { ...op }

      // 1. Resolve Parent ID for 'add'
      if (op.type === 'add') {
        if (op.targetParentName) {
          const parentId = this.findNodeIdByName(op.targetParentName, flatMap)
          if (parentId) {
            refinedOp.targetParentId = parentId
          } else {
            // If parent not found by name, default to root (null) or logic to create parent
            // For MVP: Default to root if name not found, but log it
            console.warn(`Parent node '${op.targetParentName}' not found. Defaulting to root.`)
            refinedOp.targetParentId = null
          }
        }
        
        // Ensure new node has basic data
        if (refinedOp.nodeData) {
           // If ID is missing, we let the renderer generate it, 
           // OR we generate it here to be safe. Let's rely on store logic or generate if needed.
           // But strictly, 'add' operations usually don't have ID yet.
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
