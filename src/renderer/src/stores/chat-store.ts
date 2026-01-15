import { writable, get } from 'svelte/store'

export interface GuidanceOption {
  label: string
  value: string
}

export interface GuidanceData {
  intent: 'clarification' | 'suggestion'
  text?: string
  options: GuidanceOption[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  guidance?: GuidanceData
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

    updateLastAssistantMessage(content: string, guidance?: GuidanceData) {
      update(state => {
        const messages = [...state.messages]
        const lastIndex = messages.length - 1
        if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
          messages[lastIndex] = {
            ...messages[lastIndex],
            content,
            guidance
          }
        }
        return { ...state, messages }
      })
    },

    appendStreamChunk(chunk: string) {
      update(state => {
        const messages = [...state.messages]
        const lastIndex = messages.length - 1
        if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
          messages[lastIndex] = {
            ...messages[lastIndex],
            content: messages[lastIndex].content + chunk
          }
        }
        return { ...state, messages }
      })
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
