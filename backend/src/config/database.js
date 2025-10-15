import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Detect database type from connection string
const detectDatabaseType = () => {
  const url = process.env.DATABASE_URL || '';
  if (url.startsWith('mongodb')) return 'MongoDB';
  if (url.startsWith('postgresql') || url.startsWith('postgres')) return 'PostgreSQL';
  if (url.startsWith('mysql')) return 'MySQL';
  if (url.startsWith('file:') || url.startsWith('sqlite')) return 'SQLite';
  return 'Database';
};

export async function connectDatabase() {
  const dbType = detectDatabaseType();

  try {
    await prisma.$connect();
    console.log(`✅ Connected to ${dbType} (via Prisma)`);
  } catch (err) {
    console.error(`❌ ${dbType} connection failed:`, err.message);
    process.exit(1);
  }
}

// Export prisma client
export { prisma };
