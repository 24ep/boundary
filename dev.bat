@echo off
title UniApps Dev Console

echo --- Starting UniApps Development Environment ---

:: Start Backend Admin in a new window
echo [1/4] Starting Backend Admin...
start "Backend-Admin" cmd /c "cd backend-admin && npm run dev"

:: Start Backend Mobile in a new window
echo [2/4] Starting Backend Mobile...
start "Backend-Mobile" cmd /c "cd backend-mobile && npm run dev"

:: Start Admin in a new window
echo [3/4] Starting Admin...
start "Admin" cmd /c "cd admin && npm run dev"

:: Start Boundary App in a new window
echo [4/4] Starting Boundary App...
start "Boundary-App" cmd /c "cd boundary-app && npm run web"

echo --- All services are starting in separate windows ---
echo Backend Admin:  http://localhost:3001
echo Backend Mobile: http://localhost:4000
echo Admin:          http://localhost:3001
echo Boundary App:   http://localhost:8081
pause
