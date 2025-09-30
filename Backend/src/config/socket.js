import { Server as socketIO } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const init = (server) => {
  io = new socketIO(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:19006',
        'http://localhost:19000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:19006',
        'http://127.0.0.1:19000'
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.user.name} (${socket.id})`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join user to general analytics room
    socket.join('analytics');

    // Handle bot interaction events
    socket.on('bot_message', async (data) => {
      try {
        console.log('Bot message received:', data);
        
        // Broadcast to user's room
        socket.to(`user_${socket.userId}`).emit('bot_response', {
          message: data.message,
          timestamp: new Date().toISOString(),
          userId: socket.userId
        });
        
        // Update analytics
        io.to('analytics').emit('interaction_update', {
          type: 'bot_message',
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling bot message:', error);
        socket.emit('error', { message: 'Failed to process bot message' });
      }
    });

    // Handle call events
    socket.on('call_started', (data) => {
      console.log('Call started:', data);
      io.to('analytics').emit('call_update', {
        type: 'call_started',
        userId: socket.userId,
        timestamp: new Date().toISOString(),
        data
      });
    });

    socket.on('call_ended', (data) => {
      console.log('Call ended:', data);
      io.to('analytics').emit('call_update', {
        type: 'call_ended',
        userId: socket.userId,
        timestamp: new Date().toISOString(),
        data
      });
    });

    // Handle real-time analytics requests
    socket.on('request_analytics', () => {
      // Send current analytics data
      socket.emit('analytics_data', {
        activeUsers: io.engine.clientsCount,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`👋 User disconnected: ${socket.user.name} (${socket.id}) - ${reason}`);
      
      // Broadcast user disconnection
      io.to('analytics').emit('user_disconnected', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper function to broadcast to all users
export const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Helper function to broadcast to specific user
export const broadcastToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Helper function to broadcast to analytics room
export const broadcastToAnalytics = (event, data) => {
  if (io) {
    io.to('analytics').emit(event, data);
  }
};
