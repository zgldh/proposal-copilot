import React, { useState } from 'react';
import { IBackendResponse, IProjectData } from '../../../shared/types';

interface IProjectManagerProps {
  onProjectLoaded: (data: IProjectData, path: string) => void;
}

export const ProjectManager: React.FC<IProjectManagerProps> = ({ onProjectLoaded }) => {
  const [status, setStatus] = useState<string>('Unknown');
  const [backendData, setBackendData] = useState<string | null>(null);
  const [projectPath, setProjectPath] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleCheckHealth = async (): Promise<void> => {
    try {
      setStatus('Checking...');
      const response: IBackendResponse = await window.electronAPI.checkBackendStatus();

      if (response.status === 'ok') {
        setStatus('Online');
        setBackendData(response.data as string);
      } else {
        setStatus('Error');
        setBackendData(JSON.stringify(response.data));
      }
    } catch (error) {
      setStatus('Connection Failed');
      console.error(error);
    }
  };

  const handleSelectFolder = async (): Promise<void> => {
    const result = await window.electronAPI.selectDirectory();
    if (result.success && result.data) {
      setProjectPath(result.data);
      setStatusMsg(`Selected: ${result.data}`);
    } else if (result.error) {
      setStatusMsg(`Error: ${result.error}`);
    }
  };

  const handleCreateProject = async (): Promise<void> => {
    if (!projectPath) return;
    const name = `Project-${Date.now()}`;
    const result = await window.electronAPI.createProject(projectPath, name);
    if (result.success && result.data) {
      setStatusMsg('Project created successfully.');
      onProjectLoaded(result.data, projectPath);
    } else {
      setStatusMsg(`Create Failed: ${result.error}`);
    }
  };

  const handleLoadProject = async (): Promise<void> => {
    if (!projectPath) return;
    const result = await window.electronAPI.loadProject(projectPath);
    if (result.success && result.data) {
      setStatusMsg('Project loaded successfully.');
      onProjectLoaded(result.data, projectPath);
    } else {
      setStatusMsg(`Load Failed: ${result.error}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Proposal Copilot Launcher</h1>
      
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2>System Status</h2>
        <p><strong>Backend Connection:</strong> {status}</p>
        {backendData && <p style={{ color: 'green' }}>Message: {backendData}</p>}
        <button onClick={handleCheckHealth} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Check Backend Health
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <h2>Project Selection</h2>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={handleSelectFolder} style={{ marginRight: '10px' }}>Select Folder</button>
          <span>{projectPath || 'No folder selected'}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleCreateProject} disabled={!projectPath}>Create New Project</button>
          <button onClick={handleLoadProject} disabled={!projectPath}>Load Project</button>
        </div>
        
        {statusMsg && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{statusMsg}</p>}
      </div>
    </div>
  );
};
