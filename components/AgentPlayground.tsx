
import React, { useState, useRef, useEffect } from 'react';
import { AgentConfig, ChatMessage } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { simulateAgentResponse } from '../services/geminiService';

interface AgentPlaygroundProps {
  activeAgent: AgentConfig;
  isOpen: boolean;
  onClose: () => void;
}

const AgentPlayground: React.FC<AgentPlaygroundProps> = ({ activeAgent, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0 && activeAgent.greeting) {
      setMessages([{ role: 'model', content: activeAgent.greeting }]);
    }
  }, [isOpen, activeAgent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await simulateAgentResponse(activeAgent, [...messages, userMsg]);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'system', content: "Error: Could not simulate agent response. Check API Key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages(activeAgent.greeting ? [{ role: 'model', content: activeAgent.greeting }] : []);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-neutral-200 transform transition-transform duration-300 z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-neutral-200 flex items-center justify-between px-4 bg-neutral-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
            {activeAgent.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">{activeAgent.name}</h3>
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Simulation
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-neutral-900 text-white rounded-tr-none' 
                  : msg.role === 'system'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-neutral-200">
        <div className="flex gap-2">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message ${activeAgent.name}...`}
            className="flex-1"
            disabled={isTyping}
          />
          <Button size="sm" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </Button>
        </div>
        <div className="flex justify-center mt-2">
           <button onClick={handleClear} className="text-[10px] text-neutral-400 hover:text-red-500 font-medium transition-colors">
             Clear History
           </button>
        </div>
      </div>
    </div>
  );
};

export default AgentPlayground;
