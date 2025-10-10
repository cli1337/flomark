# 🚀 Flomark Installation Scripts

This document describes the automated installation and update scripts for Flomark.

## 📁 Files Created

- **`install.sh`** - Interactive installation script
- **`update.sh`** - Update script for existing installations
- **`INSTALLATION-README.md`** - Comprehensive installation documentation

## ✨ Features

### install.sh

The interactive installation script that sets up Flomark from scratch:

**Interactive Configuration:**
- ✅ Web server choice (Apache or Nginx)
- ✅ Custom installation path (default: `/var/www/flomark`)
- ✅ Domain or IP address
- ✅ Custom frontend port (default: 80)
- ✅ Custom backend port (default: 5000)
- ✅ Demo mode or production mode
- ✅ Admin credentials (if production mode)

**Automated Setup:**
- ✅ Installs system dependencies (Node.js, pnpm, MongoDB)
- ✅ Checks for existing installations (prevents duplicates)
- ✅ Builds frontend for production with Vite
- ✅ Configures backend with auto-generated JWT secrets
- ✅ Creates systemd service for auto-start on boot
- ✅ Configures web server (Apache or Nginx)
- ✅ Sets up reverse proxy and WebSocket support
- ✅ Creates admin account or enables demo mode

**Security Features:**
- ✅ Generates secure JWT secrets automatically
- ✅ Prevents multiple installations on same server
- ✅ Root/sudo permission checks
- ✅ Secure password confirmation

### update.sh

The update script for existing Flomark installations:

**Safety Features:**
- ✅ Auto-detects existing installation
- ✅ Creates backups before updating (.env, storage)
- ✅ Automatic rollback on failure
- ✅ Preserves all user data and configurations

**Update Process:**
- ✅ Downloads latest version from GitHub
- ✅ Updates backend code and dependencies
- ✅ Rebuilds frontend with new changes
- ✅ Updates database schema if needed
- ✅ Restarts services automatically
- ✅ Verifies successful update

## 🚀 Usage

### Installation

```bash
# Clone the repository
git clone https://github.com/cli1337/flomark.git
cd flomark

# Make scripts executable (Linux only, skip on Windows)
chmod +x install.sh update.sh

# Run installation
sudo ./install.sh
```

### Updating

```bash
# From repository directory
cd flomark
sudo ./update.sh

# Or from installation directory
sudo /var/www/flomark/update.sh
```

## 📝 Configuration Options

### Demo Mode

Perfect for testing and demonstrations:
- No MongoDB required
- In-memory storage
- Auto-reset every 20-30 minutes
- Pre-configured demo user (demo@flomark.app / demo)

### Production Mode

Full-featured production deployment:
- MongoDB database
- Persistent storage
- Custom admin account
- Email support (optional)
- Full security features

## 🌐 Web Server Support

### Nginx (Recommended)

- Optimized configuration
- WebSocket support
- React Router handling
- Reverse proxy for API
- SSL-ready

### Apache

- Compatible configuration
- mod_proxy support
- mod_rewrite for routing
- WebSocket proxy
- SSL-ready

## 🔧 Post-Installation

### Service Management

```bash
# Check status
sudo systemctl status flomark-backend

# Restart service
sudo systemctl restart flomark-backend

# View logs
sudo journalctl -u flomark-backend -f

# Stop service
sudo systemctl stop flomark-backend

# Start service
sudo systemctl start flomark-backend
```

### Configuration Files

- **Backend config**: `/var/www/flomark/backend/.env`
- **Systemd service**: `/etc/systemd/system/flomark-backend.service`
- **Nginx config**: `/etc/nginx/sites-available/flomark`
- **Apache config**: `/etc/apache2/sites-available/flomark.conf`

## 🔐 Security Best Practices

1. **Change Default Ports**: Edit `.env` to use custom ports
2. **Enable HTTPS**: Use Let's Encrypt for SSL certificates
3. **Firewall Rules**: Only expose necessary ports
4. **Regular Updates**: Keep system and Flomark up to date
5. **Strong Passwords**: Use secure admin passwords
6. **Backup Regularly**: Backup `.env` and storage directory

## 📊 System Requirements

### Minimum Requirements

- Ubuntu/Debian Linux 20.04+
- 2GB RAM
- 10GB disk space
- Root/sudo access
- Internet connection

### Software Installed

- Node.js 20.x
- pnpm (latest)
- MongoDB 7.0+ (production mode only)
- Nginx or Apache
- Git

## 🐛 Troubleshooting

### Installation Issues

**Port Already in Use:**
- Choose different ports during installation
- Or stop service using the port

**MongoDB Connection Failed:**
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check DATABASE_URL in `.env`
- Or use demo mode (no MongoDB required)

**Backend Won't Start:**
- Check logs: `sudo journalctl -u flomark-backend -n 50`
- Verify `.env` configuration
- Ensure all dependencies installed

### Update Issues

**Update Failed:**
- Backup is automatically created at `/tmp/flomark-backup-*`
- Restore manually if needed
- Check logs for specific errors

**Service Won't Restart:**
- Check backend logs: `sudo journalctl -u flomark-backend -n 50`
- Verify configuration files
- Try manual restart: `sudo systemctl restart flomark-backend`

## 📚 Additional Documentation

- **INSTALLATION-README.md** - Detailed installation guide
- **COMPLETE-SETUP-GUIDE.md** - Complete setup instructions
- **README.md** - Main project documentation
- **CONTRIBUTING.md** - Contributing guidelines

## 🆘 Getting Help

- **GitHub Issues**: https://github.com/cli1337/flomark/issues
- **Discussions**: https://github.com/cli1337/flomark/discussions
- **Documentation**: https://github.com/cli1337/flomark#readme

## 📜 License

MIT License - See LICENSE file for details

---

Made with ❤️ by the Flomark team

