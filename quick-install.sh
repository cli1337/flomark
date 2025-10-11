#!/bin/bash

# ==================================
# Flomark Quick Installation Script
# ==================================
# One-command installation for Flomark
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
    print_error "Please run this script as root (sudo bash quick-install.sh)"
    exit 1
fi

print_header "🚀 Flomark Quick Installation"
echo ""
print_info "This script will guide you through setting up Flomark"
echo ""

# ==================================
# Package Manager Selection
# ==================================
print_header "📦 Package Manager"
echo ""

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
    print_error "Neither npm nor pnpm found. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    PKG_MANAGER="npm"
else
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
    else
        PKG_MANAGER=$PKG_MANAGER_OPTIONS
        print_success "Using $PKG_MANAGER"
    fi
fi

# ==================================
# Database Selection
# ==================================
echo ""
print_header "💾 Database Configuration"
echo ""

print_info "Select your database type:"
echo "  1) MongoDB"
echo "  2) PostgreSQL"
echo "  3) MySQL/MariaDB"
echo "  4) SQLite (local file)"
echo ""

while true; do
    read -p "$(echo -e ${CYAN}Enter choice [1-4]:${NC} )" DB_CHOICE
    case $DB_CHOICE in
        1)
            DB_TYPE="mongodb"
            DB_PROVIDER="mongodb"
            print_success "Selected: MongoDB"
            break
            ;;
        2)
            DB_TYPE="postgresql"
            DB_PROVIDER="postgresql"
            print_success "Selected: PostgreSQL"
            break
            ;;
        3)
            DB_TYPE="mysql"
            DB_PROVIDER="mysql"
            print_success "Selected: MySQL/MariaDB"
            break
            ;;
        4)
            DB_TYPE="sqlite"
            DB_PROVIDER="sqlite"
            print_success "Selected: SQLite"
            break
            ;;
        *)
            print_error "Invalid choice. Please enter 1, 2, 3, or 4"
            ;;
    esac
done

# Get database connection string
echo ""
if [ "$DB_TYPE" = "sqlite" ]; then
    read -p "$(echo -e ${CYAN}SQLite database file path [./flomark.db]:${NC} )" DB_URL
    DB_URL=${DB_URL:-./flomark.db}
    DATABASE_URL="file:$DB_URL"
    print_info "Database will be stored at: $DB_URL"
else
    print_info "Enter your database connection string"
    echo ""
    echo "Examples:"
    if [ "$DB_TYPE" = "mongodb" ]; then
        echo "  Local:  mongodb://localhost:27017/flomark"
        echo "  Cloud:  mongodb+srv://user:password@cluster.mongodb.net/flomark"
    elif [ "$DB_TYPE" = "postgresql" ]; then
        echo "  Local:  postgresql://user:password@localhost:5432/flomark"
        echo "  Cloud:  postgresql://user:password@host:5432/flomark?schema=public"
    elif [ "$DB_TYPE" = "mysql" ]; then
        echo "  Local:  mysql://user:password@localhost:3306/flomark"
        echo "  Cloud:  mysql://user:password@host:3306/flomark"
    fi
    echo ""
    
    read -p "$(echo -e ${CYAN}Database connection string:${NC} )" DATABASE_URL
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "Database connection string is required!"
        exit 1
    fi
fi

# ==================================
# Installation Configuration
# ==================================
echo ""
print_header "⚙️ Installation Configuration"
echo ""

# Installation path
read -p "$(echo -e ${CYAN}Installation path [/var/www/flomark]:${NC} )" INSTALL_PATH
INSTALL_PATH=${INSTALL_PATH:-/var/www/flomark}

# Domain or IP
read -p "$(echo -e ${CYAN}Domain or IP address [auto-detect]:${NC} )" DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN=$(hostname -I | awk '{print $1}')
    print_info "Using IP: $DOMAIN"
fi

# Backend port
read -p "$(echo -e ${CYAN}Backend port [5000]:${NC} )" BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-5000}

# Frontend port
read -p "$(echo -e ${CYAN}Frontend port [80]:${NC} )" FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-80}

# Web server
while true; do
    read -p "$(echo -e ${CYAN}Web server [nginx/apache]:${NC} )" WEBSERVER
    WEBSERVER=$(echo "$WEBSERVER" | tr '[:upper:]' '[:lower:]')
    if [[ "$WEBSERVER" == "apache" ]] || [[ "$WEBSERVER" == "nginx" ]] || [ -z "$WEBSERVER" ]; then
        WEBSERVER=${WEBSERVER:-nginx}
        print_success "Selected: $WEBSERVER"
        break
    else
        print_error "Invalid choice. Please enter 'nginx' or 'apache'"
    fi
done

# Demo Mode (Optional)
echo ""
print_info "Demo Mode Configuration"
echo ""
echo "Demo mode is useful for testing and public demos. When enabled:"
echo "  - Auto-login as demo@flomark.app"
echo "  - Creates sample projects automatically"
echo "  - Shows demo banner in frontend"
echo ""
read -p "$(echo -e ${CYAN}Enable demo mode? [y/n]:${NC} )" ENABLE_DEMO
ENABLE_DEMO=${ENABLE_DEMO:-n}
ENABLE_DEMO=$(echo "$ENABLE_DEMO" | tr '[:upper:]' '[:lower:]')
if [[ "$ENABLE_DEMO" == "y" ]] || [[ "$ENABLE_DEMO" == "yes" ]]; then
    DEMO_MODE=true
    print_success "Demo mode will be enabled"
    # Set default demo admin
    ADMIN_FIRST_NAME="Demo"
    ADMIN_LAST_NAME="User"
    ADMIN_EMAIL="demo@flomark.app"
    ADMIN_PASSWORD="demo"
    print_info "Using default demo credentials: demo@flomark.app / demo"
else
    DEMO_MODE=false
    # Admin credentials
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

# ==================================
# Installation Summary
# ==================================
echo ""
print_header "📋 Installation Summary"
echo ""
echo "Package Manager:  $PKG_MANAGER"
echo "Database Type:    $DB_TYPE"
echo "Database URL:     ${DATABASE_URL:0:30}..."
echo "Web Server:       $WEBSERVER"
echo "Install Path:     $INSTALL_PATH"
echo "Domain/IP:        $DOMAIN"
echo "Frontend Port:    $FRONTEND_PORT"
echo "Backend Port:     $BACKEND_PORT"
echo "Demo Mode:        $DEMO_MODE"
echo "Admin Email:      $ADMIN_EMAIL"
echo ""

read -p "$(echo -e ${CYAN}Proceed with installation? [y/n]:${NC} )" CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    print_warning "Installation cancelled."
    exit 0
fi

# ==================================
# Install System Dependencies
# ==================================
echo ""
print_header "📦 Installing System Dependencies"

print_info "Updating package lists..."
apt-get update -qq

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
print_success "Node.js $(node --version) installed"

# Install package manager if needed
if [ "$PKG_MANAGER" = "pnpm" ] && ! command -v pnpm &> /dev/null; then
    print_info "Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed"
fi

# Install database if needed and local
if [ "$DB_TYPE" = "mongodb" ] && [[ "$DATABASE_URL" == *"localhost"* ]] && ! command -v mongod &> /dev/null; then
    print_info "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update -qq
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_success "MongoDB installed and started"
elif [ "$DB_TYPE" = "postgresql" ] && [[ "$DATABASE_URL" == *"localhost"* ]] && ! command -v psql &> /dev/null; then
    print_info "Installing PostgreSQL..."
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    print_success "PostgreSQL installed and started"
elif [ "$DB_TYPE" = "mysql" ] && [[ "$DATABASE_URL" == *"localhost"* ]] && ! command -v mysql &> /dev/null; then
    print_info "Installing MySQL..."
    apt-get install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    print_success "MySQL installed and started"
fi

# Install web server
print_info "Installing $WEBSERVER..."
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
# Download Flomark
# ==================================
echo ""
print_header "📥 Downloading Flomark"

print_info "Cloning from GitHub..."
TEMP_DIR="/tmp/flomark-install-$(date +%s)"
git clone --depth 1 https://github.com/cli1337/flomark.git "$TEMP_DIR"
print_success "Downloaded successfully"

# ==================================
# Setup Backend
# ==================================
echo ""
print_header "🔧 Setting Up Backend"

print_info "Creating installation directory..."
mkdir -p "$INSTALL_PATH/backend"

print_info "Copying backend files..."
cp -r "$TEMP_DIR/backend"/* "$INSTALL_PATH/backend/"

cd "$INSTALL_PATH/backend"

# Copy the appropriate Prisma schema for selected database
print_info "Configuring Prisma schema for $DB_TYPE..."
if [ -f "prisma/schema.$DB_PROVIDER.prisma" ]; then
    cp "prisma/schema.$DB_PROVIDER.prisma" "prisma/schema.prisma"
    print_success "Prisma schema configured for $DB_TYPE"
else
    print_warning "Schema template not found, generating inline schema for $DB_TYPE"
    
    # Generate schema inline for non-MongoDB databases
    if [ "$DB_TYPE" != "mongodb" ]; then
        # Determine if we need String for JSON (SQLite) or Json type
        if [ "$DB_TYPE" = "sqlite" ]; then
            JSON_TYPE="String"
        else
            JSON_TYPE="Json"
        fi
        
        # Determine text type for descriptions
        if [ "$DB_TYPE" = "mysql" ]; then
            DESC_TYPE="String?   @db.Text"
            MSG_TYPE="String     @db.Text"
        else
            DESC_TYPE="String?"
            MSG_TYPE="String"
        fi
        
        cat > prisma/schema.prisma << SCHEMA_EOF
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "$DB_PROVIDER"
  url      = env("DATABASE_URL")
}

model User {
  id               String    @id @default(cuid())
  createdAt        DateTime  @default(now())
  name             String
  email            String    @unique
  password         String
  profileImage     String?
  role             Role      @default(USER)
  registerIP       String?
  lastIP           String?
  twoFactorEnabled Boolean   @default(false)
  twoFactorSecret  String?
  
  projectMemberships ProjectMember[]
  taskAssignments    TaskMember[]
  notifications      Notification[]
}

model Project {
  id          String   @id @default(cuid())
  name        String
  imageHash   String?
  labels      $JSON_TYPE
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  members     ProjectMember[]
  lists       List[]
  
  @@map("projects")
}

model List {
  id          String   @id @default(cuid())
  name        String
  order       Int      @default(0)
  color       String   @default("#3b82f6")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks       Task[]
  
  @@map("lists")
}

model Task {
  id          String    @id @default(cuid())
  name        String
  description $DESC_TYPE
  labels      $JSON_TYPE
  dueDate     DateTime?
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  listId      String
  list        List      @relation(fields: [listId], references: [id], onDelete: Cascade)
  
  members     TaskMember[]
  subTasks    SubTask[]
  attachments Attachment[]
  
  @@map("tasks")
}

model SubTask {
  id          String   @id @default(cuid())
  name        String
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@map("subtasks")
}

model Attachment {
  id           String   @id @default(cuid())
  filename     String
  originalName String
  mimeType     String
  size         Int
  url          String
  createdAt    DateTime @default(now())

  taskId       String
  task         Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@map("attachments")
}

model ProjectMember {
  id        String      @id @default(cuid())
  userId    String
  projectId String
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime    @default(now())
  
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([userId, projectId])
  @@map("project_members")
}

model TaskMember {
  id         String   @id @default(cuid())
  userId     String
  taskId     String
  assignedAt DateTime @default(now())
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  task       Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@unique([userId, taskId])
  @@map("task_members")
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   $MSG_TYPE
  data      $JSON_TYPE?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("notifications")
SCHEMA_EOF

        # Add indexes only for non-SQLite databases
        if [ "$DB_TYPE" != "sqlite" ]; then
            cat >> prisma/schema.prisma << SCHEMA_EOF
  @@index([userId, isRead])
  @@index([userId, createdAt])
SCHEMA_EOF
        fi

        cat >> prisma/schema.prisma << SCHEMA_EOF
}

enum Role {
  USER
  ADMIN
  OWNER
}

enum ProjectRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_UPDATED
  TASK_COMPLETED
  TASK_DUE_SOON
  PROJECT_INVITATION
  MEMBER_JOINED
  MEMBER_LEFT
  COMMENT_ADDED
  MENTION
  GENERAL
}
SCHEMA_EOF

        print_success "Schema generated for $DB_TYPE"
    fi
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm install --prod
else
    npm install --omit=dev
fi
print_success "Backend dependencies installed"

# Generate .env file
print_info "Creating .env file..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

cat > .env << EOF
# ==================================
# 🔐 DATABASE CONFIGURATION
# ==================================
DATABASE_URL=$DATABASE_URL

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
# 🎭 DEMO MODE
# ==================================
DEMO_MODE=$DEMO_MODE

# ==================================
# 📧 EMAIL/SMTP (Optional)
# ==================================
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=Flomark
SMTP_FROM_EMAIL=
EOF

print_success ".env file created"

# Generate Prisma Client
print_info "Generating Prisma Client..."
npx prisma generate
print_success "Prisma Client generated"

# Initialize database
print_info "Initializing database schema..."
npx prisma db push --accept-data-loss
print_success "Database schema initialized"

# Create admin user
print_info "Creating admin user..."
node << EOFNODE
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', 10);
        const user = await prisma.user.create({
            data: {
                name: '$ADMIN_FIRST_NAME $ADMIN_LAST_NAME',
                email: '$ADMIN_EMAIL',
                password: hashedPassword,
                role: 'OWNER',
            },
        });
        console.log('✓ Admin user created');
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}

createAdmin();
EOFNODE

print_success "Admin user created"

# ==================================
# Setup Frontend
# ==================================
echo ""
print_header "🎨 Setting Up Frontend"

print_info "Building frontend..."
cd "$TEMP_DIR/frontend"

# Install dependencies
if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm install
    pnpm run build
else
    npm install
    npm run build
fi

print_success "Frontend built"

# Copy frontend
print_info "Copying frontend files..."
mkdir -p "$INSTALL_PATH/frontend"
cp -r dist/* "$INSTALL_PATH/frontend/"
print_success "Frontend files copied"

# ==================================
# Create Systemd Service
# ==================================
echo ""
print_header "⚙️ Creating System Service"

cat > /etc/systemd/system/flomark-backend.service << EOF
[Unit]
Description=Flomark Backend Server
After=network.target

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

systemctl daemon-reload
systemctl enable flomark-backend
systemctl start flomark-backend

sleep 3

if systemctl is-active --quiet flomark-backend; then
    print_success "Flomark backend is running"
else
    print_error "Backend failed to start"
    echo "Check logs: journalctl -u flomark-backend -n 50"
    exit 1
fi

# ==================================
# Configure Web Server
# ==================================
echo ""
print_header "🌐 Configuring Web Server"

if [ "$WEBSERVER" = "apache" ]; then
    cat > /etc/apache2/sites-available/flomark.conf << EOF
<VirtualHost *:$FRONTEND_PORT>
    ServerName $DOMAIN
    DocumentRoot $INSTALL_PATH/frontend

    <Directory $INSTALL_PATH/frontend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api http://localhost:$BACKEND_PORT/api
    ProxyPassReverse /api http://localhost:$BACKEND_PORT/api
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

    if [ "$FRONTEND_PORT" != "80" ]; then
        if ! grep -q "Listen $FRONTEND_PORT" /etc/apache2/ports.conf; then
            echo "Listen $FRONTEND_PORT" >> /etc/apache2/ports.conf
        fi
    fi

    a2ensite flomark.conf
    a2dissite 000-default.conf 2>/dev/null || true
    systemctl restart apache2
    print_success "Apache configured"

else
    cat > /etc/nginx/sites-available/flomark << EOF
server {
    listen $FRONTEND_PORT;
    server_name $DOMAIN;

    root $INSTALL_PATH/frontend;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /socket.io {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    access_log /var/log/nginx/flomark-access.log;
    error_log /var/log/nginx/flomark-error.log;
}
EOF

    ln -sf /etc/nginx/sites-available/flomark /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx
    print_success "Nginx configured"
fi

# ==================================
# Cleanup
# ==================================
echo ""
print_info "Cleaning up..."
rm -rf "$TEMP_DIR"
print_success "Cleanup complete"

# ==================================
# Installation Complete
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
echo "Admin Credentials:"
echo "  📧 Email:    $ADMIN_EMAIL"
echo "  🔑 Password: (the one you entered)"
echo ""
echo "Database:"
echo "  📊 Type:     $DB_TYPE"
echo "  🔗 URL:      ${DATABASE_URL:0:40}..."
echo ""
echo "Useful Commands:"
echo "  Status:   systemctl status flomark-backend"
echo "  Logs:     journalctl -u flomark-backend -f"
echo "  Restart:  systemctl restart flomark-backend"
echo "  Update:   sudo bash update.sh"
echo ""
print_info "Configuration file: $INSTALL_PATH/backend/.env"
echo ""
