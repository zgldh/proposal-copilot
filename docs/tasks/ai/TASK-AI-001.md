# TASK-AI-001: OpenAI 集成

## 基本信息

- **ID**: TASK-AI-001
- **标题**: OpenAI 集成
- **优先级**: 高
- **预计时间**: 1-2 天
- **依赖**: 无
- **所属阶段**: 阶段 2 - AI 对话引擎
- **里程碑**: MVP 版本

## 任务描述

实现 OpenAI API 的完整集成，包括 API 调用封装、错误处理、令牌管理和流式响应支持。这是项目第一个 LLM 提供商集成，将作为其他提供商集成的模板。

## 功能需求

### 1. API 调用封装

- 支持 GPT-4 和 GPT-3.5 模型
- 完整的请求参数配置
- 响应解析和处理
- 超时和重试机制

### 2. 错误处理

- API 错误分类和处理
- 网络错误重试
- 令牌限制处理
- 用户友好的错误消息

### 3. 令牌管理

- 输入令牌计数
- 输出令牌计数
- 成本估算
- 使用统计

### 4. 流式响应

- 支持流式 API 调用
- 实时显示响应内容
- 取消机制
- 性能优化

### 5. 设置集成

- 与现有设置系统集成
- API 密钥安全存储
- 模型选择配置
- 连接测试功能

## 技术规格

### 服务接口

```typescript
interface OpenAIService {
  // 基础调用
  chatCompletion(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>

  // 流式调用
  streamChatCompletion(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string>

  // 工具函数
  testConnection(apiKey: string): Promise<boolean>
  getModels(apiKey: string): Promise<string[]>
  estimateTokens(text: string): number
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

interface ChatResponse {
  content: string
  tokens: {
    prompt: number
    completion: number
    total: number
  }
  model: string
  finishReason: string
}
```

### 文件位置

- `src/main/services/openai-service.ts` - OpenAI 服务实现
- `src/main/services/llm-provider.ts` - 提供商抽象接口
- `src/main/ipc-handlers.ts` - IPC 处理器更新
- `src/preload/index.d.ts` - 类型定义更新

### 安全要求

- API 密钥加密存储
- 不在日志中记录敏感信息
- 安全的错误信息暴露
- 请求数据清理

## 实现步骤

### 步骤 1: 创建服务框架

1. 创建 `openai-service.ts` 基础结构
2. 实现配置读取
3. 添加基础错误处理

### 步骤 2: 实现核心 API 调用

1. 实现 `chatCompletion` 方法
2. 添加请求参数验证
3. 实现响应解析
4. 添加令牌计数

### 步骤 3: 实现流式响应

1. 实现 `streamChatCompletion` 方法
2. 添加流式数据处理
3. 实现取消机制
4. 添加性能监控

### 步骤 4: 集成到应用

1. 更新 IPC 处理器
2. 集成到设置系统
3. 添加连接测试
4. 更新类型定义

### 步骤 5: 测试和优化

1. 单元测试覆盖
2. 集成测试
3. 性能测试
4. 错误场景测试

## 验收标准

### 功能验收

- [ ] 可以成功调用 OpenAI API
- [ ] 支持流式和非流式调用
- [ ] 错误处理完整
- [ ] 令牌计数准确
- [ ] 设置集成正常
- [ ] 连接测试可用

### 性能验收

- [ ] API 调用响应时间 < 5秒
- [ ] 流式响应延迟 < 100ms
- [ ] 内存使用合理
- [ ] 网络错误恢复正常

### 安全验收

- [ ] API 密钥安全存储
- [ ] 无敏感信息泄露
- [ ] 请求数据清理
- [ ] 错误信息适当暴露

## 相关文件

- `src/main/ipc-handlers.ts` - 现有 IPC 处理器
- `src/renderer/src/stores/settings-store.ts` - 设置存储
- `architecture/service/ARCH-service-doc-engine-v1.md` - 服务架构

## 配置示例

```json
{
  "providers": {
    "openai": {
      "id": "openai",
      "name": "OpenAI",
      "api_key": "sk-...",
      "base_url": "https://api.openai.com/v1",
      "model": "gpt-4",
      "temperature": 0.7,
      "max_tokens": 2000
    }
  }
}
```

## 错误处理策略

1. **网络错误**: 最多重试 3 次，指数退避
2. **API 错误**: 根据错误代码分类处理
3. **令牌限制**: 提示用户升级或减少输入
4. **超时**: 默认 30 秒超时，可配置

## 测试计划

1. **单元测试**: 服务逻辑测试
2. **集成测试**: 与设置系统集成测试
3. **网络测试**: 模拟网络错误测试
4. **性能测试**: 并发调用测试

## 后续任务

- TASK-AI-002: DeepSeek 集成
- TASK-AI-003: Ollama 本地集成
- TASK-AI-004: 多提供商切换

---

_创建时间: 2026-01-14_
_负责人: @team-backend_
