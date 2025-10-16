import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import boardsRoutes from "./routes/boards.routes.js";
import storageRoutes from "./routes/storage.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import commentsRoutes from "./routes/comments.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { handleMulterError } from "./config/multer.config.js";
import { ENV } from "./config/env.js";
const mainRoutePath = "/api";
import { createRequire } from 'module';

import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// Try to read frontend package.json for version info
let frontendVersion = 'unknown';
try {
  const frontendPackageJsonPath = new URL('../../frontend/package.json', import.meta.url);
  const frontendPackageJson = JSON.parse(readFileSync(frontendPackageJsonPath, 'utf8'));
  frontendVersion = frontendPackageJson.version;
} catch (err) {
  // Frontend package.json might not exist in production deployments
  console.log('⚠️  Could not read frontend package.json, version will show as unknown');
}

const app = express();

// Security: Remove X-Powered-By header
app.disable('x-powered-by');

// Trust proxy - needed when behind reverse proxy (nginx, load balancer, etc.)
// This allows express-rate-limit to correctly identify users by IP
// WARNING: With trust proxy enabled, IP addresses come from X-Forwarded-For headers
// which can be spoofed. Ensure your reverse proxy is properly configured to strip
// these headers from client requests and only add them itself.
app.set('trust proxy', true);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get(`${mainRoutePath}/health`, (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API is running',
    key: 'api_running',
    version: {
      backend: packageJson.version,
      frontend: frontendVersion
    }
  });
});

// Demo info endpoint - returns demo credentials if demo mode is enabled
app.get(`${mainRoutePath}/demo-info`, (req, res) => {
  res.status(200).json({
    demoMode: ENV.DEMO_MODE || false,
    email: ENV.DEMO_MODE ? 'demo@flomark.app' : null,
    password: ENV.DEMO_MODE ? 'demo' : null
  });
});

app.use(`${mainRoutePath}/user`, userRoutes);
app.use(`${mainRoutePath}/projects`, projectsRoutes);
app.use(`${mainRoutePath}/boards`, boardsRoutes);
app.use(`${mainRoutePath}/storage`, storageRoutes);
app.use(`${mainRoutePath}/tasks`, tasksRoutes);
app.use(`${mainRoutePath}/notifications`, notificationsRoutes);
app.use(`${mainRoutePath}/comments`, commentsRoutes);

if (!fs.existsSync('./storage')) {
  fs.mkdirSync('./storage');
  console.log('Storage directory created');
}
if (!fs.existsSync('./storage/photos')) {
  fs.mkdirSync('./storage/photos');
  console.log('Storage/photos directory created');
}
if (!fs.existsSync('./storage/tasks')) {
  fs.mkdirSync('./storage/tasks');
  console.log('Storage/tasks directory created');
}

app.use(handleMulterError);

app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Request entity too large. Maximum allowed size is 50MB.',
      key: 'payload_too_large',
      success: false
    });
  }
  next(error);
});

app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not registered`);
  error.status = 404;
  next(error);
});

app.use(errorHandler);

export default app;
