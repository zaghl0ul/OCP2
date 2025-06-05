@echo off
echo ========================================
echo OpenClip Pro - Fresh Restart Script
echo ========================================
echo.

echo [1/4] Stopping existing processes...
echo.

REM Kill Node.js processes (frontend dev server)
echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
taskkill /f /im npx.exe >nul 2>&1

REM Kill Python processes (backend server)
echo Stopping Python processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im pythonw.exe >nul 2>&1

REM Kill uvicorn processes specifically
echo Stopping uvicorn processes...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq python.exe" /fo csv ^| findstr uvicorn') do taskkill /f /pid %%i >nul 2>&1

REM Kill any processes using ports 3000, 5173, 8000
echo Stopping processes on development ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a >nul 2>&1

echo All processes stopped.
echo.

echo [2/4] Waiting for cleanup...
timeout /t 3 /nobreak >nul
echo.

echo [3/4] Starting backend server...
echo.
cd /d "%~dp0backend"

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Warning: Virtual environment not found. Using system Python.
)

REM Start backend server in new window
echo Starting FastAPI backend on port 8000...
start "OpenClip Pro Backend" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Backend server starting...
echo.

echo [4/4] Starting frontend server...
echo.
cd /d "%~dp0frontend"

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