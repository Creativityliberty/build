
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { generateStructuredFlow, iterateFlowStructure } from '../../services/geminiService';
import { FlowData, FlowNode, FlowEdge } from '../../types';
import { Input } from '../ui/Input';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const FlowTab: React.FC = () => {
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Generation
  const handleGenerateFlow = async () => {
    setIsGenerating(true);
    try {
      const data = await generateStructuredFlow({
        name: "Current Agent",
        description: "Based on current configuration" 
      });
      setFlowData(data);
      setMessages([{ role: 'model', text: data.summary }]);
    } catch (e) {
      console.error(e);
      alert("Failed to generate flow.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Iteration
  const handleRefineFlow = async () => {
    if (!flowData || !refineInput.trim()) return;
    
    const userRequest = refineInput;
    setRefineInput("");
    setMessages(prev => [...prev, { role: 'user', text: userRequest }]);
    setIsGenerating(true);

    try {
      const data = await iterateFlowStructure(flowData, userRequest);
      setFlowData(data);
      setMessages(prev => [...prev, { role: 'model', text: data.summary }]);
    } catch (e) {
      console.error(e);
      alert("Failed to refine flow.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to draw lines
  const renderEdges = () => {
    if (!flowData) return null;

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
          </marker>
        </defs>
        {flowData.edges.map((edge) => {
          const source = flowData.nodes.find(n => n.id === edge.source);
          const target = flowData.nodes.find(n => n.id === edge.target);
          
          if (!source || !target) return null;

          // Simple center-to-center calculation (could be improved)
          const x1 = source.x + 96; // 96 is half of w-48 (192px)
          const y1 = source.y + 40; // approx half height
          const x2 = target.x + 96;
          const y2 = target.y;

          // Bezier curve for smooth flow
          const path = `M${x1},${y1} C${x1},${y1 + 50} ${x2},${y2 - 50} ${x2},${y2}`;

          return (
            <g key={edge.id}>
              <path d={path} fill="none" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrow)" />
              {edge.label && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} fill="#4b5563" fontSize="10" textAnchor="middle" className="bg-white px-1">
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex h-[600px] gap-4 animate-in fade-in duration-500">
      
      {/* Left Panel: Chat Interface */}
      <div className="w-80 flex flex-col gap-4">
         <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-neutral-900">Flow Assistant</h3>
              {flowData && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>}
            </div>
            
            {!flowData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm font-medium">Start Designing</p>
                   <p className="text-xs text-neutral-500">Generate a visual flow strategy based on your current config.</p>
                 </div>
                 <Button 
                    variant="primary" 
                    onClick={handleGenerateFlow} 
                    isLoading={isGenerating}
                    className="w-full"
                  >
                    Generate Flow
                  </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                       <div className={`max-w-[90%] rounded-lg p-2 text-xs ${
                         msg.role === 'user' 
                           ? 'bg-neutral-900 text-white' 
                           : 'bg-neutral-100 text-neutral-700'
                       }`}>
                          {msg.text}
                       </div>
                       <span className="text-[9px] text-neutral-400 mt-0.5 capitalize">{msg.role === 'model' ? 'AI' : 'You'}</span>
                    </div>
                  ))}
                   {isGenerating && (
                      <div className="flex items-center gap-2 text-xs text-neutral-400 pl-1">
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                   )}
                   <div ref={chatEndRef} />
                </div>

                <div className="pt-3 border-t border-neutral-100">
                   <div className="flex gap-2">
                      <Input 
                        value={refineInput} 
                        onChange={(e) => setRefineInput(e.target.value)} 
                        placeholder="Update flow (e.g. add loop)..."
                        className="text-xs"
                        disabled={isGenerating}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRefineFlow(); }}
                      />
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleRefineFlow}
                        isLoading={isGenerating}
                        disabled={!refineInput || isGenerating}
                        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                      />
                   </div>
                </div>
              </>
            )}
         </div>
      </div>

      {/* Right Panel: Canvas */}
      <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl relative overflow-hidden shadow-inner group">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-30" 
              style={{ 
                  backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
              }} 
          />

          {/* Canvas Content */}
          <div className="absolute inset-0 overflow-auto custom-scrollbar">
             <div className="relative min-w-[800px] min-h-[800px] p-10 transform scale-75 origin-top-left sm:scale-100">
                {renderEdges()}
                {flowData?.nodes.map((node) => (
                  <div 
                    key={node.id}
                    className={`absolute w-48 p-3 rounded-lg shadow-md border-2 transition-all hover:scale-105 cursor-pointer bg-white
                      ${node.type === 'start' ? 'border-green-200 shadow-green-50' : ''}
                      ${node.type === 'end' ? 'border-red-200 shadow-red-50' : ''}
                      ${node.type === 'action' ? 'border-indigo-200 shadow-indigo-50' : ''}
                      ${node.type === 'decision' ? 'border-amber-200 shadow-amber-50 rounded-xl' : ''}
                    `}
                    style={{ 
                      left: node.x, 
                      top: node.y 
                    }}
                  >
                     <div className={`text-[10px] font-bold uppercase mb-1
                        ${node.type === 'start' ? 'text-green-600' : ''}
                        ${node.type === 'end' ? 'text-red-600' : ''}
                        ${node.type === 'action' ? 'text-indigo-600' : ''}
                        ${node.type === 'decision' ? 'text-amber-600' : ''}
                     `}>
                        {node.type}
                     </div>
                     <div className="text-xs font-bold text-neutral-900 leading-tight">{node.label}</div>
                     {node.description && <div className="text-[10px] text-neutral-500 mt-1 leading-tight">{node.description}</div>}
                  </div>
                ))}
             </div>
          </div>

          {/* Empty State Overlay */}
          {!flowData && !isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="bg-white/80 backdrop-blur px-6 py-4 rounded-xl border border-neutral-200 shadow-sm text-center">
                  <p className="text-sm font-medium text-neutral-500">Canvas Empty</p>
                  <p className="text-xs text-neutral-400">Use the chat to generate a flow.</p>
               </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default FlowTab;