import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { IProjectData } from '../../../../shared/types';
import { ChatPanel } from './ChatPanel';
import { ContextPanel } from './ContextPanel';

interface IWorkbenchProps {
  project: IProjectData;
  onSave: (data: IProjectData) => Promise<void>;
}

export const WorkbenchLayout: React.FC<IWorkbenchProps> = ({ project }) => {
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* Optional Header Area */}
      <header style={{ 
        padding: '0 16px', 
        height: '40px', 
        background: '#001529', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center',
        fontSize: '14px'
      }}>
        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Proposal Copilot</span>
        <span style={{ opacity: 0.7 }}> - {project.meta.name} (v{project.meta.version})</span>
      </header>

      {/* Main Split Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL: Chat */}
          <Panel defaultSize={30} minSize={20} order={1}>
            <ChatPanel />
          </Panel>

          {/* RESIZE HANDLE */}
          <PanelResizeHandle style={{ 
            width: '4px', 
            background: '#e1e1e1', 
            cursor: 'col-resize',
            transition: 'background 0.2s'
          }} />

          {/* RIGHT PANEL: Context (Tree/Preview) */}
          <Panel minSize={30} order={2}>
            <ContextPanel projectStructure={project.structure_tree} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

// Add a simple hover effect for resize handle using inline styles or global css
// (Note: For strictly inline solution, hover styles are hard, but default visible gray is fine)
