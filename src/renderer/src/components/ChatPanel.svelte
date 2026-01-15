<script lang="ts">
  import { marked } from 'marked'

  interface GuidanceOption {
    label: string
    value: string
  }

  interface GuidanceData {
    intent: 'clarification' | 'suggestion'
    text?: string
    options: GuidanceOption[]
  }

  interface Props {
    messages?: Array<{ role: 'user' | 'assistant'; content: string; guidance?: GuidanceData }>
    isLoading?: boolean
    onsend?: (content: string) => void
    onstop?: () => void
  }

  let { messages = [], isLoading = false, onsend, onstop }: Props = $props()

  let inputContent = $state('')
  let messagesContainer: HTMLDivElement
  let textarea: HTMLTextAreaElement
  let isNearBottom = $state(true)
  let lastMessageCount = 0

  function handleSend() {
    if (!inputContent.trim()) return
    onsend?.(inputContent.trim())
    inputContent = ''
    // User sent a message, force scroll to bottom
    isNearBottom = true
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

  function handleScroll() {
    if (!messagesContainer) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer
    // Consider "near bottom" if within 50px of the bottom
    isNearBottom = scrollHeight - scrollTop - clientHeight <= 50
  }

  $effect(() => {
    const count = messages.length
    // If a new message was added, always scroll to bottom
    if (count > lastMessageCount) {
      isNearBottom = true
      setTimeout(scrollToBottom, 0) // Tick
    }
    // If existing message updated (streaming), only scroll if user was already at bottom
    else if (isNearBottom) {
      scrollToBottom()
    }
    lastMessageCount = count
  })

  function formatContent(content: string): string {
    // Remove JSON command blocks (typically at the end of AI response)
    // Matches ```json { ... } ``` or ```json [ ... ] ```
    // Updated to match both object and array formats loosely
    const jsonBlockRegex = /```(?:json)?\s*[\{\[][\s\S]*?[\}\]]\s*```$/
    const cleaned = content.replace(jsonBlockRegex, '').trim()
    return marked.parse(cleaned) as string
  }
</script>

<div class="chat-panel">
  <div class="messages" bind:this={messagesContainer} onscroll={handleScroll}>
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
            {#if message.role === 'assistant' && isLoading && message === messages[messages.length - 1]}
              <span class="cursor"></span>
            {/if}
            
            {#if message.guidance && message.guidance.options && message.guidance.options.length > 0}
              <div class="guidance-container">
                {#if message.guidance.text}
                  <p class="guidance-text">{message.guidance.text}</p>
                {/if}
                <div class="guidance-options">
                  {#each message.guidance.options as option}
                    <button class="guidance-btn" onclick={() => onsend?.(option.value)}>
                      {option.label}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
    {#if isLoading && (messages.length === 0 || messages[messages.length - 1].role === 'user')}
      <div class="message assistant thinking">
        <div class="message-content">
          <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="input-area">
    {#if isLoading}
      <button class="stop-button" onclick={onstop}>
        ■ Stop Generating
      </button>
    {/if}
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
  
  .cursor {
    display: inline-block;
    width: 6px;
    height: 14px;
    background-color: currentColor;
    margin-left: 2px;
    animation: blink 1s step-end infinite;
    vertical-align: middle;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .thinking .message-content {
    background: transparent !important;
    padding-left: 0;
  }

  .dot {
    animation: wave 1.5s infinite;
    display: inline-block;
    font-weight: bold;
    font-size: 1.2rem;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes wave {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-5px); }
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
    position: relative;
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 1px solid var(--ev-c-gray-3, #e8e8e8);
    background: var(--color-background-soft, #fafafa);
  }

  .stop-button {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-background);
    border: 1px solid var(--ev-c-gray-3);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.8rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    cursor: pointer;
    color: var(--ev-c-text-2);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stop-button:hover { background: var(--color-background-soft); color: #ef4444; }

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

  /* Guidance UI */
  .guidance-container {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  .message.assistant .guidance-container {
    border-top-color: rgba(0, 0, 0, 0.05);
  }
  .guidance-text {
    font-size: 0.85rem;
    color: var(--ev-c-text-2);
    margin-bottom: 8px;
    font-style: italic;
  }
  .guidance-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .guidance-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
    border: 1px solid var(--ev-c-primary);
    background: var(--color-background);
    color: var(--ev-c-primary);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .guidance-btn:hover {
    background: var(--ev-c-primary);
    color: var(--color-background);
  }
</style>
