import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware for Authentication
 * 
 * Protects against brute force attacks by limiting the number of requests
 * from a single IP address within a time window.
 */

/**
 * Strict rate limiter for login attempts
 * Limits: 5 attempts per 15 minutes
 * Used for: /api/user/auth, /api/user/2fa/verify-login
 */
export const loginRateLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    key: 'too_many_login_attempts'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests from rate limiting
  skipSuccessfulRequests: false,
  // Skip failed requests from rate limiting (false = count all attempts)
  skipFailedRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP, please try again after 15 minutes.',
      key: 'too_many_login_attempts',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) // minutes
    });
  }
});

/**
 * Moderate rate limiter for registration
 * Limits: 3 attempts per hour
 * Used for: /api/user/create
 */
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    success: false,
    message: 'Too many registration attempts from this IP, please try again after an hour.',
    key: 'too_many_registration_attempts'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts from this IP, please try again after an hour.',
      key: 'too_many_registration_attempts',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) // minutes
    });
  }
});

/**
 * General rate limiter for password-related operations
 * Limits: 10 attempts per 15 minutes
 * Used for: /api/user/password, /api/user/2fa/*
 */
export const passwordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many password/security attempts from this IP, please try again after 15 minutes.',
    key: 'too_many_password_attempts'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password/security attempts from this IP, please try again after 15 minutes.',
      key: 'too_many_password_attempts',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) // minutes
    });
  }
});

/**
 * Lenient rate limiter for token refresh
 * Limits: 20 attempts per 15 minutes
 * Used for: /api/user/refresh
 */
export const refreshTokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many token refresh attempts, please try again later.',
    key: 'too_many_refresh_attempts'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many token refresh attempts, please try again later.',
      key: 'too_many_refresh_attempts',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) // minutes
    });
  }
});

