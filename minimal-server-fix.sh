#!/bin/bash

echo "🔧 Creating Minimal Server with Working Routes Only..."

# Navigate to backend directory
cd /var/www/multibotplatform/Backend

# Create a minimal server.js that only includes working routes
cat > server.js << 'EOF'
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import http from 'http';
import { serviceLogger as logger } from './src/config/logger.js';
import User from './src/models/User.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration to allow server IP
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
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    
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
      version: '2.0.0'
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
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    logger.info('Registration attempt:', { email, name });
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

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
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info('Login attempt:', { email });
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
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
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
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

echo "✅ Minimal server.js created with working auth endpoints!"
echo "🚀 Restarting backend server..."

# Kill any existing backend process
pkill -f "node server.js" || true
sleep 2

# Start the backend server
npm start &
