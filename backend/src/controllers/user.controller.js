import { prisma } from "../config/database.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ data: users, total: users.length });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Body is required", key: "body_required", success: false });
    }
    const { name, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", key: "validation_failed", errors: errors.array(), success: false });
    }
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "No field can be empty", key: "fields_empty", success: false });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password do not match", key: "password_mismatch", success: false });
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character", key: "invalid_password", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", key: "user_exists", success: false });
    }
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    res.json({ data: user, success: true });
  } catch (err) {
    next(err);
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Body is required", key: "body_required", success: false });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found", key: "user_not_found", success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password", key: "invalid_password", success: false });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ data: { token }, success: true });
  } catch (err) {
    next(err);
  }
};
