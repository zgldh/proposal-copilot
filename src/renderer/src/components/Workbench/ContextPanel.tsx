import React from 'react';
import { Tabs, Button, Space, message } from 'antd';
import { FileWordOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { IProjectNode } from '../../../../shared/types';
import { RequirementTree } from './RequirementTree';

interface IContextPanelProps {
  projectStructure: IProjectNode[];
  projectPath: string;
}

export const ContextPanel: React.FC<IContextPanelProps> = ({ projectStructure, projectPath }) => {
  const handleExportWord = async () => {
    const result = await window.electronAPI.docgen.exportWord(projectPath);
    if (result.success) {
      message.success(`Word document exported to: ${result.data}`);
    } else {
      message.error(`Export failed: ${result.error}`);
    }
  };

  const handleExportExcel = async () => {
    const result = await window.electronAPI.docgen.exportExcel(projectPath);
    if (result.success) {
      message.success(`Excel document exported to: ${result.data}`);
    } else {
      message.error(`Export failed: ${result.error}`);
    }
  };

  const items: TabsProps['items'] = [
    {
      key: 'structure',
      label: (
        <Space>
          <span>Requirement Tree</span>
          <Button icon={<FileWordOutlined />} size="small" onClick={handleExportWord}>Export Word</Button>
          <Button icon={<FileExcelOutlined />} size="small" onClick={handleExportExcel}>Export Excel</Button>
        </Space>
      ),
      children: <RequirementTree nodes={projectStructure} />,
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
