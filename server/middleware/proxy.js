const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiting
const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per window
  'Too many requests from this IP, please try again later.'
);

// Login rate limiting (stricter)
const loginRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  'Too many login attempts, please try again later.'
);

// File upload rate limiting
const uploadRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads, please try again later.'
);

// WebSocket connection rate limiting
const wsRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 WebSocket connections per minute
  'Too many WebSocket connections, please try again later.'
);

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration for proxy
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
  
  // Log response when it finishes
  res.on('finish', () => {
    const statusCode = res.statusCode;
    const responseTime = Date.now() - req.startTime;
    console.log(`[${timestamp}] ${method} ${url} - ${statusCode} - ${responseTime}ms`);
  });
  
  req.startTime = Date.now();
  next();
};

// Error handling middleware for proxy
const proxyErrorHandler = (err, req, res, next) => {
  console.error('Proxy Error:', err);
  
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Backend service is not available'
    });
  }
  
  if (err.code === 'ETIMEDOUT') {
    return res.status(504).json({
      error: 'Gateway Timeout',
      message: 'Request timed out'
    });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Origin not allowed by CORS policy'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Health check middleware
const healthCheck = (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(health);
};

module.exports = {
  apiRateLimit,
  loginRateLimit,
  uploadRateLimit,
  wsRateLimit,
  securityHeaders,
  corsOptions,
  requestLogger,
  proxyErrorHandler,
  healthCheck
};
