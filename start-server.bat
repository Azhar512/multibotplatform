@echo off
echo Starting MultiBot Platform Server...
echo.

REM Check if we're in the right directory
if not exist "Backend\server.js" (
    echo Error: Backend\server.js not found. Please run this from the project root.
    pause
    exit /b 1
)

REM Navigate to Backend directory
cd Backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy env.example .env
)

REM Start the server
echo Starting server on port 5000...
echo Server will be available at: http://localhost:5000
echo Test endpoint: http://localhost:5000/api/test
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
