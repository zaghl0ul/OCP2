@echo off
echo ========================================
echo OpenClip Pro - Start Application
echo ========================================
echo.

REM Check for Node.js
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/2] Starting backend server...
echo.
cd /d "%~dp0backend"

REM Check if virtual environment exists
if exist "venv\Scripts\python.exe" (
    echo Using existing virtual environment...
    set PYTHON_CMD=venv\Scripts\python.exe
) else (
    echo ERROR: Virtual environment not found.
    echo Please set up the backend environment first.
    pause
    exit /b 1
)

REM Start backend server in new window
echo Starting FastAPI backend on port 8000...
start "OpenClip Pro Backend" cmd /k "%PYTHON_CMD% -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Backend server starting...
echo.

echo [2/2] Starting frontend server...
echo.
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

REM Start frontend server in new window
echo Starting React frontend on port 5173...
start "OpenClip Pro Frontend" cmd /k "npm run dev"

echo Frontend server starting...
echo.

echo ========================================
echo Startup Complete!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Both servers are starting in separate windows.
echo This window can be closed safely.
echo.
pause