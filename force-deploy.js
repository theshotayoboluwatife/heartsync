#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

console.log('🚀 Creating force deployment...');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy the entire server directory to dist
console.log('📁 Copying server files...');
if (fs.existsSync('server')) {
  fs.cpSync('server', 'dist/server', { recursive: true });
}

// Copy shared directory
if (fs.existsSync('shared')) {
  fs.cpSync('shared', 'dist/shared', { recursive: true });
}

// Copy package.json to dist
if (fs.existsSync('package.json')) {
  fs.copyFileSync('package.json', 'dist/package.json');
}

// Copy client files
if (fs.existsSync('client')) {
  fs.cpSync('client', 'dist/client', { recursive: true });
}

// Create index.js in dist that runs the server directly
const forceServer = `#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('TrustMatch Force Deployment');
console.log('Working directory:', __dirname);

// Change to the correct directory
process.chdir(__dirname);

// Run tsx directly on server/index.ts
const child = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

child.on('exit', (code) => {
  console.log(\`Server exited with code \${code}\`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});`;

fs.writeFileSync('dist/index.js', forceServer);
console.log('✅ Force deployment created');
console.log('📝 All files copied to dist, server will run directly');
console.log('🎉 Force deployment ready!');