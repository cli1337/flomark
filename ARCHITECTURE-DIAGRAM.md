# 🏗️ Flomark Architecture & Deployment Flow

Visual guide to understand how Flomark is deployed and how demo mode works.

---

## 🌐 Deployment Architecture

```
                    ┌─────────────────────────────────────┐
                    │         USER / CLIENT               │
                    │    (Browser / Mobile Device)        │
                    └─────────────────────────────────────┘
                                     │
                                     │ HTTPS (Port 443)
                                     │ HTTP  (Port 80)
                                     ▼
                    ┌─────────────────────────────────────┐
                    │      WEB SERVER (Reverse Proxy)     │
                    │                                     │
                    │  ┌──────────────────────────────┐   │
                    │  │    Nginx or Apache           │   │
                    │  │  - SSL/TLS Termination       │   │
                    │  │  - Static File Serving       │   │
                    │  │  - Gzip Compression          │   │
                    │  │  - Security Headers          │   │
                    │  │  - WebSocket Proxy           │   │
                    │  └──────────────────────────────┘   │
                    └─────────────────────────────────────┘
                              │              │
                              │              │
              ┌───────────────┘              └──────────────┐
              │                                             │
              │ /api, /socket.io                            │ /, /assets
              ▼                                             ▼
    ┌────────────────────────┐                  ┌─────────────────────┐
    │   BACKEND (Node.js)    │                  │  FRONTEND (React)   │
    │                        │                  │                     │
    │  ┌──────────────────┐  │                  │  ┌───────────────┐  │
    │  │   Express API    │  │                  │  │  Static Files │  │
    │  │   - REST Routes  │  │                  │  │  - index.html │  │
    │  │   - Auth Logic   │  │                  │  │  - JS Bundle  │  │
    │  │   - Socket.io    │  │                  │  │  - CSS Files  │  │
    │  └──────────────────┘  │                  │  │  - Assets     │  │
    │                        │                  │  └───────────────┘  │
    │  ┌──────────────────┐  │                  └─────────────────────┘
    │  │   PM2 Manager    │  │
    │  │   - Auto-restart │  │
    │  │   - Load Balance │  │
    │  │   - Monitoring   │  │
    │  └──────────────────┘  │
    │                        │
    │  Port: 3000            │
    └────────────────────────┘
              │
              │ MongoDB Protocol
              ▼
    ┌────────────────────────┐
    │   DATABASE (MongoDB)   │
    │                        │
    │  ┌──────────────────┐  │
    │  │   Collections:   │  │
    │  │   - users        │  │
    │  │   - projects     │  │
    │  │   - tasks        │  │
    │  │   - labels       │  │
    │  │   - lists        │  │
    │  └──────────────────┘  │
    │                        │
    │  Port: 27017           │
    └────────────────────────┘
```

---

## 🔄 Request Flow

### Normal Request Flow

```
1. User → Browser
   │
2. Browser → HTTPS Request → Web Server (Nginx/Apache)
   │
3. Web Server → Routes Request:
   │
   ├─→ /api/* → Backend (Port 3000)
   │   │
   │   ├─→ Authentication Middleware
   │   │   │
   │   │   ├─→ Authorized → Controller → Database
   │   │   │                              │
   │   │   │                              ▼
   │   │   │                           Response
   │   │   │                              │
   │   │   └─→ Unauthorized → 401 Error ─┘
   │   │
   │   └─→ Response → Web Server → Browser
   │
   └─→ /* (Static) → Serve React App → Browser
```

### WebSocket Flow (Real-time)

```
1. Browser → WebSocket Handshake → /socket.io/
   │
2. Web Server → Proxy Upgrade → Backend Socket.io
   │
3. Backend → Authenticate Socket → Success/Fail
   │
4. Success → Maintain Connection
   │
5. Events:
   │
   ├─→ Task Created   → Broadcast to Room
   ├─→ Task Updated   → Broadcast to Room
   ├─→ Task Moved     → Broadcast to Room
   └─→ User Joined    → Notify Room
   │
6. All Connected Clients Receive Updates in Real-time
```

---

## 🎭 Demo Mode Flow

### Demo Mode Architecture

```
                        ┌─────────────────┐
                        │  Public User    │
                        │  (No Account)   │
                        └─────────────────┘
                                │
                                │ Access Demo Project
                                ▼
                    ┌─────────────────────────┐
                    │   Demo Mode Middleware  │
                    │                         │
                    │  1. Check if DEMO_MODE  │
                    │  2. Check Project ID    │
                    │  3. Is Demo Project?    │
                    └─────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                  YES                      NO
                    │                       │
                    ▼                       ▼
        ┌────────────────────┐   ┌──────────────────────┐
        │ Create Demo User   │   │  Normal Auth Flow    │
        │                    │   │  - Require Login     │
        │ • email: demo@...  │   │  - Check Token       │
        │ • auto-generate    │   │  - Verify User       │
        │ • attach to req    │   └──────────────────────┘
        └────────────────────┘
                    │
                    ▼
        ┌────────────────────┐
        │ Continue Request   │
        │ • Full Access      │
        │ • Can CRUD Tasks   │
        │ • Real-time Works  │
        │ • No Project Del   │
        └────────────────────┘
```

### Demo Mode Request Examples

**Creating a Task (Demo User):**
```
POST /api/tasks/lists/:listId/tasks

1. Request arrives → Demo Middleware
   │
2. Check: projectId === DEMO_PROJECT_ID?
   │
3. YES → Create/Get demo user
   │
4. Attach demo user to request
   │
5. Continue to Task Controller
   │
6. Task created with demo user as creator
   │
7. Broadcast update to all demo users
```

**Deleting Project (Prevented):**
```
DELETE /api/projects/:projectId

1. Request arrives → Demo Middleware
   │
2. Check: projectId === DEMO_PROJECT_ID?
   │
3. YES → Mark as demo request
   │
4. Continue to Prevention Middleware
   │
5. Check: DELETE on demo project?
   │
6. YES → Block with 403
   │
7. Return: "Demo mode: Cannot delete projects"
```

---

## 📦 Installation Script Flow

### Unified Script (install.sh)

```
START
  │
  ├─→ Check Root Access
  │   └─→ Fail → Exit
  │
  ├─→ Detect OS
  │   ├─→ Debian/Ubuntu → apt-get
  │   └─→ RHEL/CentOS   → yum/dnf
  │
  ├─→ Prompt: Choose Web Server
  │   ├─→ 1. Nginx
  │   └─→ 2. Apache
  │
  ├─→ Install Web Server
  │   ├─→ Nginx  → Install nginx, enable modules
  │   └─→ Apache → Install apache, enable modules
  │
  ├─→ Install Node.js
  │   └─→ curl nodesource script → install
  │
  ├─→ Install PM2 & pnpm
  │   └─→ npm install -g pm2 pnpm
  │
  ├─→ Prompt: Enable Demo Mode?
  │   ├─→ Yes → Set DEMO_MODE=true in .env
  │   └─→ No  → Continue
  │
  ├─→ Build Frontend
  │   └─→ pnpm install && pnpm build
  │
  ├─→ Install Backend
  │   └─→ pnpm install
  │
  ├─→ Setup PM2
  │   └─→ pm2 start server.js --name flomark-backend
  │
  ├─→ Configure Web Server
  │   ├─→ Create config file
  │   ├─→ Enable site
  │   └─→ Test config
  │
  ├─→ Start Services
  │   ├─→ pm2 save
  │   └─→ systemctl restart nginx/apache
  │
  └─→ Show Success Message
      └─→ Display access URL & commands
```

---

## 🔐 Security Layers

### Request Security Flow

```
                    Internet
                       │
                       ▼
        ┌──────────────────────────┐
        │  1. FIREWALL (UFW/etc)   │
        │  • Allow 80, 443 only    │
        │  • Block other ports     │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  2. WEB SERVER           │
        │  • SSL/TLS               │
        │  • Security Headers      │
        │  • Rate Limiting         │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  3. DEMO MIDDLEWARE      │
        │  • Check demo mode       │
        │  • Auto-auth if demo     │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  4. AUTH MIDDLEWARE      │
        │  • Verify JWT Token      │
        │  • Check user exists     │
        │  • Validate permissions  │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  5. DEMO PREVENTION      │
        │  • Block destructive ops │
        │  • Protect demo project  │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  6. CONTROLLER LOGIC     │
        │  • Business logic        │
        │  • Data validation       │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  7. DATABASE (MongoDB)   │
        │  • Prisma ORM            │
        │  • Data integrity        │
        └──────────────────────────┘
```

---

## 📊 Component Interaction

### Project Creation Flow

```
┌─────────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐
│ Frontend│      │ Backend │      │   PM2    │      │ Database │
└────┬────┘      └────┬────┘      └────┬─────┘      └────┬─────┘
     │                │                 │                 │
     │ POST /projects │                 │                 │
     │───────────────>│                 │                 │
     │                │                 │                 │
     │                │ Auth Check      │                 │
     │                │────────┐        │                 │
     │                │        │        │                 │
     │                │<───────┘        │                 │
     │                │                 │                 │
     │                │ Create Project  │                 │
     │                │─────────────────────────────────>│
     │                │                 │                 │
     │                │                 │   DB Response   │
     │                │<─────────────────────────────────│
     │                │                 │                 │
     │                │ Emit Socket     │                 │
     │                │ "project:create"│                 │
     │                │─────────────────>│                 │
     │                │                 │                 │
     │  Response      │                 │  Broadcast      │
     │<───────────────│                 │  to all clients │
     │                │                 │───────────┐     │
     │                │                 │           │     │
     │  Socket Event  │                 │<──────────┘     │
     │<───────────────────────────────────               │
     │                │                 │                 │
     │ Update UI      │                 │                 │
     │────────┐       │                 │                 │
     │        │       │                 │                 │
     │<───────┘       │                 │                 │
```

---

## 🚀 Deployment States

### Development vs Production

```
DEVELOPMENT                          PRODUCTION
─────────────                        ──────────────

Frontend (Vite Dev Server)           Frontend (Static Build)
├─ Hot Module Reload                 ├─ Optimized Bundle
├─ Port: 5173                        ├─ Minified Assets
└─ Source Maps                       └─ Served by Nginx/Apache

Backend (Node)                       Backend (PM2)
├─ nodemon                           ├─ Cluster Mode
├─ Port: 3000                        ├─ Auto-restart
└─ Debug Logging                     ├─ Load Balancing
                                     └─ Production Logging

Database (Local)                     Database (Production)
├─ No Auth                           ├─ Authentication
├─ Local Network                     ├─ Replica Set
└─ Dev Data                          └─ Backups Enabled

Security                             Security
├─ CORS: *                           ├─ CORS: Specific
├─ HTTP Only                         ├─ HTTPS + SSL
└─ Weak Secrets                      ├─ Strong Secrets
                                     └─ Security Headers
```

---

## 🔄 Real-time Updates

### Socket.io Event Flow

```
         User A                    Server                     User B
           │                         │                          │
           │   socket.emit()         │                          │
           │  "task:update"          │                          │
           │────────────────────────>│                          │
           │                         │                          │
           │                         │  Validate Event          │
           │                         │──────────┐               │
           │                         │          │               │
           │                         │<─────────┘               │
           │                         │                          │
           │                         │  Update Database         │
           │                         │──────────────┐           │
           │                         │              │           │
           │                         │<─────────────┘           │
           │                         │                          │
           │                         │  io.to(room).emit()      │
           │                         │  "task:updated"          │
           │                         │──────────────────────────>│
           │                         │                          │
           │  Receive Broadcast      │                          │
           │<────────────────────────│                          │
           │                         │                          │
           │  Update UI              │                 Update UI│
           │──────────┐              │              ┌───────────│
           │          │              │              │           │
           │<─────────┘              │              └──────────>│
```

---

## 📈 Scaling Options

### Horizontal Scaling

```
                    Load Balancer (Nginx)
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    Backend 1         Backend 2         Backend 3
    (PM2 Cluster)     (PM2 Cluster)     (PM2 Cluster)
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                   MongoDB Replica Set
                   ┌───────┬───────┐
                   │       │       │
                 Primary Secondary Secondary
```

### Vertical Scaling

```
Single Server Optimization:

1. PM2 Cluster Mode
   └─> Use all CPU cores

2. Database Indexing
   └─> Faster queries

3. Redis Caching
   └─> Reduce DB load

4. CDN for Static Assets
   └─> Faster delivery

5. HTTP/2
   └─> Better performance
```

---

## 🛠️ Monitoring Stack

```
                    ┌─────────────────┐
                    │   Monitoring    │
                    └─────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌─────────────┐ ┌────────────┐
    │   PM2 Logs   │ │ Server Logs │ │  DB Logs   │
    │              │ │             │ │            │
    │ • App stdout │ │ • Nginx log │ │ • Queries  │
    │ • App stderr │ │ • Access log│ │ • Slow ops │
    │ • PM2 events │ │ • Error log │ │ • Metrics  │
    └──────────────┘ └─────────────┘ └────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
                    ┌─────────────────┐
                    │  Log Aggregator │
                    │   (Optional)    │
                    │                 │
                    │ • ELK Stack     │
                    │ • Papertrail    │
                    │ • Datadog       │
                    └─────────────────┘
```

---

**For detailed guides, see:**
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [DEMO-MODE-README.md](DEMO-MODE-README.md)
- [INSTALLATION-SCRIPTS-README.md](INSTALLATION-SCRIPTS-README.md)

