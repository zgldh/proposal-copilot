import { writable } from 'svelte/store'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([])

  function add(message: string, type: Toast['type'] = 'info') {
    const id = crypto.randomUUID()
    const toast: Toast = { id, message, type }

    update((toasts) => [...toasts, toast])

    setTimeout(() => {
      remove(id)
    }, 3000)
  }

  function remove(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id))
  }

  return {
    subscribe,
    success: (msg: string) => add(msg, 'success'),
    error: (msg: string) => add(msg, 'error'),
    info: (msg: string) => add(msg, 'info')
  }
}

export const toast = createToastStore()
