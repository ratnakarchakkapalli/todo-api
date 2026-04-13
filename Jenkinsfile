// ==================== Todo API - Jenkins Pipeline ====================
// This Jenkinsfile defines a complete CI/CD pipeline for the Todo API
// Run: Jenkins will automatically discover and run this file when pushed to GitHub

pipeline {
    agent any
    
    options {
        // Keep last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        // Add timestamps to console output
        timestamps()
    }
    
    environment {
        // Docker credentials (configure these in Jenkins)
        DOCKER_REGISTRY = "docker.io"
        NODE_ENV = "production"
        CI = "true"
        // Ensure npm local binaries are in PATH first
        PATH = "${WORKSPACE}/node_modules/.bin:${PATH}"
    }
    
    stages {
        // ==================== STAGE 1: Checkout ====================
        stage('Checkout') {
            steps {
                script {
                    echo "📦 Checking out code from GitHub..."
                }
                checkout scm
            }
        }
        
        // ==================== STAGE 2: Setup Node.js ====================
        stage('Setup') {
            steps {
                script {
                    echo "🔧 Setting up Node.js environment..."
                }
                sh '''
                    node --version
                    npm --version
                '''
            }
        }
        
        // ==================== STAGE 3: Install Dependencies ====================
        stage('Install Dependencies') {
            steps {
                script {
                    echo "📥 Installing npm dependencies..."
                }
                sh 'npm ci'
            }
        }
        
        // ==================== STAGE 4: Lint ====================
        stage('Lint') {
            steps {
                script {
                    echo "🔍 Running ESLint..."
                }
                sh 'npm run lint'
            }
        }
        
        // ==================== STAGE 5: Test ====================
        stage('Test') {
            steps {
                script {
                    echo "🧪 Running Jest tests with coverage..."
                }
                sh 'npm test'
                
                // Publish test results
                junit testResults: '**/coverage/**/*.xml', allowEmptyResults: true
            }
        }
        
        // ==================== STAGE 6: Build Docker Image ====================
        stage('Build Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🐳 Building Docker image..."
                }
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        DOCKER_IMAGE="${DOCKER_USER}/todo-api"
                        docker build \
                          -t ${DOCKER_IMAGE}:latest \
                          -t ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                          -t ${DOCKER_IMAGE}:${GIT_COMMIT:0:7} \
                          .
                    '''
                }
            }
        }
        
        // ==================== STAGE 7: Push to Docker Hub ====================
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "📤 Pushing Docker image to Docker Hub..."
                }
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        DOCKER_IMAGE="${DOCKER_USER}/todo-api"
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push ${DOCKER_IMAGE}:latest
                        docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE}:${GIT_COMMIT:0:7}
                        docker logout
                    '''
                }
            }
        }
        
        // ==================== STAGE 8: Deploy to Staging ====================
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🚀 Deploying to staging environment..."
                }
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        DOCKER_IMAGE="${DOCKER_USER}/todo-api"
                        echo "Staging Deployment"
                        echo "Image: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        echo "Commit: ${GIT_COMMIT}"
                        echo "Build Number: ${BUILD_NUMBER}"
                        # In real scenario, trigger Render deploy hook or kubectl apply
                        # curl -X POST https://api.render.com/deploy/staging-todo-api-hook
                    '''
                }
            }
        }
        
        // ==================== STAGE 9: Smoke Tests ====================
        stage('Smoke Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🔥 Running smoke tests on staging..."
                }
                sh '''
                    # In real scenario, test the staging URL
                    # curl -f https://staging-todo-api.render.com/health || exit 1
                    echo "✅ Smoke tests passed (simulated)"
                '''
            }
        }
        
        // ==================== STAGE 10: Manual Approval ====================
        stage('Approval') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "⏸️  Waiting for manual approval to deploy to production..."
                }
                input(
                    message: 'Deploy to Production?',
                    ok: 'Deploy',
                    submitter: 'admin'
                )
            }
        }
        
        // ==================== STAGE 11: Deploy to Production ====================
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🚀 Deploying to production environment..."
                }
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        DOCKER_IMAGE="${DOCKER_USER}/todo-api"
                        echo "Production Deployment"
                        echo "Image: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        echo "Version: ${GIT_COMMIT}"
                        # In real scenario, trigger Render production deploy
                        # curl -X POST https://api.render.com/deploy/todo-api-prod-hook
                    '''
                }
            }
        }
        
        // ==================== STAGE 12: Health Check ====================
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🏥 Running health checks on production..."
                }
                sh '''
                    # In real scenario, test the production URL
                    # curl -f https://todo-api.render.com/health || exit 1
                    echo "✅ Health checks passed (simulated)"
                '''
            }
        }
    }
    
    // ==================== Post Build Actions ====================
    post {
        // Run on ALL builds
        always {
            script {
                echo "🧹 Cleaning up..."
                cleanWs()
            }
        }
        
        // Run on SUCCESS
        success {
            script {
                echo "✅ Pipeline completed successfully!"
            }
        }
        
        // Run on FAILURE
        failure {
            script {
                echo "❌ Pipeline failed! Check logs above."
            }
        }
    }
}
