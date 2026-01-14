<script lang="ts">
  interface Props {
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>
    onsend?: (content: string) => void
  }

  let { messages = [], onsend }: Props = $props()

  let inputContent = $state('')
  let messagesContainer: HTMLDivElement
  let textarea: HTMLTextAreaElement

  function handleSend() {
    if (!inputContent.trim()) return
    onsend?.(inputContent.trim())
    inputContent = ''
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  $effect(() => {
    if (messages.length) {
      scrollToBottom()
    }
  })

  function formatContent(content: string): string {
    return content
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
  }
</script>

<div class="chat-panel">
  <div class="messages" bind:this={messagesContainer}>
    {#if messages.length === 0}
      <div class="empty-state">
        <p>开始与 AI 对话，描述您的项目需求</p>
        <p class="hint">例如：添加一个视频监控系统，包含 10 个摄像头</p>
      </div>
    {:else}
      {#each messages as message}
        <div class="message" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
          <div class="message-header">
            <span class="role-label">{message.role === 'user' ? '我' : 'AI'}</span>
          </div>
          <div class="message-content">
            {@html formatContent(message.content)}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="input-area">
    <textarea
      bind:this={textarea}
      bind:value={inputContent}
      onkeydown={handleKeyDown}
      placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
      rows="3"
    ></textarea>
    <button class="send-button" onclick={handleSend} disabled={!inputContent.trim()}>
      发送
    </button>
  </div>
</div>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background, #fff);
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--ev-c-text-3, #999);
    text-align: center;
  }

  .empty-state .hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .message {
    margin-bottom: 1rem;
    max-width: 85%;
  }

  .message.user {
    margin-left: auto;
  }

  .message.assistant {
    margin-right: auto;
  }

  .message-header {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    color: var(--ev-c-text-3, #999);
  }

  .message.user .message-header {
    text-align: right;
  }

  .message-content {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    line-height: 1.5;
    font-size: 0.9375rem;
  }

  .message.user .message-content {
    background: var(--ev-c-primary, #4a90d9);
    color: white;
  }

  .message.assistant .message-content {
    background: var(--color-background-mute, #f5f5f5);
    color: var(--color-text, #333);
  }

  .message-content :global(pre) {
    background: rgba(0,0,0,0.1);
    padding: 0.75rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  .message.assistant .message-content :global(pre) {
    background: rgba(0,0,0,0.05);
  }

  .message-content :global(code) {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.875em;
  }

  .input-area {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 1px solid var(--ev-c-gray-3, #e8e8e8);
    background: var(--color-background-soft, #fafafa);
  }

  .input-area textarea {
    flex: 1;
    padding: 0.75rem;
    background-color: var(--color-background-input);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    resize: none;
    font-size: 0.9375rem;
    font-family: inherit;
    outline: none;
  }

  .input-area textarea:focus {
    border-color: var(--ev-c-primary, #4a90d9);
  }

  .send-button {
    padding: 0.5rem 1.25rem;
    background: var(--ev-c-primary, #4a90d9);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .send-button:hover:not(:disabled) {
    background: var(--ev-c-primary-hover, #3a7bc8);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
