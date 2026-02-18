#!/usr/bin/env pwsh
# CSTCO Inventory Management System - Automated Setup
# Run: .\SETUP_ELECTRON.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CSTCO Inventory - Electron Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (!$nodeVersion) {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit
}
Write-Host "✓ Found Node.js: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit
}
Write-Host ""

# Build frontend
Write-Host "Building React frontend..." -ForegroundColor Yellow
npm --prefix frontend run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
    exit
}
Write-Host ""

# Create assets directory
if (!(Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets" -Force | Out-Null
    Write-Host "✓ Assets directory created" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose how to run the app:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Desktop App (Easiest)" -ForegroundColor Green
Write-Host "  npm run electron" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Desktop + Web Dev Mode" -ForegroundColor Green
Write-Host "  npm run electron-dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 3: Web Only (localhost:5173)" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 4: Build Installer" -ForegroundColor Green
Write-Host "  npm run dist" -ForegroundColor Gray
Write-Host ""

Write-Host "Default Login:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor Gray
Write-Host "  Password: password123" -ForegroundColor Gray
Write-Host ""

Write-Host "Open 3 terminals for manual setup:" -ForegroundColor Yellow
Write-Host "  Terminal 1: npm run backend" -ForegroundColor Gray
Write-Host "  Terminal 2: npm --prefix frontend run dev -- --host" -ForegroundColor Gray
Write-Host "  Terminal 3: npm run electron" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  • DELIVERY.md - Complete guide" -ForegroundColor Gray
Write-Host "  • ELECTRON_QUICKSTART.md - Quick reference" -ForegroundColor Gray
Write-Host "  • ELECTRON_SETUP.md - Detailed setup" -ForegroundColor Gray
Write-Host ""
