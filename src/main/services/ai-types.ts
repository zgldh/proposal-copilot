export interface TreeNode {
  id: string
  type: 'subsystem' | 'device' | 'feature'
  name: string
  specs: Record<string, string>
  quantity: number
  children: TreeNode[]
}

export type TreeOperationType = 'add' | 'update' | 'delete' | 'move'

export interface TreeOperation {
  type: TreeOperationType
  targetParentId?: string | null // For add/move (null = root)
  targetNodeId?: string          // For update/delete/move
  nodeData?: Partial<TreeNode>   // For add/update
  
  // Intermediate fields used during inference, before resolving IDs
  targetParentName?: string
  targetNodeName?: string
}

export interface ConversionResult {
  textResponse: string // The conversational part
  operations: TreeOperation[] // The structural changes
  needsClarification?: boolean
  clarificationQuestion?: string
}
