# PULSE Launcher Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      PULSE - Real-Time Interactive Polling Platform" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Start Go Backend
Write-Host "`n[1/3] Starting Go Backend on port 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; ..\go_sdk\go\bin\go.exe run main.go"

Start-Sleep -Seconds 2

# 2. Start Vite Frontend
Write-Host "[2/3] Starting Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; npm run dev --prefix frontend"

Start-Sleep -Seconds 3

# 3. Start Cloudflare Tunnel
Write-Host "[3/3] Starting Cloudflare Public Internet Tunnel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; .\cloudflared.exe tunnel --protocol http2 --url http://localhost:5173"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  PULSE Services are now running!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Local PC:   http://localhost:5173" -ForegroundColor White
Write-Host "  Wi-Fi LAN:  http://192.168.29.246:5173" -ForegroundColor White
Write-Host "`n  The public tunnel window will display your live" -ForegroundColor White
Write-Host "  Cloudflare HTTPS URL for sharing with anyone worldwide!" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green

