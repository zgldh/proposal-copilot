import React from 'react';
import { Tabs, Button, Space, message } from 'antd';
import { FileWordOutlined, FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { IProjectNode } from '../../../../shared/types';
import { RequirementTree } from './RequirementTree';

interface IContextPanelProps {
  projectStructure: IProjectNode[];
  projectPath: string;
}

export const ContextPanel: React.FC<IContextPanelProps> = ({ projectStructure, projectPath }) => {
  const handleExportWord = async () => {
    const result = await window.electronAPI.docgen.exportToWord(projectPath);
    if (result.success) {
      message.success(`Word document exported to: ${result.data}`);
    } else {
      message.error(`Export failed: ${result.error}`);
    }
  };

  const handleExportExcel = async () => {
    const result = await window.electronAPI.docgen.exportToExcel(projectPath);
    if (result.success) {
      message.success(`Excel document exported to: ${result.data}`);
    } else {
      message.error(`Export failed: ${result.error}`);
    }
  };

  const handleSaveAsWord = async () => {
    const result = await window.electronAPI.docgen.saveAs(projectPath, 'word');
    if (result.success) {
      message.success(`Word document saved to: ${result.data}`);
    } else {
      message.error(`Save failed: ${result.error}`);
    }
  };

  const handleSaveAsExcel = async () => {
    const result = await window.electronAPI.docgen.saveAs(projectPath, 'excel');
    if (result.success) {
      message.success(`Excel document saved to: ${result.data}`);
    } else {
      message.error(`Save failed: ${result.error}`);
    }
  };

  const items: TabsProps['items'] = [
    {
      key: 'structure',
      label: 'Requirement Tree',
      children: (
        <div>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <Space>
              <Button icon={<FileWordOutlined />} onClick={handleExportWord}>Export Word</Button>
              <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>Export Excel</Button>
              <Button icon={<DownloadOutlined />} onClick={handleSaveAsWord}>Save As Word...</Button>
              <Button icon={<DownloadOutlined />} onClick={handleSaveAsExcel}>Save As Excel...</Button>
            </Space>
          </div>
          <RequirementTree nodes={projectStructure} />
        </div>
      ),
    },
    {
      key: 'preview',
      label: 'Live Preview',
      children: (
        <div style={{ padding: '16px', color: '#666' }}>
          <p>Document preview will appear here.</p>
        </div>
      ),
    },
  ];

  return (
    <Tabs defaultActiveKey="structure" items={items} style={{ height: '100%', padding: '0 16px' }} />
  );
};
