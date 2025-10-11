import { verifyToken, extractTokenFromHeader } from "../utils/jwt.utils.js";
import { prisma } from "../config/database.js";

export const authenticateSocket = async (socket, next) => {
  try {
    let token = null;
    
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }
    else if (socket.handshake.headers.authorization) {
      token = extractTokenFromHeader(socket.handshake.headers.authorization);
    }
    else if (socket.handshake.query.token) {
      token = socket.handshake.query.token;
    }

    if (!token) {
      return next(new Error("Authentication token is required"));
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return next(new Error("Invalid token"));
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new Error("Invalid token"));
    }
    
    if (error.name === "TokenExpiredError") {
      return next(new Error("Token has expired"));
    }

    console.error("Socket authentication error:", error);
    return next(new Error("Authentication failed"));
  }
};
