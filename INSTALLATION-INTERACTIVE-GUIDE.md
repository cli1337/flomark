# 🚀 Interactive Installation Guide

The Flomark installation script now features a fully interactive setup process!

## ✨ What's New

The installation script (`install.sh`) now asks you step-by-step for all configuration options instead of requiring command-line arguments.

## 📋 Installation Steps

### 1. Prepare Backend Configuration

Before running the install script:

```bash
cd backend
cp env.example .env
nano .env  # Edit your database URL and other settings
cd ..
```

### 2. Run Installation

Simply run:

```bash
sudo ./install.sh
```

That's it! No arguments needed. The script will guide you through everything.

## 🎯 Interactive Prompts

### Step 1: Domain Configuration

```
🌐 Domain Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Do you want to configure a custom domain?
  - Choose 'Yes' if you have a domain (e.g., myapp.example.com)
  - Choose 'No' for local development (will use localhost)

Configure domain? [y/N]:
```

**Options:**
- **Press N** (or just Enter): Uses `localhost` - perfect for local development
- **Press Y**: Prompts for your domain name

**If you chose Y:**
```
Enter your domain name:
  Examples:
    - myapp.example.com
    - tasks.company.com
    - app.mydomain.org

Domain name: _
```

### Step 2: Backend Port Configuration

```
🔌 Backend Port Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Default backend port is 3000.
Do you want to use a different port?

Use custom port? [y/N]:
```

**Options:**
- **Press N** (or just Enter): Uses default port `3000`
- **Press Y**: Prompts for custom port (useful if 3000 is already in use)

**If you chose Y:**
```
Enter backend port (1024-65535): _
```

The script validates:
- Port is a number
- Port is between 1024-65535
- Port is not already in use

**If port is already in use:**
```
⚠️  Port 3000 is already in use!

Process using port 3000:
  node    12345 user   TCP *:3000 (LISTEN)

Options:
  1) Stop the service using port 3000 and continue
  2) Use a different port (recommended)
  3) Exit installation

Enter choice [1-3]:
```

### Step 3: Configuration Summary

```
📋 Current Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Domain: myapp.example.com
  App Directory: /home/user/flomark
  Backend Port: 3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Review your configuration before proceeding.

### Step 4: Web Server Selection

```
🌐 Web Server Selection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Select your web server:
  1) Nginx (Recommended)
     ✓ Better performance
     ✓ Lower memory usage
     ✓ Better for high-traffic sites

  2) Apache
     ✓ More familiar to some users
     ✓ Extensive documentation
     ✓ .htaccess support

Enter choice [1-2] (default: 1):
```

**Options:**
- **Press 1** (or just Enter): Installs Nginx - recommended
- **Press 2**: Installs Apache

### Step 5: Demo Mode Configuration

```
🎭 Demo Mode Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Demo Mode allows visitors to try your app without registration.
  ✓ Great for showcasing features
  ✓ Public access to demo project
  ✓ No login required for demo

Enable Demo Mode? [y/N]:
```

**Options:**
- **Press N** (or just Enter): Regular mode - users must register/login
- **Press Y**: Enables demo mode - anyone can access demo project

### Step 6: Owner Account Creation

```
📝 Create Owner Account
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

First Name: John
Last Name: Doe
Email: john@example.com
Password (min 6 chars): ********
```

This creates your admin account with full system access.

## 🎮 Usage Examples

### Example 1: Production Setup

```bash
sudo ./install.sh
```

**Interactive responses:**
```
Configure domain? [y/N]: y
Domain name: myapp.example.com
Use custom port? [y/N]: n
Web server [1-2]: 1
Enable Demo Mode? [y/N]: n
```

**Result:**
- Domain: `myapp.example.com`
- Backend: Port 3000
- Web Server: Nginx
- Demo Mode: Disabled

### Example 2: Local Development

```bash
sudo ./install.sh
```

**Interactive responses:**
```
Configure domain? [y/N]: n
Use custom port? [y/N]: n
Web server [1-2]: 1
Enable Demo Mode? [y/N]: y
```

**Result:**
- Domain: `localhost`
- Backend: Port 3000
- Web Server: Nginx
- Demo Mode: Enabled

### Example 3: Custom Port (Port Conflict)

```bash
sudo ./install.sh
```

**Interactive responses:**
```
Configure domain? [y/N]: n
Use custom port? [y/N]: y
Enter backend port: 3001
Web server [1-2]: 1
Enable Demo Mode? [y/N]: n
```

**Result:**
- Domain: `localhost`
- Backend: Port 3001
- Web Server: Nginx
- Demo Mode: Disabled

## 🔧 Advanced: Command Line Arguments (Still Supported)

If you prefer, you can still pass arguments:

```bash
# Old style (still works)
sudo ./install.sh myapp.example.com nginx 3000
```

**Arguments:**
1. Domain name (optional, default: interactive prompt)
2. Web server (optional, default: interactive prompt)
3. Backend port (optional, default: interactive prompt)

## ⚡ Port Conflict Handling

If a port is already in use, the script will:

1. **Detect the conflict** before installation starts
2. **Show which process** is using the port
3. **Offer options:**
   - Stop the conflicting service
   - Choose a different port
   - Exit and resolve manually

**Example:**
```
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

## 🎯 Best Practices

### For Production:

1. **Use a real domain**
   ```
   Configure domain? [y/N]: y
   Domain name: myapp.example.com
   ```

2. **Use default ports** unless there's a conflict
   ```
   Use custom port? [y/N]: n
   ```

3. **Choose Nginx** for better performance
   ```
   Web server [1-2]: 1
   ```

4. **Disable demo mode** for security
   ```
   Enable Demo Mode? [y/N]: n
   ```

### For Development:

1. **Use localhost**
   ```
   Configure domain? [y/N]: n
   ```

2. **Enable demo mode** for easy testing
   ```
   Enable Demo Mode? [y/N]: y
   ```

3. **Choose Nginx** (same as production)
   ```
   Web server [1-2]: 1
   ```

## 📝 Configuration Summary

After installation completes, you'll see:

```
╔════════════════════════════════════════╗
║     ✨ Installation Complete! ✨       ║
╚════════════════════════════════════════╝

✓ nginx configured and running
✓ Frontend built and deployed
✓ Backend running with PM2
✓ Demo mode enabled (if selected)

Configuration Details:
  Domain: myapp.example.com
  Backend Port: 3000

Access your application:
  http://myapp.example.com

Useful commands:
  View all logs:      ./logs.sh
  View backend logs:  pm2 logs flomark-backend
  Restart backend:    pm2 restart flomark-backend
  Restart webserver:  systemctl restart nginx
```

## 🆘 Troubleshooting

### Issue: Port Already in Use

**Solution 1: Find and stop the service**
```bash
# Find what's using the port
sudo lsof -i :3000

# Stop PM2 process if it's PM2
pm2 stop all

# Or kill the process
sudo kill -9 <PID>
```

**Solution 2: Use a different port**
Just select option 2 when prompted and enter a different port.

### Issue: Domain Not Working

**Check DNS:**
```bash
nslookup yourdomain.com
```

**If DNS is correct but still not working:**
1. Check firewall: `sudo ufw status`
2. Allow HTTP: `sudo ufw allow 80`
3. Check Nginx: `sudo systemctl status nginx`

### Issue: Want to Change Configuration

**Change domain:**
```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/flomark
# Find: server_name old-domain.com;
# Change to: server_name new-domain.com;
sudo systemctl reload nginx
```

**Change backend port:**
```bash
# Edit .env
nano backend/.env
# Change: PORT=3000 to PORT=3001

# Update Nginx config
sudo nano /etc/nginx/sites-available/flomark
# Change: server localhost:3000; to server localhost:3001;

# Restart services
pm2 restart flomark-backend
sudo systemctl reload nginx
```

## 🎬 Quick Start Video Guide

**Step-by-step:**

1. Clone repository
2. Configure backend/.env
3. Run `sudo ./install.sh`
4. Answer interactive prompts
5. Access your application

**Total time:** ~5-10 minutes (depending on server speed)

## 📚 Related Documentation

- **LOGS-README.md** - View and manage logs
- **DOMAIN-SETUP-GUIDE.md** - DNS and domain configuration
- **DEPLOYMENT.md** - Complete deployment guide
- **DEPLOYMENT-QUICKSTART.md** - Quick reference

---

**Enjoy your interactive installation experience! 🚀**

