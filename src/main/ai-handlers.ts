import { ipcMain, BrowserWindow } from 'electron'
import { OpenAIService } from './services/openai-service'
import type { LLMConfig, ChatMessage } from './services/llm-types'

const openAIService = new OpenAIService()

function getProvider(_config: LLMConfig) {
  // Future: Switch based on config.id or config.type (e.g. return deepseekService)
  return openAIService
}

export function setupAIHandlers(_mainWindow: BrowserWindow) {
  ipcMain.handle('ai:testConnection', async (_event, config: LLMConfig) => {
    const provider = getProvider(config)
    return await provider.testConnection(config)
  })

  ipcMain.handle('ai:chat', async (_event, messages: ChatMessage[], config: LLMConfig) => {
    const provider = getProvider(config)
    return await provider.chat(messages, config)
  })

  ipcMain.handle('ai:stream', async (event, messages: ChatMessage[], config: LLMConfig) => {
    const provider = getProvider(config)
    try {
      await provider.stream(messages, config, (chunk) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('ai:stream-chunk', chunk)
        }
      })
      if (!event.sender.isDestroyed()) {
        event.sender.send('ai:stream-complete')
      }
    } catch (error) {
      if (!event.sender.isDestroyed()) {
        const msg = error instanceof Error ? error.message : String(error)
        event.sender.send('ai:stream-error', msg)
      }
      throw error
    }
  })
}
