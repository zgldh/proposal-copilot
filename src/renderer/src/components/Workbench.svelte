<script lang="ts">
  import { onMount } from 'svelte'
  import { projectStore } from '$stores/project-store'
  import { settingsStore } from '$stores/settings-store'
  import { chatStore } from '$stores/chat-store'
  import { workbenchStore } from '$stores/workbench-store'
  import { toast } from '$stores/toast-store'
  import HomeView from './HomeView.svelte'
  import NewProjectDialog from './NewProjectDialog.svelte'
  import OpenProjectDialog from './OpenProjectDialog.svelte'
  import SettingsView from './SettingsView.svelte'
  import SplitPane from './SplitPane.svelte'
  import ChatPanel from './ChatPanel.svelte'
  import MarkdownPreview from './MarkdownPreview.svelte'
  import TabBar from './TabBar.svelte'
  import ToastContainer from './ToastContainer.svelte'

  let showNewProjectDialog = $state(false)
  let showOpenProjectDialog = $state(false)
  let activeTab = $derived($workbenchStore.tabs.find((t) => t.id === $workbenchStore.activeTabId))

  onMount(() => {
    settingsStore.load()
  })

  // CORE LOGIC: Context Switching
  $effect(() => {
    const currentTabId = $workbenchStore.activeTabId
    handleTabSwitch(currentTabId)
  })

  let previousTabId = ''

  async function handleTabSwitch(newTabId: string) {
    if (newTabId === previousTabId) return

    const prevTab = $workbenchStore.tabs.find((t) => t.id === previousTabId)
    const nextTab = $workbenchStore.tabs.find((t) => t.id === newTabId)

    // 1. Save previous project if dirty
    if (prevTab?.type === 'project' && $projectStore.isDirty) {
      await projectStore.save()
      toast.success(`Saved project: ${prevTab.title}`)
    }

    // 2. Load next tab data
    if (nextTab) {
      workbenchStore.setSwitching(true)
      if (nextTab.type === 'project' && nextTab.path) {
        // Only load if it's a DIFFERENT project or we need to reload
        if ($projectStore.projectPath !== nextTab.path) {
          projectStore.clear() // Memory dump
          await projectStore.loadProject(nextTab.path)
          chatStore.clear()
        }
      }
      workbenchStore.setSwitching(false)
    }

    previousTabId = newTabId
  }

  // Dialog Handlers

  async function handleNewProject(event: CustomEvent<{ name: string; path: string }>) {
    showNewProjectDialog = false
    await projectStore.newProject(event.detail.name, event.detail.path)
    chatStore.clear()

    // Register new tab
    workbenchStore.openTab({
      type: 'project',
      title: event.detail.name,
      path: $projectStore.projectPath!
    })
  }

  async function handleOpenProject(event: CustomEvent<{ path: string }>) {
    showOpenProjectDialog = false
    // Load logic happens in handleTabSwitch, we just create the tab here
    const name = event.detail.path.split(/[/\\]/).pop() || 'Project'

    workbenchStore.openTab({
      type: 'project',
      title: name,
      path: event.detail.path
    })
  }

  async function handleSendMessage(content: string) {
    if (!content.trim()) return

    try {
      chatStore.addUserMessage(content)
      // TODO: Implement actual LLM call here when chatStore.sendMessage is fully implemented
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  function closeNewProjectDialog() {
    showNewProjectDialog = false
  }

  function closeOpenProjectDialog() {
    showOpenProjectDialog = false
  }
</script>

<div class="workbench">
  <div class="title-bar-drag"></div>
  <TabBar />

  <main class="content">
    {#if activeTab?.type === 'home'}
      <HomeView
        on:new-project={() => (showNewProjectDialog = true)}
        on:open-project={() => (showOpenProjectDialog = true)}
        on:open-settings={() => workbenchStore.openTab({ type: 'settings', title: 'Settings' })}
      />
    {:else if activeTab?.type === 'settings'}
      <SettingsView />
    {:else if activeTab?.type === 'project'}
      {#if $workbenchStore.isSwitching}
        <div class="loading-overlay">Loading Project...</div>
      {:else}
        <SplitPane minRatio={0.3} maxRatio={0.7} defaultRatio={0.5}>
          {#snippet left()}
            <ChatPanel messages={$chatStore.messages} onsend={handleSendMessage} />
          {/snippet}
          {#snippet right()}
            <MarkdownPreview project={$projectStore.currentProject} />
          {/snippet}
        </SplitPane>
      {/if}
    {/if}
  </main>

  <ToastContainer />

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
    background: var(--color-background);
  }

  .title-bar-drag {
    height: 10px;
    width: 100%;
    -webkit-app-region: drag;
  }

  .content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background);
    color: var(--ev-c-text-2);
  }
</style>
