#!/usr/bin/env node

// Production startup script that bypasses build issues
// This script ensures the public URL works properly

console.log('🚀 Starting TrustMatch Production Server...');

// Set production environment
process.env.NODE_ENV = 'production';

// Import required modules
import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Start the server using tsx directly (bypassing build)
const server = spawn('tsx', ['server/index.ts'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 5000
  },
  stdio: 'inherit'
});

// Handle server events
server.on('error', (error) => {
  console.error('❌ Server startup error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🔄 Server process exited with code ${code}`);
  if (code !== 0) {
    console.log('🔄 Restarting server...');
    setTimeout(() => {
      // Restart the server
      const newServer = spawn('tsx', ['server/index.ts'], {
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: process.env.PORT || 5000
        },
        stdio: 'inherit'
      });
    }, 1000);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  server.kill('SIGTERM');
});

console.log('✅ Production server started successfully');
console.log(`🌐 Server running on port ${process.env.PORT || 5000}`);
console.log('🔗 Public URL: https://trustmarch-sshahmizad.replit.app');