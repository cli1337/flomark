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
   
   # Create .env file from example
   cp env.example .env
   # Edit .env with your configuration (see Environment Variables section below)
   
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

Create a `.env` file in the `backend` directory. Use `env.example` as a template.

#### Required Variables
```env
# Database
DATABASE_URL=mongodb://localhost:27017/flomark

# JWT Authentication (REQUIRED)
# Generate secure secrets: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
BACKEND_URL=http://localhost:3000
```

#### Optional: Email/SMTP Configuration
Email functionality is optional but required for:
- 📧 Project invitation emails
- 🔔 Email notifications
- 🔐 Password reset (if implemented)

```env
# SMTP Server Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# SMTP Authentication
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Sender Information
SMTP_FROM_NAME=Flomark
SMTP_FROM_EMAIL=noreply@flomark.com
```

#### SMTP Provider Examples

<details>
<summary><b>Gmail</b></summary>

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Note:** Enable 2FA and generate an App Password at [Google Account](https://myaccount.google.com/apppasswords)
</details>

<details>
<summary><b>Outlook/Office 365</b></summary>

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```
</details>

<details>
<summary><b>SendGrid</b></summary>

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```
</details>

<details>
<summary><b>Mailgun</b></summary>

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```
</details>

<details>
<summary><b>Amazon SES</b></summary>

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```
</details>

> 💡 **Tip:** If SMTP is not configured, the application will run normally but email functionality will be disabled.

📚 **Need help setting up SMTP?** Check out the detailed [SMTP Setup Guide](backend/SMTP_SETUP.md) for step-by-step instructions for each provider.

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


*(API documentation coming soon)*

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

## 📖 Additional Documentation

- **Backend Setup:** [backend/README.md](backend/README.md) - Complete backend documentation
- **Environment Variables:** [backend/ENV_VARIABLES.md](backend/ENV_VARIABLES.md) - Env var reference
- **SMTP Setup:** [backend/SMTP_SETUP.md](backend/SMTP_SETUP.md) - Email configuration guide
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines

## 📧 Support

- **Issues:** [Report a bug or request a feature](https://github.com/cli1337/flomark/issues)
- **Discussions:** Have questions? Start a discussion!

---

## 🌟 Show Your Support

If you find Flomark useful, give it a star ⭐ on GitHub!

---

**Free & Open Source** • Made with ❤️

