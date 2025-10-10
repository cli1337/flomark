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

## 🌐 Production Deployment

Deploy Flomark to production with automated installation scripts or manual setup.

### 🚀 Automated Installation (Recommended)

#### One-Command Installation

The unified installation script automatically sets everything up:

```bash
# 1. Clone and configure
git clone https://github.com/cli1337/flomark.git
cd flomark
cd backend && cp env.example .env && nano .env && cd ..

# 2. Run unified installer
chmod +x install.sh
sudo ./install.sh yourdomain.com
```

**Interactive Prompts:**
- Choose web server (Nginx or Apache)
- Enable demo mode (optional)
- Enter owner account details:
  - First Name
  - Last Name
  - Email
  - Password

#### Web Server-Specific Scripts

**Nginx (Recommended for production):**
```bash
chmod +x install-nginx.sh
sudo ./install-nginx.sh yourdomain.com
```

**Apache (For Apache/httpd users):**
```bash
chmod +x install-apache.sh
sudo ./install-apache.sh yourdomain.com
```

### 📦 What Gets Installed

All installation scripts automatically:

1. **🌐 Web Server Setup**
   - Installs Nginx or Apache
   - Configures reverse proxy
   - Enables WebSocket support
   - Sets up security headers
   - Configures gzip compression

2. **⚙️ Backend Configuration**
   - Installs Node.js 18+
   - Sets up PM2 process manager
   - Installs dependencies
   - Runs database migrations
   - Creates owner account

3. **🎨 Frontend Build**
   - Builds production bundle
   - Optimizes assets
   - Enables code splitting

4. **🔒 Security & Performance**
   - SSL-ready configuration
   - Auto-restart on crashes
   - Load balancing ready
   - Caching optimization

### 🛠️ Manual Installation

<details>
<summary><b>Click to expand manual installation steps</b></summary>

#### Prerequisites
- Node.js 18+
- MongoDB 6+
- pnpm or npm
- Nginx or Apache
- Root/sudo access

#### Step 1: Clone and Configure

```bash
git clone https://github.com/cli1337/flomark.git
cd flomark/backend
cp env.example .env
nano .env  # Configure DATABASE_URL, JWT_SECRET, BACKEND_URL
```

#### Step 2: Install Dependencies

```bash
# Backend
cd backend
pnpm install
npx prisma db push

# Frontend
cd ../frontend
pnpm install
pnpm build
```

#### Step 3: Create Owner Account

```bash
cd backend
node scripts/make-admin.js admin@example.com OWNER
# Follow interactive prompts for name and password
```

#### Step 4: Start Backend with PM2

```bash
npm install -g pm2
pm2 start src/server.js --name flomark-backend
pm2 save
pm2 startup  # Follow the command output
```

#### Step 5: Configure Web Server

**For Nginx:**

Create `/etc/nginx/sites-available/flomark`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/flomark/frontend/dist;
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/flomark /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**For Apache:**

Create `/etc/apache2/sites-available/flomark.conf`:
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/flomark/frontend/dist
    
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule ^/socket.io/(.*)$ ws://localhost:3000/socket.io/$1 [P,L]
</VirtualHost>
```

Enable and restart:
```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite
sudo a2ensite flomark.conf
sudo systemctl restart apache2
```

#### Step 6: Enable SSL (Optional but Recommended)

```bash
# For Nginx
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# For Apache
sudo apt-get install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com
```

</details>

### 🔄 Updating Your Installation

Flomark provides separate update scripts to preserve your customizations:

#### Update Backend Only

```bash
chmod +x update-backend.sh
./update-backend.sh
```

**Preserves:**
- `.env` configuration
- `uploads/` directory
- `storage/` directory
- Custom middleware

**Updates:**
- Server code
- Dependencies
- Database schema

#### Update Frontend Only

```bash
chmod +x update-frontend.sh
./update-frontend.sh
```

**Preserves:**
- `frontend/src/custom/` directory
- Custom configurations

**Updates:**
- UI components
- Dependencies
- Build configuration

💡 **Tip:** Keep your customizations in `frontend/src/custom/` to ensure they're preserved during updates!

### 📚 Documentation

- **🚀 Deployment:**
  - [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
  - [DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md) - Quick reference
  - [INSTALLATION-SCRIPTS-README.md](INSTALLATION-SCRIPTS-README.md) - Scripts overview
  - [COMPLETE-SETUP-GUIDE.md](COMPLETE-SETUP-GUIDE.md) - Everything in one place
- **🔄 Updates:**
  - [UPDATE-GUIDE.md](UPDATE-GUIDE.md) - How to update your installation
  - `update-backend.sh` - Backend update script
  - `update-frontend.sh` - Frontend update script
- **🎭 Demo Mode:** 
  - [DEMO-MODE-README.md](DEMO-MODE-README.md) - Demo mode setup and configuration
- **🏗️ Architecture:** 
  - [ARCHITECTURE-DIAGRAM.md](ARCHITECTURE-DIAGRAM.md) - System architecture overview

---

## 📋 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory. Use `env.example` as a template.

#### Required Variables
```env
# Database
DATABASE_URL=mongodb://localhost:27017/flomark

# JWT Authentication (REQUIRED)
# Generate secure secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
BACKEND_URL=http://localhost:3000
```

#### Optional: Demo Mode
```env
# Demo Mode (allows public access to demo project)
DEMO_MODE=false
DEMO_PROJECT_ID=demo-project
```

**To enable demo mode:**
1. Set `DEMO_MODE=true` in `.env`
2. Run `pnpm run setup-demo` in backend directory
3. Access demo at `/projects/demo-project`

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
- **OWNER** 👑 - Full system access, cannot be demoted, receives update notifications
- **ADMIN** 🛡️ - Manage users and projects, can promote users to admin
- **USER** 👤 - Standard user access

### Project Roles
- **OWNER** - Full project control
- **ADMIN** - Manage project and members
- **MEMBER** - Edit tasks and content
- **VIEWER** - Read-only access

### Creating Admin Users

After installation, create additional admins:

```bash
cd backend
# Interactive mode (prompts for details)
node scripts/make-admin.js admin@example.com ADMIN

# Non-interactive mode (for scripts)
node scripts/make-admin.js admin@example.com ADMIN "Jane" "Smith" "password123"
```

---

## 🔧 Admin Panel

Access the admin panel at `/admin` (OWNER/ADMIN only):

- **User Management** - Search, filter, and manage all users
- **Role Management** - Promote/demote users
- **User Editing** - Update user information
- **Activity Monitoring** - Track user actions
- **Advanced Filters** - Sort by role, name, email, join date

### Update Notifications (OWNER only)

Owners see update notifications with:
- Available updates banner
- Direct links to GitHub releases
- Update command examples
- Link to update documentation

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

## 🛠️ Useful Commands

### Installation Scripts
```bash
# Unified installation (interactive)
sudo ./install.sh yourdomain.com

# Nginx-specific
sudo ./install-nginx.sh yourdomain.com

# Apache-specific
sudo ./install-apache.sh yourdomain.com
```

### Update Scripts
```bash
# Update backend only
./update-backend.sh

# Update frontend only
./update-frontend.sh
```

### Admin Management
```bash
# Create owner/admin (interactive)
cd backend
node scripts/make-admin.js email@example.com OWNER

# Setup demo mode
pnpm run setup-demo
```

### PM2 Commands
```bash
pm2 status                    # View processes
pm2 logs flomark-backend      # View logs
pm2 restart flomark-backend   # Restart
pm2 stop flomark-backend      # Stop
pm2 monit                     # Monitor resources
```

### Web Server Commands
```bash
# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo nginx -t

# Apache
sudo systemctl status apache2
sudo systemctl reload apache2
sudo apache2ctl configtest
```

### Database Commands
```bash
cd backend
npx prisma studio              # GUI database browser
npx prisma db push             # Update schema
npx prisma generate            # Regenerate client
```

---

## 📖 Additional Documentation

### Deployment & Installation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with troubleshooting
- **[DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md)** - Quick reference card
- **[INSTALLATION-SCRIPTS-README.md](INSTALLATION-SCRIPTS-README.md)** - Detailed scripts documentation
- **[COMPLETE-SETUP-GUIDE.md](COMPLETE-SETUP-GUIDE.md)** - Everything in one place
- **[FEATURES-SUMMARY.md](FEATURES-SUMMARY.md)** - All features breakdown

### Updates & Maintenance
- **[UPDATE-GUIDE.md](UPDATE-GUIDE.md)** - Complete update guide with rollback procedures
- **[INSTALLATION-SUMMARY.md](INSTALLATION-SUMMARY.md)** - Implementation summary

### Features & Configuration
- **[DEMO-MODE-README.md](DEMO-MODE-README.md)** - Demo mode setup and configuration
- **[ARCHITECTURE-DIAGRAM.md](ARCHITECTURE-DIAGRAM.md)** - System architecture diagrams

### Backend Documentation
- **[backend/README.md](backend/README.md)** - Complete backend documentation
- **[backend/ENV_VARIABLES.md](backend/ENV_VARIABLES.md)** - Environment variables reference
- **[backend/SMTP_SETUP.md](backend/SMTP_SETUP.md)** - Email configuration guide

### Contributing
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

## 🐛 Troubleshooting

### Common Issues

**Backend not starting:**
```bash
pm2 logs flomark-backend
cd backend && pnpm install
pm2 restart flomark-backend
```

**Frontend not loading:**
```bash
cd frontend && pnpm build
sudo systemctl restart nginx  # or apache2
```

**502 Bad Gateway:**
- Backend not running: `pm2 restart flomark-backend`
- Port conflict: Check if port 3000 is free

**WebSocket issues:**
- Check proxy configuration in web server
- Verify Socket.io endpoint: `curl -i http://localhost:3000/socket.io/`

**File uploads fail:**
- Check file size limits in web server config
- Verify uploads directory permissions: `chmod 755 backend/uploads`

For more troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)

---

## 📧 Support

- **Issues:** [Report a bug or request a feature](https://github.com/cli1337/flomark/issues)
- **Discussions:** Have questions? Start a discussion!
- **Documentation:** Check the guides in the [Additional Documentation](#-additional-documentation) section

---

## 🌟 Show Your Support

If you find Flomark useful, give it a star ⭐ on GitHub!

---

**Free & Open Source** • Made with ❤️

