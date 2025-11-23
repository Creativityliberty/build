
import React, { useState } from 'react';
import { AgentConfig, KnowledgeSource, KnowledgeSourceType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { generateKnowledgeContent, recommendEmbedderConfig } from '../../services/geminiService';

interface KnowledgeTabProps {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
}

const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ config, updateConfig }) => {
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [viewingSource, setViewingSource] = useState<KnowledgeSource | null>(null);
  const [uploadType, setUploadType] = useState<KnowledgeSourceType>('text');

  const addSource = () => {
    // Simulate file selection for 'file' types
    let fileName = "New Document";
    if (uploadType === 'pdf') fileName = "document.pdf";
    if (uploadType === 'csv') fileName = "data.csv";
    if (uploadType === 'excel') fileName = "spreadsheet.xlsx";
    if (uploadType === 'json') fileName = "data.json";

    const newSource: KnowledgeSource = {
      id: Date.now().toString(),
      title: fileName,
      type: uploadType,
      tags: [uploadType],
      status: 'pending',
      sharedWithCrew: false
    };
    updateConfig({ knowledge: { ...config.knowledge, sources: [...config.knowledge.sources, newSource] } });
  };

  const handleGenerateContent = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    try {
      const content = await generateKnowledgeContent(aiTopic, {
        name: config.name,
        description: config.description
      });
      
      const newSource: KnowledgeSource = {
        id: Date.now().toString(),
        title: aiTopic,
        type: "text",
        tags: ["generated", "ai", "text"],
        status: 'indexed',
        content: content,
        sharedWithCrew: false
      };
      
      updateConfig({ knowledge: { ...config.knowledge, sources: [...config.knowledge.sources, newSource] } });
      setAiTopic("");
    } catch (e) {
      console.error(e);
      alert("Failed to generate knowledge.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoConfigure = async () => {
    setIsOptimizing(true);
    try {
      const rec = await recommendEmbedderConfig({
        name: config.name,
        description: config.description
      });
      
      updateConfig({
        knowledge: {
          ...config.knowledge,
          chunkSize: rec.chunkSize || 1000,
          overlap: rec.overlap || 200,
          embedder: {
            ...config.knowledge.embedder,
            provider: rec.embeddingProvider as any || 'google',
            model: rec.embeddingModel || 'models/text-embedding-004'
          }
        }
      });
    } catch (e) {
      console.error(e);
      alert("Failed to auto-configure knowledge settings.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const removeSource = (id: string) => {
    updateConfig({ 
        knowledge: { 
            ...config.knowledge, 
            sources: config.knowledge.sources.filter(s => s.id !== id) 
        } 
    });
  };

  const toggleShared = (id: string) => {
    updateConfig({
        knowledge: {
            ...config.knowledge,
            sources: config.knowledge.sources.map(s => s.id === id ? { ...s, sharedWithCrew: !s.sharedWithCrew } : s)
        }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      
       {/* AI Generator */}
       <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input 
              label="AI Article Generator"
              placeholder="e.g. Return policy for digital products"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="bg-white"
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={handleGenerateContent} 
            isLoading={isGenerating}
            disabled={!aiTopic}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          >
            Generate Article
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
         
         {/* Left Column: Configuration */}
         <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-semibold text-neutral-900">Configuration</h3>
               <Button variant="ghost" size="sm" onClick={handleAutoConfigure} isLoading={isOptimizing} title="Auto-tune settings">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               </Button>
            </div>

            <Card title="Embedder Settings">
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Provider</label>
                    <select 
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      value={config.knowledge.embedder.provider}
                      onChange={(e) => updateConfig({ knowledge: {...config.knowledge, embedder: {...config.knowledge.embedder, provider: e.target.value as any} }})}
                    >
                      <option value="google">Google (Gemini)</option>
                      <option value="openai">OpenAI</option>
                      <option value="azure">Azure OpenAI</option>
                      <option value="ollama">Ollama (Local)</option>
                      <option value="voyage">Voyage AI</option>
                    </select>
                  </div>
                  <Input 
                    label="Model Name"
                    value={config.knowledge.embedder.model}
                    onChange={(e) => updateConfig({ knowledge: {...config.knowledge, embedder: {...config.knowledge.embedder, model: e.target.value} }})}
                    placeholder="e.g. text-embedding-3-small"
                    className="font-mono text-xs"
                  />
                  {(config.knowledge.embedder.provider === 'azure' || config.knowledge.embedder.provider === 'ollama') && (
                     <Input 
                        label="API Base URL"
                        value={config.knowledge.embedder.apiBase || ''}
                        onChange={(e) => updateConfig({ knowledge: {...config.knowledge, embedder: {...config.knowledge.embedder, apiBase: e.target.value} }})}
                        placeholder="http://localhost:11434"
                     />
                  )}
               </div>
            </Card>

            <Card title="Chunking Strategy">
                <div className="space-y-5">
                   <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-semibold text-neutral-500 uppercase">Chunk Size</label>
                        <span className="text-xs font-mono text-neutral-900">{config.knowledge.chunkSize}</span>
                      </div>
                      <input 
                        type="range" 
                        min="256" 
                        max="4096" 
                        step="64"
                        value={config.knowledge.chunkSize}
                        onChange={(e) => updateConfig({ knowledge: {...config.knowledge, chunkSize: parseInt(e.target.value) }})}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                      />
                   </div>
                   <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-semibold text-neutral-500 uppercase">Overlap</label>
                        <span className="text-xs font-mono text-neutral-900">{config.knowledge.overlap}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="500" 
                        step="10"
                        value={config.knowledge.overlap}
                        onChange={(e) => updateConfig({ knowledge: {...config.knowledge, overlap: parseInt(e.target.value) }})}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                      />
                   </div>
                </div>
            </Card>

            <Card title="Vector Store">
              <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Storage Provider</label>
                  <select 
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-neutral-900"
                    value={config.knowledge.vectorProvider || 'chroma'}
                    onChange={(e) => updateConfig({ knowledge: {...config.knowledge, vectorProvider: e.target.value }})}
                  >
                    <option value="chroma">ChromaDB (Local/Server)</option>
                    <option value="qdrant">Qdrant</option>
                    <option value="pinecone">Pinecone</option>
                  </select>
              </div>
            </Card>
         </div>

         {/* Right Column: Data Sources */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-end justify-between">
               <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Data Sources</h3>
                  <p className="text-sm text-neutral-500">Files and content the agent can access.</p>
               </div>
               <div className="flex items-center gap-2">
                  <select 
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-neutral-900"
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                  >
                    <option value="text">Text File</option>
                    <option value="pdf">PDF Document</option>
                    <option value="csv">CSV Data</option>
                    <option value="excel">Excel Sheet</option>
                    <option value="json">JSON Data</option>
                    <option value="url">Website URL</option>
                  </select>
                  <Button onClick={addSource} icon={<span>+</span>}>Add</Button>
               </div>
            </div>

            <div className="space-y-3">
                {config.knowledge.sources.map((source) => (
                    <div key={source.id} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
                               ${source.type === 'pdf' ? 'bg-red-50 text-red-600' : 
                                 source.type === 'excel' || source.type === 'csv' ? 'bg-green-50 text-green-600' :
                                 source.type === 'json' ? 'bg-yellow-50 text-yellow-600' :
                                 source.type === 'url' ? 'bg-blue-50 text-blue-600' :
                                 'bg-neutral-100 text-neutral-600'
                               }`}>
                               {source.type === 'pdf' && <span className="font-bold text-[10px]">PDF</span>}
                               {(source.type === 'csv' || source.type === 'excel') && <span className="font-bold text-[10px]">DATA</span>}
                               {source.type === 'json' && <span className="font-bold text-[10px]">{source.type.toUpperCase()}</span>}
                               {source.type === 'url' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                               {['file', 'text'].includes(source.type) && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-neutral-900">{source.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${source.status === 'indexed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {source.status}
                                    </span>
                                    {source.sharedWithCrew && (
                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium uppercase flex items-center gap-1">
                                            Crew Shared
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleShared(source.id)} 
                            title={source.sharedWithCrew ? "Unshare with Crew" : "Share with Crew"}
                            className={source.sharedWithCrew ? "text-purple-600 bg-purple-50" : "text-neutral-400"}
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setViewingSource(source)} title="View Details">
                             <svg className="w-4 h-4 text-neutral-500 hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeSource(source.id)}>
                              <svg className="w-4 h-4 text-neutral-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </Button>
                        </div>
                    </div>
                ))}
                {config.knowledge.sources.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-200 rounded-xl">
                        <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
                           <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <p className="text-sm font-medium">No knowledge sources added.</p>
                        <p className="text-xs mt-1">Upload files (PDF, CSV, JSON) or generate content.</p>
                    </div>
                )}
            </div>
         </div>
      </div>

      {/* Preview Modal */}
      {viewingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             {/* Header */}
             <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                <div>
                   <h3 className="text-lg font-bold text-neutral-900">{viewingSource.title}</h3>
                   <div className="flex gap-2 mt-1">
                     <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">
                        {viewingSource.type}
                     </span>
                     {viewingSource.sharedWithCrew && (
                       <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wide font-medium">
                         Shared
                       </span>
                     )}
                   </div>
                </div>
                <button 
                  onClick={() => setViewingSource(null)}
                  className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                {viewingSource.content ? (
                   <div className="prose prose-sm prose-neutral max-w-none">
                      {viewingSource.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))}
                   </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-10">
                     <svg className="w-12 h-12 mb-3 text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     <p>Content preview not available for binary files.</p>
                     <p className="text-xs mt-1">This file will be processed by the vector database upon deployment.</p>
                  </div>
                )}
             </div>

             {/* Footer */}
             <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setViewingSource(null)}>Close</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeTab;
