# ✅ Installation Scripts & Demo Mode - Implementation Summary

This document summarizes all the new features and files added to Flomark.

---

## 🎯 What Was Added

### 1. **Unified Installation Script** (`install.sh`)

A single, interactive installation script that:
- ✅ Lets you choose between Nginx or Apache
- ✅ Prompts for demo mode setup
- ✅ Auto-detects OS (Debian/Ubuntu/RHEL/CentOS)
- ✅ Installs all dependencies
- ✅ Builds and deploys frontend
- ✅ Configures backend with PM2
- ✅ Sets up reverse proxy
- ✅ Enables WebSocket support
- ✅ Configures SSL-ready setup

**Usage:**
```bash
chmod +x install.sh
sudo ./install.sh yourdomain.com
```

### 2. **Individual Server Scripts**

**Nginx Script** (`install-nginx.sh`)
- Optimized for Nginx
- Automatic configuration
- Better performance

**Apache Script** (`install-apache.sh`)
- Apache/httpd support
- RHEL/CentOS compatible
- Familiar to Apache users

**Usage:**
```bash
# Nginx
chmod +x install-nginx.sh
sudo ./install-nginx.sh yourdomain.com

# Apache
chmod +x install-apache.sh
sudo ./install-apache.sh yourdomain.com
```

### 3. **Demo Mode Feature** 🎭

Complete demo mode implementation allowing public access to a demo project without authentication.

**Backend Components:**
- `backend/src/middlewares/demo.middleware.js` - Demo mode middleware
- `backend/scripts/setup-demo.js` - Demo project setup script
- `backend/src/config/env.js` - Updated with demo config

**Frontend Components:**
- `frontend/src/components/DemoModeBanner.jsx` - Visual banner
- `frontend/src/App.jsx` - Updated to show banner

**Features:**
- ✅ Public project access (no login required)
- ✅ Full functionality (create, edit, move tasks)
- ✅ Real-time updates for all demo users
- ✅ Prevents destructive operations (project deletion)
- ✅ Visual banner indicating demo mode
- ✅ Sample data with tasks, labels, lists

**Setup:**
```bash
# Enable in .env
DEMO_MODE=true
DEMO_PROJECT_ID=demo-project

# Create demo project
cd backend
pnpm run setup-demo
```

---

## 📚 Documentation Added

### Deployment Guides

1. **`DEPLOYMENT.md`** - Complete deployment guide
   - Prerequisites
   - Step-by-step installation
   - SSL/HTTPS setup
   - Troubleshooting
   - Security checklist
   - Performance optimization

2. **`DEPLOYMENT-QUICKSTART.md`** - Quick reference
   - One-command deploy
   - Essential commands
   - Quick fixes
   - Key environment variables

3. **`INSTALLATION-SCRIPTS-README.md`** - Scripts overview
   - Detailed script comparison
   - Usage examples
   - Prerequisites
   - Troubleshooting

### Demo Mode Guide

4. **`DEMO-MODE-README.md`** - Demo mode documentation
   - What is demo mode
   - Setup instructions
   - Security considerations
   - Customization guide
   - Use cases
   - FAQ

5. **`INSTALLATION-SUMMARY.md`** - This file
   - Overview of all changes
   - File structure
   - Quick access links

---

## 📁 File Structure

```
flomark/
├── install.sh                      # ✨ NEW: Unified installation script
├── install-nginx.sh                # ✨ NEW: Nginx installation script
├── install-apache.sh               # ✨ NEW: Apache installation script
├── DEPLOYMENT.md                   # ✨ NEW: Complete deployment guide
├── DEPLOYMENT-QUICKSTART.md        # ✨ NEW: Quick reference
├── DEMO-MODE-README.md             # ✨ NEW: Demo mode guide
├── INSTALLATION-SCRIPTS-README.md  # ✨ NEW: Scripts overview
├── INSTALLATION-SUMMARY.md         # ✨ NEW: This summary
├── .gitignore                      # ✨ NEW: Git ignore file
├── README.md                       # ✏️ UPDATED: Added deployment section
│
├── backend/
│   ├── env.example                 # ✏️ UPDATED: Added demo mode config
│   ├── package.json                # ✏️ UPDATED: Added setup-demo script
│   │
│   ├── src/
│   │   ├── app.js                  # ✏️ UPDATED: Added demo-info endpoint
│   │   │
│   │   ├── config/
│   │   │   └── env.js              # ✏️ UPDATED: Added demo config
│   │   │
│   │   ├── middlewares/
│   │   │   └── demo.middleware.js  # ✨ NEW: Demo mode middleware
│   │   │
│   │   └── routes/
│   │       ├── projects.routes.js  # ✏️ UPDATED: Added demo middleware
│   │       └── tasks.routes.js     # ✏️ UPDATED: Added demo middleware
│   │
│   └── scripts/
│       └── setup-demo.js           # ✨ NEW: Demo project setup
│
└── frontend/
    └── src/
        ├── App.jsx                 # ✏️ UPDATED: Added DemoModeBanner
        └── components/
            └── DemoModeBanner.jsx  # ✨ NEW: Demo mode banner component
```

---

## 🚀 Quick Start Guide

### Option 1: Unified Script (Recommended)

```bash
# 1. Clone and configure
git clone https://github.com/cli1337/flomark.git
cd flomark
cd backend && cp env.example .env && nano .env && cd ..

# 2. Run installation
chmod +x install.sh
sudo ./install.sh yourdomain.com

# 3. Choose options:
#    - Select Nginx (recommended) or Apache
#    - Enable demo mode (optional)

# 4. Create admin user
cd backend
pnpm make-admin admin@example.com OWNER
```

### Option 2: Individual Scripts

```bash
# For Nginx
chmod +x install-nginx.sh
sudo ./install-nginx.sh yourdomain.com

# For Apache
chmod +x install-apache.sh
sudo ./install-apache.sh yourdomain.com
```

### Demo Mode Setup

```bash
# 1. Enable in backend/.env
echo "DEMO_MODE=true" >> backend/.env
echo "DEMO_PROJECT_ID=demo-project" >> backend/.env

# 2. Create demo project
cd backend
pnpm run setup-demo

# 3. Restart backend
pm2 restart flomark-backend
```

---

## 🔑 Key Features

### Installation Scripts

✅ **Auto-detection**
- Detects OS (Debian/Ubuntu/RHEL/CentOS)
- Chooses correct package manager
- Configures appropriate paths

✅ **Comprehensive Setup**
- Installs Node.js, PM2, pnpm
- Builds frontend (Vite)
- Installs backend dependencies
- Configures web server
- Sets up process manager

✅ **Production Ready**
- Reverse proxy configuration
- WebSocket support (Socket.io)
- Gzip compression
- Security headers
- SSL-ready setup
- Caching optimization

✅ **User Friendly**
- Interactive prompts
- Clear status messages
- Colored output
- Error handling
- Post-install instructions

### Demo Mode

✅ **Public Access**
- No login required for demo project
- Auto-creates demo user
- Full functionality available

✅ **Security**
- Only affects demo project
- Prevents project deletion
- Doesn't expose user data
- No admin access

✅ **Features**
- Sample tasks and lists
- Pre-configured labels
- Real-time collaboration
- Full CRUD operations

✅ **Customizable**
- Custom welcome messages
- Configurable sample data
- Multiple labels and tasks
- Adjustable project settings

---

## 📊 Script Comparison

| Feature | Unified | Nginx | Apache |
|---------|---------|-------|--------|
| Interactive | ✅ | ❌ | ❌ |
| Choose Server | ✅ | Fixed | Fixed |
| Demo Prompt | ✅ | ❌ | ❌ |
| OS Detection | ✅ | ✅ | ✅ |
| Performance | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Use Cases

### Installation Scripts

1. **Quick Deployment** - One command deployment
2. **Consistent Setup** - Same config every time
3. **Multiple Servers** - Easy replication
4. **CI/CD Integration** - Automated deployments
5. **Development Environments** - Fast local setup

### Demo Mode

1. **Product Showcase** - Show features to prospects
2. **User Onboarding** - Try before signup
3. **Feature Demos** - Demonstrate capabilities
4. **Testing** - QA without accounts
5. **Marketing** - Live product on website

---

## 🔧 Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=mongodb://localhost:27017/flomark

# JWT Authentication
JWT_SECRET=<generate-random-32-chars>
JWT_EXPIRES_IN=24h

# Server
PORT=3000
BACKEND_URL=https://yourdomain.com
```

### Optional: Demo Mode

```env
DEMO_MODE=true
DEMO_PROJECT_ID=demo-project
```

### Optional: Email

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🐛 Common Issues & Solutions

### Installation Fails

**Issue:** Script stops with errors

**Solutions:**
1. Run as root: `sudo ./install.sh`
2. Check disk space: `df -h`
3. Verify OS compatibility
4. Check internet connection

### Services Not Starting

**Issue:** PM2 or web server fails

**Solutions:**
```bash
# Check PM2
pm2 status
pm2 logs flomark-backend

# Check web server
systemctl status nginx  # or apache2
journalctl -u nginx -f
```

### Demo Mode Not Working

**Issue:** Demo access denied

**Solutions:**
1. Verify `.env`: `DEMO_MODE=true`
2. Run setup: `pnpm run setup-demo`
3. Restart: `pm2 restart flomark-backend`
4. Check project ID matches

### 502 Bad Gateway

**Issue:** Backend not reachable

**Solutions:**
1. Restart backend: `pm2 restart flomark-backend`
2. Check port: `BACKEND_URL` in `.env`
3. Verify MongoDB running
4. Check firewall rules

---

## 📈 Performance Optimization

### After Installation

1. **Enable PM2 Cluster Mode**
   ```bash
   pm2 delete flomark-backend
   pm2 start backend/src/server.js -i max --name flomark-backend
   ```

2. **Configure Caching**
   - Static assets: 1 year
   - API responses: as needed
   - index.html: no cache

3. **Enable HTTP/2** (with SSL)
   - Nginx: `listen 443 ssl http2;`
   - Apache: `Protocols h2 http/1.1`

4. **Database Indexes**
   ```prisma
   @@index([email])
   @@index([createdAt])
   ```

---

## 🔒 Security Checklist

After installation:

- [ ] Change `JWT_SECRET` to random value
- [ ] Use strong MongoDB password
- [ ] Enable SSL/HTTPS with certbot
- [ ] Configure firewall (ufw/firewalld)
- [ ] Disable root SSH login
- [ ] Set up fail2ban (optional)
- [ ] Enable auto security updates
- [ ] Configure regular backups
- [ ] Review and monitor logs
- [ ] Restrict PM2 access
- [ ] Use .env files (never commit)

---

## 📚 Documentation Links

### Installation & Deployment
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete guide
- [DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md) - Quick reference
- [INSTALLATION-SCRIPTS-README.md](INSTALLATION-SCRIPTS-README.md) - Scripts details

### Demo Mode
- [DEMO-MODE-README.md](DEMO-MODE-README.md) - Full demo mode guide

### General
- [README.md](README.md) - Main documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide

---

## 🎉 Success Checklist

After running scripts, verify:

✅ Application loads at your domain  
✅ Login/registration works  
✅ Can create projects  
✅ Can create and move tasks  
✅ Real-time updates work  
✅ File uploads work  
✅ Demo mode works (if enabled)  
✅ No errors in logs  
✅ SSL certificate valid (if configured)  
✅ Services auto-start on reboot  

---

## 🆘 Getting Help

### Self-Help Resources
1. Check relevant documentation above
2. Review installation logs
3. Check PM2 logs: `pm2 logs`
4. Review web server logs
5. Search GitHub issues

### Community Support
- **GitHub Issues:** https://github.com/cli1337/flomark/issues
- **Discussions:** GitHub Discussions tab

### Reporting Issues

When reporting problems, include:
1. OS and version
2. Installation method used
3. Error messages/logs
4. Steps to reproduce
5. Environment variables (redact secrets)

---

## 🏆 Summary

### What You Get

✅ **3 Installation Scripts**
- Unified interactive script
- Nginx-specific script
- Apache-specific script

✅ **Demo Mode Feature**
- Public project access
- Sample data included
- Visual indicators
- Security controls

✅ **Complete Documentation**
- Deployment guides
- Quick references
- Troubleshooting tips
- Security guidelines

✅ **Production Ready**
- SSL support
- Process management
- Monitoring setup
- Performance optimized

---

**Happy deploying! 🚀**

---

*All scripts and documentation created for Flomark v1.0*
*Last updated: October 2024*

