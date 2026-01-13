<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher<{
    'new-project': void
    'open-project': void
    'open-settings': void
  }>()
</script>

<div class="home-view">
  <div class="welcome-section">
    <h1 class="welcome-title">Proposal Copilot</h1>
    <p class="welcome-subtitle">AI-powered proposal generation for sales and engineering teams</p>
  </div>

  <div class="actions-section">
    <button class="action-button primary" onclick={() => dispatch('new-project')}>
      <span class="button-icon">+</span>
      <span class="button-text">New Project</span>
    </button>

    <button class="action-button secondary" onclick={() => dispatch('open-project')}>
      <span class="button-icon">📂</span>
      <span class="button-text">Open Project</span>
    </button>

    <button class="action-button tertiary" onclick={() => dispatch('open-settings')}>
      <span class="button-icon">⚙️</span>
      <span class="button-text">Settings</span>
    </button>
  </div>
</div>

<style>
  .home-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 2rem;
    text-align: center;
  }

  .welcome-section {
    margin-bottom: 3rem;
  }

  .welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 0.75rem;
  }

  .welcome-subtitle {
    font-size: 1.1rem;
    color: var(--ev-c-text-2);
    max-width: 400px;
    line-height: 1.5;
  }

  .actions-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 280px;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button-icon {
    font-size: 1.25rem;
  }

  .action-button.primary {
    background-color: var(--ev-c-primary);
    color: var(--ev-c-white);
  }

  .action-button.primary:hover {
    background-color: var(--ev-c-primary-hover, #4a7cc9);
  }

  .action-button.secondary {
    background-color: var(--ev-c-gray-3);
    color: var(--color-text);
    border: 1px solid var(--ev-c-gray-2);
  }

  .action-button.secondary:hover {
    background-color: var(--ev-c-gray-2);
  }

  .action-button.tertiary {
    background-color: transparent;
    color: var(--ev-c-text-2);
    border: 1px solid var(--ev-c-gray-2);
  }

  .action-button.tertiary:hover {
    background-color: var(--ev-c-gray-3);
    color: var(--color-text);
  }
</style>
