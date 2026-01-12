import React, { useState } from 'react';
import { IBackendResponse } from '../../shared/types';

const App: React.FC = () => {
  const [status, setStatus] = useState<string>('Unknown');
  const [backendData, setBackendData] = useState<string | null>(null);

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
    </div>
  );
};

export default App;
