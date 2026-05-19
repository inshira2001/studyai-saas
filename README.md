# StudyAI — AI-Powered Study Assistant

Generate flashcards, quizzes, and summaries from your notes in under 3 seconds using Groq AI.

---

## Project Overview

StudyAI is a Next.js 14 SaaS web application that lets students paste any text — lecture notes, textbook chapters, or articles — and instantly receive AI-generated study materials:

- **Flashcards** — Interactive flip cards with questions and answers
- **Quiz Questions** — Multiple-choice questions with scoring and explanations
- **Smart Summary** — Bullet-point summaries of key ideas

### Architecture Diagram

```
                        ┌─────────────────────────────────────────────┐
                        │                  AWS (us-east-1)            │
                        │                                             │
  Browser ──HTTPS──►   │  ┌──────────────┐     ┌─────────────────┐  │
                        │  │  EC2 t2.micro│     │  ECR Repository │  │
                        │  │  (ECS Agent) │◄────│  (Docker Image) │  │
                        │  │              │     └─────────────────┘  │
                        │  │  ┌─────────┐ │                          │
                        │  │  │  ECS    │ │     ┌─────────────────┐  │
                        │  │  │ Service │ │────►│  SSM SecureString│  │
                        │  │  │ :3000   │ │     │  (GROQ_API_KEY) │  │
                        │  │  └────┬────┘ │     └─────────────────┘  │
                        │  └───────┼──────┘                          │
                        │          │ API calls                        │
                        │  ┌───────▼──────┐     ┌─────────────────┐  │
                        │  │  EventBridge │────►│  Lambda         │  │
                        │  │  (5 min)     │     │  Health Check   │  │
                        │  └──────────────┘     └────────┬────────┘  │
                        │                                │            │
                        │                       ┌────────▼────────┐  │
                        │                       │  CloudWatch Logs│  │
                        │                       └─────────────────┘  │
                        └─────────────────────────────────────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │  Groq API   │
                               │ (external)  │
                               │ llama-3.1   │
                               └─────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| AI Backend | Groq API (llama-3.1-8b-instant) |
| Language | TypeScript |
| Container | Docker (multi-stage build) |
| Registry | Amazon ECR |
| Compute | Amazon ECS on EC2 (t2.micro) |
| Secrets | AWS SSM Parameter Store |
| Monitoring | Lambda + EventBridge + CloudWatch |
| IaC | Terraform 1.5+ |
| CI/CD | GitHub Actions |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **Docker** — [docker.com](https://www.docker.com/products/docker-desktop/)
- **Terraform 1.5+** — [terraform.io](https://developer.hashicorp.com/terraform/install)
- **AWS CLI v2** — [docs.aws.amazon.com/cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Git** — [git-scm.com](https://git-scm.com/)

Verify your installations:

```bash
node --version        # v18.x.x or higher
docker --version      # Docker version 24.x.x or higher
terraform --version   # Terraform v1.5.x or higher
aws --version         # aws-cli/2.x.x or higher
```

---

## Free Services Setup

### 1. Get a Groq API Key (Free, No Credit Card Required)

1. Go to [console.groq.com](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create API Key**
5. Copy and save the key — you will need it for local development and deployment

Groq free tier includes generous rate limits sufficient for development and demos.

### 2. AWS Free Tier

All AWS resources used in this project fall within the [AWS Free Tier](https://aws.amazon.com/free/):

- **EC2 t2.micro** — 750 hours/month free for 12 months
- **ECR** — 500 MB storage free per month
- **Lambda** — 1 million free requests per month
- **CloudWatch** — 5 GB log ingestion free per month
- **SSM Parameter Store** — Standard parameters free

> **Note:** You need an AWS account with a credit card on file, but you will not be charged if you stay within free tier limits and remember to run `terraform destroy` when done.

---

## Local Development

```bash
# 1. Navigate to the app directory
cd app

# 2. Create your environment file
cp .env.local.example .env.local

# 3. Open .env.local and add your Groq API key
#    GROQ_API_KEY=gsk_your_actual_key_here

# 4. Install dependencies
npm install

# 5. Start the development server
npm run dev

# 6. Open http://localhost:3000 in your browser
```

The app will hot-reload on file changes during development.

### Running Linting

```bash
npm run lint
```

### Building for Production Locally

```bash
npm run build
npm run start
```

---

## Docker Local Test

Build and run the containerized application locally before pushing to AWS:

```bash
# From the project root (not the app/ directory)

# Build the Docker image
docker build -t studyai .

# Run the container with your Groq API key
docker run -p 3000:3000 -e GROQ_API_KEY=gsk_your_actual_key_here studyai

# Open http://localhost:3000
```

Using docker-compose (reads from app/.env.local automatically):

```bash
# Make sure app/.env.local exists with your GROQ_API_KEY
docker-compose up --build

# To run in the background
docker-compose up --build -d

# To stop
docker-compose down
```

Verify the health endpoint:

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"2024-..."}
```

---

## AWS Setup

### 1. Create IAM User for Deployment

1. Go to **AWS Console → IAM → Users → Create User**
2. Name it `studyai-deployer`
3. Select **Attach policies directly** and add these managed policies:

| Policy | Purpose |
|--------|---------|
| `AmazonECR_FullAccess` | Push/pull Docker images |
| `AmazonECS_FullAccess` | Manage ECS clusters and services |
| `AmazonEC2FullAccess` | Create EC2 instances and VPC resources |
| `IAMFullAccess` | Create IAM roles for ECS and Lambda |
| `AmazonSSMFullAccess` | Store API keys in Parameter Store |
| `AWSLambda_FullAccess` | Create health check Lambda |
| `CloudWatchFullAccess` | Create log groups and event rules |
| `AmazonEventBridgeFullAccess` | Schedule health check triggers |

4. Create the user, then go to **Security Credentials → Create Access Key**
5. Choose **Command Line Interface (CLI)**
6. Save the **Access Key ID** and **Secret Access Key**

### 2. Configure AWS CLI

```bash
aws configure
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: your_secret_key
# Default region name: us-east-1
# Default output format: json
```

### 3. Create EC2 Key Pair

```bash
# Create a key pair in us-east-1 (required for SSH access to the EC2 instance)
aws ec2 create-key-pair \
  --key-name studyai-key \
  --region us-east-1 \
  --query 'KeyMaterial' \
  --output text > studyai-key.pem

# Secure the private key file
chmod 400 studyai-key.pem
```

> Save the key pair name (`studyai-key`) — you will need it for Terraform.

---

## Terraform Deployment

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Create terraform.tfvars

Create a file named `terraform.tfvars` in the `terraform/` directory:

```hcl
aws_region        = "us-east-1"
project_name      = "studyai"
ec2_key_pair_name = "studyai-key"
groq_api_key      = "gsk_your_actual_groq_api_key_here"
```

> **Security:** Never commit `terraform.tfvars` to Git. It is already in `.gitignore`.

### 3. Review the Plan

```bash
terraform plan
```

Review the output to confirm ~20 resources will be created.

### 4. Apply Infrastructure

```bash
terraform apply
# Type 'yes' when prompted
```

This will:
- Create VPC, subnet, internet gateway, and routing
- Create ECR repository
- Create ECS cluster and task definition
- Launch EC2 t2.micro instance with ECS agent
- Store Groq API key in SSM Parameter Store
- Create Lambda health check function
- Schedule health checks every 5 minutes via EventBridge

Terraform apply takes approximately 2-3 minutes.

### 5. View Outputs

```bash
terraform output
```

Expected output:
```
app_url                = "http://X.X.X.X:3000"
ecr_repository_url     = "XXXXXXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/studyai"
ecs_cluster_name       = "studyai-cluster"
ecs_service_name       = "studyai-service"
```

---

## First Docker Push to ECR

The ECS service cannot start until you push a Docker image to ECR. Do this immediately after `terraform apply`:

```bash
# Get your ECR URL from terraform output
ECR_URL=$(terraform output -raw ecr_repository_url)
echo "ECR URL: $ECR_URL"

# Authenticate Docker with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URL

# Build the image (from project root)
cd ..
docker build -t studyai .

# Tag for ECR
docker tag studyai:latest $ECR_URL:latest

# Push to ECR
docker push $ECR_URL:latest
```

After pushing, force the ECS service to redeploy:

```bash
aws ecs update-service \
  --cluster studyai-cluster \
  --service studyai-service \
  --force-new-deployment \
  --region us-east-1
```

Wait for the service to stabilize (about 1-2 minutes), then open the app URL from terraform output.

---

## GitHub Actions CI/CD Setup

Every push to `main` automatically builds and deploys to ECS.

### Required GitHub Secrets

Go to your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret** and add all 7 secrets:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `AWS_ACCESS_KEY_ID` | Your IAM access key ID | IAM → Users → studyai-deployer → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret access key | Same place (only shown once at creation) |

> The other deployment parameters (cluster name, region, repository name) are hardcoded in the workflow file as environment variables.

### How It Works

1. Push code to `main` branch
2. GitHub Actions builds the Docker image
3. Pushes image to ECR with the git commit SHA as tag
4. Forces a new ECS deployment
5. Waits for the service to stabilize
6. Deployment complete

---

## Accessing the App

After deployment, get the app URL:

```bash
cd terraform
terraform output app_url
# Output: http://X.X.X.X:3000
```

Open that URL in your browser. The app should be live.

### Verifying the Health Endpoint

```bash
APP_URL=$(terraform output -raw app_url)
curl $APP_URL/api/health
# Expected: {"status":"ok","timestamp":"2024-..."}
```

---

## Architecture Details

### Why Each AWS Service

| Service | Role | Free Tier Limit |
|---------|------|-----------------|
| **EC2 t2.micro** | Runs the Docker container via ECS agent | 750 hrs/month (12 months) |
| **ECS on EC2** | Manages container lifecycle, restarts on failure | Free (you pay for EC2) |
| **ECR** | Stores Docker images with vulnerability scanning | 500 MB/month free |
| **SSM Parameter Store** | Secure API key storage (no secrets in env files or Git) | Free for standard params |
| **Lambda** | Serverless health check — no always-on cost | 1M requests/month free |
| **EventBridge** | Cron scheduler for Lambda — zero cost for scheduled rules | Free |
| **CloudWatch Logs** | Centralized logs from ECS and Lambda | 5 GB ingestion/month free |

### Why Not ECS Fargate?

Fargate has no free tier. A single Fargate task costs ~$14/month. EC2 t2.micro achieves the same result for free.

### Why Groq?

Groq offers a free API tier with the `llama-3.1-8b-instant` model that delivers sub-3-second inference — faster than OpenAI GPT-4 for this use case.

---

## Troubleshooting

### ECS Task Not Starting

**Symptom:** ECS service shows 0/1 running tasks.

**Steps:**
1. Go to **AWS Console → ECS → studyai-cluster → studyai-service → Tasks → Stopped tasks**
2. Click the stopped task to see the **Stop reason**
3. Common causes:
   - ECR image not pushed yet → push the image first (see First Docker Push section)
   - ECR pull auth error → re-authenticate with `aws ecr get-login-password`
   - Port 3000 already in use → check no other container is running
   - Insufficient memory → t2.micro has 1GB RAM; the task uses 768MB

### ECR Authentication Error

```bash
# Re-authenticate Docker with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
```

### Groq API Key Error

**Symptom:** App loads but generation fails with "API key is invalid or missing."

**Steps:**
1. Verify the key in SSM: `aws ssm get-parameter --name /studyai/groq-api-key --with-decryption`
2. If wrong, update it: `aws ssm put-parameter --name /studyai/groq-api-key --value gsk_NEW_KEY --type SecureString --overwrite`
3. Force ECS redeployment: `aws ecs update-service --cluster studyai-cluster --service studyai-service --force-new-deployment`

### App Shows Connection Refused

**Symptom:** Browser shows "This site can't be reached" at the EC2 IP.

**Steps:**
1. Check security group allows port 3000: `aws ec2 describe-security-groups --filters Name=group-name,Values=studyai-sg`
2. Verify ECS task is running: `aws ecs list-tasks --cluster studyai-cluster`
3. Check CloudWatch Logs: `aws logs tail /ecs/studyai --follow`

### Terraform State Issues

If you get "resource already exists" errors:

```bash
# Import the existing resource into Terraform state
terraform import aws_ecr_repository.studyai studyai

# Or destroy and recreate
terraform destroy
terraform apply
```

### SSH into the EC2 Instance

```bash
# Get the EC2 instance public IP
EC2_IP=$(terraform output -raw app_url | sed 's|http://||' | cut -d: -f1)

# SSH in
ssh -i studyai-key.pem ec2-user@$EC2_IP

# Check ECS agent status
sudo systemctl status ecs

# View running containers
docker ps

# View container logs
docker logs $(docker ps -q)
```

---

## Cleanup

To avoid any AWS charges, destroy all resources when done:

```bash
cd terraform
terraform destroy
# Type 'yes' when prompted
```

This will remove all AWS resources created by Terraform. You will also want to delete the EC2 key pair if no longer needed:

```bash
aws ec2 delete-key-pair --key-name studyai-key
rm studyai-key.pem
```

---

## Project Structure

```
cloud_computing_project/
├── app/                          # Next.js application
│   ├── app/
│   │   ├── layout.tsx            # Root HTML layout
│   │   ├── page.tsx              # Landing page
│   │   ├── globals.css           # Global styles + Tailwind
│   │   ├── study/
│   │   │   └── page.tsx          # Main study tool page
│   │   └── api/
│   │       ├── generate/
│   │       │   └── route.ts      # POST /api/generate — Groq AI endpoint
│   │       └── health/
│   │           └── route.ts      # GET /api/health — health check
│   ├── components/
│   │   ├── StudyForm.tsx         # Input form with mode selection
│   │   ├── FlashcardDeck.tsx     # 3D flip card component
│   │   ├── QuizSection.tsx       # Interactive quiz component
│   │   └── SummarySection.tsx    # Summary with copy button
│   ├── lib/
│   │   ├── groq.ts               # Groq SDK client
│   │   └── utils.ts              # Tailwind class utilities
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.local.example
├── terraform/
│   ├── main.tf                   # Provider configuration
│   ├── variables.tf              # Input variables
│   ├── outputs.tf                # Output values
│   ├── vpc.tf                    # VPC, subnet, IGW, routing
│   ├── security_groups.tf        # EC2 security group
│   ├── ecr.tf                    # ECR repository + lifecycle policy
│   ├── iam.tf                    # IAM roles and policies
│   ├── ssm.tf                    # SSM SecureString parameter
│   ├── ecs.tf                    # ECS cluster, task definition, service, EC2
│   └── lambda.tf                 # Health check Lambda + EventBridge
├── lambda/
│   └── health_check.py           # Python Lambda handler
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD pipeline
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Local Docker Compose
└── README.md                     # This file
```
