@echo off
echo 🚀 CallSync Connection Fix Script
echo ================================
echo.

echo 📋 This script will help you fix the connection issue between frontend and backend.
echo.

REM Check if we're in the right directory
if not exist "Backend" (
    echo ❌ Backend directory not found. Please run this script from the multibotplatform root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Frontend directory not found. Please run this script from the multibotplatform root directory.
    pause
    exit /b 1
)

echo 🔍 Step 1: Creating frontend .env file...
cd frontend
echo # CallSync Frontend Environment Configuration > .env
echo. >> .env
echo # Backend API URL - Change this to match your backend server >> .env
echo REACT_APP_API_URL=http://168.231.114.68:5000 >> .env
echo. >> .env
echo # Frontend URL (for reference) >> .env
echo REACT_APP_FRONTEND_URL=http://168.231.114.68:3000 >> .env
echo. >> .env
echo # Socket.io URL for real-time features >> .env
echo REACT_APP_SOCKET_URL=http://168.231.114.68:5000 >> .env
echo ✅ Frontend .env file created
cd ..

echo.
echo 🔍 Step 2: Creating backend .env file...
cd Backend
if not exist .env (
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
    echo FRONTEND_URL=http://168.231.114.68:3000 >> .env
    echo. >> .env
    echo # Additional Configuration >> .env
    echo LOG_LEVEL=info >> .env
    echo ✅ Backend .env file created
) else (
    echo ✅ Backend .env file already exists
)
cd ..

echo.
echo 🚀 Step 3: Starting Backend Server...
echo Please wait while the backend server starts...
cd Backend
start "CallSync Backend" cmd /k "node start-server.js"
cd ..

echo.
echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Step 4: Testing Backend Connection...
echo Testing: http://168.231.114.68:5000/api/health
curl -s http://168.231.114.68:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running and accessible!
) else (
    echo ⚠️  Backend might not be running yet. Please check the backend window.
)

echo.
echo 🎯 Step 5: Starting Frontend Server...
echo Please wait while the frontend server starts...
cd frontend
start "CallSync Frontend" cmd /k "npm start"
cd ..

echo.
echo 🎉 Setup Complete!
echo.
echo 📋 What to do next:
echo 1. Wait for both servers to start (you'll see two new command windows)
echo 2. Open your browser and go to: http://168.231.114.68:3000
echo 3. Try to register a new account
echo 4. If you still get errors, check the backend window for any error messages
echo.
echo 🔧 If you need to change the IP address:
echo - Edit frontend/.env and change 168.231.114.68 to your actual IP
echo - Edit Backend/.env and change 168.231.114.68 to your actual IP
echo - Restart both servers
echo.
pause
