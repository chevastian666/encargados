#!/bin/bash

# Kill any existing processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clean node modules if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the dev server
echo "Starting development server on port 3000..."
npm run dev