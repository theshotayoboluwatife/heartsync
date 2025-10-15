#!/usr/bin/env node

// Emergency deployment script for TrustMatch
// This bypasses the build issues and gets the public URL working

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🚀 Emergency TrustMatch Deployment');
console.log('This will get your public URL working...');

// Force production environment
process.env.NODE_ENV = 'production';

async function deployNow() {
  try {
    console.log('1. Setting up production environment...');
    
    // Kill any existing processes on port 5000
    try {
      await execAsync('pkill -f "tsx server/index.ts" || true');
      await execAsync('pkill -f "node.*5000" || true');
    } catch (e) {
      // Ignore errors - just making sure port is free
    }
    
    console.log('2. Starting production server...');
    
    // Start the server in production mode
    const server = exec('NODE_ENV=production PORT=5000 tsx server/index.ts', {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5000'
      }
    });
    
    // Log server output
    server.stdout.on('data', (data) => {
      console.log('📊 Server:', data.toString().trim());
    });
    
    server.stderr.on('data', (data) => {
      console.error('❌ Error:', data.toString().trim());
    });
    
    server.on('close', (code) => {
      console.log(`Server exited with code ${code}`);
    });
    
    console.log('3. Production server started!');
    console.log('🌐 Your public URL should now be working:');
    console.log('🔗 https://trustmarch-sshahmizad.replit.app');
    console.log('');
    console.log('✅ Try accessing the URL now!');
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Shutting down deployment...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down deployment...');
  process.exit(0);
});

deployNow();