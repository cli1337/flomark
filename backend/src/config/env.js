import dotenv from "dotenv";

const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('dotenv')) {
    return;
  }
  originalConsoleLog(...args);
};

dotenv.config();

console.log = originalConsoleLog;

export const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  BACKEND_URL: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,
  
  // Demo Mode Configuration (for frontend only)
  DEMO_MODE: process.env.DEMO_MODE === "true",
  
  // Email Configuration (SMTP)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "Flomark",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
};

// Database validation
if (!ENV.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing in .env file.");
}

if (!ENV.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env file.");
}

// Export as both named and default
export const config = ENV;
export default ENV;
