
import React from 'react';
import { TabId, TeamConfig } from '../types';
import { Button } from './ui/Button';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onBackToDashboard: () => void;
  projectName?: string;
  teams: TeamConfig[];
  activeTeamId: string;
  onSwitchTeam: (teamId: string) => void;
  onAddTeam: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onBackToDashboard, 
  projectName,
  teams,
  activeTeamId,
  onSwitchTeam,
  onAddTeam
}) => {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'settings', label: 'Project Settings' },
    { id: 'team', label: 'Team & Process' },
    { id: 'tasks', label: 'Tasks & Workflow' },
    { id: 'general', label: 'General Identity' },
    { id: 'prompts', label: 'Prompts & Behavior' },
    { id: 'llm', label: 'LLM Config' },
    { id: 'tools', label: 'Tools' },
    { id: 'knowledge', label: 'Knowledge Base' },
    { id: 'flow', label: 'Visual Flow' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto hidden md:block flex-shrink-0 flex flex-col">
      <div className="p-4 flex-1">
        <div className="mb-6">
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={onBackToDashboard} 
             className="w-full justify-start text-neutral-500 hover:text-neutral-900 -ml-2 mb-4"
             icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>}
           >
             Back to Dashboard
           </Button>
           {projectName && (
             <div className="px-1">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">Active Project</div>
                <div className="font-bold text-neutral-900 truncate text-lg" title={projectName}>{projectName}</div>
             </div>
           )}
        </div>

        {/* Team Switcher Section */}
        <div className="mb-6 bg-neutral-50 rounded-lg p-2 border border-neutral-100">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Current Team</span>
              <button onClick={onAddTeam} className="text-neutral-400 hover:text-neutral-900" title="Add Team">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            <select 
              value={activeTeamId} 
              onChange={(e) => onSwitchTeam(e.target.value)}
              className="w-full text-xs font-medium border-0 bg-white rounded shadow-sm py-1.5 pl-2 pr-8 focus:ring-0"
            >
               {teams.map(team => (
                 <option key={team.id} value={team.id}>{team.name}</option>
               ))}
            </select>
        </div>

        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-2">Builder Menu</h2>
        <nav className="space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <div className="px-1 text-xs text-neutral-400 font-medium flex justify-between">
             <span>Numtema Builder</span>
             <span>v2.2</span>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;