import { Document, Packer, Paragraph, HeadingLevel } from 'docx'
import type { Project, TreeNode } from './project-service'

export class WordGenerator {
  async generate(project: Project): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: project.meta.name,
              heading: HeadingLevel.TITLE
            }),
            new Paragraph({
              text: `Version: ${project.meta.version}`,
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: 'Project Context',
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              text: project.context || 'No context provided.'
            }),
            new Paragraph({
              text: 'System Architecture',
              heading: HeadingLevel.HEADING_1
            }),
            ...this.generateTreeContent(project.structure_tree)
          ]
        }
      ]
    })

    return (await Packer.toBuffer(doc)) as unknown as Buffer
  }

  private generateTreeContent(nodes: TreeNode[], depth = 0): Paragraph[] {
    let paragraphs: Paragraph[] = []
    for (const node of nodes) {
      // Logic to display tree
      const text = `${node.name} (${node.type}) [Qty: ${node.quantity}]`

      const p = new Paragraph({
        text: text,
        bullet: {
          level: Math.min(depth, 8) // Max depth for bullets in Word
        }
      })
      paragraphs.push(p)

      // Specs
      if (node.specs && Object.keys(node.specs).length > 0) {
        const specsText = Object.entries(node.specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ')
        paragraphs.push(
          new Paragraph({
            text: `Specs: ${specsText}`,
            indent: { left: 720 * (depth + 1) } // Indent specs
          })
        )
      }

      if (node.children && node.children.length > 0) {
        paragraphs = paragraphs.concat(this.generateTreeContent(node.children, depth + 1))
      }
    }
    return paragraphs
  }
}
