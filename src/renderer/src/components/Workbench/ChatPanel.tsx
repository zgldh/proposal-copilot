import React from 'react';

export const ChatPanel: React.FC = () => {
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '16px',
      background: '#f9f9f9',
      borderRight: '1px solid #e0e0e0'
    }}>
      <h3>Dialogue</h3>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', border: '2px dashed #ccc', borderRadius: '8px' }}>
        Chat Interface Placeholder
      </div>
    </div>
  );
};
