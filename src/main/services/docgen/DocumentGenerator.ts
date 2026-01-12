import { promises as fs } from 'fs';
import * as path from 'path';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import ExcelJS from 'exceljs';
import { IProjectData, IProjectNode } from '../../../shared/types';

export interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

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

  static async exportToWord(projectPath: string, outputPath?: string): Promise<ExportResult> {
    try {
      const projectData = JSON.parse(await fs.readFile(path.join(projectPath, 'project.json'), 'utf-8')) as IProjectData;
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
          text: `Version: ${projectData.meta.version} | Created: ${new Date(projectData.meta.create_time).toLocaleDateString()}`,
          spacing: { after: 200 }
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
      const fileName = `${projectData.meta.name.replace(/\s+/g, '_')}_export.docx`;
      const savePath = outputPath || path.join(projectPath, fileName);
      await fs.writeFile(savePath, buffer);

      return { success: true, filePath: savePath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async exportToExcel(projectPath: string, outputPath?: string): Promise<ExportResult> {
    try {
      const projectData = JSON.parse(await fs.readFile(path.join(projectPath, 'project.json'), 'utf-8')) as IProjectData;
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

      const fileName = `${projectData.meta.name.replace(/\s+/g, '_')}_export.xlsx`;
      const savePath = outputPath || path.join(projectPath, fileName);
      await workbook.xlsx.writeFile(savePath);

      return { success: true, filePath: savePath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
