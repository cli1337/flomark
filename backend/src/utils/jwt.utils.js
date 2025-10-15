import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const generateToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(' ')[1]?.trim();
};
