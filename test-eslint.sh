#!/bin/bash
echo "Testing ESLint with local npm package..."
npm ci --prefer-offline
echo "Running ESLint..."
npm run lint
