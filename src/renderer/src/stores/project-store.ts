import { writable, get } from 'svelte/store'
import type { Project, TreeNode } from '$lib/types'

interface ProjectState {
  currentProject: Project | null
  projectPath: string | null
  isDirty: boolean
}

interface TreeOperation {
  type: 'add' | 'update' | 'delete' | 'move'
  targetParentId?: string | null
  targetNodeId?: string
  nodeData?: Partial<TreeNode>
}

const initialState: ProjectState = {
  currentProject: null,
  projectPath: null,
  isDirty: false
}

function createProjectStore() {
  const { subscribe, set, update } = writable<ProjectState>(initialState)

  function generateId(): string {
    return crypto.randomUUID()
  }

  function createTreeNode(type: TreeNode['type'], name: string): TreeNode {
    return {
      id: generateId(),
      type,
      name,
      specs: {},
      quantity: 1,
      children: []
    }
  }

  return {
    subscribe,

    loadProject: async (path: string) => {
      update((state) => ({ ...state, isLoading: true }))
      try {
        const project = await window.electron.project.read(path)
        set({
          currentProject: project,
          projectPath: path,
          isDirty: false
        })
      } catch (error) {
        console.error('Failed to load project:', error)
        throw error
      }
    },

    newProject: async (name: string, path: string) => {
      const newProject: Project = {
        meta: {
          name,
          create_time: new Date().toISOString(),
          version: '1.0.0'
        },
        context: '',
        structure_tree: [
          createTreeNode('subsystem', 'Main System'),
          createTreeNode('subsystem', 'Communication'),
          createTreeNode('subsystem', 'Power')
        ]
      }
      const projectJsonPath = await window.electron.project.create(path, name)
      set({
        currentProject: newProject,
        projectPath: projectJsonPath,
        isDirty: false
      })
    },

    updateProject: (updates: Partial<Project>) => {
      update((state) => {
        if (!state.currentProject) return state
        const updatedProject = { ...state.currentProject, ...updates }
        return {
          ...state,
          currentProject: updatedProject,
          isDirty: true
        }
      })
    },

    updateMeta: (meta: Partial<Project['meta']>) => {
      update((state) => {
        if (!state.currentProject) return state
        const updatedProject = {
          ...state.currentProject,
          meta: { ...state.currentProject.meta, ...meta }
        }
        return {
          ...state,
          currentProject: updatedProject,
          isDirty: true
        }
      })
    },

    updateContext: (context: string) => {
      update((state) => {
        if (!state.currentProject) return state
        const updatedProject = { ...state.currentProject, context }
        return {
          ...state,
          currentProject: updatedProject,
          isDirty: true
        }
      })
    },

    addTreeNode: (parentId: string | null, type: TreeNode['type'], name: string) => {
      update((state) => {
        if (!state.currentProject) return state

        const newNode = createTreeNode(type, name)

        if (parentId === null) {
          return {
            ...state,
            currentProject: {
              ...state.currentProject,
              structure_tree: [...state.currentProject.structure_tree, newNode]
            },
            isDirty: true
          }
        }

        function findAndAdd(parentNodes: TreeNode[]): TreeNode[] {
          return parentNodes.map((node) => {
            if (node.id === parentId) {
              return { ...node, children: [...node.children, newNode] }
            }
            if (node.children.length > 0) {
              return { ...node, children: findAndAdd(node.children) }
            }
            return node
          })
        }

        return {
          ...state,
          currentProject: {
            ...state.currentProject,
            structure_tree: findAndAdd(state.currentProject.structure_tree)
          },
          isDirty: true
        }
      })
    },

    updateTreeNode: (nodeId: string, updates: Partial<TreeNode>) => {
      update((state) => {
        if (!state.currentProject) return state

        function findAndUpdate(nodes: TreeNode[]): TreeNode[] {
          return nodes.map((node) => {
            if (node.id === nodeId) {
              return { ...node, ...updates }
            }
            if (node.children.length > 0) {
              return { ...node, children: findAndUpdate(node.children) }
            }
            return node
          })
        }

        return {
          ...state,
          currentProject: {
            ...state.currentProject,
            structure_tree: findAndUpdate(state.currentProject.structure_tree)
          },
          isDirty: true
        }
      })
    },

    removeTreeNode: (nodeId: string) => {
      update((state) => {
        if (!state.currentProject) return state

        function findAndRemove(nodes: TreeNode[]): TreeNode[] {
          return nodes
            .filter((node) => node.id !== nodeId)
            .map((node) => ({
              ...node,
              children: node.children.length > 0 ? findAndRemove(node.children) : []
            }))
        }

        return {
          ...state,
          currentProject: {
            ...state.currentProject,
            structure_tree: findAndRemove(state.currentProject.structure_tree)
          },
          isDirty: true
        }
      })
    },

    moveTreeNode: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
      update((state) => {
        if (!state.currentProject) return state

        // Deep clone tree to manipulate
        const tree = JSON.parse(JSON.stringify(state.currentProject.structure_tree)) as TreeNode[]
        let sourceNode: TreeNode | null = null

        // 1. Remove source node
        function removeNode(nodes: TreeNode[]): TreeNode[] {
          const result: TreeNode[] = []
          for (const node of nodes) {
            if (node.id === sourceId) {
              sourceNode = node
              continue
            }
            if (node.children.length > 0) {
              node.children = removeNode(node.children)
            }
            result.push(node)
          }
          return result
        }

        const treeWithoutSource = removeNode(tree)
        if (!sourceNode) return state

        // 2. Insert at target
        let inserted = false
        function insertNode(nodes: TreeNode[]): TreeNode[] {
          const result: TreeNode[] = []
          for (const node of nodes) {
            if (node.id === targetId) {
              if (position === 'before') result.push(sourceNode!)
              result.push(node)
              if (position === 'after') result.push(sourceNode!)
              if (position === 'inside') {
                node.children = [...node.children, sourceNode!]
              }
              inserted = true
            } else {
              // Recursively process children
              const newChildren = insertNode(node.children)
              node.children = newChildren
              result.push(node)
            }
          }
          return result
        }

        const finalTree = insertNode(treeWithoutSource)

        if (!inserted) return state // Target not found (e.g. dropped inside self)

        return {
          ...state,
          currentProject: { ...state.currentProject, structure_tree: finalTree },
          isDirty: true
        }
      })
    },

    async save() {
      const state = get({ subscribe })
      if (!state.currentProject || !state.projectPath) return
      await window.electronAPI.writeFile(
        state.projectPath,
        JSON.stringify(state.currentProject, null, 2)
      )
      update((s) => ({ ...s, isDirty: false }))
    },

    applyOperations: (operations: TreeOperation[]) => {
      update((state) => {
        if (!state.currentProject) return state
        
        let newTree = [...state.currentProject.structure_tree]
        
        // Helper to add node recursively
        const addRecursive = (nodes: TreeNode[], parentId: string, newNode: TreeNode): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === parentId) {
              return { ...node, children: [...node.children, newNode] }
            }
            if (node.children.length > 0) {
              return { ...node, children: addRecursive(node.children, parentId, newNode) }
            }
            return node
          })
        }

        // Helper to find parent by ID or return root if null
        // Note: update() wrapper handles the immutable state return
        
        for (const op of operations) {
          if (op.type === 'add' && op.nodeData) {
            const newNode: TreeNode = {
              id: generateId(),
              type: op.nodeData.type || 'device',
              name: op.nodeData.name || 'New Item',
              quantity: op.nodeData.quantity || 1,
              specs: op.nodeData.specs || {},
              children: []
            }

            if (!op.targetParentId) {
              // Add to root
              newTree.push(newNode)
            } else {
              newTree = addRecursive(newTree, op.targetParentId, newNode)
            }
          }
          // TODO: Implement update/delete for AI operations here if needed
        }

        return {
          ...state,
          currentProject: {
            ...state.currentProject,
            structure_tree: newTree
          },
          isDirty: true
        }
      })
    },

    clear: () => {
      set(initialState)
    }
  }
}

export const projectStore = createProjectStore()
