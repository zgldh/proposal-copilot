<script lang="ts">
  import { settingsStore } from '$stores/settings-store'
  import { toast } from '$stores/toast-store'
  import { onMount } from 'svelte'
  import type { ProviderConfig } from '$lib/types'

  onMount(async () => {
    await settingsStore.load()
    selectedProviderId = $settingsStore.settings.active_provider_id
  })

  let selectedProviderId = $state($settingsStore.settings.active_provider_id)

  // Reactive helpers
  let settings = $derived($settingsStore.settings)
  let theme = $derived(settings.theme)
  let providers = $derived(Object.values(settings.providers))

  // Local state for form editing to avoid jitter
  let formConfig: ProviderConfig = $state({
    id: '',
    name: '',
    api_key: '',
    base_url: '',
    model: ''
  })

  let isTesting = $state(false)

  let ollamaModels: string[] = $state([])
  let isLoadingModels = $state(false)

  $effect(() => {
    // Sync form when selection changes or store loads
    if (settings.providers[selectedProviderId]) {
      formConfig = { ...settings.providers[selectedProviderId] }
    } else if (providers.length > 0) {
      selectedProviderId = providers[0].id
    }
  })

  async function fetchOllamaModels() {
    if (formConfig.id !== 'ollama') return
    
    isLoadingModels = true
    try {
      const models = await window.electronAPI.ai.ollama.getModels(formConfig.base_url || 'http://localhost:11434')
      ollamaModels = models
      if (models.length > 0 && !formConfig.model) {
        formConfig.model = models[0]
      }
    } catch (e) {
      toast.error('Failed to load Ollama models')
    } finally {
      isLoadingModels = false
    }
  }

  $effect(() => {
    if (selectedProviderId === 'ollama') {
      fetchOllamaModels()
    }
  })

  function selectProvider(id: string) {
    selectedProviderId = id
  }

  async function saveSettings() {
    settingsStore.updateProviderConfig(selectedProviderId, formConfig)
    settingsStore.setActiveProvider(selectedProviderId)
    await settingsStore.save()
    toast.success('Settings saved successfully')
  }

  async function testConnection() {
    isTesting = true
    try {
      const success = await window.electronAPI.ai.testConnection({ ...formConfig })
      if (success) toast.success('Connection successful')
      else toast.error('Connection failed: Check API Key or Network')
    } catch (e) {
      toast.error('Connection error: ' + String(e))
    } finally {
      isTesting = false
    }
  }
</script>

<div class="settings-view">
  <div class="sidebar">
    <h2 class="sidebar-title">Settings</h2>

    <div class="section-label">General</div>
    <div class="theme-toggle">
      <button
        class="theme-btn"
        class:active={theme === 'light'}
        onclick={() => settingsStore.updateTheme('light')}
      >
        ☀️ Light
      </button>
      <button
        class="theme-btn"
        class:active={theme === 'dark'}
        onclick={() => settingsStore.updateTheme('dark')}
      >
        🌙 Dark
      </button>
    </div>

    <div class="section-label">AI Providers</div>
    <div class="provider-list">
      {#each providers as provider}
        <button
          class="provider-item"
          class:active={selectedProviderId === provider.id}
          class:current={settings.active_provider_id === provider.id}
          onclick={() => selectProvider(provider.id)}
        >
          <span class="status-dot"></span>
          {provider.name}
        </button>
      {/each}
    </div>
  </div>

  <div class="content">
    <h2 class="content-title">Configure {formConfig.name}</h2>

    <div class="form-group">
      <label for="model">Model Name</label>
      {#if formConfig.id === 'ollama'}
        <div class="model-select-row">
          <select id="model" bind:value={formConfig.model} disabled={isLoadingModels}>
            {#if ollamaModels.length === 0}
               <option value="" disabled>No models found (Check connection)</option>
            {/if}
            {#each ollamaModels as model}
              <option value={model}>{model}</option>
            {/each}
            <option value={formConfig.model} hidden>{formConfig.model}</option>
          </select>
          <button class="icon-button" onclick={fetchOllamaModels} title="Refresh Models">↻</button>
        </div>
      {:else}
        <input id="model" type="text" bind:value={formConfig.model} />
        <p class="hint">e.g. gpt-4, deepseek-chat, llama2</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="api-key">API Key</label>
      <div class="api-key-row">
        <input id="api-key" type="password" bind:value={formConfig.api_key} />
        <button class="test-button" onclick={testConnection} disabled={isTesting}>
          {#if isTesting}
            <div class="spinner"></div>
          {:else}
            Test
          {/if}
        </button>
      </div>
    </div>

    <div class="form-group">
      <label for="base-url">Base URL</label>
      <input id="base-url" type="text" bind:value={formConfig.base_url} placeholder="Optional" />
      <p class="hint">
        Default: {providers.find((p) => p.id === selectedProviderId)?.base_url || 'N/A'}
      </p>
    </div>

    <div class="actions">
      <button class="save-button" onclick={saveSettings}>Save & Activate</button>
    </div>
  </div>
</div>

<style>
  .settings-view {
    display: grid;
    grid-template-columns: 240px 1fr;
    height: 100%;
    background: var(--color-background);
  }

  .sidebar {
    background: var(--color-background-soft);
    border-right: 1px solid var(--ev-c-gray-3);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .content {
    padding: 2rem 3rem;
    overflow-y: auto;
  }

  .sidebar-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }

  .section-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--ev-c-text-3);
    margin-bottom: 0.75rem;
    margin-top: 1.5rem;
    font-weight: 600;
  }

  .theme-toggle {
    display: flex;
    gap: 0.5rem;
  }

  .theme-btn {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--ev-c-gray-2);
    background: transparent;
    color: var(--ev-c-text-2);
    border-radius: 6px;
    cursor: pointer;
  }

  .theme-btn.active {
    background: var(--ev-c-primary);
    color: white;
    border-color: var(--ev-c-primary);
  }

  .provider-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .provider-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--ev-c-text-2);
    cursor: pointer;
    transition: background 0.2s;
  }

  .provider-item:hover {
    background: var(--color-background-soft);
  }

  .provider-item.active {
    background: var(--color-background-soft);
    color: var(--color-text);
    font-weight: 500;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ev-c-gray-2);
  }

  .provider-item.current .status-dot {
    background: #4cc71e;
    box-shadow: 0 0 4px #4cc71e;
  }

  .content-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    max-width: 500px;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ev-c-text-2);
    margin-bottom: 0.5rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
    color: var(--color-text);
    background-color: var(--color-background-input);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    transition: border-color 0.2s;
  }

  .form-group input:focus {
    border-color: var(--ev-c-primary);
  }

  .api-key-row {
    display: flex;
    gap: 0.5rem;
  }

  .test-button {
    padding: 0 1rem;
    font-size: 0.875rem;
    background: var(--color-background-soft);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--ev-c-text-2);
    cursor: pointer;
    white-space: nowrap;
    min-width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .test-button:hover:not(:disabled) {
    background: var(--ev-c-gray-3);
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--ev-c-text-2);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .hint {
    font-size: 0.8rem;
    color: var(--ev-c-text-3);
    margin-top: 0.5rem;
  }

  .actions {
    margin-top: 2rem;
    max-width: 500px;
  }

  .save-button {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: white;
    background-color: var(--ev-c-primary);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save-button:hover {
    background-color: var(--ev-c-primary-soft);
  }

  .model-select-row {
    display: flex;
    gap: 0.5rem;
  }
  select {
    width: 100%;
    padding: 0.625rem 0.875rem;
    background-color: var(--color-background-input);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text);
  }
  .icon-button {
    padding: 0 10px;
    background: var(--color-background-soft);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    color: var(--color-text);
  }
</style>
