import React from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { IProjectNode } from '../../../../shared/types';

// MOCK DATA for visualization when project is empty
const MOCK_TREE: IProjectNode[] = [
  {
    id: 'sys-1',
    type: 'subsystem',
    name: 'Security System',
    quantity: 1,
    specs: {},
    children: [
      {
        id: 'dev-1',
        type: 'device',
        name: 'IP Camera 4K',
        quantity: 10,
        specs: { resolution: '4K', power: 'PoE' },
        children: []
      },
      {
        id: 'dev-2',
        type: 'device',
        name: 'NVR 32-Channel',
        quantity: 1,
        specs: { hdd: '4TB' },
        children: []
      }
    ]
  },
  {
    id: 'sys-2',
    type: 'subsystem',
    name: 'Network Infrastructure',
    quantity: 1,
    specs: {},
    children: [
      {
        id: 'dev-3',
        type: 'device',
        name: 'Core Switch',
        quantity: 2,
        specs: { ports: 48 },
        children: []
      }
    ]
  }
];

interface IRequirementTreeProps {
  nodes?: IProjectNode[];
}

/**
 * Maps the domain model (IProjectNode) to the UI model (AntD DataNode).
 * Enforces strict typing.
 */
const mapProjectNodeToTreeNode = (node: IProjectNode): DataNode => ({
  key: node.id,
  title: `${node.name} [${node.quantity}]`,
  // Recursive mapping if children exist
  children: node.children && node.children.length > 0 
    ? node.children.map(mapProjectNodeToTreeNode) 
    : undefined
});

export const RequirementTree: React.FC<IRequirementTreeProps> = ({ nodes }) => {
  // Fallback to MOCK_TREE if the project has no nodes (for visual testing per Task 2026-003)
  const dataSource = (nodes && nodes.length > 0) ? nodes : MOCK_TREE;
  
  const treeData: DataNode[] = dataSource.map(mapProjectNodeToTreeNode);

  return (
    <Tree treeData={treeData} defaultExpandAll showLine />
  );
};
