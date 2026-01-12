import React, { useState } from 'react';
import { IBackendResponse, IProjectData } from '../../shared/types';

const App: React.FC = () => {
  const [status, setStatus] = useState<string>('Unknown');
  const [backendData, setBackendData] = useState<string | null>(null);
  const [projectPath, setProjectPath] = useState<string>('');
  const [projectData, setProjectData] = useState<IProjectData | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleCheckHealth = async () => {
    try {
      setStatus('Checking...');
      const response: IBackendResponse = await window.electronAPI.checkBackendStatus();
      
      if (response.status === 'ok') {
        setStatus('Online');
        // We safely cast unknown to string here because we know our engine implementation
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

  const handleSelectFolder = async () => {
    const result = await window.electronAPI.selectDirectory();
    if (result.success && result.data) {
      setProjectPath(result.data);
      setStatusMsg(`Selected: ${result.data}`);
    } else if (result.error) {
      setStatusMsg(`Error: ${result.error}`);
    }
  };

  const handleCreateProject = async () => {
    if (!projectPath) return;
    const name = `Project-${Date.now()}`;
    const result = await window.electronAPI.createProject(projectPath, name);
    if (result.success && result.data) {
      setProjectData(result.data);
      setStatusMsg('Project created successfully.');
    } else {
      setStatusMsg(`Create Failed: ${result.error}`);
    }
  };

  const handleLoadProject = async () => {
    if (!projectPath) return;
    const result = await window.electronAPI.loadProject(projectPath);
    if (result.success && result.data) {
      setProjectData(result.data);
      setStatusMsg('Project loaded successfully.');
    } else {
      setStatusMsg(`Load Failed: ${result.error}`);
    }
  };

  const handleSaveProject = async () => {
    if (!projectPath || !projectData) return;
    // Mutate data slightly to prove save works (in real app, use proper state management)
    const newData = { ...projectData, meta: { ...projectData.meta, version: projectData.meta.version + '.1' } };
    const result = await window.electronAPI.saveProject(projectPath, newData);
    if (result.success) {
      setProjectData(newData);
      setStatusMsg('Project saved successfully (Version bumped).');
    } else {
      setStatusMsg(`Save Failed: ${result.error}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Proposal Copilot Workbench</h1>
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <h2>System Status</h2>
        <p><strong>Backend Connection:</strong> {status}</p>
        {backendData && <p style={{ color: 'green' }}>Message: {backendData}</p>}
        <button onClick={handleCheckHealth} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Check Backend Health
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h2>Project Management</h2>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={handleSelectFolder}>Select Folder</button>
          <span style={{ marginLeft: '10px' }}>{projectPath || 'No folder selected'}</span>
        </div>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
          <button onClick={handleCreateProject} disabled={!projectPath}>Create New Project</button>
          <button onClick={handleLoadProject} disabled={!projectPath}>Load Project</button>
          <button onClick={handleSaveProject} disabled={!projectData}>Save Changes</button>
        </div>
        <p><strong>Status:</strong> {statusMsg}</p>
        {projectData && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Current Project Data:</h3>
            <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(projectData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
