import { writable, get } from 'svelte/store'
import type { Settings, ProviderConfig } from '$lib/types'

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  active_provider_id: 'openai',
  providers: {
    openai: {
      id: 'openai',
      name: 'OpenAI',
      api_key: '',
      base_url: 'https://api.openai.com/v1',
      model: 'gpt-4'
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek',
      api_key: '',
      base_url: 'https://api.deepseek.com',
      model: 'deepseek-chat'
    },
    custom: {
      id: 'custom',
      name: 'Custom (Ollama)',
      api_key: 'sk-placeholder',
      base_url: 'http://localhost:11434/v1',
      model: 'llama3'
    }
  }
}

interface SettingsState {
  settings: Settings
  isLoading: boolean
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<SettingsState>({
    settings: DEFAULT_SETTINGS,
    isLoading: true
  })

  return {
    subscribe,
    async load() {
      update((s) => ({ ...s, isLoading: true }))
      const settings = await window.electron.settings.read()
      set({ settings, isLoading: false })
    },

    async save() {
      const state = get({ subscribe })
      await window.electron.settings.write(state.settings)
    },

    setActiveProvider(id: string) {
      update((state) => {
        return {
          ...state,
          settings: { ...state.settings, active_provider_id: id }
        }
      })
    },

    updateProviderConfig(id: string, config: Partial<ProviderConfig>) {
      update((state) => {
        const oldConfig = state.settings.providers[id] || { id, name: id, api_key: '', model: '' }
        const newConfig = { ...oldConfig, ...config }
        return {
          ...state,
          settings: {
            ...state.settings,
            providers: { ...state.settings.providers, [id]: newConfig }
          }
        }
      })
    },

    updateTheme(theme: 'light' | 'dark') {
      update((state) => ({
        ...state,
        settings: { ...state.settings, theme }
      }))
    }
  }
}

export const settingsStore = createSettingsStore()
