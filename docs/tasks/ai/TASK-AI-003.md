# TASK-AI-003: Ollama 本地集成

## 基本信息

- **ID**: TASK-AI-003
- **标题**: Ollama 本地集成
- **优先级**: 高
- **预计时间**: 2-3 天
- **依赖**: TASK-AI-001 (OpenAI 集成)
- **所属阶段**: 阶段 2 - AI 对话引擎
- **里程碑**: MVP 版本

## 任务描述

实现 Ollama 本地 LLM 服务的集成，支持用户在本地运行开源大模型，提供完全离线的 AI 对话能力。这对于数据敏感场景、网络受限环境或希望降低使用成本的用户至关重要。

## 功能需求

### 1. 本地服务检测

- 自动检测本地 Ollama 服务状态
- 服务健康检查
- 连接失败自动重试
- 离线状态指示

### 2. 模型列表获取

- 查询本地可用的 Ollama 模型
- 模型信息展示（名称、大小、能力）
- 模型下载状态监控
- 模型切换支持

### 3. 连接状态监控

- 实时监控 Ollama 服务状态
- 自动重连机制
- 网络变化检测
- 服务恢复通知

### 4. 离线模式支持

- 完整的离线工作流
- 本地模型缓存
- 离线错误处理
- 网络恢复同步

### 5. 性能优化

- 本地调用延迟优化
- 内存使用监控
- 并发请求处理
- 响应流式优化

## 技术规格

### 服务接口

```typescript
interface OllamaService {
  // 基础调用
  chatCompletion(messages: ChatMessage[], options?: OllamaOptions): Promise<ChatResponse>

  // 流式调用
  streamChatCompletion(messages: ChatMessage[], options?: OllamaOptions): AsyncIterable<string>

  // 服务管理
  checkServiceStatus(): Promise<ServiceStatus>
  getAvailableModels(): Promise<OllamaModel[]>
  pullModel(modelName: string): Promise<ModelPullProgress>

  // 工具函数
  estimateTokens(text: string): number
  getSystemInfo(): Promise<SystemInfo>
}

interface OllamaOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  topP?: number
  topK?: number
  repeatPenalty?: number
  numCtx?: number
}

interface ServiceStatus {
  running: boolean
  version?: string
  modelsAvailable: number
  lastCheck: Date
}

interface OllamaModel {
  name: string
  size: number
  digest: string
  modifiedAt: Date
  details?: ModelDetails
}

interface ModelDetails {
  parameterSize: string
  quantization: string
  family: string
  format: string
}

interface SystemInfo {
  totalMemory: number
  availableMemory: number
  cpuCores: number
  ollamaVersion: string
}
```

### 文件位置

- `src/main/services/ollama-service.ts` - Ollama 服务实现
- `src/main/services/llm-provider.ts` - 提供商抽象接口更新
- `src/main/services/local-service-detector.ts` - 本地服务检测器
- `src/main/ipc-handlers.ts` - IPC 处理器更新
- `src/preload/index.d.ts` - 类型定义更新

### API 端点配置

Ollama 本地服务配置：

- 默认 URL: `http://localhost:11434`
- API 版本: `v1` (兼容 OpenAI 格式)
- 认证方式: 无（本地服务）
- 默认模型: 用户本地安装的第一个模型

### 安全要求

- 本地服务访问控制
- 模型文件完整性验证
- 内存使用限制
- 错误信息适当暴露

## 实现步骤

### 步骤 1: 创建服务框架

1. 创建 `ollama-service.ts` 基础结构
2. 实现本地服务检测逻辑
3. 添加离线模式支持
4. 继承 LLM 提供商抽象接口

### 步骤 2: 实现服务管理

1. 实现服务状态检测和监控
2. 添加模型列表获取功能
3. 实现模型下载进度跟踪
4. 添加系统资源监控

### 步骤 3: 实现核心 API 调用

1. 实现 `chatCompletion` 方法
2. 适配 Ollama API 格式
3. 实现响应解析和标准化
4. 添加本地调用优化

### 步骤 4: 实现流式响应

1. 实现 `streamChatCompletion` 方法
2. 优化本地流式数据传输
3. 实现取消机制
4. 添加性能监控和限制

### 步骤 5: 集成到应用

1. 更新 LLM 提供商注册
2. 集成到设置系统
3. 添加服务状态指示器
4. 更新类型定义和 IPC 处理器

### 步骤 6: 测试和优化

1. 单元测试覆盖
2. 集成测试（含离线场景）
3. 性能测试和压力测试
4. 错误场景和恢复测试

## 验收标准

### 功能验收

- [ ] 可以检测本地 Ollama 服务状态
- [ ] 能够获取本地可用模型列表
- [ ] 支持本地模型调用（流式和非流式）
- [ ] 完整的离线模式支持
- [ ] 服务状态监控正常
- [ ] 模型下载进度跟踪

### 性能验收

- [ ] 本地调用响应时间 < 3秒
- [ ] 流式响应延迟 < 50ms
- [ ] 内存使用在合理范围内
- [ ] 服务检测快速准确

### 可靠性验收

- [ ] 网络断开后优雅降级
- [ ] 服务崩溃后自动恢复
- [ ] 模型切换无缝
- [ ] 错误处理完整

## 相关文件

- `src/main/services/openai-service.ts` - OpenAI 服务参考实现
- `src/main/services/deepseek-service.ts` - DeepSeek 服务参考实现
- `src/main/services/llm-provider.ts` - 提供商抽象接口
- `src/renderer/src/stores/settings-store.ts` - 设置存储

## 配置示例

```json
{
  "providers": {
    "ollama": {
      "id": "ollama",
      "name": "Ollama (本地)",
      "api_key": "",
      "base_url": "http://localhost:11434/v1",
      "model": "llama3.2:latest",
      "temperature": 0.7,
      "max_tokens": 2000,
      "local_only": true
    }
  }
}
```

## Ollama 特定特性

### 优势

1. **完全离线**: 不依赖外部网络，数据完全本地
2. **开源模型**: 支持多种开源 LLM 模型
3. **成本为零**: 无 API 调用费用
4. **数据隐私**: 所有数据留在用户本地
5. **自定义模型**: 支持用户自定义模型

### 限制

1. **硬件要求**: 需要足够的 RAM 和 CPU/GPU
2. **模型大小**: 大模型需要大量磁盘空间
3. **性能限制**: 相比云端服务可能较慢
4. **功能限制**: 某些高级功能可能不支持

## 错误处理策略

1. **服务未运行**: 清晰提示用户启动 Ollama
2. **模型未下载**: 提供模型下载指引
3. **内存不足**: 建议使用较小模型或增加内存
4. **连接失败**: 自动重试，提供手动配置选项
5. **响应超时**: 优化本地调用超时设置

## 安装和配置指引

### 用户需要执行的步骤：

1. 下载并安装 Ollama (https://ollama.com/)
2. 拉取所需模型：`ollama pull llama3.2`
3. 启动 Ollama 服务
4. 在应用中配置 Ollama 提供商

### 自动检测逻辑：

1. 检查 `localhost:11434` 是否可达
2. 验证 `/api/tags` 端点返回有效模型列表
3. 测试简单对话验证功能正常
4. 监控服务健康状态

## 测试计划

1. **单元测试**: 服务逻辑测试
2. **集成测试**: 与本地服务集成测试
3. **离线测试**: 完全离线场景测试
4. **性能测试**: 不同模型性能测试
5. **恢复测试**: 服务中断恢复测试
6. **兼容性测试**: 不同 Ollama 版本兼容性

## 后续优化

1. **模型管理界面**: 图形化模型下载和管理
2. **性能调优**: 根据硬件自动优化参数
3. **多实例支持**: 支持多个 Ollama 实例
4. **模型量化**: 自动选择合适量化版本

## 后续任务

- TASK-AI-004: 多提供商切换
- TASK-AI-005: 对话到项目树转换
- TASK-ADV-002: 高级模型管理

---

_创建时间: 2026-01-14_
_负责人: @team-backend_
