# 🔄 Flomark Update Guide

Guide for updating your Flomark installation safely and efficiently.

---

## 📋 Overview

Flomark provides separate update scripts for backend and frontend to preserve your customizations:

- **`update-backend.sh`** - Updates server code only
- **`update-frontend.sh`** - Updates UI code only

This separation ensures that:
- ✅ Frontend customizations are preserved
- ✅ Backend .env configuration is kept
- ✅ Uploads and storage are protected
- ✅ You can update one part without affecting the other

---

## 🚀 Quick Update

### Update Everything

```bash
# Update backend
./update-backend.sh

# Update frontend
./update-frontend.sh
```

### Update Backend Only

```bash
./update-backend.sh
```

### Update Frontend Only

```bash
./update-frontend.sh
```

---

## 🔧 Backend Updates

### What Gets Updated

- ✅ Server code (`backend/src/`)
- ✅ Dependencies (`package.json`)
- ✅ Database schema (Prisma)
- ✅ API routes and controllers
- ✅ Middleware and services

### What Is Preserved

- ✅ Environment variables (`.env`)
- ✅ Uploaded files (`uploads/`)
- ✅ Storage directory (`storage/`)
- ✅ Custom middleware (if in `custom/`)

### Update Process

```bash
chmod +x update-backend.sh
./update-backend.sh
```

**Steps performed:**
1. Creates timestamped backup
2. Stashes local changes
3. Pulls latest backend code
4. Restores .env and uploads
5. Updates dependencies
6. Runs database migrations
7. Restarts PM2 process

### Rollback if Needed

```bash
# Find your backup
ls -la backups/

# Restore from backup
cp -r backups/backend-20241010-120000/src/* backend/src/
cp backups/backend-20241010-120000/.env backend/.env
pm2 restart flomark-backend
```

---

## 🎨 Frontend Updates

### What Gets Updated

- ✅ UI components (`frontend/src/`)
- ✅ Dependencies (`package.json`)
- ✅ Build configuration
- ✅ Pages and layouts
- ✅ Styles and assets

### What Is Preserved

- ✅ Custom components (in `frontend/src/custom/`)
- ✅ Custom styles
- ✅ Environment-specific configs

### Update Process

```bash
chmod +x update-frontend.sh
./update-frontend.sh
```

**Steps performed:**
1. Creates timestamped backup
2. Checks for custom/ directory
3. Pulls latest frontend code
4. Restores custom files
5. Updates dependencies
6. Builds production bundle
7. Deploys to web server

### Preserving Customizations

**Best Practice:** Keep customizations in `frontend/src/custom/`

```bash
# Create custom directory
mkdir -p frontend/src/custom/components
mkdir -p frontend/src/custom/styles

# Add your custom components
cp MyComponent.jsx frontend/src/custom/components/

# Custom directory is auto-preserved during updates!
```

### Rollback if Needed

```bash
# Find your backup
ls -la backups/

# Restore from backup
cp -r backups/frontend-20241010-120000/src/* frontend/src/
cd frontend && pnpm build
```

---

## ⚠️ Before Updating

### Pre-Update Checklist

- [ ] Read release notes
- [ ] Check breaking changes
- [ ] Backup database manually (optional)
- [ ] Note current version
- [ ] Plan downtime (if needed)
- [ ] Test in staging (if available)

### Manual Backup

```bash
# Backup database
mongodump --db flomark --out ~/backups/mongo-$(date +%Y%m%d)

# Backup uploads
tar -czf ~/backups/uploads-$(date +%Y%m%d).tar.gz backend/uploads

# Backup .env
cp backend/.env ~/backups/.env-$(date +%Y%m%d)

# Backup entire app (optional)
tar -czf ~/backups/flomark-full-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  .
```

---

## 🔍 Update Verification

### After Backend Update

```bash
# Check PM2 status
pm2 status
pm2 logs flomark-backend --lines 50

# Test API health
curl http://localhost:3000/api/health

# Check database connection
cd backend && npx prisma studio
```

### After Frontend Update

```bash
# Check build output
ls -la frontend/dist/

# Clear browser cache
# Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# Check console for errors
# Open browser DevTools (F12)
```

### Full System Check

```bash
# Check all services
pm2 list
systemctl status nginx  # or apache2

# Check logs
pm2 logs flomark-backend
tail -f /var/log/nginx/error.log

# Test key features
# - Login works
# - Projects load
# - Tasks can be created
# - Real-time updates work
# - File uploads work
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs flomark-backend --err

# Common fixes:
# 1. Missing dependencies
cd backend && pnpm install

# 2. Database migration needed
cd backend && npx prisma db push

# 3. Port conflict
lsof -i :3000
# Kill conflicting process or change PORT in .env

# 4. Restore from backup
cp -r backups/backend-TIMESTAMP/src/* backend/src/
pm2 restart flomark-backend
```

### Frontend Not Loading

```bash
# Rebuild frontend
cd frontend
pnpm install
pnpm build

# Check if built
ls -la dist/

# Clear browser cache
# Ctrl+Shift+R or Cmd+Shift+R

# Check web server config
nginx -t  # for Nginx
apache2ctl configtest  # for Apache

# Restart web server
systemctl restart nginx  # or apache2
```

### Database Migration Errors

```bash
# Reset database (CAUTION: loses data)
cd backend
npx prisma db push --force-reset

# Or restore from backup
mongorestore --db flomark ~/backups/mongo-20241010/flomark
```

### Conflicts with Custom Code

```bash
# If git conflicts occur:
cd backend  # or frontend
git status

# Resolve conflicts manually or:
git stash pop  # Apply your stashed changes
# Manually merge conflicts

# Or start fresh:
git stash drop
git reset --hard origin/main
```

---

## 📊 Update Schedule

### Recommended Schedule

- **Security Updates:** Apply immediately
- **Bug Fixes:** Weekly or bi-weekly
- **Feature Updates:** Monthly
- **Major Versions:** Test thoroughly before applying

### Monitoring for Updates

```bash
# Check for updates
git fetch origin
git log HEAD..origin/main --oneline

# See what changed
git diff HEAD..origin/main

# Check releases
# Visit: https://github.com/cli1337/flomark/releases
```

### Automated Update Checks

Add to crontab:
```bash
crontab -e

# Check for updates daily at 2 AM
0 2 * * * cd /path/to/flomark && git fetch origin && \
  git log HEAD..origin/main --oneline > /tmp/flomark-updates.txt
```

---

## 🔐 Security Updates

### Critical Security Updates

If a security update is released:

1. **Read the advisory** - Understand the risk
2. **Backup immediately** - Protect your data
3. **Update ASAP** - Apply the fix quickly
4. **Verify** - Confirm vulnerability is patched
5. **Monitor** - Watch logs for suspicious activity

### Quick Security Update

```bash
# Fastest update path
./update-backend.sh
./update-frontend.sh
pm2 restart flomark-backend
systemctl restart nginx
```

---

## 📝 Version Management

### Check Current Version

```bash
# Backend version
cd backend && npm version

# Frontend version
cd frontend && npm version

# Git version
git describe --tags --always
```

### Update to Specific Version

```bash
# List available versions
git tag -l

# Update to specific version
git checkout v1.2.0
./update-backend.sh
./update-frontend.sh
```

### Stay on LTS (Long-Term Support)

```bash
# Checkout LTS branch
git checkout lts
git pull origin lts
```

---

## 🎯 Best Practices

### 1. Test Before Production

```bash
# Clone to test environment
git clone https://github.com/cli1337/flomark.git flomark-test
cd flomark-test
./update-backend.sh
./update-frontend.sh

# Test thoroughly, then update production
```

### 2. Keep Customizations Separate

```bash
# Use custom directories
frontend/src/custom/
backend/src/custom/

# Or use feature branches
git checkout -b my-customizations
# Make changes
git commit -am "My custom features"

# Update main
git checkout main
git pull origin main

# Merge
git checkout my-customizations
git merge main
```

### 3. Document Changes

```bash
# Keep a changelog
echo "$(date): Updated to v1.2.0" >> UPDATES.log
echo "- Added feature X" >> UPDATES.log
echo "- Fixed bug Y" >> UPDATES.log
```

### 4. Automate Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --db flomark --out ~/backups/mongo-$DATE
tar -czf ~/backups/uploads-$DATE.tar.gz backend/uploads
cp backend/.env ~/backups/.env-$DATE

# Delete backups older than 30 days
find ~/backups -name "mongo-*" -mtime +30 -delete
find ~/backups -name "uploads-*" -mtime +30 -delete
```

---

## 🆘 Emergency Rollback

### Complete Rollback Procedure

```bash
# 1. Stop services
pm2 stop flomark-backend
systemctl stop nginx

# 2. Restore from backup
BACKUP_DATE="20241010-120000"

# Restore backend
cp -r backups/backend-$BACKUP_DATE/src/* backend/src/
cp backups/backend-$BACKUP_DATE/.env backend/.env

# Restore frontend
cp -r backups/frontend-$BACKUP_DATE/src/* frontend/src/
cd frontend && pnpm build && cd ..

# Restore database (if needed)
mongorestore --db flomark --drop ~/backups/mongo-20241010/flomark

# 3. Restart services
pm2 start flomark-backend
systemctl start nginx

# 4. Verify
curl http://localhost/api/health
```

---

## 📚 Additional Resources

- **Release Notes:** https://github.com/cli1337/flomark/releases
- **Changelog:** Check CHANGELOG.md in repository
- **Migration Guides:** Check docs/ directory
- **Support:** https://github.com/cli1337/flomark/issues

---

## 💡 Tips for Smooth Updates

1. **Update during low-traffic periods**
2. **Read release notes before updating**
3. **Keep backups for at least 30 days**
4. **Test critical features after update**
5. **Monitor logs for 24 hours after update**
6. **Have rollback plan ready**
7. **Document any issues encountered**
8. **Share feedback with community**

---

**Stay updated, stay secure! 🔒**

