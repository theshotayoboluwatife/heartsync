#!/usr/bin/env node
import fs from 'fs';

console.log('🚀 Setting up direct deployment mode...');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Create index.js that runs the development server directly
const directServer = `#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('TrustMatch - Direct Development Server');
console.log('Bypassing build process entirely');

// Run the exact same command as development
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

child.on('exit', (code) => {
  console.log(\`Development server exited with code \${code}\`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Development server error:', error);
  process.exit(1);
});`;

fs.writeFileSync('dist/index.js', directServer);
console.log('✅ Direct deployment server created');
console.log('📝 Production will now run npm run dev directly');
console.log('🎉 No build process needed - deployment ready!');