# StudyAI — Claude Context File

> **For Claude:** Read this entire file before doing anything. It contains everything you need to understand the project, its current live state, and what to do on a new laptop.

---

## What This Project Is

**StudyAI** is a deployed, live AI-powered SaaS web application. Students paste notes or textbook text into the app and the AI generates flashcards, quiz questions, and a summary.

- **Live URL:** http://34.239.228.18:3000
- **GitHub Repo:** https://github.com/inshira2001/studyai-saas
- **Status:** Fully deployed and running on AWS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14, TypeScript, Tailwind CSS |
| AI | Groq API — model `llama-3.1-8b-instant` (free tier) |
| Container | Docker (multi-stage build, node:18-alpine, ~280MB) |
| Infrastructure | AWS (us-east-1 ONLY — never use any other region) |
| IaC | Terraform (state file is in `terraform/terraform.tfstate`) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |

---

## AWS Account & Resources (Already Live — Do NOT Recreate)

**AWS Account ID:** `755289151223`
**IAM User:** `Inshira-Khan`
**Region:** `us-east-1` (always — never change this)

All infrastructure was created with `terraform apply` and is already running. Do NOT run `terraform apply` unless specifically asked to change infrastructure.

### Resources

| Resource | Name / ID | Notes |
|---|---|---|
| EC2 Instance | `i-05f84594af6d14cae` | t3.micro, free tier |
| EC2 Public IP | `34.239.228.18` | App accessible at :3000 |
| ECS Cluster | `studyai-cluster` | EC2 launch type |
| ECS Service | `studyai-service` | desired count 1 |
| ECS Task Definition | `studyai` | bridge network, port 3000 |
| ECR Repository | `755289151223.dkr.ecr.us-east-1.amazonaws.com/studyai` | Docker images stored here |
| VPC | `10.0.0.0/16` | us-east-1 |
| Public Subnet | `10.0.1.0/24` | us-east-1a |
| Security Group | `studyai-sg` | Inbound 3000 + 22, outbound all |
| Lambda Function | `studyai-health-check` | Python 3.12, health pings |
| EventBridge Rule | `studyai-health-check-schedule` | rate(5 minutes) |
| SSM Parameter | `/studyai/groq-api-key` | SecureString, holds Groq API key |
| CloudWatch Log Group (app) | `/ecs/studyai` | App container logs |
| CloudWatch Log Group (lambda) | `/aws/lambda/studyai-health-check` | Health check logs |

---

## Secret Files in This Folder (Not on GitHub)

These files exist on disk but are excluded from git via `.gitignore`:

| File | What It Contains |
|---|---|
| `secrets/studyai-key.pem` | EC2 SSH private key — lets you SSH into the server |
| `terraform/terraform.tfvars` | Groq API key + EC2 key pair name — Terraform input values |
| `terraform/terraform.tfstate` | Terraform state — records all existing AWS resources |
| `terraform/terraform.tfstate.backup` | Backup of previous state |

> **IMPORTANT:** `terraform/terraform.tfstate` is critical. It is Terraform's memory of what AWS resources exist. Never delete it. If it is missing, run `terraform init` then contact the user before doing anything else with Terraform.

---

## Credentials & Keys

**Groq API Key:** stored in `terraform/terraform.tfvars` and in AWS SSM Parameter Store at `/studyai/groq-api-key`

**EC2 Key Pair Name:** `studyai-key`
**EC2 Key File:** `secrets/studyai-key.pem`

**GitHub Account:** `inshira2001`
**GitHub Email:** `asadsoomro2001@gmail.com`

**AWS credentials** are configured locally via `aws configure`. The access key ID is `AKIA27WV52333U2ZCW4C`. The secret key is stored in `~/.aws/credentials` on whatever machine is being used.

---

## Project File Structure

```
cloud_computing_project/
├── CLAUDE.md                        ← THIS FILE — read first
├── Dockerfile                       ← Multi-stage Docker build (node:18-alpine)
├── docker-compose.yml               ← Local development
├── README.md                        ← Full deployment guide
├── .gitignore                       ← Excludes secrets, state, .pem, node_modules
│
├── app/                             ← Next.js 14 application (TypeScript)
│   ├── app/
│   │   ├── layout.tsx               ← Root HTML layout
│   │   ├── page.tsx                 ← Landing page
│   │   ├── globals.css              ← Tailwind directives + flip card CSS
│   │   ├── study/
│   │   │   └── page.tsx             ← Main tool page (form + results)
│   │   └── api/
│   │       ├── generate/
│   │       │   └── route.ts         ← POST /api/generate → calls Groq AI
│   │       └── health/
│   │           └── route.ts         ← GET /api/health → returns {status: ok}
│   ├── components/
│   │   ├── StudyForm.tsx            ← Textarea + 3 checkboxes + submit button
│   │   ├── FlashcardDeck.tsx        ← 3D flip cards, prev/next navigation
│   │   ├── QuizSection.tsx          ← MCQ with green/red feedback + score
│   │   └── SummarySection.tsx       ← Bullet list + copy-to-clipboard
│   ├── lib/
│   │   ├── groq.ts                  ← Lazy Groq client (initialized on first call)
│   │   └── utils.ts                 ← cn() class merger utility
│   ├── types/
│   │   └── index.ts                 ← Flashcard, QuizQuestion, StudyOutput types
│   ├── public/
│   │   └── .gitkeep                 ← Empty — required for Docker COPY step
│   ├── package.json                 ← next@14.2.5, groq-sdk, lucide-react, tailwind
│   ├── next.config.js               ← output: standalone (required for Docker)
│   ├── tsconfig.json                ← paths: {"@/*": ["./*"]} — MUST have the *
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.local.example           ← Template: GROQ_API_KEY=your_key_here
│
├── terraform/
│   ├── main.tf                      ← AWS provider ~>5.0, region us-east-1
│   ├── variables.tf                 ← aws_region, project_name, ec2_key_pair_name, groq_api_key
│   ├── outputs.tf                   ← app_url, ecr_repository_url, cluster/service names
│   ├── vpc.tf                       ← VPC 10.0.0.0/16, subnet, IGW, route table
│   ├── security_groups.tf           ← Port 3000 + 22 inbound, all outbound
│   ├── ecr.tf                       ← ECR repo + lifecycle policy (keep last 3 images)
│   ├── iam.tf                       ← 4 IAM roles: ECS execution, task, EC2, Lambda
│   ├── ssm.tf                       ← SSM SecureString /studyai/groq-api-key
│   ├── ecs.tf                       ← ECS cluster, EC2 t3.micro, task def, service
│   ├── lambda.tf                    ← Lambda health check + EventBridge 5-min schedule
│   ├── terraform.tfvars             ← [NOT IN GIT] your private values
│   ├── terraform.tfstate            ← [NOT IN GIT] Terraform state — DO NOT DELETE
│   └── .terraform/                  ← [NOT IN GIT] downloaded provider plugins
│
├── lambda/
│   └── health_check.py              ← Pings /api/health, logs to CloudWatch
│
├── secrets/
│   └── studyai-key.pem              ← [NOT IN GIT] EC2 SSH private key
│
└── .github/
    └── workflows/
        └── deploy.yml               ← CI/CD: push to master → build → ECR → ECS
```

---

## GitHub Actions CI/CD (How Deploys Work)

Every `git push origin master` automatically:
1. Checks out code on a GitHub Ubuntu runner
2. Logs into AWS using secrets stored in GitHub
3. Builds the Docker image from `Dockerfile`
4. Pushes image to ECR tagged `:latest` and `:<commit-sha>`
5. Runs `aws ecs update-service --force-new-deployment`
6. Waits for the new container to be healthy

**GitHub Secrets** (already configured in the repo):

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | `AKIA27WV52333U2ZCW4C` |
| `AWS_SECRET_ACCESS_KEY` | in `~/.aws/credentials` on old laptop |
| `AWS_REGION` | `us-east-1` |
| `ECR_REGISTRY` | `755289151223.dkr.ecr.us-east-1.amazonaws.com` |
| `ECR_REPOSITORY` | `studyai` |
| `ECS_CLUSTER` | `studyai-cluster` |
| `ECS_SERVICE` | `studyai-service` |

---

## Known Issues Fixed (Do Not Reintroduce)

1. **`tsconfig.json` paths** — must be `"@/*": ["./*"]` with the `*` at the end. Without it, all `@/components/...` imports break at build time.
2. **Groq client** — must use lazy initialization in `lib/groq.ts`. Do NOT do `export const groq = new Groq(...)` at module level — it throws during Docker build because the API key is not available at build time.
3. **`export const dynamic = 'force-dynamic'`** — must be in `app/api/generate/route.ts`. Without it Next.js tries to statically analyze the route at build time and fails.
4. **`app/public/` directory** — must exist (even if empty). The Dockerfile copies it; if missing the build fails.
5. **EC2 instance type** — this AWS account uses `t3.micro` as the free tier instance, NOT `t2.micro`. Never change it back to t2.micro.

---

## What To Do on a New Laptop

When Claude reads this file on a new laptop, follow these steps in order:

### 1. Check what is already installed
```powershell
aws --version
terraform --version
git --version
```

### 2. Install any missing tools (Windows — run in PowerShell)
```powershell
# Reload PATH first
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# Install whatever is missing:
winget install --id Amazon.AWSCLI       --silent --accept-package-agreements --accept-source-agreements
winget install --id Hashicorp.Terraform --silent --accept-package-agreements --accept-source-agreements
winget install --id Git.Git             --silent --accept-package-agreements --accept-source-agreements
winget install --id GitHub.cli          --silent --accept-package-agreements --accept-source-agreements
```
Close and reopen terminal after installs so PATH updates.

### 3. Configure AWS credentials
Ask the user for their AWS Secret Access Key (it is NOT stored in this file for security). Then run:
```powershell
aws configure
# AWS Access Key ID:     AKIA27WV52333U2ZCW4C
# AWS Secret Access Key: [ask the user]
# Default region:        us-east-1
# Default output format: json
```
Verify with: `aws sts get-caller-identity` — should show account `755289151223`.

### 4. Verify Terraform state is intact
```powershell
cd terraform
terraform init
terraform plan
```
`terraform plan` MUST say **"No changes. Your infrastructure matches the configuration."**
If it shows changes, stop and tell the user before proceeding.

### 5. Verify the app is still live
```powershell
curl http://34.239.228.18:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 6. Set up Git identity (if not configured)
```powershell
git config user.email "asadsoomro2001@gmail.com"
git config user.name "inshira2001"
```

### 7. Authenticate GitHub CLI (needed to push secrets or create PRs)
```powershell
gh auth login --with-token
# Paste a GitHub Personal Access Token when prompted
# Scopes needed: repo, workflow, read:org
```

### 8. Done — everything is ready
The project is live. To deploy a code change:
```powershell
git add -A
git commit -m "your change"
git push origin master
# GitHub Actions auto-builds and deploys
```

---

## Quick Reference

| Task | Command |
|---|---|
| Check app is live | `curl http://34.239.228.18:3000/api/health` |
| Deploy code change | `git add -A && git commit -m "msg" && git push origin master` |
| Watch GitHub Actions | `gh run list --repo inshira2001/studyai-saas` |
| SSH into EC2 | `ssh -i secrets/studyai-key.pem ec2-user@34.239.228.18` |
| View app logs (live) | `aws logs tail /ecs/studyai --follow --region us-east-1` |
| View Lambda logs | `aws logs tail /aws/lambda/studyai-health-check --follow --region us-east-1` |
| See Terraform state | `cd terraform && terraform output` |
| Rebuild infrastructure | `cd terraform && terraform apply` (only if destroying/recreating) |
| Destroy everything | `cd terraform && terraform destroy` ⚠️ deletes all AWS resources |

---

## Cost Warning

This project runs on AWS **free tier**. The following services would cost money — do NOT add them:
- EKS (Elastic Kubernetes Service) — $72/month
- Application Load Balancer — $18/month
- Fargate — pay per vCPU/memory second
- NAT Gateway — $32/month
- RDS (database) — not free after 12 months

Current monthly cost: **$0.00**
