# Visual Guide: Jenkins Local Setup Flow

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Your Code                                            │   │
│  │  ├─ src/index.js                                    │   │
│  │  ├─ tests/todos.test.js                             │   │
│  │  ├─ Dockerfile                                      │   │
│  │  ├─ package.json                                    │   │
│  │  ├─ .github/workflows/ci-cd.yml (GitHub Actions)   │   │
│  │  └─ jenkins/Jenkinsfile (Jenkins)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│                   You push to main                           │
│                           ↓                                  │
│              GitHub sends webhook event                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Your Local Machine (Mac)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Docker Desktop                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Jenkins Container                              │  │   │
│  │  │  Port 8080: Web UI                             │  │   │
│  │  │  Port 50000: Agent communication               │  │   │
│  │  │                                                │  │   │
│  │  │ Receives webhook → Triggers build              │  │   │
│  │  │ ├─ Checkout code                              │  │   │
│  │  │ ├─ Run tests                                  │  │   │
│  │  │ ├─ Build Docker image                         │  │   │
│  │  │ ├─ Push to Docker Hub                         │  │   │
│  │  │ ├─ Deploy to Staging                          │  │   │
│  │  │ ├─ Wait for approval                          │  │   │
│  │  │ ├─ Deploy to Production                       │  │   │
│  │  │ └─ Health checks                              │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌──────────────────────┐
│    Docker Hub        │            │   Render.com         │
│  ├─ Push image       │            │  ├─ Deploy API       │
│  ├─ Store version    │            │  ├─ Health checks    │
│  └─ Pull on demand   │            │  └─ Live endpoint    │
└──────────────────────┘            └──────────────────────┘
```

## 2. Setup Timeline

```
Start                                                         End
  │                                                            │
  ├─ (1) docker-compose up                    [ 30 seconds ]  │
  │                                                            │
  ├─ (2) Get initial password                 [ 1 minute  ]  │
  │                                                            │
  ├─ (3) Complete setup wizard                [ 3 minutes ]  │
  │      ├─ Install plugins                                  │
  │      ├─ Create admin user                                │
  │      └─ Configure system                                 │
  │                                                            │
  ├─ (4) Add credentials                      [ 5 minutes ]  │
  │      ├─ GitHub token → GitHub credentials                │
  │      └─ Docker token → Docker credentials                │
  │                                                            │
  ├─ (5) Create Jenkins job                   [ 3 minutes ]  │
  │      ├─ New Pipeline item                                │
  │      ├─ Configure Git repo                               │
  │      └─ Set Script Path: jenkins/Jenkinsfile             │
  │                                                            │
  ├─ (6) Add GitHub webhook                   [ 2 minutes ]  │
  │      ├─ GitHub repo settings                             │
  │      └─ Payload URL: http://YOUR_IP:8080/github-webhook/ │
  │                                                            │
  └─ (7) Test with code push                  [ 2 minutes ]  │
         ├─ Git push → GitHub                                 │
         ├─ Webhook → Jenkins                                 │
         └─ Build → Docker Hub → Render                       │
                                                            [ ~20 min total ]
```

## 3. Git Push → Jenkins Build Flow

```
Your Local Machine
    │
    └─ git push origin main
            │
            ↓ (Network)
    
GitHub
    │
    ├─ Receive push
    │
    ├─ Match webhook: "Push event on main"
    │
    └─ Send HTTP POST to Jenkins
            │
            │ Payload:
            │ {
            │   "pusher": { "name": "you" },
            │   "repository": { "url": "..." },
            │   "ref": "refs/heads/main",
            │   "commits": [ ... ]
            │ }
            │
            ↓ (Network)
    
Jenkins (Port 8080)
    │
    ├─ Receive webhook at /github-webhook/
    │
    ├─ Parse payload → Extract repo, branch, commit
    │
    ├─ Match to job: "todo-api-pipeline"
    │
    ├─ Check if branch matches: ✅ main
    │
    └─ Trigger new build: Build #42
            │
            ├─ [STAGE 1] Checkout
            │   └─ git clone https://github.com/YOUR_USER/CICD.git
            │       └─ cd jenkins folder
            │
            ├─ [STAGE 2] Setup
            │   └─ node --version && npm --version
            │
            ├─ [STAGE 3] Install
            │   └─ npm ci
            │
            ├─ [STAGE 4] Lint
            │   └─ npm run lint
            │       └─ ESLint checks
            │
            ├─ [STAGE 5] Test
            │   └─ npm test
            │       └─ Jest coverage
            │
            ├─ [STAGE 6] Build Docker
            │   └─ docker build -t img:tag .
            │       └─ Creates image locally
            │
            ├─ [STAGE 7] Push Docker
            │   └─ docker login (using credentials)
            │   └─ docker push img:tag
            │       └─ Image now on Docker Hub ✅
            │
            ├─ [STAGE 8] Deploy Staging
            │   └─ curl https://api.render.com/deploy/staging-hook
            │       └─ Render pulls image & deploys
            │
            ├─ [STAGE 9] Smoke Tests
            │   └─ curl https://staging-todo-api.render.com/health
            │       └─ Verify staging is up
            │
            ├─ [STAGE 10] Approval Gate ⏸️
            │   └─ Waiting for human approval
            │       In Jenkins: Click "Approve"
            │
            ├─ [STAGE 11] Deploy Production
            │   └─ curl https://api.render.com/deploy/prod-hook
            │       └─ Render pulls image & deploys to prod
            │
            ├─ [STAGE 12] Health Checks
            │   └─ curl https://todo-api.render.com/health
            │       └─ Verify production is up ✅
            │
            └─ BUILD COMPLETE ✅
                ├─ All stages passed
                ├─ Code is live
                ├─ Users can access API
                └─ View logs in Jenkins console
```

## 4. Jenkins Web UI Navigation

```
http://localhost:8080
        │
        ├─ Dashboard
        │   └─ Shows all jobs, recent builds
        │
        ├─ 📁 todo-api-pipeline (Your job)
        │   │
        │   ├─ Status: ✅ Green (passed) or 🔴 Red (failed)
        │   │
        │   ├─ Build #1
        │   │  ├─ Timestamp, git commit, duration
        │   │  ├─ View Console Output (logs)
        │   │  ├─ View Artifacts
        │   │  └─ Blue Ocean (visual pipeline)
        │   │
        │   ├─ Build #2
        │   │  └─ (... same as above)
        │   │
        │   └─ Configure (edit job settings)
        │
        ├─ ⚙️ Manage Jenkins
        │   ├─ System Configuration
        │   ├─ Manage Plugins
        │   ├─ Manage Users
        │   ├─ Configure System
        │   ├─ Configure Global Security
        │   └─ Manage Credentials
        │
        └─ 👤 Profile
            └─ Change password, API tokens
```

## 5. Jenkinsfile Stages → UI

```
Jenkinsfile Stages                 Jenkins UI Display

┌─────────────────────┐            ┌──────────────────────┐
│ stage('Checkout')   │ ──────────→ │ ✅ Checkout          │
│ { steps { ... } }   │            │ 2 seconds            │
└─────────────────────┘            └──────────────────────┘

┌─────────────────────┐            ┌──────────────────────┐
│ stage('Setup')      │ ──────────→ │ ✅ Setup             │
│ { steps { ... } }   │            │ 1 second             │
└─────────────────────┘            └──────────────────────┘

┌─────────────────────┐            ┌──────────────────────┐
│ stage('Install')    │ ──────────→ │ ⏳ Install            │
│ { steps { ... } }   │            │ (npm ci running...)  │
└─────────────────────┘            └──────────────────────┘

┌─────────────────────┐            ┌──────────────────────┐
│ stage('Lint')       │ ──────────→ │ ⏳ Lint               │
│ { steps { ... } }   │            │ (eslint running...)  │
└─────────────────────┘            └──────────────────────┘

... (more stages) ...

                                   Overall Progress:
                                   ━━━━━━━━━━━━━━━░░░░░░░
                                   Stage 4 / 12 running
                                   Duration: 2m 34s
```

## 6. Troubleshooting Decision Tree

```
Jenkins build failed?
    │
    ├─ Check job configuration
    │   ├─ Is repo URL correct?
    │   ├─ Is branch */main?
    │   └─ Is script path jenkins/Jenkinsfile?
    │
    ├─ Check credentials
    │   ├─ Is github-token valid?
    │   └─ Is dockerhub-credentials valid?
    │
    ├─ Check logs
    │   ├─ Click build → Console Output
    │   ├─ Read error message
    │   └─ Fix accordingly
    │
    ├─ Check environment
    │   ├─ Is Docker daemon running?
    │   ├─ Is Docker socket accessible?
    │   └─ Is Node.js available in container?
    │
    └─ Ask for help
        ├─ Search Jenkins docs
        ├─ Check Stack Overflow
        └─ Read error logs carefully
```

## 7. File Organization

```
/Users/ratnakarchakkapalli/Documents/CICD/
│
├─ simple-webapp-ci/                    ← GitHub Pages example
│  ├─ .github/workflows/ci.yml          ← GitHub Actions
│  ├─ public/index.html
│  └─ README.md
│
├─ todo-api/                            ← Main project
│  ├─ .github/workflows/ci-cd.yml       ← GitHub Actions pipeline
│  ├─ jenkins/Jenkinsfile               ← Jenkins pipeline (copy)
│  ├─ src/index.js
│  ├─ src/todos.js
│  ├─ tests/todos.test.js
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ README.md
│  ├─ k8s/                              ← Kubernetes examples
│  ├─ terraform/                        ← Infrastructure examples
│  └─ render.yaml                       ← Render deployment
│
└─ jenkins/                             ← THIS FOLDER
   ├─ docker-compose.yml                ← Start Jenkins
   ├─ Jenkinsfile                       ← Pipeline definition
   ├─ JENKINS_SETUP.md                  ← Step-by-step guide
   ├─ GITHUB_ACTIONS_VS_JENKINS.md     ← Comparison
   ├─ QUICK_REFERENCE.md                ← Commands & snippets
   └─ README.md
```

## 8. Success Indicators

```
✅ Setup Complete When:
  └─ Jenkins accessible at http://localhost:8080
  └─ Can login with admin/admin123
  └─ todo-api-pipeline job exists
  └─ Credentials stored (github-token, dockerhub-credentials)
  └─ GitHub webhook shows "Recent Deliveries"

✅ Webhook Working When:
  └─ Git push to main triggers Jenkins build automatically
  └─ Build appears in job without manual "Build Now" click

✅ Pipeline Working When:
  └─ All stages pass (green)
  └─ Docker image pushed to Docker Hub
  └─ Render shows deployment notification

✅ End-to-End Success When:
  └─ Code change → Git push → Webhook → Jenkins build
  └─ Docker image tagged and pushed
  └─ Staging deployment + health check pass
  └─ Manual approval step shows
  └─ Production deployment + health check pass
  └─ API is live with new changes ✨
```

---

## Quick Reference

**Start Jenkins:**
```bash
cd /Users/ratnakarchakkapalli/Documents/CICD/jenkins
docker-compose up -d
open http://localhost:8080
```

**Get Password:**
```bash
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**View Logs:**
```bash
docker-compose logs -f jenkins
```

**Stop Jenkins:**
```bash
docker-compose down
```

---

This visual guide helps you understand the complete flow from code push to live deployment! 🚀
