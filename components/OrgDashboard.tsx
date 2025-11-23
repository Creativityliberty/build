
import React, { useState } from 'react';
import { Organization, Project, TeamConfig, LLMProvider, GeminiModel } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { generateProjectIcon } from '../services/geminiService';

interface OrgDashboardProps {
  organization: Organization;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Project) => void;
}

const OrgDashboard: React.FC<OrgDashboardProps> = ({ organization, onSelectProject, onCreateProject }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectIcon, setNewProjectIcon] = useState("");

  const handleGenerateIcon = async () => {
    if (!newProjectName) return;
    setIsGeneratingIcon(true);
    const icon = await generateProjectIcon(newProjectName, newProjectDesc);
    setNewProjectIcon(icon);
    setIsGeneratingIcon(false);
  };

  const handleCreate = () => {
    if (!newProjectName.trim()) return;

    // Default Team Template
    const defaultTeam: TeamConfig = {
      id: `team-${Date.now()}`,
      name: `${newProjectName} Core Crew`,
      description: "Initial crew configuration.",
      process: 'sequential',
      agents: [
        {
            id: `agent-${Date.now()}`,
            name: 'Agent 1',
            slug: 'agent_1',
            role: 'Assistant',
            goal: 'Help users',
            description: 'Default assistant',
            language: 'en',
            status: 'draft',
            currentVersion: 1,
            personaTone: 'Helpful',
            emojiAllowed: true,
            greeting: 'Hello!',
            baseInstructions: 'You are helpful.',
            globalPrompts: [],
            llm: {
              provider: LLMProvider.GOOGLE,
              model: GeminiModel.GEMINI_2_5_FLASH,
              apiKeyEnvVar: 'GEMINI_API_KEY',
              temperature: 0.7,
              maxTokens: 2048
            },
            tools: [],
            knowledge: {
              sources: [],
              embedder: { provider: 'google', model: 'models/text-embedding-004' },
              chunkSize: 1000,
              overlap: 200,
              topKRetrieval: 3
            }
        }
      ],
      tasks: []
    };

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      description: newProjectDesc,
      icon: newProjectIcon || "📁",
      teams: [defaultTeam], // Initialize with one default team
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreateProject(newProject);
    setIsCreating(false);
    setNewProjectName("");
    setNewProjectDesc("");
    setNewProjectIcon("");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900" style={{ fontFamily: '"Nova Flat", system-ui' }}>{organization.name}</h1>
          <p className="text-neutral-500 mt-1">Manage your AI projects and teams.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} icon={<span>+</span>}>
          New Project
        </Button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm animate-in slide-in-from-top-4 duration-300">
           <h3 className="text-lg font-bold mb-4">Create New Project</h3>
           <div className="grid grid-cols-1 gap-4 max-w-xl">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    label="Project Name" 
                    value={newProjectName} 
                    onChange={(e) => setNewProjectName(e.target.value)} 
                    placeholder="e.g. Customer Support Bot"
                    autoFocus
                  />
                </div>
                <div className="w-20 pt-6">
                   <div 
                     className="w-full h-[38px] rounded-lg border border-neutral-200 flex items-center justify-center bg-neutral-50 cursor-pointer hover:bg-neutral-100 overflow-hidden text-xl"
                     onClick={handleGenerateIcon}
                     title="Click to generate icon"
                   >
                     {isGeneratingIcon ? (
                       <div className="animate-spin h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full"></div>
                     ) : (
                       newProjectIcon && newProjectIcon.includes('<svg') 
                         ? <div className="w-6 h-6" dangerouslySetInnerHTML={{__html: newProjectIcon}} /> 
                         : (newProjectIcon || <span className="opacity-30">🪄</span>)
                     )}
                   </div>
                </div>
              </div>
              <Textarea 
                label="Description" 
                value={newProjectDesc} 
                onChange={(e) => setNewProjectDesc(e.target.value)} 
                placeholder="What is this project for?"
              />
              <div className="flex gap-3 mt-2">
                 <Button onClick={handleCreate} disabled={!newProjectName}>Create Project</Button>
                 <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organization.projects.map((project) => (
          <div 
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className="group bg-white border border-neutral-200 rounded-2xl p-6 hover:border-neutral-300 hover:shadow-lg transition-all cursor-pointer flex flex-col h-full"
          >
             <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-50 to-white border border-neutral-100 shadow-inner flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-300 text-neutral-700">
                   {project.icon && project.icon.includes('<svg') ? (
                     <div className="w-8 h-8" dangerouslySetInnerHTML={{__html: project.icon}} />
                   ) : (
                     project.icon || "📁"
                   )}
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-2 py-1 rounded-md">
                   {new Date(project.updatedAt).toLocaleDateString()}
                </span>
             </div>
             <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
             <p className="text-sm text-neutral-500 line-clamp-2 mb-6 flex-1">
               {project.description || "No description."}
             </p>
             
             <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                 <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                       {project.teams.length} Teams
                    </div>
                 </div>
                 <div className="flex -space-x-2">
                    {project.teams.flatMap(t => t.agents).slice(0,3).map(a => (
                       <div key={a.id} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-700" title={a.name}>
                          {a.name.charAt(0)}
                       </div>
                    ))}
                    {project.teams.flatMap(t => t.agents).length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-neutral-500">
                         +
                      </div>
                    )}
                 </div>
             </div>
          </div>
        ))}
        
        {organization.projects.length === 0 && !isCreating && (
           <div className="col-span-full text-center py-24 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                 <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">No projects yet</h3>
              <p className="text-neutral-500 mb-6 max-w-sm mx-auto">Create your first AI project to start building agents, crews, and workflows.</p>
              <Button onClick={() => setIsCreating(true)} size="lg">Create First Project</Button>
           </div>
        )}
      </div>
    </div>
  );
};

export default OrgDashboard;
