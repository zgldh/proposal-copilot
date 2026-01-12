import { promises as fs } from 'fs';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import ExcelJS from 'exceljs';
import { IProjectData, IProjectNode } from '../../../shared/types';

export class DocumentGenerator {
  private static flattenTree(nodes: IProjectNode[]): IProjectNode[] {
    const result: IProjectNode[] = [];

    function traverse(node: IProjectNode) {
      result.push(node);
      for (const child of node.children) {
        traverse(child);
      }
    }

    for (const node of nodes) {
      traverse(node);
    }

    return result;
  }

  static async generateWord(projectData: IProjectData, outputPath: string): Promise<void> {
    try {
      const flatNodes = this.flattenTree(projectData.structure_tree);

      const paragraphChildren = [
        new Paragraph({
          children: [
            new TextRun({
              text: projectData.meta.name,
              bold: true,
              size: 32
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Project Context',
              bold: true,
              size: 24
            })
          ],
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: projectData.context || 'No context provided.',
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Project Structure',
              bold: true,
              size: 24
            })
          ],
          spacing: { before: 400, after: 200 }
        })
      ];

      const tableRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Type', bold: true })] })],
              width: { size: 20, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Name', bold: true })] })],
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Specifications', bold: true })] })],
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Quantity', bold: true })] })],
              width: { size: 20, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ];

      for (const node of flatNodes) {
        const specsText = Object.entries(node.specs)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');

        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(node.type)],
                width: { size: 20, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph(node.name)],
                width: { size: 30, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph(specsText || '-')],
                width: { size: 30, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph(String(node.quantity))],
                width: { size: 20, type: WidthType.PERCENTAGE }
              })
            ]
          })
        );
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            ...paragraphChildren,
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(outputPath, buffer);
    } catch (error) {
      throw new Error(`Failed to generate Word document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async generateExcel(projectData: IProjectData, outputPath: string): Promise<void> {
    try {
      const flatNodes = this.flattenTree(projectData.structure_tree);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Project Structure');

      sheet.getRow(1).values = ['Type', 'Name', 'Specifications', 'Quantity'];
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      for (const node of flatNodes) {
        const specsText = Object.entries(node.specs)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ');

        sheet.addRow([node.type, node.name, specsText || '-', node.quantity]);
      }

      sheet.getColumn(1).width = 15;
      sheet.getColumn(2).width = 30;
      sheet.getColumn(3).width = 40;
      sheet.getColumn(4).width = 12;

      await workbook.xlsx.writeFile(outputPath);
    } catch (error) {
      throw new Error(`Failed to generate Excel document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
