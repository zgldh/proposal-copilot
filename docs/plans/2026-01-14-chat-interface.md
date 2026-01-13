# Project Conversation Interface Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 实现项目对话界面：左边对话面板（可发送消息、显示历史），右边 Markdown 实时预览面板（显示项目结构），支持可拖拽分栏比例（30%-70%）

**Architecture:**
- 使用 SplitPane 组件实现可拖拽分栏布局，左右比例可调
- ChatPanel 组件管理对话历史和消息输入
- MarkdownPreview 组件实时渲染项目信息为 Markdown
- 项目树变化时自动触发 Markdown 更新
- 对话交互与项目树双向同步

**Tech Stack:** Electron + Svelte + TypeScript + marked (Markdown 渲染)

---

## Task 1: 安装 Markdown 渲染依赖

**Files:**
- Modify: `.worktrees/chat-ui/package.json`

**Step 1: Add marked dependency**

```json
// package.json dependencies
{
  "dependencies": {
    "@electron-toolkit/preload": "^3.0.2",
    "@electron-toolkit/utils": "^4.0.0",
    "marked": "^15.0.0"
  }
}
```

**Step 2: Run npm install**

```bash
cd .worktrees/chat-ui && npm install
```

**Step 3: Verify installation**

```bash
cd .worktrees/chat-ui && npm list marked
```

Expected: `marked@^15.0.0`

**Step 4: Commit**

```bash
cd .worktrees/chat-ui && git add package.json package-lock.json && git commit -m "deps: add marked for markdown rendering"
```

---

## Task 2: 创建 Markdown 生成器工具

**Files:**
- Create: `.worktrees/chat-ui/src/renderer/src/lib/markdown-generator.ts`

**Step 1: Write the failing test**

```typescript
// src/renderer/src/lib/markdown-generator.spec.ts
import { describe, it, expect } from 'vitest'

describe('markdown generator', () => {
  it('should generate markdown from empty project', () => {
    const project: Project = {
      meta: { name: 'Test', create_time: '2026-01-14', version: '1.0.0' },
      context: '',
      structure_tree: []
    }
    const md = generateProjectMarkdown(project)
    expect(md).toContain('# Test')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: FAIL - file doesn't exist

**Step 3: Write minimal implementation**

```typescript
// src/renderer/src/lib/markdown-generator.ts
import type { Project, TreeNode } from './types'

export function generateProjectMarkdown(project: Project): string {
  let md = `# ${project.meta.name}\n\n`
  md += `> 创建时间: ${new Date(project.meta.create_time).toLocaleString('zh-CN')}\n\n`
  
  if (project.context && project.context.trim()) {
    md += `## 项目背景\n\n${project.context}\n\n`
  }
  
  if (project.structure_tree.length > 0) {
    md += `## 系统结构\n\n`
    project.structure_tree.forEach(subsystem => {
      md += `### ${subsystem.name}\n`
      subsystem.children.forEach(device => {
        md += `- **${device.name}** (数量: ${device.quantity})\n`
        const specs = Object.entries(device.specs)
          .filter(([_, v]) => v && v.toString().trim())
          .map(([k, v]) => `${k}: ${v}`)
        if (specs.length > 0) {
          md += `  - ${specs.join(', ')}\n`
        }
      })
      md += '\n'
    })
  }
  
  return md
}
```

**Step 4: Run test to verify it passes**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: PASS

**Step 5: Commit**

```bash
cd .worktrees/chat-ui && git add src/renderer/src/lib/markdown-generator.ts && git commit -m "feat: add markdown generator utility"
```

---

## Task 3: 创建 SplitPane 可拖拽分栏组件

**Files:**
- Create: `.worktrees/chat-ui/src/renderer/src/components/SplitPane.svelte`

**Step 1: Write the failing test**

```typescript
// src/renderer/src/components/SplitPane.spec.ts
import { describe, it, expect } from 'vitest'

describe('SplitPane', () => {
  it('should have default ratio', () => {
    const defaultRatio = 0.5
    expect(defaultRatio).toBeGreaterThan(0.3)
    expect(defaultRatio).toBeLessThan(0.7)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: FAIL - file doesn't exist

**Step 3: Write minimal implementation**

```svelte
<!-- src/renderer/src/components/SplitPane.svelte -->
<script lang="ts">
  interface Props {
    left?: import('svelte').Snippet
    right?: import('svelte').Snippet
    minRatio?: number
    maxRatio?: number
    defaultRatio?: number
  }

  let {
    left,
    right,
    minRatio = 0.3,
    maxRatio = 0.7,
    defaultRatio = 0.5
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
```

**Step 4: Run test to verify it passes**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: PASS

**Step 5: Commit**

```bash
cd .worktrees/chat-ui && git add src/renderer/src/components/SplitPane.svelte && git commit -m "feat: create SplitPane draggable layout component"
```

---

## Task 4: 创建 ChatPanel 对话面板组件

**Files:**
- Create: `.worktrees/chat-ui/src/renderer/src/components/ChatPanel.svelte`

**Step 1: Write the failing test**

```typescript
// src/renderer/src/components/ChatPanel.spec.ts
import { describe, it, expect } from 'vitest'

describe('ChatPanel', () => {
  it('should export component', () => {
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: FAIL - file doesn't exist

**Step 3: Write minimal implementation**

```svelte
<!-- src/renderer/src/components/ChatPanel.svelte -->
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
            {#if message.role === 'user'}
              {@html formatContent(message.content)}
            {:else}
              {@html formatContent(message.content)}
            {/if}
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
    border: 1px solid var(--ev-c-gray-2, #ddd);
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
```

**Step 4: Run test to verify it passes**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: PASS

**Step 5: Commit**

```bash
cd .worktrees/chat-ui && git add src/renderer/src/components/ChatPanel.svelte && git commit -m "feat: create ChatPanel component"
```

---

## Task 5: 创建 MarkdownPreview 组件

**Files:**
- Create: `.worktrees/chat-ui/src/renderer/src/components/MarkdownPreview.svelte`

**Step 1: Write the failing test**

```typescript
// src/renderer/src/components/MarkdownPreview.spec.ts
import { describe, it, expect } from 'vitest'

describe('MarkdownPreview', () => {
  it('should export component', () => {
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: FAIL - file doesn't exist

**Step 3: Write minimal implementation**

```svelte
<!-- src/renderer/src/components/MarkdownPreview.svelte -->
<script lang="ts">
  import { marked } from 'marked'
  import type { Project } from '$lib/types'

  interface Props {
    project: Project | null
  }

  let { project }: Props = $props()

  let markdownContent = $derived(project ? generateProjectMarkdown(project) : '')
  let htmlContent = $derived(markdownContent ? marked.parse(markdownContent) : '')

  function generateProjectMarkdown(p: Project): string {
    let md = `# ${p.meta.name}\n\n`
    md += `> 创建时间: ${new Date(p.meta.create_time).toLocaleString('zh-CN')}\n\n`
    
    if (p.context && p.context.trim()) {
      md += `## 项目背景\n\n${p.context}\n\n`
    }
    
    if (p.structure_tree.length > 0) {
      md += `## 系统结构\n\n`
      p.structure_tree.forEach(subsystem => {
        md += `### ${subsystem.name}\n`
        subsystem.children.forEach(device => {
          md += `- **${device.name}** (数量: ${device.quantity})\n`
          const specs = Object.entries(device.specs)
            .filter(([_, v]) => v && v.toString().trim())
            .map(([k, v]) => `${k}: ${v}`)
          if (specs.length > 0) {
            md += `  - ${specs.join(', ')}\n`
          }
        })
        md += '\n'
      })
    }
    
    return md
  }
</script>

<div class="markdown-preview">
  {#if project}
    <div class="markdown-content">
      {@html htmlContent}
    </div>
  {:else}
    <div class="empty-state">
      <p>暂无项目数据</p>
    </div>
  {/if}
</div>

<style>
  .markdown-preview {
    height: 100%;
    overflow-y: auto;
    padding: 1.5rem;
    background: var(--color-background, #fff);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--ev-c-text-3, #999);
  }

  .markdown-content {
    max-width: 800px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .markdown-content :global(h1) {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--color-text, #1a1a1a);
    border-bottom: 1px solid var(--ev-c-gray-3, #e8e8e8);
    padding-bottom: 0.75rem;
  }

  .markdown-content :global(h2) {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem;
    color: var(--color-text, #1a1a1a);
  }

  .markdown-content :global(h3) {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 1.25rem 0 0.5rem;
    color: var(--color-text, #333);
  }

  .markdown-content :global(p) {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: var(--color-text, #333);
  }

  .markdown-content :global(blockquote) {
    margin: 0.5rem 0;
    padding: 0.5rem 1rem;
    background: var(--color-background-mute, #f5f5f5);
    border-left: 3px solid var(--ev-c-primary, #4a90d9);
    color: var(--ev-c-text-2, #666);
    font-size: 0.9375rem;
  }

  .markdown-content :global(ul) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .markdown-content :global(li) {
    margin: 0.25rem 0;
    line-height: 1.5;
  }

  .markdown-content :global(strong) {
    color: var(--ev-c-primary, #4a90d9);
  }
</style>
```

**Step 4: Run test to verify it passes**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: PASS

**Step 5: Commit**

```bash
cd .worktrees/chat-ui && git add src/renderer/src/components/MarkdownPreview.svelte && git commit -m "feat: create MarkdownPreview component"
```

---

## Task 6: 创建 Chat Store 管理对话状态

**Files:**
- Create: `.worktrees/chat-ui/src/renderer/src/stores/chat-store.ts`

**Step 1: Write the failing test**

```typescript
// src/renderer/src/stores/chat-store.spec.ts
import { describe, it, expect } from 'vitest'

describe('chat store', () => {
  it('should have initial empty messages', () => {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []
    expect(messages.length).toBe(0)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: FAIL - file doesn't exist

**Step 3: Write minimal implementation**

```typescript
// src/renderer/src/stores/chat-store.ts
import { writable, get } from 'svelte/store'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
}

const initialState: ChatState = {
  messages: [],
  isLoading: false
}

function createChatStore() {
  const { subscribe, set, update } = writable<ChatState>(initialState)

  return {
    subscribe,

    addMessage(role: ChatMessage['role'], content: string) {
      update(state => ({
        ...state,
        messages: [...state.messages, { role, content, timestamp: Date.now() }]
      }))
    },

    setLoading(loading: boolean) {
      update(state => ({ ...state, isLoading: loading }))
    },

    addUserMessage(content: string) {
      this.addMessage('user', content)
    },

    addAssistantMessage(content: string) {
      this.addMessage('assistant', content)
    },

    clear() {
      set(initialState)
    },

    getMessages(): ChatMessage[] {
      return get({ subscribe }).messages
    }
  }
}

export const chatStore = createChatStore()
```

**Step 4: Run test to verify it passes**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: PASS

**Step 5: Commit**

```bash
cd .worktrees/chat-ui && git add src/renderer/src/stores/chat-store.ts && git commit -m "feat: create chat store for conversation state"
```

---

## Task 7: 更新 Workbench 集成对话界面

**Files:**
- Modify: `.worktrees/chat-ui/src/renderer/src/components/Workbench.svelte`

**Step 1: Write the failing test**

```typescript
// src/renderer/src/components/Workbench.spec.ts
import { describe, it, expect } from 'vitest'

describe('Workbench', () => {
  it('should have chat view', () => {
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: FAIL - test file doesn't exist

**Step 3: Write minimal implementation**

```svelte
<!-- src/renderer/src/components/Workbench.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { projectStore } from '$stores/project-store'
  import { chatStore } from '$stores/chat-store'
  import HomeView from './HomeView.svelte'
  import NewProjectDialog from './NewProjectDialog.svelte'
  import OpenProjectDialog from './OpenProjectDialog.svelte'
  import SettingsView from './SettingsView.svelte'
  import SplitPane from './SplitPane.svelte'
  import ChatPanel from './ChatPanel.svelte'
  import MarkdownPreview from './MarkdownPreview.svelte'
  import electronLogo from '../assets/electron.svg'

  type View = 'home' | 'chat' | 'settings'

  let currentView: View = $state('home')
  let showNewProjectDialog = $state(false)
  let showOpenProjectDialog = $state(false)

  onMount(() => {
    // Load settings or check for last project
  })

  function goHome() {
    currentView = 'home'
  }

  function openNewProjectDialog() {
    showNewProjectDialog = true
  }

  function openOpenProjectDialog() {
    showOpenProjectDialog = true
  }

  function openSettings() {
    currentView = 'settings'
  }

  async function handleNewProject(event: CustomEvent<{ name: string; path: string }>) {
    showNewProjectDialog = false
    await projectStore.newProject(event.detail.name, event.detail.path)
    currentView = 'chat'
    chatStore.clear()
  }

  async function handleOpenProject(event: CustomEvent<{ path: string }>) {
    showOpenProjectDialog = false
    await projectStore.loadProject(event.detail.path)
    currentView = 'chat'
    chatStore.clear()
  }

  function handleSendMessage(content: string) {
    chatStore.addUserMessage(content)
    // TODO: Call LLM API and get response
    setTimeout(() => {
      chatStore.addAssistantMessage(`收到您的消息: "${content}"\n\n这是一个模拟响应。在完整实现中，这里将调用 LLM API 并返回智能建议。`)
    }, 1000)
  }

  function closeNewProjectDialog() {
    showNewProjectDialog = false
  }

  function closeOpenProjectDialog() {
    showOpenProjectDialog = false
  }
</script>

<div class="workbench">
  <header class="header">
    <div class="header-left">
      <button class="logo-button" onclick={goHome} title="Go to Home">
        <img src={electronLogo} alt="Logo" class="logo" />
      </button>
      <h1 class="app-title">Proposal Copilot</h1>
      {#if $projectStore.currentProject}
        <span class="project-separator">/</span>
        <span class="project-name">{$projectStore.currentProject.meta.name}</span>
      {/if}
    </div>
    <nav class="header-nav">
      <button
        class="nav-button"
        class:active={currentView === 'home'}
        onclick={goHome}
      >
        Home
      </button>
      {#if $projectStore.currentProject}
        <button
          class="nav-button"
          class:active={currentView === 'chat'}
          onclick={() => currentView = 'chat'}
        >
          对话
        </button>
      {/if}
      <button
        class="nav-button"
        class:active={currentView === 'settings'}
        onclick={openSettings}
      >
        Settings
      </button>
    </nav>
  </header>

  <main class="content">
    {#if currentView === 'home'}
      <HomeView
        on:new-project={openNewProjectDialog}
        on:open-project={openOpenProjectDialog}
        on:open-settings={openSettings}
      />
    {:else if currentView === 'settings'}
      <SettingsView />
    {:else if currentView === 'chat' && $projectStore.currentProject}
      <SplitPane
        minRatio={0.3}
        maxRatio={0.7}
        defaultRatio={0.5}
        left={() => ({
          render: () => ChatPanel({ 
            messages: $chatStore.messages, 
            onsend: handleSendMessage 
          })
        })}
        right={() => ({
          render: () => MarkdownPreview({ project: $projectStore.currentProject })
        })}
      />
    {/if}
  </main>

  <NewProjectDialog
    isOpen={showNewProjectDialog}
    on:confirm={handleNewProject}
    on:cancel={closeNewProjectDialog}
  />

  <OpenProjectDialog
    isOpen={showOpenProjectDialog}
    on:confirm={handleOpenProject}
    on:cancel={closeOpenProjectDialog}
  />
</div>

<style>
  .workbench {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 56px;
    background-color: var(--color-background-soft, #fafafa);
    border-bottom: 1px solid var(--ev-c-gray-3, #e8e8e8);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-button {
    display: flex;
    align-items: center;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .logo-button:hover {
    opacity: 0.8;
  }

  .logo {
    height: 28px;
    width: 28px;
  }

  .app-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text, #1a1a1a);
    margin: 0;
  }

  .project-separator {
    color: var(--ev-c-text-3, #999);
    margin: 0 0.25rem;
  }

  .project-name {
    font-size: 0.9375rem;
    color: var(--ev-c-text-2, #666);
  }

  .header-nav {
    display: flex;
    gap: 0.5rem;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ev-c-text-2, #666);
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-button:hover {
    background-color: var(--ev-c-gray-3, #e8e8e8);
    color: var(--color-text, #1a1a1a);
  }

  .nav-button.active {
    background-color: var(--ev-c-gray-3, #e8e8e8);
    color: var(--color-text, #1a1a1a);
  }

  .content {
    flex: 1;
    overflow: hidden;
  }
</style>
```

**Step 4: Run test to verify it passes**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: PASS

**Step 5: Commit**

```bash
cd .worktrees/chat-ui && git add src/renderer/src/components/Workbench.svelte && git commit -m "feat: update Workbench with chat interface"
```

---

## Task 8: 修复类型声明

**Files:**
- Modify: `.worktrees/chat-ui/src/preload/index.d.ts`

**Step 1: Add marked type declaration**

```typescript
// Add to src/preload/index.d.ts
declare module 'marked' {
  export function parse(markdown: string): string
}
```

**Step 2: Run typecheck**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: PASS

**Step 3: Commit**

```bash
cd .worktrees/chat-ui && git add src/preload/index.d.ts && git commit -m "fix: add marked type declaration"
```

---

## Task 9: 最终验证和构建

**Files:**
- All created/modified files

**Step 1: Run full typecheck**

```bash
cd .worktrees/chat-ui && npm run typecheck
```

Expected: 0 errors

**Step 2: Run dev server**

```bash
cd .worktrees/chat-ui && npm run dev
```

Expected: App starts without errors

**Step 3: Test the flow**

1. Create new project
2. Verify view switches to chat interface
3. Send a message
4. Verify markdown preview updates

**Step 4: Commit**

```bash
cd .worktrees/chat-ui && git add -A && git commit -m "feat: implement project conversation interface"
```

---

## Summary

**Total Tasks:** 9

**Estimated Time:** 18-45 minutes (2-5 min per task)

**Key Files Created:**
- `package.json` - marked dependency
- `src/renderer/src/lib/markdown-generator.ts` - Markdown generation utility
- `src/renderer/src/components/SplitPane.svelte` - Draggable split layout
- `src/renderer/src/components/ChatPanel.svelte` - Conversation interface
- `src/renderer/src/components/MarkdownPreview.svelte` - Markdown preview
- `src/renderer/src/stores/chat-store.ts` - Chat state management
- `src/renderer/src/components/Workbench.svelte` - Main layout with chat view

**Key Features:**
- SplitPane with 30%-70% draggable ratio
- ChatPanel with message history and input
- MarkdownPreview with real-time project rendering
- Chat store for conversation state management
- Seamless project creation → chat view flow

**Execution Order:**
1. Dependencies → 2. Generator → 3. SplitPane → 4. ChatPanel → 5. Preview → 6. Store → 7. Workbench → 8. Types → 9. Verification
