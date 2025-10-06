#!/bin/bash

echo "🔧 Fixing CORS Configuration Only (Preserving Original Server Structure)..."

# Navigate to backend directory
cd /var/www/multibotplatform/Backend

# Create a backup of the current server.js
cp server.js server.js.backup3

# Restore the original server.js from the first backup
cp server.js.backup server.js

# Now just update the CORS configuration in the original server.js
echo "🌐 Updating CORS configuration in original server.js..."

# Use sed to update the allowedOrigins array
sed -i "s/'http:\/\/127\.0\.0\.1:19000'/'http:\/\/127.0.0.1:19000',\n  'http:\/\/168.231.114.68:3000',\n  'http:\/\/168.231.114.68',\n  'http:\/\/168.231.114.68:80',\n  'https:\/\/168.231.114.68:3000',\n  'https:\/\/168.231.114.68',\n  'https:\/\/168.231.114.68:80'/" server.js

echo "✅ CORS configuration updated in original server.js!"
echo "🚀 Restarting backend server..."

# Kill any existing backend process
pkill -f "node server.js" || true
sleep 2

# Start the backend server
npm start &
