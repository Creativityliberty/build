
import React, { useState } from 'react';
import { AgentConfig } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { generateAgentContent } from '../../services/geminiService';

interface GeneralTabProps {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ config, updateConfig }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingIdentity, setIsGeneratingIdentity] = useState(false);

  const handleGenerateGreeting = async () => {
    setIsGenerating(true);
    const greeting = await generateAgentContent('greeting', {
      name: config.name,
      description: config.description,
      tone: config.personaTone
    });
    updateConfig({ greeting });
    setIsGenerating(false);
  };

  const handleGenerateIdentity = async () => {
    setIsGeneratingIdentity(true);
    // Mocking AI generation for identity parts based on description
    // In a real app, you'd have a specific service function for this or parse a larger response
    const generatedRole = await generateAgentContent('prompt', {
       name: config.name,
       description: config.description,
       tone: "Professional",
       extra: "Generate a 3-5 word job role title for this agent."
    });
    const generatedGoal = await generateAgentContent('prompt', {
       name: config.name,
       description: config.description,
       tone: "Professional",
       extra: "Generate a clear, one-sentence goal for this agent."
    });
    
    updateConfig({ 
        role: generatedRole.replace(/"/g, '').trim(), 
        goal: generatedGoal.replace(/"/g, '').trim() 
    });
    setIsGeneratingIdentity(false);
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-500">
      <Card title="Identity" description="Define the core identity and settings of your agent.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Agent Name"
              value={config.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
              placeholder="e.g. Leo"
            />
             <Input
              label="Slug"
              value={config.slug}
              onChange={(e) => updateConfig({ slug: e.target.value })}
              placeholder="e.g. leo-assistant"
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div className="md:col-span-2 flex justify-between items-center">
               <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">CrewAI Identity</span>
               <Button variant="ghost" size="sm" onClick={handleGenerateIdentity} isLoading={isGeneratingIdentity} className="text-indigo-600 bg-indigo-100 hover:bg-indigo-200">
                  Auto-Generate
               </Button>
            </div>
            <Input
              label="Role"
              value={config.role}
              onChange={(e) => updateConfig({ role: e.target.value })}
              placeholder="e.g. Senior Researcher"
            />
             <Input
              label="Goal"
              value={config.goal}
              onChange={(e) => updateConfig({ goal: e.target.value })}
              placeholder="e.g. Uncover the latest trends in AI."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Input
              label="Language"
              value={config.language}
              onChange={(e) => updateConfig({ language: e.target.value })}
              placeholder="e.g. en, fr"
            />
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Status</label>
              <select 
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-neutral-900"
                value={config.status}
                onChange={(e) => updateConfig({ status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center h-full pt-6">
               <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.emojiAllowed}
                    onChange={(e) => updateConfig({ emojiAllowed: e.target.checked })}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                  />
                  <span className="text-sm font-medium text-neutral-700">Allow Emojis</span>
               </label>
            </div>
          </div>

          <Input
            label="Persona Tone"
            value={config.personaTone}
            onChange={(e) => updateConfig({ personaTone: e.target.value })}
            placeholder="e.g. Professional, Friendly, Witty"
          />
          
          <Textarea
            label="Description"
            value={config.description}
            onChange={(e) => updateConfig({ description: e.target.value })}
            placeholder="What does this agent do? Who is it for?"
            rows={3}
          />
        </div>
      </Card>

      <Card 
        title="Greeting Message" 
        description="The first message the agent sends to start the conversation."
        action={
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGenerateGreeting} 
            isLoading={isGenerating}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          >
            Generate with Gemini
          </Button>
        }
      >
        <Textarea
          value={config.greeting}
          onChange={(e) => updateConfig({ greeting: e.target.value })}
          placeholder="Hello! How can I help you today?"
          rows={4}
        />
      </Card>
    </div>
  );
};

export default GeneralTab;