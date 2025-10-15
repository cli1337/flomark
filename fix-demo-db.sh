#!/bin/bash

# ==================================
# Quick Fix for Demo Mode & SQLite Permissions
# ==================================

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Flomark Quick Fix Script${NC}"
echo ""

# Find your installation path
INSTALL_PATH="/var/www/flomark-demo"

# Check if path exists
if [ ! -d "$INSTALL_PATH/backend" ]; then
    echo "Installation not found at $INSTALL_PATH"
    read -p "Enter your Flomark installation path: " INSTALL_PATH
fi

echo -e "${GREEN}✓ Found installation at: $INSTALL_PATH${NC}"
echo ""

# Fix 1: Disable Demo Mode
echo "Fixing demo mode..."
cd "$INSTALL_PATH/backend"

if grep -q "^DEMO_MODE=" .env; then
    # Update existing DEMO_MODE
    sed -i 's/^DEMO_MODE=.*/DEMO_MODE=false/' .env
    echo -e "${GREEN}✓ Demo mode set to false${NC}"
else
    # Add DEMO_MODE if it doesn't exist
    echo "" >> .env
    echo "# ===================================" >> .env
    echo "# 🎭 DEMO MODE CONFIGURATION" >> .env
    echo "# ===================================" >> .env
    echo "DEMO_MODE=false" >> .env
    echo -e "${GREEN}✓ Demo mode added and set to false${NC}"
fi

# Fix 2: Fix SQLite permissions (if using SQLite)
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)
if [[ "$DATABASE_URL" == file:* ]]; then
    DB_FILE=$(echo "$DATABASE_URL" | sed 's/file://')
    echo ""
    echo "Fixing SQLite database permissions..."
    
    if [ -f "$DB_FILE" ]; then
        chmod 666 "$DB_FILE"
        chmod 755 "$(dirname "$DB_FILE")"
        echo -e "${GREEN}✓ Database file permissions fixed${NC}"
        echo "  File: $DB_FILE (666)"
        echo "  Directory: $(dirname "$DB_FILE") (755)"
    else
        echo "Database file not found at: $DB_FILE"
        echo "Run: npx prisma db push"
    fi
else
    echo "Not using SQLite, skipping database permissions fix"
fi

# Restart backend service
echo ""
echo "Restarting Flomark backend..."
systemctl restart flomark-backend

sleep 2

if systemctl is-active --quiet flomark-backend; then
    echo -e "${GREEN}✓ Flomark backend restarted successfully${NC}"
else
    echo "Backend failed to start. Check logs with: journalctl -u flomark-backend -n 50"
fi

echo ""
echo -e "${GREEN}✨ Fixes applied!${NC}"
echo ""
echo "Changes made:"
echo "  1. Demo mode disabled (DEMO_MODE=false)"
echo "  2. SQLite permissions fixed (if applicable)"
echo "  3. Backend service restarted"
echo ""
echo "You can now modify data in your Flomark installation!"

