# ============================================================
#  WriteSpeak AI — Backend Deploy to EC2
#  Run: .\backend\deploy-aws.ps1
#  Prerequisites: AWS CLI, Docker Desktop, aws-infra\aws-config.json
# ============================================================

param(
    [string]$MongoUri   = $env:SPRING_DATA_MONGODB_URI,
    [string]$JwtSecret  = $env:JWT_SECRET
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ConfigFile  = "$ProjectRoot\aws-infra\aws-config.json"

# ── Load config ───────────────────────────────────────────────
if (-not (Test-Path $ConfigFile)) {
    Write-Host "ERROR: aws-config.json not found. Run .\aws-infra\setup.ps1 first." -ForegroundColor Red
    exit 1
}
$Config = Get-Content $ConfigFile | ConvertFrom-Json

$Region     = $Config.Region
$AccountId  = $Config.AccountId
$ECRUri     = $Config.ECRUri
$EC2IP      = $Config.EC2PublicIP
$KeyFile    = $Config.KeyFile
$CFDomain   = $Config.CFDomain

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   WriteSpeak AI — Backend Deploy     ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Validate env vars ────────────────────────────────────────
if (-not $MongoUri) {
    # Try reading from .env file
    $EnvFile = "$PSScriptRoot\.env"
    if (Test-Path $EnvFile) {
        Get-Content $EnvFile | ForEach-Object {
            if ($_ -match "^SPRING_DATA_MONGODB_URI=(.+)$") { $MongoUri = $Matches[1] }
            if ($_ -match "^JWT_SECRET=(.+)$")              { $JwtSecret = $Matches[1] }
        }
    }
}
if (-not $MongoUri) {
    Write-Host "ERROR: SPRING_DATA_MONGODB_URI not set. Set it as env var or in backend\.env" -ForegroundColor Red
    exit 1
}
if (-not $JwtSecret) {
    Write-Host "ERROR: JWT_SECRET not set." -ForegroundColor Red
    exit 1
}

# ── STEP 1: Build JAR ────────────────────────────────────────
Write-Host "[ 1/5 ] Building Spring Boot JAR..." -ForegroundColor Yellow
$MavenExe = "$ProjectRoot\maven_temp\apache-maven-3.9.16\bin\mvn.cmd"
& $MavenExe -f "$PSScriptRoot\pom.xml" package -DskipTests -B -q
if ($LASTEXITCODE -ne 0) { Write-Host "Maven build FAILED!" -ForegroundColor Red; exit 1 }
Write-Host "        JAR built successfully." -ForegroundColor Green

# ── STEP 2: Build Docker Image ───────────────────────────────
Write-Host ""
Write-Host "[ 2/5 ] Building Docker image..." -ForegroundColor Yellow
$ImageTag = "$ECRUri`:latest"
docker build -t $ImageTag $PSScriptRoot
if ($LASTEXITCODE -ne 0) { Write-Host "Docker build FAILED!" -ForegroundColor Red; exit 1 }
Write-Host "        Image built: $ImageTag" -ForegroundColor Green

# ── STEP 3: Push to ECR ──────────────────────────────────────
Write-Host ""
Write-Host "[ 3/5 ] Pushing image to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"
docker push $ImageTag
if ($LASTEXITCODE -ne 0) { Write-Host "ECR push FAILED!" -ForegroundColor Red; exit 1 }
Write-Host "        Image pushed to ECR." -ForegroundColor Green

# ── STEP 4: Update S3 bucket policy for CORS domain ─────────
# (done in frontend deploy, skip here)

# ── STEP 5: SSH into EC2 and run new container ───────────────
Write-Host ""
Write-Host "[ 4/5 ] Deploying to EC2 ($EC2IP)..." -ForegroundColor Yellow

# Escape the MongoUri for bash
$MongoUriEscaped = $MongoUri -replace "'", "'\\''";
$JwtEscaped = $JwtSecret -replace "'", "'\\''";

$RemoteCmd = @"
set -e
# Login to ECR
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $AccountId.dkr.ecr.$Region.amazonaws.com

# Pull latest image
docker pull $ImageTag

# Stop old container if running
docker stop writespeak-backend 2>/dev/null || true
docker rm   writespeak-backend 2>/dev/null || true

# Run new container
docker run -d \
  --name writespeak-backend \
  --restart always \
  -p 8080:8080 \
  -e SPRING_DATA_MONGODB_URI='$MongoUriEscaped' \
  -e JWT_SECRET='$JwtEscaped' \
  -e CORS_ALLOWED_ORIGINS='https://$CFDomain' \
  $ImageTag

echo 'Container started successfully!'
docker ps | grep writespeak
"@

# Write remote script to temp file and SCP it
$TempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$RemoteCmd | Out-File -FilePath $TempScript -Encoding utf8 -NoNewline

ssh -o StrictHostKeyChecking=no -i $KeyFile "ec2-user@$EC2IP" "bash -s" < $TempScript
Remove-Item $TempScript -ErrorAction SilentlyContinue

if ($LASTEXITCODE -ne 0) { Write-Host "EC2 deploy FAILED!" -ForegroundColor Red; exit 1 }

# ── STEP 5: Health Check ──────────────────────────────────────
Write-Host ""
Write-Host "[ 5/5 ] Verifying backend health..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
try {
    $resp = Invoke-WebRequest "http://$EC2IP`:8080/actuator/health" -UseBasicParsing -TimeoutSec 15
    Write-Host "        Backend healthy! Status: $($resp.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "        Health check returned error (may still be starting): $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Backend live at: http://$EC2IP`:8080" -ForegroundColor Green
Write-Host "  Next step: run .\frontend\deploy-aws.ps1" -ForegroundColor White
