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
SOURCE_DIR=$(pwd)
DEPLOY_DIR="/var/www/flomark"
FRONTEND_BUILD_DIR="$DEPLOY_DIR/frontend"
BACKEND_DIR="$DEPLOY_DIR/backend"
BACKEND_PORT=3000
DEFAULT_BACKEND_PORT=3000

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

# Ask for domain configuration
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌐 Domain Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Do you want to configure a custom domain?${NC}"
echo "  - Choose 'Yes' if you have a domain (e.g., myapp.example.com)"
echo "  - Choose 'No' for local development (will use localhost)"
echo ""
read -p "Configure domain? [y/N]: " configure_domain

if [[ $configure_domain =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Enter your domain name:${NC}"
    echo "  Examples:"
    echo "    - myapp.example.com"
    echo "    - tasks.company.com"
    echo "    - app.mydomain.org"
    echo ""
    read -p "Domain name: " DOMAIN
    
    # Validate domain is not empty
    while [ -z "$DOMAIN" ]; do
        echo -e "${RED}Domain name cannot be empty!${NC}"
        read -p "Domain name: " DOMAIN
    done
    
    echo -e "${GREEN}✓ Using domain: $DOMAIN${NC}"
else
    DOMAIN="localhost"
    echo -e "${GREEN}✓ Using localhost (local development)${NC}"
fi

echo ""

# Ask for custom backend port
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔌 Backend Port Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Default backend port is 3000.${NC}"
echo "Do you want to use a different port?"
echo ""
read -p "Use custom port? [y/N]: " custom_port_choice

if [[ $custom_port_choice =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter backend port (1024-65535): " BACKEND_PORT
    
    # Validate port number
    while ! [[ "$BACKEND_PORT" =~ ^[0-9]+$ ]] || [ "$BACKEND_PORT" -lt 1024 ] || [ "$BACKEND_PORT" -gt 65535 ]; do
        echo -e "${RED}Invalid port! Must be a number between 1024-65535${NC}"
        read -p "Enter backend port (1024-65535): " BACKEND_PORT
    done
fi

echo ""

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
        # Can't check, assume available
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
    echo ""
    
    # Try to find what's using it
    if command -v lsof &> /dev/null; then
        echo -e "${YELLOW}Process using port $BACKEND_PORT:${NC}"
        lsof -i :$BACKEND_PORT | grep LISTEN || echo "  (Unable to determine)"
    elif command -v netstat &> /dev/null; then
        echo -e "${YELLOW}Port $BACKEND_PORT is in use by:${NC}"
        netstat -tulnp | grep ":$BACKEND_PORT " || echo "  (Unable to determine)"
    fi
    
    echo ""
    echo -e "${CYAN}Options:${NC}"
    echo "  1) Stop the service using port $BACKEND_PORT and continue"
    echo "  2) Use a different port (recommended)"
    echo "  3) Exit installation"
    echo ""
    read -p "Enter choice [1-3]: " port_choice
    
    case $port_choice in
        1)
            echo -e "${YELLOW}Please stop the service using port $BACKEND_PORT and press Enter${NC}"
            read -p ""
            if check_port $BACKEND_PORT; then
                echo -e "${RED}Port $BACKEND_PORT is still in use. Exiting.${NC}"
                exit 1
            fi
            ;;
        2)
            # Suggest next available port
            SUGGESTED_PORT=$(find_available_port $((BACKEND_PORT + 1)))
            if [ -n "$SUGGESTED_PORT" ]; then
                echo ""
                read -p "Enter port to use (suggested: $SUGGESTED_PORT): " custom_port
                custom_port=${custom_port:-$SUGGESTED_PORT}
            else
                echo ""
                read -p "Enter port to use: " custom_port
            fi
            
            # Validate port
            if ! [[ "$custom_port" =~ ^[0-9]+$ ]] || [ "$custom_port" -lt 1024 ] || [ "$custom_port" -gt 65535 ]; then
                echo -e "${RED}Invalid port number. Must be between 1024-65535.${NC}"
                exit 1
            fi
            
            if check_port $custom_port; then
                echo -e "${RED}Port $custom_port is also in use!${NC}"
                exit 1
            fi
            
            BACKEND_PORT=$custom_port
            echo -e "${GREEN}✓ Using port $BACKEND_PORT${NC}"
            ;;
        3)
            echo -e "${YELLOW}Installation cancelled.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Exiting.${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}✓ Port $BACKEND_PORT is available${NC}"
fi

# Check web server ports (80, 443)
if check_port 80; then
    echo -e "${YELLOW}⚠️  Port 80 (HTTP) is already in use${NC}"
    if command -v lsof &> /dev/null; then
        lsof -i :80 | grep LISTEN
    fi
    echo -e "${YELLOW}This may conflict with the web server.${NC}"
    read -p "Continue anyway? [y/N]: " continue_choice
    if [[ ! $continue_choice =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Display current configuration
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 Current Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  Domain: $DOMAIN"
echo "  Source Directory: $SOURCE_DIR"
echo "  Deploy Directory: $DEPLOY_DIR"
echo "  Backend Port: $BACKEND_PORT"
if [ "$BACKEND_PORT" != "$DEFAULT_BACKEND_PORT" ]; then
    echo -e "  ${CYAN}(Custom port selected)${NC}"
fi
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Select web server
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌐 Web Server Selection${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Select your web server:${NC}"
echo "  1) Nginx (Recommended)"
echo "     ✓ Better performance"
echo "     ✓ Lower memory usage"
echo "     ✓ Better for high-traffic sites"
echo ""
echo "  2) Apache"
echo "     ✓ More familiar to some users"
echo "     ✓ Extensive documentation"
echo "     ✓ .htaccess support"
    echo ""
read -p "Enter choice [1-2] (default: 1): " choice
choice=${choice:-1}
    
    case $choice in
        1)
            WEBSERVER="nginx"
            ;;
        2)
            WEBSERVER="apache"
            ;;
        *)
        echo -e "${YELLOW}Invalid choice. Using Nginx (default).${NC}"
            WEBSERVER="nginx"
            ;;
    esac

echo -e "${GREEN}✓ Selected web server: ${WEBSERVER}${NC}"
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
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🎭 Demo Mode Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Demo Mode allows visitors to try your app without registration.${NC}"
echo "  ✓ Great for showcasing features"
echo "  ✓ Public access to demo project"
echo "  ✓ No login required for demo"
echo ""
read -p "Enable Demo Mode? [y/N]: " demo_choice
DEMO_MODE="false"
if [[ $demo_choice =~ ^[Yy]$ ]]; then
    DEMO_MODE="true"
    echo -e "${GREEN}✓ Demo mode will be enabled${NC}"
else
    echo -e "${GREEN}✓ Demo mode will be disabled${NC}"
fi
echo ""

# Step 5: Build Frontend for Production
echo -e "${GREEN}[5/9] Building frontend for production...${NC}"
cd "$SOURCE_DIR/frontend"
if [ ! -d "node_modules" ]; then
    pnpm install
fi
echo -e "${YELLOW}Building React app for production...${NC}"
pnpm build

# Create production directory structure
echo -e "${YELLOW}Creating production directory structure...${NC}"
mkdir -p "$DEPLOY_DIR"
mkdir -p "$FRONTEND_BUILD_DIR"

# Copy built frontend to production directory
echo -e "${YELLOW}Deploying frontend to $FRONTEND_BUILD_DIR...${NC}"
rm -rf "$FRONTEND_BUILD_DIR"/*
cp -r dist/* "$FRONTEND_BUILD_DIR/"
echo -e "${GREEN}✓ Frontend deployed to production${NC}"

# Step 6: Deploy Backend to Production
echo -e "${GREEN}[6/9] Deploying backend to production...${NC}"

# Copy backend to production directory
echo -e "${YELLOW}Copying backend to $BACKEND_DIR...${NC}"
mkdir -p "$BACKEND_DIR"
cd "$SOURCE_DIR/backend"

# Copy all backend files except node_modules
rsync -av --exclude 'node_modules' --exclude '.env' . "$BACKEND_DIR/"

# Install production dependencies in production directory
cd "$BACKEND_DIR"
echo -e "${YELLOW}Installing backend dependencies...${NC}"
pnpm install --prod
echo -e "${GREEN}✓ Backend deployed to production${NC}"

# Handle .env configuration
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo -e "${YELLOW}Creating .env from template...${NC}"
        cp env.example .env
        # Update port in .env if custom port is used
        if [ "$BACKEND_PORT" != "$DEFAULT_BACKEND_PORT" ]; then
            sed -i "s/PORT=3000/PORT=$BACKEND_PORT/" .env 2>/dev/null || \
            sed "s/PORT=3000/PORT=$BACKEND_PORT/" .env > .env.tmp && mv .env.tmp .env
        fi
    fi
else
    # Update existing .env with custom port
    if [ "$BACKEND_PORT" != "$DEFAULT_BACKEND_PORT" ]; then
        if grep -q "^PORT=" .env; then
            sed -i "s/^PORT=.*/PORT=$BACKEND_PORT/" .env 2>/dev/null || \
            sed "s/^PORT=.*/PORT=$BACKEND_PORT/" .env > .env.tmp && mv .env.tmp .env
            echo -e "${GREEN}✓ Updated PORT in .env to $BACKEND_PORT${NC}"
        else
            echo "PORT=$BACKEND_PORT" >> .env
            echo -e "${GREEN}✓ Added PORT=$BACKEND_PORT to .env${NC}"
        fi
    fi
fi

# Show .env configuration instructions
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚙️  Environment Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}.env file location: $BACKEND_DIR/.env${NC}"
echo ""
echo -e "${YELLOW}Required settings:${NC}"
echo "  - DATABASE_URL: mongodb://localhost:27017/flomark"
echo "  - JWT_SECRET: (generate random string)"
echo "  - JWT_REFRESH_SECRET: (generate random string)"
echo ""
echo -e "${YELLOW}Optional: Edit now or configure later${NC}"
read -p "Edit .env now? [y/N]: " edit_env

if [[ $edit_env =~ ^[Yy]$ ]]; then
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    elif command -v vi &> /dev/null; then
        vi .env
    else
        echo -e "${YELLOW}No editor found. Edit manually: nano $BACKEND_DIR/.env${NC}"
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
cd "$BACKEND_DIR"
pm2 delete flomark-backend 2>/dev/null || true
pm2 start src/server.js --name flomark-backend --node-args="--max-old-space-size=2048" --cwd "$BACKEND_DIR"
pm2 save
pm2 startup | tail -n 1 | bash || true
echo -e "${GREEN}✓ Backend running from $BACKEND_DIR${NC}"

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
        alias $BACKEND_DIR/uploads;
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

    Alias /uploads $BACKEND_DIR/uploads
    <Directory $BACKEND_DIR/uploads>
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

echo -e "${YELLOW}Configuration Details:${NC}"
echo "  Domain: $DOMAIN"
echo "  Deploy Directory: $DEPLOY_DIR"
echo "  Frontend: $FRONTEND_BUILD_DIR"
echo "  Backend: $BACKEND_DIR"
echo "  Backend Port: $BACKEND_PORT"
if [ "$BACKEND_PORT" != "$DEFAULT_BACKEND_PORT" ]; then
    echo -e "  ${CYAN}(Custom backend port configured)${NC}"
fi
echo ""
echo -e "${YELLOW}Important: Configure .env file${NC}"
echo "  Edit: nano $BACKEND_DIR/.env"
echo "  Then: pm2 restart flomark-backend"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View all logs:      ./logs.sh"
echo "  View backend logs:  pm2 logs flomark-backend"
echo "  Restart backend:    pm2 restart flomark-backend"
echo "  Restart webserver:  systemctl restart ${WEBSERVER:-nginx/apache2}"
echo ""
echo -e "${BLUE}📋 Log Management:${NC}"
echo "  Interactive log viewer: ./logs.sh"
echo "  Quick backend logs:     ./logs.sh backend"
echo "  Quick access logs:      ./logs.sh access"
echo "  See LOGS-README.md for details"
echo ""
echo -e "${BLUE}For SSL/HTTPS setup, see: DEPLOYMENT.md${NC}"
echo ""

