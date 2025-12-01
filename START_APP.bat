@echo off
echo ================================
echo Starting EcoBite Application
echo ================================
echo.

echo [1/3] Compiling Backend...
call npx tsc -p tsconfig.server.json
if %errorlevel% neq 0 (
    echo ERROR: Backend compilation failed!
    pause
    exit /b 1
)
echo ✓ Backend compiled successfully
echo.

echo [2/3] Starting Backend Server (Port 3002)...
start "EcoBite Backend" cmd /k "node dist/server/index.js"
timeout /t 3 /nobreak >nul
echo ✓ Backend server started
echo.

echo [3/3] Starting Frontend (Port 5173)...
start "EcoBite Frontend" cmd /k "npx vite"
timeout /t 3 /nobreak >nul
echo ✓ Frontend server starting
echo.

echo ================================
echo ✓ Application Started!
echo ================================
echo.
echo Backend:  http://localhost:3002
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the app in your browser...
pause >nul

start http://localhost:5173

echo.
echo To stop the servers, close the terminal windows.
echo.
pause
