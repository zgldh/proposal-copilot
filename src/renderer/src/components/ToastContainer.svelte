<script lang="ts">
  import { toast } from '$stores/toast-store'
  import { fly } from 'svelte/transition'
</script>

<div class="toast-container">
  {#each $toast as t (t.id)}
    <div
      class="toast {t.type}"
      in:fly={{ y: 20, duration: 300 }}
      out:fly={{ y: -20, duration: 200, opacity: 0 }}
    >
      {t.message}
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 9999;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    min-width: 200px;
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .toast.success {
    background-color: #10b981;
  }

  .toast.error {
    background-color: #ef4444;
  }

  .toast.info {
    background-color: var(--ev-c-primary);
  }
</style>
