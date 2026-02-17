#!/bin/bash

# UniApps Development Environment Starter
# Runs Backend-Admin, Backend-Mobile, Admin, and Boundary App concurrently

# Cleanup function to kill all spawned processes on exit
cleanup() {
    echo -e "\n\033[1;31mShutting down all services...\033[0m"
    # Port-based cleanup as a safety net
    fuser -k 3001/tcp 2>/dev/null
    fuser -k 4000/tcp 2>/dev/null
    fuser -k 8081/tcp 2>/dev/null
    # Kill background jobs
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM EXIT

echo -e "\033[1;34m--- UniApps Full Stack Developer Console ---\033[0m"

# 1. Start Backend Admin
echo -e "\033[1;32m[1/4] Launching Backend Admin Server (Port 3001)...\033[0m"
(cd backend-admin && npm run dev) &

# 2. Start Backend Mobile
echo -e "\033[1;32m[2/4] Launching Backend Mobile Server (Port 4000)...\033[0m"
(cd backend-mobile && npm run dev) &

# 3. Start Admin Dashboard
echo -e "\033[1;32m[3/4] Launching Admin Dashboard...\033[0m"
(cd admin && npm run dev) &

# 4. Start Boundary App
echo -e "\033[1;32m[4/4] Launching Boundary App (Expo)...\033[0m"
(cd boundary-app && npm run web) &

echo -e "\033[1;36m--- Services are initializing ---\033[0m"
echo -e "Backend Admin:  http://localhost:3001"
echo -e "Backend Mobile: http://localhost:4000"
echo -e "Admin:          http://localhost:3001"
echo -e "Boundary App:   http://localhost:8081"
echo -e "\n\033[1;33mPress Ctrl+C to stop all services.\033[0m\n"

# Keep script alive
wait
