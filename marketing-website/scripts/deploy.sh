#!/bin/bash

# Bondarys Marketing Website Deployment Script

echo "🚀 Starting deployment process..."

# Build the project
echo "📦 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Create deployment package
    echo "📁 Creating deployment package..."
    tar -czf bondarys-marketing-website.tar.gz dist/
    
    echo "🎉 Deployment package created: bondarys-marketing-website.tar.gz"
    echo "📋 Next steps:"
    echo "   1. Upload the tar.gz file to your hosting provider"
    echo "   2. Extract the contents to your web server"
    echo "   3. Configure your domain to point to the dist/ directory"
    
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi 