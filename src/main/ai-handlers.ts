import { ipcMain, BrowserWindow } from 'electron'
import { OpenAIService } from './services/openai-service'
import { DeepSeekService } from './services/deepseek-service'
import { OllamaService } from './services/ollama-service'
import { ConversionEngine } from './services/conversion-engine'
import type { LLMConfig, ChatMessage } from './services/llm-types'
import type { TreeNode } from './services/ai-types'
import { projectService } from './services/project-service'

const openAIService = new OpenAIService()
const deepSeekService = new DeepSeekService()
const ollamaService = new OllamaService()
const conversionEngine = new ConversionEngine()

const activeAbortControllers = new Map<number, AbortController>()

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
    console.log('[IPC] ai:testConnection', config.id)
    const provider = getProvider(config)
    try {
      return await provider.testConnection(config)
    } catch (error) {
      console.error('[IPC] ai:testConnection error:', error)
      throw error
    }
  })

  ipcMain.handle('ai:chat', async (_event, messages: ChatMessage[], config: LLMConfig) => {
    console.log('[IPC] ai:chat', { model: config.model, messages: messages.length })
    const provider = getProvider(config)
    try {
      return await provider.chat(messages, config)
    } catch (error) {
      console.error('[IPC] ai:chat error:', error)
      throw error
    }
  })

  ipcMain.handle('ai:stream', async (event, messages: ChatMessage[], config: LLMConfig) => {
    console.log('[IPC] ai:stream start', { model: config.model })
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
      console.log('[IPC] ai:stream complete')
    } catch (error) {
      console.error('[IPC] ai:stream error:', error)
      if (!event.sender.isDestroyed()) {
        const msg = error instanceof Error ? error.message : String(error)
        event.sender.send('ai:stream-error', msg)
      }
      throw error
    }
  })

  ipcMain.handle('ai:ollama:getModels', async (_event, baseUrl: string) => {
    console.log('[IPC] ai:ollama:getModels', baseUrl)
    try {
      return await ollamaService.getAvailableModels(baseUrl || 'http://localhost:11434')
    } catch (error) {
      console.error('[IPC] ai:ollama:getModels error:', error)
      throw error
    }
  })

  ipcMain.handle('ai:cancelProcessing', (event) => {
    const senderId = event.sender.id
    const controller = activeAbortControllers.get(senderId)
    if (controller) {
      console.log('[IPC] ai:cancelProcessing aborting request for sender', senderId)
      controller.abort()
      activeAbortControllers.delete(senderId)
    }
  })

  ipcMain.handle('ai:process-message', async (event, {
    message,
    history,
    projectPath,
    projectContext,
    config
  }: { message: string, history: ChatMessage[], projectPath: string, projectContext: TreeNode[], config: LLMConfig }) => {
    console.log('[IPC] ai:process-message', { projectPath, messageLength: message.length })
    const senderId = event.sender.id
    const controller = new AbortController()
    activeAbortControllers.set(senderId, controller)
    const provider = getProvider(config)
    
    try {
      // Create checkpoint before AI operation
      console.log('[IPC] ai:process-message: creating snapshot')
      await projectService.createSnapshot(projectPath, 'Before AI Operation')
      
      // Pass the provider instance to the engine
      const result = await conversionEngine.processMessage(
        message,
        history,
        projectContext,
        provider,
        config,
        (chunk) => {
          // Ensure sender still exists
          if (!event.sender.isDestroyed()) {
            event.sender.send('ai:stream-chunk', chunk)
          }
        },
        { signal: controller.signal }
      )
      activeAbortControllers.delete(senderId)
      console.log('[IPC] ai:process-message success', { operations: result.operations.length })
      return result
    } catch (error) {
      activeAbortControllers.delete(senderId)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[IPC] ai:process-message aborted')
        throw error
      }
      console.error('[IPC] ai:process-message error:', error)
      throw error
    }
  })
}
