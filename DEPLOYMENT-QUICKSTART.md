# ⚡ Flomark - Quick Deployment Reference

Fast deployment commands for Flomark with Nginx or Apache.

---

## 🚀 One-Command Deploy

### Nginx (Recommended)

```bash
# Clone and deploy in one go
git clone https://github.com/cli1337/flomark.git && \
cd flomark && \
cd backend && cp env.example .env && \
nano .env && \
cd .. && \
chmod +x install-nginx.sh && \
sudo ./install-nginx.sh yourdomain.com
```

### Apache

```bash
# Clone and deploy in one go
git clone https://github.com/cli1337/flomark.git && \
cd flomark && \
cd backend && cp env.example .env && \
nano .env && \
cd .. && \
chmod +x install-apache.sh && \
sudo ./install-apache.sh yourdomain.com
```

---

## 📝 Step-by-Step

### 1. Prepare Server

```bash
# Clone repository
git clone https://github.com/cli1337/flomark.git
cd flomark

# Configure environment
cd backend
cp env.example .env
nano .env  # Edit: DATABASE_URL, JWT_SECRET, BACKEND_URL
cd ..
```

### 2. Deploy with Nginx

```bash
chmod +x install-nginx.sh
sudo ./install-nginx.sh yourdomain.com
```

### 2. Deploy with Apache (Alternative)

```bash
chmod +x install-apache.sh
sudo ./install-apache.sh yourdomain.com
```

### 3. Create Admin User

```bash
cd backend
pnpm make-admin admin@example.com OWNER
```

### 4. Enable SSL (Optional but Recommended)

```bash
# For Nginx
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# For Apache
sudo apt-get install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com
```

---

## 🔑 Essential Environment Variables

Edit `backend/.env`:

```env
# Required
DATABASE_URL=mongodb://localhost:27017/flomark
JWT_SECRET=<generate-random-string>
JWT_EXPIRES_IN=24h
PORT=3000
BACKEND_URL=https://yourdomain.com

# Optional (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🛠️ Post-Deployment

### Check Status

```bash
# Backend
pm2 status
pm2 logs flomark-backend

# Web Server
sudo systemctl status nginx   # or apache2/httpd
```

### Common Commands

```bash
# Restart Backend
pm2 restart flomark-backend

# Restart Web Server
sudo systemctl restart nginx   # or apache2/httpd

# View Logs
pm2 logs flomark-backend
sudo tail -f /var/log/nginx/error.log  # or apache2/flomark-error.log
```

---

## 🐛 Quick Fixes

### Backend Not Starting

```bash
pm2 logs flomark-backend
# Check: MongoDB running? .env configured? Port 3000 free?
```

### 502 Bad Gateway

```bash
pm2 restart flomark-backend
sudo systemctl restart nginx  # or apache2
```

### File Uploads Not Working

```bash
sudo chmod 755 backend/uploads
sudo chown -R www-data:www-data backend/uploads  # or apache:apache
```

### WebSocket Issues

```bash
# Verify Socket.io endpoint
curl -i http://localhost:3000/socket.io/

# Check firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 📊 What Gets Installed

Both scripts automatically install and configure:

✅ Nginx or Apache web server  
✅ Node.js 18+  
✅ PM2 process manager  
✅ pnpm package manager  
✅ All project dependencies  
✅ Built React frontend  
✅ Reverse proxy configuration  
✅ WebSocket/Socket.io support  
✅ Static file serving  
✅ Gzip compression  
✅ Security headers  

---

## 🔒 Security Checklist

After deployment:

- [ ] Change JWT_SECRET in .env
- [ ] Set up SSL/HTTPS (certbot)
- [ ] Configure firewall (UFW/firewalld)
- [ ] Create admin user
- [ ] Test all functionality
- [ ] Set up automatic backups
- [ ] Monitor logs regularly

---

## 📱 Access Your App

After successful deployment:

- **HTTP:** `http://yourdomain.com`
- **HTTPS:** `https://yourdomain.com` (after SSL setup)
- **Local:** `http://localhost`

---

## 🆘 Need Help?

Full documentation: [DEPLOYMENT.md](DEPLOYMENT.md)  
General setup: [README.md](README.md)  
Issues: https://github.com/cli1337/flomark/issues

---

**Deploy in minutes, not hours! 🚀**

