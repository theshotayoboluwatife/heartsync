#!/usr/bin/env node

// Simple production server that works around build issues
// This bypasses the problematic Vite build process

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Force production environment
process.env.NODE_ENV = 'production';

console.log('Starting TrustMatch production server...');
console.log('Environment:', process.env.NODE_ENV);

// Function to start the server
async function startServer() {
  try {
    // Use development mode server but in production environment
    // This works around the build timeout issue
    console.log('Starting server in production mode...');
    
    // Import and run the development server with production settings
    const { spawn } = await import('child_process');
    
    const server = spawn('tsx', ['server/index.ts'], {
      env: {
        ...process.env,
        NODE_ENV: 'production'
      },
      stdio: 'inherit'
    });
    
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
    
    server.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
      if (code !== 0) {
        console.log('Restarting server...');
        setTimeout(startServer, 1000);
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();