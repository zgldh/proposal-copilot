import { Workbook } from 'exceljs'
import type { Project, TreeNode } from './project-service'

export class ExcelGenerator {
  async generate(project: Project): Promise<Buffer> {
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet('Bill of Materials')

    sheet.columns = [
      { header: 'Level', key: 'level', width: 10 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Name', key: 'name', width: 40 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Specifications', key: 'specs', width: 50 }
    ]

    const rows = this.flatten(project.structure_tree)
    sheet.addRows(rows)

    // Basic styling
    sheet.getRow(1).font = { bold: true }

    return (await workbook.xlsx.writeBuffer()) as any as Buffer
  }

  private flatten(nodes: TreeNode[], depth = 0): any[] {
    let rows: any[] = []
    for (const node of nodes) {
      rows.push({
        level: depth + 1,
        type: node.type,
        name: '  '.repeat(depth) + node.name,
        quantity: node.quantity,
        specs: this.formatSpecs(node.specs)
      })
      if (node.children && node.children.length > 0) {
        rows = rows.concat(this.flatten(node.children, depth + 1))
      }
    }
    return rows
  }

  private formatSpecs(specs: Record<string, string>): string {
    if (!specs) return ''
    return Object.entries(specs)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ')
  }
}
