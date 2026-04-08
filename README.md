# Todo API - Full CI/CD Example

A simple Todo API with a complete enterprise-grade CI/CD pipeline using GitHub Actions.

## 📋 What's included

- **Node.js Express API** — Simple REST endpoints for todos
- **Unit Tests** — Jest tests with coverage reporting
- **Linting** — ESLint for code quality
- **Docker** — Containerized application
- **Full CI/CD Pipeline** — Lint → Test → Build → Deploy (Staging → Production)

## 🚀 CI/CD Pipeline Stages

```
1. LINT & TEST
   ├─ Install dependencies
   ├─ Run ESLint
   ├─ Run Jest tests
   └─ Generate coverage report

2. BUILD DOCKER
   ├─ Build Docker image
   ├─ Push to Docker Hub
   └─ Tag with commit SHA

3. DEPLOY STAGING
   ├─ Deploy to staging environment
   ├─ Run smoke tests
   └─ Wait for approval

4. MANUAL APPROVAL
   └─ Human review required

5. DEPLOY PRODUCTION
   ├─ Deploy to production
   ├─ Health checks
   └─ Success notification
```

## 📦 Project Structure

```
todo-api/
├── src/
│   ├── index.js           # Express server
│   └── todos.js           # Business logic
├── tests/
│   └── todos.test.js      # Jest tests
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # Full pipeline
├── Dockerfile             # Docker build
├── package.json
├── .eslintrc.json
├── .gitignore
└── README.md
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
cd todo-api
npm install
```

### Run tests
```bash
npm test
```

### Run linter
```bash
npm run lint
```

### Start server
```bash
npm start
```

Server runs on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Get all todos
```bash
GET /todos
```

### Get specific todo
```bash
GET /todos/:id
```

### Add new todo
```bash
POST /todos
Content-Type: application/json

{
  "title": "My new todo"
}
```

## 🐳 Docker

### Build image
```bash
docker build -t todo-api:latest .
```

### Run container
```bash
docker run -p 3000:3000 todo-api:latest
```

## 🔧 GitHub Actions Setup

### Required Secrets
Add these to your GitHub repo settings:
- `DOCKERHUB_USERNAME` — Your Docker Hub username
- `DOCKERHUB_TOKEN` — Your Docker Hub access token

### Generate Docker Hub token
1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Copy the token
4. Add as `DOCKERHUB_TOKEN` secret in GitHub

## 📚 Learning Outcomes

After working with this project, you'll understand:

✅ **CI (Continuous Integration)**
- Automatic linting on every push
- Automated testing
- Code coverage reports

✅ **BUILD**
- Docker containerization
- Image versioning with git SHA
- Pushing to registry

✅ **CD (Continuous Deployment)**
- Staging environment deployment
- Smoke tests
- Manual approval gates
- Production deployment
- Health checks

✅ **Best Practices**
- Separation of concerns (lint → test → build → deploy)
- Staging before production
- Manual gates for critical deployments
- Health checks for verification

## 🚦 Workflow Execution

When you push to `main`:
1. Linter and tests run automatically
2. If all pass, Docker image is built and pushed
3. Image is deployed to staging
4. Staging smoke tests run
5. **MANUAL APPROVAL REQUIRED** ⏸️
6. After approval, deploy to production

## 🎯 Next Steps

To make this production-ready:
1. Replace simulated deploys with real endpoints (Render, Heroku, AWS)
2. Add environment variables for API keys
3. Set up monitoring and alerts
4. Add database (MongoDB, PostgreSQL)
5. Implement CI for PRs (run tests before merge)

## 📝 Notes

- Tests are run on every push and PR
- Docker builds only happen on main branch
- Staging/production deploys require manual approval
- All stages have clear logging

## 🤝 Contributing

1. Create a feature branch
2. Make changes and commit
3. Push to GitHub
4. Open a Pull Request
5. All tests must pass before merge
6. After merge to main, full pipeline runs

---

**Happy CI/CD learning!** 🚀
