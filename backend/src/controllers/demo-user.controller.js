import { DemoDataService } from '../services/demo-data.service.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.utils.js';

/**
 * Demo User Controller
 * Handles user/auth operations using in-memory data (NO DATABASE)
 */

// Login
export const authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = DemoDataService.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ 
        message: 'User not found', 
        key: 'user_not_found', 
        success: false 
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: 'Invalid password', 
        key: 'invalid_password', 
        success: false 
      });
    }
    
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    res.json({
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage
        }
      },
      success: true
    });
  } catch (err) {
    console.error('Demo authenticateUser error:', err);
    res.status(500).json({ 
      message: 'Authentication failed', 
      success: false 
    });
  }
};

// Get profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = DemoDataService.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found', 
        success: false 
      });
    }
    
    res.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        twoFactorEnabled: user.twoFactorEnabled
      },
      success: true
    });
  } catch (err) {
    console.error('Demo getProfile error:', err);
    res.status(500).json({ 
      message: 'Failed to fetch profile', 
      success: false 
    });
  }
};

// Register (disabled in demo)
export const createUser = async (req, res) => {
  res.status(403).json({ 
    message: 'User registration is disabled in demo mode', 
    key: 'demo_mode_registration_disabled',
    success: false 
  });
};

// Update profile (no-op in demo)
export const updateUserProfile = async (req, res) => {
  const user = DemoDataService.findUserById(req.user.id);
  res.json({
    data: user,
    message: 'Profile updates are not saved in demo mode',
    success: true
  });
};

// Update password (no-op in demo)
export const updateUserPassword = async (req, res) => {
  res.json({
    message: 'Password updates are not available in demo mode',
    success: false
  });
};

// Upload profile image (no-op in demo)
export const uploadProfileImage = async (req, res) => {
  res.json({
    message: 'Profile image uploads are not available in demo mode',
    success: false
  });
};

// 2FA operations (disabled in demo)
export const initTwoFactor = async (req, res) => {
  res.status(403).json({ 
    message: '2FA is not available in demo mode', 
    success: false 
  });
};

export const verifyTwoFactorSetup = async (req, res) => {
  res.status(403).json({ 
    message: '2FA is not available in demo mode', 
    success: false 
  });
};

export const disableTwoFactor = async (req, res) => {
  res.status(403).json({ 
    message: '2FA is not available in demo mode', 
    success: false 
  });
};

export const verifyTwoFactorLogin = async (req, res) => {
  res.status(403).json({ 
    message: '2FA is not available in demo mode', 
    success: false 
  });
};

// Admin operations (disabled in demo)
export const getAllUsers = async (req, res) => {
  const users = DemoDataService.getAllData().users;
  res.json({
    data: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      profileImage: u.profileImage
    })),
    total: users.length,
    success: true
  });
};

export const updateUserByAdmin = async (req, res) => {
  res.status(403).json({ 
    message: 'User management is not available in demo mode', 
    success: false 
  });
};

export const promoteUserToAdmin = async (req, res) => {
  res.status(403).json({ 
    message: 'User promotion is not available in demo mode', 
    success: false 
  });
};

// Refresh token
export const refreshToken = async (req, res) => {
  res.status(403).json({ 
    message: 'Token refresh not needed in demo mode', 
    success: false 
  });
};

export default {
  authenticateUser,
  getProfile,
  createUser,
  updateUserProfile,
  updateUserPassword,
  uploadProfileImage,
  initTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor,
  verifyTwoFactorLogin,
  getAllUsers,
  updateUserByAdmin,
  promoteUserToAdmin,
  refreshToken
};

