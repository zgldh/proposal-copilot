import { writable, get } from 'svelte/store'
import type { Project, TreeNode } from '$lib/types'
import { toast } from './toast-store'
import { treeStore } from './tree-store'
import { chatStore } from './chat-store'

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
  let saveTimeout: any = null

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

  const store = {
    subscribe,

    loadProject: async (path: string) => {
      update((state) => ({ ...state, isLoading: true }))
      try {
        const project = (await window.electron.project.read(path)) as Project
        set({
          currentProject: project,
          projectPath: path,
          isDirty: false
        })
        chatStore.loadHistory(project.chat_history || [])
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
        chat_history: [],
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
      store.triggerAutoSave()
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
      store.triggerAutoSave()
    },

    updateChatHistory: (history: any[]) => {
      update((state) => {
        if (!state.currentProject) return state
        return {
          ...state,
          currentProject: { ...state.currentProject, chat_history: history },
          isDirty: true
        }
      })
      store.triggerAutoSave()
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
      store.triggerAutoSave()
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
      store.triggerAutoSave()
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
      store.triggerAutoSave()
    },
    removeTreeNode: (nodeId: string) => {
      update((state) => {
        if (!state.currentProject) return state

        function findAndRemove(nodes: TreeNode[]): TreeNode[] {
          return nodes
            .filter((node) => node.id !== nodeId)
            .map((node) => ({
              ...node,
              children: findAndRemove(node.children)
            }))
        }

        const newTree = findAndRemove(state.currentProject.structure_tree)
        
        treeStore.selectNode(null)
        treeStore.setEditing(null)

        return {
          ...state,
          currentProject: {
            ...state.currentProject,
            structure_tree: newTree
          },
          isDirty: true
        }
      })
      store.triggerAutoSave()
    },

    moveTreeNode: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
      update((state) => {
        if (!state.currentProject) return state

        const tree = JSON.parse(JSON.stringify(state.currentProject.structure_tree)) as TreeNode[]
        let sourceNode: TreeNode | null = null

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
              const newChildren = insertNode(node.children)
              node.children = newChildren
              result.push(node)
            }
          }
          return result
        }

        const finalTree = insertNode(treeWithoutSource)
        if (!inserted) return state

        return {
          ...state,
          currentProject: { ...state.currentProject, structure_tree: finalTree },
          isDirty: true
        }
      })
      store.triggerAutoSave()
    },

    async save() {
      const state = get({ subscribe })
      if (!state.currentProject || !state.projectPath) return

      try {
        await window.electron.project.save(state.projectPath, state.currentProject)
        update((s) => ({ ...s, isDirty: false }))
      } catch (error) {
        console.error('Save failed:', error)
        toast.error('Failed to save project: ' + String(error))
      }
    },

    triggerAutoSave() {
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        store.save()
      }, 2000)
    },

    applyOperations: (operations: TreeOperation[]) => {
      update((state) => {
        if (!state.currentProject) return state

        let newTree = JSON.parse(JSON.stringify(state.currentProject.structure_tree)) as TreeNode[]

        const addRecursive = (
          nodes: TreeNode[],
          parentId: string,
          newNode: TreeNode
        ): TreeNode[] => {
          return nodes.map((node) => {
            if (node.id === parentId) {
              return { ...node, children: [...node.children, newNode] }
            }
            if (node.children.length > 0) {
              return { ...node, children: addRecursive(node.children, parentId, newNode) }
            }
            return node
          })
        }

        for (const op of operations) {
          if (op.type === 'add' && op.nodeData) {
            const newNode: TreeNode = {
              id: op.nodeData.id || generateId(),
              type: op.nodeData.type || 'device',
              name: op.nodeData.name || 'New Item',
              quantity: op.nodeData.quantity || 1,
              specs: op.nodeData.specs || {},
              children: []
            }

            if (!op.targetParentId) {
              newTree.push(newNode)
            } else {
              newTree = addRecursive(newTree, op.targetParentId, newNode)
            }
          }
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
      store.triggerAutoSave()
    },

    undo: async () => {
      const state = get({ subscribe })
      if (!state.projectPath) return
      try {
        const previousProject = await window.electron.project.undo(state.projectPath)
        if (previousProject) {
          set({
            currentProject: previousProject as Project,
            projectPath: state.projectPath,
            isDirty: false
          })
          toast.success('Undo successful')
        } else {
          toast.info('Nothing to undo')
        }
      } catch (error) {
        toast.error('Undo failed: ' + String(error))
      }
    },

    clear: () => {
      if (saveTimeout) clearTimeout(saveTimeout)
      set(initialState)
    }
  }

  return store
}

export const projectStore = createProjectStore()
