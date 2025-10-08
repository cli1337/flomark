# 🚀 Flomark

> **A modern, real-time project management platform built with React, Node.js, and MongoDB**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

Flomark is a powerful, feature-rich task and project management application designed for teams of all sizes. Manage projects, track tasks, collaborate in real-time, and stay organized with an intuitive Kanban-style interface.

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
  - User search, filtering, and sorting
  - Role management and promotion
  - Activity monitoring
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
- **MongoDB & Prisma** - Database and ORM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Speakeasy** - 2FA implementation
- **Multer** - File uploads
- **bcrypt** - Password hashing

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cli1337/flomark.git
   cd flomark
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pnpm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB URL and JWT secrets
   
   # Push database schema
   npx prisma db push
   
   # Create an admin user
   pnpm make-admin your-email@example.com OWNER
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   pnpm install
   ```

4. **Start Development Servers**
   
   Backend:
   ```bash
   cd backend
   pnpm dev
   ```
   
   Frontend (new terminal):
   ```bash
   cd frontend
   pnpm dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

---

## 📋 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mongodb://localhost:27017/flomark
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3000
```

### Frontend
Configure API endpoint in `vite.config.js` if needed (defaults to `/api`)

---

## 👥 User Roles

### System Roles
- **OWNER** 👑 - Full system access, cannot be demoted
- **ADMIN** 🛡️ - Manage users and projects, can promote users to admin
- **USER** 👤 - Standard user access

### Project Roles
- **OWNER** - Full project control
- **ADMIN** - Manage project and members
- **MEMBER** - Edit tasks and content
- **VIEWER** - Read-only access

---

## 🔧 Admin Panel

Access the admin panel at `/admin` (OWNER/ADMIN only):

- **User Management** - Search, filter, and manage all users
- **Role Management** - Promote/demote users
- **User Editing** - Update user information
- **Activity Monitoring** - Track user actions
- **Advanced Filters** - Sort by role, name, email, join date

---

## 📝 API Documentation

### Authentication
```bash
POST /api/user/auth          # Login
POST /api/user/create        # Register
POST /api/user/refresh       # Refresh token
POST /api/user/2fa/verify-login  # 2FA verification
```

### Projects
```bash
GET    /api/projects         # List user's projects
POST   /api/projects         # Create project
GET    /api/projects/:id     # Get project details
PUT    /api/projects/:id     # Update project
DELETE /api/projects/:id     # Delete project
```

### Tasks
```bash
POST   /api/tasks/:listId    # Create task
PUT    /api/tasks/:id        # Update task
DELETE /api/tasks/:id        # Delete task
```

*(Full API documentation coming soon)*

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - free to use, modify, and distribute!

See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI components by [Radix UI](https://www.radix-ui.com/)
- Built with React, Node.js, and MongoDB

---

## 📧 Support

- **Issues:** [Report a bug or request a feature](https://github.com/cli1337/flomark/issues)
- **Discussions:** Have questions? Start a discussion!

---

## 🌟 Show Your Support

If you find Flomark useful, give it a star ⭐ on GitHub!

---

**Free & Open Source** • Made with ❤️

