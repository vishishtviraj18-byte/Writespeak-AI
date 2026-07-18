#!/usr/bin/env pwsh
# ============================================================
#  WriteSpeak AI — One-Click Local Startup Script
#  Run this from the project root:  .\start.ps1
# ============================================================

$ProjectRoot = $PSScriptRoot
$MavenExe    = "$ProjectRoot\maven_temp\apache-maven-3.9.16\bin\mvn.cmd"
$BackendDir  = "$ProjectRoot\backend"
$FrontendDir = "$ProjectRoot\frontend"
$MongoData   = "C:\data\db"
$MongoExe    = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║     WriteSpeak AI — Local Dev Startup    ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── STEP 1: MongoDB ──────────────────────────────────────────
Write-Host "[ 1/3 ] Starting MongoDB..." -ForegroundColor Yellow

if (Test-Path $MongoExe) {
    # Create data dir if not exists
    if (-not (Test-Path $MongoData)) {
        New-Item -ItemType Directory -Path $MongoData -Force | Out-Null
        Write-Host "        Created MongoDB data directory: $MongoData" -ForegroundColor DarkGray
    }
    $mongoProc = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProc) {
        Write-Host "        MongoDB already running (PID $($mongoProc.Id))" -ForegroundColor Green
    } else {
        Start-Process -FilePath $MongoExe -ArgumentList "--dbpath `"$MongoData`"" -WindowStyle Minimized
        Start-Sleep -Seconds 2
        Write-Host "        MongoDB started ✓" -ForegroundColor Green
    }
} else {
    Write-Host "        MongoDB not found at $MongoExe" -ForegroundColor Red
    Write-Host "        OPTION A: Install from https://www.mongodb.com/try/download/community" -ForegroundColor DarkYellow
    Write-Host "        OPTION B: Use MongoDB Atlas free cloud DB — update application.properties" -ForegroundColor DarkYellow
    Write-Host "        NOTE: Frontend still works without backend. Press any key to continue..." -ForegroundColor DarkGray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# ── STEP 2: Backend ──────────────────────────────────────────
Write-Host ""
Write-Host "[ 2/3 ] Starting Spring Boot Backend (port 8080)..." -ForegroundColor Yellow

if (Test-Path $MavenExe) {
    $backendJob = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendDir'; & '$MavenExe' spring-boot:run" `
        -PassThru
    Write-Host "        Backend starting in new terminal (PID $($backendJob.Id))..." -ForegroundColor Green
    Write-Host "        Wait ~30s for 'Started WriteSpeakApplication' message" -ForegroundColor DarkGray
} else {
    Write-Host "        Maven not found at: $MavenExe" -ForegroundColor Red
    Write-Host "        Download Maven from: https://maven.apache.org/download.cgi" -ForegroundColor DarkYellow
}

# ── STEP 3: Frontend ─────────────────────────────────────────
Write-Host ""
Write-Host "[ 3/3 ] Starting Vite Frontend (port 5173)..." -ForegroundColor Yellow

if (Test-Path "$FrontendDir\node_modules") {
    $frontendJob = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendDir'; npm run dev" `
        -PassThru
    Write-Host "        Frontend starting in new terminal (PID $($frontendJob.Id))..." -ForegroundColor Green
} else {
    Write-Host "        node_modules missing. Running npm install first..." -ForegroundColor Yellow
    $installJob = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendDir'; npm install; npm run dev" `
        -PassThru
    Write-Host "        Installing + starting in new terminal (PID $($installJob.Id))..." -ForegroundColor Green
}

# ── DONE ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║        All services are starting!        ║" -ForegroundColor Cyan
Write-Host "  ╠══════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "  ║  Frontend  →  http://localhost:5173      ║" -ForegroundColor Green
Write-Host "  ║  Backend   →  http://localhost:8080      ║" -ForegroundColor Blue
Write-Host "  ║  MongoDB   →  mongodb://localhost:27017  ║" -ForegroundColor Yellow
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Opening browser in 5 seconds..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
