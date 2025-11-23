
import React from 'react';
import { Project, TeamConfig } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface ProjectSettingsTabProps {
  project: Project;
  activeTeam: TeamConfig;
  updateProject: (updates: Partial<Project>) => void;
  updateTeamConfig: (updates: Partial<TeamConfig>) => void;
}

const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({ project, activeTeam, updateProject, updateTeamConfig }) => {
  
  const handleDelete = () => {
     if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
        alert("Delete functionality would be implemented here (lifting state up to remove from org).");
     }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <div>
           <h2 className="text-xl font-bold text-neutral-900">Project Settings</h2>
           <p className="text-sm text-neutral-500">Manage high-level project details and team identity.</p>
         </div>
      </div>

      <Card title="General Information">
        <div className="grid grid-cols-1 gap-4">
           <Input 
             label="Project Name"
             value={project.name}
             onChange={(e) => updateProject({ name: e.target.value })}
             placeholder="e.g. Customer Support Bot"
           />
           <Textarea 
             label="Description"
             value={project.description || ''}
             onChange={(e) => updateProject({ description: e.target.value })}
             placeholder="What is the purpose of this project?"
             rows={3}
           />
        </div>
      </Card>

      <Card title="Active Team Identity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Input 
             label="Crew / Team Name"
             value={activeTeam.name}
             onChange={(e) => updateTeamConfig({ name: e.target.value })}
             placeholder="e.g. Support Crew"
           />
           <Textarea 
             label="Team Description"
             value={activeTeam.description || ''}
             onChange={(e) => updateTeamConfig({ description: e.target.value })}
             placeholder="What is this team responsible for?"
             className="md:col-span-2"
             rows={2}
           />
        </div>
      </Card>

      <div className="pt-6 border-t border-neutral-200">
         <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">Danger Zone</h3>
         <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
            <div>
               <h4 className="text-sm font-semibold text-red-900">Delete Project</h4>
               <p className="text-xs text-red-700 mt-1">Permanently remove this project and all its agents.</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete Project</Button>
         </div>
      </div>
    </div>
  );
};

export default ProjectSettingsTab;