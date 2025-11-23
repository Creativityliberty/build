
import React, { useState } from 'react';
import { TeamConfig, TaskConfig, TaskOutputFormat } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { generateTaskDefinition } from '../../services/geminiService';

interface TasksTabProps {
  config: TeamConfig;
  updateConfig: (updates: Partial<TeamConfig>) => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ config, updateConfig }) => {
  const [aiTaskPrompt, setAiTaskPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const tasks = config.tasks || [];

  const addTask = () => {
    const newTask: TaskConfig = {
      id: `task-${Date.now()}`,
      name: "New Task",
      slug: "new_task",
      description: "",
      expectedOutput: "",
      asyncExecution: false,
      humanReview: false,
      outputFormat: "raw",
      contextTasks: [],
      agentId: config.agents[0]?.id
    };
    updateConfig({ tasks: [...tasks, newTask] });
  };

  const handleAiGenerate = async () => {
    if (!aiTaskPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const taskDef = await generateTaskDefinition(aiTaskPrompt);
      const newTask: TaskConfig = {
        id: `task-${Date.now()}`,
        name: taskDef.name || "Generated Task",
        slug: taskDef.slug || "generated_task",
        description: taskDef.description || "",
        expectedOutput: taskDef.expectedOutput || "",
        tags: taskDef.tags || [],
        asyncExecution: false,
        humanReview: false,
        outputFormat: "raw",
        maxExecutionTime: taskDef.maxExecutionTime,
        contextTasks: [],
        agentId: config.agents[0]?.id
      };
      updateConfig({ tasks: [...tasks, newTask] });
      setAiTaskPrompt("");
    } catch (e) {
      console.error(e);
      alert("Failed to generate task.");
    } finally {
      setIsGenerating(false);
    }
  };

  const removeTask = (id: string) => {
    updateConfig({ tasks: tasks.filter(t => t.id !== id) });
  };

  const updateTask = (id: string, field: keyof TaskConfig, value: any) => {
    updateConfig({
      tasks: tasks.map(t => t.id === id ? { ...t, [field]: value } : t)
    });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      
      {/* AI Generator */}
      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input 
              label="AI Task Generator"
              placeholder="e.g. A task to analyze website SEO performance and report scores."
              value={aiTaskPrompt}
              onChange={(e) => setAiTaskPrompt(e.target.value)}
              className="bg-white"
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={handleAiGenerate} 
            isLoading={isGenerating}
            disabled={!aiTaskPrompt}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          >
            Generate Task
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Task Definitions</h3>
          <p className="text-sm text-neutral-500">Define work and assign to agents in the team.</p>
        </div>
        <Button onClick={addTask} icon={<span>+</span>}>Add Task</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="flex flex-col gap-4 relative group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Task Name"
                  value={task.name}
                  onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                />
                <div>
                   <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Assigned Agent</label>
                   <select 
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      value={task.agentId || ''}
                      onChange={(e) => updateTask(task.id, 'agentId', e.target.value)}
                   >
                      <option value="" disabled>Select an Agent...</option>
                      {config.agents.map(a => (
                         <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                      ))}
                   </select>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)} className="text-red-500 hover:bg-red-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </Button>
            </div>

            {/* Tags Input */}
            <Input 
              label="Tags (comma separated)"
              value={task.tags?.join(', ') || ''}
              onChange={(e) => updateTask(task.id, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="e.g. seo, reporting"
            />
            
            <Textarea 
              label="Description / Instructions"
              value={task.description}
              onChange={(e) => updateTask(task.id, 'description', e.target.value)}
              placeholder="Detailed instructions on what the task should do..."
              rows={3}
            />
            
            <Textarea 
              label="Expected Output"
              value={task.expectedOutput}
              onChange={(e) => updateTask(task.id, 'expectedOutput', e.target.value)}
              placeholder="Describe what the result should look like..."
              rows={2}
            />

            {/* Dependencies Section */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
               <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Prerequisites & Context
               </label>
               {tasks.length > 1 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                   {tasks.filter(t => t.id !== task.id).map(depTask => (
                     <label key={depTask.id} className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-100 p-1.5 rounded-md transition-colors">
                        <input 
                          type="checkbox" 
                          checked={task.contextTasks?.includes(depTask.id) || false}
                          onChange={(e) => {
                             const current = task.contextTasks || [];
                             const updated = e.target.checked 
                               ? [...current, depTask.id]
                               : current.filter(id => id !== depTask.id);
                             updateTask(task.id, 'contextTasks', updated);
                          }}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                        />
                        <div className="flex flex-col overflow-hidden">
                           <span className="text-sm font-medium text-neutral-700 truncate" title={depTask.name}>{depTask.name}</span>
                           <span className="text-[10px] text-neutral-400 font-mono truncate">{depTask.slug}</span>
                        </div>
                     </label>
                   ))}
                 </div>
               ) : (
                 <div className="text-xs text-neutral-400 italic">Add more tasks to create workflow dependencies.</div>
               )}
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Existing settings... */}
               <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Execution</label>
                  <div className="space-y-2">
                     <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={task.asyncExecution || false}
                          onChange={(e) => updateTask(task.id, 'asyncExecution', e.target.checked)}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                        />
                        <span className="text-sm text-neutral-700">Async Execution</span>
                     </label>
                     <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={task.humanReview || false}
                          onChange={(e) => updateTask(task.id, 'humanReview', e.target.checked)}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                        />
                        <span className="text-sm text-neutral-700">Requires Human Review</span>
                     </label>
                     <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={task.markdown || false}
                          onChange={(e) => updateTask(task.id, 'markdown', e.target.checked)}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" 
                        />
                        <span className="text-sm text-neutral-700">Markdown Output</span>
                     </label>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Format</label>
                  <select 
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-neutral-900"
                    value={task.outputFormat || 'raw'}
                    onChange={(e) => updateTask(task.id, 'outputFormat', e.target.value as TaskOutputFormat)}
                  >
                    <option value="raw">Raw Text</option>
                    <option value="json">JSON</option>
                    <option value="pydantic">Pydantic Model</option>
                  </select>
                  
                  {task.outputFormat === 'json' && (
                     <div className="mt-2">
                       <Textarea 
                          label="Output JSON Schema"
                          value={typeof task.outputJsonSchema === 'string' ? task.outputJsonSchema : JSON.stringify(task.outputJsonSchema, null, 2) || ""}
                          onChange={(e) => updateTask(task.id, 'outputJsonSchema', e.target.value)}
                          className="font-mono text-xs h-24"
                          placeholder="{ ...schema... }"
                       />
                     </div>
                  )}
               </div>

               <div>
                 <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Timeouts & Limits</label>
                 <div className="space-y-3">
                    <Input 
                       label="Max Time (seconds)" 
                       type="number" 
                       value={task.maxExecutionTime || ''} 
                       onChange={(e) => updateTask(task.id, 'maxExecutionTime', parseInt(e.target.value))}
                       placeholder="e.g. 180"
                    />
                    <Input 
                       label="Max Retries" 
                       type="number" 
                       value={task.maxRetries || ''} 
                       onChange={(e) => updateTask(task.id, 'maxRetries', parseInt(e.target.value))}
                       placeholder="e.g. 2"
                    />
                 </div>
               </div>
            </div>
            
          </Card>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-12 bg-white border border-dashed border-neutral-300 rounded-xl">
             <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
             </div>
             <h3 className="text-sm font-medium text-neutral-900">No tasks defined</h3>
             <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">Use tasks to break down complex agent behaviors into manageable steps.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksTab;