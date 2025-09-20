const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PROXY_PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Login rate limiting (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Backend API proxy
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // Keep /api prefix
  },
  onError: (err, req, res) => {
    console.error('API Proxy Error:', err);
    res.status(500).json({ error: 'Backend service unavailable' });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> Backend`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[${new Date().toISOString()}] Backend Response: ${proxyRes.statusCode} for ${req.url}`);
  }
});

// WebSocket proxy
const wsProxy = createProxyMiddleware({
  target: 'ws://localhost:5000',
  ws: true,
  changeOrigin: true,
  pathRewrite: {
    '^/ws': '/ws',
  },
  onError: (err, req, res) => {
    console.error('WebSocket Proxy Error:', err);
  }
});

// Apply login rate limiting to login endpoint
app.use('/api/users/login', loginLimiter);

// API routes
app.use('/api', apiProxy);

// WebSocket routes
app.use('/ws', wsProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    proxy: 'active'
  });
});

// Frontend proxy (for production)
const frontendProxy = createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Frontend Proxy Error:', err);
    res.status(500).send('Frontend service unavailable');
  }
});

// Serve frontend for all other routes
app.use('/', frontendProxy);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Proxy Server Error:', err);
  res.status(500).json({
    error: 'Internal proxy server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy Server running on port ${PORT}`);
  console.log(`📡 API Proxy: http://localhost:${PORT}/api -> http://localhost:5000/api`);
  console.log(`🔌 WebSocket Proxy: ws://localhost:${PORT}/ws -> ws://localhost:5000/ws`);
  console.log(`🌐 Frontend Proxy: http://localhost:${PORT} -> http://localhost:5173`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
