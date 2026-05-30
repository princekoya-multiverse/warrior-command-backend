# 🎯 WARRIOR COMMAND CENTER - Akash Deployment Guide

## Overview
This guide gets your Warrior Command Center running on Akash Network.

**Account**: princekoyawarrior@gmail.com  
**Budget**: $200 AKT credits  
**Estimated Monthly Cost**: $30-50/month (full stack) or $15-25/month (minimal)

---

## STEP 1: Prerequisites

### 1.1 Install Tools
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Akash CLI (provider-services)
curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh

# Or use Akash Console (Web UI) - RECOMMENDED for beginners
# Go to: https://console.akash.network
```

### 1.2 Docker Hub Account
- Create account at https://hub.docker.com
- You'll push your container image here
- Note your username: `YOUR_DOCKERHUB_USERNAME`

---

## STEP 2: Build & Push Docker Image

### 2.1 Build the Image
```bash
# Navigate to the project
cd warrior_command_backend/nodejs_space

# Build the Docker image
docker build -t YOUR_DOCKERHUB_USERNAME/warrior-command-backend:latest .

# Test locally first
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://warrior:password@host.docker.internal:5432/warrior_command \
  -e PORT=3000 \
  YOUR_DOCKERHUB_USERNAME/warrior-command-backend:latest

# Verify it works
curl http://localhost:3000/health
```

### 2.2 Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Push the image
docker push YOUR_DOCKERHUB_USERNAME/warrior-command-backend:latest
```

---

## STEP 3: Deploy to Akash

### Option A: Akash Console (RECOMMENDED - Easiest)
1. Go to https://console.akash.network
2. Login with your Akash wallet (princekoyawarrior@gmail.com)
3. Click **"Deploy"** → **"Upload SDL"**
4. Upload `akash-deploy.yaml` (or `akash-deploy-minimal.yaml` for budget mode)
5. **IMPORTANT**: Edit the SDL in the console to replace:
   - `YOUR_DOCKERHUB_USERNAME` → your actual Docker Hub username
   - `CHANGE_THIS_PASSWORD_NOW` → a strong password (both in postgres env AND DATABASE_URL)
   - `YOUR_ABACUS_API_KEY` → your Abacus.AI API key
   - `GENERATE_A_STRONG_SECRET_HERE` → a random 32+ character string
6. Click **"Create Deployment"**
7. Select a provider with good pricing
8. Accept the bid and wait for deployment

### Option B: Akash CLI
```bash
# Set up your certificate (first time only)
akash tx cert create client --from warrior-wallet

# Deploy
akash tx deployment create akash-deploy.yaml --from warrior-wallet

# Check status
akash query deployment list --owner YOUR_AKASH_ADDRESS

# Accept a bid
akash tx market lease create \
  --dseq DEPLOYMENT_SEQ \
  --from warrior-wallet \
  --provider PROVIDER_ADDRESS
```

---

## STEP 4: Initialize Database

Once deployed, you need to run Prisma migrations:

```bash
# SSH into the backend container (via Akash console shell)
# Or run migrations before building the image:

# Option 1: Add to Dockerfile (recommended)
# Add this line before CMD in Dockerfile:
# RUN npx prisma migrate deploy

# Option 2: Run after deployment
# Access the container shell via Akash Console
npx prisma migrate deploy
```

---

## STEP 5: Verify Deployment

```bash
# Get your deployment URL from Akash Console
# It will look like: https://RANDOM.provider.akash.pub

# Test health
curl https://YOUR_AKASH_URL/health

# Test API docs
open https://YOUR_AKASH_URL/api-docs

# Create your user (Prince)
curl -X POST https://YOUR_AKASH_URL/users \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "prince",
    "display_name": "Prince",
    "email": "princekoyawarrior@gmail.com",
    "role": "admin"
  }'
```

---

## DEPLOYMENT OPTIONS

### Full Stack (~$30-50/month)
Use `akash-deploy.yaml`
- ✅ PostgreSQL on Akash (persistent storage)
- ✅ Qdrant on Akash (vector memory)
- ✅ Backend API
- Best for: Full Web3 sovereignty

### Minimal (~$15-25/month)
Use `akash-deploy-minimal.yaml`
- ✅ Backend API on Akash
- 🔗 External PostgreSQL (Neon free tier / Supabase)
- ❌ No Qdrant (memory stored in PostgreSQL only)
- Best for: Getting started cheaply, proving the concept

### Budget Breakdown
| Service | CPU | RAM | Storage | ~Cost/month |
|---------|-----|-----|---------|-------------|
| PostgreSQL | 0.5 | 512Mi | 5Gi | ~$8-12 |
| Qdrant | 0.5 | 512Mi | 2Gi | ~$6-10 |
| Backend | 1.0 | 1Gi | 1Gi | ~$12-20 |
| **Total** | **2.0** | **2Gi** | **8Gi** | **~$26-42** |

---

## STEP 6: Connect Custom Domain (Future)

Once .warriorweb is minted on Solana:
1. Point DNS to your Akash deployment URL
2. Configure the `accept` field in SDL to match your domain
3. Update the backend's `APP_ORIGIN` env var

---

## Troubleshooting

### Container won't start
- Check logs in Akash Console → Logs tab
- Verify DATABASE_URL is correct
- Ensure Docker image is public on Docker Hub

### Database connection refused
- PostgreSQL may need a few seconds to initialize
- The backend has retry logic built in

### Out of AKT
- Monitor balance in Akash Console
- Minimal deployment extends budget significantly
- $200 AKT ≈ 4-6 months of minimal deployment

---

## Next Steps After Deployment
1. ✅ Create your admin user via API
2. ✅ Create your first project
3. 🔜 Add LiveKit server (Phase 2)
4. 🔜 Mint .warriorweb on Solana
5. 🔜 Connect domain to Akash deployment
