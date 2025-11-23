
import React, { useState, useEffect } from 'react';
import { TeamConfig, AgentConfig, ProcessType, LLMProvider, GeminiModel } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TeamTabProps {
  config: TeamConfig;
  updateConfig: (updates: Partial<TeamConfig>) => void;
  setActiveAgentId: (id: string) => void;
}

const TeamTab: React.FC<TeamTabProps> = ({ config, updateConfig, setActiveAgentId }) => {
  // 'agent' or 'llm'
  const [managerType, setManagerType] = useState<'agent' | 'llm'>(config.managerAgentId ? 'agent' : 'llm');

  // Sync local state if config changes externally
  useEffect(() => {
    if (config.process === 'hierarchical' && config.managerAgentId) {
      setManagerType('agent');
    }
  }, [config.process, config.managerAgentId]);

  const addAgent = () => {
    const newAgent: AgentConfig = {
      id: `agent-${Date.now()}`,
      name: "New Agent",
      slug: "new_agent",
      role: "Assistant",
      goal: "Help the user",
      description: "A helpful AI assistant",
      language: 'en',
      status: 'draft',
      currentVersion: 1,
      personaTone: 'Professional',
      emojiAllowed: true,
      greeting: "Hello!",
      baseInstructions: "You are a helpful assistant.",
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
    };
    updateConfig({ agents: [...config.agents, newAgent] });
  };

  const removeAgent = (id: string) => {
    if (config.agents.length <= 1) {
      alert("A team must have at least one agent.");
      return;
    }
    if (confirm("Are you sure? This will remove the agent and unassign their tasks.")) {
      updateConfig({ agents: config.agents.filter(a => a.id !== id) });
      // Clear manager if it was this agent
      if (config.managerAgentId === id) {
         updateConfig({ managerAgentId: undefined });
         setManagerType('llm');
      }
    }
  };

  const updateManagerLLM = (field: string, value: string) => {
    updateConfig({
      managerLLM: {
        provider: config.managerLLM?.provider || LLMProvider.GOOGLE,
        model: config.managerLLM?.model || GeminiModel.GEMINI_2_5_FLASH,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
         <div>
           <h2 className="text-xl font-bold text-neutral-900">Team Configuration</h2>
           <p className="text-sm text-neutral-500">Assemble your crew of agents and define how they collaborate.</p>
         </div>
         <Button onClick={addAgent} icon={<span>+</span>}>Add Agent</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Process Settings */}
        <div className="md:col-span-1 space-y-4">
           <Card title="Process Flow">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Execution Process</label>
                  <select
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    value={config.process}
                    onChange={(e) => updateConfig({ process: e.target.value as ProcessType })}
                  >
                    <option value="sequential">Sequential (Relay)</option>
                    <option value="hierarchical">Hierarchical (Manager)</option>
                  </select>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {config.process === 'sequential' 
                      ? 'Tasks are executed in order one after another. Output of one is context for next.' 
                      : 'A manager delegates tasks to the crew automatically and reviews results.'}
                  </p>
                </div>

                {config.process === 'hierarchical' && (
                  <div className="pt-4 border-t border-neutral-100">
                     <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Manager Configuration</label>
                     
                     <div className="flex gap-2 mb-3">
                        <button 
                          onClick={() => { setManagerType('llm'); updateConfig({ managerAgentId: undefined }); }}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${managerType === 'llm' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-neutral-200 text-neutral-600'}`}
                        >
                          Auto (LLM)
                        </button>
                        <button 
                          onClick={() => setManagerType('agent')}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${managerType === 'agent' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-neutral-200 text-neutral-600'}`}
                        >
                          Custom Agent
                        </button>
                     </div>

                     {managerType === 'agent' ? (
                       <div>
                          <p className="text-[10px] text-neutral-400 mb-1.5">Select an agent from your crew to act as the Manager.</p>
                          <select
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-neutral-900"
                            value={config.managerAgentId || ''}
                            onChange={(e) => updateConfig({ managerAgentId: e.target.value })}
                          >
                            <option value="" disabled>Select Manager Agent...</option>
                            {config.agents.map(agent => (
                              <option key={agent.id} value={agent.id}>{agent.name} ({agent.role})</option>
                            ))}
                          </select>
                       </div>
                     ) : (
                       <div className="space-y-2">
                          <p className="text-[10px] text-neutral-400 mb-1">Configure the LLM that will plan and delegate.</p>
                          <select 
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
                            value={config.managerLLM?.provider || LLMProvider.GOOGLE}
                            onChange={(e) => updateManagerLLM('provider', e.target.value)}
                          >
                            <option value={LLMProvider.GOOGLE}>Google Gemini</option>
                            <option value={LLMProvider.OPENAI}>OpenAI</option>
                            <option value={LLMProvider.ANTHROPIC}>Anthropic</option>
                          </select>
                          <Input 
                            placeholder="Model Name"
                            value={config.managerLLM?.model || ''}
                            onChange={(e) => updateManagerLLM('model', e.target.value)}
                            className="text-xs"
                          />
                       </div>
                     )}
                  </div>
                )}
              </div>
           </Card>
        </div>

        {/* Right Column: Roster */}
        <div className="md:col-span-2 grid grid-cols-1 gap-4">
           {config.agents.map((agent) => (
             <Card key={agent.id} className={`relative group hover:border-neutral-300 transition-colors ${config.managerAgentId === agent.id ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}>
                {config.managerAgentId === agent.id && (
                  <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                    MANAGER
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                         {agent.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="font-semibold text-neutral-900">{agent.name}</h3>
                         <p className="text-xs text-neutral-500">{agent.role}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => setActiveAgentId(agent.id)}
                      >
                        Edit Profile
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeAgent(agent.id)}
                        className="text-neutral-400 hover:text-red-600"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </Button>
                   </div>
                </div>
                <div className="mt-3 pl-13">
                    <p className="text-sm text-neutral-600 line-clamp-2">{agent.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400 font-mono">
                       <span className="flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         {agent.llm.model}
                       </span>
                       <span className="flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                         {agent.tools.length} Tools
                       </span>
                    </div>
                </div>
             </Card>
           ))}
        </div>
      </div>
    </div>
  );
};

export default TeamTab;