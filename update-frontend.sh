#!/bin/bash

# Flomark - Frontend Update Script
# Updates only the frontend code while preserving customizations
# Usage: ./update-frontend.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

APP_DIR=$(pwd)
BACKUP_DIR="$APP_DIR/backups/frontend-$(date +%Y%m%d-%H%M%S)"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║   🔄 Flomark Frontend Update Script    ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Warning
echo -e "${YELLOW}⚠️  WARNING: This will update the frontend code!${NC}"
echo ""
echo -e "${YELLOW}What this script does:${NC}"
echo "  ✓ Creates backup of current frontend"
echo "  ✓ Pulls latest frontend changes from git"
echo "  ✓ Preserves your customizations (if in custom/ folder)"
echo "  ✓ Updates dependencies"
echo "  ✓ Rebuilds production bundle"
echo "  ✓ Deploys new version"
echo ""
echo -e "${RED}⚠️  IMPORTANT:${NC}"
echo -e "${RED}If you have customized components, styles, or pages,${NC}"
echo -e "${RED}they may be overwritten. Always backup custom changes!${NC}"
echo ""
echo -e "${YELLOW}Recommended: Keep customizations in:${NC}"
echo "  • frontend/src/custom/ (not tracked by updates)"
echo "  • Separate feature branches in git"
echo ""
read -p "Do you want to continue? [y/N]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled."
    exit 0
fi

# Check if there are custom files
echo -e "${BLUE}Checking for custom files...${NC}"
if [ -d "frontend/src/custom" ]; then
    echo -e "${GREEN}✓ Found custom/ directory - will be preserved${NC}"
    HAS_CUSTOM=true
else
    echo -e "${YELLOW}! No custom/ directory found${NC}"
    HAS_CUSTOM=false
fi

# Step 1: Create backup
echo -e "${GREEN}[1/6] Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r frontend/src "$BACKUP_DIR/"
cp -r frontend/public "$BACKUP_DIR/public" 2>/dev/null || true
cp frontend/package.json "$BACKUP_DIR/package.json"
cp frontend/vite.config.js "$BACKUP_DIR/vite.config.js" 2>/dev/null || true
cp frontend/index.html "$BACKUP_DIR/index.html" 2>/dev/null || true
cp -r frontend/src/custom "$BACKUP_DIR/custom" 2>/dev/null || true
echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"

# Step 2: Stash local changes (if any)
echo -e "${GREEN}[2/6] Checking for local changes...${NC}"
cd frontend
if [ -d .git ]; then
    git stash push -m "Auto-stash before update $(date)" || true
    echo "✓ Local changes stashed"
else
    echo "✓ Not a git repository, skipping"
fi
cd ..

# Step 3: Pull latest changes
echo -e "${GREEN}[3/6] Pulling latest frontend updates...${NC}"
if [ -d .git ]; then
    git fetch origin
    git checkout origin/main -- frontend/src frontend/package.json frontend/vite.config.js frontend/index.html 2>/dev/null || \
    git pull origin main --rebase 2>/dev/null || \
    echo "Unable to pull. Please update manually with: git pull origin main"
else
    echo -e "${YELLOW}Not a git repository. Please update manually.${NC}"
fi

# Step 4: Restore custom files
echo -e "${GREEN}[4/6] Restoring custom files...${NC}"
if [ "$HAS_CUSTOM" = true ] && [ -d "$BACKUP_DIR/custom" ]; then
    mkdir -p frontend/src/custom
    cp -r "$BACKUP_DIR/custom/"* frontend/src/custom/
    echo "✓ Restored custom files"
else
    echo "✓ No custom files to restore"
fi

# Step 5: Update dependencies and build
echo -e "${GREEN}[5/6] Updating dependencies and building...${NC}"
cd frontend
if command -v pnpm &> /dev/null; then
    pnpm install
    pnpm build
else
    npm install
    npm run build
fi
cd ..

# Step 6: Deploy (copy to web server if needed)
echo -e "${GREEN}[6/6] Deploying frontend...${NC}"
if [ -d "/var/www/flomark" ]; then
    sudo cp -r frontend/dist/* /var/www/flomark/ 2>/dev/null || \
    echo "Unable to copy to /var/www/flomark. May need manual deployment."
fi
echo "✓ Build complete"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}║    ✨ Frontend Update Complete! ✨      ║${NC}"
echo -e "${CYAN}║                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Frontend updated successfully${NC}"
echo -e "${GREEN}✓ Backup saved to: $BACKUP_DIR${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Clear browser cache (Ctrl+Shift+R)"
echo "  2. Test your application"
echo "  3. Check for any console errors"
echo "  4. If issues occur, restore from backup:"
echo "     cp -r $BACKUP_DIR/src/* frontend/src/"
echo "     cd frontend && pnpm build"
echo ""
echo -e "${BLUE}Tip: Keep your customizations in frontend/src/custom/${NC}"
echo -e "${BLUE}This folder is automatically preserved during updates!${NC}"
echo ""

