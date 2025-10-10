import { ENV } from '../config/env.js';

/**
 * Database Protection Middleware
 * Extra safety layer to prevent ANY database access in demo mode
 */

export const databaseProtection = (req, res, next) => {
  if (ENV.DEMO_MODE) {
    // Block any attempt to use raw database connections
    if (req.body?.$raw || req.query?.$raw || req.params?.$raw) {
      console.error('🚫 BLOCKED: Attempted raw database query in demo mode');
      return res.status(403).json({
        success: false,
        message: 'Raw database queries are not allowed in demo mode',
        key: 'demo_mode_db_blocked'
      });
    }
    
    // Add warning header
    res.setHeader('X-Demo-Mode', 'true');
    res.setHeader('X-Database-Access', 'blocked');
  }
  
  next();
};

export default databaseProtection;

