import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import storageRoutes from "./routes/storage.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { handleMulterError } from "./config/multer.config.js";
import databaseProtection from "./middlewares/database-protection.middleware.js";
import demoRouter from "./middlewares/demo-router.middleware.js";
import { ENV } from "./config/env.js";
const mainRoutePath = "/api";
import { createRequire } from 'module';

import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database protection middleware (blocks raw queries in demo mode)
app.use(databaseProtection);

app.get(`${mainRoutePath}/health`, (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API is running',
    key: 'api_running',
    version: packageJson.version
  });
});

app.get(`${mainRoutePath}/demo-info`, async (req, res) => {
  if (ENV.DEMO_MODE) {
    const { DemoDataService } = await import('./services/demo-data.service.js');
    const stats = DemoDataService.getStats();
    const allData = DemoDataService.getAllData();
    
    res.status(200).json({
      demoMode: true,
      demoUser: { email: 'demo@flomark.app' },
      stats: {
        projects: stats.projects,
        tasks: stats.tasks,
        timeUntilReset: Math.round(stats.timeUntilReset / 60000) // minutes
      },
      debug: {
        projectIds: allData.projects.map(p => ({ id: p.id, name: p.name })),
        userCount: allData.users.length,
        userIds: allData.users.map(u => u.id),
        listsCount: allData.lists.length,
        tasksCount: allData.tasks.length,
        membersCount: allData.members.length,
        memberMappings: allData.members.map(m => ({ userId: m.userId, projectId: m.projectId, role: m.role }))
      }
    });
  } else {
    res.status(200).json({
      demoMode: false,
      demoUser: null
    });
  }
});

// Debug endpoint to test demo data (demo mode only)
if (ENV.DEMO_MODE) {
  app.get(`${mainRoutePath}/demo-debug`, async (req, res) => {
    const { DemoDataService } = await import('./services/demo-data.service.js');
    const allData = DemoDataService.getAllData();
    res.json(allData);
  });
  
  // Test endpoint to verify demo router is working
  app.get(`${mainRoutePath}/demo-test`, (req, res) => {
    res.json({
      message: 'Demo router is working!',
      path: req.path,
      originalUrl: req.originalUrl,
      method: req.method
    });
  });
}

// Demo router handles all requests in demo mode
if (ENV.DEMO_MODE) {
  console.log('🎭 Registering demo router middleware');
  app.use(demoRouter);
}

app.use(`${mainRoutePath}/user`, userRoutes);
app.use(`${mainRoutePath}/projects`, projectsRoutes);
app.use(`${mainRoutePath}/storage`, storageRoutes);
app.use(`${mainRoutePath}/tasks`, tasksRoutes);
app.use(`${mainRoutePath}/notifications`, notificationsRoutes);

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
