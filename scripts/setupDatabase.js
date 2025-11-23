/**
 * Database Setup Script
 * 
 * This script creates all required tables in the Appwrite database
 * for the Numtema AI Builder application.
 * 
 * Usage: node scripts/setupDatabase.js
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('6922677800157746ff9f')
  .setKey('standard_68a7f75884d05f07dcdbf703c9c6f8f9a75a8a41d3a73ba49ee0672d98c11ec4bb76d178b6634fa762cb1fb75b03cd936f6db1435f4d60f30c776efdc243d7785b9476d344627697415895f637e05d5e5b6a3db72f289e6eb8616d2dc6ffce18b74d8831e3584116ab86c984fe224022dc1ebe3ace5fb41221f9e9328d61ca8f');

const databases = new Databases(client);
const DB_ID = 'main';

async function createTables() {
  try {
    console.log('🚀 Starting database setup...\n');

    // 1. Create projects table
    console.log('📁 Creating projects table...');
    try {
      await databases.createTable(DB_ID, 'projects', 'Projects', false, [
        { key: 'name', type: 'string', required: true },
        { key: 'description', type: 'string', required: false },
        { key: 'icon', type: 'string', required: false },
        { key: 'ownerId', type: 'string', required: true },
        { key: 'createdAt', type: 'datetime', required: true },
        { key: 'updatedAt', type: 'datetime', required: true },
      ]);
      console.log('✓ projects table created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ projects table already exists\n');
      } else {
        throw error;
      }
    }

    // 2. Create teams table
    console.log('👥 Creating teams table...');
    try {
      await databases.createTable(DB_ID, 'teams', 'Teams', false, [
        { key: 'projectId', type: 'string', required: true },
        { key: 'name', type: 'string', required: true },
        { key: 'description', type: 'string', required: false },
        { key: 'process', type: 'string', required: true },
        { key: 'managerAgentId', type: 'string', required: false },
        { key: 'config', type: 'json', required: false },
        { key: 'createdAt', type: 'datetime', required: true },
      ]);
      console.log('✓ teams table created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ teams table already exists\n');
      } else {
        throw error;
      }
    }

    // 3. Create agents table
    console.log('🤖 Creating agents table...');
    try {
      await databases.createTable(DB_ID, 'agents', 'Agents', false, [
        { key: 'teamId', type: 'string', required: true },
        { key: 'name', type: 'string', required: true },
        { key: 'slug', type: 'string', required: true },
        { key: 'description', type: 'string', required: false },
        { key: 'role', type: 'string', required: false },
        { key: 'goal', type: 'string', required: false },
        { key: 'status', type: 'string', required: true },
        { key: 'config', type: 'json', required: false },
        { key: 'createdAt', type: 'datetime', required: true },
      ]);
      console.log('✓ agents table created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ agents table already exists\n');
      } else {
        throw error;
      }
    }

    // 4. Create tasks table
    console.log('📋 Creating tasks table...');
    try {
      await databases.createTable(DB_ID, 'tasks', 'Tasks', false, [
        { key: 'teamId', type: 'string', required: true },
        { key: 'name', type: 'string', required: true },
        { key: 'slug', type: 'string', required: false },
        { key: 'description', type: 'string', required: false },
        { key: 'expectedOutput', type: 'string', required: false },
        { key: 'agentId', type: 'string', required: false },
        { key: 'config', type: 'json', required: false },
        { key: 'createdAt', type: 'datetime', required: true },
      ]);
      console.log('✓ tasks table created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ tasks table already exists\n');
      } else {
        throw error;
      }
    }

    // 5. Create tools table
    console.log('🔧 Creating tools table...');
    try {
      await databases.createTable(DB_ID, 'tools', 'Tools', false, [
        { key: 'agentId', type: 'string', required: true },
        { key: 'name', type: 'string', required: true },
        { key: 'slug', type: 'string', required: true },
        { key: 'type', type: 'string', required: true },
        { key: 'description', type: 'string', required: false },
        { key: 'config', type: 'json', required: false },
        { key: 'createdAt', type: 'datetime', required: true },
      ]);
      console.log('✓ tools table created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ tools table already exists\n');
      } else {
        throw error;
      }
    }

    // 6. Create knowledge_sources table
    console.log('📚 Creating knowledge_sources table...');
    try {
      await databases.createTable(DB_ID, 'knowledge_sources', 'Knowledge Sources', false, [
        { key: 'agentId', type: 'string', required: true },
        { key: 'title', type: 'string', required: true },
        { key: 'type', type: 'string', required: true },
        { key: 'status', type: 'string', required: true },
        { key: 'content', type: 'string', required: false },
        { key: 'config', type: 'json', required: false },
        { key: 'createdAt', type: 'datetime', required: true },
      ]);
      console.log('✓ knowledge_sources table created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ knowledge_sources table already exists\n');
      } else {
        throw error;
      }
    }

    console.log('✅ Database setup complete!\n');
    console.log('All tables have been created successfully.');
    console.log('You can now start using the Appwrite services in your application.\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

createTables();
