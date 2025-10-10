# 🚀 Flomark Installation Guide

Complete guide for installing and updating Flomark on your server.

## 📋 Prerequisites

- Ubuntu/Debian Linux server (20.04 LTS or newer recommended)
- Root access or sudo privileges
- Internet connection
- At least 2GB RAM
- 10GB free disk space

## 🎯 Quick Installation

### Method 1: Clone and Install (Recommended)

```bash
# Step 1: Clone the repository
git clone https://github.com/cli1337/flomark.git
cd flomark

# Step 2: Make script executable
chmod +x install.sh

# Step 3: Run installation
sudo ./install.sh
```

### Method 2: Remote Installation

```bash
# Step 1: Download the installer
curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/install-remote.sh -o /tmp/flomark-install.sh

# Step 2: Run with sudo
sudo bash /tmp/flomark-install.sh
```

**Note:** Do NOT pipe curl directly to bash (e.g., `curl | sudo bash`). Always download first, then execute.

## 📝 Interactive Setup

The installer will ask you:

1. **Web Server**: Choose between `apache` or `nginx`
2. **Installation Path**: Default is `/var/www/flomark`
3. **Domain/IP**: Enter your domain or press Enter to use local IP
4. **Frontend Port**: Default is `80`
5. **Backend Port**: Default is `5000`
6. **Demo Mode**: Choose `y` for demo mode or `n` for production
7. **Admin Credentials** (if not demo mode):
   - First name
   - Last name
   - Email
   - Password

## 🎭 Installation Modes

### Demo Mode

Perfect for testing and demonstrations:
- ✅ No MongoDB required (uses in-memory storage)
- ✅ Auto-creates sample projects
- ✅ Auto-resets every 20-30 minutes
- ✅ Pre-configured demo user
- ✅ Quick setup

**Demo Credentials:**
- Email: `demo@flomark.app`
- Password: `demo`

### Production Mode

Full-featured installation:
- ✅ MongoDB database
- ✅ Persistent storage
- ✅ Custom admin account
- ✅ Full email support (optional)
- ✅ Production-ready

## 🌐 Web Server Options

### Apache

The installer will:
- Install Apache with required modules
- Configure reverse proxy for API
- Setup WebSocket support for real-time features
- Create virtual host configuration
- Handle React Router properly

### Nginx

The installer will:
- Install Nginx
- Configure reverse proxy for API
- Setup WebSocket support
- Create server block configuration
- Handle React Router properly

## 🔧 What the Installer Does

1. **System Check**: Verifies no existing Flomark installation
2. **Dependency Installation**:
   - Node.js 20.x
   - pnpm package manager
   - MongoDB (if production mode)
   - Web server (Apache or Nginx)
3. **Application Setup**:
   - Copies backend files
   - Builds frontend for production
   - Installs dependencies
   - Creates configuration files
4. **Database Setup** (if production):
   - Initializes Prisma
   - Creates database schema
   - Creates admin user
5. **Service Configuration**:
   - Creates systemd service
   - Enables auto-start on boot
   - Starts the application
6. **Web Server Configuration**:
   - Configures reverse proxy
   - Sets up WebSocket support
   - Enables HTTPS-ready configuration

## 📦 Post-Installation

### Access Your Application

If you used port 80:
```
http://your-domain-or-ip
```

If you used a custom port (e.g., 8080):
```
http://your-domain-or-ip:8080
```

### Useful Commands

```bash
# Check application status
sudo systemctl status flomark-backend

# View application logs
sudo journalctl -u flomark-backend -f

# Restart application
sudo systemctl restart flomark-backend

# Stop application
sudo systemctl stop flomark-backend

# Start application
sudo systemctl start flomark-backend
```

### Configuration Files

- **Backend config**: `/var/www/flomark/backend/.env`
- **Apache config**: `/etc/apache2/sites-available/flomark.conf`
- **Nginx config**: `/etc/nginx/sites-available/flomark`
- **Systemd service**: `/etc/systemd/system/flomark-backend.service`

## 🔄 Updating Flomark

When a new version is released, update with:

```bash
sudo /var/www/flomark/update.sh
```

Or from the repository directory:

```bash
sudo ./update.sh
```

### What the Update Script Does

1. **Detects Installation**: Automatically finds your Flomark installation
2. **Creates Backup**: Backs up .env and storage files
3. **Downloads Latest**: Clones latest version from GitHub
4. **Stops Services**: Safely stops the application
5. **Updates Backend**: Replaces code and dependencies
6. **Updates Frontend**: Builds and deploys new frontend
7. **Restores Config**: Restores your .env and storage
8. **Updates Database**: Applies schema changes if needed
9. **Starts Services**: Restarts the application
10. **Verifies**: Checks if update was successful

### Update Safety

- Automatic backup before update
- Configuration files are preserved
- User data and uploads are retained
- Automatic rollback on failure

## 🔐 Security Configuration

### Change Default Ports

Edit `/var/www/flomark/backend/.env`:

```bash
PORT=5000  # Change backend port
```

Then restart:
```bash
sudo systemctl restart flomark-backend
```

For frontend port, reconfigure your web server and restart it.

### Enable HTTPS (Recommended)

#### Using Let's Encrypt with Apache

```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com
```

#### Using Let's Encrypt with Nginx

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Configure Email (Optional)

Edit `/var/www/flomark/backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Flomark
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

Restart backend:
```bash
sudo systemctl restart flomark-backend
```

## 🛠️ Troubleshooting

### Backend Won't Start

Check logs:
```bash
sudo journalctl -u flomark-backend -n 50
```

Common issues:
- Port already in use
- MongoDB not running (production mode)
- Missing dependencies
- Invalid .env configuration

### Frontend Not Loading

Check web server:
```bash
# Apache
sudo systemctl status apache2
sudo tail -f /var/log/apache2/flomark-error.log

# Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/flomark-error.log
```

### Port Already in Use

Change ports in:
1. `/var/www/flomark/backend/.env` (PORT=)
2. Web server config (Apache/Nginx)
3. Restart services

### Database Connection Failed

Production mode only:

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB on boot
sudo systemctl enable mongod
```

### Update Failed

Restore from backup:
```bash
# Backup location is shown after update
# Usually /tmp/flomark-backup-YYYYMMDD-HHMMSS

sudo systemctl stop flomark-backend
sudo cp /tmp/flomark-backup-*/. env /var/www/flomark/backend/.env
sudo systemctl start flomark-backend
```

## 🔍 Advanced Configuration

### Custom Installation Path

When prompted during installation, enter your desired path:
```
Enter installation path: /opt/flomark
```

### Multiple Instances

⚠️ **Not Supported**: The installer prevents multiple instances on the same server to avoid conflicts. Use separate servers or Docker containers for multiple instances.

### Reverse Proxy Setup

If you need Flomark behind another reverse proxy:

1. Install Flomark with custom ports
2. Configure your main proxy to forward to Flomark's frontend port
3. Ensure WebSocket upgrade headers are passed

### Firewall Configuration

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow custom frontend port (if not 80)
sudo ufw allow 8080/tcp

# Note: Backend port should NOT be exposed directly
```

## 📞 Getting Help

- **Issues**: https://github.com/cli1337/flomark/issues
- **Documentation**: https://github.com/cli1337/flomark
- **Email**: Check repository for contact information

## 📝 Uninstallation

To remove Flomark:

```bash
# Stop and disable service
sudo systemctl stop flomark-backend
sudo systemctl disable flomark-backend
sudo rm /etc/systemd/system/flomark-backend.service
sudo systemctl daemon-reload

# Remove installation
sudo rm -rf /var/www/flomark

# Remove web server config
# Apache:
sudo a2dissite flomark
sudo rm /etc/apache2/sites-available/flomark.conf
sudo systemctl reload apache2

# Nginx:
sudo rm /etc/nginx/sites-enabled/flomark
sudo rm /etc/nginx/sites-available/flomark
sudo systemctl reload nginx

# Remove MongoDB (if desired and not used by other apps)
sudo systemctl stop mongod
sudo systemctl disable mongod
sudo apt remove mongodb-org
```

## 🎉 Success!

You should now have Flomark running on your server. Enjoy your project management system!

