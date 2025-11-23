# Appwrite Backend Setup

This project uses **Appwrite** as the backend for managing agents, projects, and user authentication.

## Prerequisites

1. **Appwrite Cloud Account**: Sign up at [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. **Appwrite CLI**: Already installed via `npm install appwrite`

## Setup Steps

### 1. Create an Appwrite Project

1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io)
2. Create a new project (or use existing one)
3. Note your **Project ID**

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Initialize Database and Collections

Run the Appwrite CLI to set up your database:

```bash
appwrite login
appwrite init
appwrite deploy database
```

This will create:
- **Database**: `main`
- **Collections**:
  - `agents` - Store AI agent configurations
  - `projects` - Store project information

## Database Schema

### Agents Collection
- `name` (string, required) - Agent name
- `description` (string) - Agent description
- `config` (json) - Agent configuration
- `createdAt` (datetime) - Creation timestamp

### Projects Collection
- `name` (string, required) - Project name
- `description` (string) - Project description
- `ownerId` (string, required) - Owner user ID
- `createdAt` (datetime) - Creation timestamp

## API Usage

The `services/appwriteService.ts` provides functions for:

### Agents
```typescript
import { createAgent, getAgents, getAgent, updateAgent, deleteAgent } from './services/appwriteService';

// Create agent
await createAgent('MyAgent', 'Description', { /* config */ });

// Get all agents
const agents = await getAgents();

// Get specific agent
const agent = await getAgent(agentId);

// Update agent
await updateAgent(agentId, { name: 'Updated Name' });

// Delete agent
await deleteAgent(agentId);
```

### Projects
```typescript
import { createProject, getProjects, getProject, updateProject, deleteProject } from './services/appwriteService';

// Similar operations for projects
```

### Authentication
```typescript
import { registerUser, loginWithEmail, logout, getCurrentUser } from './services/appwriteService';

// Register
await registerUser('user@example.com', 'password', 'User Name');

// Login
await loginWithEmail('user@example.com', 'password');

// Get current user
const user = await getCurrentUser();

// Logout
await logout();
```

## GitHub Actions Integration

The `.github/workflows/setup-appwrite.yml` workflow automatically sets up the Appwrite CLI on push/PR events.

## Next Steps

1. Set up your Appwrite Cloud project
2. Add your credentials to `.env.local`
3. Run `npm run dev` to start the development server
4. Use the Appwrite service functions in your React components

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite SDK for Web](https://appwrite.io/docs/sdks/web)
- [Appwrite CLI](https://appwrite.io/docs/tooling/command-line)
