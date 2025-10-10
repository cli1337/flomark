# 🚀 Complete Flomark Setup Guide

**Everything you need to deploy, update, and manage Flomark**

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Installation](#-installation)
3. [Updates](#-updates)
4. [Demo Mode](#-demo-mode)
5. [All Features](#-all-features)
6. [Documentation Index](#-documentation-index)
7. [Common Tasks](#-common-tasks)

---

## ⚡ Quick Start

### One-Command Installation

```bash
# Clone repository
git clone https://github.com/cli1337/flomark.git
cd flomark

# Configure environment
cd backend && cp env.example .env && nano .env && cd ..

# Run installer (choose Nginx or Apache when prompted)
chmod +x install.sh
sudo ./install.sh yourdomain.com
```

**What happens:**
1. Detects your OS
2. Prompts for web server choice (Nginx/Apache)
3. Asks about demo mode
4. Installs all dependencies
5. Builds frontend
6. Prompts for owner account details
7. Sets up database
8. Configures web server
9. Starts all services

**You'll be asked for:**
- Owner First Name
- Owner Last Name
- Owner Email
- Owner Password (hidden)

---

## 📦 Installation

### Choose Your Method

#### Method 1: Unified Script (Recommended)
```bash
chmod +x install.sh
sudo ./install.sh yourdomain.com
# Interactive prompts for web server & demo mode
```

#### Method 2: Nginx-Specific
```bash
chmod +x install-nginx.sh
sudo ./install-nginx.sh yourdomain.com
# Optimized for Nginx, faster performance
```

#### Method 3: Apache-Specific
```bash
chmod +x install-apache.sh
sudo ./install-apache.sh yourdomain.com
# For Apache/httpd users
```

### What Gets Installed

✅ **Web Server** (Nginx or Apache)
- Reverse proxy configured
- WebSocket support enabled
- SSL-ready configuration
- Gzip compression
- Security headers

✅ **Backend** (Node.js + PM2)
- Express API server
- Socket.io for real-time
- MongoDB with Prisma
- PM2 process manager
- Auto-restart enabled

✅ **Frontend** (React + Vite)
- Production build
- Optimized assets
- Code splitting
- Service worker ready

✅ **Database**
- Schema deployed
- Indexes created
- Owner account created

---

## 🔄 Updates

### Safe Update Process

Flomark provides separate update scripts to protect your customizations:

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
- API routes

#### Update Frontend Only
```bash
chmod +x update-frontend.sh
./update-frontend.sh
```

**Preserves:**
- `frontend/src/custom/` directory
- Custom configurations
- Environment-specific settings

**Updates:**
- UI components
- Dependencies
- Build configuration
- Styles and assets

### Update Notification

Owners see an update notification panel with:
- Link to releases
- Update instructions
- Command examples
- Dismissible banner

---

## 🎭 Demo Mode

### What is Demo Mode?

Demo mode allows public access to a specific project without login:
- Perfect for showcasing features
- No registration required
- Full functionality available
- Real-time collaboration works

### Enable Demo Mode

1. **Edit `.env`:**
   ```env
   DEMO_MODE=true
   DEMO_PROJECT_ID=demo-project
   ```

2. **Create Demo Project:**
   ```bash
   cd backend
   pnpm run setup-demo
   ```

3. **Restart Backend:**
   ```bash
   pm2 restart flomark-backend
   ```

4. **Access Demo:**
   ```
   http://yourdomain.com/projects/demo-project
   ```

### Demo Mode Features

✅ **Public Access**
- No login required
- Auto-creates demo user
- Full CRUD operations
- Real-time updates

✅ **Sample Data**
- Pre-configured lists
- Sample tasks
- Multiple labels
- Welcome messages

✅ **Security**
- Isolated to demo project
- Prevents project deletion
- No admin access
- Protected user data

---

## ✨ All Features

### Installation Scripts (3)

| Script | Purpose | Best For |
|--------|---------|----------|
| `install.sh` | Unified installer | Most users - interactive |
| `install-nginx.sh` | Nginx-specific | Production - best performance |
| `install-apache.sh` | Apache-specific | Apache/RHEL users |

### Update Scripts (2)

| Script | Updates | Preserves |
|--------|---------|-----------|
| `update-backend.sh` | Server code | .env, uploads, storage |
| `update-frontend.sh` | UI code | custom/ directory |

### Demo Mode Components

**Backend:**
- `demo.middleware.js` - Access control
- `setup-demo.js` - Sample data creation
- Demo configuration in `.env`

**Frontend:**
- `DemoModeBanner.jsx` - Visual indicator
- `UpdateNotification.jsx` - Owner alerts

### Enhanced Features

✅ **Owner Account Creation**
- First/last name input
- Password during installation
- Interactive or scripted
- Enhanced validation

✅ **Update Notifications**
- Shows for OWNER role only
- Expandable instructions
- Links to documentation
- Dismissible panel

---

## 📚 Documentation Index

### Deployment Documentation

📖 **[DEPLOYMENT.md](DEPLOYMENT.md)** - 281 lines
- Complete deployment guide
- Prerequisites and requirements
- Step-by-step installation
- SSL/HTTPS setup
- Troubleshooting
- Security checklist

📖 **[DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md)** - 231 lines
- Quick reference card
- One-command deploy
- Essential commands
- Quick fixes

📖 **[INSTALLATION-SCRIPTS-README.md](INSTALLATION-SCRIPTS-README.md)** - 557 lines
- Detailed scripts overview
- Script comparison
- Usage examples
- Prerequisites
- Troubleshooting

### Update Documentation

📖 **[UPDATE-GUIDE.md](UPDATE-GUIDE.md)** - 400+ lines
- Complete update guide
- Backend update process
- Frontend update process
- Rollback procedures
- Best practices

### Feature Documentation

📖 **[DEMO-MODE-README.md](DEMO-MODE-README.md)** - 400+ lines
- What is demo mode
- Setup instructions
- Security considerations
- Customization guide
- FAQ

### Architecture Documentation

📖 **[ARCHITECTURE-DIAGRAM.md](ARCHITECTURE-DIAGRAM.md)** - 500+ lines
- Visual architecture diagrams
- Request flow diagrams
- Demo mode flow
- Installation flow
- Security layers
- Scaling options

### Summary Documents

📖 **[INSTALLATION-SUMMARY.md](INSTALLATION-SUMMARY.md)** - 450+ lines
- Complete implementation overview
- File structure
- Quick start guide

📖 **[FEATURES-SUMMARY.md](FEATURES-SUMMARY.md)** - 600+ lines
- All features breakdown
- Usage examples
- Statistics

📖 **[COMPLETE-SETUP-GUIDE.md](COMPLETE-SETUP-GUIDE.md)** - This file
- Everything in one place
- Quick reference
- Common tasks

---

## 🛠️ Common Tasks

### Initial Deployment

```bash
# 1. Clone and configure
git clone https://github.com/cli1337/flomark.git
cd flomark
cd backend && cp env.example .env && nano .env && cd ..

# 2. Install
chmod +x install.sh
sudo ./install.sh yourdomain.com

# 3. Setup SSL (optional but recommended)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Add Demo Mode to Existing Installation

```bash
# 1. Enable in .env
echo "DEMO_MODE=true" >> backend/.env
echo "DEMO_PROJECT_ID=demo-project" >> backend/.env

# 2. Setup demo project
cd backend && pnpm run setup-demo && cd ..

# 3. Restart
pm2 restart flomark-backend
```

### Update Installation

```bash
# Check for updates
git fetch origin
git log HEAD..origin/main --oneline

# Update backend
./update-backend.sh

# Update frontend
./update-frontend.sh

# Restart services
pm2 restart flomark-backend
systemctl reload nginx
```

### Create Additional Admin

```bash
cd backend
node scripts/make-admin.js newadmin@example.com ADMIN
# Or with details:
node scripts/make-admin.js admin@example.com ADMIN Jane Smith password123
```

### Backup Everything

```bash
# Create backup directory
mkdir -p ~/flomark-backup-$(date +%Y%m%d)

# Backup database
mongodump --db flomark --out ~/flomark-backup-$(date +%Y%m%d)/mongo

# Backup uploads
cp -r backend/uploads ~/flomark-backup-$(date +%Y%m%d)/

# Backup .env
cp backend/.env ~/flomark-backup-$(date +%Y%m%d)/
```

### Restore from Backup

```bash
# Stop services
pm2 stop flomark-backend
systemctl stop nginx

# Restore database
mongorestore --db flomark --drop ~/flomark-backup-20241010/mongo/flomark

# Restore uploads
cp -r ~/flomark-backup-20241010/uploads backend/

# Restore .env
cp ~/flomark-backup-20241010/.env backend/

# Start services
pm2 start flomark-backend
systemctl start nginx
```

### Monitor Services

```bash
# View all processes
pm2 list

# View backend logs
pm2 logs flomark-backend

# View nginx logs
sudo tail -f /var/log/nginx/error.log

# Monitor resources
pm2 monit
htop
```

### Troubleshooting

```bash
# Backend not starting
pm2 logs flomark-backend --err
cd backend && pnpm install
pm2 restart flomark-backend

# Frontend not loading
cd frontend && pnpm build
systemctl restart nginx

# Database issues
cd backend && npx prisma db push
npx prisma studio

# Check services
systemctl status nginx
pm2 status
systemctl status mongod
```

---

## 🔐 Security Checklist

After installation:

- [ ] Change JWT_SECRET to random value
- [ ] Use strong MongoDB password
- [ ] Enable SSL/HTTPS with certbot
- [ ] Configure firewall (ufw/firewalld)
- [ ] Disable root SSH login
- [ ] Set up fail2ban (optional)
- [ ] Enable auto security updates
- [ ] Configure regular backups
- [ ] Review and monitor logs
- [ ] Use .env files (never commit)
- [ ] Enable 2FA for owner account

---

## 📈 Performance Optimization

```bash
# Enable PM2 cluster mode
pm2 delete flomark-backend
pm2 start backend/src/server.js -i max --name flomark-backend
pm2 save

# Add database indexes
cd backend
npx prisma studio
# Add indexes in Prisma schema

# Enable HTTP/2 (with SSL)
# Edit Nginx config: listen 443 ssl http2;
sudo systemctl reload nginx
```

---

## 🎯 Quick Reference

### Environment Variables

Required in `backend/.env`:
```env
DATABASE_URL=mongodb://localhost:27017/flomark
JWT_SECRET=<random-32-char-string>
JWT_EXPIRES_IN=24h
PORT=3000
BACKEND_URL=https://yourdomain.com
```

Optional:
```env
DEMO_MODE=true
DEMO_PROJECT_ID=demo-project
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=app-password
```

### Important Commands

```bash
# PM2
pm2 status                    # View processes
pm2 logs flomark-backend      # View logs
pm2 restart flomark-backend   # Restart
pm2 monit                     # Monitor

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo nginx -t

# Database
npx prisma studio
npx prisma db push
mongodump --db flomark

# Updates
./update-backend.sh
./update-frontend.sh
```

### File Locations

- Backend: `./backend/`
- Frontend: `./frontend/`
- Uploads: `./backend/uploads/`
- Logs: `~/.pm2/logs/`
- Nginx Config: `/etc/nginx/sites-available/flomark`
- Apache Config: `/etc/apache2/sites-available/flomark.conf`

---

## 🆘 Getting Help

### Documentation
- Check relevant guide from index above
- Review troubleshooting sections
- Check error logs

### Community
- GitHub Issues: https://github.com/cli1337/flomark/issues
- GitHub Discussions: For questions

### Common Issues

**502 Bad Gateway**
→ Backend not running: `pm2 restart flomark-backend`

**404 Not Found**
→ Frontend not built: `cd frontend && pnpm build`

**WebSocket Not Working**
→ Check proxy config in web server

**File Upload Fails**
→ Check file size limits and permissions

---

## 🎉 Success Indicators

After installation, verify:

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

## 📊 What You Get

- ✨ **7 Automation Scripts** - Installation & updates
- 📚 **8 Documentation Files** - 3,500+ lines
- 🎭 **Demo Mode System** - Public demonstrations
- 🔔 **Update Notifications** - For administrators
- 👤 **Enhanced Admin Creation** - With full details
- 🔒 **Security Ready** - Best practices included
- ⚡ **Performance Optimized** - Production ready

---

**Everything you need to deploy, manage, and scale Flomark! 🚀**

*For detailed information, refer to specific documentation files listed above.*

