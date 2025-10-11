# 🚀 Complete Flomark Setup Guide

**Everything you need to deploy, update, and manage Flomark with multi-database support**

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Database Support](#-database-support)
3. [Installation](#-installation)
4. [Updates](#-updates)
5. [Configuration](#-configuration)
6. [Common Tasks](#-common-tasks)
7. [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start

### One-Command Installation

```bash
sudo bash <(curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh)
```

**The installer will guide you through:**

1. **Package Manager** - Choose npm or pnpm (auto-detected)
2. **Database Selection** - MongoDB, PostgreSQL, MySQL, or SQLite
3. **Database Connection** - Enter your connection string
4. **Server Configuration** - Domain, ports, web server
5. **Admin Account** - Create your admin user

**Installation completes in ~5-10 minutes!**

---

## 💾 Database Support

Flomark supports multiple databases through Prisma ORM:

### MongoDB (Document Database)
```bash
# Local
mongodb://localhost:27017/flomark

# MongoDB Atlas (Cloud)
mongodb+srv://user:password@cluster.mongodb.net/flomark
```

### PostgreSQL (Relational Database)
```bash
# Local
postgresql://user:password@localhost:5432/flomark

# Cloud with SSL
postgresql://user:password@host:5432/flomark?sslmode=require&schema=public
```

### MySQL/MariaDB (Popular SQL)
```bash
# Local
mysql://user:password@localhost:3306/flomark

# Cloud
mysql://user:password@host:3306/flomark
```

### SQLite (Serverless, File-Based)
```bash
# Relative path
file:./flomark.db

# Absolute path
file:/var/lib/flomark/database.db
```

**Which database to choose?**
- **MongoDB**: Best for flexibility, JSON-like data, easy scaling
- **PostgreSQL**: Best for complex queries, data integrity, advanced features
- **MySQL**: Best for compatibility, proven reliability, wide hosting support
- **SQLite**: Best for single-server, embedded, zero-config deployments

---

## 📦 Installation

### Quick Install (Recommended)

```bash
sudo bash <(curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh)
```

### Features

- ✅ **Multi-Database Support** - Choose your preferred database
- ✅ **Package Manager Detection** - Works with npm or pnpm
- ✅ **Auto-Configuration** - Generates configs for your database
- ✅ **Web Server Setup** - Nginx or Apache with full config
- ✅ **Systemd Integration** - Auto-restart and logging
- ✅ **One Script** - No need for multiple install files

### What Gets Installed

✅ **Database** (Your Choice)
- Auto-installs if using localhost
- Generates Prisma schema
- Creates tables/collections
- Handles migrations

✅ **Web Server** (Nginx or Apache)
- Reverse proxy configured
- WebSocket support enabled
- SSL-ready configuration
- React Router handling

✅ **Backend** (Node.js + Systemd)
- Express API server
- Socket.io for real-time
- Prisma ORM with your database
- Systemd service (auto-restart)
- Rate limiting for security

✅ **Frontend** (React + Vite)
- Production build
- Optimized & minified assets
- Code splitting
- Modern bundle

✅ **Database**
- Schema deployed
- Indexes created
- Owner account created

---

## 🔄 Updates

### Quick Update (Recommended)

```bash
# From anywhere (auto-detects installation):
sudo bash <(curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/update.sh)

# Or from installation directory:
cd /var/www/flomark
git pull
sudo bash update.sh
```

### Update Features

**Smart Detection:**
- ✅ Auto-detects installation path
- ✅ Detects npm vs pnpm
- ✅ Lets you choose package manager if both available
- ✅ Works with all database types
- ✅ Handles missing lockfiles gracefully

**Safety:**
- ✅ Automatic backup before update
- ✅ Backs up .env file
- ✅ Backs up storage directory
- ✅ Rollback on failure
- ✅ Service health check

**What Gets Updated:**
- ✅ Backend source code
- ✅ Frontend build
- ✅ Dependencies (npm/pnpm)
- ✅ Database schema (if changed)
- ✅ Prisma client

**What's Preserved:**
- ✅ .env configuration
- ✅ storage/ directory (uploads)
- ✅ Database data
- ✅ User accounts
- ✅ Projects and tasks

### Automatic Update Notifications

The app now checks for updates automatically:

**For Users:**
- Checks GitHub for latest version every 30 minutes
- Shows update banner when new version available
- Compares backend and frontend versions separately

**For OWNER Role:**
- See detailed update instructions
- Quick links to update commands
- Expandable instruction panel
- Dismissible notifications (remembers per version)

---

## ⚙️ Configuration

### Environment Variables

Edit `backend/.env` to configure:

```bash
# Database (choose one)
DATABASE_URL="mongodb://localhost:27017/flomark"
DATABASE_URL="postgresql://user:password@localhost:5432/flomark"
DATABASE_URL="mysql://user:password@localhost:3306/flomark"
DATABASE_URL="file:./flomark.db"

# JWT Authentication
JWT_SECRET="your-secret-here"  # Generate with: openssl rand -hex 32
JWT_EXPIRES_IN="24h"

# Server
PORT=5000
BACKEND_URL="http://yourdomain.com:5000"

# Demo Mode (optional)
DEMO_MODE=false  # Set to true to enable demo login

# Email (optional)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM_EMAIL=""
```

### Demo Mode

When `DEMO_MODE=true` in backend `.env`:
- Login page shows demo credentials
- Users can log in with: `demo@flomark.app` / `demo`
- Banner shows "Demo Mode Active"
- All features available with backend demo setup

---

## ✨ Key Features

### Multi-Database Support

| Database | Best For | ID Type | Auto-Install |
|----------|----------|---------|--------------|
| MongoDB | Flexibility, JSON data | ObjectId | ✅ Yes |
| PostgreSQL | Data integrity, complex queries | CUID | ✅ Yes |
| MySQL | Compatibility, reliability | CUID | ✅ Yes |
| SQLite | Embedded, zero-config | CUID | N/A |

### Security Features

✅ **Rate Limiting** (NEW)
- Login: 5 attempts / 15 min
- Registration: 3 attempts / hour
- Password changes: 10 attempts / 15 min
- Token refresh: 20 attempts / 15 min

✅ **Authentication**
- JWT tokens with refresh
- 2FA with TOTP
- Password hashing (bcrypt)
- Session management

### Installation & Updates

✅ **Package Manager Support**
- Auto-detects npm and pnpm
- Lets you choose if both available
- Uses lockfiles when present
- Falls back gracefully

✅ **Auto Update Notifications**
- Checks GitHub every 30 minutes
- Shows version differences
- OWNER sees update commands
- Dismissible per version

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
# One-command installation
sudo bash <(curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh)

# Follow interactive prompts for:
# - Database type and connection
# - Server configuration
# - Admin credentials

# Setup SSL (recommended)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Update Existing Installation

```bash
# Quick update (auto-detects everything)
sudo bash <(curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/update.sh)

# Or from installation directory
cd /var/www/flomark
git pull
sudo bash update.sh
```

### Switch Database Type

```bash
cd /var/www/flomark/backend

# 1. Backup current data
npx prisma studio  # Export data manually

# 2. Update .env with new DATABASE_URL
nano .env

# 3. Update Prisma schema
# Edit prisma/schema.prisma - change provider to:
# mongodb | postgresql | mysql | sqlite

# 4. Generate and migrate
npx prisma generate
npx prisma db push

# 5. Import data back (if needed)

# 6. Restart service
sudo systemctl restart flomark-backend
```

### Create Additional Admin

```bash
cd /var/www/flomark/backend
node scripts/make-admin.js
# Follow interactive prompts
```

### Backup Everything

```bash
# Create backup directory
BACKUP_DIR=~/flomark-backup-$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

# Backup based on database type:

# MongoDB
mongodump --uri="mongodb://localhost:27017/flomark" --out=$BACKUP_DIR/db

# PostgreSQL
pg_dump flomark > $BACKUP_DIR/db/flomark.sql

# MySQL
mysqldump flomark > $BACKUP_DIR/db/flomark.sql

# SQLite
cp /var/www/flomark/backend/flomark.db $BACKUP_DIR/db/

# Backup storage & config
cp -r /var/www/flomark/backend/storage $BACKUP_DIR/
cp /var/www/flomark/backend/.env $BACKUP_DIR/
```

### Restore from Backup

```bash
BACKUP_DIR=~/flomark-backup-20241011-120000

# Stop service
sudo systemctl stop flomark-backend

# Restore based on database type:

# MongoDB
mongorestore --uri="mongodb://localhost:27017/flomark" --drop $BACKUP_DIR/db/flomark

# PostgreSQL
psql flomark < $BACKUP_DIR/db/flomark.sql

# MySQL
mysql flomark < $BACKUP_DIR/db/flomark.sql

# SQLite
cp $BACKUP_DIR/db/flomark.db /var/www/flomark/backend/

# Restore storage & config
cp -r $BACKUP_DIR/storage /var/www/flomark/backend/
cp $BACKUP_DIR/.env /var/www/flomark/backend/

# Start service
sudo systemctl start flomark-backend
```

### Monitor Services

```bash
# Check backend status
sudo systemctl status flomark-backend

# View backend logs
sudo journalctl -u flomark-backend -f

# View nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Monitor resources
htop
```

### Database Management

```bash
# Open Prisma Studio (GUI)
cd /var/www/flomark/backend
npx prisma studio
# Access at http://localhost:5555

# View database schema
npx prisma db pull

# Reset database (CAUTION!)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

---

## 🔐 Security Checklist

After installation:

- [ ] Change JWT_SECRET to random value (auto-generated by installer)
- [ ] Use strong database password
- [ ] Enable SSL/HTTPS with certbot
- [ ] Configure firewall (ufw/firewalld)
- [ ] Disable root SSH login
- [ ] Set up fail2ban (optional)
- [ ] Enable auto security updates
- [ ] Configure regular backups
- [ ] Review and monitor logs
- [ ] Never commit .env files
- [ ] Enable 2FA for admin accounts
- [ ] Review rate limits in production

---

## 🎯 Quick Reference

### Environment Variables

Required in `backend/.env`:
```env
# Database (choose one)
DATABASE_URL=mongodb://localhost:27017/flomark
DATABASE_URL=postgresql://user:password@localhost:5432/flomark
DATABASE_URL=mysql://user:password@localhost:3306/flomark
DATABASE_URL=file:./flomark.db

# Authentication
JWT_SECRET=<random-32-char-string>  # Auto-generated
JWT_EXPIRES_IN=24h

# Server
PORT=5000
BACKEND_URL=https://yourdomain.com
```

Optional:
```env
DEMO_MODE=false  # Set true to show demo credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=app-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Important Commands

```bash
# Systemd (replaces PM2)
sudo systemctl status flomark-backend   # View status
sudo systemctl restart flomark-backend  # Restart
sudo journalctl -u flomark-backend -f   # View logs
sudo systemctl enable flomark-backend   # Enable auto-start

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo nginx -t

# Database
npx prisma studio              # GUI at localhost:5555
npx prisma db push             # Apply schema changes
npx prisma generate            # Regenerate client

# Updates
sudo bash update.sh            # Update everything
git pull                       # Get latest code
```

### File Locations

- Backend: `/var/www/flomark/backend/`
- Frontend: `/var/www/flomark/frontend/`
- Storage: `/var/www/flomark/backend/storage/`
- Config: `/var/www/flomark/backend/.env`
- Service: `/etc/systemd/system/flomark-backend.service`
- Nginx: `/etc/nginx/sites-available/flomark`
- Apache: `/etc/apache2/sites-available/flomark.conf`
- Logs: `sudo journalctl -u flomark-backend`

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
→ Backend not running: `sudo systemctl restart flomark-backend`

**404 Not Found**
→ Frontend not built or web server misconfigured

**WebSocket Not Working**
→ Check proxy config in web server (Upgrade headers)

**File Upload Fails**
→ Check file size limits and storage permissions

**Database Connection Failed**
→ Verify DATABASE_URL in .env and database is running

**Rate Limit Hit**
→ Wait for the cooldown period or adjust limits in rate-limit.middleware.js

---

## 🎉 Success Indicators

After installation, verify:

✅ Application loads at your domain  
✅ Login works with admin credentials  
✅ Can create projects and tasks  
✅ Drag & drop works  
✅ Real-time updates work  
✅ File uploads work  
✅ Demo mode shows credentials (if enabled)  
✅ No errors in logs  
✅ SSL certificate valid (if configured)  
✅ Service auto-starts on reboot  
✅ Database connected (check logs)  
✅ Rate limiting active  

---

## 📊 What You Get

- ✨ **One Installation Script** - Multi-database, multi-package-manager
- 📚 **Complete Documentation** - Installation, updates, troubleshooting
- 🗄️ **4 Database Options** - MongoDB, PostgreSQL, MySQL, SQLite
- 🔒 **Rate Limiting** - Brute force protection
- 🔔 **Update Notifications** - Automatic version checking
- 👤 **Admin Management** - Full user management
- ⚡ **Production Ready** - Systemd, auto-restart, logging

---

**Everything you need to deploy, manage, and scale Flomark on any database! 🚀**

*For detailed information about specific features, refer to the documentation files listed above.*

