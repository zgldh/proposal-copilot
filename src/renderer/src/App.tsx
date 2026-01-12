import React, { useState } from 'react';
import { IProjectData } from '../../shared/types';
import { ProjectManager } from './components/ProjectManager';
import { WorkbenchLayout } from './components/Workbench/WorkbenchLayout';

const App: React.FC = () => {
  const [projectData, setProjectData] = useState<IProjectData | null>(null);
  const [projectPath, setProjectPath] = useState<string>('');

  const handleSave = async (data: IProjectData): Promise<void> => {
    if (projectPath) {
      await window.electronAPI.saveProject(projectPath, data);
    }
    setProjectData(data);
  };

  return (
    <>
      {projectData ? (
        <WorkbenchLayout project={projectData} projectPath={projectPath} onSave={handleSave} />
      ) : (
        <ProjectManager onProjectLoaded={(data: IProjectData, path: string) => {
          setProjectData(data);
          setProjectPath(path);
        }} />
      )}
    </>
  );
};

export default App;
