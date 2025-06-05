@echo off
echo ========================================
echo OpenClip Pro - Stop All Processes
echo ========================================
echo.

echo Stopping all OpenClip Pro processes...
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

REM Kill any processes using ports 3000, 5173, 8000
echo Stopping processes on development ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ========================================
echo All processes stopped successfully!
echo ========================================
echo.
pause