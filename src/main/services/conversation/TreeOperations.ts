import { IProjectData, IProjectNode } from '../../../shared/types';
import { IOperation } from './types';
import { v4 as uuidv4 } from 'uuid';

export class TreeOperations {
  static applyOperations(projectData: IProjectData, operations: IOperation[]): IProjectData {
    let updatedData = { ...projectData };
    for (const op of operations) {
      updatedData = this.applyOperation(updatedData, op);
    }
    return updatedData;
  }

  private static applyOperation(projectData: IProjectData, operation: IOperation): IProjectData {
    switch (operation.action) {
      case 'add_node':
        return this.addNode(projectData, operation);
      case 'update_node':
        return this.updateNode(projectData, operation);
      case 'delete_node':
        return this.deleteNode(projectData, operation);
      case 'update_context':
        return this.updateContext(projectData, operation);
      default:
        return projectData;
    }
  }

  private static addNode(projectData: IProjectData, operation: IOperation): IProjectData {
    if (!operation.node) return projectData;

    const newNode: IProjectNode = {
      id: uuidv4(),
      type: operation.node.type,
      name: operation.node.name,
      quantity: operation.node.quantity,
      specs: operation.node.specs,
      children: [],
    };

    if (!operation.path || operation.path === '') {
      return {
        ...projectData,
        structure_tree: [...projectData.structure_tree, newNode],
      };
    }

    return {
      ...projectData,
      structure_tree: this.addNodeToTree(projectData.structure_tree, operation.path, newNode),
    };
  }

  private static addNodeToTree(nodes: IProjectNode[], parentId: string, newNode: IProjectNode): IProjectNode[] {
    return nodes.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...node.children, newNode],
        };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: this.addNodeToTree(node.children, parentId, newNode),
        };
      }
      return node;
    });
  }

  private static updateNode(projectData: IProjectData, operation: IOperation): IProjectData {
    if (!operation.path) return projectData;
    if (!operation.node) return projectData;

    return {
      ...projectData,
      structure_tree: this.updateNodeInTree(projectData.structure_tree, operation.path, operation.node),
    };
  }

  private static updateNodeInTree(nodes: IProjectNode[], nodeId: string, updates: Partial<IProjectNode>): IProjectNode[] {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, ...updates, children: node.children };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: this.updateNodeInTree(node.children, nodeId, updates),
        };
      }
      return node;
    });
  }

  private static deleteNode(projectData: IProjectData, operation: IOperation): IProjectData {
    if (!operation.path) return projectData;

    return {
      ...projectData,
      structure_tree: this.deleteNodeFromTree(projectData.structure_tree, operation.path),
    };
  }

  private static deleteNodeFromTree(nodes: IProjectNode[], nodeId: string): IProjectNode[] {
    return nodes.filter(node => node.id !== nodeId).map(node => ({
      ...node,
      children: this.deleteNodeFromTree(node.children, nodeId),
    }));
  }

  private static updateContext(projectData: IProjectData, operation: IOperation): IProjectData {
    if (!operation.context) return projectData;

    return {
      ...projectData,
      context: operation.context,
    };
  }
}
