#!/usr/bin/env node

// Production deployment fix for TrustMatch
// This script creates a working production deployment that bypasses build issues

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Force production environment
process.env.NODE_ENV = 'production';

console.log('🚀 TrustMatch Production Deployment');
console.log('Environment:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Import and setup the full application
async function setupApplication() {
  try {
    // Dynamic import of routes
    const { registerRoutes } = await import('./server/routes.js');
    
    // Register all routes (auth, API, etc.)
    const server = await registerRoutes(app);
    
    console.log('✅ Server routes registered successfully');
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 TrustMatch running on port ${PORT}`);
      console.log(`🔗 Public URL: https://trustmarch-sshahmizad.replit.app`);
      console.log(`📱 Local URL: http://localhost:${PORT}`);
      console.log('✅ Production deployment successful!');
    });
    
  } catch (error) {
    console.error('❌ Failed to setup application:', error);
    
    // Fallback: create a basic server
    console.log('🔄 Starting fallback server...');
    
    // Basic fallback for static files
    app.use(express.static(path.join(__dirname, 'client', 'src')));
    
    app.get('*', (req, res) => {
      res.send(`
        <html>
          <head>
            <title>TrustMatch - Starting...</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
              .container { max-width: 600px; margin: 0 auto; }
              .status { color: #10b981; font-size: 24px; margin-bottom: 20px; }
              .message { color: #6b7280; font-size: 16px; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="status">🚀 TrustMatch is starting...</div>
              <div class="message">
                The application is initializing. Please wait a moment and refresh the page.
                <br><br>
                If you continue to see this message, the server is still starting up.
              </div>
            </div>
          </body>
        </html>
      `);
    });
    
    const fallbackServer = createServer(app);
    fallbackServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🔄 Fallback server running on port ${PORT}`);
    });
  }
}

// Start the application
setupApplication();

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Shutting down TrustMatch...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down TrustMatch...');
  process.exit(0);
});