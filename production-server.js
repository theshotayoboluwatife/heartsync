#!/usr/bin/env node

// Production server that completely bypasses Replit development injection
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Clear all Replit-specific environment variables
delete process.env.REPL_ID;
delete process.env.REPLIT_CLUSTER;
delete process.env.REPLIT_DB_URL;

// Force production environment
process.env.NODE_ENV = 'production';

const app = express();
const server = createServer(app);

// Serve static files from dist/public
const distPath = path.resolve(__dirname, 'dist/public');
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', environment: 'production' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`REPL_ID cleared: ${process.env.REPL_ID === undefined}`);
});