@echo off
REM ============================================================
REM Quick Start Script for Windows
REM ============================================================

echo.
echo ========================================
echo Inventory Management System - Quick Start
echo ========================================
echo.

REM Check Node.js installation
node --version > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed

REM Install backend dependencies
echo.
echo [1/4] Installing backend dependencies...
cd backend
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM Initialize database
echo.
echo [2/4] Initializing database...
call npm run init-db
if errorlevel 1 (
    echo [ERROR] Failed to initialize database
    pause
    exit /b 1
)

REM Install frontend dependencies
echo.
echo [3/4] Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Build frontend
echo.
echo [4/4] Building frontend...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start Backend:
echo    cd backend
echo    npm start
echo.
echo 2. In another terminal, verify frontend built:
echo    Check that frontend\dist\ folder contains files
echo.
echo 3. Access the application:
echo    Development: http://localhost:5173 (if running dev server)
echo    Production: http://192.168.1.100 (after Nginx setup)
echo.
echo 4. Default Credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo For production deployment, see deployment/DEPLOYMENT_GUIDE.md
echo.
pause
