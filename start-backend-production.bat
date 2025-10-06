@echo off
echo 🚀 Starting Backend for Production Testing...

cd Backend

echo 📦 Installing dependencies...
call npm install

echo 🔄 Starting minimal authentication server...
node minimal-server.js

pause
