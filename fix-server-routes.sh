#!/bin/bash

echo "🔧 Fixing Server.js Route Import Issues..."

# Navigate to backend directory
cd /var/www/multibotplatform/Backend

# Create a backup of the current server.js
cp server.js server.js.backup2

# Create a corrected server.js that works with existing routes
cat > server.js << 'EOF'
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

// Updated CORS configuration to allow server IP
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:19006',
  'http://localhost:19000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:19006',
  'http://127.0.0.1:19000',
  'http://168.231.114.68:3000',
  'http://168.231.114.68',
  'http://168.231.114.68:80',
  'https://168.231.114.68:3000',
  'https://168.231.114.68',
  'https://168.231.114.68:80'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Routes - Fixed to use proper route handlers
app.use('/api/auth', twilioRoutes);
app.use('/api/deepseek', deepseekRoutes);
app.use('/api/bert', bertRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/audio', audioStorage);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: memUsageMB,
      database: 'connected',
      version: process.env.npm_package_version || '2.0.0'
    });
  } catch (error) {
    logger.error('Health check failed:', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// User registration endpoint
app.post('/auth/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    logger.info('Registration attempt:', { email, name });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Registration failed - user exists:', { email });
      return res.status(400).json({ 
        error: 'User already exists with this email' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    
    logger.info('User registered successfully:', { userId: user._id, email });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: user._id 
    });
  } catch (error) {
    logger.error('Registration error:', { error: error.message, email: req.body.email });
    res.status(500).json({ 
      error: 'An unexpected error occurred' 
    });
  }
});

// User login endpoint
app.post('/auth/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info('Login attempt:', { email });
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed - user not found:', { email });
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Login failed - invalid password:', { email });
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    logger.info('User logged in successfully:', { userId: user._id, email });
    
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Login error:', { error: error.message, email: req.body.email });
    res.status(500).json({ 
      error: 'An unexpected error occurred' 
    });
  }
});

// Get user profile endpoint
app.get('/auth/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get user error:', { error: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method 
  });
  
  res.status(500).json({ 
    error: 'An unexpected error occurred' 
  });
});

// Initialize Socket.IO
initSocket(server);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', { error: error.message });
    process.exit(1);
  }
};

// Initialize audio storage
try {
  await audioStorage.initialize();
} catch (error) {
  logger.error('Audio storage initialization failed:', { error: error.message });
}

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, '0.0.0.0', () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

startServer();
EOF

echo "✅ Server.js fixed with proper route handling!"
echo "🚀 Restarting backend server..."

# Kill any existing backend process
pkill -f "node server.js" || true
sleep 2

# Start the backend server
npm start &
