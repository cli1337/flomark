#!/bin/bash

# ==================================
# Flomark Uninstall Script
# ==================================
# Safely remove Flomark from your system
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
    print_error "Please run this script as root (sudo bash uninstall.sh)"
    exit 1
fi

print_header "🗑️  Flomark Uninstall Script"
echo ""
print_warning "This script will remove Flomark from your system"
echo ""

# ==================================
# Find installation directory
# ==================================
print_info "Detecting Flomark installation..."

INSTALL_PATH=""
if systemctl is-active --quiet flomark-backend 2>/dev/null; then
    # Get installation path from systemd service
    INSTALL_PATH=$(systemctl show -p WorkingDirectory flomark-backend 2>/dev/null | cut -d= -f2)
    if [ -n "$INSTALL_PATH" ] && [ -d "$INSTALL_PATH" ]; then
        INSTALL_PATH=$(dirname "$INSTALL_PATH")
        print_success "Found installation at: $INSTALL_PATH"
    fi
fi

# Ask for installation path if not found
if [ -z "$INSTALL_PATH" ] || [ ! -d "$INSTALL_PATH" ]; then
    echo ""
    print_info "Could not auto-detect installation path"
    read -p "$(echo -e ${CYAN}Enter Flomark installation path [/var/www/flomark]:${NC} )" INSTALL_PATH
    INSTALL_PATH=${INSTALL_PATH:-/var/www/flomark}
    
    if [ ! -d "$INSTALL_PATH" ]; then
        print_error "Installation path does not exist: $INSTALL_PATH"
        exit 1
    fi
fi

# ==================================
# Display what will be removed
# ==================================
echo ""
print_header "📋 Uninstall Summary"
echo ""
print_info "The following will be checked and removed if found:"
echo "  • Systemd service: flomark-backend"
echo "  • Systemd service: flomark-frontend"
echo "  • Nginx configuration (if exists)"
echo "  • Apache configuration (if exists)"
echo "  • Installation directory: $INSTALL_PATH"
echo ""

# Ask about database
DATABASE_URL=""
REMOVE_DATABASE=false
if [ -f "$INSTALL_PATH/backend/.env" ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" "$INSTALL_PATH/backend/.env" | cut -d'=' -f2- || echo "")
    
    if [[ "$DATABASE_URL" == file:* ]]; then
        echo ""
        print_warning "SQLite database detected"
        read -p "$(echo -e ${CYAN}Remove database file? [y/n]:${NC} )" REMOVE_DB
        if [[ "$REMOVE_DB" =~ ^[Yy]$ ]]; then
            REMOVE_DATABASE=true
            print_warning "Database will be DELETED"
        else
            print_info "Database will be kept"
        fi
    fi
fi

# Final confirmation
echo ""
print_warning "⚠️  THIS ACTION CANNOT BE UNDONE! ⚠️"
echo ""
read -p "$(echo -e ${CYAN}Are you sure you want to uninstall Flomark? [yes/no]:${NC} )" CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_info "Uninstall cancelled."
    exit 0
fi

# ==================================
# Create final backup
# ==================================
echo ""
print_header "💾 Creating Final Backup"

BACKUP_DIR="/tmp/flomark-uninstall-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_info "Backing up configuration and data..."
if [ -d "$INSTALL_PATH/backend" ]; then
    cp -r "$INSTALL_PATH/backend/.env" "$BACKUP_DIR/" 2>/dev/null || true
    cp -r "$INSTALL_PATH/backend/storage" "$BACKUP_DIR/" 2>/dev/null || true
fi

# Backup database if SQLite
if [[ "$DATABASE_URL" == file:* ]]; then
    DB_FILE=$(echo "$DATABASE_URL" | sed 's/file://')
    if [ -f "$DB_FILE" ]; then
        cp "$DB_FILE" "$BACKUP_DIR/database.db" 2>/dev/null || true
        print_success "Database backed up to: $BACKUP_DIR/database.db"
    fi
fi

print_success "Backup created at: $BACKUP_DIR"

# ==================================
# Stop services
# ==================================
echo ""
print_header "🛑 Stopping Services"

if systemctl is-active --quiet flomark-backend 2>/dev/null; then
    print_info "Stopping flomark-backend..."
    systemctl stop flomark-backend
    print_success "Backend stopped"
else
    print_info "Backend service not running"
fi

if systemctl is-active --quiet flomark-frontend 2>/dev/null; then
    print_info "Stopping flomark-frontend..."
    systemctl stop flomark-frontend
    print_success "Frontend stopped"
else
    print_info "Frontend service not running"
fi

# ==================================
# Remove systemd services
# ==================================
echo ""
print_header "🗑️  Removing Systemd Services"

if [ -f "/etc/systemd/system/flomark-backend.service" ]; then
    print_info "Removing backend service..."
    systemctl disable flomark-backend 2>/dev/null || true
    rm -f /etc/systemd/system/flomark-backend.service
    print_success "Backend service removed"
fi

if [ -f "/etc/systemd/system/flomark-frontend.service" ]; then
    print_info "Removing frontend service..."
    systemctl disable flomark-frontend 2>/dev/null || true
    rm -f /etc/systemd/system/flomark-frontend.service
    print_success "Frontend service removed"
fi

systemctl daemon-reload
print_success "Systemd services cleaned up"

# ==================================
# Remove web server configuration
# ==================================
echo ""
print_header "🌐 Removing Web Server Configuration"

# Remove Nginx configuration
NGINX_REMOVED=false
if [ -f "/etc/nginx/sites-enabled/flomark" ]; then
    print_info "Removing Nginx configuration..."
    rm -f /etc/nginx/sites-enabled/flomark
    rm -f /etc/nginx/sites-available/flomark
    nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || print_warning "Nginx reload failed (may not be running)"
    print_success "Nginx configuration removed"
    NGINX_REMOVED=true
fi

# Remove Apache configuration
APACHE_REMOVED=false
if [ -f "/etc/apache2/sites-enabled/flomark.conf" ]; then
    print_info "Removing Apache configuration..."
    a2dissite flomark 2>/dev/null || true
    rm -f /etc/apache2/sites-available/flomark.conf
    systemctl reload apache2 2>/dev/null || print_warning "Apache reload failed (may not be running)"
    print_success "Apache configuration removed"
    APACHE_REMOVED=true
fi

if [ "$NGINX_REMOVED" = false ] && [ "$APACHE_REMOVED" = false ]; then
    print_info "No web server configuration found"
fi

# ==================================
# Remove installation directory
# ==================================
echo ""
print_header "📁 Removing Installation Files"

print_info "Removing installation directory: $INSTALL_PATH"
rm -rf "$INSTALL_PATH"
print_success "Installation files removed"

# ==================================
# Remove database
# ==================================
if [ "$REMOVE_DATABASE" = true ] && [[ "$DATABASE_URL" == file:* ]]; then
    echo ""
    print_header "🗄️  Removing Database"
    
    DB_FILE=$(echo "$DATABASE_URL" | sed 's/file://')
    if [ -f "$DB_FILE" ]; then
        print_info "Removing database file: $DB_FILE"
        rm -f "$DB_FILE"
        print_success "Database removed"
    fi
fi

# ==================================
# Optional: Remove dependencies
# ==================================
echo ""
print_header "🧹 Optional Cleanup"
echo ""
print_info "Do you want to remove the following dependencies?"
echo "  • Node.js"
echo "  • npm/pnpm"
echo "  • Database server (MongoDB/PostgreSQL/MySQL)"
echo ""
read -p "$(echo -e ${CYAN}Remove dependencies? [y/n]:${NC} )" REMOVE_DEPS

if [[ "$REMOVE_DEPS" =~ ^[Yy]$ ]]; then
    echo ""
    print_warning "Removing dependencies..."
    
    # Remove Node.js
    if command -v node &> /dev/null; then
        print_info "Removing Node.js..."
        apt-get remove -y nodejs npm 2>/dev/null || true
        apt-get autoremove -y 2>/dev/null || true
        print_success "Node.js removed"
    fi
    
    # Remove pnpm
    if command -v pnpm &> /dev/null; then
        print_info "Removing pnpm..."
        npm uninstall -g pnpm 2>/dev/null || true
        print_success "pnpm removed"
    fi
    
    # Ask about database servers
    if command -v mongod &> /dev/null; then
        read -p "$(echo -e ${CYAN}Remove MongoDB? [y/n]:${NC} )" REMOVE_MONGO
        if [[ "$REMOVE_MONGO" =~ ^[Yy]$ ]]; then
            print_info "Removing MongoDB..."
            systemctl stop mongod 2>/dev/null || true
            apt-get remove -y mongodb-org* 2>/dev/null || true
            rm -rf /var/lib/mongodb
            rm -rf /var/log/mongodb
            print_success "MongoDB removed"
        fi
    fi
    
    if command -v psql &> /dev/null; then
        read -p "$(echo -e ${CYAN}Remove PostgreSQL? [y/n]:${NC} )" REMOVE_PG
        if [[ "$REMOVE_PG" =~ ^[Yy]$ ]]; then
            print_info "Removing PostgreSQL..."
            systemctl stop postgresql 2>/dev/null || true
            apt-get remove -y postgresql* 2>/dev/null || true
            rm -rf /var/lib/postgresql
            print_success "PostgreSQL removed"
        fi
    fi
    
    if command -v mysql &> /dev/null; then
        read -p "$(echo -e ${CYAN}Remove MySQL? [y/n]:${NC} )" REMOVE_MYSQL
        if [[ "$REMOVE_MYSQL" =~ ^[Yy]$ ]]; then
            print_info "Removing MySQL..."
            systemctl stop mysql 2>/dev/null || true
            apt-get remove -y mysql-server mysql-client 2>/dev/null || true
            rm -rf /var/lib/mysql
            print_success "MySQL removed"
        fi
    fi
else
    print_info "Dependencies kept"
fi

# ==================================
# Uninstall complete
# ==================================
echo ""
print_header "✨ Uninstall Complete!"
echo ""
print_success "Flomark has been successfully removed from your system"
echo ""
print_info "Backup location: $BACKUP_DIR"
print_warning "You can safely delete this backup when you no longer need it"
echo ""

if [ "$REMOVE_DATABASE" = false ] && [[ "$DATABASE_URL" == file:* ]]; then
    DB_FILE=$(echo "$DATABASE_URL" | sed 's/file://')
    echo ""
    print_info "Database was preserved at: $DB_FILE"
fi

echo ""
print_info "Thank you for using Flomark! 👋"
echo ""

