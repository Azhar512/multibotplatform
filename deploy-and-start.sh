#!/bin/bash

echo "MultiBot Platform - Deploy and Start Script"
echo "==========================================="

# Pull latest code from GitHub
echo "1. Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "Error: Failed to pull from GitHub"
    exit 1
fi

echo "✅ Code updated successfully"

# Install/update dependencies
echo ""
echo "2. Installing/updating dependencies..."
cd Backend
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "3. Creating .env file..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Start the server
echo ""
echo "4. Starting the server..."
echo "========================="
echo "Server will be available at:"
echo "  - Local: http://localhost:5000"
echo "  - Network: http://0.0.0.0:5000"
echo "  - Mobile: http://YOUR_SERVER_IP:5000"
echo ""
echo "Test endpoints:"
echo "  - Health: http://YOUR_SERVER_IP:5000/api/test"
echo "  - Register: http://YOUR_SERVER_IP:5000/api/auth/register"
echo "  - Login: http://YOUR_SERVER_IP:5000/api/auth/login"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
node server.js
