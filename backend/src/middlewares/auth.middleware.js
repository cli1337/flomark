import { verifyToken, extractTokenFromHeader } from "../utils/jwt.utils.js";
import { prisma } from "../config/database.js";

/**
 * Authentication Middleware
 * Provides token verification for protected routes
 */

/**
 * Authenticate JWT token from request headers
 * Middleware for protected routes
 * 
 * Extracts token from Authorization header (Bearer token)
 * Verifies token and attaches user object to req.user
 * 
 * Usage: Apply to routes that require authentication
 * Example: router.get('/protected', authenticateToken, handler)
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        message: "Access token is required",
        key: "token_required",
        success: false,
      });
    }

    const decoded = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true,
        role: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        key: "user_not_found",
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        key: "invalid_token",
        success: false,
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired",
        key: "token_expired",
        success: false,
      });
    }

    return res.status(500).json({
      message: "Authentication error",
      key: "auth_error",
      success: false,
    });
  }
};


/**
 * Optional authentication middleware
 * Attaches user to request if valid token is provided, but doesn't fail if missing
 * 
 * Usage: For routes that work with or without authentication
 * Example: router.get('/public-or-private', optionalAuth, handler)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      req.user = null;
      return next();
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    req.user = user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
