#!/bin/bash

# ==================================
# Flomark Remote Installation Script
# ==================================
# This script downloads and installs Flomark
# Usage: bash <(curl -s https://raw.githubusercontent.com/cli1337/flomark/main/install-remote.sh)
# ==================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run this script as root"
    echo "Usage: sudo bash <(curl -s https://raw.githubusercontent.com/cli1337/flomark/main/install-remote.sh)"
    exit 1
fi

print_header "🌐 Flomark Remote Installer"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_info "Installing git..."
    apt-get update -qq
    apt-get install -y git
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
print_info "Downloading Flomark..."

# Clone repository
if ! git clone --depth 1 https://github.com/cli1337/flomark.git "$TEMP_DIR" 2>/dev/null; then
    print_error "Failed to download Flomark"
    echo "Please check your internet connection and try again."
    rm -rf "$TEMP_DIR"
    exit 1
fi

print_success "Flomark downloaded successfully"

# Run the installation script
cd "$TEMP_DIR"
chmod +x install.sh

print_info "Starting installation..."
echo ""

bash install.sh

# Cleanup
print_info "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

print_success "Installation complete!"

