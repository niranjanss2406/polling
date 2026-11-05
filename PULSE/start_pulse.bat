@echo off
title PULSE - Real-Time Interactive Polling Platform
echo ========================================================
echo       PULSE - Real-Time Interactive Polling Platform
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Go Backend on port 8080...
start "PULSE Backend" cmd /k "cd backend && ..\go_sdk\go\bin\go.exe run main.go"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Vite Frontend on port 5173...
start "PULSE Frontend" cmd /k "npm run dev --prefix frontend"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Cloudflare Public Internet Tunnel...
start "PULSE Public Tunnel" cmd /k "cloudflared.exe tunnel --protocol http2 --url http://localhost:5173"

echo.
echo ========================================================
echo   PULSE Services are now running!
echo ========================================================
echo   Local PC:    http://localhost:5173
echo   Wi-Fi LAN:   http://192.168.29.246:5173
echo.
echo   Check the "PULSE Public Tunnel" window for your
echo   permanent Cloudflare HTTPS public link!
echo ========================================================
pause

