// Enhanced server startup script with better error handling
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease create a .env file with the required variables.');
  process.exit(1);
}

// Test MongoDB connection
async function testMongoConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Start the server
async function startServer() {
  console.log('🚀 Starting CallSync Backend Server...\n');
  
  // Test MongoDB connection first
  const mongoConnected = await testMongoConnection();
  if (!mongoConnected) {
    console.error('❌ Cannot start server without MongoDB connection');
    process.exit(1);
  }

  // Import and start the main server
  try {
    const { default: app, server, io } = await import('./server.js');
    
    const PORT = process.env.PORT || 5000;
    const HOST = '0.0.0.0';
    
    server.listen(PORT, HOST, () => {
      console.log('\n🎉 Server started successfully!');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
      console.log(`🧪 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n✅ Ready to accept connections!');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
        console.error('   You can set a different port with: PORT=3001 npm start');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer().catch(console.error);
