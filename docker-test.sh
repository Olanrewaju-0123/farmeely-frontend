#!/bin/bash

echo "🐳 Testing Docker Setup for Farmeely"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Test Docker Compose syntax
echo "🔍 Testing docker-compose.yml syntax..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml syntax is valid"
else
    echo "❌ docker-compose.yml has syntax errors"
    exit 1
fi

# Build test (without starting services)
echo "🏗️  Testing Docker builds..."
echo "Building backend..."
if docker-compose build backend > /dev/null 2>&1; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

echo "Building frontend..."
if docker-compose build frontend > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""
echo "🎉 All Docker tests passed!"
echo ""
echo "To start the application:"
echo "  docker-compose up --build"
echo ""
echo "To start in background:"
echo "  docker-compose up -d --build"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
