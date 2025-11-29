# Bondarys Deployment Guide

## 🚀 Overview

This guide covers the complete deployment process for Bondarys, including Docker setup, AWS infrastructure, production configuration, and monitoring.

## 📋 Prerequisites

### Required Software
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **AWS CLI** 2.0+
- **Git**
- **SSH client**

### AWS Services
- **EC2** (Compute)
- **RDS** (Database)
- **ElastiCache** (Redis)
- **S3** (File Storage)
- **CloudFront** (CDN)
- **Route 53** (DNS)
- **ACM** (SSL Certificates)
- **CloudWatch** (Monitoring)
- **ECS** (Container Orchestration)

## 🐳 Docker Deployment

### Local Development

#### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/bondarys/bondarys.git
cd bondarys

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

#### 2. Start Services (Dev Minimal)
```bash
# Start core services (Supabase + Redis)
docker-compose up -d supabase redis

# View logs
docker-compose logs -f supabase redis

# Stop services
docker-compose down
```

#### 3. Individual Services
```bash
# Start only Redis
docker-compose up redis -d
```

### Production Docker Setup

#### 1. Production Notes
Use a managed Postgres (Supabase), Redis (ElastiCache), and a cloud load balancer (e.g., ALB) with your backend containers. Nginx, MongoDB, Prometheus, Grafana, and ELK stack are optional and not part of the minimal setup.

#### 2. Production Dockerfile
```dockerfile
# backend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

USER nodejs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

#### 3. Nginx Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    server {
        listen 80;
        server_name bondarys.com www.bondarys.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name bondarys.com www.bondarys.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/bondarys.com.crt;
        ssl_certificate_key /etc/nginx/ssl/bondarys.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Authentication routes
        location /api/auth/ {
            limit_req zone=auth burst=10 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }

        # Static files
        location / {
            root /var/www/html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

## ☁️ AWS Deployment

### 1. AWS Infrastructure Setup

#### Create VPC and Networking
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications ResourceType=vpc,Tags=[{Key=Name,Value=bondarys-vpc}]

# Create subnets
aws ec2 create-subnet --vpc-id vpc-12345678 --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-12345678 --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create security groups
aws ec2 create-security-group --group-name bondarys-backend --description "Bondarys Backend Security Group" --vpc-id vpc-12345678
aws ec2 create-security-group --group-name bondarys-database --description "Bondarys Database Security Group" --vpc-id vpc-12345678
```

#### Create RDS Database
```bash
# Create RDS subnet group
aws rds create-db-subnet-group \
    --db-subnet-group-name bondarys-db-subnet-group \
    --db-subnet-group-description "Bondarys Database Subnet Group" \
    --subnet-ids subnet-12345678 subnet-87654321

# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier bondarys-db \
    --db-instance-class db.t3.micro \
    --engine mongodb \
    --master-username admin \
    --master-user-password secure_password \
    --allocated-storage 20 \
    --db-subnet-group-name bondarys-db-subnet-group \
    --vpc-security-group-ids sg-12345678
```

#### Create ElastiCache Redis
```bash
# Create Redis subnet group
aws elasticache create-cache-subnet-group \
    --cache-subnet-group-name bondarys-redis-subnet-group \
    --cache-subnet-group-description "Bondarys Redis Subnet Group" \
    --subnet-ids subnet-12345678 subnet-87654321

# Create Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id bondarys-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --cache-subnet-group-name bondarys-redis-subnet-group \
    --security-group-ids sg-12345678
```

#### Create S3 Bucket
```bash
# Create S3 bucket
aws s3 mb s3://bondarys-storage

# Configure bucket for static website hosting
aws s3 website s3://bondarys-storage --index-document index.html --error-document error.html

# Set bucket policy
aws s3api put-bucket-policy --bucket bondarys-storage --policy file://s3-policy.json
```

### 2. ECS Deployment

#### Create ECS Cluster
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name bondarys-cluster
```

#### Create Task Definition
```json
{
  "family": "bondarys-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/bondarys-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MONGODB_URI",
          "value": "mongodb://bondarys-db.cluster-123456789012.us-east-1.rds.amazonaws.com:27017/bondarys"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://bondarys-redis-001.cluster-123456789012.us-east-1.cache.amazonaws.com:6379"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/bondarys-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Create ECS Service
```bash
# Create ECS service
aws ecs create-service \
    --cluster bondarys-cluster \
    --service-name bondarys-backend-service \
    --task-definition bondarys-backend:1 \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678,subnet-87654321],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/bondarys-tg,containerName=backend,containerPort=3000"
```

### 3. Application Load Balancer

#### Create ALB
```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name bondarys-alb \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups sg-12345678

# Create target group
aws elbv2 create-target-group \
    --name bondarys-tg \
    --protocol HTTP \
    --port 3000 \
    --vpc-id vpc-12345678 \
    --target-type ip \
    --health-check-path /health \
    --health-check-interval-seconds 30 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3

# Create listener
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/bondarys-alb/1234567890123456 \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/bondarys-tg/1234567890123456
```

## 🔧 Production Configuration

### 1. Environment Variables
```bash
# Production environment variables
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://bondarys-db.cluster-123456789012.us-east-1.rds.amazonaws.com:27017/bondarys
MONGODB_USER=admin
MONGODB_PASSWORD=secure_password

# Redis
REDIS_URL=redis://bondarys-redis-001.cluster-123456789012.us-east-1.cache.amazonaws.com:6379
REDIS_PASSWORD=secure_redis_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=bondarys-storage
AWS_CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-distribution-id

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 2. SSL Certificate
```bash
# Request SSL certificate
aws acm request-certificate \
    --domain-name bondarys.com \
    --subject-alternative-names www.bondarys.com \
    --validation-method DNS

# Validate certificate
aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012
```

### 3. DNS Configuration
```bash
# Create hosted zone
aws route53 create-hosted-zone --name bondarys.com --caller-reference $(date +%s)

# Create A record
aws route53 change-resource-record-sets \
    --hosted-zone-id Z12345678901234567890 \
    --change-batch '{
        "Changes": [
            {
                "Action": "CREATE",
                "ResourceRecordSet": {
                    "Name": "bondarys.com",
                    "Type": "A",
                    "AliasTarget": {
                        "HostedZoneId": "Z35SXDOTRQ7X7K",
                        "DNSName": "bondarys-alb-123456789012.us-east-1.elb.amazonaws.com",
                        "EvaluateTargetHealth": true
                    }
                }
            }
        ]
    }'
```

## 📊 Monitoring and Logging

### 1. CloudWatch Setup
```bash
# Create CloudWatch log group
aws logs create-log-group --log-group-name /ecs/bondarys-backend

# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
    --dashboard-name Bondarys-Dashboard \
    --dashboard-body file://cloudwatch-dashboard.json
```

### 2. Monitoring
Prefer managed monitoring (e.g., CloudWatch, Datadog) for production. Expose `/health` and optional `/metrics` from the backend.

### 3. Grafana Dashboards
```json
{
  "dashboard": {
    "title": "Bondarys Application Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security Configuration

### 1. Security Groups
```bash
# Backend security group
aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp \
    --port 3000 \
    --source-group sg-12345678

# Database security group
aws ec2 authorize-security-group-ingress \
    --group-id sg-87654321 \
    --protocol tcp \
    --port 27017 \
    --source-group sg-12345678
```

### 2. IAM Roles
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::bondarys-storage/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:123456789012:log-group:/ecs/bondarys-backend:*"
    }
  ]
}
```

## 🚀 Deployment Scripts

### 1. Production Deployment Script
```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# Check environment
if [ "$NODE_ENV" != "production" ]; then
    echo "❌ NODE_ENV must be set to production"
    exit 1
fi

# Build Docker images
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Push to ECR
echo "📤 Pushing to ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker tag bondarys-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/bondarys-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/bondarys-backend:latest

# Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service --cluster bondarys-cluster --service bondarys-backend-service --force-new-deployment

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable --cluster bondarys-cluster --services bondarys-backend-service

# Run health checks
echo "🏥 Running health checks..."
for i in {1..10}; do
    if curl -f https://bondarys.com/health; then
        echo "✅ Health check passed"
        break
    else
        echo "❌ Health check failed, retrying..."
        sleep 30
    fi
done

echo "✅ Production deployment completed!"
```

### 2. Database Migration Script
```bash
#!/bin/bash
# scripts/migrate-database.sh

set -e

echo "🔄 Starting database migration..."

# Run migrations
echo "📊 Running database migrations..."
docker-compose exec backend npm run migrate

# Seed data if needed
if [ "$SEED_DATA" = "true" ]; then
    echo "🌱 Seeding database..."
    docker-compose exec backend npm run seed
fi

echo "✅ Database migration completed!"
```

### 3. Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

echo "💾 Starting backup..."

# Create backup directory
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "📊 Backing up MongoDB..."
docker-compose exec mongodb mongodump --out /backup
docker cp bondarys_mongodb_1:/backup $BACKUP_DIR/mongodb

# Backup Redis
echo "🔴 Backing up Redis..."
docker-compose exec redis redis-cli BGSAVE
sleep 5
docker cp bondarys_redis_1:/data/dump.rdb $BACKUP_DIR/redis/

# Upload to S3
echo "📤 Uploading to S3..."
aws s3 sync $BACKUP_DIR s3://bondarys-backups/

# Clean up local backup
rm -rf $BACKUP_DIR

echo "✅ Backup completed!"
```

## 🔧 Maintenance

### 1. Log Rotation
```bash
# /etc/logrotate.d/bondarys
/var/log/bondarys/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose restart backend
    endscript
}
```

### 2. SSL Certificate Renewal
```bash
#!/bin/bash
# scripts/renew-ssl.sh

# Check certificate expiration
CERT_EXPIRY=$(aws acm describe-certificate --certificate-arn $CERT_ARN --query 'Certificate.NotAfter' --output text)
EXPIRY_DATE=$(date -d "$CERT_EXPIRY" +%s)
CURRENT_DATE=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "⚠️ SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
    # Request new certificate
    aws acm request-certificate --domain-name bondarys.com --subject-alternative-names www.bondarys.com
fi
```

### 3. Performance Monitoring
```bash
#!/bin/bash
# scripts/monitor-performance.sh

# Check response times
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" https://bondarys.com/health)

if (( $(echo "$RESPONSE_TIME > 2.0" | bc -l) )); then
    echo "⚠️ High response time: ${RESPONSE_TIME}s"
    # Send alert
    aws sns publish --topic-arn $ALERT_TOPIC_ARN --message "High response time detected: ${RESPONSE_TIME}s"
fi

# Check error rates
ERROR_RATE=$(curl -s https://bondarys.com/metrics | grep 'http_requests_total{status=~"5.."}' | awk '{print $2}')

if [ "$ERROR_RATE" -gt 10 ]; then
    echo "⚠️ High error rate: $ERROR_RATE"
    # Send alert
    aws sns publish --topic-arn $ALERT_TOPIC_ARN --message "High error rate detected: $ERROR_RATE"
fi
```

## 🆘 Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Restart services
docker-compose restart

# Scale services
docker-compose up -d --scale backend=3
```

#### Database Connection Issues
```bash
# Check database connectivity
docker-compose exec backend npm run db:test

# Check database logs
docker-compose logs mongodb

# Restart database
docker-compose restart mongodb
```

#### SSL Certificate Issues
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn $CERT_ARN

# Test SSL connection
openssl s_client -connect bondarys.com:443 -servername bondarys.com
```

### Emergency Procedures

#### Rollback Deployment
```bash
# Rollback to previous version
aws ecs update-service --cluster bondarys-cluster --service bondarys-backend-service --task-definition bondarys-backend:1
```

#### Emergency Maintenance Mode
```bash
# Enable maintenance mode
echo "MAINTENANCE_MODE=true" >> .env
docker-compose up -d nginx
```

## 📚 Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Docker Documentation](https://docs.docker.com/)
- [ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)

## 🆘 Support

For deployment support:

- **Email**: deployment-support@bondarys.com
- **Documentation**: https://docs.bondarys.com/deployment
- **GitHub Issues**: https://github.com/bondarys/bondarys/issues
- **AWS Support**: [AWS Support Center](https://aws.amazon.com/support/)

---

**Happy deploying! 🚀** 