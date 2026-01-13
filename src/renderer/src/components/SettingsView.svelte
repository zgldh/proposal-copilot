<script lang="ts">
  import { settingsStore } from '$stores/settings-store'
  import { onMount } from 'svelte'

  onMount(() => {
    settingsStore.load()
  })

  let llmProvider: 'openai' | 'deepseek' | 'custom' = 'openai'
  let apiKey = ''
  let baseUrl = ''
  let model = ''
  let theme: 'light' | 'dark' = 'dark'

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'custom', label: 'Custom' }
  ]

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ]

  async function saveSettings() {
    settingsStore.updateProvider({
      type: llmProvider,
      api_key: apiKey,
      base_url: baseUrl || undefined,
      model: model
    })
    settingsStore.updateTheme(theme)
    await settingsStore.save()
  }

  $: {
    if ($settingsStore && !$settingsStore.isLoading) {
      llmProvider = $settingsStore.settings.llm_provider.type
      apiKey = $settingsStore.settings.llm_provider.api_key
      baseUrl = $settingsStore.settings.llm_provider.base_url || ''
      model = $settingsStore.settings.llm_provider.model
      theme = $settingsStore.settings.theme
    }
  }
</script>

<div class="settings-view">
  <h1 class="settings-title">Settings</h1>

  <section class="settings-section">
    <h2 class="section-title">Theme</h2>
    <div class="theme-selector">
      {#each themeOptions as option}
        <button
          class="theme-option"
          class:active={theme === option.value}
          onclick={() => theme = option.value}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </section>

  <section class="settings-section">
    <h2 class="section-title">LLM Provider</h2>

    <div class="form-group">
      <label for="provider">Provider</label>
      <select id="provider" bind:value={llmProvider}>
        {#each providerOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="api-key">API Key</label>
      <input
        id="api-key"
        type="password"
        bind:value={apiKey}
        placeholder="Enter your API key"
      />
    </div>

    {#if llmProvider === 'custom'}
      <div class="form-group">
        <label for="base-url">Base URL</label>
        <input
          id="base-url"
          type="text"
          bind:value={baseUrl}
          placeholder="https://api.example.com/v1"
        />
      </div>
    {/if}

    <div class="form-group">
      <label for="model">Model</label>
      <input
        id="model"
        type="text"
        bind:value={model}
        placeholder="e.g., gpt-4, deepseek-chat"
      />
    </div>
  </section>

  <div class="settings-actions">
    <button class="save-button" onclick={saveSettings}>
      Save Settings
    </button>
  </div>
</div>

<style>
  .settings-view {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .settings-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 2rem;
  }

  .settings-section {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--ev-c-text-2);
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .theme-selector {
    display: flex;
    gap: 0.5rem;
  }

  .theme-option {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--ev-c-text-2);
    background-color: transparent;
    border: 1px solid var(--ev-c-gray-2);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .theme-option:first-child {
    border-radius: 6px 0 0 6px;
  }

  .theme-option:last-child {
    border-radius: 0 6px 6px 0;
  }

  .theme-option:not(:last-child) {
    border-right: none;
  }

  .theme-option:hover {
    background-color: var(--ev-c-gray-3);
  }

  .theme-option.active {
    background-color: var(--ev-c-primary);
    color: var(--ev-c-white);
    border-color: var(--ev-c-primary);
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ev-c-text-2);
    margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
    color: var(--color-text);
    background-color: var(--color-background-mute);
    border: 1px solid var(--ev-c-gray-2);
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: var(--ev-c-primary);
  }

  .form-group input::placeholder {
    color: var(--ev-c-text-3);
  }

  .form-group select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
  }

  .settings-actions {
    margin-top: 2rem;
  }

  .save-button {
    width: 100%;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--ev-c-white);
    background-color: var(--ev-c-primary);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save-button:hover {
    background-color: var(--ev-c-primary-hover, #4a7cc9);
  }
</style>
