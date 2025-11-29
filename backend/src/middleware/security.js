const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

class SecurityMiddleware {
  constructor() {
    this.securityConfig = {
      cors: {
        origin: this.getCorsOrigins(),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'Accept',
          'Origin',
          'X-API-Key',
        ],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      },
      
      helmet: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "wss:", "ws:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
      },
      
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: {
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: '15 minutes',
        },
        standardHeaders: true,
        legacyHeaders: false,
      },
    };
  }

  // Get CORS origins based on environment
  getCorsOrigins() {
    const origins = process.env.CORS_ORIGINS?.split(',') || [];
    
    if (process.env.NODE_ENV === 'development') {
      origins.push(
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:8081'
      );
    }
    
    if (process.env.NODE_ENV === 'production') {
      origins.push(
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        process.env.MOBILE_APP_URL
      );
    }
    
    return origins.length > 0 ? origins : true;
  }

  // Apply all security middleware
  applySecurityMiddleware(app) {
    // Basic security headers
    app.use(helmet(this.securityConfig.helmet));
    
    // CORS configuration
    app.use(cors(this.securityConfig.cors));
    
    // Rate limiting
    app.use(rateLimit(this.securityConfig.rateLimit));
    
    // Data sanitization
    app.use(mongoSanitize());
    app.use(xss());
    
    // Parameter pollution protection
    app.use(hpp());
    
    // Additional security headers
    app.use(this.additionalSecurityHeaders);
    
    // Request validation
    app.use(this.validateRequest);
    
    // Security logging
    app.use(this.securityLogging);
    
    console.log('✅ Security middleware applied successfully');
  }

  // Additional security headers
  additionalSecurityHeaders(req, res, next) {
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    // Add custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Add custom headers for Bondarys
    res.setHeader('X-Bondarys-Version', process.env.APP_VERSION || '1.0.0');
    res.setHeader('X-Bondarys-Environment', process.env.NODE_ENV || 'development');
    
    next();
  }

  // Request validation
  validateRequest(req, res, next) {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS attempts
      /union\s+select/i, // SQL injection
      /eval\s*\(/i, // Code injection
      /javascript:/i, // JavaScript protocol
      /vbscript:/i, // VBScript protocol
      /onload\s*=/i, // Event handlers
      /onerror\s*=/i, // Event handlers
    ];

    const requestString = `${req.method} ${req.url} ${JSON.stringify(req.body)} ${JSON.stringify(req.query)}`;
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestString)) {
        console.warn('🚨 Suspicious request detected:', {
          ip: req.ip,
          method: req.method,
          url: req.url,
          pattern: pattern.source,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
        });
        
        return res.status(400).json({
          error: 'Invalid request detected',
          message: 'Request contains suspicious patterns',
        });
      }
    }

    // Validate content type for POST/PUT requests
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && 
        req.headers['content-type'] && 
        !req.headers['content-type'].includes('application/json') &&
        !req.headers['content-type'].includes('multipart/form-data')) {
      return res.status(400).json({
        error: 'Invalid content type',
        message: 'Only JSON and form data are allowed',
      });
    }

    next();
  }

  // Security logging
  securityLogging(req, res, next) {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Log security events
      if (res.statusCode >= 400) {
        console.warn('⚠️ Security event:', {
          ip: req.ip,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          duration,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Log suspicious activities
      if (this.isSuspiciousActivity(req)) {
        console.warn('🚨 Suspicious activity detected:', {
          ip: req.ip,
          method: req.method,
          url: req.url,
          userAgent: req.get('User-Agent'),
          headers: req.headers,
          timestamp: new Date().toISOString(),
        });
      }
    });
    
    next();
  }

  // Check for suspicious activity
  isSuspiciousActivity(req) {
    const suspiciousIndicators = [
      // High request frequency
      req.headers['x-forwarded-for']?.split(',').length > 5,
      
      // Suspicious user agents
      /bot|crawler|spider|scraper/i.test(req.get('User-Agent') || ''),
      
      // Missing or suspicious headers
      !req.get('User-Agent'),
      req.get('User-Agent')?.length > 500,
      
      // Suspicious query parameters
      Object.keys(req.query).length > 20,
      
      // Large request body
      req.headers['content-length'] && parseInt(req.headers['content-length']) > 1000000,
    ];
    
    return suspiciousIndicators.some(indicator => indicator);
  }

  // API key validation middleware
  validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'Please provide a valid API key',
      });
    }
    
    const validApiKeys = process.env.API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
      console.warn('🚨 Invalid API key attempt:', {
        ip: req.ip,
        apiKey: apiKey.substring(0, 8) + '...',
        url: req.url,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
      });
    }
    
    next();
  }

  // IP whitelist middleware
  ipWhitelist(allowedIPs) {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (!allowedIPs.includes(clientIP)) {
        console.warn('🚨 IP not in whitelist:', {
          ip: clientIP,
          url: req.url,
          timestamp: new Date().toISOString(),
        });
        
        return res.status(403).json({
          error: 'Access denied',
          message: 'Your IP address is not authorized',
        });
      }
      
      next();
    };
  }

  // Request size limiting
  limitRequestSize(maxSize = '10mb') {
    return (req, res, next) => {
      const contentLength = parseInt(req.headers['content-length'] || '0');
      const maxSizeBytes = this.parseSize(maxSize);
      
      if (contentLength > maxSizeBytes) {
        return res.status(413).json({
          error: 'Request too large',
          message: `Request size exceeds the limit of ${maxSize}`,
        });
      }
      
      next();
    };
  }

  // Parse size string to bytes
  parseSize(sizeStr) {
    const units = {
      'b': 1,
      'kb': 1024,
      'mb': 1024 * 1024,
      'gb': 1024 * 1024 * 1024,
    };
    
    const match = sizeStr.toLowerCase().match(/^(\d+)([kmg]?b)$/);
    if (!match) return 1024 * 1024; // Default 1MB
    
    const [, size, unit] = match;
    return parseInt(size) * (units[unit] || 1);
  }

  // File upload security
  validateFileUpload(req, res, next) {
    if (!req.file && !req.files) {
      return next();
    }
    
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'application/pdf',
      'text/plain',
    ];
    
    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'File type not allowed',
          allowedTypes: allowedMimeTypes,
        });
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          error: 'File too large',
          message: 'File size must be less than 10MB',
        });
      }
      
      // Check for malicious file extensions
      const maliciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs'];
      const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      
      if (maliciousExtensions.includes(fileExtension)) {
        console.warn('🚨 Malicious file upload attempt:', {
          ip: req.ip,
          filename: file.originalname,
          mimetype: file.mimetype,
          timestamp: new Date().toISOString(),
        });
        
        return res.status(400).json({
          error: 'File type not allowed',
          message: 'This file type is not permitted',
        });
      }
    }
    
    next();
  }

  // Session security
  secureSession(req, res, next) {
    // Regenerate session ID on login
    if (req.session && req.session.userId && req.session.regenerate) {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
        }
        next();
      });
    } else {
      next();
    }
  }

  // CSRF protection
  csrfProtection(req, res, next) {
    // Skip CSRF for API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({
        error: 'CSRF token missing or invalid',
        message: 'Please refresh the page and try again',
      });
    }
    
    next();
  }

  // Generate CSRF token
  generateCSRFToken(req, res, next) {
    if (!req.session) {
      return next();
    }
    
    const crypto = require('crypto');
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    res.locals.csrfToken = req.session.csrfToken;
    
    next();
  }

  // Security headers for specific routes
  secureHeaders(req, res, next) {
    // Add security headers for sensitive routes
    if (req.path.startsWith('/api/admin/') || req.path.startsWith('/api/auth/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  }

  // Error handling for security
  handleSecurityError(err, req, res, next) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid data provided',
        details: err.message,
      });
    }
    
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
    
    if (err.name === 'ForbiddenError') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }
    
    // Log security errors
    console.error('🚨 Security error:', {
      error: err.message,
      stack: err.stack,
      ip: req.ip,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong',
      });
    }
    
    next(err);
  }
}

module.exports = new SecurityMiddleware(); 