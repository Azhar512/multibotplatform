#!/bin/bash

echo "🚀 Starting MultiBot Platform Backend Server..."

# Navigate to backend directory
cd /var/www/multibotplatform/Backend

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod
    sleep 5
fi

# Check if port 5000 is available
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5000 is already in use. Killing existing process..."
    sudo kill -9 $(lsof -t -i:5000)
    sleep 2
fi

# Start the backend server
echo "🔧 Starting backend server on port 5000..."
npm start

echo "✅ Backend server started!"
echo "🔗 Backend API: http://168.231.114.68:5000"
echo "🔗 Health check: http://168.231.114.68:5000/api/health"
