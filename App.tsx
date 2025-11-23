
import React, { useState, useEffect, useRef } from 'react';
import { Organization, Project, TeamConfig, AgentConfig, LLMProvider, GeminiModel, TabId } from './types';
import Sidebar from './components/Sidebar';
import OrgDashboard from './components/OrgDashboard';
import GeneralTab from './components/tabs/GeneralTab';
import PromptsTab from './components/tabs/PromptsTab';
import LLMTab from './components/tabs/LLMTab';
import ToolsTab from './components/tabs/ToolsTab';
import TasksTab from './components/tabs/TasksTab';
import KnowledgeTab from './components/tabs/KnowledgeTab';
import FlowTab from './components/tabs/FlowTab';
import TeamTab from './components/tabs/TeamTab';
import ProjectSettingsTab from './components/tabs/ProjectSettingsTab';
import AgentPlayground from './components/AgentPlayground';
import { Button } from './components/ui/Button';
import { generateAgentRuntimeZip, generatePocketFlowPythonZip } from './services/agentExportService';

const App: React.FC = () => {
  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<TabId>('settings');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // --- ORGANIZATION STATE ---
  const [organization, setOrganization] = useState<Organization>({
    id: 'org-1',
    name: 'Nümtema Agency',
    projects: [
      {
        id: 'proj-default',
        name: 'Default Project',
        description: 'Main agency operations crew.',
        icon: "📁",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        teams: [
          {
            id: 'team-numtema-core',
            name: 'Core Operations Crew',
            description: 'A specialized team for digital agency operations.',
            process: 'sequential',
            tasks: [
               {
                id: "task-qualification-site-web",
                name: "Qualification projet site web",
                slug: "qualif_site_web",
                description: "Qualifier un projet de création ou refonte de site web pour Nümtema.",
                expectedOutput: "Un résumé structuré du besoin site web.",
                tags: ["site_web", "qualification"],
                agentId: "agent-leo-numtema", 
                allowedTools: [],
                asyncExecution: false,
                humanReview: false,
                markdown: true,
                maxExecutionTime: 180,
                maxRetries: 1,
                outputFormat: "json"
              }
            ],
            agents: [
              {
                id: 'agent-leo-numtema',
                name: 'Léo',
                slug: 'leo-numtema',
                role: 'Lead Qualifier',
                goal: 'Qualify incoming leads and route them to the right service.',
                description: 'Assistant digital pour Nümtema Agency.',
                language: 'fr',
                status: 'active',
                currentVersion: 1,
                personaTone: 'Clair, direct, chaleureux',
                emojiAllowed: true,
                greeting: 'Bonjour 👋 Je suis Léo, l’assistant digital de Nümtema Agency.',
                baseInstructions: 'Tu es Léo, l’assistant digital de Nümtema Agency...',
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
            ]
          }
        ]
      }
    ]
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string>("");

  const activeProject = activeProjectId ? organization.projects.find(p => p.id === activeProjectId) : null;
  const activeTeam = activeProject && activeTeamId ? activeProject.teams.find(t => t.id === activeTeamId) : (activeProject?.teams[0] || null);
  const activeAgent = activeTeam ? (activeTeam.agents.find(a => a.id === activeAgentId) || activeTeam.agents[0]) : null;

  // Initialize Team & Agent selection when project changes
  useEffect(() => {
    if (activeProject && !activeTeamId) {
        if (activeProject.teams.length > 0) {
            setActiveTeamId(activeProject.teams[0].id);
        }
    }
  }, [activeProject, activeTeamId]);

  useEffect(() => {
    if (activeTeam && (!activeAgentId || !activeTeam.agents.find(a => a.id === activeAgentId))) {
        if (activeTeam.agents.length > 0) {
            setActiveAgentId(activeTeam.agents[0].id);
        }
    }
  }, [activeTeam, activeAgentId]);

  const updateOrganization = (newOrg: Organization) => {
    setOrganization(newOrg);
  };

  const handleCreateProject = (project: Project) => {
    setOrganization(prev => ({
      ...prev,
      projects: [...prev.projects, project]
    }));
    setActiveProjectId(project.id);
    setActiveTab('settings');
    if (project.teams.length > 0) {
        setActiveTeamId(project.teams[0].id);
        if (project.teams[0].agents.length > 0) {
            setActiveAgentId(project.teams[0].agents[0].id);
        }
    }
  };

  const handleAddTeam = () => {
    if (!activeProject) return;
    const newTeam: TeamConfig = {
      id: `team-${Date.now()}`,
      name: `New Team ${activeProject.teams.length + 1}`,
      description: "A new crew.",
      process: 'sequential',
      agents: [],
      tasks: []
    };
    
    setOrganization(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
         if (p.id === activeProjectId) {
             return { ...p, teams: [...p.teams, newTeam], updatedAt: new Date().toISOString() };
         }
         return p;
      })
    }));
    setActiveTeamId(newTeam.id);
  };

  // --- UPDATERS (scoped to active project -> active team) ---

  const updateActiveProject = (updates: Partial<Project>) => {
    if (!activeProjectId) return;
    setOrganization(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    }));
  };

  const updateActiveTeamConfig = (updates: Partial<TeamConfig>) => {
    if (!activeProjectId || !activeTeamId) return;
    
    setOrganization(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            updatedAt: new Date().toISOString(),
            teams: p.teams.map(t => {
                if (t.id === activeTeamId) {
                    return { ...t, ...updates };
                }
                return t;
            })
          };
        }
        return p;
      })
    }));
  };

  const updateActiveAgent = (updates: Partial<AgentConfig>) => {
    if (!activeProjectId || !activeTeamId || !activeAgentId) return;

    setOrganization(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            updatedAt: new Date().toISOString(),
            teams: p.teams.map(t => {
                if (t.id === activeTeamId) {
                    return {
                        ...t,
                        agents: t.agents.map(a => a.id === activeAgentId ? { ...a, ...updates } : a)
                    };
                }
                return t;
            })
          };
        }
        return p;
      })
    }));
  };

  // --- EXPORT ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportJSON = () => {
      if (!activeTeam) return;
      const blob = new Blob([JSON.stringify(activeTeam, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `team-${activeTeam.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportMenuOpen(false);
  };

  const handleExportNodeRuntime = async () => {
    if (!activeTeam || !activeAgent) return;
    // Basic example using active agent
    const zip = await generateAgentRuntimeZip(activeAgent, activeTeam.tasks);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeAgent.slug}-runtime.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const handleExportPocketFlow = async () => {
    if (!activeTeam || !activeAgent) return;
    const zip = await generatePocketFlowPythonZip(activeAgent, activeTeam.tasks);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeAgent.slug}-pocketflow.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  // --- RENDER ---

  // 1. DASHBOARD VIEW
  if (!activeProjectId || !activeProject) {
    return (
      <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
         <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">N</div>
              <h1 className="text-sm font-bold text-neutral-900" style={{ fontFamily: '"Nova Flat", system-ui' }}>Numtema Builder</h1>
            </div>
         </header>
         <OrgDashboard 
           organization={organization} 
           onSelectProject={setActiveProjectId} 
           onCreateProject={handleCreateProject} 
         />
      </div>
    );
  }

  // 2. BUILDER VIEW
  const renderContent = () => {
    if (!activeTeam) return <div className="p-8 text-center">No team selected. Create a team to start.</div>;

    switch(activeTab) {
      case 'settings':
        return (
          <ProjectSettingsTab 
            project={activeProject}
            activeTeam={activeTeam} 
            updateProject={updateActiveProject} 
            updateTeamConfig={updateActiveTeamConfig} 
          />
        );
      case 'team': 
        return (
          <TeamTab 
            config={activeTeam} 
            updateConfig={updateActiveTeamConfig} 
            setActiveAgentId={(id) => { setActiveAgentId(id); setActiveTab('general'); }} 
          />
        );
      case 'tasks': 
        return <TasksTab config={activeTeam} updateConfig={updateActiveTeamConfig} />;
      
      // Agent Specific Tabs
      case 'general': return activeAgent ? <GeneralTab config={activeAgent} updateConfig={updateActiveAgent} /> : <div>No agent selected</div>;
      case 'prompts': return activeAgent ? <PromptsTab config={activeAgent} updateConfig={updateActiveAgent} /> : <div>No agent selected</div>;
      case 'llm': return activeAgent ? <LLMTab config={activeAgent} updateConfig={updateActiveAgent} /> : <div>No agent selected</div>;
      case 'tools': return activeAgent ? <ToolsTab config={activeAgent} updateConfig={updateActiveAgent} /> : <div>No agent selected</div>;
      case 'knowledge': return activeAgent ? <KnowledgeTab config={activeAgent} updateConfig={updateActiveAgent} /> : <div>No agent selected</div>;
      case 'flow': return <FlowTab />;
      default: return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-neutral-900" style={{ fontFamily: '"Nova Flat", system-ui' }}>Numtema Builder</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-wide">
               <span>{activeProject.name}</span>
               <span className="text-neutral-300">/</span>
               <span>{activeTeam?.name || 'No Team'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Agent Selector - Only show if in agent-specific tabs */}
           {['general', 'prompts', 'llm', 'tools', 'knowledge'].includes(activeTab) && activeTeam && (
             <div className="hidden md:flex items-center gap-2 bg-neutral-100 rounded-lg p-1 animate-in fade-in duration-300">
                <span className="text-xs font-semibold text-neutral-500 pl-2 uppercase">Editing:</span>
                <select 
                  value={activeAgentId}
                  onChange={(e) => { setActiveAgentId(e.target.value); }}
                  className="bg-white border-0 rounded-md text-sm font-medium text-neutral-900 py-1 pl-2 pr-8 focus:ring-0 shadow-sm cursor-pointer"
                >
                  {activeTeam.agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                  {activeTeam.agents.length === 0 && <option disabled>No agents</option>}
                </select>
             </div>
           )}

           <div className="h-6 w-px bg-neutral-200 hidden md:block"></div>

           <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setIsPlaygroundOpen(!isPlaygroundOpen)}
              className="hidden md:flex"
              icon={<svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            >
              Test Agent
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert('Project saved')}>Save</Button>
             <div className="relative" ref={exportMenuRef}>
               <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
              >
                Export
               </Button>
               {isExportMenuOpen && (
                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                      onClick={handleExportJSON}
                    >
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                      <span>Export Active Team (JSON)</span>
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                      onClick={handleExportNodeRuntime}
                    >
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      <span>Export Node.js Runtime (Zip)</span>
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                      onClick={handleExportPocketFlow}
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      <span>Export PocketFlow (Python)</span>
                    </button>
                 </div>
               )}
             </div>
           </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 max-w-[1600px] mx-auto w-full relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onBackToDashboard={() => setActiveProjectId(null)}
          projectName={activeProject.name}
          teams={activeProject.teams}
          activeTeamId={activeTeamId || ""}
          onSwitchTeam={setActiveTeamId}
          onAddTeam={handleAddTeam}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
           <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                 <div className="flex items-center justify-between">
                   <div>
                      <h2 className="text-2xl font-bold text-neutral-900 capitalize">
                        {activeTab === 'settings' ? 'Project Settings' : 
                         activeTab === 'team' ? 'Team & Process' : 
                         activeTab === 'tasks' ? 'Tasks & Workflow' : 
                         activeTab === 'flow' ? 'Visual Flow' :
                         `${activeAgent?.name || 'Agent'}: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                      </h2>
                      <p className="text-neutral-500 mt-1 text-sm">
                        {activeTab === 'settings' ? 'Manage project metadata and global configuration.' :
                         activeTab === 'team' ? 'Manage your multi-agent crew and execution process.' : 
                         activeTab === 'tasks' ? 'Orchestrate workflows and assign duties.' : 
                         `Configuring settings for ${activeAgent?.name || 'the agent'}.`}
                      </p>
                   </div>
                 </div>
              </div>
              {renderContent()}
           </div>
        </main>
        
        {/* Agent Playground Drawer */}
        {activeAgent && (
          <AgentPlayground 
            activeAgent={activeAgent} 
            isOpen={isPlaygroundOpen} 
            onClose={() => setIsPlaygroundOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
