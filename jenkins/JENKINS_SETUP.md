# 🚀 Jenkins Local Setup Guide - Todo API CI/CD Pipeline

This guide walks you through setting up a local Jenkins instance using Docker Compose and connecting it to your GitHub repository for automated CI/CD.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Jenkins Initial Setup](#jenkins-initial-setup)
4. [Connect to GitHub](#connect-to-github)
5. [Configure Docker Credentials](#configure-docker-credentials)
6. [Create Jenkins Job](#create-jenkins-job)
7. [Test the Pipeline](#test-the-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ Ensure you have:
- **Docker Desktop** installed and running (Mac/Windows)
- **Docker Compose** (comes with Docker Desktop)
- **GitHub account** with your todo-api repository
- **GitHub Personal Access Token** (we'll create one)
- **Docker Hub account** (already set up from earlier)

---

## Quick Start

### 1. Start Jenkins Locally

```bash
cd /Users/ratnakarchakkapalli/Documents/CICD/jenkins

# Start Jenkins in the background
docker-compose up -d

# Check if it's running
docker-compose logs -f jenkins
```

**Wait for this line to appear:**
```
Jenkins is fully up and running
```

This takes ~30-60 seconds on first run.

### 2. Access Jenkins Web UI

Open your browser and go to:
```
http://localhost:8080
```

You should see the Jenkins login page.

### 3. Get Initial Admin Password

Run this command to get the auto-generated password:

```bash
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copy the password and paste it into Jenkins login page.

### 4. Complete Setup Wizard

1. **Paste the password** you got above
2. **Install suggested plugins** (takes ~2-3 minutes)
3. **Create first admin user:**
   - Username: `admin`
   - Password: `admin123`
   - Full name: `Jenkins Admin`
   - Email: `admin@localhost`
4. **Confirm Jenkins URL:** `http://localhost:8080/`

✅ You're in! You should see the Jenkins dashboard.

---

## Jenkins Initial Setup

### 1. Install Additional Plugins

Go to **Manage Jenkins** → **Manage Plugins**

Search for and install:
- `Pipeline` (usually pre-installed)
- `GitHub` - for GitHub integration
- `Docker` - for Docker operations
- `Docker Pipeline` - for Docker in pipelines
- `Credentials Binding Plugin` - for secrets management

Click **Install without restart** and let Jenkins restart automatically.

### 2. Configure System Settings

Go to **Manage Jenkins** → **Configure System**

Look for **GitHub** section:
- Leave defaults as-is (we'll use webhooks from GitHub side)

---

## Connect to GitHub

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Fill in:
   - **Note:** `Jenkins CI/CD Token`
   - **Expiration:** 90 days
   - **Scopes:** Select:
     - ✅ `repo` (full control of private repositories)
     - ✅ `admin:repo_hook` (write access to hooks)
     - ✅ `admin:org_hook` (organization webhooks)
4. Click **Generate token**
5. **Copy the token** (you won't see it again!)

### Step 2: Add Token to Jenkins Credentials

1. Go to Jenkins → **Manage Jenkins** → **Manage Credentials**
2. Click on **Jenkins** (under Stores)
3. Click **Global credentials (unrestricted)**
4. Click **Add Credentials** (left sidebar)
5. Fill in:
   - **Kind:** `Username with password`
   - **Username:** Your GitHub username
   - **Password:** Paste the token you just created
   - **ID:** `github-token`
   - **Description:** `GitHub Personal Access Token`
6. Click **Create**

### Step 3: Create Jenkins Webhook Token

We need a token that GitHub will use to trigger Jenkins builds.

1. Go to Jenkins → **Manage Jenkins** → **Configure System**
2. Scroll to **GitHub** section
3. Click **Add GitHub Server**
4. Set **API URL:** `https://api.github.com`
5. Under **Credentials,** select the GitHub token you just created
6. Click **Test connection** (you should see "Credentials verified")
7. Save

---

## Configure Docker Credentials

### Step 1: Add Docker Hub Credentials to Jenkins

1. Go to Jenkins → **Manage Jenkins** → **Manage Credentials**
2. Click on **Jenkins** → **Global credentials**
3. Click **Add Credentials**
4. Fill in:
   - **Kind:** `Username with password`
   - **Username:** Your Docker Hub username
   - **Password:** Your Docker Hub access token (or password)
   - **ID:** `dockerhub-credentials`
   - **Description:** `Docker Hub Credentials`
5. Click **Create**

### Step 2: Configure Jenkins to Use Docker

1. Go to **Manage Jenkins** → **Configure System**
2. Look for **Docker** section
3. Set **Docker URL:** `unix:///var/run/docker.sock`
4. Click **Test Connection** (should show Docker version)
5. Save

---

## Create Jenkins Job

### Step 1: Create a New Pipeline Job

1. Click **New Item** (or go to **Create a job**)
2. Enter job name: `todo-api-pipeline`
3. Select **Pipeline** job type
4. Click **OK**

### Step 2: Configure Pipeline

1. In the job configuration page, scroll to **Pipeline** section
2. For **Definition**, select: `Pipeline script from SCM`
3. For **SCM**, select: `Git`
4. Fill in:
   - **Repository URL:** Your GitHub repo URL
     ```
     https://github.com/YOUR_USERNAME/CICD.git
     ```
   - **Credentials:** Select the GitHub token you created
   - **Branch:** `*/main`
5. For **Script Path:** `jenkins/Jenkinsfile`
6. Save

### Step 3: Verify Job is Configured

1. Go back to the job page
2. Click **Build Now** to trigger a test build
3. Watch the console output (click on the build number)

**Expected output:**
```
📦 Checking out code from GitHub...
🔧 Setting up Node.js environment...
📥 Installing npm dependencies...
... (continues through all stages)
```

---

## Connect GitHub to Jenkins (Webhooks)

### Step 1: Get Jenkins Webhook URL

Your Jenkins webhook URL is:
```
http://YOUR_MACHINE_IP:8080/github-webhook/
```

**Find YOUR_MACHINE_IP:**
```bash
# On Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Look for something like: inet 192.168.x.x
```

Let's say it's `192.168.1.100`, then your webhook is:
```
http://192.168.1.100:8080/github-webhook/
```

### Step 2: Add Webhook to GitHub Repository

1. Go to your GitHub repo → **Settings** → **Webhooks**
2. Click **Add webhook**
3. Fill in:
   - **Payload URL:** `http://YOUR_IP:8080/github-webhook/`
   - **Content type:** `application/json`
   - **Events:** Select `Just the push event`
   - **Active:** Check the box
4. Click **Add webhook**

### Step 3: Test the Webhook

1. Edit any file in your repo (e.g., add a comment to `README.md`)
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "Test Jenkins webhook"
   git push origin main
   ```
3. Go back to Jenkins
4. Your pipeline should automatically start building!
5. Watch the build progress in real-time

---

## Test the Pipeline

### Manual Trigger

1. Go to Jenkins → `todo-api-pipeline`
2. Click **Build Now**
3. Click on the build number (e.g., `#1`)
4. Click **Console Output** to see logs in real-time

### With Git Push (Automated)

1. Make a code change in your local repo:
   ```bash
   cd /Users/ratnakarchakkapalli/Documents/CICD/todo-api
   
   # Edit something (e.g., add a new todo)
   nano src/todos.js
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Add new feature via Jenkins test"
   git push origin main
   ```

3. Go to Jenkins dashboard
4. You should see the build trigger automatically
5. Watch the pipeline progress through all stages

---

## Pipeline Stages Explained

| Stage | What It Does |
|-------|-------------|
| **Checkout** | Clones your GitHub repo |
| **Setup** | Checks Node.js and npm versions |
| **Install Dependencies** | Runs `npm ci` |
| **Lint** | Runs ESLint on code |
| **Test** | Runs Jest tests with coverage |
| **Build Docker Image** | Creates Docker image (main branch only) |
| **Push to Registry** | Pushes to Docker Hub (main branch only) |
| **Deploy to Staging** | Simulates staging deployment |
| **Smoke Tests** | Runs basic health checks |
| **Approval** | ⏸️ Waits for manual approval |
| **Deploy to Production** | Simulates production deployment |
| **Health Check** | Verifies production is healthy |

---

## Monitoring & Logs

### View Build Logs

1. Go to Jenkins job
2. Click on a build number
3. Click **Console Output**

### Check Jenkins Health

```bash
# View Jenkins logs
docker-compose logs -f jenkins

# View running containers
docker ps

# Stop Jenkins
docker-compose down

# Start Jenkins again
docker-compose up -d
```

### Clean Up & Reset

```bash
# Stop and remove containers
docker-compose down

# Remove Jenkins data (fresh start)
docker volume rm jenkins_jenkins_home

# Start fresh
docker-compose up -d
```

---

## Troubleshooting

### Jenkins Won't Start

```bash
# Check logs
docker-compose logs jenkins

# Common issues:
# - Port 8080 already in use: Change in docker-compose.yml
# - Docker socket permission: May need sudo
```

### Build Fails with "Jenkinsfile not found"

- Ensure your repo has `jenkins/Jenkinsfile`
- Check **Pipeline** → **Script Path** is set to `jenkins/Jenkinsfile`

### Webhook Not Triggering Builds

1. Verify webhook URL is correct in GitHub Settings
2. Check GitHub → Webhooks → Recent Deliveries (see if requests are being sent)
3. Verify Jenkins is accessible from GitHub (check your firewall)

### Docker Build Fails

1. Ensure Docker daemon is running
2. Check Docker credentials are configured in Jenkins
3. Try building Docker image manually:
   ```bash
   cd /Users/ratnakarchakkapalli/Documents/CICD/todo-api
   docker build -t test-image .
   ```

### Need to Restart Everything

```bash
# Kill everything
docker-compose down -v

# Fresh start
docker-compose up -d

# Tail logs
docker-compose logs -f jenkins
```

---

## Next Steps

1. ✅ Run your first Jenkins pipeline manually
2. ✅ Set up GitHub webhook for automated triggers
3. ✅ Make code changes and watch pipeline auto-trigger
4. ✅ Check Docker Hub to see images being pushed
5. ✅ Explore Jenkins UI: jobs, builds, artifacts, logs

## Comparison: GitHub Actions vs Jenkins

| Feature | GitHub Actions | Jenkins |
|---------|---|---|
| **Setup** | Instant | ~5 min |
| **Maintenance** | None | Server management |
| **Cost** | Free | Free (self-hosted) |
| **Availability** | Hosted | Local/On-premise |
| **Learning** | Easy | Moderate |
| **Flexibility** | Good | Excellent |

---

Happy building! 🚀

For questions or issues, check the **Troubleshooting** section above.
