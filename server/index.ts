import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";  // Explicitly create HTTP server
import cors from "cors";
import { errorHandler } from "./middleware/error";

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:5000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Improved request logging middleware
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

      // Slightly more readable truncation
      if (logLine.length > 80) {
        logLine = logLine.substring(0, 77) + "...";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);
    const httpServer = createServer(app);  // Create explicit HTTP server

    // Error handling middleware with better type safety
    app.use(errorHandler);

    // Vite setup
    if (app.get("env") === "development") {
      await setupVite(app, httpServer);  // Pass the HTTP server instead
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT || 3000;
    const host = "127.0.0.1";  // Explicit IPv4 binding

    httpServer.listen(port, host, () => {
      log(`Server running on http://${host}:${port}`);
      log(`Environment: ${app.get("env")}`);
    });

    // Handle server errors gracefully
    httpServer.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        log(`[FATAL] Port ${port} is already in use`);
      } else {
        log(`[FATAL] Server error: ${error.message}`);
      }
      process.exit(1);
    });

    // Handle process termination
    process.on("SIGTERM", () => {
      log("SIGTERM received - shutting down gracefully");
      httpServer.close();
    });

  } catch (error) {
    log(`[FATAL] Startup failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
})();