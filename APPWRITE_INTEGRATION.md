# Appwrite Integration Guide

## Overview

This guide explains how to integrate Appwrite into the Numtema AI Builder application. The app uses Appwrite for:
- **Database**: Storing projects, teams, agents, tasks, tools, and knowledge sources
- **Authentication**: User login and registration
- **Real-time sync**: Keep data synchronized across devices

## Setup

### 1. Environment Variables

Add these to your `.env.local`:

```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6922677800157746ff9f
```

### 2. Wrap App with AppwriteProvider

In `index.tsx`:

```tsx
import { AppwriteProvider } from './context/AppwriteContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppwriteProvider>
      <App />
    </AppwriteProvider>
  </React.StrictMode>,
);
```

### 3. Use Hooks in Components

#### Get Current User

```tsx
import { useAppwriteAuth } from './context/AppwriteContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAppwriteAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

#### Manage Projects

```tsx
import { useProjects } from './hooks/useProjects';

function ProjectsList() {
  const { projects, loading, error, create, update, remove } = useProjects('user-123');

  const handleCreate = async () => {
    await create({
      name: 'New Project',
      description: 'My project',
      icon: '📁',
      teams: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, 'user-123');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.$id}>
          <h3>{project.name}</h3>
          <button onClick={() => remove(project.$id)}>Delete</button>
        </div>
      ))}
      <button onClick={handleCreate}>Create Project</button>
    </div>
  );
}
```

#### Manage Teams

```tsx
import { useTeams } from './hooks/useTeams';

function TeamsList({ projectId }) {
  const { teams, loading, error, create, update, remove } = useTeams(projectId);

  const handleCreate = async () => {
    await create({
      name: 'New Team',
      description: 'Team description',
      process: 'sequential',
    });
  };

  return (
    <div>
      {teams.map(team => (
        <div key={team.$id}>
          <h3>{team.name}</h3>
          <p>{team.process}</p>
        </div>
      ))}
      <button onClick={handleCreate}>Create Team</button>
    </div>
  );
}
```

#### Manage Agents

```tsx
import { useAgents } from './hooks/useAgents';

function AgentsList({ teamId }) {
  const { agents, loading, error, create, update, remove } = useAgents(teamId);

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.$id}>
          <h3>{agent.name}</h3>
          <p>Role: {agent.role}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Manage Tasks

```tsx
import { useTasks } from './hooks/useTasks';

function TasksList({ teamId }) {
  const { tasks, loading, error, create, update, remove } = useTasks(teamId);

  return (
    <div>
      {tasks.map(task => (
        <div key={task.$id}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Manage Tools

```tsx
import { useTools } from './hooks/useTools';

function ToolsList({ agentId }) {
  const { tools, loading, error, create, update, remove } = useTools(agentId);

  return (
    <div>
      {tools.map(tool => (
        <div key={tool.$id}>
          <h3>{tool.name}</h3>
          <p>Type: {tool.type}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Manage Knowledge Sources

```tsx
import { useKnowledgeSources } from './hooks/useKnowledgeSources';

function KnowledgeSourcesList({ agentId }) {
  const { sources, loading, error, create, update, remove } = useKnowledgeSources(agentId);

  return (
    <div>
      {sources.map(source => (
        <div key={source.$id}>
          <h3>{source.title}</h3>
          <p>Status: {source.status}</p>
        </div>
      ))}
    </div>
  );
}
```

## Available Hooks

### `useAppwriteAuth()`

Authentication context hook.

**Returns:**
- `user` - Current user object
- `loading` - Loading state
- `error` - Error object
- `isAuthenticated` - Boolean
- `login(email, password)` - Login function
- `register(email, password, name)` - Register function
- `logout()` - Logout function

### `useProjects(ownerId?)`

Manage projects.

**Returns:**
- `projects` - Array of projects
- `loading` - Loading state
- `error` - Error object
- `create(projectData, ownerId)` - Create project
- `update(projectId, updates)` - Update project
- `remove(projectId)` - Delete project
- `fetchProjects()` - Refresh projects

### `useTeams(projectId?)`

Manage teams.

**Returns:**
- `teams` - Array of teams
- `loading` - Loading state
- `error` - Error object
- `create(teamData)` - Create team
- `update(teamId, updates)` - Update team
- `remove(teamId)` - Delete team
- `fetchTeams()` - Refresh teams

### `useAgents(teamId?)`

Manage agents.

**Returns:**
- `agents` - Array of agents
- `loading` - Loading state
- `error` - Error object
- `create(agentData)` - Create agent
- `update(agentId, updates)` - Update agent
- `remove(agentId)` - Delete agent
- `fetchAgents()` - Refresh agents

### `useTasks(teamId?)`

Manage tasks.

**Returns:**
- `tasks` - Array of tasks
- `loading` - Loading state
- `error` - Error object
- `create(taskData)` - Create task
- `update(taskId, updates)` - Update task
- `remove(taskId)` - Delete task
- `fetchTasks()` - Refresh tasks

### `useTools(agentId?)`

Manage tools.

**Returns:**
- `tools` - Array of tools
- `loading` - Loading state
- `error` - Error object
- `create(toolData)` - Create tool
- `update(toolId, updates)` - Update tool
- `remove(toolId)` - Delete tool
- `fetchTools()` - Refresh tools

### `useKnowledgeSources(agentId?)`

Manage knowledge sources.

**Returns:**
- `sources` - Array of knowledge sources
- `loading` - Loading state
- `error` - Error object
- `create(sourceData)` - Create source
- `update(sourceId, updates)` - Update source
- `remove(sourceId)` - Delete source
- `fetchSources()` - Refresh sources

## Service Functions

All Appwrite operations are available in `services/appwriteService.ts`:

### Projects
- `createProject(project, ownerId)`
- `getProjects(ownerId?)`
- `getProject(projectId)`
- `updateProject(projectId, updates)`
- `deleteProject(projectId)`

### Teams
- `createTeam(team, projectId)`
- `getTeams(projectId)`
- `getTeam(teamId)`
- `updateTeam(teamId, updates)`
- `deleteTeam(teamId)`

### Agents
- `createAgent(agent, teamId)`
- `getAgents(teamId)`
- `getAgent(agentId)`
- `updateAgent(agentId, updates)`
- `deleteAgent(agentId)`

### Tasks
- `createTask(task, teamId)`
- `getTasks(teamId)`
- `getTask(taskId)`
- `updateTask(taskId, updates)`
- `deleteTask(taskId)`

### Tools
- `createTool(tool, agentId)`
- `getTools(agentId)`
- `getTool(toolId)`
- `updateTool(toolId, updates)`
- `deleteTool(toolId)`

### Knowledge Sources
- `createKnowledgeSource(source, agentId)`
- `getKnowledgeSources(agentId)`
- `getKnowledgeSource(sourceId)`
- `updateKnowledgeSource(sourceId, updates)`
- `deleteKnowledgeSource(sourceId)`

### Authentication
- `loginWithEmail(email, password)`
- `registerUser(email, password, name)`
- `logout()`
- `getCurrentUser()`

## Error Handling

All hooks provide error handling:

```tsx
const { data, loading, error } = useProjects('user-123');

if (error) {
  console.error('Failed to load projects:', error.message);
  return <div>Error: {error.message}</div>;
}
```

## Best Practices

1. **Always check loading state** before rendering data
2. **Handle errors gracefully** with user-friendly messages
3. **Use optional chaining** when accessing nested properties: `project?.name`
4. **Memoize callbacks** if passing to child components
5. **Batch updates** when possible to reduce API calls
6. **Cache data** locally when appropriate for performance

## Troubleshooting

### "Project ID not found"
- Check that `VITE_APPWRITE_PROJECT_ID` is set correctly in `.env.local`
- Verify the project exists in Appwrite console

### "Unauthorized"
- Ensure API key has correct permissions
- Check that user is authenticated before accessing protected resources

### "Table not found"
- Verify all 6 tables exist in Appwrite database
- Check table names match exactly: projects, teams, agents, tasks, tools, knowledge_sources

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Web SDK](https://appwrite.io/docs/sdks/web)
- [Database Schema](./DATABASE_SCHEMA.md)
