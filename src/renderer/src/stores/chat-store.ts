import { writable, get } from 'svelte/store'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
}

const initialState: ChatState = {
  messages: [],
  isLoading: false
}

function createChatStore() {
  const { subscribe, set, update } = writable<ChatState>(initialState)

  return {
    subscribe,

    addMessage(role: ChatMessage['role'], content: string) {
      update(state => ({
        ...state,
        messages: [...state.messages, { role, content, timestamp: Date.now() }]
      }))
    },

    setLoading(loading: boolean) {
      update(state => ({ ...state, isLoading: loading }))
    },

    addUserMessage(content: string) {
      this.addMessage('user', content)
    },

    addAssistantMessage(content: string) {
      this.addMessage('assistant', content)
    },

    clear() {
      set(initialState)
    },

    getMessages(): ChatMessage[] {
      return get({ subscribe }).messages
    }
  }
}

export const chatStore = createChatStore()
