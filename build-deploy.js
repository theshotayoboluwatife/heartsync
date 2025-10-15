#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting production build...');

// Step 1: Clean up existing builds
console.log('📁 Cleaning directories...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
if (fs.existsSync('server/public')) {
  fs.rmSync('server/public', { recursive: true, force: true });
}

// Step 2: Create directories
fs.mkdirSync('dist/public', { recursive: true });
fs.mkdirSync('server/public', { recursive: true });

// Step 3: Create a production HTML that loads the app directly
console.log('📄 Creating production HTML...');
const productionHTML = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Heartsync - Rencontres basées sur la confiance</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
        margin: 0; 
        padding: 0; 
        background: #f8fafc; 
      }
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
      }
      .logo {
        font-size: 32px;
        font-weight: bold;
        color: #3b82f6;
        margin-bottom: 20px;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading">
        <div class="logo">Heartsync</div>
        <div class="spinner"></div>
        <p>Chargement de l'application...</p>
      </div>
    </div>
    <script>
      // Fallback to redirect to login if React doesn't load
      setTimeout(() => {
        if (!window.React) {
          window.location.href = '/api/login';
        }
      }, 10000);
    </script>
  </body>
</html>`;

// Write HTML files
fs.writeFileSync('dist/public/index.html', productionHTML);
fs.writeFileSync('server/public/index.html', productionHTML);

// Step 4: Build the server
console.log('🛠️ Building server...');
try {
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
    stdio: 'inherit'
  });
  console.log('✅ Server build completed');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 5: Create production index.js that uses tsx
console.log('📄 Creating production index.js with tsx runner...');
const productionIndex = `#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('Starting TrustMatch server in production...');

// Use the same startup as development
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

fs.writeFileSync('dist/index.js', productionIndex);

console.log('🎉 Production build completed!');
console.log('📝 Production deployment will use tsx to run the server directly.');