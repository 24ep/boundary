# Bondarys Technical Architecture

## 🏗️ System Overview

Bondarys follows a microservices architecture pattern with clear separation of concerns, ensuring scalability, maintainability, and high availability.

## 🔧 Backend Architecture

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Auth      │ │   Rate      │ │   CORS      │          │
│  │  Middleware │ │  Limiting   │ │  Middleware │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Microservices Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Auth      │ │   Family    │ │  Location   │          │
│  │  Service    │ │  Service    │ │  Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Social    │ │   Storage   │ │  Analytics  │          │
│  │  Service    │ │  Service    │ │  Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  MongoDB    │ │    Redis    │ │   AWS S3    │          │
│  │ (Primary)   │ │   (Cache)   │ │ (Files)     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Service Breakdown

#### 1. Authentication Service
```typescript
// auth-service/src/index.ts
interface AuthService {
  // SSO/SAML Authentication
  authenticateWithSSO(provider: string, token: string): Promise<AuthResult>;
  
  // JWT Management
  generateToken(userId: string, permissions: string[]): Promise<string>;
  validateToken(token: string): Promise<DecodedToken>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  
  // User Management
  createUser(userData: CreateUserRequest): Promise<User>;
  updateUser(userId: string, updates: UpdateUserRequest): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}
```

#### 2. Family Service
```typescript
// family-service/src/index.ts
interface FamilyService {
  // Family Management
  createFamily(adminId: string, familyData: CreateFamilyRequest): Promise<Family>;
  getFamily(familyId: string): Promise<Family>;
  updateFamily(familyId: string, updates: UpdateFamilyRequest): Promise<Family>;
  deleteFamily(familyId: string): Promise<void>;
  
  // Member Management
  addMember(familyId: string, memberData: AddMemberRequest): Promise<FamilyMember>;
  removeMember(familyId: string, userId: string): Promise<void>;
  updateMemberRole(familyId: string, userId: string, role: string): Promise<FamilyMember>;
  
  // Invitations
  sendInvitation(familyId: string, invitation: InvitationRequest): Promise<Invitation>;
  acceptInvitation(invitationId: string, userId: string): Promise<FamilyMember>;
  declineInvitation(invitationId: string, userId: string): Promise<void>;
}
```

#### 3. Location Service
```typescript
// location-service/src/index.ts
interface LocationService {
  // Location Tracking
  updateLocation(userId: string, location: LocationData): Promise<void>;
  getLocation(userId: string): Promise<LocationData>;
  getFamilyLocations(familyId: string): Promise<LocationData[]>;
  
  // Geofencing
  createGeofence(userId: string, geofence: GeofenceData): Promise<Geofence>;
  checkGeofenceStatus(userId: string, location: LocationData): Promise<GeofenceStatus>;
  
  // Emergency Features
  sendEmergencyAlert(userId: string, alertData: EmergencyAlert): Promise<void>;
  getEmergencyStatus(userId: string): Promise<EmergencyStatus>;
}
```

#### 4. Social Service
```typescript
// social-service/src/index.ts
interface SocialService {
  // Chat Management
  sendMessage(chatId: string, message: ChatMessage): Promise<ChatMessage>;
  getChatHistory(chatId: string, limit: number): Promise<ChatMessage[]>;
  createChat(participants: string[]): Promise<Chat>;
  
  // Video Calls
  createVideoCall(participants: string[]): Promise<VideoCall>;
  joinVideoCall(callId: string, userId: string): Promise<VideoCallSession>;
  
  // Neighborhood Features
  findNearbyFamilies(userId: string, radius: number): Promise<Family[]>;
  connectWithFamily(userId: string, targetFamilyId: string): Promise<Connection>;
}
```

#### 5. Storage Service
```typescript
// storage-service/src/index.ts
interface StorageService {
  // File Management
  uploadFile(userId: string, file: FileData): Promise<FileMetadata>;
  downloadFile(fileId: string): Promise<FileData>;
  deleteFile(fileId: string): Promise<void>;
  
  // Gallery Management
  uploadPhoto(userId: string, photo: PhotoData): Promise<PhotoMetadata>;
  createAlbum(userId: string, albumData: AlbumData): Promise<Album>;
  shareAlbum(albumId: string, shareWith: string[]): Promise<void>;
  
  // Family Storage
  getFamilyStorage(familyId: string): Promise<StorageUsage>;
  createFamilyFolder(familyId: string, folderData: FolderData): Promise<Folder>;
}
```

## 🗄️ Database Design

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  phone: String,
  firstName: String,
  lastName: String,
  avatar: String,
  dateOfBirth: Date,
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  preferences: {
    notifications: {
      push: Boolean,
      email: Boolean,
      sms: Boolean
    },
    privacy: {
      locationSharing: String, // 'family', 'friends', 'public'
      profileVisibility: String // 'family', 'friends', 'public'
    },
    theme: String,
    language: String
  },
  familyIds: [ObjectId],
  deviceTokens: [String],
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Families Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  avatar: String,
  adminId: ObjectId,
  members: [{
    userId: ObjectId,
    role: String, // 'admin', 'member', 'guest'
    joinedAt: Date,
    permissions: [String]
  }],
  settings: {
    locationSharing: Boolean,
    healthMonitoring: Boolean,
    emergencyAlerts: Boolean,
    inviteOnly: Boolean
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    placeLabel: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Locations Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  familyId: ObjectId,
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  placeLabel: String,
  address: String,
  timestamp: Date,
  isEmergency: Boolean,
  batteryLevel: Number,
  deviceType: String
}
```

#### HealthData Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  familyId: ObjectId,
  heartRate: Number,
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  steps: Number,
  sleepHours: Number,
  batteryLevel: Number,
  deviceType: String,
  deviceId: String,
  timestamp: Date,
  alerts: [{
    type: String,
    severity: String,
    message: String,
    timestamp: Date
  }]
}
```

#### Chats Collection
```javascript
{
  _id: ObjectId,
  type: String, // 'family', 'neighbor', 'community'
  participants: [ObjectId],
  familyId: ObjectId,
  lastMessage: {
    text: String,
    senderId: ObjectId,
    timestamp: Date
  },
  unreadCount: {
    [userId: String]: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Messages Collection
```javascript
{
  _id: ObjectId,
  chatId: ObjectId,
  senderId: ObjectId,
  type: String, // 'text', 'image', 'video', 'file', 'location'
  content: {
    text: String,
    mediaUrl: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  readBy: [ObjectId],
  timestamp: Date
}
```

### Redis Data Structures

#### Session Management
```redis
# User sessions
SET user:session:{userId} {sessionData} EX 86400

# Family member status
SET family:status:{familyId}:{userId} {statusData} EX 300

# Location cache
SET location:{userId} {locationData} EX 60
```

#### Real-time Data
```redis
# Online users
SADD online:users {userId}

# Family members online
SADD family:online:{familyId} {userId}

# Chat rooms
SADD chat:room:{chatId} {userId}
```

## 🔌 API Specifications

### REST API Endpoints

#### Authentication
```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
  deviceToken?: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// POST /api/auth/sso
interface SSORequest {
  provider: 'google' | 'facebook' | 'apple' | 'microsoft';
  token: string;
  deviceToken?: string;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

// POST /api/auth/logout
interface LogoutRequest {
  deviceToken?: string;
}
```

#### Family Management
```typescript
// GET /api/families
interface GetFamiliesResponse {
  families: Family[];
  total: number;
}

// POST /api/families
interface CreateFamilyRequest {
  name: string;
  description?: string;
  avatar?: string;
  settings?: FamilySettings;
}

// GET /api/families/:id
interface GetFamilyResponse {
  family: Family;
  members: FamilyMember[];
  recentActivity: Activity[];
}

// PUT /api/families/:id
interface UpdateFamilyRequest {
  name?: string;
  description?: string;
  avatar?: string;
  settings?: Partial<FamilySettings>;
}

// POST /api/families/:id/invite
interface InviteRequest {
  email: string;
  phone?: string;
  role: 'member' | 'guest';
  message?: string;
}
```

#### Location & Safety
```typescript
// POST /api/location
interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  placeLabel?: string;
  isEmergency?: boolean;
  batteryLevel?: number;
}

// GET /api/location/family/:familyId
interface GetFamilyLocationsResponse {
  locations: LocationData[];
  lastUpdated: Date;
}

// POST /api/emergency/alert
interface EmergencyAlertRequest {
  type: 'medical' | 'security' | 'accident';
  location?: {
    latitude: number;
    longitude: number;
  };
  message?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

#### Social Features
```typescript
// GET /api/neighbors
interface GetNeighborsRequest {
  radius: number;
  limit?: number;
  offset?: number;
}

interface GetNeighborsResponse {
  neighbors: Family[];
  total: number;
}

// POST /api/neighbors/connect
interface ConnectRequest {
  targetFamilyId: string;
  message?: string;
}

// GET /api/chat/:chatId/messages
interface GetMessagesRequest {
  limit?: number;
  before?: Date;
  after?: Date;
}

interface GetMessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

// POST /api/chat/:chatId/messages
interface SendMessageRequest {
  type: 'text' | 'image' | 'video' | 'file' | 'location';
  content: any;
}
```

### WebSocket Events

#### Client to Server
```typescript
// Location updates
socket.emit('location:update', {
  latitude: number;
  longitude: number;
  accuracy: number;
  placeLabel?: string;
  isEmergency?: boolean;
});

// Family member status
socket.emit('family:status', {
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
});

// Chat messages
socket.emit('chat:message', {
  chatId: string;
  type: string;
  content: any;
});

// Emergency alerts
socket.emit('emergency:alert', {
  type: string;
  location?: LocationData;
  message?: string;
  severity: string;
});
```

#### Server to Client
```typescript
// Location updates from family members
socket.on('family:location', (data: {
  userId: string;
  location: LocationData;
}) => {});

// Family member status changes
socket.on('family:status', (data: {
  userId: string;
  status: string;
  lastSeen: Date;
}) => {});

// New chat messages
socket.on('chat:message', (data: {
  chatId: string;
  message: ChatMessage;
}) => {});

// Emergency alerts
socket.on('emergency:alert', (data: {
  userId: string;
  alert: EmergencyAlert;
}) => {});

// Health alerts
socket.on('health:alert', (data: {
  userId: string;
  alert: HealthAlert;
}) => {});
```

## 🚀 Infrastructure Setup

### Docker Configuration

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  # API Gateway
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - MONGODB_URL=mongodb://mongodb:27017/bondarys
    depends_on:
      - redis
      - mongodb

  # Authentication Service
  auth-service:
    build: ./auth-service
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - MONGODB_URL=mongodb://mongodb:27017/bondarys
      - JWT_SECRET=${JWT_SECRET}
      - AUTH0_DOMAIN=${AUTH0_DOMAIN}
    depends_on:
      - redis
      - mongodb

  # Family Service
  family-service:
    build: ./family-service
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - MONGODB_URL=mongodb://mongodb:27017/bondarys
    depends_on:
      - redis
      - mongodb

  # Location Service
  location-service:
    build: ./location-service
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - MONGODB_URL=mongodb://mongodb:27017/bondarys
    depends_on:
      - redis
      - mongodb

  # Social Service
  social-service:
    build: ./social-service
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - MONGODB_URL=mongodb://mongodb:27017/bondarys
    depends_on:
      - redis
      - mongodb

  # Storage Service
  storage-service:
    build: ./storage-service
    environment:
      - NODE_ENV=production
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_BUCKET=${AWS_S3_BUCKET}
    depends_on:
      - redis

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # MongoDB
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db

volumes:
  redis_data:
  mongodb_data:
```

### AWS Infrastructure

#### CloudFormation Template
```yaml
# infrastructure/cloudformation/main.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Bondarys Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-bondarys-vpc'

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub '${Environment}-bondarys-cluster'
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT
      DefaultCapacityProviderStrategy:
        - CapacityProvider: FARGATE
          Weight: 1

  # RDS Database
  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub '${Environment}-bondarys-db'
      DBInstanceClass: db.t3.micro
      Engine: mongodb
      MasterUsername: !Ref DBUsername
      MasterUserPassword: !Ref DBPassword
      AllocatedStorage: 20
      StorageType: gp2
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup

  # ElastiCache Redis
  RedisCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      CacheClusterId: !Sub '${Environment}-bondarys-redis'
      Engine: redis
      CacheNodeType: cache.t3.micro
      NumCacheNodes: 1
      VpcSecurityGroupIds:
        - !Ref RedisSecurityGroup
      SubnetGroupName: !Ref RedisSubnetGroup

  # S3 Bucket
  StorageBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${Environment}-bondarys-storage'
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  # CloudFront Distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: !GetAtt StorageBucket.RegionalDomainName
            Id: S3Origin
            S3OriginConfig:
              OriginAccessIdentity: !Ref CloudFrontOriginAccessIdentity
        Enabled: true
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
          CachedMethods:
            - GET
            - HEAD
```

## 🔒 Security Implementation

### Authentication Flow
```typescript
// auth-service/src/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      permissions: payload.permissions,
    };
  }
}
```

### Rate Limiting
```typescript
// api-gateway/src/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Data Encryption
```typescript
// shared/utils/encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private saltLength = 64;
  private tagLength = 16;

  encrypt(text: string, key: string): string {
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);
    
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, this.keyLength, 'sha512');
    const cipher = crypto.createCipher(this.algorithm, derivedKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return salt.toString('hex') + ':' + iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData: string, key: string): string {
    const parts = encryptedData.split(':');
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];
    
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, this.keyLength, 'sha512');
    const decipher = crypto.createDecipher(this.algorithm, derivedKey);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 📊 Monitoring & Logging

### Application Monitoring
```typescript
// shared/monitoring/sentry.ts
import * as Sentry from '@sentry/node';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });
};
```

### Health Checks
```typescript
// shared/health/health-check.ts
export class HealthCheckService {
  async checkDatabase(): Promise<HealthStatus> {
    try {
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', message: 'Database connection OK' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Database connection failed' };
    }
  }

  async checkRedis(): Promise<HealthStatus> {
    try {
      await redis.ping();
      return { status: 'healthy', message: 'Redis connection OK' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Redis connection failed' };
    }
  }

  async checkExternalServices(): Promise<HealthStatus[]> {
    const checks = [
      this.checkDatabase(),
      this.checkRedis(),
      // Add more external service checks
    ];
    
    return Promise.all(checks);
  }
}
```

This technical architecture provides a solid foundation for building a scalable, secure, and maintainable family management application. The microservices approach allows for independent development and deployment of different features, while the comprehensive monitoring and security measures ensure the application remains reliable and safe for family use. 