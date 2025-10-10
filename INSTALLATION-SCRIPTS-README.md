# 🚀 Installation Scripts Overview

Complete guide to the automated installation scripts for Flomark.

---

## 📦 What's Included

### Installation Scripts

1. **`install.sh`** - Unified installation script (RECOMMENDED)
   - Interactive menu to choose web server
   - Supports both Nginx and Apache
   - Optional demo mode setup
   - One script for all deployments

2. **`install-nginx.sh`** - Nginx-specific script
   - Optimized for Nginx
   - Faster performance
   - Better for high-traffic sites

3. **`install-apache.sh`** - Apache-specific script
   - Apache/httpd configuration
   - Compatible with RHEL/CentOS
   - Familiar to Apache users

### Documentation

- **`DEPLOYMENT.md`** - Complete deployment guide
- **`DEPLOYMENT-QUICKSTART.md`** - Quick reference card
- **`DEMO-MODE-README.md`** - Demo mode setup guide
- **`INSTALLATION-SCRIPTS-README.md`** - This file

---

## 🎯 Quick Start

### Recommended: Use Unified Script

```bash
# Clone repository
git clone https://github.com/cli1337/flomark.git
cd flomark

# Configure environment
cd backend
cp env.example .env
nano .env  # Edit your settings
cd ..

# Run installation
chmod +x install.sh
sudo ./install.sh yourdomain.com
```

**You'll be prompted to:**
1. Choose web server (Nginx or Apache)
2. Enable demo mode (optional)

---

## 📋 What Each Script Does

### All Scripts Perform:

1. **✅ Web Server Installation**
   - Installs Nginx or Apache
   - Enables required modules
   - Configures reverse proxy

2. **✅ Node.js & Dependencies**
   - Installs Node.js 18+
   - Installs PM2 globally
   - Installs pnpm package manager

3. **✅ Frontend Build**
   - Installs frontend dependencies
   - Builds production bundle
   - Optimizes assets

4. **✅ Backend Setup**
   - Installs backend dependencies
   - Runs database migrations
   - Configures PM2 process

5. **✅ Reverse Proxy Configuration**
   - Routes `/api` to backend
   - Enables WebSocket support
   - Configures static file serving

6. **✅ Security & Performance**
   - Sets security headers
   - Enables gzip compression
   - Configures caching
   - SSL-ready setup

7. **✅ Service Management**
   - Starts all services
   - Enables auto-start on boot
   - Configures logging

---

## 🔧 Script Comparison

| Feature | install.sh | install-nginx.sh | install-apache.sh |
|---------|------------|------------------|-------------------|
| **Interactive Menu** | ✅ Yes | ❌ No | ❌ No |
| **Choose Web Server** | ✅ Yes | Nginx only | Apache only |
| **Demo Mode Prompt** | ✅ Yes | ❌ No | ❌ No |
| **Auto-detect OS** | ✅ Yes | ✅ Yes | ✅ Yes |
| **PM2 Setup** | ✅ Yes | ✅ Yes | ✅ Yes |
| **SSL Ready** | ✅ Yes | ✅ Yes | ✅ Yes |
| **WebSocket Support** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🌐 Web Server Differences

### Nginx (Recommended)

**Pros:**
- ⚡ Better performance
- 📈 Lower memory usage
- 🔄 Better WebSocket handling
- 🚀 Faster static file serving
- 📦 Easier configuration

**Cons:**
- Less familiar to some users
- Fewer modules than Apache

**Best for:**
- High-traffic applications
- Real-time features
- Modern deployments

### Apache

**Pros:**
- 🔧 More familiar to many users
- 📚 Extensive documentation
- 🔌 Wide module ecosystem
- 🏢 Enterprise-friendly

**Cons:**
- Higher memory usage
- Slower with WebSockets
- More complex configuration

**Best for:**
- Traditional deployments
- Shared hosting
- Legacy systems

---

## 🎭 Demo Mode

### What is Demo Mode?

Demo mode allows public access to a specific project without authentication. Perfect for:
- Product demonstrations
- User onboarding
- Feature showcases
- Testing & QA

### Enable During Installation

When using `install.sh`, you'll be asked:
```
Enable Demo Mode? (allows anyone to access without login) [y/N]:
```

Answer `y` to enable demo mode automatically.

### Manual Setup

After installation, enable demo mode:

1. Edit `backend/.env`:
   ```env
   DEMO_MODE=true
   DEMO_PROJECT_ID=demo-project
   ```

2. Create demo project:
   ```bash
   cd backend
   pnpm run setup-demo
   ```

3. Restart backend:
   ```bash
   pm2 restart flomark-backend
   ```

See [DEMO-MODE-README.md](DEMO-MODE-README.md) for details.

---

## 📝 Prerequisites

### System Requirements

- **OS:** Ubuntu 20.04+, Debian 11+, CentOS 8+, or RHEL 8+
- **CPU:** 2+ cores recommended
- **RAM:** 2GB minimum, 4GB recommended
- **Storage:** 10GB+ free space
- **Root Access:** sudo privileges required

### Before Running Scripts

1. **Domain Setup** (optional but recommended)
   - Point your domain to server IP
   - Wait for DNS propagation

2. **Firewall Configuration**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **MongoDB Installation**
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud), or
   - Use Docker container

4. **Environment Configuration**
   ```bash
   cd backend
   cp env.example .env
   nano .env
   ```
   
   **Required:**
   - `DATABASE_URL` - MongoDB connection string
   - `JWT_SECRET` - Random secret key
   - `BACKEND_URL` - Your domain URL

---

## 🔐 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=mongodb://localhost:27017/flomark

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
BACKEND_URL=https://yourdomain.com
```

### Optional Variables

```env
# Demo Mode
DEMO_MODE=true
DEMO_PROJECT_ID=demo-project

# Email (for invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

See `backend/env.example` for complete list.

---

## 🛠️ Usage Examples

### Example 1: Production with Nginx

```bash
# Setup
git clone https://github.com/cli1337/flomark.git
cd flomark/backend
cp env.example .env
nano .env  # Configure DATABASE_URL, JWT_SECRET, BACKEND_URL
cd ..

# Install
chmod +x install-nginx.sh
sudo ./install-nginx.sh myapp.com

# Setup SSL
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d myapp.com
```

### Example 2: Demo Server with Apache

```bash
# Setup
git clone https://github.com/cli1337/flomark.git
cd flomark/backend
cp env.example .env
# Add: DEMO_MODE=true
cd ..

# Install
chmod +x install-apache.sh
sudo ./install-apache.sh demo.myapp.com

# Setup demo data
cd backend
pnpm run setup-demo
```

### Example 3: Interactive Installation

```bash
# Clone and configure
git clone https://github.com/cli1337/flomark.git
cd flomark/backend
cp env.example .env
nano .env
cd ..

# Run unified script
chmod +x install.sh
sudo ./install.sh myapp.com

# Follow prompts:
# 1) Select Nginx
# 2) Enable demo mode: y
```

---

## 🐛 Troubleshooting

### Script Fails

```bash
# Check system compatibility
cat /etc/os-release

# Verify root access
sudo echo "Root access OK"

# Check available disk space
df -h

# View script output
bash -x install.sh yourdomain.com 2>&1 | tee install.log
```

### Services Not Starting

```bash
# Check PM2
pm2 status
pm2 logs flomark-backend

# Check web server
sudo systemctl status nginx  # or apache2/httpd
sudo journalctl -u nginx -f

# Check MongoDB
sudo systemctl status mongod
```

### Cannot Access Application

```bash
# Check if services are running
pm2 list
sudo systemctl status nginx

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Test backend directly
curl http://localhost:3000/api/health

# Check DNS
nslookup yourdomain.com
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER ~/flomark

# Fix uploads directory
sudo chmod 755 backend/uploads
sudo chown -R www-data:www-data backend/uploads  # Nginx/Apache user
```

---

## 🔄 Post-Installation

### Create Admin User

```bash
cd backend
pnpm make-admin admin@example.com OWNER
```

### Setup SSL Certificate

```bash
# Nginx
sudo certbot --nginx -d yourdomain.com

# Apache  
sudo certbot --apache -d yourdomain.com

# Auto-renewal (runs daily)
sudo systemctl enable certbot.timer
```

### Monitor Application

```bash
# Backend logs
pm2 logs flomark-backend

# Web server logs
sudo tail -f /var/log/nginx/error.log  # Nginx
sudo tail -f /var/log/apache2/flomark-error.log  # Apache

# System resources
pm2 monit
htop
```

### Configure Backups

```bash
# MongoDB backup
mongodump --db flomark --out /backup/$(date +%Y%m%d)

# File uploads backup
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz backend/uploads

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

---

## 📊 Performance Tips

### 1. Enable PM2 Cluster Mode

```bash
pm2 delete flomark-backend
pm2 start backend/src/server.js --name flomark-backend -i max
pm2 save
```

### 2. Configure Nginx Caching

Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
proxy_cache my_cache;
proxy_cache_valid 200 1h;
```

### 3. Enable HTTP/2

For Nginx with SSL:
```nginx
listen 443 ssl http2;
```

### 4. Optimize MongoDB

```javascript
// Add indexes in Prisma schema
@@index([email])
@@index([createdAt])
```

---

## 🔒 Security Checklist

After installation:

- [ ] Change default `JWT_SECRET`
- [ ] Use strong MongoDB password
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall (UFW/firewalld)
- [ ] Disable root SSH login
- [ ] Set up fail2ban
- [ ] Enable automatic security updates
- [ ] Configure regular backups
- [ ] Monitor logs regularly
- [ ] Limit PM2 to local only
- [ ] Use environment variables (never commit .env)

---

## 📚 Additional Resources

- **Full Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Quick Reference:** [DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md)
- **Demo Mode:** [DEMO-MODE-README.md](DEMO-MODE-README.md)
- **Main README:** [README.md](README.md)

---

## 🆘 Getting Help

### Documentation
- Check error logs: `pm2 logs flomark-backend`
- Review web server logs
- See troubleshooting guides

### Community
- GitHub Issues: https://github.com/cli1337/flomark/issues
- Discussions: Start a discussion on GitHub

### Common Solutions
- **502 Bad Gateway:** Backend not running, restart PM2
- **404 Not Found:** Frontend not built, run `pnpm build`
- **CORS Errors:** Check `BACKEND_URL` in .env
- **WebSocket Issues:** Verify proxy configuration

---

## 🎉 Success Indicators

After successful installation:

✅ Application accessible at your domain  
✅ Login/registration works  
✅ Projects can be created  
✅ Tasks can be dragged and dropped  
✅ Real-time updates working  
✅ File uploads functional  
✅ No errors in PM2 logs  
✅ No errors in web server logs  

---

**Deploy with confidence! 🚀**

