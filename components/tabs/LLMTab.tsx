
import React, { useState } from 'react';
import { AgentConfig, LLMProvider, GeminiModel } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { generateLLMConfig } from '../../services/geminiService';

interface LLMTabProps {
  config: AgentConfig;
  updateConfig: (updates: Partial<AgentConfig>) => void;
}

const LLMTab: React.FC<LLMTabProps> = ({ config, updateConfig }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const updateLLM = (field: keyof typeof config.llm, value: any) => {
    updateConfig({ llm: { ...config.llm, [field]: value } });
  };

  const handleAutoConfigure = async () => {
    setIsOptimizing(true);
    try {
      const recommendation = await generateLLMConfig({
        name: config.name,
        description: config.description,
        tone: config.personaTone
      });

      if (recommendation) {
        updateConfig({
          llm: {
            ...config.llm,
            temperature: recommendation.temperature,
            maxTokens: recommendation.maxTokens,
            topK: recommendation.topK,
            topP: recommendation.topP
          }
        });
        console.log("AI Recommendation Reason:", recommendation.reasoning);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate configuration. Check API Key.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-500">
      <Card title="Model Selection" description="Choose the brain powering your agent.">
        <div className="space-y-4">
           <div className="flex justify-end">
             <Button 
               variant="secondary" 
               size="sm" 
               onClick={handleAutoConfigure} 
               isLoading={isOptimizing}
               icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
             >
               AI Auto-Configure
             </Button>
           </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Provider</label>
              <select 
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                value={config.llm.provider}
                onChange={(e) => updateLLM('provider', e.target.value)}
              >
                <option value={LLMProvider.GOOGLE}>Google Gemini (Recommended)</option>
                <option value={LLMProvider.OPENAI}>OpenAI</option>
                <option value={LLMProvider.ANTHROPIC}>Anthropic</option>
                <option value={LLMProvider.QWEN}>Qwen</option>
                <option value={LLMProvider.CUSTOM}>Custom / Local</option>
              </select>
            </div>
            
             <Input 
                label="API Key Environment Variable" 
                value={config.llm.apiKeyEnvVar} 
                onChange={(e) => updateLLM('apiKeyEnvVar', e.target.value)} 
                placeholder="e.g. OPENAI_API_KEY"
                className="font-mono"
             />
          </div>

          {config.llm.provider === LLMProvider.GOOGLE && (
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Gemini Model</label>
              <select 
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                value={config.llm.model}
                onChange={(e) => updateLLM('model', e.target.value)}
              >
                <optgroup label="Text & Reasoning">
                  <option value={GeminiModel.GEMINI_2_5_FLASH}>Gemini 2.5 Flash</option>
                  <option value={GeminiModel.GEMINI_FLASH_LATEST}>Gemini Flash Latest</option>
                  <option value={GeminiModel.GEMINI_FLASH_LITE}>Gemini Flash Lite</option>
                  <option value={GeminiModel.GEMINI_3_PRO}>Gemini 3.0 Pro Preview</option>
                </optgroup>
                <optgroup label="Multimodal (Image/Audio)">
                  <option value={GeminiModel.GEMINI_2_5_FLASH_IMAGE}>Gemini 2.5 Flash Image</option>
                  <option value={GeminiModel.GEMINI_3_PRO_IMAGE}>Gemini 3.0 Pro Image Preview</option>
                  <option value={GeminiModel.GEMINI_NATIVE_AUDIO}>Gemini 2.5 Native Audio</option>
                  <option value={GeminiModel.GEMINI_TTS}>Gemini 2.5 TTS</option>
                </optgroup>
                <optgroup label="Video">
                  <option value={GeminiModel.VEO_FAST}>Veo Fast (Video)</option>
                  <option value={GeminiModel.VEO_HQ}>Veo High Quality (Video)</option>
                </optgroup>
              </select>
            </div>
          )}

           {config.llm.provider !== LLMProvider.GOOGLE && (
             <Input label="Model ID" value={config.llm.model} onChange={(e) => updateLLM('model', e.target.value)} />
           )}
        </div>
      </Card>

      <Card title="Parameters" description="Fine-tune the model's creativity and constraints.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <div className="flex justify-between mb-1">
               <label className="text-xs font-semibold text-neutral-500 uppercase">Temperature</label>
               <span className="text-xs font-mono text-neutral-900">{config.llm.temperature}</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="2" 
               step="0.1" 
               value={config.llm.temperature}
               onChange={(e) => updateLLM('temperature', parseFloat(e.target.value))}
               className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
             />
             <p className="text-xs text-neutral-400 mt-1">Lower for precision, higher for creativity.</p>
           </div>

           <div>
             <Input 
                label="Max Output Tokens" 
                type="number" 
                value={config.llm.maxTokens} 
                onChange={(e) => updateLLM('maxTokens', parseInt(e.target.value))} 
             />
           </div>

            <div>
             <Input 
                label="Top K" 
                type="number" 
                value={config.llm.topK} 
                onChange={(e) => updateLLM('topK', parseInt(e.target.value))} 
             />
           </div>

           <div>
             <Input 
                label="Top P" 
                type="number" 
                step="0.05"
                max="1"
                value={config.llm.topP} 
                onChange={(e) => updateLLM('topP', parseFloat(e.target.value))} 
             />
           </div>
        </div>
      </Card>
    </div>
  );
};

export default LLMTab;