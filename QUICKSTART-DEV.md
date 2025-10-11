# 🚀 Flomark - Quick Start Development Guide

Get started with Flomark development in **under 2 minutes** using SQLite!

## ⚡ Super Quick Start

```bash
# 1. Setup backend with SQLite
cd backend
npm run dev:setup
npm run dev

# 2. In a new terminal, setup frontend
cd frontend
npm install
npm run dev
```

**Done!** 🎉
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

## 📋 Detailed Steps

### Backend Setup (SQLite)

```bash
cd backend

# Option 1: Automated setup (Recommended)
npm run dev:setup          # Sets up SQLite automatically
npm run dev                # Start development server

# Option 2: Using setup script
# Windows PowerShell:
.\setup-dev-sqlite.ps1

# Linux/macOS:
chmod +x setup-dev-sqlite.sh
./setup-dev-sqlite.sh
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Useful Commands

### Backend
```bash
npm run dev              # Start dev server (auto-reload)
npm run dev:setup        # Setup SQLite environment
npm run db:studio        # Open database GUI
npm run db:push          # Apply schema changes
npm run db:reset         # Reset database
npm run make-admin email@example.com  # Make user admin
```

### Frontend
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

---

## 👤 First User Setup

After starting both servers:

1. **Register a new user:**
   - Go to http://localhost:5173/register
   - Create an account

2. **Make yourself admin:**
   ```bash
   cd backend
   npm run make-admin your-email@example.com
   ```

3. **Login and start using Flomark!**

---

## 📊 Database Management

### View your data:
```bash
cd backend
npm run db:studio
```
Opens Prisma Studio at http://localhost:5555

### Reset database:
```bash
cd backend
npm run db:reset
```

---

## 🔄 Switching Databases

### Current: SQLite (default for development)
```env
DATABASE_URL=file:./dev.db
```

### To PostgreSQL:
```bash
cd backend
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```
Update `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/flomark
```

### To MongoDB:
```bash
cd backend
cp prisma/schema.mongodb.prisma prisma/schema.prisma
```
Update `.env`:
```env
DATABASE_URL=mongodb://localhost:27017/flomark
```

Then:
```bash
npm run db:generate
npm run db:push
```

---

## 📁 Database Files

- **SQLite DB**: `backend/dev.db` (auto-created)
- **Config**: `backend/.env`
- **Schema**: `backend/prisma/schema.prisma`

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Change backend port in backend/.env:
PORT=3001

# Change frontend port:
npm run dev -- --port 5174
```

### Database locked error
1. Close Prisma Studio
2. Close any SQLite browser
3. Restart dev server

### Module not found errors
```bash
# Backend:
cd backend && npm install && npm run db:generate

# Frontend:
cd frontend && npm install
```

### Fresh start
```bash
# Backend:
cd backend
rm dev.db .env
npm run dev:setup

# Frontend:
cd frontend
rm -rf node_modules
npm install
```

---

## 📚 More Information

- **SQLite Dev Setup**: `backend/DEV-SETUP-SQLITE.md`
- **Complete Setup Guide**: `COMPLETE-SETUP-GUIDE.md`
- **Database Setup**: `DATABASE-SETUP.md`
- **Contributing**: `CONTRIBUTING.md`

---

## 🎯 What's Next?

1. ✅ Setup complete
2. 📝 Create your first project
3. 👥 Invite team members
4. 🎨 Customize your workflow
5. 🚀 Deploy to production (see INSTALLATION-README.md)

---

## 💡 Development Tips

- **Auto-reload**: Both servers support hot module replacement
- **Database GUI**: Use `npm run db:studio` to view/edit data
- **Clean slate**: Delete `backend/dev.db` anytime for fresh database
- **API Testing**: Backend health check at http://localhost:3000/api/health

---

**Happy Coding!** 🚀

Need help? Check the documentation or open an issue on GitHub.

