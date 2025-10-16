import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

// Check if running on Vercel
const isVercel = !!process.env.VERCEL;

(async () => {
  // Register all routes
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  const isProduction = process.env.NODE_ENV === "production";
  console.log(`Environment: ${isProduction ? "Production" : "Development"}`);

  if (isProduction || isVercel) {
    console.log("Setting up production static file serving");
    serveStatic(app);
  } else {
    console.log("Setting up Vite development server with hot reloading");
    // Only setup Vite if we have a server (not on Vercel)
    if (server) {
      await setupVite(app, server);
    }
  }

  console.log("Server setup completed successfully");

  // FOR VERCEL: Export the Express app
  if (isVercel) {
    console.log("Running on Vercel - exporting app for serverless");
    // Don't call listen() on Vercel
  } else {
    // FOR REPLIT: Start the server normally
    const port = 5000;
    if (server) {
      server.listen(
        {
          port,
          host: "0.0.0.0",
          reusePort: true,
        },
        () => {
          log(`serving on port ${port}`);
        }
      );
    }
  }
})();

// Export for Vercel serverless
export default app;
