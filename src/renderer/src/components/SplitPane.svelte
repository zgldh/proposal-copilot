<!-- src/renderer/src/components/SplitPane.svelte -->
<script lang="ts">
  interface Props {
    left?: import('svelte').Snippet
    right?: import('svelte').Snippet
    minRatio?: number
    maxRatio?: number
    defaultRatio?: number
    storageKey?: string
  }

  let {
    left,
    right,
    minRatio = 0.3,
    maxRatio = 0.7,
    defaultRatio = 0.5,
    storageKey
  }: Props = $props()

  let ratio = $state(defaultRatio)
  let container: HTMLDivElement
  let isDragging = $state(false)

  function handleMouseDown(e: MouseEvent) {
    isDragging = true
    e.preventDefault()
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || !container) return
    
    const rect = container.getBoundingClientRect()
    const newRatio = (e.clientX - rect.left) / rect.width
    
    if (newRatio >= minRatio && newRatio <= maxRatio) {
      ratio = newRatio
    }
  }

  function handleMouseUp() {
    if (isDragging && storageKey) {
      localStorage.setItem(storageKey, ratio.toString())
    }
    isDragging = false
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mousemove', handleMouseMove)
      return () => {
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  })

  $effect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const val = parseFloat(stored)
        if (!isNaN(val) && val >= minRatio && val <= maxRatio) {
          ratio = val
          return
        }
      }
      ratio = defaultRatio
    }
  })
</script>

<div class="split-pane" bind:this={container}>
  <div class="left-panel" style="flex: {ratio};">
    {@render left?.()}
  </div>
  
  <div class="splitter" onmousedown={handleMouseDown} role="separator" tabindex="-1">
    <div class="splitter-handle"></div>
  </div>
  
  <div class="right-panel" style="flex: {1 - ratio};">
    {@render right?.()}
  </div>
</div>

<style>
  .split-pane {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .left-panel,
  .right-panel {
    overflow: hidden;
    min-width: 0;
  }

  .splitter {
    width: 8px;
    background: var(--ev-c-gray-3, #e8e8e8);
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    user-select: none;
  }

  .splitter:hover {
    background: var(--ev-c-primary, #4a90d9);
  }

  .splitter-handle {
    width: 2px;
    height: 24px;
    background: var(--ev-c-gray-2, #ccc);
    border-radius: 1px;
  }

  .splitter:hover .splitter-handle {
    background: white;
  }
</style>
