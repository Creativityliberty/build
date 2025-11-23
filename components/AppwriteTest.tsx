/**
 * AppwriteTest Component
 * 
 * Test component for Appwrite CRUD operations
 * This demonstrates how to use all the hooks
 */

import React, { useState } from 'react';
import { useAppwriteAuth } from '../context/AppwriteContext';
import { useAgents } from '../hooks/useAgents';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useTeams } from '../hooks/useTeams';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function AppwriteTest() {
  const { user, isAuthenticated, login, logout } = useAppwriteAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  const { projects, loading: projectsLoading, error: projectsError, create: createProject } = useProjects(user?.id);
  const { teams, loading: teamsLoading, error: teamsError, create: createTeam } = useTeams(activeProjectId || undefined);
  const { agents, loading: agentsLoading, error: agentsError } = useAgents(activeTeamId || undefined);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(activeTeamId || undefined);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleCreateProject = async () => {
    try {
      await createProject(
        {
          name: `Project ${new Date().toLocaleTimeString()}`,
          description: 'Test project from Appwrite',
          icon: '📁',
          teams: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        user?.id || 'test-user'
      );
    } catch (error) {
      console.error('Create project failed:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!activeProjectId) {
      alert('Please select a project first');
      return;
    }
    try {
      await createTeam({
        name: `Team ${new Date().toLocaleTimeString()}`,
        description: 'Test team from Appwrite',
        process: 'sequential',
      });
    } catch (error) {
      console.error('Create team failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8 p-6">
        <h2 className="text-2xl font-bold mb-4">Appwrite Test - Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Login
          </Button>
        </form>
        <p className="text-sm text-neutral-500 mt-4">
          Note: Create an account in Appwrite console first
        </p>
      </Card>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Appwrite Test Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome, {user?.name || user?.email}!</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">📁 Projects</h2>
          {projectsLoading && <p className="text-neutral-500">Loading projects...</p>}
          {projectsError && <p className="text-red-500">Error: {projectsError.message}</p>}
          {projects.length === 0 && !projectsLoading && (
            <p className="text-neutral-500">No projects yet</p>
          )}
          <div className="space-y-2 mb-4">
            {projects.map((project: any) => (
              <div
                key={project.$id}
                onClick={() => setActiveProjectId(project.$id)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  activeProjectId === project.$id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                <p className="font-medium">{project.name}</p>
                <p className="text-sm opacity-75">{project.description}</p>
              </div>
            ))}
          </div>
          <Button onClick={handleCreateProject} variant="primary" className="w-full">
            Create Project
          </Button>
        </Card>

        {/* Teams Section */}
        {activeProjectId && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">👥 Teams</h2>
            {teamsLoading && <p className="text-neutral-500">Loading teams...</p>}
            {teamsError && <p className="text-red-500">Error: {teamsError.message}</p>}
            {teams.length === 0 && !teamsLoading && (
              <p className="text-neutral-500">No teams yet</p>
            )}
            <div className="space-y-2 mb-4">
              {teams.map((team: any) => (
                <div
                  key={team.$id}
                  onClick={() => setActiveTeamId(team.$id)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    activeTeamId === team.$id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm opacity-75">{team.process}</p>
                </div>
              ))}
            </div>
            <Button onClick={handleCreateTeam} variant="primary" className="w-full">
              Create Team
            </Button>
          </Card>
        )}

        {/* Agents Section */}
        {activeTeamId && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">🤖 Agents</h2>
            {agentsLoading && <p className="text-neutral-500">Loading agents...</p>}
            {agentsError && <p className="text-red-500">Error: {agentsError.message}</p>}
            {agents.length === 0 && !agentsLoading && (
              <p className="text-neutral-500">No agents yet</p>
            )}
            <div className="space-y-2">
              {agents.map((agent: any) => (
                <div key={agent.$id} className="p-3 bg-neutral-100 rounded-lg">
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm opacity-75">{agent.role}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tasks Section */}
        {activeTeamId && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">📋 Tasks</h2>
            {tasksLoading && <p className="text-neutral-500">Loading tasks...</p>}
            {tasksError && <p className="text-red-500">Error: {tasksError.message}</p>}
            {tasks.length === 0 && !tasksLoading && (
              <p className="text-neutral-500">No tasks yet</p>
            )}
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <div key={task.$id} className="p-3 bg-neutral-100 rounded-lg">
                  <p className="font-medium">{task.name}</p>
                  <p className="text-sm opacity-75">{task.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Status Section */}
      <Card className="p-6 mt-6 bg-neutral-50">
        <h3 className="font-bold mb-2">Status</h3>
        <div className="text-sm space-y-1 font-mono">
          <p>User: <span className="text-green-600">{user?.email}</span></p>
          <p>Projects: <span className="text-blue-600">{projects.length}</span></p>
          {activeProjectId && <p>Teams: <span className="text-blue-600">{teams.length}</span></p>}
          {activeTeamId && <p>Agents: <span className="text-blue-600">{agents.length}</span></p>}
          {activeTeamId && <p>Tasks: <span className="text-blue-600">{tasks.length}</span></p>}
        </div>
      </Card>
    </div>
  );
}
