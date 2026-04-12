# 🚀 Jenkins Quick Reference - Todo API

## Essential Commands

### Start & Stop Jenkins

```bash
# Start Jenkins
cd /Users/ratnakarchakkapalli/Documents/CICD/jenkins
docker-compose up -d

# View logs
docker-compose logs -f jenkins

# Stop Jenkins
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

### Access Jenkins

```
Web UI: http://localhost:8080
Default credentials: admin / admin123
```

---

## First-Time Setup Checklist

- [ ] `docker-compose up -d` (start Jenkins)
- [ ] Retrieve initial password: `docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`
- [ ] Login to http://localhost:8080
- [ ] Install suggested plugins
- [ ] Create admin user (admin/admin123)
- [ ] Go to **Manage Jenkins** → **Manage Plugins** → Install: GitHub, Docker, Docker Pipeline
- [ ] Create GitHub Personal Access Token at github.com/settings/tokens
- [ ] Add GitHub token to Jenkins Credentials (ID: `github-token`)
- [ ] Add Docker Hub credentials to Jenkins (ID: `dockerhub-credentials`)
- [ ] Create new **Pipeline** job: `todo-api-pipeline`
- [ ] Configure Pipeline:
  - SCM: `Git`
  - Repository URL: `https://github.com/YOUR_USER/CICD.git`
  - Branch: `*/main`
  - Script Path: `jenkins/Jenkinsfile`
- [ ] Add GitHub webhook: `http://YOUR_IP:8080/github-webhook/`
- [ ] Test by pushing code to GitHub

---

## Key Concepts

### Jenkinsfile Structure

```groovy
pipeline {
    agent any              // Where to run: any available agent
    
    options {
        buildDiscarder()   // Keep last N builds
        timeout()          // Kill if exceeds time
        timestamps()       // Add timestamps to logs
    }
    
    environment {
        VAR = "value"      // Available in all stages
    }
    
    stages {
        stage('Name') {    // Each stage = one step
            steps {
                sh 'command'  // Run shell command
                echo "msg"    // Print message
            }
        }
    }
    
    post {
        always {           // Run always
            cleanWs()      // Clean workspace
        }
        success {          // Run if success
            echo "✅ Done"
        }
        failure {          // Run if failure
            echo "❌ Failed"
        }
    }
}
```

### Common Jenkins Variables

```groovy
${BUILD_NUMBER}        // Build #1, #2, etc.
${GIT_COMMIT}          // Full commit hash
${GIT_BRANCH}          // Current branch
${WORKSPACE}           // Jenkins working directory
${JOB_NAME}            // Job name
${BUILD_URL}           // Link to this build
${env.PATH}            // Environment variable
```

### Stage Conditions

```groovy
stage('Deploy') {
    when {
        branch 'main'              // Only on main
        // branch 'develop'        // Or specific branch
        // expression { ... }      // Custom logic
        // triggeredBy 'githubPush' // Triggered by webhook
    }
    steps { /* ... */ }
}
```

---

## Credentials in Jenkins

### Store a Secret

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **Jenkins** → **Global credentials**
3. Click **Add Credentials**
4. Choose type: `Username with password` or `Secret text`
5. Fill in values
6. Set **ID** (important for using in pipeline)
7. Save

### Use a Secret in Jenkinsfile

```groovy
// For username/password:
withCredentials([usernamePassword(
    credentialsId: 'dockerhub-credentials',
    usernameVariable: 'DOCKER_USER',
    passwordVariable: 'DOCKER_PASS'
)]) {
    sh '''
        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
    '''
}

// For secret text:
withCredentials([string(
    credentialsId: 'api-key',
    variable: 'API_KEY'
)]) {
    sh 'curl -H "Authorization: Bearer $API_KEY" https://api.example.com'
}
```

---

## Docker Integration

### Build and Push Image

```groovy
stage('Build Docker') {
    steps {
        sh '''
            docker build \
              -t myregistry/myimage:latest \
              -t myregistry/myimage:${BUILD_NUMBER} \
              .
        '''
    }
}

stage('Push') {
    steps {
        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-credentials',
            usernameVariable: 'USER',
            passwordVariable: 'PASS'
        )]) {
            sh '''
                echo $PASS | docker login -u $USER --password-stdin
                docker push myregistry/myimage:latest
                docker logout
            '''
        }
    }
}
```

### Run Docker Container in Pipeline

```groovy
stage('Run Tests in Docker') {
    steps {
        sh '''
            docker run --rm \
              -v ${WORKSPACE}:/app \
              node:18 \
              sh -c "cd /app && npm test"
        '''
    }
}
```

---

## Approval Gates

### Manual Approval Before Deploy

```groovy
stage('Approval') {
    steps {
        input(
            message: 'Deploy to production?',
            ok: 'Deploy',
            submitter: 'admin'  // Only admin can approve
        )
    }
}

stage('Deploy Production') {
    steps {
        echo "✅ Deploying..."
    }
}
```

---

## Error Handling

### Continue on Error

```groovy
stage('Lint') {
    steps {
        sh 'npm run lint || true'  // || true = don't fail
    }
}
```

### Conditional Error Handling

```groovy
stage('Test') {
    steps {
        script {
            try {
                sh 'npm test'
            } catch (error) {
                echo "❌ Tests failed: ${error}"
                // Continue or fail
                currentBuild.result = 'FAILURE'
            }
        }
    }
}
```

### Timeout a Stage

```groovy
options {
    timeout(time: 30, unit: 'MINUTES')
}
```

---

## Viewing Results

### Check Build Status

1. Go to Jenkins job: `http://localhost:8080/job/todo-api-pipeline/`
2. Latest build shows:
   - ✅ Green = success
   - 🔴 Red = failure
   - 🟡 Yellow = unstable

### View Build Details

1. Click on build number (e.g., `#1`)
2. See:
   - **Changes** - Git commits included
   - **Console Output** - Full logs
   - **Artifacts** - Generated files

### Streaming Logs

```bash
# Watch logs while Jenkins is running
docker-compose logs -f jenkins

# Filter for specific container
docker logs -f jenkins-server
```

---

## Debugging & Troubleshooting

### Enable Debug Logging

```groovy
stage('Debug') {
    steps {
        sh 'set -x'  // Enable bash debug mode
        sh 'env'     // Show all environment variables
        sh 'pwd'     // Show current directory
        sh 'ls -la'  // List files
    }
}
```

### Check Docker Access

```bash
# From Jenkins container, test Docker
docker-compose exec jenkins docker ps
docker-compose exec jenkins docker images
```

### View Jenkins Home Directory

```bash
# Jenkins stores everything here
ls -la /var/lib/docker/volumes/jenkins_jenkins_home/_data/

# Or via container
docker-compose exec jenkins ls -la /var/jenkins_home/
```

---

## Common Jenkinsfile Patterns

### Pattern 1: Simple Lint & Test

```groovy
pipeline {
    agent any
    stages {
        stage('Install') { steps { sh 'npm ci' } }
        stage('Lint') { steps { sh 'npm run lint' } }
        stage('Test') { steps { sh 'npm test' } }
    }
}
```

### Pattern 2: Docker Build & Push

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'docker build -t myapp:${BUILD_NUMBER} .'
            }
        }
        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'U', passwordVariable: 'P')]) {
                    sh 'echo $P | docker login -u $U --password-stdin'
                    sh 'docker push myapp:${BUILD_NUMBER}'
                }
            }
        }
    }
}
```

### Pattern 3: Multiple Environments

```groovy
pipeline {
    agent any
    stages {
        stage('Test') { steps { sh 'npm test' } }
        stage('Build') { steps { sh 'npm run build' } }
        stage('Deploy Staging') {
            when { branch 'main' }
            steps { sh 'curl -X POST $STAGING_WEBHOOK' }
        }
        stage('Approval') {
            when { branch 'main' }
            steps { input 'Deploy to production?' }
        }
        stage('Deploy Production') {
            when { branch 'main' }
            steps { sh 'curl -X POST $PROD_WEBHOOK' }
        }
    }
}
```

---

## GitHub Webhook Setup

### 1. Find Your Jenkins URL

```bash
# On Mac, find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for: inet 192.168.x.x
```

### 2. Your Webhook URL

```
http://YOUR_IP:8080/github-webhook/
```

### 3. Add to GitHub Repo

1. **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL:** `http://YOUR_IP:8080/github-webhook/`
3. **Content type:** `application/json`
4. **Events:** `Just the push event`
5. **Active:** ✅
6. **Save**

### 4. Test Webhook

1. Click webhook in GitHub Settings
2. See **Recent Deliveries**
3. Make a code push, see automatic Jenkins build trigger

---

## Performance Tips

### Cache Dependencies

```groovy
stage('Install') {
    steps {
        sh '''
            # npm caches automatically in ~/.npm
            npm ci --prefer-offline
        '''
    }
}
```

### Parallel Stages

```groovy
stages {
    stage('Parallel Tests') {
        parallel {
            stage('Unit Tests') {
                steps { sh 'npm run test:unit' }
            }
            stage('Integration Tests') {
                steps { sh 'npm run test:integration' }
            }
        }
    }
}
```

### Clean Old Builds

```groovy
options {
    buildDiscarder(logRotator(numToKeepStr: '10'))  // Keep last 10
}
```

---

## Quick Comparison: Jenkins vs GitHub Actions

| Task | Jenkins | GitHub Actions |
|------|---------|---|
| Install | `docker-compose up -d` | Already on GitHub |
| Lint | `sh 'npm run lint'` | `- run: npm run lint` |
| Test | `sh 'npm test'` | `- run: npm test` |
| Docker Build | Docker CLI in shell | `docker/build-push-action` |
| Store Secret | Jenkins Credentials | GitHub Secrets |
| Manual Gate | `input()` | `environment:` + `review` |

---

## Resources

- **Jenkins Docs:** https://www.jenkins.io/doc/
- **Jenkinsfile Syntax:** https://www.jenkins.io/doc/book/pipeline/
- **Groovy Basics:** https://groovy-lang.org/

---

**Ready to build?** Start with:

```bash
cd /Users/ratnakarchakkapalli/Documents/CICD/jenkins
docker-compose up -d
```

Then go to http://localhost:8080 🚀
