import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import middleware
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Import routes
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import familyRoutes from './routes/familyRoutes';
import locationRoutes from './routes/locationRoutes';
import socialRoutes from './routes/socialRoutes';
import storageRoutes from './routes/storageRoutes';
import popupRoutes from './routes/popupRoutes';

// Import services
import { initializeSentry } from './services/sentryService';
import { connectDatabase } from './services/databaseService';
import { connectRedis } from './services/redisService';
import { initializeSocket } from './services/socketService';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize services
initializeSentry();
connectDatabase();
connectRedis();
initializeSocket(io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(compression());
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  } 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Health check route (no auth required)
app.use('/api/health', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/hourse', authMiddleware, familyRoutes);
app.use('/api/location', authMiddleware, locationRoutes);
app.use('/api/social', authMiddleware, socialRoutes);
app.use('/api/storage', authMiddleware, storageRoutes);
app.use('/api/popups', popupRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`🚀 Bondarys API Server running on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  logger.info(`🗄️ Database: ${process.env.MONGODB_URL || 'mongodb://localhost:27017/bondarys'}`);
  logger.info(`📊 Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { app, io }; 