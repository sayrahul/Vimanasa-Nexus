@echo off
REM Vimanasa Nexus - Quick Setup Script for Windows
REM This script helps you set up the project quickly

echo.
echo ========================================
echo Vimanasa Nexus - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo [OK] Node.js detected
node -v
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)

echo [OK] npm detected
npm -v
echo.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed successfully
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [WARNING] .env.local not found
    echo [INFO] Creating .env.local from template...
    
    if exist .env.example (
        copy .env.example .env.local >nul
        echo [OK] Created .env.local from .env.example
        echo.
        echo [IMPORTANT] Please edit .env.local and add your credentials:
        echo    - Google Sheets Spreadsheet ID
        echo    - Google Service Account Email
        echo    - Google Private Key
        echo    - Gemini API Key
        echo    - Admin credentials
        echo.
    ) else (
        echo [ERROR] .env.example not found. Please create .env.local manually.
        pause
        exit /b 1
    )
) else (
    echo [OK] .env.local already exists
    echo.
)

REM Check if environment variables contain placeholders
findstr /C:"your_spreadsheet_id_here" .env.local >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] .env.local contains placeholder values
    echo    Please update with your actual credentials before running the app
    echo.
)

echo [OK] Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your actual credentials
echo 2. Set up Google Sheets as described in SETUP_GUIDE.md
echo 3. Run 'npm run dev' to start the development server
echo.

set /p START="Would you like to start the development server now? (y/n): "
if /i "%START%"=="y" (
    echo.
    echo [INFO] Starting development server...
    npm run dev
)

pause
