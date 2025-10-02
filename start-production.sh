#!/bin/bash

# Production Start Script for MultiBot Platform
echo "🚀 Starting MultiBot Platform in Production Mode..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod
    sleep 5
fi

# Start Backend
echo "🔧 Starting Backend Server..."
cd Backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 10

# Start Frontend
echo "🌐 Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ MultiBot Platform is starting..."
echo "📊 Backend PID: $BACKEND_PID"
echo "🌐 Frontend PID: $FRONTEND_PID"
echo "🔗 Frontend URL: http://168.231.114.68:3000"
echo "🔗 Backend API: http://168.231.114.68:5000"

# Keep script running
wait
