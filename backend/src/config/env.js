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
};

if (!ENV.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing in .env file.");
}

if (!ENV.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env file.");
}
