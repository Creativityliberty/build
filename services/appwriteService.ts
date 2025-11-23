import { Account, Client, Databases } from "appwrite";
import {
  AgentConfig,
  KnowledgeSource,
  Project,
  TaskConfig,
  TeamConfig,
  Tool,
} from "../types";

const client = new Client()
  .setEndpoint(
    (import.meta.env.VITE_APPWRITE_ENDPOINT as string) ||
      "https://sgp.cloud.appwrite.io/v1"
  )
  .setProject(
    (import.meta.env.VITE_APPWRITE_PROJECT_ID as string) ||
      "6922677800157746ff9f"
  );

export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs
export const DB_ID = "main";
export const PROJECTS_COLLECTION = "projects";
export const TEAMS_COLLECTION = "teams";
export const AGENTS_COLLECTION = "agents";
export const TASKS_COLLECTION = "tasks";
export const TOOLS_COLLECTION = "tools";
export const KNOWLEDGE_SOURCES_COLLECTION = "knowledge_sources";

// ===== PROJECT OPERATIONS =====
export async function createProject(
  project: Omit<Project, "id">,
  ownerId: string
) {
  return await databases.createDocument(
    DB_ID,
    PROJECTS_COLLECTION,
    "unique()",
    {
      name: project.name,
      description: project.description,
      icon: project.icon,
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function getProjects(ownerId?: string) {
  if (ownerId) {
    return await databases.listDocuments(DB_ID, PROJECTS_COLLECTION, [
      `ownerId == "${ownerId}"`,
    ]);
  }
  return await databases.listDocuments(DB_ID, PROJECTS_COLLECTION);
}

export async function getProject(projectId: string) {
  return await databases.getDocument(DB_ID, PROJECTS_COLLECTION, projectId);
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
) {
  return await databases.updateDocument(DB_ID, PROJECTS_COLLECTION, projectId, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProject(projectId: string) {
  return await databases.deleteDocument(DB_ID, PROJECTS_COLLECTION, projectId);
}

// ===== TEAM OPERATIONS =====
export async function createTeam(
  team: Omit<TeamConfig, "id" | "agents" | "tasks">,
  projectId: string
) {
  return await databases.createDocument(DB_ID, TEAMS_COLLECTION, "unique()", {
    projectId,
    name: team.name,
    description: team.description,
    process: team.process,
    managerAgentId: team.managerAgentId,
    config: team.runtime || {},
    createdAt: new Date().toISOString(),
  });
}

export async function getTeams(projectId: string) {
  return await databases.listDocuments(DB_ID, TEAMS_COLLECTION, [
    `projectId == "${projectId}"`,
  ]);
}

export async function getTeam(teamId: string) {
  return await databases.getDocument(DB_ID, TEAMS_COLLECTION, teamId);
}

export async function updateTeam(teamId: string, updates: Partial<TeamConfig>) {
  return await databases.updateDocument(DB_ID, TEAMS_COLLECTION, teamId, {
    name: updates.name,
    description: updates.description,
    process: updates.process,
    managerAgentId: updates.managerAgentId,
    config: updates.runtime,
  });
}

export async function deleteTeam(teamId: string) {
  return await databases.deleteDocument(DB_ID, TEAMS_COLLECTION, teamId);
}

// ===== AGENT OPERATIONS =====
export async function createAgent(
  agent: Omit<AgentConfig, "id">,
  teamId: string
) {
  return await databases.createDocument(DB_ID, AGENTS_COLLECTION, "unique()", {
    teamId,
    name: agent.name,
    slug: agent.slug,
    description: agent.description,
    role: agent.role,
    goal: agent.goal,
    status: agent.status,
    config: agent,
    createdAt: new Date().toISOString(),
  });
}

export async function getAgents(teamId: string) {
  return await databases.listDocuments(DB_ID, AGENTS_COLLECTION, [
    `teamId == "${teamId}"`,
  ]);
}

export async function getAgent(agentId: string) {
  return await databases.getDocument(DB_ID, AGENTS_COLLECTION, agentId);
}

export async function updateAgent(
  agentId: string,
  agent: Partial<AgentConfig>
) {
  return await databases.updateDocument(DB_ID, AGENTS_COLLECTION, agentId, {
    name: agent.name,
    slug: agent.slug,
    description: agent.description,
    role: agent.role,
    goal: agent.goal,
    status: agent.status,
    config: agent,
  });
}

export async function deleteAgent(agentId: string) {
  return await databases.deleteDocument(DB_ID, AGENTS_COLLECTION, agentId);
}

// ===== TASK OPERATIONS =====
export async function createTask(task: Omit<TaskConfig, "id">, teamId: string) {
  return await databases.createDocument(DB_ID, TASKS_COLLECTION, "unique()", {
    teamId,
    name: task.name,
    slug: task.slug,
    description: task.description,
    expectedOutput: task.expectedOutput,
    agentId: task.agentId,
    config: task,
    createdAt: new Date().toISOString(),
  });
}

export async function getTasks(teamId: string) {
  return await databases.listDocuments(DB_ID, TASKS_COLLECTION, [
    `teamId == "${teamId}"`,
  ]);
}

export async function getTask(taskId: string) {
  return await databases.getDocument(DB_ID, TASKS_COLLECTION, taskId);
}

export async function updateTask(taskId: string, task: Partial<TaskConfig>) {
  return await databases.updateDocument(DB_ID, TASKS_COLLECTION, taskId, {
    name: task.name,
    slug: task.slug,
    description: task.description,
    expectedOutput: task.expectedOutput,
    agentId: task.agentId,
    config: task,
  });
}

export async function deleteTask(taskId: string) {
  return await databases.deleteDocument(DB_ID, TASKS_COLLECTION, taskId);
}

// ===== TOOL OPERATIONS =====
export async function createTool(tool: Omit<Tool, "id">, agentId: string) {
  return await databases.createDocument(DB_ID, TOOLS_COLLECTION, "unique()", {
    agentId,
    name: tool.name,
    slug: tool.slug,
    type: tool.type,
    description: tool.description,
    config: tool,
    createdAt: new Date().toISOString(),
  });
}

export async function getTools(agentId: string) {
  return await databases.listDocuments(DB_ID, TOOLS_COLLECTION, [
    `agentId == "${agentId}"`,
  ]);
}

export async function getTool(toolId: string) {
  return await databases.getDocument(DB_ID, TOOLS_COLLECTION, toolId);
}

export async function updateTool(toolId: string, tool: Partial<Tool>) {
  return await databases.updateDocument(DB_ID, TOOLS_COLLECTION, toolId, {
    name: tool.name,
    slug: tool.slug,
    type: tool.type,
    description: tool.description,
    config: tool,
  });
}

export async function deleteTool(toolId: string) {
  return await databases.deleteDocument(DB_ID, TOOLS_COLLECTION, toolId);
}

// ===== KNOWLEDGE SOURCE OPERATIONS =====
export async function createKnowledgeSource(
  source: Omit<KnowledgeSource, "id">,
  agentId: string
) {
  return await databases.createDocument(
    DB_ID,
    KNOWLEDGE_SOURCES_COLLECTION,
    "unique()",
    {
      agentId,
      title: source.title,
      type: source.type,
      status: source.status,
      content: source.content,
      config: source,
      createdAt: new Date().toISOString(),
    }
  );
}

export async function getKnowledgeSources(agentId: string) {
  return await databases.listDocuments(DB_ID, KNOWLEDGE_SOURCES_COLLECTION, [
    `agentId == "${agentId}"`,
  ]);
}

export async function getKnowledgeSource(sourceId: string) {
  return await databases.getDocument(
    DB_ID,
    KNOWLEDGE_SOURCES_COLLECTION,
    sourceId
  );
}

export async function updateKnowledgeSource(
  sourceId: string,
  source: Partial<KnowledgeSource>
) {
  return await databases.updateDocument(
    DB_ID,
    KNOWLEDGE_SOURCES_COLLECTION,
    sourceId,
    {
      title: source.title,
      type: source.type,
      status: source.status,
      content: source.content,
      config: source,
    }
  );
}

export async function deleteKnowledgeSource(sourceId: string) {
  return await databases.deleteDocument(
    DB_ID,
    KNOWLEDGE_SOURCES_COLLECTION,
    sourceId
  );
}

// ===== AUTH OPERATIONS =====
export async function loginWithEmail(email: string, password: string) {
  return await account.createEmailPasswordSession(email, password);
}

export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  return await account.create("unique()", email, password, name);
}

export async function logout() {
  return await account.deleteSession("current");
}

export async function getCurrentUser() {
  return await account.get();
}
