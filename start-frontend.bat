@echo off
echo Starting MultiBot Platform Frontend...
echo.

REM Check if we're in the right directory
if not exist "frontend\package.json" (
    echo Error: frontend\package.json not found. Please run this from the project root.
    pause
    exit /b 1
)

REM Navigate to frontend directory
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

REM Start the frontend
echo Starting frontend on port 3000...
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the frontend
echo.

npm start

pause
