import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { IProjectData } from '../../../../shared/types';
import { ChatPanel } from './ChatPanel';
import { ContextPanel } from './ContextPanel';
import { SettingsModal } from '../SettingsModal';

interface IWorkbenchProps {
  project: IProjectData;
  projectPath: string;
  onSave: (data: IProjectData) => Promise<void>;
}

export const WorkbenchLayout: React.FC<IWorkbenchProps> = ({ project, projectPath, onSave }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);

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
        justifyContent: 'space-between',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Proposal Copilot</span>
          <span style={{ opacity: 0.7 }}> - {project.meta.name} (v{project.meta.version})</span>
        </div>
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => setSettingsVisible(true)}
          style={{ color: 'white' }}
        />
      </header>

      {/* Main Split Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL: Chat */}
          <Panel defaultSize={30} minSize={20} order={1}>
            <ChatPanel projectPath={projectPath} onTreeUpdate={async () => {
              const result = await window.electronAPI.loadProject(projectPath);
              if (result.success && result.data) {
                onSave(result.data);
              }
            }} />
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
            <ContextPanel projectStructure={project.structure_tree} projectPath={projectPath} />
          </Panel>
        </PanelGroup>
      </div>

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </div>
  );
};

// Add a simple hover effect for resize handle using inline styles or global css
// (Note: For strictly inline solution, hover styles are hard, but default visible gray is fine)
