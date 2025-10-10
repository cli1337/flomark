#!/bin/bash

# Flomark Quick Installer
# Downloads and installs Flomark in one command
# Usage: curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║    🚀 Flomark Quick Installer 🚀       ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    echo "Try: curl -fsSL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash"
    exit 1
fi

# Check for required commands
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Installing git...${NC}"
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y git
    elif command -v yum &> /dev/null; then
        yum install -y git
    elif command -v dnf &> /dev/null; then
        dnf install -y git
    else
        echo -e "${RED}Cannot install git automatically. Please install git manually.${NC}"
        exit 1
    fi
fi

if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}Installing curl...${NC}"
    if command -v apt-get &> /dev/null; then
        apt-get install -y curl
    elif command -v yum &> /dev/null; then
        yum install -y curl
    elif command -v dnf &> /dev/null; then
        dnf install -y curl
    fi
fi

echo -e "${GREEN}✓ Prerequisites ready${NC}"
echo ""

# Determine installation directory
INSTALL_DIR="/opt/flomark"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📁 Installation Directory${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Where do you want to install Flomark?${NC}"
echo "  Default: $INSTALL_DIR"
echo ""
read -p "Installation directory [$INSTALL_DIR]: " custom_dir

if [ -n "$custom_dir" ]; then
    INSTALL_DIR="$custom_dir"
fi

echo -e "${GREEN}✓ Installing to: $INSTALL_DIR${NC}"
echo ""

# Check if directory exists
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}⚠️  Directory $INSTALL_DIR already exists${NC}"
    read -p "Remove and reinstall? [y/N]: " remove_choice
    
    if [[ $remove_choice =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing existing installation...${NC}"
        rm -rf "$INSTALL_DIR"
    else
        echo -e "${YELLOW}Installation cancelled${NC}"
        exit 0
    fi
fi

# Clone repository
echo -e "${GREEN}[1/3] Downloading Flomark...${NC}"
git clone https://github.com/cli1337/flomark.git "$INSTALL_DIR"

# Enter directory
cd "$INSTALL_DIR"

# Make install script executable
chmod +x install.sh logs.sh

# Configure backend
echo ""
echo -e "${GREEN}[2/3] Configuring backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp env.example .env
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚙️  Backend Configuration${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}You need to configure your database and secrets.${NC}"
    echo "The .env file has been created at: $INSTALL_DIR/backend/.env"
    echo ""
    echo -e "${YELLOW}Required settings:${NC}"
    echo "  - DATABASE_URL: Your MongoDB connection string"
    echo "  - JWT_SECRET: Random secret for JWT tokens"
    echo "  - JWT_REFRESH_SECRET: Random secret for refresh tokens"
    echo ""
    echo -e "${YELLOW}Do you want to edit .env now?${NC}"
    read -p "Edit now? [Y/n]: " edit_choice
    
    if [[ ! $edit_choice =~ ^[Nn]$ ]]; then
        if command -v nano &> /dev/null; then
            nano .env
        elif command -v vim &> /dev/null; then
            vim .env
        elif command -v vi &> /dev/null; then
            vi .env
        else
            echo -e "${YELLOW}No text editor found. Please edit manually:${NC}"
            echo "  nano $INSTALL_DIR/backend/.env"
        fi
    fi
fi

cd "$INSTALL_DIR"

# Run installation
echo ""
echo -e "${GREEN}[3/3] Running installation script...${NC}"
echo ""

# Run the interactive installer
./install.sh

echo ""
echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║   ✨ Quick Install Complete! ✨        ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}Flomark has been installed to: $INSTALL_DIR${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:        cd $INSTALL_DIR && ./logs.sh"
echo "  View backend:     pm2 logs flomark-backend"
echo "  Restart backend:  pm2 restart flomark-backend"
echo "  Update Flomark:   cd $INSTALL_DIR && git pull"
echo ""
echo -e "${BLUE}📚 Documentation: https://github.com/cli1337/flomark${NC}"
echo ""

