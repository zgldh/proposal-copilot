<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let isOpen = false

  const dispatch = createEventDispatcher<{
    confirm: { name: string; path: string }
    cancel: void
  }>()

  let projectName = ''
  let projectPath = ''

  async function selectPath() {
    const result = await window.electron.dialog.newProject()
    if (result) {
      projectPath = result
      if (!projectName) {
        projectName = projectPath.split(/[/\\]/).pop() || ''
      }
    }
  }

  async function handleConfirm() {
    if (projectName && projectPath) {
      const isEmpty = await window.electronAPI.isDirectoryEmpty(projectPath)
      if (!isEmpty) {
        if (!confirm('The directory is not empty. Do you want to continue?')) {
          return
        }
      }

      dispatch('confirm', { name: projectName, path: projectPath })
      reset()
    }
  }

  function handleCancel() {
    dispatch('cancel')
    reset()
  }

  function reset() {
    projectName = ''
    projectPath = ''
  }

  $: canConfirm = projectName.trim() !== '' && projectPath !== ''
</script>

{#if isOpen}
  <div class="dialog-overlay" onclick={handleCancel} role="button" tabindex="-1">
    <div class="dialog" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
      <h2 class="dialog-title">Create New Project</h2>

      <div class="form-group">
        <label for="project-name">Project Name</label>
        <input
          id="project-name"
          type="text"
          bind:value={projectName}
          placeholder="Enter project name"
        />
      </div>

      <div class="form-group">
        <label for="project-path">Location</label>
        <div class="path-input">
          <input
            id="project-path"
            type="text"
            bind:value={projectPath}
            placeholder="Select project location"
            readonly
          />
          <button type="button" class="browse-button" onclick={selectPath}>
            Browse
          </button>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="button secondary" onclick={handleCancel}>Cancel</button>
        <button class="button primary" onclick={handleConfirm} disabled={!canConfirm}>
          Create
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background-color: var(--color-background-soft);
    border-radius: 12px;
    padding: 1.5rem;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .dialog-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 1.5rem;
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

  .form-group input {
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

  .form-group input:focus {
    border-color: var(--ev-c-primary);
  }

  .form-group input::placeholder {
    color: var(--ev-c-text-3);
  }

  .path-input {
    display: flex;
    gap: 0.5rem;
  }

  .path-input input {
    flex: 1;
  }

  .browse-button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    background-color: var(--ev-c-gray-3);
    border: 1px solid var(--ev-c-gray-2);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .browse-button:hover {
    background-color: var(--ev-c-gray-2);
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .button {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button.primary {
    background-color: var(--ev-c-primary);
    color: var(--ev-c-white);
  }

  .button.primary:hover:not(:disabled) {
    background-color: var(--ev-c-primary-hover, #4a7cc9);
  }

  .button.primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button.secondary {
    background-color: transparent;
    color: var(--ev-c-text-2);
    border: 1px solid var(--ev-c-gray-2);
  }

  .button.secondary:hover {
    background-color: var(--ev-c-gray-3);
    color: var(--color-text);
  }
</style>
