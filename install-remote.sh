#!/bin/bash

# Flomark Remote Installer
# Downloads and installs Flomark automatically
# Usage: 
#   wget -qO- https://raw.githubusercontent.com/cli1337/flomark/main/install-remote.sh | bash
#   OR
#   curl -sSL https://raw.githubusercontent.com/cli1337/flomark/main/install-remote.sh | bash

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
echo "║    🚀 Flomark Remote Installer 🚀      ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    echo ""
    echo "Try one of these:"
    echo "  curl -sSL https://raw.githubusercontent.com/cli1337/flomark/main/install-remote.sh | sudo bash"
    echo "  wget -qO- https://raw.githubusercontent.com/cli1337/flomark/main/install-remote.sh | sudo bash"
    exit 1
fi

# Check for required commands
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Installing git...${NC}"
    if command -v apt-get &> /dev/null; then
        apt-get update -qq
        apt-get install -y git curl
    elif command -v yum &> /dev/null; then
        yum install -y git curl
    elif command -v dnf &> /dev/null; then
        dnf install -y git curl
    else
        echo -e "${RED}Cannot install git automatically. Please install git manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Prerequisites ready${NC}"
echo ""

# Ask for installation directory
DEFAULT_INSTALL_DIR="/var/www/flomark"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📁 Installation Directory${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Where do you want to install Flomark?${NC}"
echo "  Default: $DEFAULT_INSTALL_DIR"
echo ""
echo -n "Installation path [$DEFAULT_INSTALL_DIR]: "
read INSTALL_DIR < /dev/tty || INSTALL_DIR=""
INSTALL_DIR=${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}

echo -e "${GREEN}✓ Installing to: $INSTALL_DIR${NC}"
echo ""

# Check if directory exists and has Flomark installed
if [ -d "$INSTALL_DIR" ]; then
    # Check if it's a Flomark installation
    if [ -f "$INSTALL_DIR/.flomark-installed" ] || [ -f "$INSTALL_DIR/backend/package.json" ]; then
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}⚠️  Flomark is already installed at: $INSTALL_DIR${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}Options:${NC}"
        echo "  1) Remove and reinstall (fresh install)"
        echo "  2) Update existing installation"
        echo "  3) Cancel installation"
        echo ""
        echo -n "Choose option [1-3]: "
        read reinstall_choice < /dev/tty
        
        case $reinstall_choice in
            1)
                echo -e "${YELLOW}Removing existing installation...${NC}"
                # Stop services first
                pm2 delete flomark-backend 2>/dev/null || true
                rm -rf "$INSTALL_DIR"
                echo -e "${GREEN}✓ Removed existing installation${NC}"
                ;;
            2)
                echo -e "${YELLOW}Updating existing installation...${NC}"
                cd "$INSTALL_DIR"
                git pull
                echo -e "${GREEN}✓ Updated from GitHub${NC}"
                echo ""
                echo -e "${YELLOW}Now rebuilding...${NC}"
                # Will continue with build process
                UPDATE_MODE=true
                ;;
            3)
                echo -e "${YELLOW}Installation cancelled${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice. Exiting.${NC}"
                exit 1
                ;;
        esac
    else
        # Directory exists but not Flomark
        if [ "$(ls -A $INSTALL_DIR)" ]; then
            echo -e "${YELLOW}⚠️  Directory $INSTALL_DIR exists and contains files${NC}"
            echo -n "Remove contents and continue? [y/N]: "
            read remove_choice < /dev/tty
            
            if [[ $remove_choice =~ ^[Yy]$ ]]; then
                rm -rf "$INSTALL_DIR"/*
            else
                echo -e "${YELLOW}Installation cancelled${NC}"
                exit 0
            fi
        fi
    fi
fi

# Download Flomark if not updating
if [ "$UPDATE_MODE" != "true" ]; then
    echo -e "${GREEN}[1/2] Downloading Flomark...${NC}"
    git clone https://github.com/cli1337/flomark.git "$INSTALL_DIR"
    echo -e "${GREEN}✓ Downloaded to $INSTALL_DIR${NC}"
    
    # Mark as installed
    touch "$INSTALL_DIR/.flomark-installed"
fi

# Navigate to installation directory
cd "$INSTALL_DIR"

# Make scripts executable
chmod +x install.sh 2>/dev/null || true
chmod +x logs.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}[2/2] Running installation...${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}The interactive installer will now start${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}You will be asked for:${NC}"
echo "  - Domain (or use localhost)"
echo "  - Backend port (default 3000)"
echo "  - Web server (Nginx or Apache)"
echo "  - Demo mode (optional)"
echo "  - Environment configuration"
echo "  - Admin account details"
echo ""
echo -n "Press Enter to continue..."
read < /dev/tty
echo ""

# Run the main installer
./install.sh

echo ""
echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║                                        ║"
echo "║    ✨ Installation Complete! ✨        ║"
echo "║                                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}Flomark installed at: $INSTALL_DIR${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:        cd $INSTALL_DIR && ./logs.sh"
echo "  Backend logs:     pm2 logs flomark-backend"
echo "  Restart:          pm2 restart flomark-backend"
echo ""
echo -e "${BLUE}📚 Documentation: https://github.com/cli1337/flomark${NC}"
echo ""

