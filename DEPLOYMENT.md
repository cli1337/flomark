# 🚀 Flomark Deployment Guide

Complete guide for deploying Flomark to production using Apache or Nginx.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Nginx Deployment](#nginx-deployment)
- [Apache Deployment](#apache-deployment)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Server:** Ubuntu 20.04+, Debian 11+, CentOS 8+, or RHEL 8+
- **Root Access:** SSH access with sudo privileges
- **Domain (Optional):** A domain name pointed to your server IP
- **MongoDB:** Running MongoDB instance (local or remote)
- **Port 80/443:** Open for HTTP/HTTPS traffic

### Minimum Server Requirements

- **CPU:** 2 cores
- **RAM:** 2GB minimum, 4GB recommended
- **Storage:** 10GB minimum
- **Network:** 1Gbps recommended

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/cli1337/flomark.git
cd flomark
```

### 2. Configure Environment

```bash
# Backend configuration
cd backend
cp env.example .env
nano .env  # Edit with your settings
```

**Required environment variables:**
```env
DATABASE_URL=mongodb://localhost:27017/flomark
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h
PORT=3000
BACKEND_URL=http://your-domain.com
```

See [Environment Configuration](#environment-configuration) for complete details.

### 3. Setup Database

```bash
# From backend directory
npx prisma db push

# Create admin user
pnpm make-admin admin@example.com OWNER
```

### 4. Choose Your Web Server

#### Option A: Nginx (Recommended)

```bash
# Make script executable
chmod +x install-nginx.sh

# Run installation (with your domain or localhost)
sudo ./install-nginx.sh yourdomain.com
```

#### Option B: Apache

```bash
# Make script executable
chmod +x install-apache.sh

# Run installation (with your domain or localhost)
sudo ./install-apache.sh yourdomain.com
```

---

## Nginx Deployment

### What the Script Does

The `install-nginx.sh` script automatically:

1. ✅ Installs Nginx
2. ✅ Installs Node.js 18+ and PM2
3. ✅ Builds the frontend (Vite)
4. ✅ Installs backend dependencies
5. ✅ Configures PM2 to run the backend
6. ✅ Creates Nginx reverse proxy configuration
7. ✅ Enables WebSocket support for Socket.io
8. ✅ Sets up static file serving and caching
9. ✅ Starts all services

### Manual Nginx Configuration

If you prefer manual setup:

```bash
# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx

# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/flomark
sudo ln -s /etc/nginx/sites-available/flomark /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Nginx Configuration Features

- **Reverse Proxy:** Routes `/api` to Node.js backend
- **WebSocket Support:** Full Socket.io compatibility
- **Static Files:** Efficient serving of built React app
- **Gzip Compression:** Reduces bandwidth usage
- **Caching:** Optimized headers for assets
- **Security Headers:** X-Frame-Options, CSP, etc.
- **File Uploads:** Supports up to 50MB files

---

## Apache Deployment

### What the Script Does

The `install-apache.sh` script automatically:

1. ✅ Installs Apache with required modules
2. ✅ Installs Node.js 18+ and PM2
3. ✅ Builds the frontend (Vite)
4. ✅ Installs backend dependencies
5. ✅ Configures PM2 to run the backend
6. ✅ Creates Apache VirtualHost configuration
7. ✅ Enables proxy, rewrite, and WebSocket modules
8. ✅ Configures SELinux (RHEL/CentOS)
9. ✅ Starts all services

### Apache Modules Required

- `mod_proxy`
- `mod_proxy_http`
- `mod_proxy_wstunnel`
- `mod_rewrite`
- `mod_headers`
- `mod_ssl` (for HTTPS)

### Manual Apache Configuration

```bash
# Debian/Ubuntu
sudo apt-get install apache2
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl
sudo a2ensite flomark.conf
sudo systemctl reload apache2

# RHEL/CentOS
sudo yum install httpd mod_ssl
sudo systemctl reload httpd
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

#### Nginx + Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### Apache + Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-apache

# Get certificate
sudo certbot --apache -d yourdomain.com

# Auto-renewal is automatic
```

### Manual SSL Configuration

1. **Get SSL certificates** from your provider
2. **Uncomment SSL section** in the configuration file:
   - Nginx: `/etc/nginx/sites-available/flomark`
   - Apache: `/etc/apache2/sites-available/flomark.conf` or `/etc/httpd/conf.d/flomark.conf`
3. **Update certificate paths** to your cert files
4. **Reload web server**

---

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Database (Required)
DATABASE_URL=mongodb://localhost:27017/flomark

# JWT Authentication (Required)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration (Required)
PORT=3000
BACKEND_URL=https://yourdomain.com

# SMTP Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Flomark
SMTP_FROM_EMAIL=noreply@flomark.com
```

### Frontend Configuration

The frontend is automatically configured via Vite proxy. No additional configuration needed.

---

## Post-Deployment

### 1. Verify Services

```bash
# Check backend
pm2 status
pm2 logs flomark-backend

# Check web server
sudo systemctl status nginx   # or apache2/httpd
```

### 2. Create Admin User

```bash
cd backend
pnpm make-admin admin@example.com OWNER
```

### 3. Test Application

Visit your domain and verify:
- ✅ Frontend loads
- ✅ Login works
- ✅ Real-time updates work (WebSocket)
- ✅ File uploads work
- ✅ Notifications appear

### 4. Setup Monitoring

```bash
# PM2 monitoring
pm2 monit

# Web server logs
sudo tail -f /var/log/nginx/error.log        # Nginx
sudo tail -f /var/log/apache2/flomark-error.log  # Apache
```

### 5. Configure Firewall

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Firewalld (RHEL/CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs flomark-backend

# Common issues:
# - MongoDB not running: sudo systemctl start mongod
# - Port 3000 in use: lsof -i :3000
# - Missing .env file: cp env.example .env
```

### Frontend Shows 404

```bash
# Rebuild frontend
cd frontend
pnpm build

# Check build directory exists
ls -la dist/

# Verify web server config points to correct path
```

### WebSocket Not Working

```bash
# Verify proxy settings
# Nginx: Check /etc/nginx/sites-available/flomark
# Apache: Check proxy_wstunnel module is enabled

# Test Socket.io connection
curl -i http://localhost:3000/socket.io/

# Check firewall isn't blocking WebSocket
```

### File Uploads Fail

```bash
# Check file size limits
# Nginx: client_max_body_size in config
# Apache: LimitRequestBody in config

# Verify uploads directory permissions
chmod 755 backend/uploads
chown -R www-data:www-data backend/uploads  # or apache:apache
```

### 502 Bad Gateway

```bash
# Backend not running
pm2 restart flomark-backend

# Backend port wrong
# Check PORT in backend/.env matches proxy config

# SELinux blocking (RHEL/CentOS)
sudo setsebool -P httpd_can_network_connect 1
```

### SSL Certificate Issues

```bash
# Renew Let's Encrypt cert
sudo certbot renew

# Test SSL config
sudo nginx -t  # or apache2ctl configtest

# Check certificate files exist
ls -la /etc/letsencrypt/live/yourdomain.com/
```

---

## Useful Commands

### PM2 Commands

```bash
pm2 status                    # View all processes
pm2 logs flomark-backend      # View logs
pm2 restart flomark-backend   # Restart backend
pm2 stop flomark-backend      # Stop backend
pm2 delete flomark-backend    # Remove process
pm2 monit                     # Monitor resources
```

### Nginx Commands

```bash
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart
sudo systemctl reload nginx   # Reload config
sudo nginx -t                 # Test config
sudo tail -f /var/log/nginx/error.log  # View logs
```

### Apache Commands

```bash
sudo systemctl status apache2    # Check status (or httpd)
sudo systemctl restart apache2   # Restart
sudo systemctl reload apache2    # Reload config
sudo apache2ctl configtest       # Test config (or httpd -t)
sudo tail -f /var/log/apache2/flomark-error.log  # View logs
```

### Database Commands

```bash
# MongoDB
sudo systemctl status mongod
mongo flomark --eval "db.User.countDocuments()"

# Prisma
cd backend
npx prisma studio              # GUI database browser
npx prisma db push             # Update schema
```

---

## Performance Optimization

### 1. Enable Caching

Both scripts configure optimal caching:
- Static assets: 1 year cache
- API responses: No cache
- index.html: No cache (for SPA updates)

### 2. Gzip Compression

Nginx has gzip enabled by default. For Apache, ensure:

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>
```

### 3. PM2 Cluster Mode

For better performance on multi-core servers:

```bash
pm2 delete flomark-backend
pm2 start src/server.js --name flomark-backend -i max
pm2 save
```

### 4. MongoDB Optimization

```javascript
// Add indexes in Prisma schema
@@index([email])
@@index([createdAt])
```

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB password
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall
- [ ] Set up fail2ban (optional)
- [ ] Enable security headers
- [ ] Regular backups
- [ ] Keep system updated
- [ ] Monitor logs regularly

---

## Backup & Restore

### Backup

```bash
# MongoDB backup
mongodump --db flomark --out /backup/flomark-$(date +%Y%m%d)

# Uploaded files
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz backend/uploads/

# Environment files
cp backend/.env /backup/.env-$(date +%Y%m%d)
```

### Restore

```bash
# MongoDB restore
mongorestore --db flomark /backup/flomark-20241010/flomark

# Uploaded files
tar -xzf /backup/uploads-20241010.tar.gz -C backend/
```

---

## Support

For issues or questions:

- **Documentation:** [README.md](README.md)
- **GitHub Issues:** https://github.com/cli1337/flomark/issues
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Happy Deploying! 🚀**

