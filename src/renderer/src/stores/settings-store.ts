import { writable, get } from 'svelte/store'
import type { Settings, LlmProvider } from '$lib/types'

const DEFAULT_SETTINGS: Settings = {
  llm_provider: {
    id: 'default',
    name: 'Default Provider',
    type: 'openai',
    api_key: '',
    model: 'gpt-4'
  },
  theme: 'dark'
}

const SETTINGS_FILE = 'settings.json'

interface SettingsState {
  settings: Settings
  isLoading: boolean
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<SettingsState>({
    settings: DEFAULT_SETTINGS,
    isLoading: false
  })

  return {
    subscribe,

    async load() {
      update(state => ({ ...state, isLoading: true }))
      try {
        const content = await window.electronAPI.readFile(SETTINGS_FILE)
        const settings = JSON.parse(content) as Settings
        set({ settings, isLoading: false })
      } catch (error) {
        console.log('Using default settings:', error)
        set({ settings: DEFAULT_SETTINGS, isLoading: false })
      }
    },

    async save() {
      const state = get({ subscribe })
      await window.electronAPI.writeFile(
        SETTINGS_FILE,
        JSON.stringify(state.settings, null, 2)
      )
    },

    updateProvider(provider: Partial<LlmProvider>) {
      update(state => {
        const updatedProvider = { ...state.settings.llm_provider, ...provider }
        return {
          ...state,
          settings: { ...state.settings, llm_provider: updatedProvider }
        }
      })
    },

    updateProviderApiKey(apiKey: string) {
      update(state => ({
        ...state,
        settings: {
          ...state.settings,
          llm_provider: { ...state.settings.llm_provider, api_key: apiKey }
        }
      }))
    },

    updateProviderBaseUrl(baseUrl: string) {
      update(state => ({
        ...state,
        settings: {
          ...state.settings,
          llm_provider: { ...state.settings.llm_provider, base_url: baseUrl }
        }
      }))
    },

    updateProviderModel(model: string) {
      update(state => ({
        ...state,
        settings: {
          ...state.settings,
          llm_provider: { ...state.settings.llm_provider, model }
        }
      }))
    },

    updateTheme(theme: 'light' | 'dark') {
      update(state => ({
        ...state,
        settings: { ...state.settings, theme }
      }))
    },

    async reset() {
      await window.electronAPI.writeFile(
        SETTINGS_FILE,
        JSON.stringify(DEFAULT_SETTINGS, null, 2)
      )
      set({ settings: DEFAULT_SETTINGS, isLoading: false })
    }
  }
}

export const settingsStore = createSettingsStore()
