
import { GoogleGenAI, Type } from "@google/genai";
import { FlowData, AgentConfig, ChatMessage } from "../types";

// Initialize the client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAgentContent = async (
  type: 'greeting' | 'instructions' | 'prompt',
  context: { name: string; description: string; tone: string; extra?: string }
): Promise<string> => {
  const client = getClient();
  if (!client) return "Error: API Key missing.";

  let prompt = "";

  if (type === 'greeting') {
    prompt = `You are an expert AI Agent designer. Create a short, engaging, and welcoming greeting message for an AI agent named "${context.name}".
    Context/Description: ${context.description}.
    Tone: ${context.tone}.
    The greeting should be ready to use directly.`;
  } else if (type === 'instructions') {
    prompt = `You are an expert AI Agent designer. Create a comprehensive set of system instructions (system prompt) for an AI agent named "${context.name}".
    Description: ${context.description}.
    Tone: ${context.tone}.
    Use markdown bullet points. Focus on behavior, constraints, and goals.`;
  } else if (type === 'prompt') {
    prompt = `Create a specific prompt block for the following specific task: "${context.extra}".
    Agent Name: ${context.name}.
    Keep it precise and optimized for LLMs.`;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const generateLLMConfig = async (
  context: { name: string; description: string; tone: string }
) => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  const prompt = `Analyze the following AI agent requirements and recommend the best LLM parameters.
  Agent Name: ${context.name}
  Description: ${context.description}
  Tone: ${context.tone}

  Recommend temperature, maxTokens, topK, and topP.
  `;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          temperature: { type: Type.NUMBER },
          maxTokens: { type: Type.INTEGER },
          topK: { type: Type.INTEGER },
          topP: { type: Type.NUMBER },
          reasoning: { type: Type.STRING, description: "Brief explanation of why these settings were chosen" }
        },
        required: ["temperature", "maxTokens", "topK", "topP"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateToolDefinition = async (
  description: string
) => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  const prompt = `Create a tool definition based on this description: "${description}".
  Generate a name, a unique slug (function_style), and a system description explaining when the AI should use it.
  Suggest the most appropriate type (http, webhook, google_search, google_maps).
  
  IMPORTANT: Also generate a 'inputSchema' and 'outputSchema' as stringified JSON Schema objects. 
  The input schema should define parameters needed. 
  The output schema should define the expected response structure.
  Example schema string: "{\\"type\\": \\"object\\", \\"properties\\": {\\"query\\": {\\"type\\": \\"string\\"}}}"`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          slug: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING },
          inputSchema: { type: Type.STRING, description: "JSON Schema string for input" },
          outputSchema: { type: Type.STRING, description: "JSON Schema string for output" }
        },
        required: ["name", "slug", "description", "type"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateTaskDefinition = async (
  description: string
) => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  const prompt = `Create a structural Task definition for an AI agent based on this description: "${description}".
  
  Generate:
  - name (Human readable)
  - slug (snake_case identifier)
  - description (detailed instructions for the AI)
  - expectedOutput (description of success criteria)
  - tags (list of keywords)
  - maxExecutionTime (reasonable default in seconds)
  
  Return strictly valid JSON.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          slug: { type: Type.STRING },
          description: { type: Type.STRING },
          expectedOutput: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          maxExecutionTime: { type: Type.INTEGER }
        },
        required: ["name", "slug", "description", "expectedOutput"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};


export const generateKnowledgeContent = async (
  topic: string,
  context: { name: string; description: string }
) => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  const prompt = `Write a comprehensive knowledge base article or fact sheet about "${topic}".
  This content is for an AI agent named "${context.name}" to use as reference.
  Agent Context: ${context.description}.
  Format: Structured text with headers.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "";
};

export const recommendEmbedderConfig = async (
  context: { name: string; description: string }
) => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  const prompt = `Recommend Knowledge Base (RAG) configuration for an agent.
  Agent: ${context.name}
  Description: ${context.description}
  
  Recommend:
  - chunkSize: (number, e.g. 1000)
  - overlap: (number, e.g. 200)
  - embeddingProvider: (google, openai, azure, ollama)
  - embeddingModel: (specific model name)
  - reasoning: (short explanation)
  
  Default to Google embeddings if unsure.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          chunkSize: { type: Type.INTEGER },
          overlap: { type: Type.INTEGER },
          embeddingProvider: { type: Type.STRING },
          embeddingModel: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ["chunkSize", "overlap", "embeddingProvider", "embeddingModel"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateProjectIcon = async (
  projectName: string,
  description: string
) => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  const prompt = `Create a simple, modern, and rounded SVG icon code for a project named "${projectName}".
  Description: "${description}".
  
  Requirements:
  - Return ONLY the raw <svg>...</svg> string.
  - Viewbox 0 0 24 24.
  - Use currentColor for stroke/fill where appropriate or neutral colors.
  - Keep it minimal and professional.
  - No markdown fencing, just the code.
  
  If you cannot generate SVG code, return a single Emoji that best represents the project.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text?.trim() || "📁";
    // Clean up if model added markdown blocks despite instructions
    if (text.startsWith('```xml')) text = text.replace(/```xml/g, '').replace(/```/g, '');
    if (text.startsWith('```svg')) text = text.replace(/```svg/g, '').replace(/```/g, '');
    
    return text;
  } catch (e) {
    return "📁"; // Fallback
  }
};

// --- FLOW GENERATION ---

const FLOW_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief textual summary of the strategy." },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["start", "action", "decision", "end"] },
          description: { type: Type.STRING },
          x: { type: Type.NUMBER, description: "X coordinate for visualization (0-800)" },
          y: { type: Type.NUMBER, description: "Y coordinate for visualization (0-600)" }
        },
        required: ["id", "label", "type", "x", "y"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          source: { type: Type.STRING, description: "ID of the source node" },
          target: { type: Type.STRING, description: "ID of the target node" },
          label: { type: Type.STRING, description: "Label for the connecting line, e.g., 'Yes', 'No'" }
        },
        required: ["id", "source", "target"]
      }
    }
  },
  required: ["summary", "nodes", "edges"]
};

export const generateStructuredFlow = async (
  context: { name: string; description: string }
): Promise<FlowData> => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  const prompt = `Design a conversation flow for an AI agent named "${context.name}".
  Description: ${context.description}.
  
  Return a structured JSON representation of the flow nodes and edges for a flowchart.
  Arrange the 'x' and 'y' coordinates logically so the flow goes from Top to Bottom.
  - Start node at y=0.
  - Subsequent nodes increase in y.
  - Branching nodes spread in x.
  `;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: FLOW_SCHEMA as any
    }
  });

  return JSON.parse(response.text || "{}");
};

export const iterateFlowStructure = async (
  currentFlow: FlowData,
  userRequest: string
): Promise<FlowData> => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  const prompt = `You are refining an existing AI Agent conversation flow.
  
  Current Flow JSON: ${JSON.stringify(currentFlow)}
  
  User Request for Change: "${userRequest}"
  
  Update the flow (nodes and edges) to accommodate the user's request.
  Ensure the layout (x, y coordinates) remains logical (Top to Bottom flow).
  Return the complete updated JSON.
  `;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: FLOW_SCHEMA as any
    }
  });

  return JSON.parse(response.text || "{}");
};

// --- PLAYGROUND SIMULATION ---

export const simulateAgentResponse = async (
  agent: AgentConfig,
  history: ChatMessage[]
): Promise<string> => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  // Construct a rich System Prompt simulating the agent runtime
  let systemPrompt = `
  You are simulating an AI Agent defined by the following configuration.
  
  IDENTITY:
  Name: ${agent.name}
  Role: ${agent.role}
  Goal: ${agent.goal}
  Tone: ${agent.personaTone}
  
  CORE INSTRUCTIONS:
  ${agent.baseInstructions}
  
  GLOBAL PROMPTS (Context Modules):
  ${agent.globalPrompts.map(p => `- ${p.label}: ${p.content}`).join('\n')}
  
  AVAILABLE TOOLS (Simulation Mode - You do not execute, just pretend):
  ${agent.tools.map(t => `- ${t.name} (${t.slug}): ${t.description}`).join('\n')}
  
  INSTRUCTIONS FOR SIMULATION:
  - Act exactly as the agent would.
  - If the agent would call a tool, output [TOOL_CALL: tool_slug, args].
  - Maintain the persona strictly.
  `;

  // Map chat history to Gemini format
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash', // Use flash for fast simulation
    contents: contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: agent.llm.temperature,
      maxOutputTokens: agent.llm.maxTokens,
    }
  });

  return response.text || "";
};
