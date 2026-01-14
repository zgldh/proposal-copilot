# TASK-AI-005: 对话到项目树转换

## 基本信息

- **ID**: TASK-AI-005
- **标题**: 对话到项目树转换
- **优先级**: 高
- **预计时间**: 3-4 天
- **依赖**: TASK-AI-001 (OpenAI 集成)
- **所属阶段**: 阶段 2 - AI 对话引擎
- **里程碑**: MVP 版本

## 任务描述

实现核心的对话到项目树转换逻辑，将用户的自然语言描述转换为结构化的项目树节点。这是项目的核心 AI 功能，需要准确理解用户意图并更新项目数据模型。

## 功能需求

### 1. 自然语言解析

- 识别项目相关实体（系统、设备、规格）
- 提取数量信息
- 理解层级关系
- 处理模糊描述

### 2. 结构推断

- 推断节点类型（子系统、设备、功能）
- 确定父子关系
- 处理重复和冲突
- 维护结构一致性

### 3. 项目树更新

- 增量更新现有树结构
- 处理修改和删除请求
- 维护数据完整性
- 支持撤销/重做

### 4. 上下文理解

- 结合对话历史
- 理解指代关系
- 维护会话状态
- 处理多轮对话

### 5. 确认和澄清

- 自动检测模糊描述
- 生成澄清问题
- 处理用户确认
- 错误恢复机制

## 技术规格

### 转换引擎接口

```typescript
interface ConversationToTreeEngine {
  // 主要转换方法
  processMessage(message: string, context: ConversionContext): Promise<ConversionResult>

  // 工具方法
  extractEntities(text: string): Promise<Entity[]>
  inferStructure(entities: Entity[]): Promise<TreeNode[]>
  mergeWithExisting(newNodes: TreeNode[], existingTree: TreeNode[]): Promise<TreeNode[]>

  // 确认处理
  needsClarification(result: ConversionResult): boolean
  generateClarificationQuestions(result: ConversionResult): string[]
}

interface ConversionContext {
  projectTree: TreeNode[]
  conversationHistory: ChatMessage[]
  projectContext: string
  userPreferences: UserPreferences
}

interface ConversionResult {
  success: boolean
  nodes: TreeNode[]
  operations: TreeOperation[]
  confidence: number
  needsClarification: boolean
  clarificationQuestions?: string[]
  error?: string
}

interface TreeOperation {
  type: 'add' | 'update' | 'delete' | 'move'
  nodeId: string
  data: any
  parentId?: string | null
}
```

### 文件位置

- `src/main/services/conversion-engine.ts` - 转换引擎主逻辑
- `src/main/services/entity-extractor.ts` - 实体提取器
- `src/main/services/structure-inferer.ts` - 结构推断器
- `src/main/services/tree-merger.ts` - 树合并器
- `src/main/ipc-handlers.ts` - IPC 处理器更新

### AI 提示设计

需要设计专门的系统提示来指导 LLM 进行转换：

```typescript
const SYSTEM_PROMPT = `
你是一个项目结构转换专家。你的任务是将用户的自然语言描述转换为结构化的项目树节点。

项目树节点类型：
1. subsystem (子系统) - 主要功能模块
2. device (设备) - 具体硬件设备
3. feature (功能) - 软件功能或特性

转换规则：
1. 识别实体和数量
2. 推断节点类型
3. 确定层级关系
4. 提取规格参数

输出格式必须是有效的 JSON 数组，包含 TreeNode 对象。
`
```

## 实现步骤

### 步骤 1: 创建转换引擎框架

1. 创建基础接口和类型定义
2. 实现上下文管理
3. 添加错误处理框架

### 步骤 2: 实现实体提取

1. 使用 LLM 进行实体识别
2. 实现数量提取逻辑
3. 添加规格参数解析
4. 实现实体验证

### 步骤 3: 实现结构推断

1. 设计结构推断算法
2. 实现类型推断逻辑
3. 添加关系推断
4. 实现冲突检测

### 步骤 4: 实现树合并

1. 创建树合并算法
2. 实现增量更新逻辑
3. 添加数据完整性检查
4. 实现操作记录

### 步骤 5: 集成和测试

1. 集成到聊天系统
2. 添加单元测试
3. 进行集成测试
4. 性能优化

## 验收标准

### 功能验收

- [ ] 能够正确解析简单描述（"添加10个摄像头"）
- [ ] 能够处理复杂描述（"在安防子系统下添加网络摄像机和NVR"）
- [ ] 能够推断正确的节点类型
- [ ] 能够维护层级关系
- [ ] 能够处理修改请求
- [ ] 能够检测模糊描述并提问
- [ ] 支持多轮对话上下文

### 准确率验收

- [ ] 简单场景准确率 > 95%
- [ ] 复杂场景准确率 > 85%
- [ ] 实体识别准确率 > 90%
- [ ] 关系推断准确率 > 85%

### 性能验收

- [ ] 转换响应时间 < 3秒
- [ ] 支持并发处理
- [ ] 内存使用合理
- [ ] 错误恢复快速

## 测试用例示例

### 测试 1: 简单添加

**输入**: "添加5个网络摄像机"
**预期输出**:

- 1个 device 节点
- 类型: device
- 名称: "网络摄像机"
- 数量: 5

### 测试 2: 复杂结构

**输入**: "创建一个安防监控系统，包含10个高清摄像机、1台NVR和监控软件"
**预期输出**:

- 1个 subsystem 节点: "安防监控系统"
  - 3个 device 子节点: "高清摄像机" (数量: 10), "NVR" (数量: 1)
  - 1个 feature 子节点: "监控软件"

### 测试 3: 修改操作

**输入**: "将摄像机数量改为15个"
**预期输出**:

- 更新现有"高清摄像机"节点的数量为15

## 错误处理

1. **解析失败**: 返回错误并提示用户重新描述
2. **冲突检测**: 提示用户确认或提供更多信息
3. **API 错误**: 优雅降级，提供手动编辑选项
4. **数据不一致**: 自动修复或提示用户检查

## 相关文件

- `src/renderer/src/stores/project-store.ts` - 项目状态管理
- `architecture/domain/ARCH-domain-project-structure-v1.md` - 数据模型
- `docs/tasks/ui/TASK-UI-001.md` - 树可视化组件

## 后续优化

1. 机器学习模型训练
2. 用户反馈学习
3. 领域特定优化
4. 多语言支持

---

_创建时间: 2026-01-14_
_负责人: @team-ai_
