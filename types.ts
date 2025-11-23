
export type TabId = 'settings' | 'team' | 'general' | 'prompts' | 'llm' | 'tools' | 'tasks' | 'knowledge' | 'flow' | 'export';

export enum LLMProvider {
  GOOGLE = 'google',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  QWEN = 'qwen',
  CUSTOM = 'custom'
}

export enum GeminiModel {
  GEMINI_2_5_FLASH = 'gemini-2.5-flash',
  GEMINI_FLASH_LATEST = 'gemini-flash-latest',
  GEMINI_FLASH_LITE = 'gemini-flash-lite-latest',
  GEMINI_3_PRO = 'gemini-3-pro-preview',
  GEMINI_2_5_FLASH_IMAGE = 'gemini-2.5-flash-image',
  GEMINI_3_PRO_IMAGE = 'gemini-3-pro-image-preview',
  GEMINI_NATIVE_AUDIO = 'gemini-2.5-flash-native-audio-preview-09-2025',
  GEMINI_TTS = 'gemini-2.5-flash-preview-tts',
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO_HQ = 'veo-3.1-generate-preview'
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, any>;
  result?: string;
}

export interface GlobalPrompt {
  id: string;
  label: string;
  key: string;
  content: string;
  tags?: string[];
  orderIndex?: number;
}

export interface ToolParam {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  enumValues?: string[];
  orderIndex?: number;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  type: 'http' | 'webhook' | 'internal' | 'mcp' | 'custom' | 'google_search' | 'google_maps';
  description: string;
  enabled: boolean;
  
  // HTTP Specifics
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  httpUrl?: string;
  httpHeaders?: Record<string, string>;

  // Schemas
  inputSchema?: string;
  outputSchema?: string;
  
  // UI Params
  params?: ToolParam[];
}

// --- TASK CONFIGURATION TYPES ---

export type TaskOutputFormat = "raw" | "json" | "pydantic";
export type TaskGuardrailMode = "function" | "llm";

export interface TaskGuardrail {
  id: string;
  mode: TaskGuardrailMode;
  description: string;
  active?: boolean;
  config?: Record<string, unknown>;
}

export interface TaskConfig {
  // Identity
  id: string;
  name: string;
  slug?: string;
  description: string;
  expectedOutput: string;
  tags?: string[];

  // Assignment
  agentId?: string; // ID of the agent in the team (Required for CrewAI)
  allowedTools?: string[];

  // Dependencies
  contextTasks?: string[];

  // Execution
  asyncExecution?: boolean;
  humanReview?: boolean;
  markdown?: boolean;
  maxExecutionTime?: number | null;
  maxRetries?: number | null;

  // Configuration
  config?: Record<string, unknown>;

  // Output
  outputFile?: string | null;
  createDirectory?: boolean;
  outputFormat?: TaskOutputFormat;
  outputJsonSchema?: string; // Stored as string for editing, parsed for runtime
  outputModelName?: string | null;

  // Guardrails
  guardrailMaxRetries?: number | null;
  guardrails?: TaskGuardrail[];
}

// --- KNOWLEDGE & FLOW TYPES ---

export type KnowledgeSourceType = 'text' | 'url' | 'pdf' | 'csv' | 'excel' | 'json' | 'api';

export interface KnowledgeSource {
  id: string;
  title: string;
  type: KnowledgeSourceType;
  tags: string[];
  status: 'indexed' | 'processing' | 'pending';
  content?: string;
  sharedWithCrew: boolean; // True = Crew Level, False = Agent Level
  
  // Schema specific
  filePath?: string; // Virtual path for file based sources
  originalPath?: string;
  mimeType?: string;
  collectionName?: string;
}

export interface EmbedderConfig {
  provider: 'google' | 'openai' | 'azure' | 'ollama' | 'voyage' | 'custom';
  model: string;
  apiKeyEnvVar?: string;
  apiBase?: string; // For Azure/Ollama
}

export interface KnowledgeLink {
  sourceId: string;
  maxChunks?: number;
  relevanceWeight?: number;
}

export interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'prompt' | 'tool_call' | 'decision' | 'end' | 'action';
  description?: string;
  x: number;
  y: number;
  
  // Schema specifics
  name?: string;
  promptId?: string;
  toolId?: string;
  config?: Record<string, any>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  orderIndex?: number;
}

export interface FlowData {
  id?: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  nodes: FlowNode[];
  edges: FlowEdge[];
  summary: string;
}

export interface FallbackLLM {
  provider: string;
  model: string;
  apiKeyEnvVar: string;
  temperature?: number;
  maxTokens?: number;
  orderIndex?: number;
}

export interface RuntimeTemplate {
  id: string;
  label: string;
  description?: string;
  type: string;
}

// --- AGENT & TEAM TYPES ---

export interface AgentConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  
  // CrewAI Specifics
  role: string; 
  goal: string; 
  
  language: string;
  status: 'draft' | 'active' | 'archived';
  currentVersion: number;
  
  personaTone: string; 
  emojiAllowed: boolean;

  // Prompts
  greeting: string;
  baseInstructions: string;
  globalPrompts: GlobalPrompt[];

  llm: {
    provider: LLMProvider;
    model: string;
    apiKeyEnvVar: string;
    temperature: number;
    maxTokens: number;
    topK?: number;
    topP?: number;
    fallbacks?: FallbackLLM[];
  };

  tools: Tool[];
  
  knowledge: {
    sources: KnowledgeSource[];
    embedder: EmbedderConfig;
    vectorProvider?: string;
    chunkSize: number;
    overlap: number;
    topKRetrieval: number;
  };
}

export type ProcessType = 'sequential' | 'hierarchical';

export interface TeamConfig {
  id: string;
  name: string;
  description?: string;
  process: ProcessType;
  
  // Hierarchical specific settings
  managerAgentId?: string; // ID of the custom agent acting as manager
  managerLLM?: { // Fallback if no custom agent is selected
    provider: LLMProvider;
    model: string;
  };
  
  agents: AgentConfig[];
  tasks: TaskConfig[];
  
  runtime?: {
    defaultTemplate?: string;
    templates?: RuntimeTemplate[];
    options?: Record<string, any>;
  };
}

// --- ORG & PROJECT TYPES ---

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string; // SVG string or Emoji
  teams: TeamConfig[]; // Multiple teams allowed
  createdAt: string; // ISO date string
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  projects: Project[];
}