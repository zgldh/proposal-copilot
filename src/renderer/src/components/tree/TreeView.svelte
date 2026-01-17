<script lang="ts">
  import { projectStore } from '../../stores/project-store'
  import { treeStore } from '../../stores/tree-store'
  import type { TreeNode as TreeNodeType } from '$lib/types'
  import TreeNode from './TreeNode.svelte'
  import TreeContextMenu from './TreeContextMenu.svelte'

  let project = $derived($projectStore.currentProject)
  let searchTerm = $state('')

  // Context Menu State
  let menuVisible = $state(false)
  let menuX = $state(0)
  let menuY = $state(0)
  let menuNodeId = $state<string | null>(null)

  function handleContextMenu(e: MouseEvent, nodeId: string | null) {
    e.preventDefault()

    // Position adjustments for viewport clipping
    const menuWidth = 160 // min-width from CSS
    const menuHeight = 200 // estimated max height

    let x = e.clientX
    let y = e.clientY

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10
    }

    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10
    }

    menuX = x
    menuY = y
    menuNodeId = nodeId
    menuVisible = true
  }

  function handleMenuAction(
    action: 'add-subsystem' | 'add-device' | 'add-feature' | 'rename' | 'delete'
  ) {
    if (!project) return

    if (action === 'delete' && menuNodeId) {
      if (confirm('Are you sure you want to delete this node?')) {
        projectStore.removeTreeNode(menuNodeId)
      }
    } else if (action === 'rename' && menuNodeId) {
      treeStore.setEditing(menuNodeId)
    } else if (action.startsWith('add-')) {
      const type = action.replace('add-', '') as 'subsystem' | 'device' | 'feature'
      const name = `New ${type.charAt(0).toUpperCase() + type.slice(1)}`
      projectStore.addTreeNode(menuNodeId, type, name)
      if (menuNodeId) treeStore.setExpanded(menuNodeId, true)
    }
  }

  function handleRename(nodeId: string, newName: string) {
    projectStore.updateTreeNode(nodeId, { name: newName })
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    const { draggingId, dropTarget } = $treeStore
    if (draggingId && dropTarget) {
      projectStore.moveTreeNode(draggingId, dropTarget.id, dropTarget.position)
    }
    treeStore.setDragging(null)
    treeStore.setDropTarget(null)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
  }

  function filterNodes(nodes: TreeNodeType[], term: string): TreeNodeType[] {
    if (!term.trim()) return nodes

    return nodes.reduce<TreeNodeType[]>((acc, node) => {
      const matchesSelf = node.name.toLowerCase().includes(term.toLowerCase())
      const filteredChildren = filterNodes(node.children, term)

      if (matchesSelf || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren
        })
      }
      return acc
    }, [])
  }

  function handleSearch(e: Event) {
    const term = (e.target as HTMLInputElement).value
    searchTerm = term

    if (term.trim() && project) {
      const idsToExpand = new Set<string>()

      const check = (nodes: TreeNodeType[]) => {
        let childMatch = false
        for (const node of nodes) {
          const childrenMatch = check(node.children)
          if (childrenMatch) {
            idsToExpand.add(node.id)
            childMatch = true
          }
          if (node.name.toLowerCase().includes(term.toLowerCase())) {
            childMatch = true
          }
        }
        return childMatch
      }

      check(project.structure_tree)
      idsToExpand.forEach((id) => treeStore.setExpanded(id, true))
    }
  }

  let filteredTree = $derived(project ? filterNodes(project.structure_tree, searchTerm) : [])

  function handleExpandAll() {
    if (project) treeStore.expandAll(project.structure_tree)
  }

  function handleCollapseAll() {
    treeStore.collapseAll()
  }
</script>

<div class="tree-view-container">
  <div class="toolbar">
    <input type="text" placeholder="Search..." value={searchTerm} oninput={handleSearch} />
    <div class="actions">
      <button class="icon-btn" onclick={(e) => handleContextMenu(e, null)} title="Add Root Node">
        <span>+</span>
      </button>
      <button class="icon-btn" onclick={handleExpandAll} title="Expand All">
        <span>📂</span>
      </button>
      <button class="icon-btn" onclick={handleCollapseAll} title="Collapse All">
        <span>📁</span>
      </button>
      <button class="icon-btn" onclick={() => projectStore.undo()} title="Undo (Rollback)">
        <span>↩️</span>
      </button>
    </div>
  </div>

  <div
    class="tree-content"
    oncontextmenu={(e) => handleContextMenu(e, null)}
    ondrop={handleDrop}
    ondragover={handleDragOver}
    role="tree"
  >
    {#if project}
      {#each filteredTree as node (node.id)}
        <TreeNode {node} oncontextmenu={handleContextMenu} onrename={handleRename} {searchTerm} />
      {/each}

      {#if filteredTree.length === 0 && project.structure_tree.length > 0}
        <div class="empty">No matches found</div>
      {/if}

      {#if project.structure_tree.length === 0}
        <div class="empty">
          <p>Tree is empty</p>
          <button class="add-btn" onclick={(e) => handleContextMenu(e, null)}>
            + Add First Node
          </button>
        </div>
      {/if}
    {:else}
      <div class="empty">No project loaded</div>
    {/if}
  </div>

  <TreeContextMenu
    x={menuX}
    y={menuY}
    visible={menuVisible}
    nodeId={menuNodeId}
    onclose={() => (menuVisible = false)}
    onaction={handleMenuAction}
  />
</div>

<style>
  .tree-view-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 80px);
    background: var(--color-background);
    color: var(--color-text);
  }

  .toolbar {
    padding: 6px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background-soft);
  }

  .toolbar input {
    flex: 1;
    min-width: 0;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    background: var(--color-background-input);
    color: var(--color-text);
    font-size: 0.8125rem;
    transition: all 0.2s ease;
  }

  .toolbar input:focus {
    outline: none;
    border-color: var(--ev-c-primary);
    box-shadow: 0 0 0 2px rgba(81, 127, 164, 0.2);
  }

  .toolbar .actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0;
    transition: all 0.2s ease;
  }

  .icon-btn:hover {
    background: var(--color-background-mute);
    color: var(--color-text);
    border-color: var(--color-border);
  }

  .icon-btn span {
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tree-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;
  }
  .empty {
    padding: 40px 20px;
    text-align: center;
    color: var(--ev-c-text-3);
  }

  .add-btn {
    margin-top: 12px;
    padding: 6px 12px;
    background: var(--ev-c-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .add-btn:hover {
    opacity: 0.9;
  }
</style>
