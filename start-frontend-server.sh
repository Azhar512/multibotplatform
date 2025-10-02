#!/bin/bash

echo "🌐 Starting MultiBot Platform Frontend Server..."

# Navigate to frontend directory
cd /var/www/multibotplatform/frontend

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use. Killing existing process..."
    sudo kill -9 $(lsof -t -i:3000)
    sleep 2
fi

# Start the frontend server
echo "🌐 Starting frontend server on port 3000..."
npm start

echo "✅ Frontend server started!"
echo "🔗 Frontend URL: http://168.231.114.68:3000"
