#!/bin/bash

# ==================================
# Flomark Update Script
# ==================================
# This script updates Flomark to the latest version
# ==================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header() {
    echo -e "${MAGENTA}================================${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}================================${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run this script as root (sudo ./update.sh)"
    exit 1
fi

print_header "🔄 Flomark Update Script"
echo ""

# ==================================
# Detect package manager
# ==================================
print_info "Detecting package manager..."
PKG_MANAGER=""

# Check if user has preference
if command -v pnpm &> /dev/null; then
    print_info "Found pnpm: $(pnpm --version)"
    PKG_MANAGER_AVAILABLE="pnpm"
fi

if command -v npm &> /dev/null; then
    print_info "Found npm: $(npm --version)"
    if [ -z "$PKG_MANAGER_AVAILABLE" ]; then
        PKG_MANAGER_AVAILABLE="npm"
    else
        PKG_MANAGER_AVAILABLE="both"
    fi
fi

# Let user choose if both are available
if [ "$PKG_MANAGER_AVAILABLE" = "both" ]; then
    while true; do
        read -p "$(echo -e ${CYAN}Choose package manager [npm/pnpm]:${NC} )" PKG_MANAGER
        PKG_MANAGER=$(echo "$PKG_MANAGER" | tr '[:upper:]' '[:lower:]')
        if [[ "$PKG_MANAGER" == "npm" ]] || [[ "$PKG_MANAGER" == "pnpm" ]]; then
            break
        else
            print_error "Invalid choice. Please enter 'npm' or 'pnpm'"
        fi
    done
elif [ "$PKG_MANAGER_AVAILABLE" = "pnpm" ]; then
    PKG_MANAGER="pnpm"
    print_success "Using pnpm"
elif [ "$PKG_MANAGER_AVAILABLE" = "npm" ]; then
    PKG_MANAGER="npm"
    print_success "Using npm"
else
    print_error "Neither npm nor pnpm found. Please install Node.js first."
    exit 1
fi

# ==================================
# Find installation directory
# ==================================
print_info "Detecting Flomark installation..."

INSTALL_PATH=""
if systemctl is-active --quiet flomark-backend 2>/dev/null; then
    # Get installation path from systemd service
    INSTALL_PATH=$(systemctl show -p WorkingDirectory flomark-backend | cut -d= -f2)
    INSTALL_PATH=$(dirname "$INSTALL_PATH")
    print_success "Found installation at: $INSTALL_PATH"
else
    print_error "Flomark backend service not found!"
    echo ""
    echo "Please ensure Flomark is installed or provide installation path:"
    read -p "$(echo -e ${CYAN}Enter Flomark installation path:${NC} )" INSTALL_PATH
    
    if [ ! -d "$INSTALL_PATH/backend" ]; then
        print_error "Invalid installation path. Backend directory not found."
        exit 1
    fi
fi

# ==================================
# Backup current installation
# ==================================
echo ""
print_info "Creating backup of current installation..."
BACKUP_DIR="/tmp/flomark-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_info "Backing up .env file..."
if [ -f "$INSTALL_PATH/backend/.env" ]; then
    cp "$INSTALL_PATH/backend/.env" "$BACKUP_DIR/.env"
    print_success ".env backed up"
else
    print_warning ".env file not found, skipping backup"
fi

print_info "Backing up storage directory..."
if [ -d "$INSTALL_PATH/backend/storage" ]; then
    cp -r "$INSTALL_PATH/backend/storage" "$BACKUP_DIR/"
    print_success "Storage backed up"
fi

# ==================================
# Download latest version
# ==================================
echo ""
print_header "📥 Downloading Latest Version"

TEMP_DIR="/tmp/flomark-update-$(date +%s)"
print_info "Creating temporary directory..."
mkdir -p "$TEMP_DIR"

print_info "Cloning latest version from repository..."
if ! git clone --depth 1 https://github.com/cli1337/flomark.git "$TEMP_DIR" 2>/dev/null; then
    print_error "Failed to download latest version"
    echo ""
    echo "Please check your internet connection and try again."
    rm -rf "$TEMP_DIR"
    exit 1
fi
print_success "Latest version downloaded"

# ==================================
# Get backend port from current .env
# ==================================
BACKEND_PORT=5000
if [ -f "$INSTALL_PATH/backend/.env" ]; then
    BACKEND_PORT=$(grep "^PORT=" "$INSTALL_PATH/backend/.env" | cut -d'=' -f2 || echo "5000")
fi

# ==================================
# Stop services
# ==================================
echo ""
print_header "🛑 Stopping Services"

print_info "Stopping Flomark backend..."
systemctl stop flomark-backend
print_success "Backend stopped"

# ==================================
# Update backend
# ==================================
echo ""
print_header "🔧 Updating Backend"

print_info "Removing old backend code..."
rm -rf "$INSTALL_PATH/backend/src"
rm -rf "$INSTALL_PATH/backend/scripts"
rm -f "$INSTALL_PATH/backend/package.json"
rm -f "$INSTALL_PATH/backend/package-lock.json"
rm -rf "$INSTALL_PATH/backend/node_modules"

print_info "Copying new backend files..."
cp -r "$TEMP_DIR/backend/src" "$INSTALL_PATH/backend/"
cp -r "$TEMP_DIR/backend/scripts" "$INSTALL_PATH/backend/"
cp "$TEMP_DIR/backend/package.json" "$INSTALL_PATH/backend/"
cp "$TEMP_DIR/backend/prisma" "$INSTALL_PATH/backend/" -r 2>/dev/null || true

print_info "Installing backend dependencies..."
cd "$INSTALL_PATH/backend"

if [ "$PKG_MANAGER" = "pnpm" ]; then
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --prod --frozen-lockfile
    else
        pnpm install --prod
    fi
else
    if [ -f "package-lock.json" ]; then
        npm ci --omit=dev
    else
        npm install --omit=dev
    fi
fi
print_success "Backend dependencies installed"

print_info "Restoring .env file..."
cp "$BACKUP_DIR/.env" "$INSTALL_PATH/backend/.env"
print_success ".env restored"

print_info "Restoring storage directory..."
if [ -d "$BACKUP_DIR/storage" ]; then
    cp -r "$BACKUP_DIR/storage"/* "$INSTALL_PATH/backend/storage/" 2>/dev/null || true
fi

# Generate Prisma Client (always required)
print_info "Generating Prisma Client..."
npx prisma generate
print_success "Prisma Client generated"

# Update database schema if needed (only for production)
DEMO_MODE=$(grep "^DEMO_MODE=" "$INSTALL_PATH/backend/.env" | cut -d'=' -f2 || echo "false")
if [ "$DEMO_MODE" != "true" ]; then
    print_info "Updating database schema..."
    npx prisma db push
    print_success "Database schema updated"
fi

# ==================================
# Update frontend
# ==================================
echo ""
print_header "🎨 Updating Frontend"

print_info "Building new frontend..."
cd "$TEMP_DIR/frontend"

# Update vite config with backend port from .env
print_info "Configuring frontend with backend port $BACKEND_PORT..."
cat > vite.config.js << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    allowedHosts: ['127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:$BACKEND_PORT',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
EOF

if [ "$PKG_MANAGER" = "pnpm" ]; then
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile
    else
        pnpm install
    fi
    pnpm run build
else
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    npm run build
fi
print_success "Frontend built"

print_info "Updating frontend files..."
rm -rf "$INSTALL_PATH/frontend"/*
cp -r dist/* "$INSTALL_PATH/frontend/"
print_success "Frontend updated"

# ==================================
# Start services
# ==================================
echo ""
print_header "🚀 Starting Services"

print_info "Starting Flomark backend..."
systemctl start flomark-backend

# Wait for backend to start
sleep 3

if systemctl is-active --quiet flomark-backend; then
    print_success "Flomark backend is running"
else
    print_error "Flomark backend failed to start"
    echo ""
    echo "Attempting to restore from backup..."
    
    # Restore backup
    systemctl stop flomark-backend
    cp "$BACKUP_DIR/.env" "$INSTALL_PATH/backend/.env"
    cp -r "$BACKUP_DIR/storage"/* "$INSTALL_PATH/backend/storage/" 2>/dev/null || true
    systemctl start flomark-backend
    
    print_error "Update failed. Backup restored."
    echo "Check logs with: journalctl -u flomark-backend -n 50"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# ==================================
# Cleanup
# ==================================
echo ""
print_info "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
print_success "Cleanup complete"

print_info "Backup location: $BACKUP_DIR"
print_warning "You can remove the backup after verifying everything works correctly"

# ==================================
# Update complete
# ==================================
echo ""
print_header "✨ Update Complete!"
echo ""
print_success "Flomark has been updated successfully!"
echo ""
echo "Useful commands:"
echo "  Check status:   systemctl status flomark-backend"
echo "  View logs:      journalctl -u flomark-backend -f"
echo "  Restart:        systemctl restart flomark-backend"
echo ""
print_info "If you encounter any issues, restore from: $BACKUP_DIR"
echo ""

