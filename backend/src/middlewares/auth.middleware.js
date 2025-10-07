import { verifyToken, extractTokenFromHeader } from "../utils/jwt.utils.js";
import { prisma } from "../config/database.js";

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


export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
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
