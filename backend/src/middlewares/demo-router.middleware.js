import { ENV } from '../config/env.js';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.utils.js';
import { DemoDataService } from '../services/demo-data.service.js';
import * as demoProjects from '../controllers/demo-projects.controller.js';
import * as demoTasks from '../controllers/demo-tasks.controller.js';
import * as demoUser from '../controllers/demo-user.controller.js';

/**
 * Demo Router Middleware
 * Routes requests to demo controllers when in demo mode
 * Bypasses database completely
 */

// Map of routes to demo controllers
// ORDER MATTERS: More specific routes MUST come before less specific ones
const routeMap = [
  // User/Auth
  { pattern: 'POST /api/user/auth', handler: demoUser.authenticateUser },
  { pattern: 'POST /api/user/create', handler: demoUser.createUser },
  { pattern: 'POST /api/user/refresh', handler: demoUser.refreshToken },
  { pattern: 'GET /api/user/profile', handler: demoUser.getProfile },
  { pattern: 'PUT /api/user/profile', handler: demoUser.updateUserProfile },
  { pattern: 'PUT /api/user/password', handler: demoUser.updateUserPassword },
  { pattern: 'POST /api/user/profile/image', handler: demoUser.uploadProfileImage },
  { pattern: 'GET /api/user/all', handler: demoUser.getAllUsers },
  
  // Projects - specific routes first!
  { pattern: 'GET /api/projects/:id/data', handler: demoProjects.getProjectDataOptimized },
  { pattern: 'GET /api/projects/:id/lists', handler: demoProjects.getListsByProject },
  { pattern: 'GET /api/projects/:id/labels', handler: demoProjects.getLabelsByProject },
  { pattern: 'GET /api/projects/:id/members', handler: demoProjects.getMembersByProject },
  { pattern: 'POST /api/projects/:id/list', handler: demoProjects.createList },
  { pattern: 'POST /api/projects/:id/labels', handler: demoProjects.createLabel },
  { pattern: 'GET /api/projects/:id', handler: demoProjects.getProjectById },
  { pattern: 'PUT /api/projects/:id', handler: demoProjects.updateProject },
  { pattern: 'DELETE /api/projects/:id', handler: demoProjects.deleteProject },
  { pattern: 'GET /api/projects', handler: demoProjects.getProjects },
  { pattern: 'POST /api/projects', handler: demoProjects.createProject },
  
  // Lists
  { pattern: 'PUT /api/projects/lists/:listId', handler: demoProjects.updateList },
  
  // Labels
  { pattern: 'PUT /api/projects/labels/:labelId', handler: demoProjects.updateLabel },
  { pattern: 'DELETE /api/projects/labels/:labelId', handler: demoProjects.deleteLabel },
  
  // Tasks - specific routes first!
  { pattern: 'GET /api/tasks/lists/:listId/tasks', handler: demoTasks.getTasksByList },
  { pattern: 'POST /api/tasks/lists/:listId/tasks', handler: demoTasks.createTask },
  { pattern: 'PUT /api/tasks/lists/:listId/reorder', handler: demoTasks.reorderTasks },
  { pattern: 'PUT /api/tasks/:taskId/move', handler: demoTasks.moveTask },
  { pattern: 'POST /api/tasks/:taskId/subtasks', handler: demoTasks.addSubTask },
  { pattern: 'POST /api/tasks/:taskId/labels', handler: demoTasks.addLabel },
  { pattern: 'POST /api/tasks/:taskId/members', handler: demoTasks.assignMember },
  { pattern: 'DELETE /api/tasks/:taskId/labels/:labelId', handler: demoTasks.removeLabel },
  { pattern: 'DELETE /api/tasks/:taskId/members/:userId', handler: demoTasks.removeMember },
  { pattern: 'GET /api/tasks/:taskId', handler: demoTasks.getTaskById },
  { pattern: 'PUT /api/tasks/:taskId', handler: demoTasks.updateTask },
  { pattern: 'DELETE /api/tasks/:taskId', handler: demoTasks.deleteTask },
  
  // Subtasks
  { pattern: 'PUT /api/tasks/subtasks/:subTaskId', handler: demoTasks.updateSubTask },
  { pattern: 'DELETE /api/tasks/subtasks/:subTaskId', handler: demoTasks.deleteSubTask }
];

/**
 * Matches request to route pattern and extracts params
 * Returns { handler, params } or null
 */
function matchRoute(method, path) {
  const routeKey = `${method} ${path}`;
  
  console.log(`  🔍 Trying to match: ${routeKey}`);
  
  // Try to match each route in order
  for (const route of routeMap) {
    const [patternMethod, patternPath] = route.pattern.split(' ');
    
    // Method must match
    if (method !== patternMethod) continue;
    
    // Exact match?
    if (patternPath === path) {
      console.log(`  ✅ Exact match: ${route.pattern}`);
      return { handler: route.handler, params: {} };
    }
    
    // Pattern match (with :params)
    const paramNames = [];
    const regexPattern = patternPath.replace(/:([^/]+)/g, (match, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    
    const regex = new RegExp('^' + regexPattern + '$');
    const matches = path.match(regex);
    
    if (matches) {
      console.log(`  ✅ Pattern match: ${route.pattern}`);
      
      // Extract params
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = matches[index + 1];
      });
      
      console.log(`  📋 Extracted params:`, params);
      return { handler: route.handler, params };
    }
  }
  
  console.log(`  ❌ No match found for: ${routeKey}`);
  return null;
}

/**
 * Authenticate user for demo mode
 * Uses in-memory data instead of database
 */
async function authenticateDemoUser(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return { 
        success: false, 
        error: { 
          status: 401, 
          message: "Access token is required", 
          key: "token_required" 
        } 
      };
    }

    const decoded = verifyToken(token);
    const user = DemoDataService.findUserById(decoded.userId);

    if (!user) {
      return { 
        success: false, 
        error: { 
          status: 401, 
          message: "User not found", 
          key: "user_not_found" 
        } 
      };
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled
    };

    return { success: true };
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return { 
        success: false, 
        error: { 
          status: 401, 
          message: "Invalid token", 
          key: "invalid_token" 
        } 
      };
    }
    
    if (error.name === "TokenExpiredError") {
      return { 
        success: false, 
        error: { 
          status: 401, 
          message: "Token has expired", 
          key: "token_expired" 
        } 
      };
    }

    return { 
      success: false, 
      error: { 
        status: 500, 
        message: "Authentication error", 
        key: "auth_error" 
      } 
    };
  }
}

/**
 * Routes that don't require authentication
 */
const publicRoutes = [
  'POST /api/user/auth',
  'POST /api/user/create',
  'POST /api/user/refresh',
  'POST /api/user/2fa/verify-login'
];

/**
 * Demo router middleware
 * Intercepts requests and routes to demo controllers if in demo mode
 */
export const demoRouter = async (req, res, next) => {
  // Skip if not demo mode
  if (!ENV.DEMO_MODE) {
    return next();
  }
  
  // Use originalUrl which includes the full path
  const fullPath = req.originalUrl.split('?')[0]; // Remove query params
  console.log(`🔍 Demo Router: Checking ${req.method} ${fullPath}`);
  console.log(`   req.path = ${req.path}`);
  console.log(`   req.originalUrl = ${req.originalUrl}`);
  
  // Match route using full path
  const match = matchRoute(req.method, fullPath);
  
  if (!match) {
    console.log(`⚠️  No demo handler found for ${req.method} ${fullPath} - passing to normal routes`);
    return next();
  }
  
  const { handler, params } = match;
  
  // Inject params into req.params
  req.params = { ...req.params, ...params };
  
  console.log(`🎭 Demo Mode: Routing ${req.method} ${fullPath} to demo controller`);
    
    // Check if route requires authentication
    const routeKey = `${req.method} ${fullPath}`;
    const isPublicRoute = publicRoutes.some(route => {
      const regex = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
      return regex.test(routeKey);
    });
    
    // Authenticate if not a public route
    if (!isPublicRoute) {
      console.log('🔐 Demo Mode: Authenticating user...');
      const authResult = await authenticateDemoUser(req, res);
      if (!authResult.success) {
        console.error('❌ Demo Mode: Authentication failed:', authResult.error);
        return res.status(authResult.error.status).json({
          message: authResult.error.message,
          key: authResult.error.key,
          success: false
        });
      }
      console.log('✅ Demo Mode: User authenticated:', req.user.email);
    }
    
    return handler(req, res);
};

export default demoRouter;

