<script lang="ts">
  interface Props {
    content: string
    isStreaming: boolean
  }

  let { content, isStreaming }: Props = $props()

  let isOpen = $state(false)
  
  // Extract the last non-empty line for the "terminal" effect during streaming
  let lastLine = $derived.by(() => {
    if (!content) return ''
    const lines = content.split('\n')
    // Find last non-empty line
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line && line !== '```' && line !== '```json') {
        return line
      }
    }
    return 'Initializing...'
  })

  function toggle() {
    isOpen = !isOpen
  }
</script>

<div class="command-block">
  <button class="header" onclick={toggle} class:streaming={isStreaming} class:completed={!isStreaming}>
    <div class="status-icon">
      {#if isStreaming}
        <div class="spinner"></div>
      {:else}
        <span class="checkmark">✓</span>
      {/if}
    </div>
    
    <div class="title-area">
      <span class="title">
        {isStreaming ? 'Updating Structure...' : 'Structure Updated'}
      </span>
      {#if isStreaming && !isOpen}
        <span class="preview-line">{lastLine}</span>
      {/if}
    </div>

    <div class="chevron" class:open={isOpen}>▼</div>
  </button>

  {#if isOpen}
    <div class="content">
      <pre><code>{content}</code></pre>
    </div>
  {/if}
</div>

<style>
  .command-block {
    margin-top: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
    background: var(--color-background-soft);
    font-size: 0.85rem;
  }

  .header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
    transition: background 0.2s;
  }

  .header:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .status-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .checkmark {
    color: #10b981; /* Green-500 */
    font-weight: bold;
    font-size: 1.1em;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid var(--ev-c-text-3);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .title-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .title {
    font-weight: 500;
  }

  .preview-line {
    font-family: 'Fira Code', monospace;
    font-size: 0.75em;
    color: var(--ev-c-text-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.8;
  }

  .chevron {
    font-size: 0.7em;
    color: var(--ev-c-text-3);
    transition: transform 0.2s;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .content {
    background: var(--color-background-input);
    border-top: 1px solid var(--color-border);
    padding: 0.5rem;
    overflow-x: auto;
  }

  pre {
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.8em;
    color: var(--ev-c-text-2);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
