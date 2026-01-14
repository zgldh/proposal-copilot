import { writable } from 'svelte/store'
import type { Tab } from '$lib/types'

interface WorkbenchState {
  tabs: Tab[]
  activeTabId: string
  isSwitching: boolean
}

const DEFAULT_TAB: Tab = { id: 'home', type: 'home', title: 'Home' }

const initialState: WorkbenchState = {
  tabs: [DEFAULT_TAB],
  activeTabId: 'home',
  isSwitching: false
}

function createWorkbenchStore() {
  const { subscribe, update } = writable<WorkbenchState>(initialState)

  return {
    subscribe,

    openTab(tab: Omit<Tab, 'id'> & { id?: string }) {
      update((state) => {
        const id = tab.id || (tab.type === 'settings' ? 'settings' : crypto.randomUUID())
        const existing = state.tabs.find(
          (t) =>
            t.id === id || (t.type === tab.type && t.path === tab.path && tab.type === 'project')
        )

        if (existing) {
          return { ...state, activeTabId: existing.id }
        }

        const newTab = { ...tab, id }
        return {
          ...state,
          tabs: [...state.tabs, newTab],
          activeTabId: id
        }
      })
    },

    closeTab(id: string) {
      update((state) => {
        const newTabs = state.tabs.filter((t) => t.id !== id)
        // If closing active tab, activate the last one
        let newActiveId = state.activeTabId
        if (id === state.activeTabId) {
          newActiveId = newTabs[newTabs.length - 1]?.id || 'home'
        }
        if (newTabs.length === 0) {
          newTabs.push(DEFAULT_TAB)
          newActiveId = 'home'
        }
        return { ...state, tabs: newTabs, activeTabId: newActiveId }
      })
    },

    activateTab(id: string) {
      update((state) => ({ ...state, activeTabId: id }))
    },

    setSwitching(status: boolean) {
      update((s) => ({ ...s, isSwitching: status }))
    }
  }
}

export const workbenchStore = createWorkbenchStore()
