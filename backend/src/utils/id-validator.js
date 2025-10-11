import { ObjectId } from "mongodb";

/**
 * ID Validator Utility
 * Handles ID validation for different database types
 */

// Detect database type from connection string
const detectDatabaseType = () => {
  const url = process.env.DATABASE_URL || '';
  if (url.startsWith('mongodb')) return 'mongodb';
  if (url.startsWith('postgresql') || url.startsWith('postgres')) return 'postgresql';
  if (url.startsWith('mysql')) return 'mysql';
  if (url.startsWith('file:') || url.startsWith('sqlite')) return 'sqlite';
  return 'unknown';
};

const dbType = detectDatabaseType();

/**
 * Validate ID based on database type
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidId = (id) => {
  if (!id || typeof id !== 'string') return false;
  
  switch (dbType) {
    case 'mongodb':
      // MongoDB ObjectId validation (24 hex characters)
      return ObjectId.isValid(id);
      
    case 'postgresql':
    case 'mysql':
    case 'sqlite':
      // CUID validation (25 characters starting with 'c')
      // Prisma's default for SQL databases
      return /^c[a-z0-9]{24}$/.test(id);
      
    default:
      // Fallback: accept if it's a non-empty string
      return id.length > 0;
  }
};

/**
 * Get database type
 */
export const getDatabaseType = () => dbType;

/**
 * Check if using MongoDB
 */
export const isMongoDb = () => dbType === 'mongodb';

/**
 * Check if using SQL database
 */
export const isSqlDb = () => ['postgresql', 'mysql', 'sqlite'].includes(dbType);

