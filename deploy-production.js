#!/usr/bin/env node
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Force production environment
process.env.NODE_ENV = 'production';

console.log('Starting production deployment...');

// Create production build
try {
  console.log('Building client...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Production build completed successfully');
} catch (error) {
  console.error('Build failed, falling back to development mode...');
  
  // Copy client files to dist for fallback
  try {
    execSync('mkdir -p dist/public', { stdio: 'inherit' });
    execSync('cp -r client/src dist/public/', { stdio: 'inherit' });
    console.log('Fallback files copied');
  } catch (copyError) {
    console.error('Fallback failed:', copyError);
  }
}

// Start production server
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Serve static files from dist/public if available
const distPublicPath = path.join(__dirname, 'dist', 'public');
if (fs.existsSync(distPublicPath)) {
  console.log('Serving from built assets');
  app.use(express.static(distPublicPath));
} else {
  console.log('No built assets found, serving from development');
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
}

// Import and setup routes
try {
  // Dynamic import of the server module
  const { registerRoutes } = await import('./server/routes.js');
  const server = await registerRoutes(app);
  
  console.log('Server routes registered successfully');
  
  // Start server
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
  
} catch (error) {
  console.error('Failed to start server with routes:', error);
  
  // Fallback simple server
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fallback server running on port ${PORT}`);
  });
}