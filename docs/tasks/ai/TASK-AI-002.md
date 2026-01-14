# TASK-AI-002: DeepSeek 集成

## 基本信息

- **ID**: TASK-AI-002
- **标题**: DeepSeek 集成
- **优先级**: 高
- **预计时间**: 1-2 天
- **依赖**: TASK-AI-001 (OpenAI 集成)
- **所属阶段**: 阶段 2 - AI 对话引擎
- **里程碑**: MVP 版本

## 任务描述

实现 DeepSeek API 的集成，作为第二个 LLM 提供商选项。DeepSeek 是国内领先的 AI 模型提供商，提供高质量的中文理解和生成能力，适合项目中的中文提案生成需求。

## 功能需求

### 1. API 适配器

- 适配 DeepSeek API 接口规范
- 支持最新 DeepSeek 模型
- 完整的请求参数映射
- 响应格式标准化

### 2. 模型参数配置

- 支持 DeepSeek 特定参数
- 温度、最大令牌数等基础参数
- 流式响应开关
- 模型版本选择

### 3. 响应格式处理

- DeepSeek 响应解析
- 错误消息标准化
- 令牌使用统计
- 流式数据块处理

### 4. 错误处理

- API 错误分类和处理
- 网络错误重试机制
- 配额限制处理
- 用户友好的错误消息

### 5. 设置集成

- 与现有设置系统集成
- API 密钥安全存储
- 连接测试功能
- 模型列表获取

## 技术规格

### 服务接口

```typescript
interface DeepSeekService {
  // 基础调用
  chatCompletion(messages: ChatMessage[], options?: DeepSeekOptions): Promise<ChatResponse>

  // 流式调用
  streamChatCompletion(messages: ChatMessage[], options?: DeepSeekOptions): AsyncIterable<string>

  // 工具函数
  testConnection(apiKey: string): Promise<boolean>
  getModels(apiKey: string): Promise<string[]>
  estimateTokens(text: string): number
}

interface DeepSeekOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
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

- `src/main/services/deepseek-service.ts` - DeepSeek 服务实现
- `src/main/services/llm-provider.ts` - 提供商抽象接口更新
- `src/main/ipc-handlers.ts` - IPC 处理器更新
- `src/preload/index.d.ts` - 类型定义更新

### API 端点配置

DeepSeek API 基础配置：

- 基础 URL: `https://api.deepseek.com`
- API 版本: `v1`
- 认证方式: Bearer Token
- 默认模型: `deepseek-chat`

### 安全要求

- API 密钥加密存储
- 不在日志中记录敏感信息
- 安全的错误信息暴露
- 请求数据清理

## 实现步骤

### 步骤 1: 创建服务框架

1. 创建 `deepseek-service.ts` 基础结构
2. 实现配置读取和验证
3. 添加基础错误处理
4. 继承 LLM 提供商抽象接口

### 步骤 2: 实现核心 API 调用

1. 实现 `chatCompletion` 方法
2. 添加 DeepSeek 特定参数映射
3. 实现响应解析和标准化
4. 添加令牌计数逻辑

### 步骤 3: 实现流式响应

1. 实现 `streamChatCompletion` 方法
2. 适配 DeepSeek 流式数据格式
3. 实现取消机制
4. 添加性能监控

### 步骤 4: 集成到应用

1. 更新 LLM 提供商注册
2. 集成到设置系统
3. 添加连接测试功能
4. 更新类型定义和 IPC 处理器

### 步骤 5: 测试和优化

1. 单元测试覆盖
2. 集成测试
3. 性能测试
4. 错误场景测试

## 验收标准

### 功能验收

- [ ] 可以成功调用 DeepSeek API
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

### 兼容性验收

- [ ] 与 OpenAI 接口兼容
- [ ] 支持现有聊天系统
- [ ] 配置迁移无缝
- [ ] 错误处理一致

## 相关文件

- `src/main/services/openai-service.ts` - OpenAI 服务参考实现
- `src/main/services/llm-provider.ts` - 提供商抽象接口
- `src/renderer/src/stores/settings-store.ts` - 设置存储
- `architecture/service/ARCH-service-doc-engine-v1.md` - 服务架构

## 配置示例

```json
{
  "providers": {
    "deepseek": {
      "id": "deepseek",
      "name": "DeepSeek",
      "api_key": "sk-...",
      "base_url": "https://api.deepseek.com/v1",
      "model": "deepseek-chat",
      "temperature": 0.7,
      "max_tokens": 2000
    }
  }
}
```

## DeepSeek 特定特性

### 优势

1. **中文优化**: 对中文理解和生成有更好的支持
2. **成本效益**: 相比 OpenAI 可能有更好的性价比
3. **国内访问**: 国内用户访问速度更快
4. **合规性**: 符合国内数据合规要求

### 限制

1. **上下文长度**: 注意模型的最大上下文长度
2. **功能支持**: 某些高级功能可能不如 OpenAI 完善
3. **文档完整性**: 官方文档可能不如 OpenAI 详细

## 错误处理策略

1. **网络错误**: 最多重试 3 次，指数退避
2. **API 错误**: 根据 DeepSeek 错误代码分类处理
3. **令牌限制**: 提示用户调整输入或升级套餐
4. **超时**: 默认 30 秒超时，可配置
5. **配额限制**: 清晰提示用户配额状态

## 测试计划

1. **单元测试**: 服务逻辑测试
2. **集成测试**: 与设置系统集成测试
3. **网络测试**: 模拟网络错误测试
4. **性能测试**: 并发调用测试
5. **兼容性测试**: 与现有功能兼容性测试

## 后续任务

- TASK-AI-003: Ollama 本地集成
- TASK-AI-004: 多提供商切换
- TASK-AI-005: 对话到项目树转换

---

_创建时间: 2026-01-14_
_负责人: @team-backend_
