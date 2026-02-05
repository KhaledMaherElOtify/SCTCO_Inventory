# CSTCO Inventory System - One Command Launcher
# Usage: .\run.ps1

Write-Host "🚀 CSTCO Inventory Management System" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing Node processes
Write-Host "🛑 Cleaning up existing processes..."
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 1000

# Navigate to project root
Push-Location "e:\CSTCO\Inventory\Inventory_Management_System"

Write-Host "✅ Starting both servers with single command..." -ForegroundColor Green
Write-Host ""
Write-Host "Running: npm run dev" -ForegroundColor Yellow
Write-Host ""

# Run both backend and frontend
npm run dev

Pop-Location
