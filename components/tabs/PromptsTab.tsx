
import React, { useState } from 'react';
import { AgentConfig, GlobalPrompt } from '../../types';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { generateAgentContent } from '../../services/geminiService';

interface PromptsTabProps {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
}

const PromptsTab: React.FC<PromptsTabProps> = ({ config, updateConfig }) => {
  const [isGenInstructions, setIsGenInstructions] = useState(false);
  const [isGenGlobal, setIsGenGlobal] = useState<string | null>(null);

  const handleGenerateInstructions = async () => {
    setIsGenInstructions(true);
    const baseInstructions = await generateAgentContent('instructions', {
      name: config.name,
      description: config.description,
      tone: config.personaTone
    });
    updateConfig({ baseInstructions });
    setIsGenInstructions(false);
  };

  const addGlobalPrompt = () => {
    const newPrompt: GlobalPrompt = {
      id: Date.now().toString(),
      label: "New Prompt",
      key: "new_prompt_key",
      content: ""
    };
    updateConfig({ globalPrompts: [...config.globalPrompts, newPrompt] });
  };

  const removeGlobalPrompt = (id: string) => {
    updateConfig({ globalPrompts: config.globalPrompts.filter(p => p.id !== id) });
  };

  const updateGlobalPrompt = (id: string, field: keyof GlobalPrompt, value: string) => {
    updateConfig({
      globalPrompts: config.globalPrompts.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const generateSinglePrompt = async (id: string, label: string) => {
    setIsGenGlobal(id);
    const content = await generateAgentContent('prompt', {
      name: config.name,
      description: config.description,
      tone: config.personaTone,
      extra: label
    });
    updateGlobalPrompt(id, 'content', content);
    setIsGenGlobal(null);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <Card 
        title="Base Instructions" 
        description="The core system prompt that governs the agent's behavior."
        action={
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGenerateInstructions} 
            isLoading={isGenInstructions}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          >
            Generate System Prompt
          </Button>
        }
      >
        <Textarea
          value={config.baseInstructions}
          onChange={(e) => updateConfig({ baseInstructions: e.target.value })}
          className="font-mono text-xs"
          rows={12}
          placeholder="You are a helpful assistant..."
        />
      </Card>

      <div className="flex items-center justify-between pt-4">
        <h3 className="text-lg font-semibold text-neutral-900">Global Prompts</h3>
        <Button size="sm" variant="outline" onClick={addGlobalPrompt} icon={<span>+</span>}>
          Add Prompt Module
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {config.globalPrompts.map((prompt) => (
          <Card key={prompt.id} className="relative group">
             <div className="flex items-start gap-4 mb-3">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Label (e.g. SEO Check)" 
                    value={prompt.label} 
                    onChange={(e) => updateGlobalPrompt(prompt.id, 'label', e.target.value)}
                  />
                   <Input 
                    placeholder="Key (e.g. seo_check)" 
                    value={prompt.key} 
                    onChange={(e) => updateGlobalPrompt(prompt.id, 'key', e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="flex gap-2">
                   <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => generateSinglePrompt(prompt.id, prompt.label)}
                      isLoading={isGenGlobal === prompt.id}
                      title="Generate content based on label"
                   >
                     <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => removeGlobalPrompt(prompt.id)}>
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </Button>
                </div>
             </div>
             <Textarea 
                value={prompt.content}
                onChange={(e) => updateGlobalPrompt(prompt.id, 'content', e.target.value)}
                rows={4}
                placeholder="Specific instructions for this module..."
             />
          </Card>
        ))}
        {config.globalPrompts.length === 0 && (
           <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 text-sm">
             No global prompts defined. Add one to modularize your agent's logic.
           </div>
        )}
      </div>
    </div>
  );
};

export default PromptsTab;
