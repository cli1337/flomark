#!/bin/bash

# ==================================
# Flomark Installation Script
# ==================================
# This script will install and configure Flomark on your server
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
    print_error "Please run this script as root (sudo ./install.sh)"
    exit 1
fi

print_header "🚀 Flomark Installation Script"
echo ""

# ==================================
# Check for existing installation
# ==================================
print_info "Checking for existing Flomark installation..."
if systemctl is-active --quiet flomark-backend 2>/dev/null; then
    print_error "Flomark is already installed and running on this server!"
    echo ""
    echo "Only one Flomark instance can run per server."
    echo "To update your existing installation, use: sudo ./update.sh"
    echo "To reinstall, first remove the existing installation:"
    echo "  sudo systemctl stop flomark-backend"
    echo "  sudo systemctl disable flomark-backend"
    echo "  sudo rm /etc/systemd/system/flomark-backend.service"
    echo "  sudo systemctl daemon-reload"
    echo ""
    exit 1
fi
print_success "No existing installation found. Proceeding..."
echo ""

# ==================================
# Collect user input
# ==================================
print_header "📝 Configuration"
echo ""

# Package manager selection
print_info "Detecting available package managers..."
PKG_MANAGER_OPTIONS=""

if command -v pnpm &> /dev/null; then
    print_success "Found pnpm: $(pnpm --version)"
    PKG_MANAGER_OPTIONS="pnpm"
fi

if command -v npm &> /dev/null; then
    print_success "Found npm: $(npm --version)"
    if [ -z "$PKG_MANAGER_OPTIONS" ]; then
        PKG_MANAGER_OPTIONS="npm"
    else
        PKG_MANAGER_OPTIONS="both"
    fi
fi

if [ -z "$PKG_MANAGER_OPTIONS" ]; then
    print_error "Neither npm nor pnpm found. Please install Node.js first."
    exit 1
fi

if [ "$PKG_MANAGER_OPTIONS" = "both" ]; then
    while true; do
        read -p "$(echo -e ${CYAN}Choose package manager [npm/pnpm]:${NC} )" PKG_MANAGER
        PKG_MANAGER=$(echo "$PKG_MANAGER" | tr '[:upper:]' '[:lower:]')
        if [[ "$PKG_MANAGER" == "npm" ]] || [[ "$PKG_MANAGER" == "pnpm" ]]; then
            break
        else
            print_error "Invalid choice. Please enter 'npm' or 'pnpm'"
        fi
    done
elif [ "$PKG_MANAGER_OPTIONS" = "pnpm" ]; then
    PKG_MANAGER="pnpm"
    print_success "Using pnpm"
else
    PKG_MANAGER="npm"
    print_success "Using npm"
fi
echo ""

# Web server selection
while true; do
    read -p "$(echo -e ${CYAN}Select web server [apache/nginx]:${NC} )" WEBSERVER
    WEBSERVER=$(echo "$WEBSERVER" | tr '[:upper:]' '[:lower:]')
    if [[ "$WEBSERVER" == "apache" ]] || [[ "$WEBSERVER" == "nginx" ]]; then
        break
    else
        print_error "Invalid choice. Please enter 'apache' or 'nginx'"
    fi
done

# Installation path
read -p "$(echo -e ${CYAN}Enter installation path [/var/www/flomark]:${NC} )" INSTALL_PATH
INSTALL_PATH=${INSTALL_PATH:-/var/www/flomark}

# Domain or IP
read -p "$(echo -e ${CYAN}Enter domain name [press Enter for local IP]:${NC} )" DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN=$(hostname -I | awk '{print $1}')
    print_info "Using local IP: $DOMAIN"
fi

# Frontend port
read -p "$(echo -e ${CYAN}Enter frontend port [80]:${NC} )" FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-80}

# Backend port
read -p "$(echo -e ${CYAN}Enter backend port [5000]:${NC} )" BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-5000}

# Demo mode
while true; do
    read -p "$(echo -e ${CYAN}Enable demo mode? [y/n]:${NC} )" DEMO_MODE
    DEMO_MODE=$(echo "$DEMO_MODE" | tr '[:upper:]' '[:lower:]')
    if [[ "$DEMO_MODE" == "y" ]] || [[ "$DEMO_MODE" == "yes" ]]; then
        DEMO_MODE=true
        break
    elif [[ "$DEMO_MODE" == "n" ]] || [[ "$DEMO_MODE" == "no" ]]; then
        DEMO_MODE=false
        break
    else
        print_error "Invalid choice. Please enter 'y' or 'n'"
    fi
done

# Admin credentials (if not demo mode)
if [ "$DEMO_MODE" = false ]; then
    echo ""
    print_info "Admin account setup"
    read -p "$(echo -e ${CYAN}Admin first name:${NC} )" ADMIN_FIRST_NAME
    read -p "$(echo -e ${CYAN}Admin last name:${NC} )" ADMIN_LAST_NAME
    read -p "$(echo -e ${CYAN}Admin email:${NC} )" ADMIN_EMAIL
    
    while true; do
        read -sp "$(echo -e ${CYAN}Admin password:${NC} )" ADMIN_PASSWORD
        echo ""
        read -sp "$(echo -e ${CYAN}Confirm password:${NC} )" ADMIN_PASSWORD_CONFIRM
        echo ""
        if [ "$ADMIN_PASSWORD" = "$ADMIN_PASSWORD_CONFIRM" ]; then
            break
        else
            print_error "Passwords do not match. Please try again."
        fi
    done
fi

echo ""
print_header "📦 Installation Summary"
echo ""
echo "Package Manager:  $PKG_MANAGER"
echo "Web Server:       $WEBSERVER"
echo "Install Path:     $INSTALL_PATH"
echo "Domain/IP:        $DOMAIN"
echo "Frontend Port:    $FRONTEND_PORT"
echo "Backend Port:     $BACKEND_PORT"
echo "Demo Mode:        $DEMO_MODE"
if [ "$DEMO_MODE" = false ]; then
    echo "Admin Email:      $ADMIN_EMAIL"
fi
echo ""
read -p "$(echo -e ${CYAN}Proceed with installation? [y/n]:${NC} )" CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    print_warning "Installation cancelled."
    exit 0
fi

# ==================================
# Install dependencies
# ==================================
echo ""
print_header "📦 Installing System Dependencies"

print_info "Updating package lists..."
apt-get update -qq

print_info "Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
print_success "Node.js $(node --version) installed"

if [ "$PKG_MANAGER" = "pnpm" ]; then
    print_info "Installing pnpm..."
    if ! command -v pnpm &> /dev/null; then
        npm install -g pnpm
    fi
    print_success "pnpm installed"
fi

print_info "Installing MongoDB (if not demo mode)..."
if [ "$DEMO_MODE" = false ]; then
    if ! command -v mongod &> /dev/null; then
        wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        apt-get update -qq
        apt-get install -y mongodb-org
        systemctl start mongod
        systemctl enable mongod
        print_success "MongoDB installed and started"
    else
        print_success "MongoDB already installed"
    fi
else
    print_info "Skipping MongoDB (demo mode enabled)"
fi

print_info "Installing web server ($WEBSERVER)..."
if [ "$WEBSERVER" = "apache" ]; then
    apt-get install -y apache2
    a2enmod proxy proxy_http proxy_wstunnel rewrite headers
    systemctl enable apache2
    print_success "Apache installed"
else
    apt-get install -y nginx
    systemctl enable nginx
    print_success "Nginx installed"
fi

# ==================================
# Copy files to installation directory
# ==================================
echo ""
print_header "📁 Setting Up Application Files"

print_info "Creating installation directory: $INSTALL_PATH"
mkdir -p "$INSTALL_PATH"

print_info "Getting current script directory..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

# Check if we're already in the installation directory
if [ "$SCRIPT_DIR" != "$INSTALL_PATH" ]; then
    # Copy backend
    print_info "Copying backend files..."
    cp -r "$SCRIPT_DIR/backend" "$INSTALL_PATH/"
else
    print_info "Already in installation directory, skipping file copy..."
fi

# Build frontend
print_info "Building frontend for production..."
cd "$SCRIPT_DIR/frontend"

# Install dependencies based on package manager
if [ "$PKG_MANAGER" = "pnpm" ]; then
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile
    else
        print_info "No pnpm lockfile found, installing dependencies..."
        pnpm install
    fi
else
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        print_info "No npm lockfile found, installing dependencies..."
        npm install
    fi
fi

# Update vite config with custom backend port
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
    pnpm run build
else
    npm run build
fi
print_success "Frontend built successfully"

# Copy built frontend
print_info "Copying built frontend..."
mkdir -p "$INSTALL_PATH/frontend"
cp -r dist/* "$INSTALL_PATH/frontend/"

cd "$SCRIPT_DIR"

# Clean up unnecessary files from installation
print_info "Removing unnecessary files from installation..."
rm -rf "$INSTALL_PATH/backend/node_modules"
cd "$INSTALL_PATH/backend"

# ==================================
# Configure backend
# ==================================
print_info "Installing backend dependencies..."
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

print_info "Generating JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

print_info "Creating .env file..."
cat > .env << EOF
# ==================================
# 🔐 DATABASE CONFIGURATION
# ==================================
DATABASE_URL=mongodb://localhost:27017/flomark

# ==================================
# 🔑 JWT AUTHENTICATION
# ==================================
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# ==================================
# 🌐 SERVER CONFIGURATION
# ==================================
PORT=$BACKEND_PORT
BACKEND_URL=http://$DOMAIN:$BACKEND_PORT

# ==================================
# 🎭 DEMO MODE CONFIGURATION
# ==================================
DEMO_MODE=$DEMO_MODE

# ==================================
# 📧 EMAIL/SMTP CONFIGURATION (Optional)
# ==================================
# Configure these if you want email functionality
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=Flomark
SMTP_FROM_EMAIL=
EOF

print_success ".env file created"

# Generate Prisma Client (required for both demo and production mode)
print_info "Generating Prisma Client..."
npx prisma generate
print_success "Prisma Client generated"

# Initialize database (only for production mode)
if [ "$DEMO_MODE" = false ]; then
    print_info "Initializing database..."
    npx prisma db push
    print_success "Database initialized"
fi

# Create admin user if not demo mode
if [ "$DEMO_MODE" = false ]; then
    print_info "Creating admin user..."
    node << EOF
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', 10);
        const user = await prisma.user.create({
            data: {
                firstName: '$ADMIN_FIRST_NAME',
                lastName: '$ADMIN_LAST_NAME',
                email: '$ADMIN_EMAIL',
                password: hashedPassword,
                role: 'admin',
            },
        });
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}

createAdmin();
EOF
    print_success "Admin user created"
fi

# ==================================
# Create systemd service
# ==================================
echo ""
print_header "⚙️  Setting Up System Service"

print_info "Creating systemd service..."
cat > /etc/systemd/system/flomark-backend.service << EOF
[Unit]
Description=Flomark Backend Server
After=network.target
$([ "$DEMO_MODE" = false ] && echo "After=mongod.service")

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_PATH/backend
ExecStart=$(which node) src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

print_info "Reloading systemd daemon..."
systemctl daemon-reload

print_info "Enabling and starting Flomark backend..."
systemctl enable flomark-backend
systemctl start flomark-backend

# Wait for backend to start
sleep 3

if systemctl is-active --quiet flomark-backend; then
    print_success "Flomark backend is running"
else
    print_error "Flomark backend failed to start"
    echo "Check logs with: journalctl -u flomark-backend -n 50"
    exit 1
fi

# ==================================
# Configure web server
# ==================================
echo ""
print_header "🌐 Configuring Web Server"

if [ "$WEBSERVER" = "apache" ]; then
    print_info "Configuring Apache..."
    cat > /etc/apache2/sites-available/flomark.conf << EOF
<VirtualHost *:$FRONTEND_PORT>
    ServerName $DOMAIN
    DocumentRoot $INSTALL_PATH/frontend

    <Directory $INSTALL_PATH/frontend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API requests to backend
    ProxyPreserveHost On
    ProxyPass /api http://localhost:$BACKEND_PORT/api
    ProxyPassReverse /api http://localhost:$BACKEND_PORT/api

    # WebSocket proxy for Socket.IO
    ProxyPass /socket.io http://localhost:$BACKEND_PORT/socket.io
    ProxyPassReverse /socket.io http://localhost:$BACKEND_PORT/socket.io
    
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:$BACKEND_PORT/\$1" [P,L]

    ErrorLog \${APACHE_LOG_DIR}/flomark-error.log
    CustomLog \${APACHE_LOG_DIR}/flomark-access.log combined
</VirtualHost>
EOF

    # Update port if not 80
    if [ "$FRONTEND_PORT" != "80" ]; then
        if ! grep -q "Listen $FRONTEND_PORT" /etc/apache2/ports.conf; then
            echo "Listen $FRONTEND_PORT" >> /etc/apache2/ports.conf
        fi
    fi

    a2ensite flomark.conf
    a2dissite 000-default.conf 2>/dev/null || true
    systemctl restart apache2
    print_success "Apache configured and restarted"

else
    print_info "Configuring Nginx..."
    cat > /etc/nginx/sites-available/flomark << EOF
server {
    listen $FRONTEND_PORT;
    server_name $DOMAIN;

    root $INSTALL_PATH/frontend;
    index index.html;

    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Socket.IO proxy
    location /socket.io {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    access_log /var/log/nginx/flomark-access.log;
    error_log /var/log/nginx/flomark-error.log;
}
EOF

    ln -sf /etc/nginx/sites-available/flomark /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx
    print_success "Nginx configured and restarted"
fi

# ==================================
# Create update script
# ==================================
echo ""
print_info "Creating update script..."
cat > "$INSTALL_PATH/update.sh" << 'UPDATEEOF'
#!/bin/bash

# Flomark Update Script
# This script updates Flomark to the latest version

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header() {
    echo -e "${MAGENTA}================================${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}================================${NC}"
}

if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (sudo ./update.sh)"
    exit 1
fi

print_header "🔄 Flomark Update Script"
echo ""

INSTALL_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
TEMP_DIR="/tmp/flomark-update-$(date +%s)"

print_info "Creating temporary directory..."
mkdir -p "$TEMP_DIR"

print_info "Cloning latest version from repository..."
git clone --depth 1 https://github.com/cli1337/flomark.git "$TEMP_DIR"

print_info "Backing up current .env file..."
cp "$INSTALL_PATH/backend/.env" "$TEMP_DIR/backend/.env.backup"

print_info "Stopping Flomark backend..."
systemctl stop flomark-backend

print_info "Updating backend..."
rm -rf "$INSTALL_PATH/backend/src"
rm -rf "$INSTALL_PATH/backend/scripts"
cp -r "$TEMP_DIR/backend/src" "$INSTALL_PATH/backend/"
cp -r "$TEMP_DIR/backend/scripts" "$INSTALL_PATH/backend/"
cp "$TEMP_DIR/backend/package.json" "$INSTALL_PATH/backend/"

cd "$INSTALL_PATH/backend"

# Detect which package manager to use
if command -v pnpm &> /dev/null && [ -f "pnpm-lock.yaml" ]; then
    pnpm install --prod --frozen-lockfile
elif command -v pnpm &> /dev/null; then
    pnpm install --prod
elif [ -f "package-lock.json" ]; then
    npm ci --omit=dev
else
    npm install --omit=dev
fi

print_info "Restoring .env file..."
mv "$TEMP_DIR/backend/.env.backup" "$INSTALL_PATH/backend/.env"

print_info "Building new frontend..."
cd "$TEMP_DIR/frontend"

# Detect which package manager to use
if command -v pnpm &> /dev/null && [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile
    pnpm run build
elif command -v pnpm &> /dev/null; then
    pnpm install
    pnpm run build
elif [ -f "package-lock.json" ]; then
    npm ci
    npm run build
else
    npm install
    npm run build
fi

print_info "Updating frontend..."
rm -rf "$INSTALL_PATH/frontend"/*
cp -r dist/* "$INSTALL_PATH/frontend/"

print_info "Starting Flomark backend..."
systemctl start flomark-backend

sleep 3

if systemctl is-active --quiet flomark-backend; then
    print_success "Flomark backend is running"
else
    print_error "Flomark backend failed to start"
    echo "Check logs with: journalctl -u flomark-backend -n 50"
    exit 1
fi

print_info "Cleaning up..."
rm -rf "$TEMP_DIR"

echo ""
print_header "✨ Update Complete!"
echo ""
print_success "Flomark has been updated successfully!"
echo ""
UPDATEEOF

chmod +x "$INSTALL_PATH/update.sh"
print_success "Update script created at $INSTALL_PATH/update.sh"

# ==================================
# Installation complete
# ==================================
echo ""
print_header "✨ Installation Complete!"
echo ""
print_success "Flomark has been installed successfully!"
echo ""
echo "Access your application at:"
if [ "$FRONTEND_PORT" = "80" ]; then
    echo "  🌐 http://$DOMAIN"
else
    echo "  🌐 http://$DOMAIN:$FRONTEND_PORT"
fi
echo ""
if [ "$DEMO_MODE" = true ]; then
    echo "Demo Mode Credentials:"
    echo "  📧 Email: demo@flomark.app"
    echo "  🔑 Password: demo"
else
    echo "Admin Credentials:"
    echo "  📧 Email: $ADMIN_EMAIL"
    echo "  🔑 Password: (the one you entered)"
fi
echo ""
echo "Useful commands:"
echo "  Check status:   systemctl status flomark-backend"
echo "  View logs:      journalctl -u flomark-backend -f"
echo "  Restart:        systemctl restart flomark-backend"
echo "  Update:         sudo $INSTALL_PATH/update.sh"
echo ""
print_info "Edit configuration: $INSTALL_PATH/backend/.env"
echo ""

