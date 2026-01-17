<script lang="ts">
  import type { TreeNode as TreeNodeType } from '$lib/types'
  import { treeStore } from '../../stores/tree-store'
  import TreeNode from './TreeNode.svelte'

  interface Props {
    node: TreeNodeType
    depth?: number
    searchTerm?: string
    oncontextmenu: (e: MouseEvent, nodeId: string) => void
    onrename: (nodeId: string, newName: string) => void
  }

  let { node, depth = 0, searchTerm = '', oncontextmenu, onrename }: Props = $props()

  let isExpanded = $derived($treeStore.expandedIds.has(node.id))
  let isSelected = $derived($treeStore.selectedId === node.id)
  let isDragging = $derived($treeStore.draggingId === node.id)
  let isEditing = $derived($treeStore.editingId === node.id)

  // Drop target indicators
  let dropTarget = $derived($treeStore.dropTarget)
  let isDropTarget = $derived(dropTarget?.id === node.id)
  let dropPos = $derived(isDropTarget ? dropTarget?.position : null)

  let editName = $state(node.name)
  let inputRef: HTMLInputElement

  $effect(() => {
    if (isEditing) {
      editName = node.name
      // Wait for DOM update to focus
      setTimeout(() => inputRef?.focus(), 0)
    }
  })

  function toggleExpand(e: MouseEvent) {
    e.stopPropagation()
    treeStore.toggleExpand(node.id)
  }

  function handleSelect(e: MouseEvent) {
    e.stopPropagation()
    treeStore.selectNode(node.id)
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    treeStore.selectNode(node.id)
    oncontextmenu(e, node.id)
  }

  function handleDragStart(e: DragEvent) {
    e.stopPropagation()
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', node.id)
    }
    treeStore.setDragging(node.id)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (isDragging) return // Can't drop on self

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    let position: 'before' | 'after' | 'inside' = 'inside'

    if (y < height * 0.25) position = 'before'
    else if (y > height * 0.75) position = 'after'

    treeStore.setDropTarget({ id: node.id, position })
  }

  function handleDoubleClick() {
    treeStore.setEditing(node.id)
  }

  function finishEdit() {
    if (isEditing) {
      if (editName.trim() && editName !== node.name) {
        onrename(node.id, editName)
      }
      treeStore.setEditing(null)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') finishEdit()
    if (e.key === 'Escape') treeStore.setEditing(null)
  }

  function highlightMatch(text: string, term: string): string {
    if (!term) return text
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
  }
</script>

<div class="tree-node">
  <div
    class="node-content"
    class:selected={isSelected}
    class:dragging={isDragging}
    class:drop-before={dropPos === 'before'}
    class:drop-after={dropPos === 'after'}
    class:drop-inside={dropPos === 'inside'}
    style="padding-left: {depth * 1.5 + 0.5}rem"
    onclick={handleSelect}
    oncontextmenu={handleContextMenu}
    ondblclick={handleDoubleClick}
    draggable="true"
    ondragstart={handleDragStart}
    ondragover={handleDragOver}
    role="treeitem"
    tabindex="0"
    onkeydown={() => {}}
  >
    <button class="expand-icon" onclick={toggleExpand} class:hidden={node.children.length === 0}>
      {isExpanded ? '▼' : '▶'}
    </button>

    <span class="type-icon">
      {#if node.type === 'subsystem'}📁{/if}
      {#if node.type === 'device'}📹{/if}
      {#if node.type === 'feature'}⚡{/if}
    </span>

    {#if isEditing}
      <input
        bind:this={inputRef}
        bind:value={editName}
        onblur={finishEdit}
        onkeydown={handleKeyDown}
        onclick={(e) => e.stopPropagation()}
      />
    {:else}
      <span class="label">
        {#if searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase())}
          {@html highlightMatch(node.name, searchTerm)}
        {:else}
          {node.name}
        {/if}
      </span>
      {#if node.quantity > 1}
        <span class="badge">{node.quantity}</span>
      {/if}
    {/if}
  </div>

  {#if isExpanded && node.children.length > 0}
    <div class="children">
      {#each node.children as child (child.id)}
        <TreeNode node={child} depth={depth + 1} {oncontextmenu} {onrename} {searchTerm} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .node-content {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    user-select: none;
    border: 1px solid transparent;
  }
  .node-content:hover {
    background: var(--color-background-soft);
  }
  .node-content.selected {
    background: var(--ev-c-primary);
    color: white;
  }
  .node-content.dragging {
    opacity: 0.5;
  }

  .drop-before {
    border-top-color: var(--ev-c-primary);
  }
  .drop-after {
    border-bottom-color: var(--ev-c-primary);
  }
  .drop-inside {
    background: rgba(74, 144, 217, 0.2);
  }

  .expand-icon {
    width: 20px;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    font-size: 0.7rem;
  }
  .expand-icon.hidden {
    visibility: hidden;
  }

  .type-icon {
    margin-right: 6px;
  }
  .label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .label :global(mark) {
    background: #ffd700;
    color: #000;
    border-radius: 2px;
    padding: 0 1px;
  }

  .badge {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    padding: 0 6px;
    font-size: 0.75rem;
    margin-left: 8px;
  }
  input {
    font-size: inherit;
    padding: 2px 4px;
    border-radius: 2px;
    border: none;
    width: 100%;
    color: black;
  }
</style>
