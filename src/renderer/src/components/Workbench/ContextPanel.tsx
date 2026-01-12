import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { IProjectNode } from '../../../../shared/types';
import { RequirementTree } from './RequirementTree';

interface IContextPanelProps {
  projectStructure: IProjectNode[];
}

export const ContextPanel: React.FC<IContextPanelProps> = ({ projectStructure }) => {
  const items: TabsProps['items'] = [
    {
      key: 'structure',
      label: 'Requirement Tree',
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
