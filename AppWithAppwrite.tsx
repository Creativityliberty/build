/**
 * AppWithAppwrite
 * 
 * Alternative App component that uses Appwrite for data persistence
 * This replaces the local state management with Appwrite backend
 */

import React, { useEffect, useState } from 'react';
import AgentPlayground from './components/AgentPlayground';
import OrgDashboard from './components/OrgDashboard';
import Sidebar from './components/Sidebar';
import FlowTab from './components/tabs/FlowTab';
import GeneralTab from './components/tabs/GeneralTab';
import KnowledgeTab from './components/tabs/KnowledgeTab';
import LLMTab from './components/tabs/LLMTab';
import ProjectSettingsTab from './components/tabs/ProjectSettingsTab';
import PromptsTab from './components/tabs/PromptsTab';
import TasksTab from './components/tabs/TasksTab';
import TeamTab from './components/tabs/TeamTab';
import ToolsTab from './components/tabs/ToolsTab';
import { Button } from './components/ui/Button';
import { useAppwriteAuth } from './context/AppwriteContext';
import { useAgents } from './hooks/useAgents';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import { useTeams } from './hooks/useTeams';
import { TabId } from './types';

const AppWithAppwrite: React.FC = () => {
  const { user, isAuthenticated, logout } = useAppwriteAuth();
  const [activeTab, setActiveTab] = useState<TabId>('settings');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  // Fetch data from Appwrite
  const { projects, loading: projectsLoading } = useProjects(user?.id);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string>('');

  const { teams } = useTeams(activeProjectId || undefined);
  const { agents } = useAgents(activeTeamId || undefined);
  const { tasks } = useTasks(activeTeamId || undefined);

  // Get active entities
  const activeProject = activeProjectId ? projects.find(p => p.$id === activeProjectId) : null;
  const activeTeam = activeTeamId ? teams.find(t => t.$id === activeTeamId) : null;
  const activeAgent = activeAgentId ? agents.find(a => a.$id === activeAgentId) : null;

  // Initialize team selection when project changes
  useEffect(() => {
    if (activeProject && teams.length > 0 && !activeTeamId) {
      setActiveTeamId(teams[0].$id);
    }
  }, [activeProject, teams, activeTeamId]);

  // Initialize agent selection when team changes
  useEffect(() => {
    if (activeTeam && agents.length > 0 && !activeAgentId) {
      setActiveAgentId(agents[0].$id);
    }
  }, [activeTeam, agents, activeAgentId]);

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Numtema AI Builder</h1>
          <p className="text-neutral-500 mb-6">Please log in to continue</p>
          <p className="text-sm text-neutral-400">Use the AppwriteTest component to test authentication</p>
        </div>
      </div>
    );
  }

  // Dashboard view
  if (!activeProjectId || !activeProject) {
    return (
      <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <h1 className="text-sm font-bold text-neutral-900">Numtema Builder</h1>
          </div>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        <OrgDashboard
          organization={{
            id: 'org-1',
            name: 'Nümtema Agency',
            projects: projects as any,
          }}
          onSelectProject={setActiveProjectId}
          onCreateProject={(project) => {
            setActiveProjectId(project.id);
          }}
        />
      </div>
    );
  }

  // Builder view
  const renderContent = () => {
    if (!activeTeam) return <div className="p-8 text-center">No team selected. Create a team to start.</div>;

    switch (activeTab) {
      case 'settings':
        return (
          <ProjectSettingsTab
            project={activeProject as any}
            activeTeam={activeTeam as any}
            updateProject={() => {}}
            updateTeamConfig={() => {}}
          />
        );
      case 'team':
        return (
          <TeamTab
            config={activeTeam as any}
            updateConfig={() => {}}
            setActiveAgentId={(id) => {
              setActiveAgentId(id);
              setActiveTab('general');
            }}
          />
        );
      case 'tasks':
        return <TasksTab config={activeTeam as any} updateConfig={() => {}} />;
      case 'general':
        return activeAgent ? <GeneralTab config={activeAgent as any} updateConfig={() => {}} /> : <div>No agent selected</div>;
      case 'prompts':
        return activeAgent ? <PromptsTab config={activeAgent as any} updateConfig={() => {}} /> : <div>No agent selected</div>;
      case 'llm':
        return activeAgent ? <LLMTab config={activeAgent as any} updateConfig={() => {}} /> : <div>No agent selected</div>;
      case 'tools':
        return activeAgent ? <ToolsTab config={activeAgent as any} updateConfig={() => {}} /> : <div>No agent selected</div>;
      case 'knowledge':
        return activeAgent ? <KnowledgeTab config={activeAgent as any} updateConfig={() => {}} /> : <div>No agent selected</div>;
      case 'flow':
        return <FlowTab />;
      default:
        return <div>Select a tab</div>;
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
            <h1 className="text-sm font-bold text-neutral-900">Numtema Builder</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-wide">
              <span>{activeProject?.name || 'No Project'}</span>
              <span className="text-neutral-300">/</span>
              <span>{activeTeam?.name || 'No Team'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {['general', 'prompts', 'llm', 'tools', 'knowledge'].includes(activeTab) && activeTeam && (
            <div className="hidden md:flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
              <span className="text-xs font-semibold text-neutral-500 pl-2 uppercase">Editing:</span>
              <select
                value={activeAgentId}
                onChange={(e) => setActiveAgentId(e.target.value)}
                aria-label="Select agent to edit"
                className="bg-white border-0 rounded-md text-sm font-medium text-neutral-900 py-1 pl-2 pr-8 focus:ring-0 shadow-sm cursor-pointer"
              >
                {agents.map((a: any) => (
                  <option key={a.$id} value={a.$id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="h-6 w-px bg-neutral-200 hidden md:block"></div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 max-w-[1600px] mx-auto w-full relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBackToDashboard={() => setActiveProjectId(null)}
          projectName={activeProject?.name || ''}
          teams={teams as any}
          activeTeamId={activeTeamId || ''}
          onSwitchTeam={setActiveTeamId}
          onAddTeam={() => {}}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 capitalize">
                    {activeTab === 'settings'
                      ? 'Project Settings'
                      : activeTab === 'team'
                      ? 'Team & Process'
                      : activeTab === 'tasks'
                      ? 'Tasks & Workflow'
                      : activeTab === 'flow'
                      ? 'Visual Flow'
                      : `${activeAgent?.name || 'Agent'}: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                  </h2>
                  <p className="text-neutral-500 mt-1 text-sm">
                    {activeTab === 'settings'
                      ? 'Manage project metadata and global configuration.'
                      : activeTab === 'team'
                      ? 'Manage your multi-agent crew and execution process.'
                      : activeTab === 'tasks'
                      ? 'Orchestrate workflows and assign duties.'
                      : `Configuring settings for ${activeAgent?.name || 'the agent'}.`}
                  </p>
                </div>
              </div>
            </div>
            {renderContent()}
          </div>
        </main>

        {/* Agent Playground */}
        {activeAgent && (
          <AgentPlayground
            activeAgent={activeAgent as any}
            isOpen={isPlaygroundOpen}
            onClose={() => setIsPlaygroundOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AppWithAppwrite;
