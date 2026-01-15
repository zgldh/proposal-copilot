# TASK-UI-002: UI/UX 增强 - 流式输出、搜索修复、布局优化

## 基本信息

- **ID**: TASK-UI-002
- **标题**: UI/UX 增强 - 流式输出、搜索修复、布局优化
- **优先级**: 高
- **预计时间**: 3-4 天
- **依赖**: TASK-UI-001（项目树组件）、TASK-AI-005（对话到项目树转换）
- **所属阶段**: 阶段 2 - AI 对话引擎
- **里程碑**: MVP 版本

## 任务描述

增强用户界面的交互体验，修复现有问题，优化布局，实现流式输出功能，让用户感受到AI正在思考而不是干等着。

## 功能需求

### 1. 流式输出功能

- AI回复时显示打字机效果，逐字显示
- 显示"正在思考..."状态指示器
- 支持中途停止生成
- 保持消息历史滚动位置
- 优化大段文本的显示性能

### 2. 搜索功能修复

- 修复搜索条目前不起作用的问题
- 实现实时搜索过滤
- 支持模糊搜索和关键词高亮
- 搜索范围包括：项目树节点、对话历史、文档内容
- 添加搜索历史记录

### 3. 布局优化

- 将"Add Root Node"按钮移动到搜索条左边
- 优化按钮组布局，提高操作效率
- 调整面板分割比例，优化工作区空间利用
- 改进响应式设计，适应不同窗口大小

### 4. 交互反馈增强

- 添加操作成功/失败的即时反馈
- 实现加载状态指示器
- 优化动画过渡效果
- 改进错误提示的友好性

## 技术规格

### 流式输出实现

```typescript
interface StreamingMessage {
  id: string
  content: string
  isComplete: boolean
  isStreaming: boolean
  streamToken?: string
}

// 流式输出状态管理
interface StreamingState {
  currentMessageId: string | null
  isStreaming: boolean
  abortController: AbortController | null
  buffer: string[]
}
```

### 搜索功能实现

```typescript
interface SearchConfig {
  query: string
  scope: 'tree' | 'chat' | 'all'
  caseSensitive: boolean
  fuzzy: boolean
}

interface SearchResult {
  id: string
  type: 'tree_node' | 'message' | 'document'
  content: string
  highlights: { start: number; end: number }[]
  relevance: number
}
```

### 布局调整

- 移动"Add Root Node"按钮到搜索条左侧
- 重新组织工具栏按钮分组
- 优化面板分割器的最小/最大尺寸限制
- 添加布局状态持久化

## 实现步骤

### 步骤 1: 流式输出实现

1. 修改 `chat-store.ts` 支持流式响应
2. 在 `ChatPanel.svelte` 中实现打字机效果组件
3. 添加流式输出控制按钮（停止、复制等）
4. 优化消息列表的滚动行为

### 步骤 2: 搜索功能修复

1. 分析当前搜索功能的问题原因
2. 实现统一的搜索服务
3. 在 `TreeView.svelte` 和 `ChatPanel.svelte` 中集成搜索
4. 添加搜索结果显示和导航

### 步骤 3: 布局优化

1. 修改 `Workbench.svelte` 的工具栏布局
2. 调整按钮位置和分组
3. 优化面板分割逻辑
4. 添加布局配置持久化

### 步骤 4: 交互反馈增强

1. 添加全局 toast 通知系统
2. 实现加载状态指示器
3. 优化操作反馈动画
4. 改进错误处理界面

## 验收标准

### 功能验收

- [ ] AI回复时显示流式输出效果
- [ ] 可以中途停止AI生成
- [ ] 搜索功能正常工作，能过滤项目树和对话
- [ ] "Add Root Node"按钮位于搜索条左侧
- [ ] 操作有明确的成功/失败反馈
- [ ] 布局调整适应不同窗口大小

### 性能验收

- [ ] 流式输出延迟 < 100ms
- [ ] 搜索响应时间 < 200ms（1000个节点内）
- [ ] 内存使用合理，无内存泄漏
- [ ] 动画流畅（60fps）

### 用户体验验收

- [ ] 界面直观，操作流程自然
- [ ] 错误提示清晰易懂
- [ ] 加载状态明确可见
- [ ] 符合无障碍标准

## 相关文件

- `src/renderer/src/components/ChatPanel.svelte` - 聊天面板
- `src/renderer/src/components/Workbench.svelte` - 工作台主界面
- `src/renderer/src/components/TreeView.svelte` - 项目树组件
- `src/renderer/src/stores/chat-store.ts` - 聊天状态管理
- `src/renderer/src/stores/tree-store.ts` - 树状态管理
- `src/renderer/src/components/ToastContainer.svelte` - 通知组件

## 注意事项

1. 流式输出需要与AI API的流式响应配合
2. 搜索功能要考虑性能，支持大型项目
3. 布局调整要保持向后兼容
4. 交互反馈要适度，避免过度打扰

## 测试计划

1. **功能测试**: 流式输出、搜索、布局调整
2. **性能测试**: 大数据量下的搜索性能
3. **兼容性测试**: 不同窗口大小和分辨率
4. **用户测试**: 可用性测试，收集反馈

---

_创建时间: 2026-01-15_
_负责人: @team-frontend_
_状态: 待开始_
