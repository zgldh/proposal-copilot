import { ipcMain, BrowserWindow } from 'electron'
import { OpenAIService } from './services/openai-service'
import { DeepSeekService } from './services/deepseek-service'
import { OllamaService } from './services/ollama-service'
import { ConversionEngine } from './services/conversion-engine'
import type { LLMConfig, ChatMessage } from './services/llm-types'
import type { TreeNode } from './services/ai-types'

const openAIService = new OpenAIService()
const deepSeekService = new DeepSeekService()
const ollamaService = new OllamaService()
const conversionEngine = new ConversionEngine()

function getProvider(config: LLMConfig) {
  if (config.id === 'deepseek') {
    return deepSeekService
  }
  if (config.id === 'ollama' || config.id === 'custom') {
    return ollamaService
  }
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

  ipcMain.handle('ai:ollama:getModels', async (_event, baseUrl: string) => {
    return await ollamaService.getAvailableModels(baseUrl || 'http://localhost:11434')
  })

  ipcMain.handle('ai:process-message', async (_event, {
    message,
    history,
    projectContext,
    config
  }: { message: string, history: ChatMessage[], projectContext: TreeNode[], config: LLMConfig }) => {
    const provider = getProvider(config)
    // Pass the provider instance to the engine
    return await conversionEngine.processMessage(message, history, projectContext, provider, config)
  })
}
