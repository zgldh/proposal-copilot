# TASK-DOC-001: 参考文档解析

## 基本信息

- **ID**: TASK-DOC-001
- **标题**: 参考文档解析
- **优先级**: 中
- **预计时间**: 3-4 天
- **依赖**: TASK-CORE-001 (项目数据模型增强)
- **所属阶段**: 阶段 3 - 文档生成引擎
- **里程碑**: 文档生成版本

## 任务描述

实现参考文档解析功能，能够分析用户上传的 Word/PDF 文档，提取文档结构、样式和内容模式，为智能文档生成提供模板基础。这是文档生成引擎的第一步，也是实现"无代码模板"方法的关键。

## 功能需求

### 1. 文档格式支持

- **Microsoft Word (.docx)**: 完整解析支持
- **PDF (.pdf)**: 基本内容提取
- **纯文本 (.txt)**: 简单解析
- **Markdown (.md)**: 结构解析

### 2. 结构分析

- 标题层级识别（H1-H6）
- 段落结构分析
- 列表和表格识别
- 章节划分

### 3. 样式提取

- 字体样式（大小、颜色、加粗、斜体）
- 段落样式（对齐、缩进、行距）
- 页面样式（页边距、页眉页脚）
- 编号和项目符号

### 4. 内容模式识别

- 占位符模式识别
- 重复结构检测
- 数据表格识别
- 特殊内容标记

### 5. 模板元数据

- 文档属性提取
- 使用统计
- 质量评估
- 兼容性检查

## 技术规格

### 解析器接口

```typescript
interface DocumentParser {
  // 主要解析方法
  parseDocument(filePath: string): Promise<DocumentAnalysis>

  // 格式检测
  detectFormat(filePath: string): Promise<DocumentFormat>

  // 验证方法
  validateDocument(filePath: string): Promise<ValidationResult>

  // 工具方法
  extractText(filePath: string): Promise<string>
  extractStyles(filePath: string): Promise<StyleInfo[]>
  extractStructure(filePath: string): Promise<DocumentStructure>
}

// 文档分析结果
interface DocumentAnalysis {
  format: DocumentFormat
  metadata: DocumentMetadata
  structure: DocumentStructure
  styles: StyleInfo[]
  content: ContentAnalysis
  quality: QualityAssessment
  compatibility: CompatibilityInfo
}

// 文档结构
interface DocumentStructure {
  sections: DocumentSection[]
  headings: HeadingInfo[]
  lists: ListInfo[]
  tables: TableInfo[]
  images: ImageInfo[]
}

// 样式信息
interface StyleInfo {
  type: 'paragraph' | 'character' | 'table' | 'list'
  name: string
  properties: Record<string, any>
  usageCount: number
}
```

### 文件位置

- `src/main/services/document-parser.ts` - 主解析服务
- `src/main/services/docx-parser.ts` - Word 文档解析器
- `src/main/services/pdf-parser.ts` - PDF 文档解析器
- `src/main/services/template-extractor.ts` - 模板提取器
- `src/main/ipc-handlers.ts` - IPC 处理器更新
- `schemas/document-analysis-schema.json` - 分析结果 Schema

### 依赖库

需要添加的 npm 包：

- `mammoth` - .docx 文件解析
- `pdf-parse` - PDF 内容提取
- `officeparser` - Office 文档解析
- `jszip` - ZIP 文件处理（.docx 内部）

## 实现步骤

### 步骤 1: 创建解析框架

1. 设计解析器接口和类型定义
2. 创建基础解析服务框架
3. 实现格式检测功能
4. 添加错误处理框架

### 步骤 2: 实现 Word 文档解析

1. 集成 `mammoth` 库
2. 实现 .docx 文件结构解析
3. 提取样式信息
4. 分析文档结构

### 步骤 3: 实现 PDF 文档解析

1. 集成 `pdf-parse` 库
2. 实现 PDF 内容提取
3. 提取基本结构信息
4. 处理 PDF 特定问题

### 步骤 4: 实现模板提取

1. 设计模板识别算法
2. 实现占位符模式识别
3. 提取重复结构
4. 生成模板元数据

### 步骤 5: 集成和测试

1. 集成到文档生成流程
2. 添加单元测试
3. 进行集成测试
4. 性能优化

## 验收标准

### 功能验收

- [ ] 支持 .docx 文件完整解析
- [ ] 支持 .pdf 文件基本解析
- [ ] 正确提取文档结构
- [ ] 准确提取样式信息
- [ ] 识别常见占位符模式
- [ ] 生成有效的模板元数据
- [ ] 错误处理完善

### 准确率验收

- [ ] 标题识别准确率 > 95%
- [ ] 样式提取准确率 > 90%
- [ ] 结构分析准确率 > 85%
- [ ] 模板识别准确率 > 80%

### 性能验收

- [ ] 10页文档解析时间 < 2秒
- [ ] 50页文档解析时间 < 10秒
- [ ] 内存使用合理
- [ ] 支持并发解析

## 解析示例

### 输入文档结构

```
# 项目提案

## 1. 项目概述
本项目旨在为客户提供完整的安防监控解决方案。

## 2. 系统设计
### 2.1 前端设备
- 网络摄像机: {{camera_count}} 台
- NVR: {{nvr_count}} 台

### 2.2 后端平台
监控管理软件包含以下功能：
1. 实时预览
2. 录像回放
3. 报警管理
```

### 解析输出

```json
{
  "format": "docx",
  "structure": {
    "sections": [
      {
        "title": "项目提案",
        "level": 1,
        "content": []
      },
      {
        "title": "1. 项目概述",
        "level": 2,
        "content": ["本项目旨在为客户提供完整的安防监控解决方案。"]
      },
      {
        "title": "2. 系统设计",
        "level": 2,
        "subsections": [
          {
            "title": "2.1 前端设备",
            "level": 3,
            "lists": [
              {
                "items": ["网络摄像机: {{camera_count}} 台", "NVR: {{nvr_count}} 台"],
                "type": "bullet"
              }
            ]
          }
        ]
      }
    ]
  },
  "placeholders": [
    {
      "name": "camera_count",
      "type": "number",
      "context": "网络摄像机数量",
      "location": "2.1 前端设备"
    },
    {
      "name": "nvr_count",
      "type": "number",
      "context": "NVR数量",
      "location": "2.1 前端设备"
    }
  ]
}
```

## 错误处理策略

1. **格式不支持**: 提供清晰错误信息和格式建议
2. **解析失败**: 尝试基本文本提取，提供降级方案
3. **文件损坏**: 检测并提示用户重新上传
4. **内存不足**: 分块处理大型文档

## 相关文件

- `architecture/service/ARCH-service-doc-engine-v1.md` - 文档引擎架构
- `docs/tasks/doc/TASK-DOC-002.md` - 内容生成任务
- `src/renderer/src/components/FileUpload.svelte` - 文件上传组件

## 安全考虑

1. 文件大小限制（默认 50MB）
2. 文件类型白名单
3. 病毒扫描集成（可选）
4. 临时文件清理

## 测试计划

1. **单元测试**: 各解析器组件测试
2. **集成测试**: 完整解析流程测试
3. **格式测试**: 各种文档格式测试
4. **性能测试**: 大型文档解析测试
5. **错误测试**: 损坏文件处理测试

## 后续任务

- TASK-DOC-002: 内容生成
- TASK-DOC-003: 文档组装
- TASK-DOC-004: 导出优化

---

_创建时间: 2026-01-14_
_负责人: @team-backend_
