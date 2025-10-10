# 🌐 Domain Setup Guide

Quick guide to understanding how domain configuration works in Flomark installation.

## 📋 How It Works

### 1. Install Script Accepts Domain as Parameter

The install scripts automatically configure your domain:

```bash
# Basic installation with domain
sudo ./install.sh yourdomain.com

# Or specify web server too
sudo ./install.sh yourdomain.com nginx
sudo ./install.sh yourdomain.com apache
```

### 2. What Gets Configured Automatically

When you provide a domain, the install script:

✅ **Configures Web Server** (Nginx/Apache)
- Sets `server_name` to your domain
- Creates proper virtual host configuration
- Configures reverse proxy to backend

✅ **Sets Up Frontend**
- Builds and deploys to correct location
- Configures asset paths
- Sets up routing for SPA

✅ **Configures Backend Proxy**
- Routes `/api` requests to Node.js backend
- Sets up WebSocket support for `/socket.io`
- Configures proper headers and timeouts

✅ **File Upload Paths**
- Configures `/uploads` alias for file storage
- Sets proper permissions and caching

## 🚀 Usage Examples

### Local Development (Default)

```bash
# No domain specified = uses localhost
sudo ./install.sh
```

**Result**: Application accessible at `http://localhost`

### Production with Domain

```bash
# Specify your domain
sudo ./install.sh myapp.example.com
```

**Result**: Application accessible at `http://myapp.example.com`

### Production with Subdomain

```bash
# Works with subdomains too
sudo ./install.sh tasks.company.com
```

**Result**: Application accessible at `http://tasks.company.com`

## 📁 What Files Are Modified

### Nginx Configuration

File: `/etc/nginx/sites-available/flomark`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;  # ← Your domain goes here
    
    root /path/to/flomark/frontend/dist;
    
    location /api {
        proxy_pass http://localhost:3000;
        # ... proxy configuration
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        # ... WebSocket configuration
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache Configuration

File: `/etc/apache2/sites-available/flomark.conf` (Debian)  
File: `/etc/httpd/conf.d/flomark.conf` (RHEL/CentOS)

```apache
<VirtualHost *:80>
    ServerName yourdomain.com  # ← Your domain goes here
    
    DocumentRoot /path/to/flomark/frontend/dist
    
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # ... more configuration
</VirtualHost>
```

## 🔧 Changing Domain After Installation

If you need to change the domain after installation:

### For Nginx

```bash
# Edit the config file
sudo nano /etc/nginx/sites-available/flomark

# Find this line:
#   server_name old-domain.com;
# Change to:
#   server_name new-domain.com;

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### For Apache

```bash
# Debian/Ubuntu
sudo nano /etc/apache2/sites-available/flomark.conf

# RHEL/CentOS/Fedora
sudo nano /etc/httpd/conf.d/flomark.conf

# Find this line:
#   ServerName old-domain.com
# Change to:
#   ServerName new-domain.com

# Test configuration
sudo apachectl configtest

# Reload Apache
sudo systemctl reload apache2  # or httpd
```

## 🌐 DNS Configuration

After installation, you need to point your domain to your server:

### Option 1: A Record (Most Common)

```
Type: A
Name: @ (or subdomain name)
Value: Your server's IP address
TTL: 3600 (or default)
```

**Example for root domain:**
```
A    @              123.45.67.89
```

**Example for subdomain:**
```
A    tasks          123.45.67.89
```

### Option 2: CNAME Record (For Subdomains)

```
Type: CNAME
Name: subdomain
Value: your-server.provider.com
TTL: 3600
```

**Example:**
```
CNAME    tasks    server.digitalocean.com
```

### DNS Propagation

- DNS changes can take 5 minutes to 48 hours to propagate
- Check propagation: `nslookup yourdomain.com`
- Or use online tools: https://dnschecker.org/

## 🔒 SSL/HTTPS Setup

After domain is working, add SSL:

### For Nginx (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate (automatic configuration)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

### For Apache (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-apache

# Get certificate (automatic configuration)
sudo certbot --apache -d yourdomain.com

# Auto-renewal is configured automatically
```

### Manual SSL Configuration

If you have your own certificate:

**For Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # ... rest of configuration
}
```

**For Apache:**
```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # ... rest of configuration
</VirtualHost>
```

## 🎯 Multiple Domains

You can host on multiple domains:

### Nginx

```nginx
server {
    listen 80;
    server_name domain1.com domain2.com www.domain1.com;
    # ... configuration
}
```

### Apache

```apache
<VirtualHost *:80>
    ServerName domain1.com
    ServerAlias domain2.com www.domain1.com
    # ... configuration
</VirtualHost>
```

## ✅ Verification Checklist

After installation, verify:

- [ ] Domain resolves to server IP: `ping yourdomain.com`
- [ ] Web server responds: `curl -I http://yourdomain.com`
- [ ] Frontend loads: Open `http://yourdomain.com` in browser
- [ ] API works: Check `http://yourdomain.com/api/health`
- [ ] WebSocket connects: Login and check real-time updates
- [ ] File uploads work: Try uploading a file

## 🔧 Troubleshooting

### Domain doesn't resolve

```bash
# Check DNS
nslookup yourdomain.com
dig yourdomain.com

# Flush DNS cache (on your local machine)
# Windows:
ipconfig /flushdns

# Linux:
sudo systemd-resolve --flush-caches

# macOS:
sudo dscacheutil -flushcache
```

### "502 Bad Gateway"

Backend not running:

```bash
pm2 list
pm2 logs flomark-backend
pm2 restart flomark-backend
```

### "Connection refused"

Web server not running:

```bash
sudo systemctl status nginx     # or apache2/httpd
sudo systemctl restart nginx    # or apache2/httpd
```

### "Server not found"

- Check DNS configuration
- Wait for DNS propagation (up to 48h)
- Temporarily use IP address to verify server works

### Mixed content warnings (after SSL)

Update frontend to use HTTPS:

```bash
# Check for http:// hardcoded URLs
grep -r "http://" frontend/src/

# Change to protocol-relative URLs or https://
```

## 📚 Additional Resources

- **Nginx Docs**: https://nginx.org/en/docs/
- **Apache Docs**: https://httpd.apache.org/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **DNS Checker**: https://dnschecker.org/

## 🆘 Need Help?

Common issues and solutions:

1. **Can't access after installation**
   - Check firewall: `sudo ufw status`
   - Allow ports: `sudo ufw allow 80` and `sudo ufw allow 443`

2. **API requests failing**
   - Check backend logs: `./logs.sh backend`
   - Verify proxy config: See files above

3. **WebSocket not connecting**
   - Check `/socket.io/` proxy configuration
   - Verify backend is running: `pm2 list`

---

**Quick Reference:**
```bash
# Installation with domain
sudo ./install.sh yourdomain.com

# View all logs
./logs.sh

# Add SSL
sudo certbot --nginx -d yourdomain.com

# Change domain
sudo nano /etc/nginx/sites-available/flomark  # Edit server_name
sudo systemctl reload nginx
```

