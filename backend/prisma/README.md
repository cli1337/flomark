# Prisma Schema Templates

This directory contains Prisma schema templates for different database providers.

## 📋 Available Templates

- **`schema.mongodb.prisma`** - MongoDB schema (default)
- **`schema.postgresql.prisma`** - PostgreSQL schema
- **`schema.mysql.prisma`** - MySQL/MariaDB schema
- **`schema.sqlite.prisma`** - SQLite schema

## 🔄 Switching Databases

### Option 1: Using Quick Install Script (Recommended)

The `quick-install.sh` script automatically copies the correct schema based on your database selection.

### Option 2: Manual Setup

1. **Copy the appropriate schema template:**

```bash
# For MongoDB (default)
cp schema.mongodb.prisma schema.prisma

# For PostgreSQL
cp schema.postgresql.prisma schema.prisma

# For MySQL
cp schema.mysql.prisma schema.prisma

# For SQLite
cp schema.sqlite.prisma schema.prisma
```

2. **Update your `.env` file:**

```env
# MongoDB
DATABASE_URL=mongodb://localhost:27017/flomark

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/flomark

# MySQL
DATABASE_URL=mysql://user:password@localhost:3306/flomark

# SQLite
DATABASE_URL=file:./flomark.db
```

3. **Generate Prisma Client and push schema:**

```bash
npx prisma generate
npx prisma db push
```

## 🔍 Schema Differences

### MongoDB
- Uses `cuid()` for IDs (compatible with MongoDB)
- Stores JSON data natively
- No need for migrations

### PostgreSQL / MySQL
- Uses `cuid()` for IDs
- Native JSON support
- Supports migrations with `prisma migrate`

### SQLite
- Uses `cuid()` for IDs
- Stores JSON as TEXT (serialized)
- Lightweight, file-based database
- Perfect for development and small deployments

## ⚠️ Important Notes

1. **Don't edit `schema.prisma` directly** - Always edit the template files (`.mongodb.prisma`, `.postgresql.prisma`, etc.) and then copy to `schema.prisma`

2. **The active schema is `schema.prisma`** - This is the file Prisma CLI uses. The template files are just backups.

3. **After switching databases:**
   - Run `npx prisma generate` to update the Prisma Client
   - Run `npx prisma db push` to sync your database
   - All existing data will be lost when switching database types

## 📚 Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Database Connectors](https://www.prisma.io/docs/concepts/database-connectors)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

