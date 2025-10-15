# 🚀 Flomark

> **A modern, self-hosted project management platform with multi-database support**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Databases](https://img.shields.io/badge/Database-MongoDB%20%7C%20PostgreSQL%20%7C%20MySQL%20%7C%20SQLite-blue.svg)](https://www.prisma.io/)

Flomark is a powerful, feature-rich task and project management application designed for teams of all sizes. Manage projects, track tasks, collaborate in real-time, and stay organized with an intuitive Kanban-style interface. **Choose your database:** MongoDB, PostgreSQL, MySQL, or SQLite.

---

## ⚡ Try Demo

https://demo.flomark.app

---

## ✨ Features

### 🎯 Core Features
- **📋 Kanban Board** - Drag-and-drop task management with real-time updates
- **👥 Team Collaboration** - Invite members, assign tasks, and manage permissions
- **🏷️ Labels & Tags** - Organize tasks with customizable labels
- **📅 Due Dates** - Set deadlines and track progress
- **📎 File Attachments** - Upload and manage task attachments
- **✅ Subtasks** - Break down tasks into manageable steps
- **🔔 Real-time Notifications** - Stay updated with WebSocket-powered notifications

### 🔐 Advanced Features
- **Two-Factor Authentication (2FA)** - Enhanced security with TOTP
- **Role-Based Access Control** - Owner, Admin, and User roles
- **Admin Panel** - Comprehensive user management dashboard
- **Project Roles** - Granular permissions (Owner, Admin, Member, Viewer)
- **Invite System** - Secure project invitations with unique links

### 🎨 User Experience
- **Dark Mode Design** - Beautiful glassmorphic UI
- **Responsive Layout** - Works seamlessly on desktop and mobile
- **Real-time Updates** - Socket.io for instant synchronization
- **Optimistic UI** - Smooth interactions with instant feedback
- **Profile Customization** - Upload profile pictures and personalize settings

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js & Express** - Server framework
- **Prisma ORM** - Multi-database support
- **Database Options:**
  - **MongoDB** - Document database
  - **PostgreSQL** - Relational database
  - **MySQL/MariaDB** - Popular SQL database
  - **SQLite** - Serverless database
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Express Rate Limit** - Brute force protection
- **Speakeasy** - 2FA implementation
- **Multer** - File uploads
- **bcrypt** - Password hashing

---

## 🚀 Quick Start

### Production Installation (One Command)

```bash
curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh -o /tmp/flomark-install.sh
sudo bash /tmp/flomark-install.sh
```

The installer will guide you through:
- Package manager selection (npm or pnpm)
- Database setup (MongoDB/PostgreSQL/MySQL/SQLite)
- Web server configuration (Nginx or Apache)
- Admin account creation

**📚 For detailed installation options, see [COMPLETE-SETUP-GUIDE.md](COMPLETE-SETUP-GUIDE.md)**

---

### Development Setup

```bash
# Clone repository
git clone https://github.com/cli1337/flomark.git
cd flomark

# Backend setup
cd backend
pnpm install
cp env.example .env
# Edit .env with your database connection

# Setup database (choose one):
pnpm db:setup:mongodb     # For MongoDB
pnpm db:setup:postgresql  # For PostgreSQL
pnpm db:setup:mysql       # For MySQL
pnpm db:setup:sqlite      # For SQLite

# Create admin account
pnpm make-admin your-email@example.com OWNER

# Frontend setup (new terminal)
cd frontend
   pnpm install
   
# Start development servers
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend
cd frontend && pnpm dev
```

- Frontend Dev Server: http://localhost:3000
- Backend API: http://localhost:5000

**Port Configuration:**
- Frontend port configured in `frontend/vite.config.js`
- Backend port configured in `backend/.env` (PORT variable)
- See [frontend/README.md](frontend/README.md) for detailed configuration options

**Database Setup Commands:**
- `pnpm db:setup:mongodb` - Auto-configures MongoDB schema + generates client + creates tables
- `pnpm db:setup:postgresql` - Auto-configures PostgreSQL schema + generates client + creates tables
- `pnpm db:setup:mysql` - Auto-configures MySQL schema + generates client + creates tables
- `pnpm db:setup:sqlite` - Auto-configures SQLite schema + generates client + creates tables

**📚 For environment variables, see [backend/ENV_VARIABLES.md](backend/ENV_VARIABLES.md)**

---

## 🔄 Updates

```bash
# One-command update with auto-backup
curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/update.sh -o /tmp/flomark-update.sh
sudo bash /tmp/flomark-update.sh
```

**📚 For update procedures and rollback, see [UPDATE-GUIDE.md](UPDATE-GUIDE.md)**

---

## 📖 Documentation

### 🚀 Installation & Deployment
- **[COMPLETE-SETUP-GUIDE.md](COMPLETE-SETUP-GUIDE.md)** - Complete setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide with troubleshooting
- **[DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md)** - Quick reference
- **[INSTALLATION-SCRIPTS-README.md](INSTALLATION-SCRIPTS-README.md)** - Scripts overview
- **[DATABASE-SETUP.md](DATABASE-SETUP.md)** - Database configuration

### 🔄 Updates & Maintenance
- **[UPDATE-GUIDE.md](UPDATE-GUIDE.md)** - Update guide with rollback procedures

### ⚙️ Configuration
- **[backend/README.md](backend/README.md)** - Backend documentation & port configuration
- **[frontend/README.md](frontend/README.md)** - Frontend configuration (Vite, ports, proxy, allowedHosts)
- **[backend/SMTP_SETUP.md](backend/SMTP_SETUP.md)** - Email configuration

### 🏗️ Architecture
- **[ARCHITECTURE-DIAGRAM.md](ARCHITECTURE-DIAGRAM.md)** - System architecture
- **[FEATURES-SUMMARY.md](FEATURES-SUMMARY.md)** - All features breakdown

### 🤝 Contributing
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

---

## 📧 Support

- **Issues:** [Report a bug or request a feature](https://github.com/cli1337/flomark/issues)
- **Discussions:** Have questions? Start a discussion!
- **Documentation:** Check the guides above

---

## 📄 License

This project is licensed under the **MIT License** - free to use, modify, and distribute!

See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI components by [Radix UI](https://www.radix-ui.com/)
- Built with React, Node.js, and Prisma

---

## 🌟 Show Your Support

If you find Flomark useful, give it a star ⭐ on GitHub!

---

**Free & Open Source** • Made with ❤️
