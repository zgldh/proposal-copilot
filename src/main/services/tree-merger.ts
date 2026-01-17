import type { TreeNode, TreeOperation } from './ai-types'
import { randomUUID } from 'crypto'

/**
 * Pure utility to apply operations to a tree structure.
 * Useful for server-side validation or simulation.
 * The actual persistence usually happens in the Renderer Store.
 */
export class TreeMerger {
  mergeWithExisting(currentTree: TreeNode[], operations: TreeOperation[]): TreeNode[] {
    // Deep clone to avoid mutation
    let newTree = JSON.parse(JSON.stringify(currentTree)) as TreeNode[]

    for (const op of operations) {
      switch (op.type) {
        case 'add':
          newTree = this.addNode(newTree, op)
          break
        case 'update':
          newTree = this.updateNode(newTree, op)
          break
        case 'delete':
          newTree = this.deleteNode(newTree, op)
          break
      }
    }

    return newTree
  }

  private addNode(tree: TreeNode[], op: TreeOperation): TreeNode[] {
    if (!op.nodeData) return tree

    const newNode: TreeNode = {
      id: randomUUID(),
      type: op.nodeData.type || 'device',
      name: op.nodeData.name || 'New Node',
      quantity: op.nodeData.quantity || 1,
      specs: op.nodeData.specs || {},
      children: []
    }

    if (!op.targetParentId) {
      // Add to root
      return [...tree, newNode]
    }

    // Recursive add
    const addToChildren = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === op.targetParentId) {
          return { ...node, children: [...node.children, newNode] }
        }
        if (node.children.length > 0) {
          return { ...node, children: addToChildren(node.children) }
        }
        return node
      })
    }

    return addToChildren(tree)
  }

  private updateNode(tree: TreeNode[], op: TreeOperation): TreeNode[] {
    if (!op.targetNodeId || !op.nodeData) return tree

    const updateRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === op.targetNodeId) {
          return { ...node, ...op.nodeData }
        }
        if (node.children.length > 0) {
          return { ...node, children: updateRecursive(node.children) }
        }
        return node
      })
    }

    return updateRecursive(tree)
  }

  private deleteNode(tree: TreeNode[], op: TreeOperation): TreeNode[] {
    if (!op.targetNodeId) return tree

    const deleteRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter((node) => node.id !== op.targetNodeId)
        .map((node) => ({
          ...node,
          children: deleteRecursive(node.children)
        }))
    }

    return deleteRecursive(tree)
  }
}
