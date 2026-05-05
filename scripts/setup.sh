#!/bin/bash

# Vimanasa Nexus - Quick Setup Script
# This script helps you set up the project quickly

echo "🚀 Vimanasa Nexus - Setup Script"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found"
    echo "📝 Creating .env.local from template..."
    
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env.local and add your credentials:"
        echo "   - Google Sheets Spreadsheet ID"
        echo "   - Google Service Account Email"
        echo "   - Google Private Key"
        echo "   - Gemini API Key"
        echo "   - Admin credentials"
        echo ""
    else
        echo "❌ .env.example not found. Please create .env.local manually."
        exit 1
    fi
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Check if required environment variables are set
echo "🔍 Checking environment variables..."

if grep -q "your_spreadsheet_id_here" .env.local 2>/dev/null; then
    echo "⚠️  Warning: .env.local contains placeholder values"
    echo "   Please update with your actual credentials before running the app"
    echo ""
fi

# Offer to run the development server
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your actual credentials"
echo "2. Set up Google Sheets as described in SETUP_GUIDE.md"
echo "3. Run 'npm run dev' to start the development server"
echo ""

read -p "Would you like to start the development server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development server..."
    npm run dev
fi
