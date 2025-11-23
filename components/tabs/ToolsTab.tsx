
import React, { useState } from 'react';
import { AgentConfig, Tool } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { generateToolDefinition } from '../../services/geminiService';

interface ToolsTabProps {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
}

const ToolsTab: React.FC<ToolsTabProps> = ({ config, updateConfig }) => {
  const [aiToolPrompt, setAiToolPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const addTool = () => {
    const newTool: Tool = {
      id: Date.now().toString(),
      name: "New Tool",
      slug: "new_tool",
      type: "http",
      description: "",
      enabled: true,
      httpMethod: "POST",
      inputSchema: "{\n  \"type\": \"object\",\n  \"properties\": {}\n}",
      outputSchema: "{\n  \"type\": \"object\",\n  \"properties\": {}\n}"
    };
    updateConfig({ tools: [...config.tools, newTool] });
  };

  const handleAiGenerate = async () => {
    if (!aiToolPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const toolDef = await generateToolDefinition(aiToolPrompt);
      const newTool: Tool = {
        id: Date.now().toString(),
        name: toolDef.name || "Generated Tool",
        slug: toolDef.slug || "generated_tool",
        type: (toolDef.type as any) || "http",
        description: toolDef.description || "",
        enabled: true,
        httpMethod: "POST",
        inputSchema: toolDef.inputSchema || "{\n  \"type\": \"object\",\n  \"properties\": {}\n}",
        outputSchema: toolDef.outputSchema || "{\n  \"type\": \"object\",\n  \"properties\": {}\n}"
      };
      updateConfig({ tools: [...config.tools, newTool] });
      setAiToolPrompt("");
    } catch (e) {
      console.error(e);
      alert("Failed to generate tool.");
    } finally {
      setIsGenerating(false);
    }
  };

  const removeTool = (id: string) => {
    updateConfig({ tools: config.tools.filter(t => t.id !== id) });
  };

  const updateTool = (id: string, field: keyof Tool, value: any) => {
    updateConfig({
      tools: config.tools.map(t => t.id === id ? { ...t, [field]: value } : t)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      
      {/* AI Generator */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input 
              label="AI Tool Generator"
              placeholder="e.g. I need a tool to check stock prices for a given ticker."
              value={aiToolPrompt}
              onChange={(e) => setAiToolPrompt(e.target.value)}
              className="bg-white"
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={handleAiGenerate} 
            isLoading={isGenerating}
            disabled={!aiToolPrompt}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          >
            Generate
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">External Tools</h3>
          <p className="text-sm text-neutral-500">Enable your agent to interact with the world.</p>
        </div>
        <Button onClick={addTool} icon={<span>+</span>}>Add Empty Tool</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {config.tools.map((tool) => (
          <Card key={tool.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  label="Name"
                  value={tool.name}
                  onChange={(e) => updateTool(tool.id, 'name', e.target.value)}
                />
                <Input 
                  label="Slug (Function Name)"
                  value={tool.slug}
                  className="font-mono"
                  onChange={(e) => updateTool(tool.id, 'slug', e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Type</label>
                    <select
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-neutral-900"
                      value={tool.type}
                      onChange={(e) => updateTool(tool.id, 'type', e.target.value as any)}
                    >
                      <option value="http">HTTP Request</option>
                      <option value="webhook">Webhook</option>
                      <option value="google_search">Google Search (Grounding)</option>
                      <option value="google_maps">Google Maps (Grounding)</option>
                      <option value="custom">Custom Code</option>
                    </select>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer pt-1">
                      <input 
                        type="checkbox" 
                        checked={tool.enabled}
                        onChange={(e) => updateTool(tool.id, 'enabled', e.target.checked)}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                      />
                      <span className="text-xs font-medium text-neutral-700">Enabled</span>
                  </label>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-6" onClick={() => removeTool(tool.id)}>
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </Button>
            </div>
            
            <Input 
              label="Description / System hint"
              value={tool.description}
              onChange={(e) => updateTool(tool.id, 'description', e.target.value)}
              placeholder="Describes when and how to use this tool..."
            />
            
            {/* HTTP Specifics */}
            {(tool.type === 'http' || tool.type === 'webhook') && (
               <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                     <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Method</label>
                     <select
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-neutral-900"
                      value={tool.httpMethod || 'POST'}
                      onChange={(e) => updateTool(tool.id, 'httpMethod', e.target.value)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                     <Input 
                       label="Endpoint URL"
                       value={tool.httpUrl || ''}
                       onChange={(e) => updateTool(tool.id, 'httpUrl', e.target.value)}
                       placeholder="https://api.example.com/v1/resource"
                       className="font-mono"
                     />
                  </div>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Textarea 
                label="Input Schema (JSON)"
                value={tool.inputSchema || ""}
                onChange={(e) => updateTool(tool.id, 'inputSchema', e.target.value)}
                placeholder="{\n  &quot;type&quot;: &quot;object&quot;,\n  &quot;properties&quot;: { ... }\n}"
                className="font-mono text-xs h-32"
              />
              <Textarea 
                label="Output Schema (JSON)"
                value={tool.outputSchema || ""}
                onChange={(e) => updateTool(tool.id, 'outputSchema', e.target.value)}
                placeholder="{\n  &quot;type&quot;: &quot;object&quot;,\n  &quot;properties&quot;: { ... }\n}"
                className="font-mono text-xs h-32"
              />
            </div>
          </Card>
        ))}
        {config.tools.length === 0 && (
          <div className="text-center py-12 bg-white border border-dashed border-neutral-300 rounded-xl">
             <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             </div>
             <h3 className="text-sm font-medium text-neutral-900">No tools configured</h3>
             <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">Use the AI generator above or add tools manually.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsTab;