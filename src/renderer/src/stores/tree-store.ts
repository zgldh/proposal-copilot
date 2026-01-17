import { writable } from 'svelte/store'
import type { TreeNode } from '/types'

interface TreeState {
  expandedIds: Set<string>
  selectedId: string | null
  draggingId: string | null
  editingId: string | null
  dropTarget: {
    id: string
    position: 'before' | 'after' | 'inside'
  } | null
}

function createTreeStore() {
  const { subscribe, update } = writable<TreeState>({
    expandedIds: new Set(),
    selectedId: null,
    draggingId: null,
    editingId: null,
    dropTarget: null
  })

  return {
    subscribe,
    toggleExpand: (id: string) =>
      update((s) => {
        const newSet = new Set(s.expandedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        return { ...s, expandedIds: newSet }
      }),
    setExpanded: (id: string, expanded: boolean) =>
      update((s) => {
        const newSet = new Set(s.expandedIds)
        if (expanded) newSet.add(id)
        else newSet.delete(id)
        return { ...s, expandedIds: newSet }
      }),
    expandAll: (nodes: TreeNode[]) => {
      const ids = new Set<string>()
      const collect = (ns: TreeNode[]) => {
        for (const n of ns) {
          if (n.children.length > 0) {
            ids.add(n.id)
            collect(n.children)
          }
        }
      }
      collect(nodes)
      update((s) => ({ ...s, expandedIds: ids }))
    },
    collapseAll: () => update((s) => ({ ...s, expandedIds: new Set() })),
    selectNode: (id: string | null) => update((s) => ({ ...s, selectedId: id })),
    setDragging: (id: string | null) => update((s) => ({ ...s, draggingId: id })),
    setEditing: (id: string | null) => update((s) => ({ ...s, editingId: id })),
    setDropTarget: (target: TreeState['dropTarget']) => update((s) => ({ ...s, dropTarget: target }))
  }
}

export const treeStore = createTreeStore()
