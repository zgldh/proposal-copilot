<script lang="ts">
  import Workbench from './components/Workbench.svelte'
  import { settingsStore } from '$stores/settings-store'

  $effect(() => {
    document.documentElement.setAttribute('data-theme', $settingsStore.settings.theme)
  })
</script>

<Workbench />
