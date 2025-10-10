import { ENV } from '../config/env.js';
import prisma from '../config/database.js';

/**
 * Demo Mode Middleware
 * Allows public access to demo project when demo mode is enabled
 */

export const isDemoMode = () => {
  return ENV.DEMO_MODE === true;
};

export const getDemoProjectId = () => {
  return ENV.DEMO_PROJECT_ID || 'demo-project';
};

/**
 * Middleware to allow demo access without authentication
 * If demo mode is enabled and accessing demo project, bypass auth
 */
export const demoModeMiddleware = async (req, res, next) => {
  // If not demo mode, proceed normally
  if (!isDemoMode()) {
    return next();
  }

  // If user is already authenticated, proceed normally
  if (req.user) {
    return next();
  }

  // Check if this is a request for demo project
  const projectId = req.params.projectId || req.params.id || req.body.projectId;
  const demoProjectId = getDemoProjectId();

  if (projectId === demoProjectId) {
    // Get or create demo user
    try {
      let demoUser = await prisma.user.findUnique({
        where: { email: 'demo@flomark.local' }
      });

      if (!demoUser) {
        // Create demo user if doesn't exist
        demoUser = await prisma.user.create({
          data: {
            email: 'demo@flomark.local',
            username: 'Demo User',
            password: 'demo-user-no-password', // Not used
            role: 'USER',
            emailVerified: true
          }
        });
      }

      // Attach demo user to request
      req.user = {
        id: demoUser.id,
        email: demoUser.email,
        username: demoUser.username,
        role: demoUser.role,
        isDemo: true
      };

      req.isDemo = true;
      return next();
    } catch (error) {
      console.error('Demo mode error:', error);
      return next();
    }
  }

  next();
};

/**
 * Middleware to check if demo mode operations are allowed
 * Prevents destructive operations in demo mode
 */
export const preventDemoDestruction = (req, res, next) => {
  if (!isDemoMode() || !req.isDemo) {
    return next();
  }

  const method = req.method;
  const destructiveMethods = ['DELETE'];
  
  // Allow most operations in demo mode, but restrict some
  if (destructiveMethods.includes(method)) {
    // Allow deleting tasks but not projects/users
    const path = req.path;
    if (path.includes('/projects/') && !path.includes('/tasks/')) {
      return res.status(403).json({
        error: 'Demo mode: Cannot delete projects',
        message: 'This is a demo environment. Project deletion is disabled.'
      });
    }
  }

  next();
};

/**
 * Add demo mode info to response
 */
export const addDemoInfo = (req, res, next) => {
  if (isDemoMode()) {
    res.locals.demoMode = true;
    res.locals.demoProjectId = getDemoProjectId();
  }
  next();
};

export default {
  isDemoMode,
  getDemoProjectId,
  demoModeMiddleware,
  preventDemoDestruction,
  addDemoInfo
};

