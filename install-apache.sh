#!/bin/bash

# Flomark - Apache Installation Script
# This script sets up Apache as a reverse proxy for the Flomark application
# Usage: sudo ./install-apache.sh [domain-name]

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
BACKEND_PORT=3000
APACHE_CONF_UBUNTU="/etc/apache2/sites-available/flomark.conf"
APACHE_CONF_CENTOS="/etc/httpd/conf.d/flomark.conf"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Flomark - Apache Installation${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  App Directory: $APP_DIR"
echo "  Backend Port: $BACKEND_PORT"
echo ""

# Detect OS and set appropriate paths
if [ -f /etc/debian_version ]; then
    OS_TYPE="debian"
    APACHE_CONF="$APACHE_CONF_UBUNTU"
    APACHE_SERVICE="apache2"
    PACKAGE_MANAGER="apt-get"
elif [ -f /etc/redhat-release ]; then
    OS_TYPE="redhat"
    APACHE_CONF="$APACHE_CONF_CENTOS"
    APACHE_SERVICE="httpd"
    if command -v dnf &> /dev/null; then
        PACKAGE_MANAGER="dnf"
    else
        PACKAGE_MANAGER="yum"
    fi
else
    echo -e "${RED}Unsupported OS. This script supports Debian/Ubuntu and RHEL/CentOS/Fedora.${NC}"
    exit 1
fi

# Step 1: Install Apache
echo -e "${GREEN}[1/8] Installing Apache...${NC}"
if command -v $APACHE_SERVICE &> /dev/null; then
    echo "Apache is already installed"
else
    if [ "$OS_TYPE" = "debian" ]; then
        $PACKAGE_MANAGER update
        $PACKAGE_MANAGER install -y apache2
    else
        $PACKAGE_MANAGER install -y httpd mod_ssl
    fi
fi

# Step 2: Enable required Apache modules
echo -e "${GREEN}[2/8] Enabling Apache modules...${NC}"
if [ "$OS_TYPE" = "debian" ]; then
    a2enmod proxy
    a2enmod proxy_http
    a2enmod proxy_wstunnel
    a2enmod rewrite
    a2enmod headers
    a2enmod ssl
else
    # RHEL-based systems have modules enabled by default
    echo "Modules enabled by default on RHEL-based systems"
fi

# Step 3: Install Node.js and PM2
echo -e "${GREEN}[3/8] Checking Node.js and PM2...${NC}"
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

# Step 4: Install pnpm
echo -e "${GREEN}[4/8] Checking pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Step 5: Build Frontend
echo -e "${GREEN}[5/8] Building frontend...${NC}"
cd "$APP_DIR/frontend"
if [ ! -d "node_modules" ]; then
    pnpm install
fi
pnpm build

# Step 6: Install Backend Dependencies
echo -e "${GREEN}[6/8] Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
if [ ! -d "node_modules" ]; then
    pnpm install
fi

# Step 7: Setup Database & Create Owner
echo -e "${GREEN}[7/9] Setting up database...${NC}"
cd "$APP_DIR/backend"
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

# Step 9: Configure Apache
echo -e "${GREEN}[9/9] Configuring Apache...${NC}"

cat > "$APACHE_CONF" <<EOF
# Flomark Apache Configuration
# Generated on $(date)

<VirtualHost *:80>
    ServerName $DOMAIN
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Document root for frontend
    DocumentRoot $FRONTEND_BUILD_DIR

    <Directory $FRONTEND_BUILD_DIR>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # SPA fallback
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]

        # Cache control for index.html
        <FilesMatch "index\.html$">
            Header set Cache-Control "no-cache, no-store, must-revalidate"
            Header set Pragma "no-cache"
            Header set Expires "0"
        </FilesMatch>
    </Directory>

    # Cache static assets
    <Directory $FRONTEND_BUILD_DIR/assets>
        Header set Cache-Control "public, max-age=31536000, immutable"
    </Directory>

    # Uploaded files
    Alias /uploads $APP_DIR/backend/uploads
    <Directory $APP_DIR/backend/uploads>
        Options -Indexes
        AllowOverride None
        Require all granted
        Header set Cache-Control "public, max-age=31536000"
    </Directory>

    # API proxy
    ProxyPreserveHost On
    ProxyRequests Off

    # WebSocket support for Socket.io
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule ^/socket.io/(.*)$ ws://localhost:$BACKEND_PORT/socket.io/\$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule ^/socket.io/(.*)$ http://localhost:$BACKEND_PORT/socket.io/\$1 [P,L]

    # API endpoints
    ProxyPass /api http://localhost:$BACKEND_PORT/api retry=0 timeout=60
    ProxyPassReverse /api http://localhost:$BACKEND_PORT/api

    # WebSocket proxy for Socket.io
    <Location /socket.io>
        ProxyPass ws://localhost:$BACKEND_PORT/socket.io
        ProxyPassReverse ws://localhost:$BACKEND_PORT/socket.io
    </Location>

    # Error logs
    ErrorLog \${APACHE_LOG_DIR}/flomark-error.log
    CustomLog \${APACHE_LOG_DIR}/flomark-access.log combined

    # File upload size limit
    LimitRequestBody 52428800
</VirtualHost>

# Uncomment for SSL/HTTPS configuration
# <VirtualHost *:443>
#     ServerName $DOMAIN
#     
#     # SSL certificates (use certbot for Let's Encrypt)
#     SSLEngine on
#     SSLCertificateFile /etc/letsencrypt/live/$DOMAIN/fullchain.pem
#     SSLCertificateKeyFile /etc/letsencrypt/live/$DOMAIN/privkey.pem
#     
#     # SSL configuration
#     SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
#     SSLCipherSuite HIGH:!aNULL:!MD5
#     SSLHonorCipherOrder on
#
#     # ... (rest of the configuration same as port 80)
# </VirtualHost>
#
# # Redirect HTTP to HTTPS
# <VirtualHost *:80>
#     ServerName $DOMAIN
#     Redirect permanent / https://$DOMAIN/
# </VirtualHost>
EOF

# Enable site (Debian/Ubuntu only)
if [ "$OS_TYPE" = "debian" ]; then
    a2ensite flomark.conf
    # Disable default site if needed
    # a2dissite 000-default.conf
fi

# Adjust SELinux if on RHEL-based system
if [ "$OS_TYPE" = "redhat" ] && command -v getenforce &> /dev/null; then
    if [ "$(getenforce)" != "Disabled" ]; then
        echo -e "${YELLOW}Configuring SELinux...${NC}"
        setsebool -P httpd_can_network_connect 1
    fi
fi

# Test Apache configuration
echo -e "${YELLOW}Testing Apache configuration...${NC}"
$APACHE_SERVICE -t

# Start/Restart Apache
echo -e "${GREEN}Starting Apache...${NC}"
systemctl enable $APACHE_SERVICE
systemctl restart $APACHE_SERVICE

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${GREEN}✓ Apache configured and running${NC}"
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
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View backend logs:  pm2 logs flomark-backend"
echo "  Restart backend:    pm2 restart flomark-backend"
echo "  Stop backend:       pm2 stop flomark-backend"
echo "  Apache status:      systemctl status $APACHE_SERVICE"
echo "  Reload Apache:      systemctl reload $APACHE_SERVICE"
if [ "$OS_TYPE" = "debian" ]; then
    echo "  View Apache logs:   tail -f /var/log/apache2/flomark-error.log"
else
    echo "  View Apache logs:   tail -f /var/log/httpd/flomark-error.log"
fi
echo ""
echo -e "${YELLOW}For SSL/HTTPS setup:${NC}"
if [ "$OS_TYPE" = "debian" ]; then
    echo "  1. Install certbot: apt-get install certbot python3-certbot-apache"
    echo "  2. Get certificate: certbot --apache -d $DOMAIN"
else
    echo "  1. Install certbot: $PACKAGE_MANAGER install certbot python3-certbot-apache"
    echo "  2. Get certificate: certbot --apache -d $DOMAIN"
fi
echo "  3. Uncomment SSL section in $APACHE_CONF"
echo "  4. Reload Apache: systemctl reload $APACHE_SERVICE"
echo ""

