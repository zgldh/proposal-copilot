<script lang="ts">
  import { onMount } from 'svelte'
  import { projectStore } from '$stores/project-store'
  import { settingsStore } from '$stores/settings-store'
  import { chatStore } from '$stores/chat-store'
  import HomeView from './HomeView.svelte'
  import NewProjectDialog from './NewProjectDialog.svelte'
  import OpenProjectDialog from './OpenProjectDialog.svelte'
  import SettingsView from './SettingsView.svelte'
  import SplitPane from './SplitPane.svelte'
  import ChatPanel from './ChatPanel.svelte'
  import MarkdownPreview from './MarkdownPreview.svelte'
  import electronLogo from '../assets/electron.svg'

  type View = 'home' | 'settings' | 'chat'

  let currentView: View = 'home'
  let showNewProjectDialog = false
  let showOpenProjectDialog = false

  onMount(() => {
    settingsStore.load()
  })

  $: projectName = $projectStore.currentProject?.meta.name
  $: hasProject = !!$projectStore.currentProject

  function goHome() {
    currentView = 'home'
  }

  function openChat() {
    currentView = 'chat'
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
    chatStore.clear()
    currentView = 'chat'
  }

  async function handleOpenProject(event: CustomEvent<{ path: string }>) {
    showOpenProjectDialog = false
    await projectStore.loadProject(event.detail.path)
    chatStore.clear()
    currentView = 'chat'
  }

  async function handleSendMessage(content: string) {
    chatStore.addUserMessage(content)
    chatStore.setLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = [
      `好的，我已经了解您的需求。我将为您创建一个包含以下内容的项目方案：\n\n**系统架构**\n- 前端：使用现代 Web 技术栈\n- 后端：基于 Node.js 的服务\n- 数据库：PostgreSQL\n\n**主要功能**\n1. 用户管理模块\n2. 数据处理模块\n3. 报告生成模块\n\n还有其他需要调整的地方吗？`,
      `理解了！我正在为您规划项目结构。\n\n根据您的描述，我建议采用以下设计：\n\n**技术选型**\n- 框架：Svelte + Electron\n- 样式：CSS 变量主题\n- 构建：Vite\n\n**模块划分**\n- 核心模块\n- UI 组件库\n- 业务逻辑层\n\n如需修改或补充，请告诉我。`,
      `好的，我已经记录下您的需求。\n\n**项目概要**\n- 项目类型：标准提案生成工具\n- 目标用户：企业用户\n- 核心价值：提高提案制作效率\n\n接下来我将生成详细的技术方案文档。`
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    chatStore.addAssistantMessage(randomResponse)
    chatStore.setLoading(false)
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
      {#if projectName}
        <span class="project-separator">/</span>
        <span class="project-name">{projectName}</span>
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
      {#if hasProject}
        <button
          class="nav-button"
          class:active={currentView === 'chat'}
          onclick={openChat}
        >
          Chat
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
    {:else if currentView === 'chat'}
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
    {:else if currentView === 'settings'}
      <SettingsView />
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
    background-color: var(--color-background-soft);
    border-bottom: 1px solid var(--ev-c-gray-3);
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
    color: var(--color-text);
  }

  .project-separator {
    color: var(--ev-c-text-3);
    margin: 0 0.25rem;
  }

  .project-name {
    font-size: 0.9375rem;
    color: var(--ev-c-text-2);
  }

  .header-nav {
    display: flex;
    gap: 0.5rem;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ev-c-text-2);
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-button:hover {
    background-color: var(--ev-c-gray-3);
    color: var(--color-text);
  }

  .nav-button.active {
    background-color: var(--ev-c-gray-3);
    color: var(--color-text);
  }

  .content {
    flex: 1;
    overflow: auto;
  }
</style>
