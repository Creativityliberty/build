# Numtema AI Builder - Database Schema

## Overview

This document describes the complete Appwrite database schema for the Numtema AI Builder application. The database is organized hierarchically: **Organization → Projects → Teams → Agents/Tasks → Tools/Knowledge**.

---

## Database: `main`

### Collection 1: `projects`

**Purpose:** Store all projects within the organization.

**Attributes:**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `$id` | string | ✓ | Auto-generated document ID |
| `name` | string | ✓ | Project name (e.g., "Default Project") |
| `description` | string | ✗ | Project description |
| `icon` | string | ✗ | Emoji or SVG icon for the project |
| `ownerId` | string | ✓ | User ID of the project owner |
| `createdAt` | datetime | ✓ | ISO timestamp of creation |
| `updatedAt` | datetime | ✓ | ISO timestamp of last update |

**Example Document:**
```json
{
  "$id": "proj-001",
  "name": "Default Project",
  "description": "Main agency operations crew.",
  "icon": "📁",
  "ownerId": "user-123",
  "createdAt": "2025-11-23T02:00:00.000Z",
  "updatedAt": "2025-11-23T02:00:00.000Z"
}
```

**Indexes Recommended:**
- `ownerId` (for filtering projects by owner)
- `createdAt` (for sorting by creation date)

---

### Collection 2: `teams`

**Purpose:** Store teams/crews within a project. Teams orchestrate multiple agents and tasks.

**Attributes:**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `$id` | string | ✓ | Auto-generated document ID |
| `projectId` | string | ✓ | Reference to parent project |
| `name` | string | ✓ | Team name (e.g., "Core Operations Crew") |
| `description` | string | ✗ | Team description |
| `process` | string | ✓ | Execution process: `sequential` or `hierarchical` |
| `managerAgentId` | string | ✗ | ID of the manager agent (for hierarchical process) |
| `config` | json | ✗ | Runtime configuration (templates, options) |
| `createdAt` | datetime | ✓ | ISO timestamp of creation |

**Example Document:**
```json
{
  "$id": "team-001",
  "projectId": "proj-001",
  "name": "Core Operations Crew",
  "description": "A specialized team for digital agency operations.",
  "process": "sequential",
  "managerAgentId": null,
  "config": {
    "defaultTemplate": "crewai",
    "templates": [],
    "options": {}
  },
  "createdAt": "2025-11-23T02:00:00.000Z"
}
```

**Process Types:**
- **sequential**: Tasks execute one after another in order
- **hierarchical**: A manager agent coordinates other agents

**Indexes Recommended:**
- `projectId` (for filtering teams by project)
- `process` (for filtering by execution type)

---

### Collection 3: `agents`

**Purpose:** Store AI agent configurations. Each agent is a member of a team.

**Attributes:**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `$id` | string | ✓ | Auto-generated document ID |
| `teamId` | string | ✓ | Reference to parent team |
| `name` | string | ✓ | Agent name (e.g., "Léo") |
| `slug` | string | ✓ | URL-friendly identifier (e.g., "leo-numtema") |
| `description` | string | ✗ | Agent description |
| `role` | string | ✗ | Agent role (e.g., "Lead Qualifier") |
| `goal` | string | ✗ | Agent's primary goal |
| `status` | string | ✓ | Status: `draft`, `active`, or `archived` |
| `config` | json | ✓ | Full agent configuration (see below) |
| `createdAt` | datetime | ✓ | ISO timestamp of creation |

**Config Structure (JSON):**
```json
{
  "id": "agent-leo-numtema",
  "name": "Léo",
  "slug": "leo-numtema",
  "description": "Assistant digital pour Nümtema Agency.",
  "role": "Lead Qualifier",
  "goal": "Qualify incoming leads and route them to the right service.",
  "language": "fr",
  "status": "active",
  "currentVersion": 1,
  "personaTone": "Clair, direct, chaleureux",
  "emojiAllowed": true,
  "greeting": "Bonjour 👋 Je suis Léo, l'assistant digital de Nümtema Agency.",
  "baseInstructions": "Tu es Léo, l'assistant digital de Nümtema Agency...",
  "globalPrompts": [],
  "llm": {
    "provider": "google",
    "model": "gemini-2.5-flash",
    "apiKeyEnvVar": "GEMINI_API_KEY",
    "temperature": 0.7,
    "maxTokens": 2048,
    "topK": null,
    "topP": null,
    "fallbacks": []
  },
  "tools": [],
  "knowledge": {
    "sources": [],
    "embedder": {
      "provider": "google",
      "model": "models/text-embedding-004"
    },
    "vectorProvider": null,
    "chunkSize": 1000,
    "overlap": 200,
    "topKRetrieval": 3
  }
}
```

**Example Document:**
```json
{
  "$id": "agent-001",
  "teamId": "team-001",
  "name": "Léo",
  "slug": "leo-numtema",
  "description": "Assistant digital pour Nümtema Agency.",
  "role": "Lead Qualifier",
  "goal": "Qualify incoming leads and route them to the right service.",
  "status": "active",
  "config": { /* full config as above */ },
  "createdAt": "2025-11-23T02:00:00.000Z"
}
```

**LLM Providers Supported:**
- `google` (Gemini)
- `openai` (ChatGPT)
- `anthropic` (Claude)
- `qwen` (Alibaba)
- `custom`

**Indexes Recommended:**
- `teamId` (for filtering agents by team)
- `status` (for filtering by status)
- `slug` (for unique lookups)

---

### Collection 4: `tasks`

**Purpose:** Store tasks/duties that agents execute within a team workflow.

**Attributes:**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `$id` | string | ✓ | Auto-generated document ID |
| `teamId` | string | ✓ | Reference to parent team |
| `name` | string | ✓ | Task name (e.g., "Qualification projet site web") |
| `slug` | string | ✗ | URL-friendly identifier (e.g., "qualif_site_web") |
| `description` | string | ✗ | Task description |
| `expectedOutput` | string | ✗ | Expected output format/description |
| `agentId` | string | ✗ | ID of the assigned agent |
| `config` | json | ✓ | Full task configuration (see below) |
| `createdAt` | datetime | ✓ | ISO timestamp of creation |

**Config Structure (JSON):**
```json
{
  "id": "task-001",
  "name": "Qualification projet site web",
  "slug": "qualif_site_web",
  "description": "Qualifier un projet de création ou refonte de site web pour Nümtema.",
  "expectedOutput": "Un résumé structuré du besoin site web.",
  "tags": ["site_web", "qualification"],
  "agentId": "agent-leo-numtema",
  "allowedTools": [],
  "contextTasks": [],
  "asyncExecution": false,
  "humanReview": false,
  "markdown": true,
  "maxExecutionTime": 180,
  "maxRetries": 1,
  "outputFormat": "json",
  "outputFile": null,
  "createDirectory": false,
  "outputJsonSchema": null,
  "outputModelName": null,
  "guardrailMaxRetries": null,
  "guardrails": []
}
```

**Output Formats:**
- `raw` - Plain text output
- `json` - Structured JSON output
- `pydantic` - Pydantic model validation

**Example Document:**
```json
{
  "$id": "task-001",
  "teamId": "team-001",
  "name": "Qualification projet site web",
  "slug": "qualif_site_web",
  "description": "Qualifier un projet de création ou refonte de site web pour Nümtema.",
  "expectedOutput": "Un résumé structuré du besoin site web.",
  "agentId": "agent-001",
  "config": { /* full config as above */ },
  "createdAt": "2025-11-23T02:00:00.000Z"
}
```

**Indexes Recommended:**
- `teamId` (for filtering tasks by team)
- `agentId` (for filtering tasks by agent)
- `slug` (for unique lookups)

---

### Collection 5: `tools`

**Purpose:** Store tools/integrations that agents can use to perform actions.

**Attributes:**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `$id` | string | ✓ | Auto-generated document ID |
| `agentId` | string | ✓ | Reference to parent agent |
| `name` | string | ✓ | Tool name (e.g., "Google Search") |
| `slug` | string | ✓ | URL-friendly identifier (e.g., "google_search") |
| `type` | string | ✓ | Tool type (see below) |
| `description` | string | ✗ | Tool description |
| `config` | json | ✓ | Full tool configuration (see below) |
| `createdAt` | datetime | ✓ | ISO timestamp of creation |

**Tool Types:**
- `http` - HTTP/REST API calls
- `webhook` - Webhook integrations
- `internal` - Internal functions
- `mcp` - Model Context Protocol
- `custom` - Custom implementations
- `google_search` - Google Search integration
- `google_maps` - Google Maps integration

**Config Structure (JSON):**
```json
{
  "id": "tool-001",
  "name": "Google Search",
  "slug": "google_search",
  "type": "google_search",
  "description": "Search the web using Google",
  "enabled": true,
  "httpMethod": null,
  "httpUrl": null,
  "httpHeaders": null,
  "inputSchema": "{\"type\": \"object\", \"properties\": {\"query\": {\"type\": \"string\"}}}",
  "outputSchema": "{\"type\": \"object\", \"properties\": {\"results\": {\"type\": \"array\"}}}",
  "params": [
    {
      "name": "query",
      "type": "string",
      "required": true,
      "description": "Search query",
      "enumValues": null,
      "orderIndex": 0
    }
  ]
}
```

**Example Document:**
```json
{
  "$id": "tool-001",
  "agentId": "agent-001",
  "name": "Google Search",
  "slug": "google_search",
  "type": "google_search",
  "description": "Search the web using Google",
  "config": { /* full config as above */ },
  "createdAt": "2025-11-23T02:00:00.000Z"
}
```

**Indexes Recommended:**
- `agentId` (for filtering tools by agent)
- `type` (for filtering by tool type)
- `slug` (for unique lookups)

---

### Collection 6: `knowledge_sources`

**Purpose:** Store knowledge bases/documents that agents can reference for RAG (Retrieval-Augmented Generation).

**Attributes:**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `$id` | string | ✓ | Auto-generated document ID |
| `agentId` | string | ✓ | Reference to parent agent |
| `title` | string | ✓ | Knowledge source title |
| `type` | string | ✓ | Source type (see below) |
| `status` | string | ✓ | Status: `indexed`, `processing`, or `pending` |
| `content` | string | ✗ | Text content (for text sources) |
| `config` | json | ✓ | Full configuration (see below) |
| `createdAt` | datetime | ✓ | ISO timestamp of creation |

**Source Types:**
- `text` - Plain text content
- `url` - Web page URL
- `pdf` - PDF document
- `csv` - CSV file
- `excel` - Excel spreadsheet
- `json` - JSON data
- `api` - API endpoint

**Config Structure (JSON):**
```json
{
  "id": "ks-001",
  "title": "Nümtema Agency Guidelines",
  "type": "text",
  "tags": ["guidelines", "agency"],
  "status": "indexed",
  "content": "Nümtema is a digital agency specialized in...",
  "sharedWithCrew": true,
  "filePath": null,
  "originalPath": null,
  "mimeType": "text/plain",
  "collectionName": "numtema_guidelines",
  "embedder": {
    "provider": "google",
    "model": "models/text-embedding-004"
  },
  "chunkSize": 1000,
  "overlap": 200,
  "topKRetrieval": 3
}
```

**Example Document:**
```json
{
  "$id": "ks-001",
  "agentId": "agent-001",
  "title": "Nümtema Agency Guidelines",
  "type": "text",
  "status": "indexed",
  "content": "Nümtema is a digital agency specialized in...",
  "config": { /* full config as above */ },
  "createdAt": "2025-11-23T02:00:00.000Z"
}
```

**Indexes Recommended:**
- `agentId` (for filtering sources by agent)
- `type` (for filtering by source type)
- `status` (for filtering by indexing status)

---

## Data Relationships

```
Organization (implicit)
  └── Project (projects collection)
      └── Team (teams collection)
          ├── Agent (agents collection)
          │   ├── Tool (tools collection)
          │   └── Knowledge Source (knowledge_sources collection)
          └── Task (tasks collection)
              └── Assigned to Agent
```

---

## API Usage Examples

### Create a Project
```typescript
import { createProject } from './services/appwriteService';

const project = await createProject(
  {
    name: "New Project",
    description: "Project description",
    icon: "📊"
  },
  "user-123"
);
```

### Create a Team
```typescript
import { createTeam } from './services/appwriteService';

const team = await createTeam(
  {
    name: "Operations Team",
    description: "Team description",
    process: "sequential"
  },
  "proj-001"
);
```

### Create an Agent
```typescript
import { createAgent } from './services/appwriteService';

const agent = await createAgent(
  {
    name: "Assistant",
    slug: "assistant",
    description: "AI Assistant",
    role: "Helper",
    goal: "Help users",
    status: "active",
    language: "en",
    personaTone: "Friendly",
    emojiAllowed: true,
    greeting: "Hello!",
    baseInstructions: "You are helpful...",
    globalPrompts: [],
    llm: {
      provider: "google",
      model: "gemini-2.5-flash",
      apiKeyEnvVar: "GEMINI_API_KEY",
      temperature: 0.7,
      maxTokens: 2048
    },
    tools: [],
    knowledge: {
      sources: [],
      embedder: { provider: "google", model: "models/text-embedding-004" },
      chunkSize: 1000,
      overlap: 200,
      topKRetrieval: 3
    }
  },
  "team-001"
);
```

### Get All Agents in a Team
```typescript
import { getAgents } from './services/appwriteService';

const agents = await getAgents("team-001");
```

### Create a Task
```typescript
import { createTask } from './services/appwriteService';

const task = await createTask(
  {
    name: "Qualification Task",
    slug: "qualif_task",
    description: "Qualify leads",
    expectedOutput: "Structured qualification",
    agentId: "agent-001",
    asyncExecution: false,
    humanReview: false,
    markdown: true,
    maxExecutionTime: 180,
    maxRetries: 1,
    outputFormat: "json"
  },
  "team-001"
);
```

### Create a Tool
```typescript
import { createTool } from './services/appwriteService';

const tool = await createTool(
  {
    name: "Google Search",
    slug: "google_search",
    type: "google_search",
    description: "Search the web",
    enabled: true,
    inputSchema: '{"type": "object"}',
    outputSchema: '{"type": "object"}',
    params: []
  },
  "agent-001"
);
```

### Create a Knowledge Source
```typescript
import { createKnowledgeSource } from './services/appwriteService';

const source = await createKnowledgeSource(
  {
    title: "Agency Guidelines",
    type: "text",
    status: "indexed",
    content: "Guidelines content...",
    tags: ["guidelines"],
    sharedWithCrew: true
  },
  "agent-001"
);
```

---

## Setup Instructions

1. **Create Database**: Create a database named `main` in your Appwrite project
2. **Create Collections**: Create all 6 collections with their attributes as defined above
3. **Add Indexes**: Add recommended indexes for better query performance
4. **Set Permissions**: Configure document permissions based on your security requirements
5. **Use Services**: Import and use functions from `services/appwriteService.ts` in your React components

---

## Notes

- All timestamps should be ISO 8601 format
- The `config` field in agents, tasks, tools, and knowledge sources stores the complete configuration as JSON
- Use `unique()` when creating documents to auto-generate IDs
- Filter queries use Appwrite's query syntax (e.g., `teamId == "team-001"`)
- The app currently stores data in React state; integrate these services to persist to Appwrite
