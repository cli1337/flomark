import dotenv from "dotenv";

// Suppress dotenv tip messages
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('dotenv')) {
    return; // Skip dotenv messages
  }
  originalConsoleLog(...args);
};

dotenv.config();

// Restore original console.log
console.log = originalConsoleLog;

export const ENV = {
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL,
};

if (!ENV.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing in .env file.");
}
