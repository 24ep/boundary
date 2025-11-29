@echo off
REM Bondarys Marketing Website Deployment Script for Windows

echo 🚀 Starting deployment process...

REM Build the project
echo 📦 Building the project...
call npm run build

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build completed successfully!
    
    REM Create deployment package
    echo 📁 Creating deployment package...
    powershell Compress-Archive -Path dist\* -DestinationPath bondarys-marketing-website.zip
    
    echo 🎉 Deployment package created: bondarys-marketing-website.zip
    echo 📋 Next steps:
    echo    1. Upload the zip file to your hosting provider
    echo    2. Extract the contents to your web server
    echo    3. Configure your domain to point to the dist/ directory
    
) else (
    echo ❌ Build failed! Please check the error messages above.
    pause
    exit /b 1
)

pause 