# 🗄️ Database Setup Guide

Flomark supports **4 different database types** out of the box!

## Supported Databases

| Database | Best For | Connection String Example |
|----------|----------|---------------------------|
| **MongoDB** | Production, Cloud (MongoDB Atlas) | `mongodb://localhost:27017/flomark` |
| **PostgreSQL** | Production, Enterprise | `postgresql://user:pass@localhost:5432/flomark` |
| **MySQL** | Production, Shared Hosting | `mysql://user:pass@localhost:3306/flomark` |
| **SQLite** | Development, Small Deployments | `file:./flomark.db` |

## 🚀 Quick Setup (Automated)

### Using the Installer

The easiest way is to use the quick-install script:

```bash
curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh -o /tmp/flomark-install.sh
sudo bash /tmp/flomark-install.sh
```

The script will:
1. Ask you to select a database type
2. Automatically configure the correct Prisma schema
3. Set up the database connection
4. Initialize the database with tables

## 🔧 Manual Setup

### Step 1: Choose Your Database

Navigate to the backend directory:

```bash
cd backend/prisma
```

Copy the appropriate schema template:

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

### Step 2: Configure Connection String

Edit `backend/.env` and set your `DATABASE_URL`:

#### MongoDB
```env
# Local
DATABASE_URL="mongodb://localhost:27017/flomark"

# MongoDB Atlas (Cloud)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/flomark"
```

#### PostgreSQL
```env
# Local
DATABASE_URL="postgresql://postgres:password@localhost:5432/flomark"

# Cloud (e.g., Railway, Heroku)
DATABASE_URL="postgresql://user:pass@host:5432/flomark?schema=public"
```

#### MySQL
```env
# Local
DATABASE_URL="mysql://root:password@localhost:3306/flomark"

# Cloud
DATABASE_URL="mysql://user:pass@host:3306/flomark"
```

#### SQLite
```env
# File-based (no server needed)
DATABASE_URL="file:./flomark.db"
```

### Step 3: Initialize Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### Step 4: Create Admin User

```bash
# Using npm
npm run make-admin your-email@example.com OWNER

# Using pnpm
pnpm make-admin your-email@example.com OWNER
```

## 🔄 Switching Databases

To switch from one database to another:

1. **Backup your data** (if needed)
2. Copy the new schema template over `schema.prisma`
3. Update `DATABASE_URL` in `.env`
4. Run `npx prisma generate`
5. Run `npx prisma db push`
6. Recreate admin user

⚠️ **Warning:** Switching databases will require re-importing data. There's no automatic migration between different database types.

## 📊 Database Comparison

### MongoDB
✅ **Pros:**
- Native JSON storage
- Great for cloud deployments (MongoDB Atlas)
- Flexible schema
- Excellent for real-time applications

❌ **Cons:**
- Requires MongoDB server
- More complex setup for beginners

### PostgreSQL
✅ **Pros:**
- Most powerful SQL database
- Great JSON support
- Excellent for production
- Strong data integrity

❌ **Cons:**
- Requires PostgreSQL server
- More memory usage

### MySQL
✅ **Pros:**
- Widely supported by hosting providers
- Good performance
- Easy to find help/resources

❌ **Cons:**
- Requires MySQL server
- Less feature-rich than PostgreSQL

### SQLite
✅ **Pros:**
- **No server required!**
- Zero configuration
- Perfect for development
- Single file database
- Great for small deployments

❌ **Cons:**
- Not recommended for high-traffic production
- No concurrent write operations
- Limited to local file system

## 🎯 Recommendations

### For Development
→ **SQLite** - Zero setup, perfect for testing

### For Small Teams (< 10 users)
→ **SQLite** or **MongoDB** - Simple and reliable

### For Production (Medium/Large)
→ **PostgreSQL** or **MongoDB** - Robust and scalable

### For Shared Hosting
→ **MySQL** - Widely available

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test database connection
npx prisma db pull
```

### Schema Out of Sync

```bash
# Reset database (⚠️ deletes all data)
npx prisma db push --force-reset

# Regenerate Prisma Client
npx prisma generate
```

### Wrong Schema Template

If you selected the wrong database during installation:

```bash
cd backend/prisma

# Copy the correct template
cp schema.postgresql.prisma schema.prisma  # for example

# Update .env with correct DATABASE_URL

# Regenerate
cd ..
npx prisma generate
npx prisma db push
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [PostgreSQL Connection URIs](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [MySQL Connection Options](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html)

## 🤝 Need Help?

- Check the [troubleshooting guide](backend/README.md#troubleshooting)
- Open an issue on [GitHub](https://github.com/cli1337/flomark/issues)
- Join our community discussions

---

**Remember:** The quick-install script handles all of this automatically! 🚀

