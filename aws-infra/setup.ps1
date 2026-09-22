# ============================================================
#  WriteSpeak AI — AWS Infrastructure Setup (One-Time)
#  Run: .\aws-infra\setup.ps1
#  Prerequisites: AWS CLI configured (aws configure)
# ============================================================

param(
    [string]$Region      = "ap-south-1",
    [string]$AppName     = "writespeak",
    [string]$EC2KeyName  = "writespeak-key"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   WriteSpeak AI — AWS Infrastructure Setup  ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Verify AWS CLI ───────────────────────────────────────────
try { aws --version | Out-Null } catch {
    Write-Host "ERROR: AWS CLI not found. Install from https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Red
    exit 1
}

$AccountId = (aws sts get-caller-identity --query Account --output text)
Write-Host "  AWS Account : $AccountId" -ForegroundColor Green
Write-Host "  Region      : $Region" -ForegroundColor Green
Write-Host ""

# ── STEP 1: S3 Bucket for Frontend ───────────────────────────
Write-Host "[ 1/6 ] Creating S3 bucket for frontend..." -ForegroundColor Yellow
$BucketName = "$AppName-frontend-$AccountId"

$existing = aws s3api head-bucket --bucket $BucketName 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "        Bucket '$BucketName' already exists, skipping." -ForegroundColor DarkGray
} else {
    if ($Region -eq "us-east-1") {
        aws s3api create-bucket --bucket $BucketName --region $Region | Out-Null
    } else {
        aws s3api create-bucket --bucket $BucketName --region $Region `
            --create-bucket-configuration LocationConstraint=$Region | Out-Null
    }
    # Disable public block for CloudFront OAC
    aws s3api put-public-access-block --bucket $BucketName `
        --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" | Out-Null
    Write-Host "        S3 bucket created: $BucketName" -ForegroundColor Green
}

# ── STEP 2: CloudFront OAC + Distribution ────────────────────
Write-Host ""
Write-Host "[ 2/6 ] Creating CloudFront distribution..." -ForegroundColor Yellow

# Create Origin Access Control
$OACConfig = @{
    Name = "$AppName-oac"
    Description = "OAC for $AppName frontend"
    SigningProtocol = "sigv4"
    SigningBehavior = "always"
    OriginAccessControlOriginType = "s3"
} | ConvertTo-Json -Compress

$OACResult = aws cloudfront create-origin-access-control `
    --origin-access-control-config $OACConfig `
    --query "OriginAccessControl.Id" --output text 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "        OAC may already exist, continuing..." -ForegroundColor DarkGray
    $OACID = "EXISTING"
} else {
    $OACID = $OACResult
    Write-Host "        OAC created: $OACID" -ForegroundColor Green
}

# Create CloudFront distribution
$CFConfig = @{
    CallerReference = "writespeak-$(Get-Date -Format 'yyyyMMddHHmmss')"
    Comment = "WriteSpeak AI Frontend"
    DefaultCacheBehavior = @{
        TargetOriginId = "S3Origin"
        ViewerProtocolPolicy = "redirect-to-https"
        CachePolicyId = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # CachingOptimized
        AllowedMethods = @{ Quantity = 2; Items = @("GET","HEAD") }
        Compress = $true
    }
    Origins = @{
        Quantity = 1
        Items = @(@{
            Id = "S3Origin"
            DomainName = "$BucketName.s3.$Region.amazonaws.com"
            S3OriginConfig = @{ OriginAccessIdentity = "" }
        })
    }
    CustomErrorResponses = @{
        Quantity = 1
        Items = @(@{
            ErrorCode = 404
            ResponseCode = 200
            ResponsePagePath = "/index.html"
            ErrorCachingMinTTL = 0
        })
    }
    DefaultRootObject = "index.html"
    Enabled = $true
    HttpVersion = "http2"
    PriceClass = "PriceClass_200"
} | ConvertTo-Json -Depth 10 -Compress

$CFResult = aws cloudfront create-distribution `
    --distribution-config $CFConfig `
    --query "[Distribution.Id, Distribution.DomainName]" `
    --output text

$CFID     = ($CFResult -split "\s+")[0]
$CFDomain = ($CFResult -split "\s+")[1]
Write-Host "        CloudFront Distribution: $CFID" -ForegroundColor Green
Write-Host "        Frontend URL: https://$CFDomain" -ForegroundColor Green

# ── STEP 3: ECR Repository for Backend Docker Image ──────────
Write-Host ""
Write-Host "[ 3/6 ] Creating ECR repository for backend..." -ForegroundColor Yellow

$ECRUri = aws ecr describe-repositories --repository-names "$AppName-backend" `
    --query "repositories[0].repositoryUri" --output text 2>&1
if ($LASTEXITCODE -ne 0) {
    $ECRUri = aws ecr create-repository --repository-name "$AppName-backend" `
        --image-scanning-configuration scanOnPush=true `
        --query "repository.repositoryUri" --output text
    Write-Host "        ECR repository created: $ECRUri" -ForegroundColor Green
} else {
    Write-Host "        ECR repository exists: $ECRUri" -ForegroundColor DarkGray
}

# ── STEP 4: EC2 Key Pair ──────────────────────────────────────
Write-Host ""
Write-Host "[ 4/6 ] Creating EC2 key pair..." -ForegroundColor Yellow

$KeyFile = "$PSScriptRoot\$EC2KeyName.pem"
$existingKey = aws ec2 describe-key-pairs --key-names $EC2KeyName --output text 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "        Key pair '$EC2KeyName' already exists." -ForegroundColor DarkGray
    if (-not (Test-Path $KeyFile)) {
        Write-Host "        WARNING: $KeyFile not found locally — you may not be able to SSH!" -ForegroundColor Yellow
    }
} else {
    aws ec2 create-key-pair --key-name $EC2KeyName `
        --query "KeyMaterial" --output text | Out-File -FilePath $KeyFile -Encoding ascii
    Write-Host "        Key pair created. Saved to: $KeyFile" -ForegroundColor Green
    Write-Host "        KEEP THIS FILE SAFE — you need it to SSH into EC2!" -ForegroundColor Yellow
}

# ── STEP 5: Security Group ────────────────────────────────────
Write-Host ""
Write-Host "[ 5/6 ] Creating security group..." -ForegroundColor Yellow

$SG_NAME = "$AppName-backend-sg"
$SGID = aws ec2 describe-security-groups --filters "Name=group-name,Values=$SG_NAME" `
    --query "SecurityGroups[0].GroupId" --output text 2>&1
if ($SGID -eq "None" -or $LASTEXITCODE -ne 0) {
    $SGID = aws ec2 create-security-group `
        --group-name $SG_NAME `
        --description "WriteSpeak AI Backend Security Group" `
        --query "GroupId" --output text
    # Allow SSH (22), HTTP (8080), HTTPS (443)
    aws ec2 authorize-security-group-ingress --group-id $SGID `
        --ip-permissions `
        "IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=0.0.0.0/0}]" `
        "IpProtocol=tcp,FromPort=8080,ToPort=8080,IpRanges=[{CidrIp=0.0.0.0/0}]" | Out-Null
    Write-Host "        Security group created: $SGID (ports 22, 8080 open)" -ForegroundColor Green
} else {
    Write-Host "        Security group exists: $SGID" -ForegroundColor DarkGray
}

# ── STEP 6: EC2 Instance ──────────────────────────────────────
Write-Host ""
Write-Host "[ 6/6 ] Launching EC2 t3.micro instance..." -ForegroundColor Yellow

# Amazon Linux 2023 AMI (ap-south-1)
$AMI = aws ec2 describe-images `
    --owners amazon `
    --filters "Name=name,Values=al2023-ami-2023*-x86_64" "Name=state,Values=available" `
    --query "sort_by(Images,&CreationDate)[-1].ImageId" `
    --output text

# User-data: install Docker on first boot
$UserData = @"
#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
"@ 
$UserDataB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($UserData))

$InstanceId = aws ec2 describe-instances `
    --filters "Name=tag:Name,Values=$AppName-backend" "Name=instance-state-name,Values=running,stopped" `
    --query "Reservations[0].Instances[0].InstanceId" --output text 2>&1

if ($InstanceId -eq "None" -or $LASTEXITCODE -ne 0) {
    $InstanceId = aws ec2 run-instances `
        --image-id $AMI `
        --instance-type t3.micro `
        --key-name $EC2KeyName `
        --security-group-ids $SGID `
        --user-data $UserDataB64 `
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$AppName-backend}]" `
        --query "Instances[0].InstanceId" --output text

    Write-Host "        EC2 instance launched: $InstanceId" -ForegroundColor Green
    Write-Host "        Waiting for instance to be running (~60s)..." -ForegroundColor DarkGray
    aws ec2 wait instance-running --instance-ids $InstanceId
} else {
    Write-Host "        EC2 instance exists: $InstanceId" -ForegroundColor DarkGray
}

$EC2PublicIP = aws ec2 describe-instances --instance-ids $InstanceId `
    --query "Reservations[0].Instances[0].PublicIpAddress" --output text

# ── Save config for deploy scripts ───────────────────────────
$Config = @{
    Region      = $Region
    AccountId   = $AccountId
    BucketName  = $BucketName
    CFID        = $CFID
    CFDomain    = $CFDomain
    ECRUri      = $ECRUri
    EC2PublicIP = $EC2PublicIP
    InstanceId  = $InstanceId
    KeyFile     = $KeyFile
    SGID        = $SGID
}
$Config | ConvertTo-Json | Out-File -FilePath "$PSScriptRoot\aws-config.json" -Encoding utf8

# ── Summary ───────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║          AWS Infrastructure Ready!           ║" -ForegroundColor Cyan
Write-Host "  ╠══════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "  ║  Frontend URL  →  https://$CFDomain" -ForegroundColor Green
Write-Host "  ║  Backend IP    →  $EC2PublicIP" -ForegroundColor Blue
Write-Host "  ║  ECR Repo      →  $ECRUri" -ForegroundColor Yellow
Write-Host "  ║  Config saved  →  aws-infra\aws-config.json" -ForegroundColor DarkGray
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next step: run .\backend\deploy-aws.ps1" -ForegroundColor White
