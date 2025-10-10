# 🎉 What's New in Flomark

Recent improvements and new features added to Flomark installation and management.

---

## 🔔 Fixed: Real Notification Counts

**Problem:** Project list was showing random numbers (1-5) instead of actual notification counts.

**Solution:** 
- ✅ Added backend endpoint: `GET /api/notifications/unread-count-by-project`
- ✅ Created `notificationService.js` for frontend
- ✅ Projects now show **actual unread notifications** per project
- ✅ Real-time updates via WebSocket when notifications arrive

**Files Changed:**
- `backend/src/services/notification.service.js`
- `backend/src/controllers/notifications.controller.js`
- `backend/src/routes/notifications.routes.js`
- `frontend/src/services/notificationService.js`
- `frontend/src/pages/projects/Projects.jsx`

---

## 📋 New: Comprehensive Log Viewer

**Problem:** No easy way to view all application logs in one place.

**Solution:** Interactive log viewer script with multiple options!

### Usage:

```bash
# Interactive menu
./logs.sh

# Quick commands
./logs.sh backend    # Backend logs
./logs.sh access     # Access logs
./logs.sh error      # Error logs
./logs.sh all        # All logs in parallel
```

### Features:
- ✅ View backend (PM2) logs
- ✅ View Nginx/Apache access logs
- ✅ View Nginx/Apache error logs
- ✅ View system journal logs
- ✅ View all logs in parallel (multitail)
- ✅ Clear/rotate old logs
- ✅ Check disk usage
- ✅ Filter error logs only
- ✅ Live tail or last N lines

**Files Added:**
- `logs.sh` - Interactive log viewer
- `LOGS-README.md` - Complete documentation

---

## 🌐 New: Interactive Domain Configuration

**Problem:** Had to remember command-line arguments for domain setup.

**Solution:** Interactive prompts guide you through configuration!

### Before:
```bash
sudo ./install.sh myapp.example.com nginx 3000
```

### Now:
```bash
sudo ./install.sh
# Just answer the prompts!
```

### Interactive Prompts:

1. **Domain Configuration**
   ```
   Do you want to configure a custom domain?
   - Choose 'Yes' if you have a domain (e.g., myapp.example.com)
   - Choose 'No' for local development (will use localhost)
   
   Configure domain? [y/N]:
   ```

2. **Backend Port**
   ```
   Default backend port is 3000.
   Do you want to use a different port?
   
   Use custom port? [y/N]:
   ```

3. **Web Server Selection**
   ```
   Select your web server:
     1) Nginx (Recommended)
        ✓ Better performance
        ✓ Lower memory usage
     
     2) Apache
        ✓ More familiar to some users
        ✓ Extensive documentation
   
   Enter choice [1-2] (default: 1):
   ```

4. **Demo Mode**
   ```
   Demo Mode allows visitors to try your app without registration.
   Enable Demo Mode? [y/N]:
   ```

**Files Changed:**
- `install.sh` - Added interactive prompts
- `install-nginx.sh` - Added port checking
- `install-apache.sh` - Added port checking

**Files Added:**
- `INSTALLATION-INTERACTIVE-GUIDE.md` - Detailed guide
- `DOMAIN-SETUP-GUIDE.md` - Domain configuration help

---

## 🔌 New: Port Conflict Detection

**Problem:** Installation would fail if port 3000 was already in use.

**Solution:** Automatic detection and resolution!

### Features:

1. **Detects port conflicts** before installation
2. **Shows which process** is using the port
3. **Offers solutions:**
   - Stop the service
   - Choose different port
   - Exit and resolve manually

### Example:

```
Checking port availability...
⚠️  Port 3000 is already in use!

Process using port 3000:
  node    12345 user   TCP *:3000 (LISTEN)

Options:
  1) Stop the service using port 3000 and continue
  2) Use a different port (recommended)
  3) Exit installation

Enter choice [1-3]: 2

Enter port to use (suggested: 3001): 3001
✓ Using port 3001
```

### Automatic Updates:
- ✅ Updates `.env` with selected port
- ✅ Updates Nginx/Apache config
- ✅ Updates PM2 configuration
- ✅ Everything just works!

---

## 📚 New Documentation

### Log Management
- **`LOGS-README.md`** - Complete log viewer guide
  - How to view logs
  - Log rotation
  - Troubleshooting
  - Common use cases

### Domain Setup
- **`DOMAIN-SETUP-GUIDE.md`** - Domain configuration
  - DNS setup
  - SSL/HTTPS configuration
  - Multiple domains
  - Troubleshooting

### Interactive Installation
- **`INSTALLATION-INTERACTIVE-GUIDE.md`** - Step-by-step guide
  - All interactive prompts explained
  - Usage examples
  - Best practices
  - Troubleshooting

---

## 🎯 Quick Start Guide

### For Production:

```bash
# 1. Clone repository
git clone https://github.com/cli1337/flomark.git
cd flomark

# 2. Configure backend
cd backend
cp env.example .env
nano .env  # Edit your MongoDB URL, JWT secret, etc.
cd ..

# 3. Run installer
sudo ./install.sh
```

**Answer prompts:**
- Configure domain? **Yes** → Enter your domain
- Use custom port? **No** (use default 3000)
- Web server: **1** (Nginx)
- Enable Demo Mode? **No**

**Done!** Access at `http://yourdomain.com`

### For Local Development:

```bash
# 1-2. Same as above

# 3. Run installer
sudo ./install.sh
```

**Answer prompts:**
- Configure domain? **No** (use localhost)
- Use custom port? **No** (use default 3000)
- Web server: **1** (Nginx)
- Enable Demo Mode? **Yes** (for easy testing)

**Done!** Access at `http://localhost`

### View Logs:

```bash
# Interactive menu
./logs.sh

# Or quick commands
./logs.sh backend
./logs.sh access
./logs.sh error
```

---

## 🔄 Migration Guide

### If You're Already Using Flomark:

**No breaking changes!** Everything is backward compatible.

**To use new features:**

1. **Update your installation:**
   ```bash
   cd flomark
   git pull
   chmod +x logs.sh install.sh
   ```

2. **Start using the log viewer:**
   ```bash
   ./logs.sh
   ```

3. **Fix notification counts:**
   - Backend automatically updated (restart backend)
   - Frontend will pick up new API endpoint

---

## 📊 Comparison

### Before:
```bash
# Installation
sudo ./install.sh mydomain.com nginx 3000  # Had to remember arguments

# Logs
pm2 logs flomark-backend                    # Only backend logs
tail -f /var/log/nginx/error.log           # Manual log checking

# Port conflicts
# Installation would fail, had to fix manually

# Notifications
# Project list showed random numbers 1-5
```

### After:
```bash
# Installation
sudo ./install.sh                          # Interactive prompts guide you
# ✓ Domain configuration
# ✓ Port selection with conflict detection  
# ✓ Web server choice
# ✓ Demo mode option

# Logs
./logs.sh                                  # All logs in one tool
# ✓ Backend, frontend, web server
# ✓ Live tail or last N lines
# ✓ Error filtering
# ✓ Parallel viewing

# Port conflicts
# Automatically detected and resolved
# ✓ Shows what's using the port
# ✓ Suggests alternative
# ✓ Updates all configs

# Notifications
# Shows actual unread notification count
# ✓ Per project
# ✓ Real-time updates
# ✓ WebSocket synced
```

---

## 🆘 Troubleshooting

### Port Already in Use

**Old way:**
```bash
# Find and kill process manually
lsof -i :3000
kill -9 <PID>
sudo ./install.sh
```

**New way:**
```bash
sudo ./install.sh
# Script detects conflict automatically
# Choose option 2, enter new port
# Everything configured automatically
```

### Want to View Logs

**Old way:**
```bash
# Backend
pm2 logs flomark-backend

# Nginx access
sudo tail -f /var/log/nginx/access.log

# Nginx error  
sudo tail -f /var/log/nginx/error.log

# Had to remember all paths
```

**New way:**
```bash
./logs.sh
# Interactive menu with all options
# Or: ./logs.sh backend
# Or: ./logs.sh access
# Or: ./logs.sh all
```

### Domain Configuration

**Old way:**
```bash
# Edit Nginx config manually
sudo nano /etc/nginx/sites-available/flomark
# Find server_name line
# Edit manually
sudo systemctl reload nginx
```

**New way:**
```bash
sudo ./install.sh
# Interactive prompt asks for domain
# Automatically configured in Nginx/Apache
# No manual editing needed
```

---

## 🎁 Benefits Summary

| Feature | Before | After |
|---------|--------|-------|
| **Installation** | Command-line args | Interactive prompts |
| **Port Conflicts** | Manual fix required | Auto-detected & resolved |
| **Logs** | Multiple commands | Single tool (`./logs.sh`) |
| **Domain Setup** | Manual config edit | Guided prompts |
| **Notifications** | Random numbers | Real counts |
| **Documentation** | Scattered | Comprehensive guides |
| **Troubleshooting** | Trial and error | Clear error messages |
| **User Experience** | Expert-level | Beginner-friendly |

---

## 📖 Related Documentation

- **INSTALLATION-INTERACTIVE-GUIDE.md** - Interactive installation guide
- **LOGS-README.md** - Log management
- **DOMAIN-SETUP-GUIDE.md** - Domain and DNS setup
- **DEPLOYMENT.md** - Complete deployment guide
- **DEPLOYMENT-QUICKSTART.md** - Quick reference

---

## 🙏 Feedback

Found a bug or have a suggestion? Please open an issue on GitHub!

**Happy deploying! 🚀**

