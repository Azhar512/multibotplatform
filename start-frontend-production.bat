@echo off
echo 🚀 Starting Frontend for Production Testing...

cd frontend

echo 📦 Installing dependencies...
call npm install

echo 🔧 Setting environment variables...
set REACT_APP_API_URL=http://168.231.114.68:5000
set REACT_APP_BACKEND_URL=http://168.231.114.68:5000
set REACT_APP_WS_URL=ws://168.231.114.68:5000
set NODE_ENV=production

echo 🏗️ Building frontend...
call npm run build

echo 🌐 Starting development server...
call npm start

pause
