import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import http from 'http';
import { networkInterfaces } from 'os';
import { serviceLogger as logger } from './src/config/logger.js';
import twilioRoutes from './src/routes/twilioRoutes.js';
import deepseekRoutes from './src/routes/deepseekRoutes.js';
import bertRoutes from './src/routes/bertRoutes.js';
import openaiRoutes from './src/routes/openaiRoutes.js';
import audioStorage from './src/routes/api/audioStorage.js';
import User from './src/models/User.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import botRoutes from './src/routes/api/bot.js';
import usersRoutes from './src/routes/users.js';
import { init as initSocket } from './src/config/socket.js';
import { generalLimiter, authLimiter, aiLimiter, voiceLimiter, speedLimiter } from './src/middleware/rateLimiter.js';
import { validateUserRegistration, validateUserLogin, sanitizeInput } from './src/middleware/validation.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting and input sanitization
app.use(generalLimiter);
app.use(speedLimiter);
app.use(sanitizeInput);

// Secure CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:19006',
  'http://localhost:19000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:19006',
  'http://127.0.0.1:19000'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) only in development
    if (!origin) {
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Origin required in production'));
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log blocked origins for security monitoring
    logger.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
}));

// MongoDB connection - using in-memory database for testing
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multibotplatform';

// Start server immediately, don't wait for MongoDB
const startServer = () => {
  const PORT = process.env.PORT || 5000;
  const currentIP = getLocalIP();

  server.listen(PORT, '0.0.0.0', () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      reactNativeUrl: `http://${currentIP}:${PORT}`,
      webUrl: `http://localhost:${PORT}`,
      testEndpoint: `http://${currentIP}:${PORT}/api/test`
    });
  });
};

// Try to connect to MongoDB, but don't block server start
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Connected to MongoDB successfully');
}).catch((err) => {
  logger.error('MongoDB connection error:', { error: err.message, stack: err.stack });
  // Continue without MongoDB for testing
  logger.warn('Continuing without MongoDB connection for testing purposes');
}).finally(() => {
  // Start server regardless of MongoDB connection status
  startServer();
});

// Initialize audio storage
audioStorage.initialize().catch((err) => {
  logger.error('Audio storage initialization failed:', { error: err.message });
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Please authenticate' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Test endpoints for React Native connection
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend connection successful!',
    timestamp: new Date().toISOString(),
    server: 'MERN Backend',
    status: 'Connected'
  });
});

// Test endpoint with authentication
app.get('/api/test-auth', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Authenticated connection successful!',
    user: req.user,
    timestamp: new Date().toISOString(),
    status: 'Authenticated'
  });
});

// Auth Routes with rate limiting and validation
app.post('/api/auth/login', authLimiter, validateUserLogin, async (req, res) => {
  try {
    logger.info('Login attempt', { email: req.body.email, ip: req.ip });
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed - user not found', { email, ip: req.ip });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login failed - password mismatch', { email, ip: req.ip });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    logger.info('Login successful', { userId: user._id, email, ip: req.ip });
    
    res.json({ 
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack, ip: req.ip });
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/register', authLimiter, validateUserRegistration, async (req, res) => {
  try {
    logger.info('Registration attempt', { email: req.body.email, ip: req.ip });
    
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    
    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Registration failed - email already exists', { email, ip: req.ip });
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    logger.info('Registration successful', { userId: user._id, email, ip: req.ip });
    
    res.status(201).json({ 
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      message: 'Registration successful'
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack, ip: req.ip });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Get user error', { error: error.message, stack: error.stack, userId: req.user?.userId });
    res.status(500).json({ error: error.message });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Routes with specific rate limiting
app.use('/api/twilio', voiceLimiter, twilioRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/bot', authenticateToken, aiLimiter, botRoutes);
app.use('/api/users', usersRoutes);
app.use('/deepseek', aiLimiter, deepseekRoutes);
app.use('/bert', aiLimiter, bertRoutes);
app.use('/openai', aiLimiter, openaiRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '2.0.0',
      services: {
        database: 'OK',
        memory: 'OK',
        disk: 'OK'
      }
    };

    // Check database connection
    try {
      await mongoose.connection.db.admin().ping();
      healthCheck.services.database = 'OK';
    } catch (error) {
      healthCheck.services.database = 'ERROR';
      healthCheck.status = 'DEGRADED';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    if (memUsageMB.heapUsed > 500) { // 500MB threshold
      healthCheck.services.memory = 'WARNING';
      healthCheck.memoryUsage = memUsageMB;
    } else {
      healthCheck.services.memory = 'OK';
      healthCheck.memoryUsage = memUsageMB;
    }

    // Check disk space (simplified)
    const fs = await import('fs');
    try {
      fs.accessSync('./logs', fs.constants.W_OK);
      healthCheck.services.disk = 'OK';
    } catch (error) {
      healthCheck.services.disk = 'WARNING';
    }

    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler', { 
    error: err.message, 
    stack: err.stack, 
    path: req.path, 
    method: req.method,
    ip: req.ip 
  });
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token or no token provided' 
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Get current IP address - Fixed for ES modules
function getLocalIP() {
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  // Return the first non-internal IPv4 address
  for (const name of Object.keys(results)) {
    if (results[name].length > 0) {
      return results[name][0];
    }
  }
  
  return 'localhost';
}

// Initialize Socket.io
const io = initSocket(server);

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