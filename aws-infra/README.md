# WriteSpeak AI — AWS Deployment Guide

## Architecture
```
Internet
   ├── CloudFront (HTTPS) ──→ S3 Bucket  [React frontend]
   └── EC2 t3.micro (port 8080) ──→ Docker [Spring Boot]
                        └── MongoDB Atlas (cloud, always on)
```

## Prerequisites

### 1. Install AWS CLI
Download: https://awscli.amazonaws.com/AWSCLIV2.msi  
Then configure:
```powershell
aws configure
# AWS Access Key ID:     <your-key>
# AWS Secret Access Key: <your-secret>
# Default region name:   ap-south-1
# Default output format: json
```

### 2. Install Docker Desktop
Download: https://www.docker.com/products/docker-desktop/  
Start Docker Desktop before running deploy scripts.

---

## Deployment Steps

### Step 1 — One-time AWS Setup
```powershell
.\aws-infra\setup.ps1 -Region ap-south-1
```
Creates: S3 bucket, CloudFront distribution, ECR repo, EC2 instance, security groups.  
Saves config to `aws-infra\aws-config.json`.

### Step 2 — Deploy Backend
```powershell
.\backend\deploy-aws.ps1
```
Builds Docker image → pushes to ECR → SSH deploys to EC2.

### Step 3 — Deploy Frontend
```powershell
.\frontend\deploy-aws.ps1
```
Builds React app → uploads dist/ to S3 → invalidates CloudFront cache.

---

## Re-deploying After Changes

| Changed | Run |
|---|---|
| Backend code | `.\backend\deploy-aws.ps1` |
| Frontend code | `.\frontend\deploy-aws.ps1` |
| Both | Run both in sequence |

---

## Environment Variables on EC2

The backend container receives these at runtime (injected by `deploy-aws.ps1`):

| Variable | Source |
|---|---|
| `SPRING_DATA_MONGODB_URI` | `backend\.env` |
| `JWT_SECRET` | `backend\.env` |
| `CORS_ALLOWED_ORIGINS` | Auto-set to CloudFront URL |

---

## Estimated Monthly Cost (ap-south-1)

| Service | Cost |
|---|---|
| EC2 t3.micro | ~$8–12/mo (FREE first 12 months on Free Tier) |
| S3 storage + requests | ~$0.10–1/mo |
| CloudFront | ~$0.50–2/mo |
| MongoDB Atlas M0 | **Free** |
| **Total** | **~$1–3/mo (Free Tier) or ~$9–15/mo after** |

---

## Troubleshooting

**Backend not responding?**
```powershell
ssh -i aws-infra\writespeak-key.pem ec2-user@<EC2-IP> "docker logs writespeak-backend --tail 50"
```

**Frontend shows old version?**
```powershell
aws cloudfront create-invalidation --distribution-id <CFID> --paths "/*"
```

**CORS error in browser?**
Check that `CORS_ALLOWED_ORIGINS` in the running container includes your CloudFront domain:
```powershell
ssh -i aws-infra\writespeak-key.pem ec2-user@<EC2-IP> "docker inspect writespeak-backend | grep CORS"
```
