export interface IBackendResponse {
    status: 'ok' | 'error';
    data: unknown;
    timestamp: number;
}

export type NodeType = 'subsystem' | 'device' | 'feature';

export interface IProjectNode {
  id: string; // UUID
  type: NodeType;
  name: string;
  specs: Record<string, string | number | boolean>;
  quantity: number;
  children: IProjectNode[];
}

export interface IProjectMeta {
  name: string;
  create_time: string; // ISO8601
  version: string;
}

export interface IProjectData {
  meta: IProjectMeta;
  context: string;
  structure_tree: IProjectNode[];
}

export interface IServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
