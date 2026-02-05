#!/bin/bash
# ============================================================
# Quick Start Script for Linux/macOS
# ============================================================

set -e

echo ""
echo "========================================"
echo "Inventory Management System - Quick Start"
echo "========================================"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js v16 or higher."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js is installed: $(node --version)"

# Install backend dependencies
echo ""
echo "[1/4] Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps

# Initialize database
echo ""
echo "[2/4] Initializing database..."
npm run init-db

# Install frontend dependencies
echo ""
echo "[3/4] Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
echo ""
echo "[4/4] Building frontend..."
npm run build

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start Backend:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. In another terminal, verify frontend built:"
echo "   ls frontend/dist/"
echo ""
echo "3. Access the application:"
echo "   Development: http://localhost:5173 (if running dev server)"
echo "   Production: http://192.168.1.100 (after Nginx setup)"
echo ""
echo "4. Default Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "For production deployment, see deployment/DEPLOYMENT_GUIDE.md"
echo ""
