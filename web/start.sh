#!/bin/bash

# Agricola Card Search - Quick Start Script

echo "🌾 Agricola Card Search - Quick Start"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Check if data files exist in public directory
if [ ! -f "public/cards.json" ]; then
  echo "📋 Copying card data files..."
  mkdir -p public
  cp ../plugin/cards.json public/
  echo "✓ cards.json copied"
fi

if [ ! -f "public/authors.json" ]; then
  cp ../plugin/authors.json public/ 2>/dev/null || echo "⚠️  authors.json not found (optional)"
  echo "✓ authors.json copied (if available)"
fi

echo ""
echo "🚀 Starting development server..."
echo ""
npm run dev
