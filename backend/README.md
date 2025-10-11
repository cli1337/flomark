# 🚀 Flomark Backend

Node.js + Express backend server for Flomark project management application.

## 📋 Features

- 🔐 JWT Authentication with 2FA support
- 📊 Multi-database support (MongoDB, PostgreSQL, MySQL, SQLite) with Prisma ORM
- 🔌 Real-time updates via Socket.IO
- 📧 Email notifications (SMTP)
- 📎 File upload support
- 👥 Role-based access control
- 🔒 Secure password hashing with bcrypt

## 🛠️ Tech Stack

- **Node.js & Express** - Server framework
- **Prisma ORM** - Database toolkit (MongoDB/PostgreSQL/MySQL/SQLite)
- **Socket.IO** - WebSocket communication
- **JWT** - Token-based authentication
- **Speakeasy** - Two-factor authentication
- **Nodemailer** - Email sending
- **Multer** - File upload handling
- **bcrypt** - Password hashing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- One of: MongoDB, PostgreSQL, MySQL, or SQLite
- pnpm (or npm)

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment variables**
   ```bash
   # Copy example file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

3. **Set up database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Push Prisma schema to your database
   npx prisma db push
   
   # (Optional) Open Prisma Studio to view data
   npx prisma studio
   ```

4. **Create admin user**
   ```bash
   pnpm make-admin your-email@example.com OWNER
   ```

5. **Start server**
   ```bash
   # Development (with auto-reload)
   pnpm dev
   
   # Production
   pnpm start
   ```

Server will run at `http://localhost:3000` (or your configured PORT)

## 📋 Environment Variables

### Required
```env
DATABASE_URL=mongodb://localhost:27017/flomark
JWT_SECRET=your-super-secret-key
```

### Database Setup

Flomark supports multiple databases. To switch databases:

1. **Use the quick-install script** (automatically configures the correct schema), or
2. **Manually copy the appropriate schema:**

```bash
# For MongoDB (default)
cp prisma/schema.mongodb.prisma prisma/schema.prisma

# For PostgreSQL
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# For MySQL
cp prisma/schema.mysql.prisma prisma/schema.prisma

# For SQLite
cp prisma/schema.sqlite.prisma prisma/schema.prisma
```

### Database Connection Examples
```env
# MongoDB
DATABASE_URL=mongodb://localhost:27017/flomark
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/flomark

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/flomark

# MySQL
DATABASE_URL=mysql://user:password@localhost:3306/flomark

# SQLite
DATABASE_URL=file:./flomark.db
```

### Optional
```env
PORT=3000
JWT_EXPIRES_IN=24h
BACKEND_URL=http://localhost:3000

# SMTP (for email functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Flomark
SMTP_FROM_EMAIL=noreply@flomark.com
```

📚 **Documentation:**
- [env.example](env.example) - Template with all variables
- [ENV_VARIABLES.md](ENV_VARIABLES.md) - Complete reference guide
- [SMTP_SETUP.md](SMTP_SETUP.md) - Email setup guide

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Database connection (Prisma)
│   │   ├── env.js       # Environment variables
│   │   ├── email.config.js
│   │   └── multer.config.js
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── scripts/
│   └── make-admin.js   # Admin creation script
├── env.example         # Environment template
└── package.json
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/user/auth              # Login
POST   /api/user/create            # Register
POST   /api/user/refresh           # Refresh token
GET    /api/user                   # Get current user
PUT    /api/user                   # Update user
POST   /api/user/2fa/setup         # Setup 2FA
POST   /api/user/2fa/verify        # Verify 2FA
POST   /api/user/2fa/verify-login  # Login with 2FA
DELETE /api/user/2fa/disable       # Disable 2FA
```

### Projects
```
GET    /api/projects               # List user's projects
POST   /api/projects               # Create project
GET    /api/projects/:id           # Get project
PUT    /api/projects/:id           # Update project
DELETE /api/projects/:id           # Delete project
POST   /api/projects/:id/invite    # Invite member
GET    /api/projects/invite/:link  # Get invite details
POST   /api/projects/invite/:link/join  # Join via invite
```

### Tasks
```
POST   /api/tasks/:listId          # Create task
GET    /api/tasks/:id              # Get task
PUT    /api/tasks/:id              # Update task
DELETE /api/tasks/:id              # Delete task
```

### Notifications
```
GET    /api/notifications          # Get notifications
PUT    /api/notifications/:id/read # Mark as read
DELETE /api/notifications/:id      # Delete notification
```

### Storage
```
POST   /api/storage/upload         # Upload file
GET    /api/storage/:filename      # Get file
```

### Admin (OWNER/ADMIN only)
```
GET    /api/admin/users            # List all users
PUT    /api/admin/users/:id        # Update user
PUT    /api/admin/users/:id/role   # Change user role
DELETE /api/admin/users/:id        # Delete user
```

## 🔒 Authentication

### JWT Tokens
- Access tokens stored in `Authorization: Bearer <token>` header
- Tokens expire based on `JWT_EXPIRES_IN` (default: 24h)
- Refresh tokens for extended sessions

### Two-Factor Authentication (2FA)
- TOTP-based (Time-based One-Time Password)
- Compatible with Google Authenticator, Authy, etc.
- QR code generation for easy setup

## 👥 User Roles

### System Roles
- **OWNER** - Full system access, cannot be demoted
- **ADMIN** - Manage users and projects
- **USER** - Standard user access

### Project Roles
- **OWNER** - Full project control
- **ADMIN** - Manage project and members
- **MEMBER** - Edit tasks and content
- **VIEWER** - Read-only access

## 🔌 WebSocket Events

### Server → Client
```javascript
// Task updates
'task:created'
'task:updated'
'task:deleted'
'task:moved'

// Project updates
'project:updated'
'member:added'
'member:removed'

// Notifications
'notification:new'
```

### Client → Server
```javascript
// Join project room
socket.emit('join:project', projectId)

// Leave project room
socket.emit('leave:project', projectId)
```

## 📧 Email Functionality

Email is used for:
- Project invitations
- Notifications (optional)
- Password reset (if implemented)

**Setup Guide:** [SMTP_SETUP.md](SMTP_SETUP.md)

If SMTP is not configured, the app runs normally but email features are disabled.

## 🛠️ Scripts

```bash
# Development with auto-reload
pnpm dev

# Production
pnpm start

# Create admin user
pnpm make-admin <email> <role>

# Database commands
npx prisma db push          # Push schema to database
npx prisma studio           # Open database GUI
npx prisma generate         # Generate Prisma client
```

## 🗄️ Database Schema

Key models:
- **User** - User accounts with authentication
- **Project** - Project/board information
- **List** - Columns in Kanban board
- **Task** - Individual tasks/cards
- **Label** - Task labels/tags
- **Notification** - User notifications
- **Invite** - Project invitation links

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

## 🧪 Testing SMTP

After configuring SMTP:

1. Start server: `pnpm dev`
2. Check console for: `✅ Email server is ready to send messages`
3. Test by inviting a user to a project
4. Check recipient's inbox (and spam folder)

## 🐛 Troubleshooting

### Server won't start
- Check if your database is running
- Verify `DATABASE_URL` in `.env` matches your database type
- Ensure the correct `prisma/schema.prisma` is configured for your database
- Ensure `JWT_SECRET` is set
- Run `npx prisma generate` to generate Prisma Client

### Email not working
- Check SMTP credentials in `.env`
- Review [SMTP_SETUP.md](SMTP_SETUP.md)
- Check console for SMTP errors
- Verify sender email is authenticated

### Database errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate
```

## 📚 Documentation

- [env.example](env.example) - Environment variables template
- [ENV_VARIABLES.md](ENV_VARIABLES.md) - Complete env var reference
- [SMTP_SETUP.md](SMTP_SETUP.md) - Email configuration guide
- [Main README](../README.md) - Project overview

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE)

---

**Need help?** [Open an issue](https://github.com/cli1337/flomark/issues)

