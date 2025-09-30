@echo off
echo 🚀 Starting CallSync Backend Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo 🔍 Checking MongoDB connection...
node -e "const { MongoClient } = require('mongodb'); MongoClient.connect('mongodb://localhost:27017').then(() => { console.log('✅ MongoDB is running'); process.exit(0); }).catch(() => { console.log('❌ MongoDB is not running'); process.exit(1); });" 2>nul
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not running
    echo Please start MongoDB service or install MongoDB
    echo Download from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file...
    echo # CallSync Backend Environment Configuration > .env
    echo. >> .env
    echo # Database Configuration >> .env
    echo MONGODB_URI=mongodb://localhost:27017/callsync >> .env
    echo. >> .env
    echo # JWT Configuration >> .env
    echo JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_%RANDOM% >> .env
    echo. >> .env
    echo # Server Configuration >> .env
    echo PORT=5000 >> .env
    echo NODE_ENV=development >> .env
    echo. >> .env
    echo # Frontend URL (for CORS) >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
    echo. >> .env
    echo # API Keys (Optional) >> .env
    echo # OPENAI_API_KEY=your_openai_api_key_here >> .env
    echo # DEEPSEEK_API_KEY=your_deepseek_api_key_here >> .env
    echo. >> .env
    echo # Twilio Configuration (Optional) >> .env
    echo # TWILIO_ACCOUNT_SID=your_twilio_account_sid_here >> .env
    echo # TWILIO_AUTH_TOKEN=your_twilio_auth_token_here >> .env
    echo. >> .env
    echo # Additional Configuration >> .env
    echo LOG_LEVEL=info >> .env
    echo ✅ .env file created
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the server
echo 🚀 Starting server...
node start-server.js

pause
