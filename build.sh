#!/bin/bash
set -e
echo "Building CSTCO Inventory Frontend..."
cd "$PWD/frontend"
echo "Installing dependencies..."
npm install --legacy-peer-deps
echo "Running build..."
npm run build
echo "Build complete!"
