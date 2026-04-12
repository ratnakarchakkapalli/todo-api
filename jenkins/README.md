# 🚀 Jenkins CI/CD - Local Setup

This folder contains everything you need to set up **Jenkins locally** using Docker Compose and run a complete CI/CD pipeline for the Todo API.

## Quick Start (2 minutes)

```bash
# 1. Navigate to jenkins folder
cd /Users/ratnakarchakkapalli/Documents/CICD/jenkins

# 2. Start Jenkins
docker-compose up -d

# 3. Get initial password
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# 4. Open browser
open http://localhost:8080
```

Login with `admin` and the password from step 3.

## Files in This Folder

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Docker Compose configuration to run Jenkins |
| `Jenkinsfile` | Pipeline definition for Todo API CI/CD |
| `JENKINS_SETUP.md` | Complete step-by-step setup guide |
| `GITHUB_ACTIONS_VS_JENKINS.md` | Detailed comparison between GitHub Actions and Jenkins |
| `QUICK_REFERENCE.md` | Handy commands and code snippets |
| `README.md` | This file |

## What You'll Learn

✅ **Jenkins Fundamentals**
- Running Jenkins in Docker
- Creating and configuring jobs
- Understanding Jenkinsfile syntax

✅ **CI/CD Pipeline**
- Lint & test stages
- Docker build & push
- Multi-environment deployments
- Manual approval gates

✅ **GitHub Integration**
- Webhook setup
- Auto-triggering builds on code push
- Checking build status

✅ **Real-World Skills**
- Enterprise CI/CD patterns
- Docker integration
- Credential management
- Error handling & logging

## Architecture

```
┌─────────────────────────────────────────┐
│        Your Machine (Mac)               │
├─────────────────────────────────────────┤
│  Docker Desktop                         │
│  ├─ Jenkins Container                   │
│  │  ├─ Port 8080 (Web UI)              │
│  │  ├─ Port 50000 (Agent comm)         │
│  │  └─ /var/jenkins_home (data)        │
│  └─ Networks                           │
│     └─ jenkins-network                 │
│                                         │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│           GitHub                        │
├─────────────────────────────────────────┤
│  Your CICD Repository                  │
│  ├─ Code (src/)                        │
│  ├─ Tests (tests/)                     │
│  ├─ Jenkinsfile                        │
│  └─ Dockerfile                         │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│        External Services                |
├─────────────────────────────────────────┤
│  Docker Hub (push images)               │
│  Render (deploy API)                    │
│  GitHub Webhooks (trigger builds)       │
└─────────────────────────────────────────┘
```

## Pipeline Flow

```
Code Push to GitHub
    ↓
GitHub sends webhook
    ↓
Jenkins receives webhook
    ↓
Checkout code
    ↓
Setup environment (Node.js)
    ↓
Install dependencies (npm)
    ↓
Lint code (ESLint)
    ↓
Run tests (Jest)
    ↓
Build Docker image
    ↓
Push to Docker Hub
    ↓
Deploy to Staging
    ↓
Smoke tests
    ↓
⏸️ Manual approval gate
    ↓
Deploy to Production
    ↓
Health checks
    ↓
✅ Done!
```

## Setup Steps

### Step 1: Start Jenkins
See **Quick Start** above.

### Step 2: Initial Configuration
Complete the setup wizard:
- Paste initial password
- Install suggested plugins
- Create admin user (admin/admin123)

### Step 3: Create Credentials
Two credentials needed:

1. **GitHub Token**
   - Go to GitHub Settings → Personal access tokens
   - Create token with `repo` and `admin:repo_hook` scopes
   - In Jenkins: **Manage Jenkins** → **Credentials** → Add (ID: `github-token`)

2. **Docker Hub**
   - Use your Docker Hub username and token/password
   - In Jenkins: **Manage Jenkins** → **Credentials** → Add (ID: `dockerhub-credentials`)

### Step 4: Create Job
1. Click **New Item**
2. Name: `todo-api-pipeline`
3. Type: **Pipeline**
4. Configure:
   - SCM: `Git`
   - Repository: `https://github.com/YOUR_USER/CICD.git`
   - Branch: `*/main`
   - Script Path: `jenkins/Jenkinsfile`
5. Save

### Step 5: Setup Webhook
1. Go to your GitHub repo → **Settings** → **Webhooks**
2. Click **Add webhook**
3. Payload URL: `http://YOUR_MACHINE_IP:8080/github-webhook/`
4. Content type: `application/json`
5. Events: `Just the push event`
6. Save

### Step 6: Test
Push code to GitHub and watch Jenkins auto-trigger! 🎉

## Common Commands

```bash
# Start Jenkins
docker-compose up -d

# View logs
docker-compose logs -f jenkins

# Stop Jenkins
docker-compose down

# Restart Jenkins
docker-compose restart jenkins

# View Jenkins data folder
ls -la /var/lib/docker/volumes/jenkins_jenkins_home/_data/

# Clean up everything (fresh start)
docker-compose down -v
```

## Troubleshooting

### Jenkins Won't Start
```bash
# Check logs
docker-compose logs jenkins

# Port 8080 in use?
lsof -i :8080
# Kill process: kill -9 <PID>
```

### Build Fails
1. Check console output: Click build → **Console Output**
2. Common issues:
   - Jenkinsfile path incorrect
   - Docker credentials missing
   - Node.js not installed in container

### Webhook Not Triggering
1. Verify webhook URL is correct in GitHub
2. Check Jenkins can receive webhooks (not behind firewall)
3. Look at webhook **Recent Deliveries** in GitHub

## Comparison with GitHub Actions

| Aspect | GitHub Actions | Jenkins |
|--------|---|---|
| **Setup** | 5 min | 30 min |
| **Infrastructure** | Hosted | Self-hosted (your Mac) |
| **Cost** | Free | Free (your Mac) |
| **Flexibility** | Good | Excellent |
| **Learning Curve** | Easy | Moderate |
| **Enterprise Ready** | Good | Excellent |

**See `GITHUB_ACTIONS_VS_JENKINS.md` for full comparison**

## What's Next?

1. ✅ Get Jenkins running locally
2. ✅ Create and run your first build manually
3. ✅ Set up GitHub webhook
4. ✅ Push code and watch auto-trigger
5. ✅ Explore Jenkins UI (jobs, logs, artifacts)
6. 🎯 (Optional) Deploy to real Kubernetes cluster

## Resources

- **Jenkins Documentation:** https://www.jenkins.io/doc/
- **Jenkinsfile Syntax:** https://www.jenkins.io/doc/book/pipeline/
- **Docker Compose:** https://docs.docker.com/compose/

## File Structure

```
jenkins/
├── docker-compose.yml                    # Start Jenkins
├── Jenkinsfile                           # Pipeline definition
├── JENKINS_SETUP.md                      # Detailed setup guide
├── GITHUB_ACTIONS_VS_JENKINS.md         # Comparison
├── QUICK_REFERENCE.md                    # Commands & snippets
└── README.md                             # This file
```

## Summary

This is a **complete, production-like CI/CD setup using Jenkins**. By the end, you'll understand:

- ✅ How Jenkins orchestrates CI/CD pipelines
- ✅ How Jenkinsfiles compare to GitHub Actions
- ✅ Docker integration in real pipelines
- ✅ Webhook-triggered automation
- ✅ Manual approval gates for safe deployments
- ✅ Enterprise-grade CI/CD patterns

**You now have TWO CI/CD systems mastered:**
1. GitHub Actions (cloud-hosted)
2. Jenkins (self-hosted)

This knowledge transfers to any CI/CD tool: GitLab CI, CircleCI, Travis CI, etc.

---

**Ready to begin?**

```bash
cd /Users/ratnakarchakkapalli/Documents/CICD/jenkins
docker-compose up -d
open http://localhost:8080
```

Happy building! 🚀
