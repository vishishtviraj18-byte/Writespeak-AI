# ============================================================
#  WriteSpeak AI — Frontend Deploy to S3 + CloudFront
#  Run: .\frontend\deploy-aws.ps1
#  Prerequisites: AWS CLI, Node.js, aws-infra\aws-config.json
# ============================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ConfigFile  = "$ProjectRoot\aws-infra\aws-config.json"

# ── Load config ───────────────────────────────────────────────
if (-not (Test-Path $ConfigFile)) {
    Write-Host "ERROR: aws-config.json not found. Run .\aws-infra\setup.ps1 first." -ForegroundColor Red
    exit 1
}
$Config     = Get-Content $ConfigFile | ConvertFrom-Json
$BucketName = $Config.BucketName
$CFID       = $Config.CFID
$CFDomain   = $Config.CFDomain
$EC2IP      = $Config.EC2PublicIP

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   WriteSpeak AI — Frontend Deploy    ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── STEP 1: Write .env.production ────────────────────────────
Write-Host "[ 1/4 ] Writing .env.production..." -ForegroundColor Yellow
$EnvContent = "VITE_API_URL=http://$EC2IP`:8080"
$EnvContent | Out-File -FilePath "$PSScriptRoot\.env.production" -Encoding utf8
Write-Host "        VITE_API_URL=http://$EC2IP`:8080" -ForegroundColor Green

# ── STEP 2: Build React App ───────────────────────────────────
Write-Host ""
Write-Host "[ 2/4 ] Building React app (npm run build)..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "npm build FAILED!" -ForegroundColor Red; exit 1 }
Write-Host "        Build complete. Output in dist/" -ForegroundColor Green

# ── STEP 3: Sync dist/ to S3 ──────────────────────────────────
Write-Host ""
Write-Host "[ 3/4 ] Uploading to S3 bucket: $BucketName..." -ForegroundColor Yellow
aws s3 sync dist/ "s3://$BucketName" --delete `
    --cache-control "public,max-age=31536000" `
    --exclude "index.html"
# Upload index.html with no-cache
aws s3 cp dist/index.html "s3://$BucketName/index.html" `
    --cache-control "no-cache,no-store,must-revalidate" `
    --content-type "text/html"
if ($LASTEXITCODE -ne 0) { Write-Host "S3 sync FAILED!" -ForegroundColor Red; exit 1 }
Write-Host "        Files uploaded to S3." -ForegroundColor Green

# ── STEP 4: Invalidate CloudFront Cache ──────────────────────
Write-Host ""
Write-Host "[ 4/4 ] Invalidating CloudFront cache (Distribution: $CFID)..." -ForegroundColor Yellow
$InvalidationId = aws cloudfront create-invalidation `
    --distribution-id $CFID `
    --paths "/*" `
    --query "Invalidation.Id" --output text
Write-Host "        Invalidation started: $InvalidationId" -ForegroundColor Green
Write-Host "        (Takes ~1-3 min to propagate globally)" -ForegroundColor DarkGray

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║         Deployment Complete!                 ║" -ForegroundColor Cyan
Write-Host "  ╠══════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "  ║  Frontend  →  https://$CFDomain" -ForegroundColor Green
Write-Host "  ║  Backend   →  http://$EC2IP`:8080" -ForegroundColor Blue
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
