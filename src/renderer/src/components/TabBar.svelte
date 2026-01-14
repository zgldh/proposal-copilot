<script lang="ts">
  import { workbenchStore } from '$stores/workbench-store'

  function activate(id: string) {
    workbenchStore.activateTab(id)
  }

  function close(id: string, e: MouseEvent) {
    e.stopPropagation()
    workbenchStore.closeTab(id)
  }
</script>

<div class="tab-bar">
  {#each $workbenchStore.tabs as tab (tab.id)}
    <button
      class="tab"
      class:active={tab.id === $workbenchStore.activeTabId}
      onclick={() => activate(tab.id)}
      title={tab.path}
    >
      <span class="tab-title">
        {tab.title}
        {#if tab.isDirty}<span class="dirty-indicator">●</span>{/if}
      </span>
      {#if tab.type !== 'home'}
        <span
          class="close-btn"
          onclick={(e) => close(tab.id, e)}
          role="button"
          tabindex="0"
          onkeydown={() => {}}
        >
          ×
        </span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .tab-bar {
    display: flex;
    height: 36px;
    background: var(--color-background-soft);
    border-bottom: 1px solid var(--ev-c-gray-3);
    padding-left: 0.5rem;
    overflow-x: auto;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    background: transparent;
    border: none;
    border-right: 1px solid var(--ev-c-gray-3);
    color: var(--ev-c-text-2);
    font-size: 0.85rem;
    cursor: pointer;
    min-width: 100px;
    max-width: 200px;
    position: relative;
  }

  .tab:hover {
    background: var(--ev-c-gray-3);
  }

  .tab.active {
    background: var(--color-background);
    color: var(--ev-c-primary);
    border-top: 2px solid var(--ev-c-primary);
    font-weight: 500;
  }

  .tab-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dirty-indicator {
    font-size: 0.7em;
    margin-left: 4px;
  }

  .close-btn {
    font-size: 1rem;
    padding: 2px 4px;
    border-radius: 3px;
    line-height: 1;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
</style>
