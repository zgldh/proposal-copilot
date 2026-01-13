<script lang="ts">
  import { onMount } from 'svelte'
  import { projectStore } from '$stores/project-store'
  import { settingsStore } from '$stores/settings-store'
  import HomeView from './HomeView.svelte'
  import NewProjectDialog from './NewProjectDialog.svelte'
  import OpenProjectDialog from './OpenProjectDialog.svelte'
  import SettingsView from './SettingsView.svelte'
  import electronLogo from '../assets/electron.svg'

  type View = 'home' | 'settings'

  let currentView: View = 'home'
  let showNewProjectDialog = false
  let showOpenProjectDialog = false

  onMount(() => {
    settingsStore.load()
  })

  $: projectName = $projectStore.currentProject?.meta.name

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
    currentView = 'home'
  }

  async function handleOpenProject(event: CustomEvent<{ path: string }>) {
    showOpenProjectDialog = false
    await projectStore.loadProject(event.detail.path)
    currentView = 'home'
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
