# TASK-AI-006: AI对话深度增强 - 设问式响应与引导

## 基本信息

- **ID**: TASK-AI-006
- **标题**: AI对话深度增强 - 设问式响应与引导
- **优先级**: 高
- **预计时间**: 4-5 天
- **依赖**: TASK-AI-001（OpenAI集成）、TASK-AI-005（对话到项目树转换）
- **所属阶段**: 阶段 2 - AI 对话引擎
- **里程碑**: MVP 版本

## 任务描述

增强AI对需求的分析广度和深度，实现设问式响应，能够引导用户下一步操作。AI的响应应该带有引导性问题，帮助用户完善需求结构。

## 功能需求

### 1. 设问式响应模式

- AI响应时主动提出引导性问题
- 根据对话上下文智能选择提问方向
- 支持多种引导模式：
  - 需求拆解引导："是否要我进一步拆解详细需求？"
  - 工期安排引导："是否需要完善工期安排？"
  - 技术方案引导："需要我推荐技术方案吗？"
  - 风险评估引导："需要分析项目风险吗？"

### 2. 上下文感知的引导策略

- 分析用户输入的类型（大纲、需求、问题等）
- 根据项目当前状态决定引导方向
- 记忆用户的偏好和选择
- 避免重复提问和过度引导

### 3. 交互式引导界面

- 在AI回复中显示可操作的引导按钮
- 用户可以直接点击"确认"让AI继续
- 支持用户输入其他文字来主导对话
- 显示引导路径和进度

### 4. 结构化需求分析

- 自动识别和整理需求大纲
- 将非结构化需求转换为结构化格式
- 识别需求中的关键要素：功能、非功能、约束等
- 生成需求分析报告

## 技术规格

### 引导策略配置

```typescript
interface GuidanceStrategy {
  id: string
  name: string
  description: string
  triggerConditions: GuidanceCondition[]
  questions: GuidanceQuestion[]
  followUpActions: GuidanceAction[]
}

interface GuidanceQuestion {
  id: string
  text: string
  type: 'confirmation' | 'choice' | 'input'
  options?: string[]
  defaultAction?: string
}

interface GuidanceCondition {
  type: 'message_pattern' | 'project_state' | 'user_history'
  pattern: string | RegExp
  minConfidence: number
}
```

### AI提示词增强

```typescript
interface EnhancedPromptConfig {
  basePrompt: string
  guidanceStrategies: GuidanceStrategy[]
  contextAnalysis: ContextAnalysisConfig
  responseFormat: ResponseFormatConfig
}

interface ResponseFormatConfig {
  includeGuidance: boolean
  guidancePosition: 'start' | 'end' | 'inline'
  actionButtons: boolean
  structuredOutput: boolean
}
```

## 实现步骤

### 步骤 1: 引导策略引擎

1. 设计引导策略的数据结构和规则引擎
2. 实现上下文分析服务
3. 创建引导策略配置管理
4. 添加策略测试和验证

### 步骤 2: AI提示词增强

1. 修改现有的AI提示词模板
2. 集成引导策略到提示词中
3. 实现响应解析和引导提取
4. 添加提示词版本管理

### 步骤 3: 交互界面实现

1. 在 `ChatPanel.svelte` 中添加引导按钮组件
2. 实现引导按钮的点击处理
3. 添加引导状态显示
4. 优化引导界面的用户体验

### 步骤 4: 结构化分析增强

1. 增强需求分析算法
2. 实现大纲自动整理功能
3. 添加需求要素识别
4. 集成到项目树转换流程

## 验收标准

### 功能验收

- [ ] AI回复中包含引导性问题
- [ ] 引导问题根据上下文智能选择
- [ ] 用户可以点击引导按钮继续对话
- [ ] 支持用户输入文字主导对话
- [ ] 能够自动整理需求大纲
- [ ] 识别需求中的关键要素

### 智能性验收

- [ ] 引导问题相关度高，不重复
- [ ] 能够根据项目进度调整引导方向
- [ ] 记忆用户偏好，个性化引导
- [ ] 引导时机恰当，不过度打扰

### 用户体验验收

- [ ] 引导界面直观易用
- [ ] 引导按钮响应及时
- [ ] 引导路径清晰可见
- [ ] 用户可以随时跳过引导

## 相关文件

- `src/renderer/src/stores/chat-store.ts` - 聊天状态管理
- `src/renderer/src/components/ChatPanel.svelte` - 聊天面板
- `src/renderer/src/lib/ai/guidance-engine.ts` - 引导引擎
- `src/renderer/src/lib/ai/prompt-templates.ts` - 提示词模板
- `src/renderer/src/lib/ai/context-analyzer.ts` - 上下文分析器

## 注意事项

1. 引导策略要适度，避免过度引导
2. 保持AI响应的自然性和连贯性
3. 引导按钮的设计要简洁明了
4. 考虑不同用户的使用习惯

## 测试计划

1. **功能测试**: 引导策略、交互界面、结构化分析
2. **智能测试**: 引导相关性、上下文感知、个性化
3. **性能测试**: 响应时间、内存使用
4. **用户测试**: 可用性测试，收集反馈

---

_创建时间: 2026-01-15_
_负责人: @team-ai_
_状态: 待开始_
