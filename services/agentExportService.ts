
import { AgentConfig, LLMProvider, TaskConfig, FlowData } from "../types";

export const generateAgentRuntimeZip = async (config: AgentConfig, tasks: TaskConfig[] = []) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // 1. ROOT FILES
  
  // package.json
  zip.file("package.json", JSON.stringify({
    "name": config.slug,
    "version": "1.0.0",
    "description": config.description,
    "main": "dist/index.js",
    "scripts": {
      "build": "tsc",
      "start": "node dist/index.js",
      "dev": "ts-node src/index.ts"
    },
    "dependencies": {
      "express": "^4.18.2",
      "dotenv": "^16.3.1",
      "cors": "^2.8.5",
      "body-parser": "^1.20.2",
      "@google/genai": "^0.1.0",
      "openai": "^4.20.1",
      "axios": "^1.6.0"
    },
    "devDependencies": {
      "typescript": "^5.3.2",
      "@types/node": "^20.10.0",
      "@types/express": "^4.17.21",
      "@types/cors": "^2.8.17",
      "ts-node": "^10.9.1"
    }
  }, null, 2));

  // tsconfig.json
  zip.file("tsconfig.json", JSON.stringify({
    "compilerOptions": {
      "target": "es2020",
      "module": "commonjs",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    }
  }, null, 2));

  // .env.example
  const envContent = `PORT=3000
# LLM Keys
${config.llm.apiKeyEnvVar}=your_api_key_here
# Tool Keys
${config.tools.map(t => t.httpHeaders ? Object.keys(t.httpHeaders).join('\n') : '').join('\n')}
`;
  zip.file(".env.example", envContent);

  // 2. SRC FILES

  // src/config.ts - The brain of the agent
  zip.file("src/config.ts", `
import { AgentConfig } from './types';

export const agentConfig: AgentConfig = ${JSON.stringify({ ...config, tasks }, null, 2)};
`);

  // src/types.ts
  zip.file("src/types.ts", `
export interface AgentConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  language: string;
  status: string;
  personaTone: string;
  prompts: {
    greeting: string;
    baseInstructions: string;
    globalPrompts: any[];
  };
  llm: {
    provider: string;
    model: string;
    apiKeyEnvVar: string;
    temperature: number;
    maxTokens: number;
  };
  tools: any[];
  tasks?: any[];
}
`);

  // src/llm.ts - The connector
  zip.file("src/llm.ts", `
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { agentConfig } from "./config";
import dotenv from "dotenv";

dotenv.config();

export async function generateResponse(messages: any[]) {
  const provider = agentConfig.llm.provider;
  const apiKey = process.env[agentConfig.llm.apiKeyEnvVar];

  if (!apiKey) throw new Error(\`Missing API Key: \${agentConfig.llm.apiKeyEnvVar}\`);

  // 1. GOOGLE GEMINI
  if (provider === 'google') {
    const ai = new GoogleGenAI({ apiKey });
    // Construct the full context including system instructions
    const systemInstruction = agentConfig.prompts.baseInstructions;
    
    // Note: This is a simplified implementation. 
    // In a real scenario, you'd map 'messages' to Gemini content format properly.
    const lastMessage = messages[messages.length - 1].content;
    
    const response = await ai.models.generateContent({
      model: agentConfig.llm.model,
      contents: lastMessage, // simplified
      config: {
        systemInstruction: systemInstruction,
        temperature: agentConfig.llm.temperature,
        maxOutputTokens: agentConfig.llm.maxTokens,
      }
    });
    return response.text;
  }

  // 2. OPENAI
  if (provider === 'openai') {
    const openai = new OpenAI({ apiKey });
    const systemMessage = { role: "system", content: agentConfig.prompts.baseInstructions };
    
    const response = await openai.chat.completions.create({
      model: agentConfig.llm.model,
      messages: [systemMessage, ...messages],
      temperature: agentConfig.llm.temperature,
      max_tokens: agentConfig.llm.maxTokens,
    });
    return response.choices[0].message.content;
  }

  throw new Error("Provider not supported in this runtime export yet.");
}
`);

  // src/tools.ts - Generic HTTP Handler
  zip.file("src/tools.ts", `
import axios from "axios";
import { agentConfig } from "./config";

export async function executeTool(slug: string, params: any) {
  const tool = agentConfig.tools.find(t => t.slug === slug);
  if (!tool) throw new Error(\`Tool \${slug} not found\`);

  if (tool.type === 'http' || tool.type === 'webhook') {
    console.log(\`Executing HTTP Tool: \${tool.name}\`);
    
    // Replace env vars in headers
    const headers: any = {};
    if (tool.httpHeaders) {
      for (const [key, val] of Object.entries(tool.httpHeaders)) {
        const valueStr = val as string;
        if (valueStr.includes('{{env.')) {
            const envVar = valueStr.match(/{{env\.(.*?)}}/)?.[1];
            if (envVar && process.env[envVar]) {
                headers[key] = process.env[envVar];
            }
        } else {
            headers[key] = valueStr;
        }
      }
    }

    try {
      const response = await axios({
        method: tool.httpMethod || 'POST',
        url: tool.httpUrl,
        headers: headers,
        data: params
      });
      return response.data;
    } catch (error: any) {
      console.error("Tool execution failed", error.message);
      return { error: error.message };
    }
  }

  return { error: "Tool type not implemented" };
}
`);

  // src/index.ts - The Server
  zip.file("src/index.ts", `
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { agentConfig } from "./config";
import { generateResponse } from "./llm";
import { executeTool } from "./tools";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "running", 
    agent: agentConfig.name, 
    version: agentConfig.currentVersion 
  });
});

// Chat Endpoint
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    console.log(\`Received message for agent: \${agentConfig.name}\`);

    // 1. Generate Response
    const responseText = await generateResponse(messages);

    // 2. Check for Tool Calls (Simplified Regex for demo)
    // In a real agent, you'd use the LLM's native function calling
    // For this demo, we just return the text
    
    res.json({ 
      response: responseText,
      agent: agentConfig.name
    });

  } catch (error: any) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: error.message });
  }
});

// Tool Execution Endpoint (Direct)
app.post("/tool/:slug", async (req, res) => {
  const { slug } = req.params;
  const params = req.body;
  
  try {
    const result = await executeTool(slug, params);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`\n🚀 Agent "\${agentConfig.name}" is running!\`);
  console.log(\`📍 Local: http://localhost:\${PORT}\`);
  console.log(\`📝 Slug: \${agentConfig.slug}\`);
});
`);

  // README.md
  zip.file("README.md", `# ${config.name}

${config.description}

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure Environment:
   Copy \`.env.example\` to \`.env\` and fill in your API keys (e.g., \`${config.llm.apiKeyEnvVar}\`).

3. Run:
   \`\`\`bash
   npm run dev
   \`\`\`

## API

- **POST /chat**: Send messages to the agent.
- **POST /tool/:slug**: Execute a specific tool directly.

## Configuration
This agent is powered by **${config.llm.provider}** (${config.llm.model}).
Configuration is stored in \`src/config.ts\`.

## Tasks
This agent has **${tasks.length}** defined tasks available for execution.
`);

  return zip;
};

export const generatePocketFlowPythonZip = async (config: AgentConfig, tasks: TaskConfig[] = [], flowData?: FlowData) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // 1. pocketflow.py (The Library)
  zip.file("pocketflow.py", `import asyncio, warnings, copy, time

class BaseNode:
    def __init__(self): self.params,self.successors={},{}
    def set_params(self,params): self.params=params
    def next(self,node,action="default"):
        if action in self.successors: warnings.warn(f"Overwriting successor for action '{action}'")
        self.successors[action]=node; return node
    def prep(self,shared): pass
    def exec(self,prep_res): pass
    def post(self,shared,prep_res,exec_res): pass
    def _exec(self,prep_res): return self.exec(prep_res)
    def _run(self,shared): p=self.prep(shared); e=self._exec(p); return self.post(shared,p,e)
    def run(self,shared): 
        if self.successors: warnings.warn("Node won't run successors. Use Flow.")  
        return self._run(shared)
    def __rshift__(self,other): return self.next(other)
    def __sub__(self,action):
        if isinstance(action,str): return _ConditionalTransition(self,action)
        raise TypeError("Action must be a string")

class _ConditionalTransition:
    def __init__(self,src,action): self.src,self.action=src,action
    def __rshift__(self,tgt): return self.src.next(tgt,self.action)

class Node(BaseNode):
    def __init__(self,max_retries=1,wait=0): super().__init__(); self.max_retries,self.wait=max_retries,wait
    def exec_fallback(self,prep_res,exc): raise exc
    def _exec(self,prep_res):
        for self.cur_retry in range(self.max_retries):
            try: return self.exec(prep_res)
            except Exception as e:
                if self.cur_retry==self.max_retries-1: return self.exec_fallback(prep_res,e)
                if self.wait>0: time.sleep(self.wait)

class BatchNode(Node):
    def _exec(self,items): return [super(BatchNode,self)._exec(i) for i in (items or [])]

class Flow(BaseNode):
    def __init__(self,start=None): super().__init__(); self.start_node=start
    def start(self,start): self.start_node=start; return start
    def get_next_node(self,curr,action):
        nxt=curr.successors.get(action or "default")
        if not nxt and curr.successors: warnings.warn(f"Flow ends: '{action}' not found in {list(curr.successors)}")
        return nxt
    def _orch(self,shared,params=None):
        curr,p,last_action =copy.copy(self.start_node),(params or {**self.params}),None
        while curr: curr.set_params(p); last_action=curr._run(shared); curr=copy.copy(self.get_next_node(curr,last_action))
        return last_action
    def _run(self,shared): p=self.prep(shared); o=self._orch(shared); return self.post(shared,p,o)
    def post(self,shared,prep_res,exec_res): return exec_res

class BatchFlow(Flow):
    def _run(self,shared):
        pr=self.prep(shared) or []
        for bp in pr: self._orch(shared,{**self.params,**bp})
        return self.post(shared,pr,None)

class AsyncNode(Node):
    async def prep_async(self,shared): pass
    async def exec_async(self,prep_res): pass
    async def exec_fallback_async(self,prep_res,exc): raise exc
    async def post_async(self,shared,prep_res,exec_res): pass
    async def _exec(self,prep_res): 
        for self.cur_retry in range(self.max_retries):
            try: return await self.exec_async(prep_res)
            except Exception as e:
                if self.cur_retry==self.max_retries-1: return await self.exec_fallback_async(prep_res,e)
                if self.wait>0: await asyncio.sleep(self.wait)
    async def run_async(self,shared): 
        if self.successors: warnings.warn("Node won't run successors. Use AsyncFlow.")  
        return await self._run_async(shared)
    async def _run_async(self,shared): p=await self.prep_async(shared); e=await self._exec(p); return await self.post_async(shared,p,e)
    def _run(self,shared): raise RuntimeError("Use run_async.")

class AsyncBatchNode(AsyncNode,BatchNode):
    async def _exec(self,items): return [await super(AsyncBatchNode,self)._exec(i) for i in items]

class AsyncParallelBatchNode(AsyncNode,BatchNode):
    async def _exec(self,items): return await asyncio.gather(*(super(AsyncParallelBatchNode,self)._exec(i) for i in items))

class AsyncFlow(Flow,AsyncNode):
    async def _orch_async(self,shared,params=None):
        curr,p,last_action =copy.copy(self.start_node),(params or {**self.params}),None
        while curr: curr.set_params(p); last_action=await curr._run_async(shared) if isinstance(curr,AsyncNode) else curr._run(shared); curr=copy.copy(self.get_next_node(curr,last_action))
        return last_action
    async def _run_async(self,shared): p=await self.prep_async(shared); o=await self._orch_async(shared); return await self.post_async(shared,p,o)
    async def post_async(self,shared,prep_res,exec_res): return exec_res

class AsyncBatchFlow(AsyncFlow,BatchFlow):
    async def _run_async(self,shared):
        pr=await self.prep_async(shared) or []
        for bp in pr: await self._orch_async(shared,{**self.params,**bp})
        return await self.post_async(shared,pr,None)

class AsyncParallelBatchFlow(AsyncFlow,BatchFlow):
    async def _run_async(self,shared): 
        pr=await self.prep_async(shared) or []
        await asyncio.gather(*(self._orch_async(shared,{**self.params,**bp}) for bp in pr))
        return await self.post_async(shared,pr,None)
`);

  // 2. main.py
  // Construct Python nodes based on flowData or tasks
  let mainPy = `import asyncio
from pocketflow import AsyncFlow, AsyncNode
import os

# Configuration
AGENT_NAME = "${config.name}"
API_KEY = os.getenv("${config.llm.apiKeyEnvVar}")

class AgentContext:
    def __init__(self):
        self.history = []
        self.data = {}

# --- NODES ---
`;

  // Generate Nodes from Visual Flow if available, otherwise generic
  if (flowData && flowData.nodes.length > 0) {
    flowData.nodes.forEach(node => {
        mainPy += `
class ${node.type.charAt(0).toUpperCase() + node.type.slice(1)}Node_${node.id.replace(/-/g, '_')}(AsyncNode):
    async def prep_async(self, shared):
        print(f"Processing Node: ${node.label}")
        return shared

    async def exec_async(self, shared):
        # Logic for ${node.label}
        return "success"

    async def post_async(self, shared, prep_res, exec_res):
        return "default"
`;
    });

    mainPy += `
# --- FLOW ORCHESTRATION ---
async def main():
    shared = AgentContext()
    
    # Instantiate Nodes
`;
    flowData.nodes.forEach(node => {
        mainPy += `    node_${node.id.replace(/-/g, '_')} = ${node.type.charAt(0).toUpperCase() + node.type.slice(1)}Node_${node.id.replace(/-/g, '_')}()\n`;
    });

    mainPy += `\n    # Define Edges\n`;
    flowData.edges.forEach(edge => {
        mainPy += `    node_${edge.source.replace(/-/g, '_')} >> node_${edge.target.replace(/-/g, '_')}\n`;
    });

    const startNode = flowData.nodes.find(n => n.type === 'start') || flowData.nodes[0];
    mainPy += `
    # Create Flow
    flow = AsyncFlow(start=node_${startNode.id.replace(/-/g, '_')})
    
    # Run
    print("Starting PocketFlow for ${config.name}...")
    await flow.run_async(shared)
    print("Flow Complete.")

if __name__ == "__main__":
    asyncio.run(main())
`;

  } else {
    // Fallback generic structure
    mainPy += `
class StartNode(AsyncNode):
    async def exec_async(self, shared):
        print("Agent Started")
        return "next"

class EndNode(AsyncNode):
    async def exec_async(self, shared):
        print("Agent Finished")
        return "done"

async def main():
    shared = AgentContext()
    start = StartNode()
    end = EndNode()
    
    start >> end
    
    flow = AsyncFlow(start=start)
    await flow.run_async(shared)

if __name__ == "__main__":
    asyncio.run(main())
`;
  }

  zip.file("main.py", mainPy);

  // requirements.txt
  zip.file("requirements.txt", `aiohttp\npython-dotenv\n`);

  // README.md
  zip.file("README.md", `# ${config.name} - PocketFlow Agent

This agent uses the lightweight PocketFlow library for orchestration.

## Setup
1. Install Python 3.8+
2. \`pip install -r requirements.txt\`
3. Set env var: \`export ${config.llm.apiKeyEnvVar}=your_key\`

## Run
\`python main.py\`
`);

  return zip;
};
