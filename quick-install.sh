#!/bin/bash
# Flomark Quick Installer
# Usage: curl -sL https://raw.githubusercontent.com/cli1337/flomark/main/quick-install.sh | sudo bash

set -e

echo "🌐 Downloading Flomark..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Install git if needed
command -v git &> /dev/null || { apt-get update -qq && apt-get install -y git; }

# Clone and install
git clone --depth 1 https://github.com/cli1337/flomark.git .
chmod +x install.sh
bash install.sh

# Cleanup
cd /
rm -rf "$TEMP_DIR"

