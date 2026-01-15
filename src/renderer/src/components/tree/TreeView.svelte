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
    menuX = e.clientX
    menuY = e.clientY
    menuNodeId = nodeId
    menuVisible = true
  }

  function handleMenuAction(action: 'add-subsystem' | 'add-device' | 'add-feature' | 'rename' | 'delete') {
    if (!project) return

    if (action === 'delete' && menuNodeId) {
      if (confirm('Are you sure you want to delete this node?')) {
        projectStore.removeTreeNode(menuNodeId)
      }
    } else if (action === 'rename' && menuNodeId) {
      // Trigger rename mode on node - handling via double click is default, 
      // but we could dispatch a specific event or rely on double click for now.
      // For MVP, rename via double-click is implemented.
      alert('Please double-click the node to rename it.')
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
    e.preventDefault() // Necessary to allow dropping
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
      // Collect IDs to expand
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
      idsToExpand.forEach(id => treeStore.setExpanded(id, true))
    }
  }

  let filteredTree = $derived(project ? filterNodes(project.structure_tree, searchTerm) : [])
</script>

<div class="tree-view-container">
  <div class="toolbar">
    <button class="add-root" onclick={(e) => handleContextMenu(e, null)} title="Add Root Node">
      <span>+</span>
    </button>
    <input 
      type="text" 
      placeholder="Search..." 
      value={searchTerm}
      oninput={handleSearch}
    />
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
        <TreeNode 
          {node} 
          oncontextmenu={handleContextMenu}
          onrename={handleRename}
        />
      {/each}
    {:else}
      <div class="empty">No project loaded</div>
    {/if}
  </div>

  <TreeContextMenu 
    x={menuX} 
    y={menuY} 
    visible={menuVisible} 
    nodeId={menuNodeId}
    onclose={() => menuVisible = false}
    onaction={handleMenuAction}
  />
</div>

<style>
  .tree-view-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background);
    color: var(--color-text);
  }

  .toolbar {
    padding: 8px;
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--color-border);
  }
  .toolbar input { 
    flex: 1; 
    padding: 6px 10px; 
    border-radius: 6px; 
    border: 1px solid var(--color-border); 
    background: var(--color-background-input); 
    color: var(--color-text); 
    font-size: 0.875rem;
  }
  .add-root { 
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px; 
    height: 30px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-background-soft);
    color: var(--color-text);
    cursor: pointer; 
    font-size: 1.2rem;
    padding: 0;
  }
  .add-root:hover { background: var(--ev-c-gray-3); }

  .tree-content { flex: 1; overflow-y: auto; padding-bottom: 20px; }
  .empty { padding: 20px; text-align: center; color: var(--ev-c-text-3); }
</style>
