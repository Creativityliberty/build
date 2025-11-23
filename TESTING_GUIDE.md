# Appwrite Integration Testing Guide

## Overview

This guide walks you through testing the Appwrite integration with CRUD operations.

## Testing Components

### 1. AppwriteTest Component

A dedicated test component for validating Appwrite operations.

**Location**: `components/AppwriteTest.tsx`

**Features**:
- User authentication (login/logout)
- Project creation and selection
- Team creation and selection
- Agent listing
- Task listing
- Real-time status display

### 2. AppWithAppwrite Component

Alternative App component that uses Appwrite for data persistence.

**Location**: `AppWithAppwrite.tsx`

**Features**:
- Full Appwrite integration
- Replaces local state with Appwrite data
- All original UI components work with Appwrite data
- Authentication required

## How to Test

### Step 1: Set Up Environment

1. Ensure `.env.local` has:
```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6922677800157746ff9f
VITE_GEMINI_API_KEY=your_key
```

2. Verify all 6 tables exist in Appwrite:
   - projects
   - teams
   - agents
   - tasks
   - tools
   - knowledge_sources

### Step 2: Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Step 3: Test AppwriteTest Component

#### Option A: Use AppwriteTest in App.tsx

Replace the main App export in `App.tsx`:

```tsx
// At the end of App.tsx, change:
export default App;

// To:
import { AppwriteTest } from './components/AppwriteTest';
export default AppwriteTest;
```

#### Option B: Use AppWithAppwrite

Replace the main App export in `App.tsx`:

```tsx
// At the end of App.tsx, change:
export default App;

// To:
import AppWithAppwrite from './AppWithAppwrite';
export default AppWithAppwrite;
```

### Step 4: Test Authentication

1. **Login**:
   - Enter email and password
   - Click "Login"
   - Should see user name displayed

2. **Logout**:
   - Click "Logout" button
   - Should return to login form

**Note**: Create test users in Appwrite Console first

### Step 5: Test CRUD Operations

#### Create Project

1. Click "Create Project" button
2. New project appears in list with timestamp
3. Click project to select it

**Expected**: Project created in Appwrite database

#### Create Team

1. Select a project
2. Click "Create Team" button
3. New team appears in list with timestamp

**Expected**: Team created in Appwrite database with projectId reference

#### View Agents

1. Select a project
2. Select a team
3. Agents section shows agents for that team

**Expected**: Agents loaded from Appwrite for selected team

#### View Tasks

1. Select a project
2. Select a team
3. Tasks section shows tasks for that team

**Expected**: Tasks loaded from Appwrite for selected team

### Step 6: Verify Data in Appwrite Console

1. Go to https://cloud.appwrite.io
2. Select your project
3. Go to Databases → main
4. Check each table:

**projects table**:
- Should have entries with: name, description, icon, ownerId, createdAt, updatedAt

**teams table**:
- Should have entries with: projectId, name, description, process, createdAt

**agents table**:
- Should have entries with: teamId, name, slug, description, role, goal, status

**tasks table**:
- Should have entries with: teamId, name, slug, description, expectedOutput, agentId

### Step 7: Test Error Handling

#### Network Error
1. Disconnect internet
2. Try to create project
3. Should show error message

#### Invalid Data
1. Try operations with missing required fields
2. Should show appropriate error

#### Unauthorized
1. Try to access without authentication
2. Should redirect to login

## Testing Checklist

- [ ] AppwriteProvider wraps App in index.tsx
- [ ] Can login with valid credentials
- [ ] Can logout successfully
- [ ] Can create projects
- [ ] Can select projects
- [ ] Can create teams
- [ ] Can select teams
- [ ] Can view agents for team
- [ ] Can view tasks for team
- [ ] Data persists after page reload
- [ ] Error messages display correctly
- [ ] Loading states show correctly
- [ ] All data visible in Appwrite console

## Troubleshooting

### "Project ID not found"
- Check `VITE_APPWRITE_PROJECT_ID` in `.env.local`
- Verify project exists in Appwrite console

### "Unauthorized" on login
- Ensure user exists in Appwrite
- Check credentials are correct
- Verify API key has auth scopes

### "Table not found"
- Verify all 6 tables exist in database
- Check table names match exactly
- Refresh Appwrite console

### Data not appearing
- Check browser console for errors
- Verify Appwrite endpoint is correct
- Check network tab in DevTools
- Ensure tables have correct schema

### App crashes on load
- Check console for TypeScript errors
- Verify all imports are correct
- Ensure AppwriteProvider wraps App
- Check environment variables

## Performance Testing

### Load Testing

Test with multiple projects/teams:

```tsx
// In AppwriteTest component, add:
const handleBulkCreate = async () => {
  for (let i = 0; i < 10; i++) {
    await createProject({
      name: `Project ${i}`,
      description: `Test project ${i}`,
      icon: '📁',
      teams: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, user?.id || 'test-user');
  }
};
```

### Memory Testing

Monitor memory usage in DevTools:
1. Open DevTools → Performance tab
2. Create/delete multiple items
3. Check for memory leaks
4. Verify garbage collection works

## Next Steps

1. **Integrate with UI Components**
   - Update OrgDashboard to use useProjects
   - Update Sidebar to use useTeams
   - Update tabs to use useAgents, useTasks, etc.

2. **Add More Features**
   - Edit/update operations
   - Delete operations
   - Bulk operations
   - Search/filter

3. **Optimize Performance**
   - Add pagination
   - Implement caching
   - Optimize queries
   - Add indexes

4. **Add Real-time Features**
   - Subscribe to document changes
   - Live updates across devices
   - Conflict resolution

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [React Testing Library](https://testing-library.com/react)
- [DevTools Guide](https://developer.chrome.com/docs/devtools/)
