#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('Starting TrustMatch server...');

// Force the same startup command as development
const child = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});