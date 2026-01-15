# TASK-DOC-001: 文档风格学习

## 基本信息

- **ID**: TASK-DOC-001
- **标题**: 文档风格学习
- **优先级**: 中
- **预计时间**: 3-4 天
- **依赖**: TASK-CORE-001 (项目数据模型增强)
- **所属阶段**: 阶段 3 - 文档生成引擎
- **里程碑**: 文档生成版本

## 任务描述

实现文档风格学习功能，能够分析用户上传的参考文档（Word/PDF/Excel），提取文档结构、样式和格式模式，生成可复用的风格模板。这是文档生成引擎的第一步，让新生成的文档自动符合用户的专业格式要求，无需手动配置样式。

## 功能需求

### 1. 文档格式支持

- **Microsoft Word (.docx)**: 完整解析支持
- **PDF (.pdf)**: 结构和基本样式提取
- **Excel (.xlsx)**: 表格格式和数据分析
- **纯文本 (.txt)**: 简单解析
- **Markdown (.md)**: 结构解析

### 2. 文档结构分析

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

- 重复结构检测（如价格表、设备列表）
- 数据表格格式识别
- 特殊内容标记（图框、流程图）
- 章节模式识别

### 5. 风格模板生成

- 基于参考文档生成风格定义
- 可复用的样式模板存储
- 模板元数据和管理
- 推荐使用场景

## 技术规格

### 风格分析接口

```typescript
interface DocumentStyleAnalyzer {
  // 主要分析方法
  analyzeDocument(filePath: string): Promise<DocumentStyleAnalysis>

  // 格式检测
  detectFormat(filePath: string): Promise<DocumentFormat>

  // 验证方法
  validateDocument(filePath: string): Promise<ValidationResult>

  // 工具方法
  extractText(filePath: string): Promise<string>
  extractStyles(filePath: string): Promise<StyleInfo[]>
  extractStructure(filePath: string): Promise<DocumentStructure>
}

// 文档风格分析结果
interface DocumentStyleAnalysis {
  format: DocumentFormat
  metadata: DocumentMetadata

  // 核心风格定义
  structure: {
    headingLevels: HeadingStyle[]
    paragraphStyles: ParagraphStyle[]
    listStyles: ListStyle[]
    tableStyles: TableStyle[]
  }

  // 内容模式
  contentPatterns: {
    repeatedStructures: RepeatedStructure[]
    typicalSections: string[]
    dataTableFormats: DataTableFormat[]
  }

  // 风格元数据
  styleMetadata: {
    primaryFont: FontInfo
    primaryColor: string
    headingHierarchy: string[]
    pageLayout: PageLayout
  }
}

// 标题样式
interface HeadingStyle {
  level: number
  fontName: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  color: string
  spacingBefore: number
  spacingAfter: number
}

// 段落样式
interface ParagraphStyle {
  name: string
  fontName: string
  fontSize: number
  lineHeight: number
  indentation: { left: number; right: number; firstLine: number }
  alignment: 'left' | 'center' | 'right' | 'justify'
  usageFrequency: number
}

// 表格样式
interface TableStyle {
  hasHeaderRow: boolean
  borderStyle: BorderStyle
  alternateRowColor: boolean
  cellPadding: number
}

// 重复结构模式
interface RepeatedStructure {
  patternType: 'pricing_table' | 'equipment_list' | 'specification_grid'
  structureDescription: string
  sampleData: any[]
}
```

### 风格模板存储

```typescript
interface StyleTemplate {
  id: string
  name: string // 用户自定义名称
  sourceFile: string // 来源文件
  sourceType: 'docx' | 'pdf' | 'xlsx'
  extractedAt: string

  // 核心样式定义
  styles: {
    headings: HeadingStyle[]
    paragraphs: ParagraphStyle[]
    tables: TableStyle[]
    lists: ListStyle[]
  }

  // 应用指导
  applicationGuide: {
    suggestedUsage: string
    compatibleProjectTypes: string[]
    limitations: string[]
  }
}
```

### 文件位置

- `src/main/services/document-style-analyzer.ts` - 主分析服务
- `src/main/services/docx-style-extractor.ts` - Word 样式提取器
- `src/main/services/pdf-style-extractor.ts` - PDF 样式提取器
- `src/main/services/excel-style-extractor.ts` - Excel 样式提取器
- `src/main/services/style-template-manager.ts` - 模板管理器
- `src/main/ipc-handlers.ts` - IPC 处理器更新

### 依赖库

需要添加的 npm 包：

- `mammoth` - .docx 文档解析
- `pdf-parse` - PDF 内容提取
- `xlsx` 或 `exceljs` - Excel 解析
- `jszip` - ZIP 文件处理（.docx 内部）

## 实现步骤

### 步骤 1: 创建分析框架

1. 设计分析器接口和类型定义
2. 创建基础分析服务框架
3. 实现格式检测功能
4. 添加错误处理框架

### 步骤 2: 实现 Word 文档分析

1. 集成 `mammoth` 库
2. 实现 .docx 样式信息提取
3. 分析文档结构
4. 提取标题层级和段落样式

### 步骤 3: 实现 PDF 文档分析

1. 集成 `pdf-parse` 库
2. 实现基本结构提取
3. 识别标题和段落格式
4. 处理 PDF 特定问题

### 步骤 4: 实现 Excel 文档分析

1. 集成 Excel 解析库
2. 提取表格格式
3. 分析数据范围
4. 识别重复数据模式

### 步骤 5: 实现模板生成

1. 设计模板识别算法
2. 提取重复结构
3. 生成可复用的风格模板
4. 添加模板元数据

### 步骤 6: 集成和测试

1. 集成到文档生成流程
2. 添加单元测试
3. 进行集成测试
4. 性能优化

## 验收标准

### 功能验收

- [ ] 支持 .docx 文件完整分析
- [ ] 支持 .pdf 文档基本分析
- [ ] 支持 .xlsx 文档表格分析
- [ ] 正确提取文档结构
- [ ] 准确提取样式信息
- [ ] 识别重复结构模式
- [ ] 生成有效的风格模板
- [ ] 错误处理完善

### 准确率验收

- [ ] 标题识别准确率 > 95%
- [ ] 样式提取准确率 > 90%
- [ ] 结构分析准确率 > 85%
- [ ] 模式识别准确率 > 80%

### 性能验收

- [ ] 10页文档分析时间 < 2秒
- [ ] 50页文档分析时间 < 10秒
- [ ] 内存使用合理
- [ ] 支持并发分析

## 分析示例

### 输入文档

用户上传的参考提案文档（Word），包含：

```
标题：智能安防系统提案
1. 项目概述
   本项目为客户设计完整的安防监控解决方案...

2. 系统设计
   2.1 前端设备
      - 网络摄像机：海康威视 DS-2CD2T45D-I5
      - NVR：大华 DH-NVR4216

   2.2 后端平台
      监控管理软件包含以下功能：
      1. 实时预览
      2. 录像回放
```

### 分析输出

```json
{
  "format": "docx",
  "structure": {
    "headingLevels": [
      {
        "level": 1,
        "fontName": "微软雅黑",
        "fontSize": 22,
        "fontWeight": "bold",
        "color": "#000000"
      },
      {
        "level": 2,
        "fontName": "微软雅黑",
        "fontSize": 18,
        "fontWeight": "bold",
        "color": "#000000"
      },
      {
        "level": 3,
        "fontName": "微软雅黑",
        "fontSize": 16,
        "fontWeight": "bold",
        "color": "#333333"
      }
    ],
    "paragraphStyles": [
      {
        "name": "正文",
        "fontName": "宋体",
        "fontSize": 12,
        "lineHeight": 1.5,
        "alignment": "left"
      }
    ]
  },
  "contentPatterns": {
    "typicalSections": ["项目概述", "系统设计", "技术规格", "报价清单"],
    "repeatedStructures": [
      {
        "patternType": "equipment_list",
        "structureDescription": "设备列表包含型号和描述",
        "sampleFields": ["设备名称", "型号", "数量"]
      }
    ]
  }
}
```

### 应用示例

生成新文档时，自动应用分析出的风格：

```typescript
async function generateProposal(
  project: Project,
  referenceStyle: DocumentStyleAnalysis
): Promise<Document> {
  // 使用参考文档的标题层级
  const headings = project.structure_tree.map((node) => ({
    text: node.name,
    level: this.inferLevel(node),
    style: referenceStyle.structure.headingLevels[level]
  }))

  // 应用参考文档的段落样式
  const content = project.description.map((para) => ({
    text: para,
    style: referenceStyle.structure.paragraphStyles[0]
  }))

  return { headings, content }
}
```

## 错误处理策略

1. **格式不支持**: 提供清晰错误信息和格式建议
2. **分析失败**: 尝试基本文本提取，提供降级方案
3. **文件损坏**: 检测并提示用户重新上传
4. **样式提取不完整**: 标记为"部分成功"，提供详细说明
5. **内存不足**: 分块处理大型文档

## 相关文件

- `architecture/service/ARCH-service-doc-engine-v1.md` - 文档引擎架构
- `docs/tasks/doc/TASK-DOC-002.md` - 内容生成任务
- `src/renderer/src/components/ReferenceDocUpload.svelte` - 参考文档上传组件
- `src/renderer/src/components/StylePreview.svelte` - 风格预览组件

## 安全考虑

1. 文件大小限制（默认 50MB）
2. 文件类型白名单
3. 病毒扫描集成（可选）
4. 临时文件清理

## 测试计划

1. **单元测试**: 各分析器组件测试
2. **集成测试**: 完整分析流程测试
3. **格式测试**: 各种文档格式测试
4. **性能测试**: 大型文档分析测试
5. **错误测试**: 损坏文件处理测试
6. **应用测试**: 风格应用到新生成文档的准确性测试

## 后续任务

- TASK-DOC-002: 内容生成（应用风格模板）
- TASK-DOC-003: 文档组装
- TASK-DOC-004: 导出优化

---

_创建时间: 2026-01-14_
_更新时间: 2026-01-15_
_负责人: @team-backend_
