#!/bin/bash

# Flomark - Nginx Installation Script
# This script sets up Nginx as a reverse proxy for the Flomark application
# Usage: sudo ./install-nginx.sh [domain-name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-localhost}
APP_DIR=$(pwd)
FRONTEND_BUILD_DIR="$APP_DIR/frontend/dist"
BACKEND_PORT=${2:-3000}
DEFAULT_BACKEND_PORT=3000
NGINX_CONF="/etc/nginx/sites-available/flomark"
NGINX_ENABLED="/etc/nginx/sites-enabled/flomark"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Flomark - Nginx Installation${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -i :$port &> /dev/null
        return $?
    elif command -v netstat &> /dev/null; then
        netstat -tuln | grep ":$port " &> /dev/null
        return $?
    elif command -v ss &> /dev/null; then
        ss -tuln | grep ":$port " &> /dev/null
        return $?
    else
        return 1
    fi
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while [ $port -lt 65535 ]; do
        if ! check_port $port; then
            echo $port
            return 0
        fi
        port=$((port + 1))
    done
    
    return 1
}

# Check backend port availability
echo -e "${YELLOW}Checking port availability...${NC}"
if check_port $BACKEND_PORT; then
    echo -e "${RED}⚠️  Port $BACKEND_PORT is already in use!${NC}"
    SUGGESTED_PORT=$(find_available_port $((BACKEND_PORT + 1)))
    if [ -n "$SUGGESTED_PORT" ]; then
        echo ""
        read -p "Use port $SUGGESTED_PORT instead? [Y/n]: " use_suggested
        if [[ $use_suggested =~ ^[Nn]$ ]]; then
            read -p "Enter custom port: " BACKEND_PORT
        else
            BACKEND_PORT=$SUGGESTED_PORT
        fi
    else
        read -p "Enter custom port: " BACKEND_PORT
    fi
    echo -e "${GREEN}✓ Using port $BACKEND_PORT${NC}"
else
    echo -e "${GREEN}✓ Port $BACKEND_PORT is available${NC}"
fi

# Check web server port
if check_port 80; then
    echo -e "${YELLOW}⚠️  Port 80 (HTTP) is already in use${NC}"
    read -p "Continue anyway? [y/N]: " continue_choice
    if [[ ! $continue_choice =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

echo -e "${YELLOW}Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  App Directory: $APP_DIR"
echo "  Backend Port: $BACKEND_PORT"
if [ "$BACKEND_PORT" != "$DEFAULT_BACKEND_PORT" ]; then
    echo -e "  ${CYAN}(Custom port)${NC}"
fi
echo ""

# Step 1: Install Nginx
echo -e "${GREEN}[1/8] Installing Nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo "Nginx is already installed"
else
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y nginx
    elif command -v yum &> /dev/null; then
        yum install -y nginx
    elif command -v dnf &> /dev/null; then
        dnf install -y nginx
    else
        echo -e "${RED}Cannot detect package manager. Please install Nginx manually.${NC}"
        exit 1
    fi
fi

# Step 2: Install Node.js and PM2
echo -e "${GREEN}[2/8] Checking Node.js and PM2...${NC}"
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Step 3: Install pnpm
echo -e "${GREEN}[3/8] Checking pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Step 4: Build Frontend
echo -e "${GREEN}[4/8] Building frontend...${NC}"
cd "$APP_DIR/frontend"
if [ ! -d "node_modules" ]; then
    pnpm install
fi
pnpm build

# Step 5: Install Backend Dependencies
echo -e "${GREEN}[5/9] Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
if [ ! -d "node_modules" ]; then
    pnpm install
fi

# Update .env with port if needed
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        if [ "$BACKEND_PORT" != "$DEFAULT_BACKEND_PORT" ]; then
            sed -i "s/PORT=3000/PORT=$BACKEND_PORT/" .env 2>/dev/null || \
            sed "s/PORT=3000/PORT=$BACKEND_PORT/" .env > .env.tmp && mv .env.tmp .env
        fi
    fi
else
    if [ "$BACKEND_PORT" != "$DEFAULT_BACKEND_PORT" ]; then
        if grep -q "^PORT=" .env; then
            sed -i "s/^PORT=.*/PORT=$BACKEND_PORT/" .env 2>/dev/null || \
            sed "s/^PORT=.*/PORT=$BACKEND_PORT/" .env > .env.tmp && mv .env.tmp .env
        else
            echo "PORT=$BACKEND_PORT" >> .env
        fi
        echo -e "${GREEN}✓ Updated PORT in .env to $BACKEND_PORT${NC}"
    fi
fi

# Step 6: Setup Database & Create Owner
echo -e "${GREEN}[6/9] Setting up database...${NC}"
npx prisma db push

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📝 Create Owner Account${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "First Name: " OWNER_FIRST
read -p "Last Name: " OWNER_LAST
read -p "Email: " OWNER_EMAIL
read -s -p "Password (min 6 chars): " OWNER_PASSWORD
echo ""

# Create owner account
node scripts/make-admin.js "$OWNER_EMAIL" OWNER "$OWNER_FIRST" "$OWNER_LAST" "$OWNER_PASSWORD"

# Step 7: Setup PM2
echo ""
echo -e "${GREEN}[7/9] Setting up PM2 for backend...${NC}"
pm2 delete flomark-backend 2>/dev/null || true
pm2 start src/server.js --name flomark-backend --node-args="--max-old-space-size=2048"
pm2 save
pm2 startup | tail -n 1 | bash || true

# Step 8: Configure Nginx
echo -e "${GREEN}[8/9] Configuring Nginx...${NC}"

cat > "$NGINX_CONF" <<EOF
# Flomark Nginx Configuration
# Generated on $(date)

# Upstream for backend API
upstream flomark_backend {
    server localhost:$BACKEND_PORT;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Client max body size (for file uploads)
    client_max_body_size 50M;

    # Root directory for frontend
    root $FRONTEND_BUILD_DIR;
    index index.html;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # API and WebSocket proxy
    location /api {
        proxy_pass http://flomark_backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.io WebSocket endpoint
    location /socket.io/ {
        proxy_pass http://flomark_backend;
        proxy_http_version 1.1;
        
        # WebSocket headers
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Static files with caching
    location /assets {
        alias $FRONTEND_BUILD_DIR/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploaded files
    location /uploads {
        alias $APP_DIR/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Frontend - SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Don't cache index.html
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}

# Uncomment and configure for SSL/HTTPS
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name $DOMAIN;
#
#     # SSL certificates (use certbot for Let's Encrypt)
#     ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
#     
#     # SSL configuration
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
#
#     # ... (rest of the configuration same as port 80)
# }
#
# # Redirect HTTP to HTTPS
# server {
#     listen 80;
#     listen [::]:80;
#     server_name $DOMAIN;
#     return 301 https://\$server_name\$request_uri;
# }
EOF

# Enable site
ln -sf "$NGINX_CONF" "$NGINX_ENABLED"

# Test Nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
nginx -t

# Step 9: Start/Restart Nginx
echo -e "${GREEN}[9/9] Starting Nginx...${NC}"
systemctl enable nginx
systemctl restart nginx

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${GREEN}✓ Nginx configured and running${NC}"
echo -e "${GREEN}✓ Frontend built and deployed${NC}"
echo -e "${GREEN}✓ Backend running with PM2${NC}"
echo ""
echo -e "${YELLOW}Access your application:${NC}"
if [ "$DOMAIN" = "localhost" ]; then
    echo "  http://localhost"
else
    echo "  http://$DOMAIN"
fi
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  Backend Port: $BACKEND_PORT"
if [ "$BACKEND_PORT" != "$DEFAULT_BACKEND_PORT" ]; then
    echo -e "  ${CYAN}(Custom port configured)${NC}"
fi
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View all logs:      ./logs.sh"
echo "  View backend logs:  pm2 logs flomark-backend"
echo "  Restart backend:    pm2 restart flomark-backend"
echo "  Stop backend:       pm2 stop flomark-backend"
echo "  Nginx status:       systemctl status nginx"
echo "  Reload Nginx:       systemctl reload nginx"
echo ""
echo -e "${YELLOW}📋 Log Management (NEW):${NC}"
echo "  Interactive viewer: ./logs.sh"
echo "  See LOGS-README.md for details"
echo ""
echo -e "${YELLOW}For SSL/HTTPS setup:${NC}"
echo "  1. Install certbot: apt-get install certbot python3-certbot-nginx"
echo "  2. Get certificate: certbot --nginx -d $DOMAIN"
echo "  3. Uncomment SSL section in $NGINX_CONF"
echo "  4. Reload Nginx: systemctl reload nginx"
echo ""

