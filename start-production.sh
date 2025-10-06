#!/bin/bash

echo "Starting MultiBot Platform - Production Server"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "Backend/server.js" ]; then
    echo "Error: Backend/server.js not found. Please run this from the project root."
    exit 1
fi

echo "Setting up Backend..."
cd Backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install backend dependencies"
        exit 1
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp env.example .env
fi

echo ""
echo "Starting Backend Server..."
echo "Backend will be available at: http://0.0.0.0:5000"
echo "Test endpoint: http://0.0.0.0:5000/api/test"
echo "Mobile app can connect to: http://YOUR_SERVER_IP:5000"
echo ""

# Start the server
node server.js