#!/bin/bash

# Quick fix for Prisma Client generation issue
# Run this on your server: sudo bash fix-prisma.sh

set -e

echo "🔧 Fixing Prisma Client..."

cd /var/www/flomark-demo/backend

echo "Generating Prisma Client..."
npx prisma generate

echo "Restarting backend..."
systemctl restart flomark-backend

sleep 3

if systemctl is-active --quiet flomark-backend; then
    echo "✅ Flomark is now running!"
    echo ""
    echo "Check status: sudo systemctl status flomark-backend"
else
    echo "❌ Service failed to start. Check logs:"
    echo "sudo journalctl -u flomark-backend -n 50"
fi

