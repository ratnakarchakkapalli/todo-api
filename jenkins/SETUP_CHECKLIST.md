# ✅ Jenkins Setup Checklist

Use this checklist to track your progress setting up Jenkins locally.

## Phase 1: Initial Setup (5 minutes)

- [ ] Open terminal
- [ ] Navigate: `cd /Users/ratnakarchakkapalli/Documents/CICD/jenkins`
- [ ] Start Jenkins: `docker-compose up -d`
- [ ] Wait for "Jenkins is fully up and running" message
  ```bash
  docker-compose logs -f jenkins
  # Watch until you see "Jenkins is fully up and running"
  # Press Ctrl+C to stop watching
  ```

## Phase 2: Access Jenkins (2 minutes)

- [ ] Open browser to `http://localhost:8080`
- [ ] See Jenkins login page
- [ ] Get initial password:
  ```bash
  docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
  ```
- [ ] Copy the password (long string)
- [ ] Paste into Jenkins: **Username field**
- [ ] Click **Continue**

## Phase 3: Setup Wizard (5 minutes)

- [ ] **Plugin Installation**
  - [ ] Click **"Install suggested plugins"**
  - [ ] Wait for installation (~2-3 minutes)
  - [ ] See "Customize Jenkins" page

- [ ] **Create Admin User**
  - [ ] Username: `admin`
  - [ ] Password: `admin123`
  - [ ] Full Name: `Jenkins Admin`
  - [ ] Email: `your-email@example.com`
  - [ ] Click **"Save and Continue"**

- [ ] **Instance Configuration**
  - [ ] Jenkins URL: `http://localhost:8080/` (default is fine)
  - [ ] Click **"Save and Finish"**

- [ ] **Jenkins is ready!**
  - [ ] See dashboard with "Welcome to Jenkins"

## Phase 4: Install Required Plugins (5 minutes)

- [ ] Click **Manage Jenkins** (left menu)
- [ ] Click **Manage Plugins**
- [ ] Click **Available plugins** tab
- [ ] Search for and install:
  - [ ] **GitHub** (search: "github")
  - [ ] **Docker** (search: "docker")
  - [ ] **Docker Pipeline** (search: "docker pipeline")
  - [ ] Pipeline plugins (may be pre-installed)
- [ ] Click **Download now and install after restart**
- [ ] Wait for installation
- [ ] Check **Restart Jenkins when installation is complete** (bottom)
- [ ] Jenkins will restart (~1 minute)

## Phase 5: Create GitHub Token (3 minutes)

- [ ] Go to GitHub: `https://github.com/settings/tokens`
- [ ] Click **"Generate new token (classic)"**
- [ ] Fill in:
  - [ ] **Note:** `Jenkins CI/CD Token`
  - [ ] **Expiration:** 90 days
  - [ ] **Scopes:** Select:
    - [ ] ✅ repo (full control of repositories)
    - [ ] ✅ admin:repo_hook (write access to hooks)
    - [ ] ✅ admin:org_hook (organization hooks)
- [ ] Click **"Generate token"**
- [ ] **IMPORTANT:** Copy the token (you won't see it again!)
  ```
  Token looks like: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- [ ] Keep this tab open (you'll need the token)

## Phase 6: Add GitHub Token to Jenkins (3 minutes)

- [ ] Go back to Jenkins
- [ ] Click **Manage Jenkins**
- [ ] Click **Manage Credentials**
- [ ] Click **Jenkins** (under "Stores")
- [ ] Click **Global credentials (unrestricted)**
- [ ] Click **Add Credentials** (left sidebar)
- [ ] Fill in:
  - [ ] **Kind:** `Username with password`
  - [ ] **Username:** Your GitHub username (e.g., `your-github-user`)
  - [ ] **Password:** Paste the token you copied
  - [ ] **ID:** `github-token` (important!)
  - [ ] **Description:** `GitHub Personal Access Token`
- [ ] Click **Create**

## Phase 7: Add Docker Hub Credentials (3 minutes)

- [ ] Still in **Manage Credentials** → **Global credentials**
- [ ] Click **Add Credentials** again
- [ ] Fill in:
  - [ ] **Kind:** `Username with password`
  - [ ] **Username:** Your Docker Hub username
  - [ ] **Password:** Your Docker Hub access token or password
  - [ ] **ID:** `dockerhub-credentials` (important!)
  - [ ] **Description:** `Docker Hub Credentials`
- [ ] Click **Create**

## Phase 8: Create Pipeline Job (5 minutes)

- [ ] Go to Jenkins dashboard
- [ ] Click **New Item** (or **Create a job**)
- [ ] **Item name:** `todo-api-pipeline`
- [ ] **Type:** Select **Pipeline**
- [ ] Click **OK**

### Configure the Job:

- [ ] Scroll to **Pipeline** section
- [ ] **Definition:** Select `Pipeline script from SCM`
- [ ] **SCM:** Select `Git`
- [ ] Fill in:
  - [ ] **Repository URL:** 
    ```
    https://github.com/YOUR_USERNAME/CICD.git
    ```
    (Replace YOUR_USERNAME with your GitHub username)
  - [ ] **Credentials:** Select the GitHub token you created (`github-token`)
  - [ ] **Branch:** Leave as `*/master` OR change to `*/main` (match your default branch)
- [ ] **Script Path:** `jenkins/Jenkinsfile` (must be exact!)
- [ ] Click **Save**

## Phase 9: Test Build (Manual)

- [ ] You should be on the job page
- [ ] Click **Build Now** (left sidebar)
- [ ] A new build appears (e.g., `#1`)
- [ ] Click on the build number
- [ ] Click **Console Output**
- [ ] Watch the build execute!
- [ ] You should see:
  ```
  📦 Checking out code from GitHub...
  🔧 Setting up Node.js environment...
  📥 Installing npm dependencies...
  🔍 Running ESLint...
  🧪 Running Jest tests with coverage...
  ... (continues)
  ```

## Phase 10: Setup GitHub Webhook (5 minutes)

**Only do this if you want auto-triggering builds!**

- [ ] Find your machine IP:
  ```bash
  # On Mac:
  ifconfig | grep "inet " | grep -v 127.0.0.1
  # Look for something like: inet 192.168.1.100
  ```
  - [ ] Your IP: `192.168.1.___` (write it down)

- [ ] Go to your GitHub repo
- [ ] Click **Settings** → **Webhooks**
- [ ] Click **Add webhook**
- [ ] Fill in:
  - [ ] **Payload URL:** 
    ```
    http://192.168.1.100:8080/github-webhook/
    ```
    (Replace IP with yours from above)
  - [ ] **Content type:** `application/json`
  - [ ] **Events:** Select `Just the push event`
  - [ ] **Active:** ✅ Check the box
- [ ] Click **Add webhook**

### Test the Webhook:

- [ ] Make a small change to your repo:
  ```bash
  cd /Users/ratnakarchakkapalli/Documents/CICD/todo-api
  # Edit README.md, add a comment
  git add .
  git commit -m "Test Jenkins webhook"
  git push origin main
  ```
- [ ] Go to Jenkins dashboard
- [ ] Check if **Build #2** starts automatically
- [ ] If yes: ✅ Webhook works!
- [ ] If no: Check webhook "Recent Deliveries" in GitHub

## Phase 11: Verify Full Pipeline (10 minutes)

- [ ] Wait for build to complete
- [ ] Check console output for:
  - [ ] ✅ Lint passed
  - [ ] ✅ Tests passed
  - [ ] ✅ Docker image built
  - [ ] ✅ Image pushed to Docker Hub
  - [ ] ✅ Staging deployment
  - [ ] ✅ Manual approval gate (pauses here)
  - [ ] ✅ Production deployment (after approval)

- [ ] Click **Proceed** on the approval gate:
  - [ ] Go to build page
  - [ ] Scroll down to **Approval** stage
  - [ ] Click **Proceed** button
  - [ ] Build continues!

## Phase 12: Understanding the UI

- [ ] Explore Jenkins dashboard:
  - [ ] **Build #1, #2, etc.** - Click to see details
  - [ ] **Console Output** - Click to see full logs
  - [ ] **Changes** - See git commits included
  - [ ] **Blue Ocean** - Click for visual pipeline view
  - [ ] **Configure** - Click to edit job settings

## Phase 13: Explore Jenkinsfile

- [ ] Open your Jenkinsfile:
  ```bash
  nano /Users/ratnakarchakkapalli/Documents/CICD/jenkins/Jenkinsfile
  ```
- [ ] Understand the 12 stages:
  - [ ] Checkout
  - [ ] Setup
  - [ ] Install Dependencies
  - [ ] Lint
  - [ ] Test
  - [ ] Build Docker Image
  - [ ] Push to Registry
  - [ ] Deploy to Staging
  - [ ] Smoke Tests
  - [ ] Approval
  - [ ] Deploy to Production
  - [ ] Health Check

## Optional: Advanced Setup

- [ ] **Configure Email Notifications**
  - [ ] Manage Jenkins → Configure System
  - [ ] Find **E-mail Notification**
  - [ ] Configure SMTP server

- [ ] **Configure Slack Integration**
  - [ ] Install Slack plugin
  - [ ] Create Slack webhook
  - [ ] Add to Jenkinsfile

- [ ] **Enable Blue Ocean** (prettier UI)
  - [ ] Install "Blue Ocean" plugin
  - [ ] View pipelines in new UI

## Troubleshooting Checklist

If something doesn't work:

- [ ] **Jenkins won't start?**
  - [ ] Check: `docker-compose logs jenkins`
  - [ ] Check port 8080 not in use: `lsof -i :8080`

- [ ] **Can't login?**
  - [ ] Get password again: `docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`
  - [ ] Try username: `admin`, password: what you created

- [ ] **Job configuration errors?**
  - [ ] Verify repository URL is correct
  - [ ] Verify Script Path is `jenkins/Jenkinsfile`
  - [ ] Verify credentials are selected

- [ ] **Build fails?**
  - [ ] Click build number
  - [ ] Click **Console Output**
  - [ ] Read error message
  - [ ] Most common: Docker credentials missing, Node not installed

- [ ] **Webhook not triggering?**
  - [ ] Go to GitHub repo → Settings → Webhooks
  - [ ] Click the webhook
  - [ ] Check **Recent Deliveries** (are requests being sent?)
  - [ ] Verify IP and port are correct

## Final Verification

- [ ] ✅ Jenkins accessible at http://localhost:8080
- [ ] ✅ Can login with admin/admin123
- [ ] ✅ Job `todo-api-pipeline` exists
- [ ] ✅ Can click **Build Now** and see pipeline execute
- [ ] ✅ Credentials are configured (github-token, dockerhub-credentials)
- [ ] ✅ GitHub webhook shows recent deliveries
- [ ] ✅ Code push triggers builds automatically
- [ ] ✅ Docker images appear on Docker Hub
- [ ] ✅ All 12 pipeline stages are visible

## Success! 🎉

Once all checkboxes are ✅, you have:

1. **Jenkins running locally** in Docker
2. **Todo API pipeline** configured
3. **GitHub integration** with webhooks
4. **Docker Hub integration** pushing images
5. **Multi-stage deployments** with approval gates
6. **Full automation** from code to production

You can now:
- Read documentation in `jenkins/` folder
- Experiment with pipeline modifications
- Learn Groovy syntax in Jenkinsfile
- Understand CI/CD automation deeply

## Next Steps

1. Make code changes and push to GitHub
2. Watch Jenkins auto-trigger builds
3. Explore Jenkins UI (different views, logs)
4. Try modifying Jenkinsfile (add new stages, change parameters)
5. Learn Groovy to write more complex pipelines
6. Investigate Jenkins plugins for more capabilities

---

**Great job!** You've set up a professional CI/CD system. 🚀

For questions, refer to:
- `JENKINS_SETUP.md` - Detailed walkthrough
- `QUICK_REFERENCE.md` - Commands & code
- `VISUAL_GUIDE.md` - Diagrams & flows
