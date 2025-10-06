@echo off
echo Starting MultiBot Platform - Full Stack Application
echo ==================================================
echo.

REM Check if we're in the right directory
if not exist "Backend\server.js" (
    echo Error: Backend\server.js not found. Please run this from the project root.
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo Error: frontend\package.json not found. Please run this from the project root.
    pause
    exit /b 1
)

echo Setting up Backend...
cd Backend

REM Install backend dependencies if needed
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install backend dependencies
        pause
        exit /b 1
    )
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy env.example .env
)

echo.
echo Starting Backend Server...
echo Backend will be available at: http://localhost:5000
echo Test endpoint: http://localhost:5000/api/test
echo.

REM Start backend in a new window
start "MultiBot Backend" cmd /k "node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

echo.
echo Setting up Frontend...
cd ..\frontend

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting Frontend...
echo Frontend will be available at: http://localhost:3000
echo.

REM Start frontend in a new window
start "MultiBot Frontend" cmd /k "npm start"

echo.
echo ==================================================
echo MultiBot Platform is starting up!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Both windows will remain open. Close them to stop the servers.
echo.
echo Press any key to exit this launcher...
pause > nul
