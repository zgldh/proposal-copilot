<script lang="ts">
  import { onMount } from 'svelte'
  import { projectStore } from '$stores/project-store'
  import { settingsStore } from '$stores/settings-store'
  import { chatStore } from '$stores/chat-store'
  import { workbenchStore } from '$stores/workbench-store'
  import { toast } from '$stores/toast-store'
  import HomeView from './HomeView.svelte'
  import NewProjectDialog from './NewProjectDialog.svelte'
  import SettingsView from './SettingsView.svelte'
  import SplitPane from './SplitPane.svelte'
  import ChatPanel from './ChatPanel.svelte'
  import TreeView from './tree/TreeView.svelte'
  import MarkdownPreview from './MarkdownPreview.svelte'
  import TabBar from './TabBar.svelte'
  import ToastContainer from './ToastContainer.svelte'

  let showNewProjectDialog = $state(false)
  let activeTab = $derived($workbenchStore.tabs.find((t) => t.id === $workbenchStore.activeTabId))
  let rightPanelView = $state<'tree' | 'preview'>('tree')

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

    const currentPrevId = previousTabId
    previousTabId = newTabId

    const prevTab = $workbenchStore.tabs.find((t) => t.id === currentPrevId)
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

  async function triggerOpenProject() {
    const path = await window.electron.dialog.openProject()
    if (path) {
      const name = path.split(/[/\\]/).pop() || 'Project'
      workbenchStore.openTab({
        type: 'project',
        title: name,
        path
      })
    }
  }

  async function handleSendMessage(content: string) {
    if (!content.trim()) return

    try {
      chatStore.addUserMessage(content)
      chatStore.setLoading(true)

      // Prepare context
      const history = $chatStore.messages.map(m => ({ role: m.role, content: m.content }))
      const projectContext = $projectStore.currentProject?.structure_tree || []
      
      // Get active provider config
      const settings = $settingsStore.settings
      const config = settings.providers[settings.active_provider_id]

      // Call AI Engine
      const result = await window.electronAPI.ai.processMessage({
        message: content,
        history,
        projectPath: $projectStore.projectPath!,
        projectContext,
        config
      })

      // Handle response
      chatStore.addAssistantMessage(result.textResponse)
      projectStore.applyOperations(result.operations)

    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      chatStore.setLoading(false)
    }
  }

  function closeNewProjectDialog() {
    showNewProjectDialog = false
  }
</script>

<div class="workbench">
  <div class="title-bar-drag"></div>
  <TabBar />

  <main class="content">
    {#if activeTab?.type === 'home'}
      <HomeView
        on:new-project={() => (showNewProjectDialog = true)}
        on:open-project={triggerOpenProject}
        on:open-settings={() => workbenchStore.openTab({ type: 'settings', title: 'Settings' })}
      />
    {:else if activeTab?.type === 'settings'}
      <SettingsView />
    {:else if activeTab?.type === 'project'}
      {#if $workbenchStore.isSwitching}
        <div class="loading-overlay">Loading Project...</div>
      {:else}
        <SplitPane
          minRatio={0.3}
          maxRatio={0.7}
          defaultRatio={0.5}
          storageKey={$projectStore.projectPath ? `split-ratio-${$projectStore.projectPath}` : undefined}
        >
          {#snippet left()}
            <ChatPanel messages={$chatStore.messages} onsend={handleSendMessage} />
          {/snippet}
          {#snippet right()}
            <div class="right-panel-container">
              <div class="right-panel-tabs">
                <button class:active={rightPanelView === 'tree'} onclick={() => rightPanelView = 'tree'}>
                  Structure
                </button>
                <button class:active={rightPanelView === 'preview'} onclick={() => rightPanelView = 'preview'}>
                  Preview
                </button>
              </div>
              {#if rightPanelView === 'tree'}
                <TreeView />
              {:else}
                <MarkdownPreview project={$projectStore.currentProject} />
              {/if}
            </div>
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

  .right-panel-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background);
  }

  .right-panel-tabs {
    display: flex;
    border-bottom: 1px solid var(--ev-c-gray-3);
    background: var(--color-background-soft);
  }

  .right-panel-tabs button {
    flex: 1;
    padding: 0.5rem;
    border: none;
    background: transparent;
    color: var(--ev-c-text-2);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }

  .right-panel-tabs button:hover {
    background: var(--ev-c-gray-3);
    color: var(--color-text);
  }

  .right-panel-tabs button.active {
    color: var(--ev-c-primary);
    border-bottom-color: var(--ev-c-primary);
    background: var(--color-background);
  }
</style>
