import { Account, Client, Databases, Users } from 'appwrite';

const client = new Client()
  .setEndpoint((import.meta.env.VITE_APPWRITE_ENDPOINT as string) || 'https://cloud.appwrite.io/v1')
  .setProject((import.meta.env.VITE_APPWRITE_PROJECT_ID as string) || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const users = new Users(client);

// Database and Collection IDs
export const DB_ID = 'main';
export const AGENTS_COLLECTION = 'agents';
export const PROJECTS_COLLECTION = 'projects';

// Agent operations
export async function createAgent(name: string, description: string, config: any) {
  return await databases.createDocument(DB_ID, AGENTS_COLLECTION, 'unique()', {
    name,
    description,
    config,
    createdAt: new Date().toISOString(),
  });
}

export async function getAgents() {
  return await databases.listDocuments(DB_ID, AGENTS_COLLECTION);
}

export async function getAgent(agentId: string) {
  return await databases.getDocument(DB_ID, AGENTS_COLLECTION, agentId);
}

export async function updateAgent(agentId: string, data: any) {
  return await databases.updateDocument(DB_ID, AGENTS_COLLECTION, agentId, data);
}

export async function deleteAgent(agentId: string) {
  return await databases.deleteDocument(DB_ID, AGENTS_COLLECTION, agentId);
}

// Project operations
export async function createProject(name: string, description: string, ownerId: string) {
  return await databases.createDocument(DB_ID, PROJECTS_COLLECTION, 'unique()', {
    name,
    description,
    ownerId,
    createdAt: new Date().toISOString(),
  });
}

export async function getProjects() {
  return await databases.listDocuments(DB_ID, PROJECTS_COLLECTION);
}

export async function getProject(projectId: string) {
  return await databases.getDocument(DB_ID, PROJECTS_COLLECTION, projectId);
}

export async function updateProject(projectId: string, data: any) {
  return await databases.updateDocument(DB_ID, PROJECTS_COLLECTION, projectId, data);
}

export async function deleteProject(projectId: string) {
  return await databases.deleteDocument(DB_ID, PROJECTS_COLLECTION, projectId);
}

// Auth operations
export async function loginWithEmail(email: string, password: string) {
  return await account.createEmailPasswordSession(email, password);
}

export async function registerUser(email: string, password: string, name: string) {
  return await account.create('unique()', email, password, name);
}

export async function logout() {
  return await account.deleteSession('current');
}

export async function getCurrentUser() {
  return await account.get();
}
