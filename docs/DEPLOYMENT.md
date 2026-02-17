# UniApps Deployment Guide

This guide covers the deployment strategies for the UniApps ecosystem, including the Admin Panel (**AppKit**), Mobile App (**Boundary**), and their respective backend services.

## 🏗️ Architecture Overview

UniApps consists of four main components that can be deployed independently or together:

1.  **Backend Admin** (`backend-admin/`): Express.js API for admin operations.
2.  **Backend Mobile** (`backend-mobile/`): Express.js API for the mobile app.
3.  **Admin Frontend** (`admin/`): Next.js application for the admin console.
4.  **Mobile App** (`boundary-app/` or `mobile/`): React Native / Expo application.

## 🚀 Prerequisites

*   **Node.js**: v18 or higher
*   **Package Manager**: npm (v9+)
*   **Database**: PostgreSQL (v14+)
    *   *Note*: The project uses the `bondarys` schema for application data. Use the provided migration scripts or Prisma to set this up.
*   **Redis**: For caching and session management.
*   **Docker** (Optional): For containerized deployment.

## 🛠️ Local Development Setup

1.  **Install Dependencies**
    Run this in the root directory to install dependencies for the workspace and all packages:
    ```bash
    npm install
    # This installs workspace dependencies and creates symlinks for @uniapps/shared.
    ```

2.  **Environment Configuration**
    Copy `.env` from the example and configure:
    ```env
    DATABASE_URL="postgresql://user:pass@localhost:5432/dbname?schema=bondarys"
    REDIS_URL="redis://localhost:6379"
    JWT_SECRET="your-secure-secret"
    EXPO_PUBLIC_APP_NAME="Boundary"
    ```

3.  **Database Migration**
    Initialize the database using Prisma:
    ```bash
    cd backend-admin
    npx prisma db push
    ```

4.  **Start Services**
    *   **Windows**: Run `dev.bat`
    *   **Manual**:
        ```bash
        npm run dev:backend-admin
        npm run dev:backend-mobile
        npm run dev:admin
        npm run dev:mobile
        ```

## 🐳 Docker Deployment (Recommended for Backend)

We provide a `docker-compose.yml` for deploying the backends and infrastructure.

1.  **Build and Run**
    ```bash
    docker-compose up -d --build
    ```
    This starts:
    *   `backend-admin` (Port 3001)
    *   `backend-mobile` (Port 4000)
    *   `postgres` (Port 5432)
    *   `redis` (Port 6379)

2.  **Production Docker**
    Ensure your `.env` file uses production values (secure passwords, external DB host if applicable).

## ☁️ Cloud Deployment Strategies

### 1. Database (PostgreSQL)
*   **Supabase**: Recommended. Create a project, get the connection string, and set `DATABASE_URL`.
*   **AWS RDS / Google Cloud SQL**: Provision a Postgres instance and create the `bondarys` schema.

### 2. Admin Frontend (Next.js)
*   **Vercel** (Recommended):
    1.  Import the `admin` folder as a project.
    2.  Set Environment Variables (`NEXT_PUBLIC_API_URL`, etc.).
    3.  Deploy.
*   **Netlify**: Similar process to Vercel.
*   **Docker**: Build the `admin` Dockerfile and deploy to a container runtime.

### 3. Backend Services (Express)
*   **Render / Railway / Heroku**:
    *   Deploy `backend-admin` and `backend-mobile` as separate web services.
    *   Set build command: `npm install && npm run build`.
    *   Set start command: `npm start`.
*   **VPS**: Use PM2 or Docker.

#### Railway Deployment Guide
1.  **Infrastructure**: Railway does **NOT** automatically create databases defined in `docker-compose.yml`. You must manually add **PostgreSQL** and **Redis** from the Railway dashboard ("New > Database").
2.  **Services**: Deploy this repository multiple times (once for each service).
3.  **Configuration**: For each service, go to **Settings > Root Directory** and set:
    *   Backend Admin: `backend-admin`
    *   Backend Mobile: `backend-mobile`
    *   Admin Frontend: `admin`
4.  **Variables**: Add `DATABASE_URL` and `REDIS_URL` from your Railway database services to each application service.

#### External Infrastructure (BYO Database)
Yes! You can use any external PostgreSQL, Redis, or S3-compatible storage (like MinIO, AWS S3, DigitalOcean Spaces).

**Configuration:**
Simply update the environment variables in your deployment platform:
- `DATABASE_URL`: `postgresql://user:pass@host:port/dbname`
- `REDIS_URL`: `redis://:password@host:port`
- `S3_ENDPOINT`: `https://play.min.io` (for MinIO) or your S3 endpoint
- `S3_ACCESS_KEY_ID`: Your access key
- `S3_SECRET_ACCESS_KEY`: Your secret key
- `S3_BUCKET_NAME`: Your bucket name

### 4. Mobile App (Expo)
*   **EAS Build**:
    ```bash
    cd boundary-app
    eas build --profile production --platform all
    ```
*   **OTA Updates**: Use `eas update` to push JavaScript fixes instantly.

## 📝 Critical Notes

*   **Shared Package**: The `@uniapps/shared` package is critical. In cloud environments (like Vercel), ensure the build pipeline installs workspace dependencies correctly or include the shared package in the build context.
*   **Schema Name**: The application expects the database schema to be named `bondarys`. Do not change this without a full migration strategy.
*   **Branding**:
    *   **AppKit**: Internal Admin Service.
    *   **Boundary**: Mobile Application.
    *   **UniApps**: Corporate Identity.
