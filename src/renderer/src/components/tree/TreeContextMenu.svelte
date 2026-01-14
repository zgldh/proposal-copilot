<script lang="ts">
  interface Props {
    x: number
    y: number
    visible: boolean
    nodeId: string | null
    onclose: () => void
    onaction: (action: 'add-subsystem' | 'add-device' | 'add-feature' | 'rename' | 'delete') => void
  }

  let { x, y, visible, nodeId, onclose, onaction }: Props = $props()

  function handleAction(action: 'add-subsystem' | 'add-device' | 'add-feature' | 'rename' | 'delete') {
    onaction(action)
    onclose()
  }
</script>

{#if visible}
  <!-- Backdrop to close menu -->
  <div class="backdrop" onclick={onclose} role="presentation"></div>

  <div class="context-menu" style="top: {y}px; left: {x}px;">
    {#if !nodeId}
      <button onclick={() => handleAction('add-subsystem')}>Add Subsystem</button>
    {:else}
      <button onclick={() => handleAction('add-subsystem')}>Add Subsystem</button>
      <button onclick={() => handleAction('add-device')}>Add Device</button>
      <button onclick={() => handleAction('add-feature')}>Add Feature</button>
      <div class="divider"></div>
      <button onclick={() => handleAction('rename')}>Rename</button>
      <button class="danger" onclick={() => handleAction('delete')}>Delete</button>
    {/if}
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
  }

  .context-menu {
    position: fixed;
    z-index: 9999;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
    padding: 4px 0;
    min-width: 160px;
    display: flex;
    flex-direction: column;
  }

  button {
    text-align: left;
    background: none;
    border: none;
    padding: 8px 16px;
    font-size: 0.875rem;
    color: var(--color-text);
    cursor: pointer;
  }

  button:hover {
    background: var(--ev-c-primary);
    color: white;
  }

  button.danger:hover {
    background: #ef4444;
  }

  .divider {
    height: 1px;
    background: var(--ev-c-gray-3);
    margin: 4px 0;
  }
</style>
