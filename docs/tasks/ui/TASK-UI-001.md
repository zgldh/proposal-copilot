# TASK-UI-001: 项目树可视化组件

## 基本信息

- **ID**: TASK-UI-001
- **标题**: 项目树可视化组件
- **优先级**: 高
- **预计时间**: 2-3 天
- **依赖**: 无
- **所属阶段**: 阶段 1 - 核心基础设施
- **里程碑**: MVP 版本

## 任务描述

实现一个交互式的项目树可视化组件，用于显示和操作 `project.json` 中的递归树结构。该组件应支持完整的 CRUD 操作，并提供直观的用户界面来管理项目结构。

## 功能需求

### 1. 树形结构显示

- 递归显示项目树的所有层级
- 支持展开/折叠节点
- 节点类型视觉区分（子系统、设备、功能）
- 缩进表示层级关系
- 节点数量显示

### 2. CRUD 操作

- **添加节点**: 在选定位置添加新节点
- **编辑节点**: 修改节点名称、类型、规格、数量
- **删除节点**: 删除节点及其子节点
- **移动节点**: 拖拽重新排序，改变父子关系

### 3. 交互功能

- 节点选择和高亮
- 右键上下文菜单
- 键盘导航（上下箭头、回车、删除）
- 批量选择操作
- 搜索和过滤

### 4. 视觉设计

- 清晰的层级指示
- 节点状态反馈（选中、悬停、活动）
- 类型图标系统
- 响应式布局
- 动画过渡效果

## 技术规格

### 组件结构

```typescript
interface TreeNodeComponentProps {
  node: TreeNode
  depth: number
  onSelect: (nodeId: string) => void
  onAdd: (parentId: string | null, type: TreeNodeType) => void
  onEdit: (nodeId: string, updates: Partial<TreeNode>) => void
  onDelete: (nodeId: string) => void
  onMove: (sourceId: string, targetId: string | null) => void
}

interface TreeNode {
  id: string
  type: 'subsystem' | 'device' | 'feature'
  name: string
  specs: Record<string, string>
  quantity: number
  children: TreeNode[]
}
```

### 文件位置

- `src/renderer/src/components/TreeView.svelte` - 主组件
- `src/renderer/src/components/TreeNode.svelte` - 节点组件
- `src/renderer/src/components/TreeContextMenu.svelte` - 上下文菜单
- `src/renderer/src/stores/tree-store.ts` - 树状态管理

### 样式要求

- 使用 CSS 变量保持主题一致性
- 支持深色/浅色主题
- 响应式设计
- 可访问性支持

## 实现步骤

### 步骤 1: 创建基础组件结构

1. 创建 `TreeView.svelte` 组件框架
2. 实现递归渲染逻辑
3. 添加基础样式

### 步骤 2: 实现 CRUD 操作

1. 集成 `projectStore` 操作方法
2. 实现节点添加逻辑
3. 实现节点编辑对话框
4. 实现删除确认机制

### 步骤 3: 添加交互功能

1. 实现拖拽排序（使用 HTML5 Drag & Drop）
2. 添加上下文菜单
3. 实现键盘导航
4. 添加搜索功能

### 步骤 4: 优化和测试

1. 性能优化（虚拟滚动）
2. 添加单元测试
3. 集成测试
4. 用户测试反馈

## 验收标准

### 功能验收

- [ ] 能够正确显示项目树的所有层级
- [ ] 支持展开/折叠所有节点
- [ ] 可以通过界面添加新节点
- [ ] 可以编辑节点属性
- [ ] 可以删除节点
- [ ] 支持拖拽重新排序
- [ ] 右键菜单正常工作
- [ ] 键盘导航可用

### 性能验收

- [ ] 加载 1000 个节点时响应时间 < 500ms
- [ ] 内存使用合理
- [ ] 动画流畅（60fps）

### 用户体验验收

- [ ] 界面直观易用
- [ ] 错误提示清晰
- [ ] 操作反馈及时
- [ ] 符合无障碍标准

## 相关文件

- `src/renderer/src/stores/project-store.ts` - 项目状态管理
- `src/renderer/src/lib/types.ts` - 类型定义
- `architecture/domain/ARCH-domain-project-structure-v1.md` - 数据模型架构

## 注意事项

1. 保持与现有 `projectStore` 的兼容性
2. 考虑大型项目的性能优化
3. 确保 undo/redo 支持
4. 提供良好的错误处理

## 测试计划

1. **单元测试**: 组件逻辑测试
2. **集成测试**: 与 projectStore 集成测试
3. **性能测试**: 大数据量测试
4. **用户测试**: 可用性测试

---

_创建时间: 2026-01-14_
_负责人: @team-frontend_
