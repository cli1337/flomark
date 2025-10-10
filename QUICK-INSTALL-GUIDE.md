# ⚡ Quick Install Guide

Install Flomark with a single command - no git clone required!

---

## 🚀 One-Command Installation

```bash
curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash
```

**That's it!** The installer will:
1. Download Flomark automatically
2. Ask where to install (default: `/opt/flomark`)
3. Guide you through configuration
4. Set up everything (web server, database, auto-start)
5. Create your admin account

---

## 📋 What Happens

### Step 1: Download
```
🚀 Flomark Quick Installer
━━━━━━━━━━━━━━━━━━━━━━━━━━

Checking prerequisites...
✓ Prerequisites ready

📁 Installation Directory
━━━━━━━━━━━━━━━━━━━━━━━━━━

Where do you want to install Flomark?
  Default: /opt/flomark

Installation directory [/opt/flomark]: _
```

**Options:**
- Press Enter: Uses `/opt/flomark`
- Type path: Custom location (e.g., `/home/user/flomark`)

### Step 2: Clone Repository
```
[1/3] Downloading Flomark...
Cloning into '/opt/flomark'...
```

Automatically clones from GitHub.

### Step 3: Configure Backend
```
[2/3] Configuring backend...
Creating .env file from template...

⚙️  Backend Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━

You need to configure your database and secrets.

Required settings:
  - DATABASE_URL: Your MongoDB connection string
  - JWT_SECRET: Random secret for JWT tokens
  - JWT_REFRESH_SECRET: Random secret for refresh tokens

Do you want to edit .env now?
Edit now? [Y/n]: _
```

**What to configure:**
- `DATABASE_URL`: Your MongoDB connection (local or Atlas)
- `JWT_SECRET`: Random string (use generator)
- `JWT_REFRESH_SECRET`: Another random string

**Example `.env`:**
```env
DATABASE_URL=mongodb://localhost:27017/flomark
JWT_SECRET=your-super-secret-key-here-change-this
JWT_REFRESH_SECRET=another-secret-key-here-change-this
PORT=3000
```

### Step 4: Interactive Installation
```
[3/3] Running installation script...

🌐 Domain Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━

Do you want to configure a custom domain?
  - Choose 'Yes' if you have a domain
  - Choose 'No' for local development

Configure domain? [y/N]: _
```

Then follows the [interactive installation process](INSTALLATION-INTERACTIVE-GUIDE.md):
- Domain configuration
- Port selection
- Web server choice
- Demo mode
- Admin account creation

### Step 5: Complete!
```
╔════════════════════════════════════════╗
║   ✨ Quick Install Complete! ✨        ║
╚════════════════════════════════════════╝

Flomark has been installed to: /opt/flomark

Useful commands:
  View logs:        cd /opt/flomark && ./logs.sh
  View backend:     pm2 logs flomark-backend
  Restart backend:  pm2 restart flomark-backend
  Update Flomark:   cd /opt/flomark && git pull
```

---

## 🎯 Usage Examples

### Production Server

```bash
# Install to default location
curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash

# Answer prompts:
# - Installation directory: [Enter] (use default /opt/flomark)
# - Edit .env: y (configure MongoDB and secrets)
# - Domain: y → myapp.example.com
# - Custom port: n (use 3000)
# - Web server: 1 (Nginx)
# - Demo mode: n
```

### VPS/Cloud Server

```bash
# On DigitalOcean, AWS, Linode, etc.
curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash

# Configure with your domain
# Set up SSL afterward with certbot
```

### Local Development

```bash
# Install to home directory
curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash

# Answer prompts:
# - Installation directory: /home/yourusername/flomark
# - Domain: n (use localhost)
# - Demo mode: y (for testing)
```

---

## 🔒 Security Considerations

### Is piping to bash safe?

**Yes, if you trust the source!**

The quick-install script:
- ✅ Is open source (you can review it)
- ✅ Comes from official GitHub repository
- ✅ Uses HTTPS (encrypted connection)
- ✅ Only downloads from GitHub

**Security tips:**
1. Review the script first:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh
   ```

2. Download and inspect:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh > quick-install.sh
   less quick-install.sh  # Review it
   chmod +x quick-install.sh
   sudo ./quick-install.sh
   ```

3. Use manual installation if preferred:
   ```bash
   git clone https://github.com/cli1337/flomark.git
   cd flomark
   sudo ./install.sh
   ```

---

## 🗂️ Installation Locations

### Default: `/opt/flomark`

**Pros:**
- Standard location for third-party apps
- Available to all users
- Easy to find

**Cons:**
- Requires sudo

### Custom: `/home/user/flomark`

**Pros:**
- User-owned directory
- No sudo needed for updates

**Cons:**
- Service may need adjustment

### Custom: `/var/www/flomark`

**Pros:**
- Standard web app location
- Familiar to web developers

---

## 🔄 After Installation

### Access Your Application

```bash
# If using domain:
http://yourdomain.com

# If using localhost:
http://localhost
```

### View Logs

```bash
cd /opt/flomark  # or your installation directory
./logs.sh
```

### Update Flomark

```bash
cd /opt/flomark
git pull
cd backend && pnpm install
cd ../frontend && pnpm install && pnpm build
pm2 restart flomark-backend
sudo systemctl reload nginx
```

### Add SSL (HTTPS)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

---

## 🆘 Troubleshooting

### "Command 'curl' not found"

**Solution:**
```bash
sudo apt-get install curl
# Then try again
```

### "Permission denied"

**Solution:**
```bash
# Make sure to use sudo:
curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash
```

### Installation fails midway

**Solution:**
1. Check error message
2. Remove partial installation:
   ```bash
   sudo rm -rf /opt/flomark
   ```
3. Try again

### Want to change installation directory

**Solution:**
```bash
# Remove old installation
sudo rm -rf /opt/flomark

# Install to new location
curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash
# Enter custom directory when prompted
```

### Can't connect to GitHub

**Solution:**
```bash
# Check internet connection
ping github.com

# Try manual clone:
git clone https://github.com/cli1337/flomark.git
cd flomark
sudo ./install.sh
```

---

## 🎓 Advanced Options

### Silent Installation (Non-Interactive)

Not currently supported, but you can pre-configure:

```bash
# Create installation directory
sudo mkdir -p /opt/flomark

# Clone repository
sudo git clone https://github.com/cli1337/flomark.git /opt/flomark

# Pre-configure .env
sudo cp /opt/flomark/backend/env.example /opt/flomark/backend/.env
sudo nano /opt/flomark/backend/.env

# Run installer
cd /opt/flomark
sudo ./install.sh
```

### Custom Branch/Version

```bash
# Download script
curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh > quick-install.sh

# Edit the git clone line to use specific branch/tag
nano quick-install.sh
# Change: git clone https://github.com/cli1337/flomark.git
# To: git clone -b v1.0.0 https://github.com/cli1337/flomark.git

# Run it
chmod +x quick-install.sh
sudo ./quick-install.sh
```

---

## 📊 Comparison

| Method | Ease | Control | Speed |
|--------|------|---------|-------|
| **Quick Install** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Manual Clone + Install** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Manual Setup** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Recommendation:**
- **Production**: Use Quick Install
- **Development**: Either method works
- **Custom Setup**: Manual installation

---

## 📚 Related Documentation

- [INSTALLATION-INTERACTIVE-GUIDE.md](INSTALLATION-INTERACTIVE-GUIDE.md) - Detailed installation guide
- [WHAT-HAPPENS-DURING-INSTALL.md](WHAT-HAPPENS-DURING-INSTALL.md) - Technical breakdown
- [LOGS-README.md](LOGS-README.md) - Log management
- [DOMAIN-SETUP-GUIDE.md](DOMAIN-SETUP-GUIDE.md) - Domain and SSL setup

---

**Quick Install makes deployment effortless! 🚀**

