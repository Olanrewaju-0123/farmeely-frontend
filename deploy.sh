#!/bin/bash

echo "🚀 Starting Farmeely Deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy Frontend
echo "📱 Deploying Frontend..."
cd frontend
vercel --prod --yes
echo "✅ Frontend deployed successfully!"

# Go back to root
cd ..

# Deploy Backend (if needed)
echo "🔧 Backend deployment instructions:"
echo "1. Go to Vercel dashboard"
echo "2. Create a new project for the backend"
echo "3. Upload the backend folder"
echo "4. Configure environment variables"
echo "5. Deploy"

echo "🎉 Deployment process completed!"
echo "📋 Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Set up custom domain (optional)"
echo "3. Test the deployed application"
echo "4. Monitor performance and errors"
