# TASK-CORE-001: 项目数据模型增强

## 基本信息

- **ID**: TASK-CORE-001
- **标题**: 项目数据模型增强
- **优先级**: 高
- **预计时间**: 2-3 天
- **依赖**: 无
- **所属阶段**: 阶段 1 - 核心基础设施
- **里程碑**: MVP 版本

## 任务描述

增强现有的项目数据模型，添加数据验证、版本迁移、完整性检查和备份恢复机制。确保项目数据的可靠性和稳定性，为后续功能开发奠定坚实基础。

## 功能需求

### 1. 数据验证

- JSON Schema 验证
- 类型检查
- 必填字段验证
- 数据范围验证
- 自定义验证规则

### 2. 版本迁移

- 版本检测和升级
- 向后兼容性
- 迁移脚本管理
- 迁移回滚支持

### 3. 数据完整性

- 引用完整性检查
- 循环引用检测
- 数据一致性验证
- 自动修复机制

### 4. 备份和恢复

- 自动备份策略
- 手动备份支持
- 恢复点管理
- 差异备份优化

### 5. 导入/导出

- 标准格式导出
- 第三方格式导入
- 数据转换工具
- 批量处理支持

## 技术规格

### 数据模型增强

```typescript
// 增强的 Project 接口
interface EnhancedProject extends Project {
  // 元数据增强
  meta: {
    name: string
    create_time: string
    version: string
    last_modified: string
    schema_version: string
    checksum: string
  }

  // 验证状态
  validation?: {
    valid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
    last_validated: string
  }

  // 备份信息
  backups?: BackupInfo[]
}

// 验证错误类型
interface ValidationError {
  path: string
  message: string
  code: string
  severity: 'error' | 'warning' | 'info'
  fix?: string
}

// 备份信息
interface BackupInfo {
  id: string
  timestamp: string
  path: string
  size: number
  checksum: string
  description?: string
}
```

### JSON Schema 定义

创建 `project-schema.json` 文件定义数据验证规则：

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema",
  "title": "Proposal-Copilot Project Schema",
  "version": "1.0.0",
  "type": "object",
  "required": ["meta", "structure_tree"],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["name", "create_time", "version"],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100
        },
        "create_time": {
          "type": "string",
          "format": "date-time"
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        }
      }
    },
    "structure_tree": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/TreeNode"
      }
    }
  },
  "definitions": {
    "TreeNode": {
      "type": "object",
      "required": ["id", "type", "name"],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "type": {
          "type": "string",
          "enum": ["subsystem", "device", "feature"]
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 50
        },
        "quantity": {
          "type": "number",
          "minimum": 1,
          "maximum": 9999
        }
      }
    }
  }
}
```

### 文件位置

- `src/main/services/project-validator.ts` - 数据验证服务
- `src/main/services/migration-service.ts` - 版本迁移服务
- `src/main/services/backup-service.ts` - 备份恢复服务
- `schemas/project-schema.json` - JSON Schema 定义
- `migrations/` - 迁移脚本目录
- `src/renderer/src/stores/project-store.ts` - 项目存储更新

## 实现步骤

### 步骤 1: 实现数据验证

1. 创建 JSON Schema 定义文件
2. 实现 `project-validator.ts` 服务
3. 集成到项目加载/保存流程
4. 添加验证错误处理

### 步骤 2: 实现版本迁移

1. 设计迁移系统架构
2. 创建迁移脚本模板
3. 实现 `migration-service.ts`
4. 添加版本检测和自动升级

### 步骤 3: 实现备份恢复

1. 设计备份策略（时间点、差异备份）
2. 实现 `backup-service.ts`
3. 添加自动备份调度
4. 实现恢复流程

### 步骤 4: 集成和测试

1. 更新 `project-store.ts` 集成新功能
2. 添加单元测试
3. 进行集成测试
4. 性能测试和优化

## 验收标准

### 功能验收

- [ ] JSON Schema 验证正常工作
- [ ] 版本迁移支持至少 3 个版本
- [ ] 自动备份按策略执行
- [ ] 数据恢复功能完整
- [ ] 导入/导出功能正常
- [ ] 错误处理完善

### 数据完整性验收

- [ ] 无效数据被正确拒绝
- [ ] 迁移过程数据不丢失
- [ ] 备份数据可完整恢复
- [ ] 引用完整性保持

### 性能验收

- [ ] 验证时间 < 100ms（中等项目）
- [ ] 迁移时间 < 1秒
- [ ] 备份创建时间 < 500ms
- [ ] 内存使用合理

## 迁移示例

### 从 v1.0.0 迁移到 v1.1.0

```typescript
// migrations/v1.0.0_to_v1.1.0.ts
export function migrateV1_0_0_to_V1_1_0(project: any): any {
  // 添加新字段
  if (!project.meta.schema_version) {
    project.meta.schema_version = '1.1.0'
    project.meta.last_modified = new Date().toISOString()
  }

  // 数据转换
  if (project.structure_tree) {
    project.structure_tree = addDefaultQuantities(project.structure_tree)
  }

  return project
}

function addDefaultQuantities(nodes: any[]): any[] {
  return nodes.map((node) => {
    if (node.type === 'device' && !node.quantity) {
      node.quantity = 1
    }
    if (node.children) {
      node.children = addDefaultQuantities(node.children)
    }
    return node
  })
}
```

## 错误处理策略

1. **验证错误**: 提供详细错误信息和修复建议
2. **迁移失败**: 保留原始文件，提供手动迁移选项
3. **备份失败**: 记录错误，继续主流程
4. **恢复失败**: 提供多个恢复点选择

## 相关文件

- `architecture/domain/ARCH-domain-project-structure-v1.md` - 数据模型架构
- `src/main/ipc-handlers.ts` - 项目相关 IPC 处理器
- `package.json` - 可能的依赖添加（ajv 用于 JSON Schema 验证）

## 依赖管理

需要添加的 npm 包：

- `ajv` - JSON Schema 验证
- `ajv-formats` - 格式验证支持
- `uuid` - UUID 生成和验证

## 测试计划

1. **单元测试**: 验证、迁移、备份服务测试
2. **集成测试**: 完整工作流测试
3. **数据测试**: 各种数据场景测试
4. **性能测试**: 大数据量测试

---

_创建时间: 2026-01-14_
_负责人: @team-backend_
