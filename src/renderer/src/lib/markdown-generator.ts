import type { Project, TreeNode } from './types'

export function generateProjectMarkdown(project: Project): string {
  let md = `# ${project.meta.name}\n\n`
  md += `> 创建时间: ${new Date(project.meta.create_time).toLocaleString('zh-CN')}\n\n`
  
  if (project.context && project.context.trim()) {
    md += `## 项目背景\n\n${project.context}\n\n`
  }
  
  if (project.structure_tree.length > 0) {
    md += `## 系统结构\n\n`
    project.structure_tree.forEach(subsystem => {
      md += `### ${subsystem.name}\n`
      subsystem.children.forEach(device => {
        md += `- **${device.name}** (数量: ${device.quantity})\n`
        const specs = Object.entries(device.specs)
          .filter(([_, v]) => v && v.toString().trim())
          .map(([k, v]) => `${k}: ${v}`)
        if (specs.length > 0) {
          md += `  - ${specs.join(', ')}\n`
        }
      })
      md += '\n'
    })
  }
  
  return md
}
