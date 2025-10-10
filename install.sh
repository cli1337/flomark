#!/bin/bash

# Flomark - Universal Installation Script
# This script sets up Flomark with choice of Nginx or Apache
# Usage: sudo ./install.sh [domain-name] [webserver]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-localhost}
WEBSERVER=${2}
APP_DIR=$(pwd)
FRONTEND_BUILD_DIR="$APP_DIR/frontend/dist"
BACKEND_PORT=3000

echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║     🚀 Flomark Installation Script     ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Display configuration
echo -e "${YELLOW}Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  App Directory: $APP_DIR"
echo "  Backend Port: $BACKEND_PORT"
echo ""

# Select web server if not provided
if [ -z "$WEBSERVER" ]; then
    echo -e "${CYAN}Select your web server:${NC}"
    echo "  1) Nginx (Recommended - Better performance)"
    echo "  2) Apache (More familiar to some users)"
    echo ""
    read -p "Enter choice [1-2]: " choice
    
    case $choice in
        1)
            WEBSERVER="nginx"
            ;;
        2)
            WEBSERVER="apache"
            ;;
        *)
            echo -e "${RED}Invalid choice. Defaulting to Nginx.${NC}"
            WEBSERVER="nginx"
            ;;
    esac
fi

echo -e "${GREEN}Selected web server: ${WEBSERVER}${NC}"
echo ""

# Detect OS
if [ -f /etc/debian_version ]; then
    OS_TYPE="debian"
    PACKAGE_MANAGER="apt-get"
elif [ -f /etc/redhat-release ]; then
    OS_TYPE="redhat"
    if command -v dnf &> /dev/null; then
        PACKAGE_MANAGER="dnf"
    else
        PACKAGE_MANAGER="yum"
    fi
else
    echo -e "${RED}Unsupported OS. This script supports Debian/Ubuntu and RHEL/CentOS/Fedora.${NC}"
    exit 1
fi

# Step 1: Install Web Server
echo -e "${GREEN}[1/9] Installing ${WEBSERVER}...${NC}"

if [ "$WEBSERVER" = "nginx" ]; then
    if command -v nginx &> /dev/null; then
        echo "Nginx is already installed"
    else
        $PACKAGE_MANAGER update -y || true
        $PACKAGE_MANAGER install -y nginx
    fi
else
    if [ "$OS_TYPE" = "debian" ]; then
        if command -v apache2 &> /dev/null; then
            echo "Apache is already installed"
        else
            $PACKAGE_MANAGER update -y || true
            $PACKAGE_MANAGER install -y apache2
        fi
        APACHE_SERVICE="apache2"
        # Enable modules
        a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl
    else
        if command -v httpd &> /dev/null; then
            echo "Apache is already installed"
        else
            $PACKAGE_MANAGER install -y httpd mod_ssl
        fi
        APACHE_SERVICE="httpd"
    fi
fi

# Step 2: Install Node.js and PM2
echo -e "${GREEN}[2/9] Checking Node.js and PM2...${NC}"
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    if [ "$OS_TYPE" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        $PACKAGE_MANAGER install -y nodejs
    else
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        $PACKAGE_MANAGER install -y nodejs
    fi
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Step 3: Install pnpm
echo -e "${GREEN}[3/9] Checking pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Step 4: Configure Demo Mode
echo -e "${GREEN}[4/9] Configure Demo Mode...${NC}"
read -p "Enable Demo Mode? (allows anyone to access without login) [y/N]: " demo_choice
DEMO_MODE="false"
if [[ $demo_choice =~ ^[Yy]$ ]]; then
    DEMO_MODE="true"
    echo -e "${YELLOW}Demo mode will be enabled${NC}"
else
    echo -e "${YELLOW}Demo mode will be disabled${NC}"
fi

# Step 5: Build Frontend
echo -e "${GREEN}[5/9] Building frontend...${NC}"
cd "$APP_DIR/frontend"
if [ ! -d "node_modules" ]; then
    pnpm install
fi
pnpm build

# Step 6: Install Backend Dependencies
echo -e "${GREEN}[6/9] Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
if [ ! -d "node_modules" ]; then
    pnpm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}No .env file found. Creating from template...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${RED}Please edit backend/.env with your configuration before proceeding!${NC}"
        read -p "Press Enter after you've configured .env..."
    fi
fi

# Add demo mode to .env if needed
if [ "$DEMO_MODE" = "true" ]; then
    if ! grep -q "DEMO_MODE" .env; then
        echo "DEMO_MODE=true" >> .env
        echo "DEMO_PROJECT_ID=demo-project" >> .env
    else
        sed -i 's/DEMO_MODE=.*/DEMO_MODE=true/' .env 2>/dev/null || \
        sed 's/DEMO_MODE=.*/DEMO_MODE=true/' .env > .env.tmp && mv .env.tmp .env
    fi
fi

# Step 7: Setup Database & Create Owner
echo -e "${GREEN}[7/9] Setting up database...${NC}"
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

# Step 8: Setup PM2
echo ""
echo -e "${GREEN}[8/9] Setting up PM2 for backend...${NC}"
pm2 delete flomark-backend 2>/dev/null || true
pm2 start src/server.js --name flomark-backend --node-args="--max-old-space-size=2048"
pm2 save
pm2 startup | tail -n 1 | bash || true

# Step 9: Configure Web Server
echo -e "${GREEN}[9/9] Configuring ${WEBSERVER}...${NC}"

if [ "$WEBSERVER" = "nginx" ]; then
    # Nginx Configuration
    NGINX_CONF="/etc/nginx/sites-available/flomark"
    NGINX_ENABLED="/etc/nginx/sites-enabled/flomark"
    
    cat > "$NGINX_CONF" <<EOF
# Flomark Nginx Configuration
# Generated on $(date)

upstream flomark_backend {
    server localhost:$BACKEND_PORT;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    client_max_body_size 50M;
    root $FRONTEND_BUILD_DIR;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    location /api {
        proxy_pass http://flomark_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /socket.io/ {
        proxy_pass http://flomark_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    location /assets {
        alias $FRONTEND_BUILD_DIR/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias $APP_DIR/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
        
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }

    location ~ /\. {
        deny all;
    }
}
EOF

    ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
    nginx -t
    systemctl enable nginx
    systemctl restart nginx
    
else
    # Apache Configuration
    if [ "$OS_TYPE" = "debian" ]; then
        APACHE_CONF="/etc/apache2/sites-available/flomark.conf"
    else
        APACHE_CONF="/etc/httpd/conf.d/flomark.conf"
    fi
    
    cat > "$APACHE_CONF" <<EOF
# Flomark Apache Configuration
# Generated on $(date)

<VirtualHost *:80>
    ServerName $DOMAIN
    
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    DocumentRoot $FRONTEND_BUILD_DIR

    <Directory $FRONTEND_BUILD_DIR>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]

        <FilesMatch "index\.html$">
            Header set Cache-Control "no-cache, no-store, must-revalidate"
            Header set Pragma "no-cache"
            Header set Expires "0"
        </FilesMatch>
    </Directory>

    <Directory $FRONTEND_BUILD_DIR/assets>
        Header set Cache-Control "public, max-age=31536000, immutable"
    </Directory>

    Alias /uploads $APP_DIR/backend/uploads
    <Directory $APP_DIR/backend/uploads>
        Options -Indexes
        AllowOverride None
        Require all granted
        Header set Cache-Control "public, max-age=31536000"
    </Directory>

    ProxyPreserveHost On
    ProxyRequests Off

    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule ^/socket.io/(.*)$ ws://localhost:$BACKEND_PORT/socket.io/\$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule ^/socket.io/(.*)$ http://localhost:$BACKEND_PORT/socket.io/\$1 [P,L]

    ProxyPass /api http://localhost:$BACKEND_PORT/api retry=0 timeout=60
    ProxyPassReverse /api http://localhost:$BACKEND_PORT/api

    <Location /socket.io>
        ProxyPass ws://localhost:$BACKEND_PORT/socket.io
        ProxyPassReverse ws://localhost:$BACKEND_PORT/socket.io
    </Location>

    ErrorLog \${APACHE_LOG_DIR}/flomark-error.log
    CustomLog \${APACHE_LOG_DIR}/flomark-access.log combined

    LimitRequestBody 52428800
</VirtualHost>
EOF

    if [ "$OS_TYPE" = "debian" ]; then
        a2ensite flomark.conf
    fi
    
    if [ "$OS_TYPE" = "redhat" ] && command -v getenforce &> /dev/null; then
        if [ "$(getenforce)" != "Disabled" ]; then
            setsebool -P httpd_can_network_connect 1
        fi
    fi
    
    $APACHE_SERVICE -t
    systemctl enable $APACHE_SERVICE
    systemctl restart $APACHE_SERVICE
fi

echo ""
echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║     ✨ Installation Complete! ✨       ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}✓ ${WEBSERVER} configured and running${NC}"
echo -e "${GREEN}✓ Frontend built and deployed${NC}"
echo -e "${GREEN}✓ Backend running with PM2${NC}"
if [ "$DEMO_MODE" = "true" ]; then
    echo -e "${GREEN}✓ Demo mode enabled${NC}"
fi
echo ""
echo -e "${YELLOW}Access your application:${NC}"
if [ "$DOMAIN" = "localhost" ]; then
    echo "  http://localhost"
else
    echo "  http://$DOMAIN"
fi
echo ""

if [ "$DEMO_MODE" = "true" ]; then
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🎭 DEMO MODE ENABLED${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Anyone can access the demo project without login!${NC}"
    echo -e "${YELLOW}Create demo project with:${NC}"
    echo "  cd backend && pnpm run setup-demo"
    echo ""
fi

echo -e "${YELLOW}Useful commands:${NC}"
echo "  View backend logs:  pm2 logs flomark-backend"
echo "  Restart backend:    pm2 restart flomark-backend"
echo "  Restart webserver:  systemctl restart ${WEBSERVER:-nginx/apache2}"
echo ""
echo -e "${BLUE}For SSL/HTTPS setup, see: DEPLOYMENT.md${NC}"
echo ""

