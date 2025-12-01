@echo off
echo ================================
echo Installing New Dependencies
echo ================================
echo.

echo Installing qrcode package...
call npm install qrcode @types/qrcode
if %errorlevel% neq 0 (
    echo ERROR: Installation failed!
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo ================================
echo Starting Application
echo ================================
echo.

echo [1/2] Compiling Backend...
call npx tsc -p tsconfig.server.json
if %errorlevel% neq 0 (
    echo ERROR: Backend compilation failed!
    pause
    exit /b 1
)
echo ✓ Backend compiled
echo.

echo [2/2] Starting Servers...
start "EcoBite Backend" cmd /k "node dist/server/index.js"
timeout /t 2 /nobreak >nul

start "EcoBite Frontend" cmd /k "npx vite"
timeout /t 3 /nobreak >nul

echo.
echo ✓ Application started!
echo.
echo Backend:  http://localhost:3002
echo Frontend: http://localhost:5173
echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Press any key to exit...
pause >nul
