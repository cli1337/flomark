# 🔍 What Happens During Installation?

Detailed breakdown of what the Flomark installation script does behind the scenes.

---

## 📦 Complete Installation Process

When you run `sudo ./install.sh`, here's exactly what happens:

### 1. Interactive Configuration (New!)

The script asks you for configuration:

```
🌐 Domain Configuration
- Do you want a custom domain? [y/N]
  → If yes: Enter your domain (e.g., myapp.example.com)
  → If no: Uses localhost (for local development)

🔌 Backend Port Configuration
- Use custom port? [y/N]
  → Default: 3000
  → Auto-detects if port is already in use
  → Suggests next available port if needed

🌐 Web Server Selection
- Choose: Nginx (recommended) or Apache
  → Nginx: Better performance, lower memory
  → Apache: More familiar to some users

🎭 Demo Mode
- Enable demo mode? [y/N]
  → Demo mode: Public access without login
  → Production: Users must register/login
```

---

## 🏗️ Build & Deployment Steps

### Step 1: Install Dependencies

**What happens:**
- Installs Nginx or Apache web server
- Installs Node.js 18+ (if not already installed)
- Installs PM2 globally (process manager)
- Installs pnpm (package manager)

**Why:**
- Web server: Serves frontend files and proxies API requests
- Node.js: Runs the backend
- PM2: Keeps backend running and restarts on crashes
- pnpm: Faster, more efficient than npm

---

### Step 2: Build Frontend

**What happens:**
```bash
cd frontend
pnpm install          # Install dependencies
pnpm build           # Build for production
```

**What `pnpm build` does:**
1. **Converts React to static files:**
   - `src/` (React components) → `dist/` (HTML/JS/CSS)
   - Bundles all JavaScript files
   - Processes CSS and assets
   - Optimizes images
   - Minifies code for production

2. **Output:**
   ```
   frontend/dist/
   ├── index.html          # Main HTML file
   ├── assets/
   │   ├── index-[hash].js    # Bundled JavaScript
   │   ├── index-[hash].css   # Bundled CSS
   │   └── [images/fonts...]  # Static assets
   ```

**Result:** Static files ready to be served by Nginx/Apache

---

### Step 3: Install Backend Dependencies

**What happens:**
```bash
cd backend
pnpm install         # Install Node.js packages
npx prisma db push   # Setup database schema
```

**What this does:**
- Installs all backend dependencies
- Connects to MongoDB
- Creates database collections/indexes
- Sets up Prisma client

---

### Step 4: Configure Environment

**What happens:**
- Updates or creates `.env` file
- Sets backend port (3000 or custom)
- Configures demo mode (if enabled)

**Example `.env`:**
```env
DATABASE_URL=mongodb://localhost:27017/flomark
PORT=3000
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
DEMO_MODE=false
```

---

### Step 5: Start Backend with PM2

**What happens:**
```bash
pm2 start src/server.js --name flomark-backend
pm2 save
pm2 startup
```

**What PM2 does:**

1. **Starts backend:**
   - Runs Node.js server
   - Binds to configured port (3000)
   - Connects to MongoDB
   - Initializes WebSocket server

2. **Process management:**
   - Restarts on crashes
   - Monitors memory usage
   - Logs all output
   - Provides status dashboard

3. **Auto-start on reboot:**
   - `pm2 startup`: Creates systemd service
   - `pm2 save`: Saves current process list
   - **Result:** Backend auto-starts when server reboots!

**Check PM2 status:**
```bash
pm2 list              # Show running processes
pm2 logs flomark-backend  # View logs
pm2 status            # Detailed status
```

---

### Step 6: Configure Web Server

#### Nginx Configuration

**What happens:**
Creates `/etc/nginx/sites-available/flomark`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Serve frontend static files
    root /path/to/flomark/frontend/dist;
    index index.html;
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3000;
        # Headers for proper proxying
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # SPA fallback - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**What this does:**
- **Static files:** Serves frontend from `dist/` folder
- **API proxy:** Forwards `/api/*` requests to Node.js backend
- **WebSockets:** Handles real-time Socket.io connections
- **SPA routing:** All unknown routes load `index.html` (React Router)

---

### Step 7: Enable Auto-Start

**What happens:**
```bash
systemctl enable nginx     # Auto-start Nginx on reboot
systemctl enable apache2   # Or Apache
```

**Result:** Web server starts automatically on server reboot!

---

## 🔄 What Happens on Server Reboot?

When your server restarts:

1. **System boots up**
   
2. **Systemd starts services:**
   - MongoDB starts (if installed locally)
   - Nginx/Apache starts automatically
   
3. **PM2 resurrects processes:**
   - PM2 service starts
   - Backend (flomark-backend) starts automatically
   - Connects to MongoDB
   - Ready to accept requests
   
4. **Web server serves requests:**
   - Nginx/Apache listens on port 80 (and 443 if SSL)
   - Serves frontend files
   - Proxies API to backend
   
5. **Application is live!**
   - No manual intervention needed
   - Everything starts automatically

**Verify auto-start:**
```bash
# Check services
systemctl status nginx
systemctl status flomark-backend  # If using systemd
pm2 list  # Shows resurrected processes

# Test reboot
sudo reboot
# Wait for reboot...
# Check if everything is running
pm2 list
systemctl status nginx
```

---

## 📁 File Structure After Installation

```
flomark/
├── frontend/
│   ├── src/              # Source code (not used in production)
│   └── dist/             # Built files (served by web server)
│       ├── index.html
│       └── assets/
│           ├── index-[hash].js
│           └── index-[hash].css
│
├── backend/
│   ├── src/
│   │   └── server.js     # Main server file (PM2 runs this)
│   ├── .env              # Configuration
│   ├── node_modules/     # Dependencies
│   └── uploads/          # User uploaded files
│
└── logs.sh               # Log viewer script
```

---

## 🌐 How Requests are Handled

### Frontend Request (e.g., http://yourdomain.com/projects)

```
Browser Request
  ↓
Nginx/Apache (port 80)
  ↓
Serves frontend/dist/index.html
  ↓
Browser loads React app
  ↓
React Router handles /projects
  ↓
Displays projects page
```

### API Request (e.g., http://yourdomain.com/api/projects)

```
Browser Request
  ↓
Nginx/Apache (port 80)
  ↓
Proxy to Backend (port 3000)
  ↓
Node.js/Express handles request
  ↓
MongoDB query
  ↓
Response back to browser
```

### WebSocket Connection (e.g., http://yourdomain.com/socket.io/)

```
Browser WebSocket request
  ↓
Nginx/Apache (port 80)
  ↓
Upgrade to WebSocket protocol
  ↓
Proxy to Backend (port 3000)
  ↓
Socket.io handles connection
  ↓
Real-time bidirectional communication
```

---

## 🔍 Port Usage

| Service | Port | Purpose |
|---------|------|---------|
| Nginx/Apache | 80 | HTTP requests (public facing) |
| Nginx/Apache | 443 | HTTPS requests (with SSL) |
| Backend | 3000* | Node.js API server (internal) |
| MongoDB | 27017 | Database (internal) |

*Custom port if 3000 is in use

**Security:**
- Ports 3000 and 27017 are only accessible internally
- Only ports 80 and 443 are exposed to the internet
- Nginx/Apache acts as a reverse proxy for security

---

## 🚀 Platform Support

### Current: ✅ Linux

**Supported distributions:**
- ✅ Ubuntu 20.04+
- ✅ Debian 10+
- ✅ CentOS 7+
- ✅ RHEL 7+
- ✅ Fedora 30+

**Why Linux first:**
- Production servers typically run Linux
- Better tooling for web hosting
- PM2 works best on Linux
- Nginx/Apache native to Linux

### Coming Soon: 🔜 Windows

**Planned features:**
- Windows installer script (PowerShell)
- IIS configuration option
- Windows Service for backend
- Native Windows compatibility

**Why not yet:**
- Different process management (no PM2 equivalent)
- Different web server setup (IIS vs Nginx/Apache)
- Path differences (forward vs back slashes)
- Service management differences

### Coming Soon: 🐳 Docker

**Planned features:**
- Docker Compose setup
- Multi-container architecture
- One-command deployment
- Platform-independent

**Benefits:**
- Works on Windows, Mac, Linux
- Isolated environment
- Easy updates
- Portable deployment

---

## 📊 System Resources

**Minimum requirements:**
- 1 GB RAM
- 1 CPU core
- 10 GB disk space
- Ubuntu 20.04+ or similar

**Recommended:**
- 2 GB+ RAM
- 2+ CPU cores
- 20 GB+ disk space
- SSD storage

**What uses resources:**
- **Frontend:** None (static files)
- **Backend:** ~100-200 MB RAM
- **MongoDB:** ~200-500 MB RAM
- **Web server:** ~50-100 MB RAM

---

## 🆘 Troubleshooting

### Frontend not loading

**Check web server:**
```bash
systemctl status nginx
ls -la /path/to/flomark/frontend/dist/
```

**Solution:**
- Rebuild frontend: `cd frontend && pnpm build`
- Restart web server: `sudo systemctl restart nginx`

### API requests failing

**Check backend:**
```bash
pm2 list
pm2 logs flomark-backend
```

**Solution:**
- Check .env configuration
- Restart backend: `pm2 restart flomark-backend`
- Check MongoDB connection

### Not auto-starting on reboot

**Check PM2 startup:**
```bash
pm2 startup
pm2 save
```

**Solution:**
- Run `pm2 startup` again
- Copy and run the command it outputs
- Run `pm2 save`

---

## 📚 Related Documentation

- **INSTALLATION-INTERACTIVE-GUIDE.md** - Step-by-step installation guide
- **LOGS-README.md** - View and manage logs
- **DOMAIN-SETUP-GUIDE.md** - DNS and domain configuration
- **DEPLOYMENT.md** - Complete deployment guide

---

**Understanding how it works makes troubleshooting easier! 🎓**

