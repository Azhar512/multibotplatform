#!/bin/bash

# Production Server Startup Script
echo "🚀 Starting MultiBot Platform Production Server..."

# Navigate to backend directory
cd /var/www/multibotplatform/Backend

# Stop any existing server processes
echo "🛑 Stopping existing server processes..."
pkill -f "node server.js" || true
pkill -f "node minimal-server.js" || true

# Wait a moment for processes to stop
sleep 2

# Start the minimal server
echo "🔄 Starting minimal authentication server..."
node minimal-server.js &

# Get the process ID
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Test the server
echo "🧪 Testing server endpoints..."
curl -s http://168.231.114.68:5000/api/test > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is running successfully!"
    echo "📱 Mobile app can now connect to: http://168.231.114.68:5000"
    echo "🔗 Test endpoint: http://168.231.114.68:5000/api/test"
    echo "👤 Register: POST http://168.231.114.68:5000/api/auth/register"
    echo "🔑 Login: POST http://168.231.114.68:5000/api/auth/login"
    echo ""
    echo "Server PID: $SERVER_PID"
    echo "To stop the server: kill $SERVER_PID"
else
    echo "❌ Server failed to start properly"
    exit 1
fi
