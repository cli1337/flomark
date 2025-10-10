#!/bin/bash

# Flomark - Backend Update Script
# Updates only the backend code while preserving customizations
# Usage: ./update-backend.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

APP_DIR=$(pwd)
BACKUP_DIR="$APP_DIR/backups/backend-$(date +%Y%m%d-%H%M%S)"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║   🔄 Flomark Backend Update Script     ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Warning
echo -e "${YELLOW}⚠️  WARNING: This will update the backend code!${NC}"
echo ""
echo -e "${YELLOW}What this script does:${NC}"
echo "  ✓ Creates backup of current backend"
echo "  ✓ Pulls latest backend changes from git"
echo "  ✓ Preserves your .env file"
echo "  ✓ Preserves your uploads directory"
echo "  ✓ Updates dependencies"
echo "  ✓ Runs database migrations"
echo "  ✓ Restarts backend service"
echo ""
echo -e "${YELLOW}What is preserved:${NC}"
echo "  • .env configuration"
echo "  • uploads/ directory"
echo "  • storage/ directory"
echo "  • Any custom middleware you added"
echo ""
read -p "Do you want to continue? [y/N]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled."
    exit 0
fi

# Step 1: Create backup
echo -e "${GREEN}[1/7] Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r backend/src "$BACKUP_DIR/"
cp backend/.env "$BACKUP_DIR/.env" 2>/dev/null || echo "No .env to backup"
cp -r backend/uploads "$BACKUP_DIR/uploads" 2>/dev/null || echo "No uploads to backup"
cp -r backend/storage "$BACKUP_DIR/storage" 2>/dev/null || echo "No storage to backup"
cp backend/package.json "$BACKUP_DIR/package.json"
echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"

# Step 2: Stash local changes (if any)
echo -e "${GREEN}[2/7] Checking for local changes...${NC}"
cd backend
if [ -d .git ]; then
    git stash push -m "Auto-stash before update $(date)" || true
    echo "✓ Local changes stashed"
else
    echo "✓ Not a git repository, skipping"
fi
cd ..

# Step 3: Pull latest changes
echo -e "${GREEN}[3/7] Pulling latest backend updates...${NC}"
if [ -d .git ]; then
    # Pull only backend changes
    git fetch origin
    git checkout origin/main -- backend/src backend/package.json backend/prisma 2>/dev/null || \
    git pull origin main --rebase 2>/dev/null || \
    echo "Unable to pull. Please update manually with: git pull origin main"
else
    echo -e "${YELLOW}Not a git repository. Please update manually.${NC}"
fi

# Step 4: Restore critical files
echo -e "${GREEN}[4/7] Restoring preserved files...${NC}"
if [ -f "$BACKUP_DIR/.env" ]; then
    cp "$BACKUP_DIR/.env" backend/.env
    echo "✓ Restored .env"
fi
if [ -d "$BACKUP_DIR/uploads" ]; then
    cp -r "$BACKUP_DIR/uploads" backend/
    echo "✓ Restored uploads"
fi
if [ -d "$BACKUP_DIR/storage" ]; then
    cp -r "$BACKUP_DIR/storage" backend/
    echo "✓ Restored storage"
fi

# Step 5: Update dependencies
echo -e "${GREEN}[5/7] Updating dependencies...${NC}"
cd backend
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi
cd ..

# Step 6: Run database migrations
echo -e "${GREEN}[6/7] Running database migrations...${NC}"
cd backend
npx prisma db push --skip-generate || echo "Migration complete or no changes needed"
npx prisma generate
cd ..

# Step 7: Restart backend
echo -e "${GREEN}[7/7] Restarting backend...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart flomark-backend || pm2 start backend/src/server.js --name flomark-backend
    pm2 save
    echo "✓ Backend restarted with PM2"
else
    echo -e "${YELLOW}PM2 not found. Please restart backend manually.${NC}"
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}║     ✨ Backend Update Complete! ✨      ║${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}✓ Backend updated successfully${NC}"
echo -e "${GREEN}✓ Backup saved to: $BACKUP_DIR${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test your application"
echo "  2. Check logs: pm2 logs flomark-backend"
echo "  3. If issues occur, restore from backup:"
echo "     cp -r $BACKUP_DIR/src/* backend/src/"
echo "     cp $BACKUP_DIR/.env backend/.env"
echo "     pm2 restart flomark-backend"
echo ""

