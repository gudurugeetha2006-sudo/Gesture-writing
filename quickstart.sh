#!/bin/bash

# Gesture Writing System - Quick Start Script
# This script helps you get started quickly

echo "🎉 Gesture Writing System - Quick Setup"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm ready: $(pnpm --version)"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create a Supabase account at https://supabase.com"
echo "2. Create a new project"
echo "3. Run the SQL script in scripts/001_create_tables.sql"
echo "4. Copy your credentials to .env.local"
echo "5. Run: pnpm dev"
echo ""
echo "🚀 Then open: http://localhost:3000"
echo ""
