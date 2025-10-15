# 🎨 Flomark Frontend

React + Vite frontend for Flomark project management platform.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Vite Configuration](#-vite-configuration)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Build & Deploy](#-build--deploy)

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## ⚙️ Vite Configuration

The frontend configuration is in `vite.config.js`. Here's what each setting does:

### Development Server Port

**Default:** `3000`

```js
server: {
  port: 3000,  // Frontend dev server port
  // ...
}
```

**To change the frontend port:**

1. Edit `vite.config.js`:
   ```js
   server: {
     port: 5173,  // Change to your preferred port
   }
   ```

2. Access frontend at: `http://localhost:5173`

### Allowed Hosts

**Default:** `['127.0.0.1']`

```js
server: {
  allowedHosts: ['127.0.0.1'],  // Allowed host addresses
  // ...
}
```

**What is allowedHosts?**

Controls which host addresses can access the dev server. This is a security feature.

**Common configurations:**

```js
// Development on localhost only
allowedHosts: ['127.0.0.1']

// Allow specific domain
allowedHosts: ['myapp.local', 'dev.myapp.com']

// Allow all hosts (NOT recommended for security)
allowedHosts: 'all'

// Multiple hosts
allowedHosts: ['127.0.0.1', 'localhost', 'dev.example.com']
```

**When to change:**
- Using a custom local domain (e.g., `myapp.local`)
- Accessing dev server from another machine on your network
- Testing with mobile devices

⚠️ **Security Note:** Only use `allowedHosts: 'all'` in trusted development environments.

### API Proxy Configuration

**Default Target:** `http://localhost:5000`

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // Backend API URL
      changeOrigin: true
    }
  }
}
```

**What does this do?**

Proxies all requests from `http://localhost:3000/api/*` to `http://localhost:5000/api/*`

**Example flow:**
```
Frontend makes request:  http://localhost:3000/api/users
                         ↓
Vite proxy forwards to:  http://localhost:5000/api/users
                         ↓
Backend responds
```

**To change the backend target:**

1. **If backend runs on different port:**
   ```js
   proxy: {
     '/api': {
       target: 'http://localhost:8000',  // Your backend port
       changeOrigin: true
     }
   }
   ```

2. **If backend runs on different host:**
   ```js
   proxy: {
     '/api': {
       target: 'http://192.168.1.100:5000',  // Remote backend
       changeOrigin: true
     }
   }
   ```

3. **For production backend:**
   ```js
   proxy: {
     '/api': {
       target: 'https://api.myapp.com',  // Production API
       changeOrigin: true,
       secure: true  // Verify SSL certificates
     }
   }
   ```

### Complete Configuration Example

```js
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,                          // Frontend dev port
    allowedHosts: ['127.0.0.1'],         // Allowed hosts
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend URL
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Import alias
    },
  },
})
```

---

## 🔌 Port Configuration Guide

### Understanding the Ports

| Service | Port | Configuration File | Purpose |
|---------|------|-------------------|---------|
| **Frontend (Dev)** | 3000 | `vite.config.js` | Vite dev server |
| **Backend** | 5000 | `backend/.env` (PORT) | Express API server |

### Common Scenarios

#### Scenario 1: Change Frontend Port
```js
// vite.config.js
server: {
  port: 8080,  // Changed from 3000
}
```
Access: `http://localhost:8080`

#### Scenario 2: Change Backend Port
```env
# backend/.env
PORT=4000  # Changed from 5000
```

```js
// vite.config.js (update proxy)
proxy: {
  '/api': {
    target: 'http://localhost:4000',  // Match backend port
    changeOrigin: true
  }
}
```

#### Scenario 3: Custom Domain Development
```js
// vite.config.js
server: {
  port: 3000,
  allowedHosts: ['myapp.local'],  // Custom domain
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1  myapp.local
```

Access: `http://myapp.local:3000`

---

## 🌍 Environment Variables

Frontend environment variables are **NOT** used in this project. All configuration is done through `vite.config.js`.

**Why?**

Vite bundles the frontend into static files. The API endpoint is configured via the proxy during development and nginx/apache in production.

**Production Setup:**

In production, the frontend is served as static files from `dist/`, and nginx/apache handles the API proxy.

---

## 🛠️ Development

### Start Dev Server

```bash
pnpm dev
```

Runs at `http://localhost:3000` (default)

### With Different Port

```bash
# Option 1: Edit vite.config.js
# Option 2: Command line override
vite --port 8080
```

### Development with Remote Backend

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'https://staging-api.myapp.com',
    changeOrigin: true,
    secure: false  // Set true for production SSL
  }
}
```

---

## 📦 Build & Deploy

### Build for Production

```bash
pnpm build
```

Creates optimized bundle in `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

### Production Deployment

The production build does **NOT** use Vite's proxy. Instead:

1. **Nginx handles the API proxy:**
   ```nginx
   location /api {
     proxy_pass http://localhost:5000;
   }
   ```

2. **Apache handles the API proxy:**
   ```apache
   ProxyPass /api http://localhost:5000/api
   ProxyPassReverse /api http://localhost:5000/api
   ```

The frontend static files are served directly by nginx/apache.

---

## 🔧 Troubleshooting

### Issue: "Failed to connect to backend"

**Check:**
1. Backend is running on port 5000 (or configured port)
2. Proxy target in `vite.config.js` matches backend port
3. CORS is configured in backend (should be automatic)

```bash
# Verify backend is running
curl http://localhost:5000/api/health
```

### Issue: "Vite dev server won't start"

**Solution:**
```bash
# Port might be in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in vite.config.js
```

### Issue: "403 Invalid Host header"

**Solution:**

Add your hostname to `allowedHosts`:
```js
server: {
  allowedHosts: ['127.0.0.1', 'myapp.local'],
}
```

### Issue: "API calls fail in production"

**Reason:** Vite proxy only works in development.

**Solution:** Configure nginx/apache to proxy `/api` to backend. See deployment guides.

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vite Server Options](https://vitejs.dev/config/server-options.html)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

---

**Questions?** Open an issue on [GitHub](https://github.com/cli1337/flomark/issues)
