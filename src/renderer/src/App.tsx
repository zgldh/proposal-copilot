import React, { useState } from 'react';
import { IProjectData } from '../../shared/types';
import { ProjectManager } from './components/ProjectManager';
import { WorkbenchLayout } from './components/Workbench/WorkbenchLayout';

const App: React.FC = () => {
  const [projectData, setProjectData] = useState<IProjectData | null>(null);

  const handleSave = async (data: IProjectData): Promise<void> => {
    // Placeholder for save logic initiated from Workbench
    // In a real scenario, we might need to track the project path here as well
    console.log('Save requested from Workbench', data);
  };

  return (
    <>
      {projectData ? (
        <WorkbenchLayout project={projectData} onSave={handleSave} />
      ) : (
        <ProjectManager onProjectLoaded={setProjectData} />
      )}
    </>
  );
};

export default App;
